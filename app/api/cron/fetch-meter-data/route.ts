/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setTuyaUid, getDeviceStatus, getDeviceLogs } from "@/lib/tuya-api";

const DEVICE_IDS = {
  SDM01: ["ebc2ff99c2c22255d002kq"],
  PC473: [
    "ebb823ca0d34e88fe80ipu",
    "eb9e149677d67b21abn1ed",
    "eb31ded5d1d7c58ffa0enk",
  ],
};

function identificarModeloPorDeviceId(tuyaDeviceId: string): "SDM01_WiFi+485_V1" | "PC473" | "desconhecido" {
  if (DEVICE_IDS.SDM01.includes(tuyaDeviceId)) return "SDM01_WiFi+485_V1";
  if (DEVICE_IDS.PC473.includes(tuyaDeviceId)) return "PC473";
  return "desconhecido";
}

type MapaCode = {
  tipo: string;
  unidade: string;
  modelos: string[];
  scale?: number;
};

const MAPA_CODES: Record<string, MapaCode> = {
  forward_energy_total: {
    tipo: "energy_total",
    unidade: "kWh",
    modelos: ["SDM01_WiFi+485_V1"],
    scale: 2,
  },
  relay_status: {
    tipo: "relay",
    unidade: "",
    modelos: ["PC473"],
  },
  fault: {
    tipo: "fault",
    unidade: "json",
    modelos: ["PC473"],
  },
  switch_1: {
    tipo: "relay_switch",
    unidade: "boolean",
    modelos: ["PC473"],
  },
};

async function obterEnergiaViaLogs(deviceId: string) {
  const fim = Date.now();
  const inicio = fim - 60 * 60 * 1000;
  const dpId = "energy_consumed_a"; // Troque conforme seu DP real

  const logs = await getDeviceLogs(deviceId, dpId, inicio, fim);
  if (!logs.length) return null;

  const ultimo = logs.at(-1)!;
  const valor = parseFloat(ultimo.value) / 100;
  return { valor, timestamp: new Date(ultimo.event_time) };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medidores = await prisma.medidor.findMany({ where: { ativo: true } });
    setTuyaUid("az1742355872329ya07v");

    for (const medidor of medidores) {
      if (!medidor.tuyaDeviceId) continue;
      const modelo = identificarModeloPorDeviceId(medidor.tuyaDeviceId);

      if (modelo === "PC473") {
        const leitura = await obterEnergiaViaLogs(medidor.tuyaDeviceId);
        if (leitura) {
          await prisma.leitura.create({
            data: {
              valor: leitura.valor,
              tipo: "energy_total",
              unidade: "kWh",
              timestamp: leitura.timestamp,
              medidorId: medidor.id,
            },
          });
          console.log(`✅ [${medidor.nome}] via logs: ${leitura.valor} kWh`);
        } else {
          console.log(`⚠️ Nenhuma leitura via logs para ${medidor.nome}`);
        }
        continue;
      }

      // SDM01 - via status
      const status = await getDeviceStatus(medidor.tuyaDeviceId);
      const timestamp = new Date();
      timestamp.setMinutes(0, 0, 0);

      for (const s of status) {
        const leituraMapeada = Object.entries(MAPA_CODES).find(
          ([code, conf]) => code === s.code && conf.modelos.includes(modelo)
        )?.[1];

        if (!leituraMapeada) continue;

        let valor = typeof s.value === "number" ? s.value : parseFloat(s.value);
        if (leituraMapeada.scale) valor = valor / Math.pow(10, leituraMapeada.scale);

        await prisma.leitura.create({
          data: {
            valor,
            tipo: leituraMapeada.tipo,
            unidade: leituraMapeada.unidade,
            timestamp,
            medidorId: medidor.id,
          },
        });

        console.log(`✅ [${medidor.nome}] ${s.code}: ${valor}`);
      }

      await prisma.medidor.update({
        where: { id: medidor.id },
        data: { ultimaLeitura: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Leituras coletadas com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na rota de coleta:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
