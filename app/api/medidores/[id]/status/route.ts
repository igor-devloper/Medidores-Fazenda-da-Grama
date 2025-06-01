/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const medidorId = Number.parseInt(id)

    if (isNaN(medidorId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar o medidor no banco
    const medidor = await prisma.medidor.findUnique({
      where: { id: medidorId },
    })

    if (!medidor) {
      return NextResponse.json({ error: "Medidor não encontrado" }, { status: 404 })
    }

    if (!medidor.tuyaDeviceId) {
      return NextResponse.json({ error: "Medidor não possui tuyaDeviceId configurado" }, { status: 400 })
    }

    try {
      // Importar dinamicamente para evitar problemas no build
      const { setTuyaUid, getDeviceStatus } = await import("@/lib/tuya-api")

      // Configurar o UID da conta Tuya
      setTuyaUid("az1742355872329ya07v")

      // Buscar status atual do dispositivo Tuya
      const status = await getDeviceStatus(medidor.tuyaDeviceId)

      // Processar e formatar os dados
      const dadosProcessados = {
        medidorId: medidor.id,
        nome: medidor.nome,
        online: false,
        energiaTotal: 0,
        energiaReversa: 0,
        frequencia: 0,
        dadosBrutos: status,
        timestamp: new Date().toISOString(),
      }

      // Processar cada status retornado
      for (const s of status) {
        switch (s.code) {
          case "forward_energy_total":
            const energiaTotal = typeof s.value === "number" ? s.value : Number.parseFloat(s.value)
            if (!isNaN(energiaTotal)) {
              dadosProcessados.energiaTotal = energiaTotal / 100 // Aplicar scale
            }
            break

          case "reverse_energy_total":
            const energiaReversa = typeof s.value === "number" ? s.value : Number.parseFloat(s.value)
            if (!isNaN(energiaReversa)) {
              dadosProcessados.energiaReversa = energiaReversa / 100 // Aplicar scale
            }
            break

          case "online_state":
            dadosProcessados.online = s.value === "online"
            break

          case "frequency":
            const frequencia = typeof s.value === "number" ? s.value : Number.parseFloat(s.value)
            if (!isNaN(frequencia)) {
              dadosProcessados.frequencia = frequencia / 100 // Aplicar scale se necessário
            }
            break
        }
      }

      return NextResponse.json(dadosProcessados)
    } catch (tuyaError: any) {
      console.error("Erro ao consultar API Tuya:", tuyaError)
      return NextResponse.json(
        {
          error: "Erro ao consultar dispositivo Tuya",
          details: tuyaError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Erro ao buscar status do medidor:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
