/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const medidor = await prisma.medidor.findUnique({
      where: {
        id: Number.parseInt(params.id),
      },
      include: {
        leituras: {
          orderBy: {
            timestamp: "desc",
          },
          take: 20,
        },
      },
    })

    if (!medidor) {
      return NextResponse.json({ error: "Medidor não encontrado" }, { status: 404 })
    }

    return NextResponse.json(medidor)
  } catch (error: any) {
    console.error("Erro ao buscar medidor:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { nome, localizacao, ativo, tuyaDeviceId } = body

    const medidor = await prisma.medidor.update({
      where: {
        id: Number.parseInt(params.id),
      },
      data: {
        nome,
        localizacao,
        ativo,
        tuyaDeviceId,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(medidor)
  } catch (error: any) {
    console.error("Erro ao atualizar medidor:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.medidor.delete({
      where: {
        id: Number.parseInt(params.id),
      },
    })

    return NextResponse.json({ message: "Medidor excluído com sucesso" })
  } catch (error: any) {
    console.error("Erro ao excluir medidor:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
