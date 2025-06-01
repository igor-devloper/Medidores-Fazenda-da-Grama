import { NextResponse } from "next/server"
import { getAllDevices } from "@/lib/tuya-api"

export async function GET() {
  try {
    const devices = await getAllDevices()

    // Filtrar apenas os medidores da Fazenda da Grama
    const fazendaDevices = devices.filter(
      (device) =>
        device.name.toLowerCase().includes("faz da grama") ||
        device.name.toLowerCase().includes("fazenda") ||
        device.product_name.includes("SDM01") ||
        device.product_name.includes("PC473"),
    )

    // Mapear para formato mais amigável
    const mappedDevices = fazendaDevices.map((device) => ({
      id: device.id,
      name: device.name,
      product_name: device.product_name,
      category: device.category,
      online: device.online,
      ip: device.ip || "N/A",
      uuid: device.uuid,
      time_zone: device.time_zone,
    }))

    return NextResponse.json(mappedDevices)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erro ao buscar dispositivos Tuya:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
