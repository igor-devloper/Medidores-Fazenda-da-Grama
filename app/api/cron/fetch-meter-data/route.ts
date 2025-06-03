/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mapeamento manual de deviceId → modelo
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

const MAPA_CODES: {
  [code: string]: {
    tipo: string;
    unidade: string;
    scale?: number;
    modelos: string[];
  };
} = {
  forward_energy_total: {
    tipo: "energy_total",
    unidade: "kWh",
    scale: 2,
    modelos: ["SDM01_WiFi+485_V1"],
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

async function calcularESalvarConsumo(
  medidorId: number,
  valorAtual: number,
  timestamp: Date,
  medidor: any
) {
  try {
    const leituraAnterior = await prisma.leitura.findFirst({
      where: {
        medidorId,
        tipo: "energy_total",
        timestamp: { lt: timestamp },
      },
      orderBy: { timestamp: "desc" },
    });

    if (leituraAnterior) {
      const consumo = valorAtual - leituraAnterior.valor;

      if (consumo > 0) {
        const consumoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId,
            tipo: "consumo",
            timestamp,
          },
        });

        if (!consumoExistente) {
          await prisma.leitura.create({
            data: {
              valor: consumo,
              tipo: "consumo",
              unidade: "kWh",
              timestamp,
              medidorId,
            },
          });
          console.log(`📊 Consumo calculado e salvo: ${consumo.toFixed(4)} kWh`);
        } else {
          console.log(`⏭️ Consumo já existente para ${medidor.nome}`);
        }
      } else if (consumo < 0) {
        console.warn(`⚠️ Consumo negativo (reset possível): ${consumo.toFixed(4)} kWh`);
      }
    } else {
      console.log("ℹ️ Primeira leitura registrada - sem cálculo de consumo");
    }

    revalidatePath("/medidores/3");
    revalidatePath("/");
    return 0;
  } catch (error) {
    console.error("Erro ao calcular consumo:", error);
    return 0;
  }
}

async function coletarDadosDeStatus() {
  console.log("⚡ Coletando dados dos medidores...");

  const { setTuyaUid, getDeviceStatus } = await import("@/lib/tuya-api");
  setTuyaUid("az1742355872329ya07v");

  const medidores = await prisma.medidor.findMany({
    where: { ativo: true },
  });

  if (medidores.length === 0) {
    console.log("ℹ️ Nenhum medidor ativo encontrado.");
    return;
  }

  for (const medidor of medidores) {
    if (!medidor.tuyaDeviceId) {
      console.warn(`⚠️ Medidor ${medidor.nome} não tem tuyaDeviceId.`);
      continue;
    }

    try {
      console.log(`🔎 Consultando Tuya: ${medidor.nome} — ID: ${medidor.tuyaDeviceId}`);
      const status = await getDeviceStatus(medidor.tuyaDeviceId);

      const timestamp = new Date();
      timestamp.setMinutes(0, 0, 0);

      const modelo = identificarModeloPorDeviceId(medidor.tuyaDeviceId);

      for (const s of status) {
        const leituraMapeada = Object.entries(MAPA_CODES).find(
          ([code, conf]) =>
            code === s.code && conf.modelos.includes(modelo)
        )?.[1];

        if (!leituraMapeada) continue;

        console.log(`📊 ${s.code} = ${JSON.stringify(s.value)}`);

        switch (s.code) {
          case "forward_energy_total": {
            let valor =
              typeof s.value === "number"
                ? s.value
                : Number.parseFloat(s.value);
            if (!isNaN(valor)) {
              valor = valor / 100;
              const exists = await prisma.leitura.findFirst({
                where: {
                  medidorId: medidor.id,
                  tipo: "energy_total",
                  timestamp,
                },
              });
              if (!exists) {
                await prisma.leitura.create({
                  data: {
                    valor,
                    tipo: "energy_total",
                    unidade: leituraMapeada.unidade,
                    timestamp,
                    medidorId: medidor.id,
                  },
                });
                console.log(`✅ ${medidor.nome} — energy_total: ${valor} kWh`);
                await calcularESalvarConsumo(medidor.id, valor, timestamp, medidor);
              } else {
                console.log(`⏭️ Leitura já existe: ${medidor.nome}`);
              }
            }
            break;
          }

          case "relay_status":
          case "switch_1": {
            const valor = typeof s.value === "string" ? Number(s.value) : Number(s.value);
            if (!isNaN(valor)) {
              await prisma.leitura.create({
                data: {
                  valor,
                  tipo: leituraMapeada.tipo,
                  unidade: leituraMapeada.unidade,
                  timestamp,
                  medidorId: medidor.id,
                },
              });
              console.log(`✅ ${medidor.nome} — ${s.code}: ${valor}`);
            }
            break;
          }

          case "fault": {
            const valor = JSON.stringify(s.value);
            await prisma.leitura.create({
              data: {
                valor: 0,
                tipo: leituraMapeada.tipo,
                unidade: leituraMapeada.unidade,
                timestamp,
                medidorId: medidor.id,
              },
            });
            console.log(`🚨 Fault detectado em ${medidor.nome}: ${valor}`);
            break;
          }

          default:
            console.log(`ℹ️ ${s.code} não tratado.`);
        }
      }

      await prisma.medidor.update({
        where: { id: medidor.id },
        data: { ultimaLeitura: new Date() },
      });
    } catch (err: any) {
      console.error(`❌ Erro com ${medidor.nome}:`, err.message);
    }
  }

  console.log("✅ Coleta finalizada.");
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const isFromGitHub = userAgent.includes("curl") || request.headers.get("x-github-actions");

    console.log(`🚀 Iniciando coleta via ${isFromGitHub ? "GitHub Actions" : "API Route"}...`);
    await coletarDadosDeStatus();

    return NextResponse.json({
      success: true,
      message: "Coleta executada com sucesso",
      timestamp: new Date().toISOString(),
      source: isFromGitHub ? "github-actions" : "manual",
    });
  } catch (error: any) {
    console.error("❌ Erro na API Route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
