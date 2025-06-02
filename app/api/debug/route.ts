/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Coletar informações do ambiente para diagnóstico
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      hasDatabase: !!process.env.DATABASE_URL,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasVercelUrl: !!process.env.VERCEL_URL,
      hasVercelAppUrl: !!process.env.VERCEL_APP_URL,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: request.headers.get("user-agent"),
      authorization: request.headers.get("authorization") ? "Present" : "Missing",
    }

    // Testar conexão com banco de dados
    let dbStatus = "unknown"
    try {
      const { prisma } = await import("@/lib/prisma")
      await prisma.$queryRaw`SELECT 1`
      dbStatus = "connected"
    } catch (dbError: any) {
      dbStatus = `error: ${dbError.message}`
    }

    return NextResponse.json({
      status: "ok",
      message: "Sistema funcionando normalmente",
      environment: envInfo,
      database: dbStatus,
      endpoints: {
        manual_fetch: "/api/manual-fetch",
        cron_fetch: "/api/cron/fetch-meter-data",
        debug: "/api/debug",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
