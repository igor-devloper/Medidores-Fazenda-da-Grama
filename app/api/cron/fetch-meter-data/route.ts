/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { coletarDadosDeStatus } from "@/lib/coleta-dados"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🚀 Iniciando coleta de dados via API Route...")

    // Verificar se a requisição vem do GitHub Actions ou tem a chave de autorização
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Tentativa de acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar origem da requisição
    const userAgent = request.headers.get("user-agent") || ""
    const isFromGitHub = userAgent.includes("GitHub-Actions") || userAgent.includes("curl")

    console.log(`📡 Origem: ${isFromGitHub ? "GitHub Actions" : "Manual"} - User-Agent: ${userAgent}`)

    // Executar a coleta de dados
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
  } catch (error: any) {
    const executionTime = Date.now() - startTime
    console.error("❌ Erro na API Route:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
