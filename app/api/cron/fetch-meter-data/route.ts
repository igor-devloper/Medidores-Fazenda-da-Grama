/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🚀 Iniciando coleta de dados via API Route...")

    // Log de headers para debug
    const userAgent = request.headers.get("user-agent") || ""
    const authHeader = request.headers.get("authorization")

    console.log(`📡 User-Agent: ${userAgent}`)
    console.log(`🔐 Auth Header: ${authHeader ? "Present" : "Missing"}`)

    // Verificar autorização
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.log("⚠️ CRON_SECRET não está configurado")
      return NextResponse.json(
        {
          error: "CRON_SECRET não configurado",
          message: "Configure a variável de ambiente CRON_SECRET",
        },
        { status: 500 },
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Tentativa de acesso não autorizado")
      console.log(`Expected: Bearer ${cronSecret.substring(0, 5)}...`)
      console.log(`Received: ${authHeader}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar origem da requisição
    const isFromGitHub = userAgent.includes("GitHub-Actions") || userAgent.includes("curl")
    console.log(`📍 Origem: ${isFromGitHub ? "GitHub Actions" : "Manual"}`)

    try {
      // Importar e executar a coleta de dados
      const { coletarDadosDeStatus } = await import("@/lib/coleta-dados")
      const resultado = await coletarDadosDeStatus()

      const executionTime = Date.now() - startTime

      console.log(`✅ Coleta finalizada em ${executionTime}ms`)

      return NextResponse.json({
        success: true,
        message: "Coleta de dados executada com sucesso",
        timestamp: new Date().toISOString(),
        source: isFromGitHub ? "github-actions" : "manual",
        executionTime: `${executionTime}ms`,
        resultado,
      })
    } catch (coletaError: any) {
      console.error("❌ Erro na coleta de dados:", coletaError)

      const executionTime = Date.now() - startTime

      return NextResponse.json(
        {
          success: false,
          error: "Erro na coleta de dados",
          details: coletaError.message,
          timestamp: new Date().toISOString(),
          executionTime: `${executionTime}ms`,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    const executionTime = Date.now() - startTime
    console.error("❌ Erro na API Route:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
      },
      { status: 500 },
    )
  }
}
