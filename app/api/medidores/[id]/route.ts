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

    const medidor = await prisma.medidor.findUnique({
      where: { id: medidorId },
      include: {
        leituras: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    })

    if (!medidor) {
      return NextResponse.json({ error: "Medidor não encontrado" }, { status: 404 })
    }

    return NextResponse.json(medidor)
  } catch (error) {
    console.error("Erro ao buscar medidor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const medidorId = Number.parseInt(id)

    if (isNaN(medidorId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    const medidor = await prisma.medidor.update({
      where: { id: medidorId },
      data: {
        nome: body.nome,
        localizacao: body.localizacao,
        ativo: body.ativo,
        tuyaDeviceId: body.tuyaDeviceId,
      },
    })

    return NextResponse.json(medidor)
  } catch (error) {
    console.error("Erro ao atualizar medidor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const medidorId = Number.parseInt(id)

    if (isNaN(medidorId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Primeiro deletar todas as leituras relacionadas
    await prisma.leitura.deleteMany({
      where: { medidorId: medidorId },
    })

    // Depois deletar o medidor
    await prisma.medidor.delete({
      where: { id: medidorId },
    })

    return NextResponse.json({ message: "Medidor deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar medidor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
