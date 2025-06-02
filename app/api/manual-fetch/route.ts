/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando coleta manual de dados...")

    // Verificar autorização (opcional para coleta manual)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Tentativa de acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Chamar a API de coleta de dados diretamente
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.VERCEL_APP_URL || "http://localhost:3000"

      console.log(`📡 Chamando API: ${baseUrl}/api/cron/fetch-meter-data`)

      const response = await fetch(`${baseUrl}/api/cron/fetch-meter-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
          // Adicionar User-Agent para evitar problemas de CORS
          "User-Agent": "ManualFetchScript/1.0",
        },
        // Importante: não redirecionar automaticamente
        redirect: "manual",
      })

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Se não for JSON, tratar como texto
        const textResponse = await response.text()
        console.error("Resposta não-JSON recebida:", textResponse.substring(0, 500))
        throw new Error(`API respondeu com formato inválido: ${response.status}`)
      }

      const result = await response.json()

      console.log("✅ Coleta manual executada com sucesso")
      return NextResponse.json({
        success: true,
        message: "Coleta manual executada com sucesso",
        result,
      })
    } catch (fetchError: any) {
      console.error("❌ Erro ao chamar API de coleta:", fetchError)

      // Tentar executar diretamente como fallback
      console.log("🔄 Tentando executar coleta diretamente...")

      try {
        // Importar e executar a função de coleta diretamente
        const { coletarDadosDeStatus } = await import("@/lib/coleta-dados")

        // Executar a coleta diretamente
        await coletarDadosDeStatus()

        return NextResponse.json({
          success: true,
          message: "Coleta manual executada diretamente com sucesso",
        })
      } catch (directError: any) {
        console.error("❌ Erro na execução direta:", directError)
        throw directError
      }
    }
  } catch (error: any) {
    console.error("❌ Erro na coleta manual:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
