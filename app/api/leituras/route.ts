/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idVirtual, valor, tipo = "power", unidade = "W" } = body

    const medidor = await prisma.medidor.findUnique({
      where: {
        idVirtual,
      },
    })

    if (!medidor) {
      return NextResponse.json({ error: "Medidor não encontrado" }, { status: 404 })
    }

    const leitura = await prisma.leitura.create({
      data: {
        valor: Number.parseFloat(valor),
        tipo,
        unidade,
        medidorId: medidor.id,
      },
    })

    await prisma.medidor.update({
      where: {
        id: medidor.id,
      },
      data: {
        ultimaLeitura: new Date(),
      },
    })

    return NextResponse.json(leitura, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao registrar leitura:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const medidorId = searchParams.get("medidorId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const where = medidorId ? { medidorId: Number.parseInt(medidorId) } : {}

    const leituras = await prisma.leitura.findMany({
      where,
      include: {
        medidor: {
          select: {
            id: true,
            nome: true,
            idVirtual: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    })

    return NextResponse.json(leituras)
  } catch (error: any) {
    console.error("Erro ao buscar leituras:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
