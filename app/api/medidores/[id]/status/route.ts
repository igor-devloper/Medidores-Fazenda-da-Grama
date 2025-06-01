/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getDeviceIdFromVirtualId, getDeviceStatus } from "@/lib/tuya-api"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const medidor = await prisma.medidor.findUnique({
      where: {
        id: Number.parseInt(params.id),
      },
    })

    if (!medidor) {
      return NextResponse.json({ error: "Medidor não encontrado" }, { status: 404 })
    }

    let deviceId = medidor.tuyaDeviceId

    if (!deviceId) {
      deviceId = await getDeviceIdFromVirtualId(medidor.idVirtual)
      if (!deviceId) {
        return NextResponse.json({ error: "ID do dispositivo Tuya não encontrado" }, { status: 404 })
      }
    }

    const statusData = await getDeviceStatus(deviceId)

    return NextResponse.json({
      id: medidor.id,
      idVirtual: medidor.idVirtual,
      nome: medidor.nome,
      status: statusData,
      online: true,
      lastUpdate: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao obter status do medidor:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao obter status do medidor",
        online: false,
      },
      { status: 500 },
    )
  }
}
