/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { coletarDadosDeStatus } from "@/lib/coleta-dados"

const MAPA_CODES = {
  // Energia total consumida (acumulada)
  forward_energy_total: { tipo: "energy_total", unidade: "kWh", scale: 2 } as const,

  // Energia reversa/injetada (se disponível)
  reverse_energy_total: { tipo: "energy_reverse", unidade: "kWh", scale: 2 } as const,

  // Estado online/offline para monitoramento
  online_state: { tipo: "online_status", unidade: "status" } as const,
} as const

// Função para calcular e salvar consumo
async function calcularESalvarConsumo(medidorId: number, valorAtual: number, timestamp: Date, medidor: any) {
  try {
    // Buscar a leitura anterior de energy_total
    const leituraAnterior = await prisma.leitura.findFirst({
      where: {
        medidorId: medidorId,
        tipo: "energy_total",
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    if (leituraAnterior) {
      const consumo = valorAtual - leituraAnterior.valor

      // Só registrar consumo se for positivo (evitar valores negativos por reset do medidor)
      if (consumo > 0) {
        // Verificar se já existe uma leitura de consumo para este timestamp
        const consumoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidorId,
            tipo: "consumo",
            timestamp: timestamp,
          },
        })

        if (!consumoExistente) {
          await prisma.leitura.create({
            data: {
              valor: consumo,
              tipo: "consumo",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidorId,
            },
          })

          console.log(
            `📊 Consumo calculado e salvo: ${consumo.toFixed(4)} kWh (${valorAtual} - ${leituraAnterior.valor})`,
          )
          return consumo
        } else {
          console.log(`⏭️ Consumo já existe para este período: ${medidor.nome}`)
        }
      } else if (consumo < 0) {
        console.log(`⚠️ Consumo negativo detectado (possível reset do medidor): ${consumo.toFixed(4)} kWh`)
      }
    } else {
      console.log(`ℹ️ Primeira leitura do medidor - consumo não calculado`)
    }

    return 0
  } catch (error) {
    console.error("Erro ao calcular consumo:", error)
    return 0
  }
}

// Função para calcular energia injetada
async function calcularEnergiaInjetada(medidorId: number, valorAtual: number, timestamp: Date, medidor: any) {
  try {
    // Buscar a leitura anterior de energy_reverse
    const leituraAnterior = await prisma.leitura.findFirst({
      where: {
        medidorId: medidorId,
        tipo: "energy_reverse",
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    if (leituraAnterior) {
      const injecao = valorAtual - leituraAnterior.valor

      if (injecao > 0) {
        // Verificar se já existe uma leitura de injeção para este timestamp
        const injecaoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidorId,
            tipo: "energy_injected",
            timestamp: timestamp,
          },
        })

        if (!injecaoExistente) {
          await prisma.leitura.create({
            data: {
              valor: injecao,
              tipo: "energy_injected",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidorId,
            },
          })

          console.log(`🔋 Energia injetada calculada: ${injecao.toFixed(4)} kWh`)
          return injecao
        }
      }
    }

    return 0
  } catch (error) {
    console.error("Erro ao calcular energia injetada:", error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar se a requisição vem do GitHub Actions ou tem a chave de autorização
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar origem da requisição
    const userAgent = request.headers.get("user-agent") || ""
    const isFromGitHub = userAgent.includes("curl") || request.headers.get("x-github-actions")

    console.log(`🚀 Iniciando coleta de dados via ${isFromGitHub ? "GitHub Actions" : "API Route"}...`)

    const resultado = await coletarDadosDeStatus()

    return NextResponse.json({
      success: true,
      message: "Coleta de dados executada com sucesso",
      timestamp: new Date().toISOString(),
      source: isFromGitHub ? "github-actions" : "manual",
      resultado,
    })
  } catch (error: any) {
    console.error("❌ Erro na API Route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
