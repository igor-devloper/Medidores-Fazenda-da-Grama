/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idVirtual, ip, enderecoMAC, fusoHorario, forcaSinal, nome, localizacao, tuyaDeviceId } = body

    const medidor = await prisma.medidor.create({
      data: {
        idVirtual,
        ip,
        enderecoMAC,
        fusoHorario: fusoHorario || "America/Sao_Paulo",
        forcaSinal,
        nome,
        localizacao,
        tuyaDeviceId,
      },
    })

    return NextResponse.json(medidor, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar medidor:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const medidores = await prisma.medidor.findMany({
      include: {
        leituras: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            leituras: true,
          },
        },
      },
    })

    return NextResponse.json(medidores)
  } catch (error: any) {
    console.error("Erro ao buscar medidores:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
