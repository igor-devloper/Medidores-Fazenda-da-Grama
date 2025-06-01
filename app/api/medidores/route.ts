import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const medidores = await prisma.medidor.findMany({
      include: {
        leituras: {
          orderBy: { timestamp: "desc" },
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
  } catch (error) {
    console.error("Erro ao buscar medidores:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const medidor = await prisma.medidor.create({
      data: {
        nome: body.nome,
        idVirtual: body.idVirtual,
        enderecoMAC: body.enderecoMAC,
        ip: body.ip,
        localizacao: body.localizacao,
        fusoHorario: body.fusoHorario || "America/Sao_Paulo",
        forcaSinal: body.forcaSinal,
        tuyaDeviceId: body.tuyaDeviceId,
        ativo: body.ativo ?? true,
        ultimaLeitura: new Date(),
      },
    })

    return NextResponse.json(medidor, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar medidor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
