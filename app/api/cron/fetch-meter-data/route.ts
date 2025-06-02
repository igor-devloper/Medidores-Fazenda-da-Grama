/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAPA_CODES = {
  forward_energy_total: {
    tipo: "energy_total",
    unidade: "kWh",
    scale: 2,
  } as const,
} as const;

async function calcularESalvarConsumo(
  medidorId: number,
  valorAtual: number,
  timestamp: Date,
  medidor: any
) {
  try {
    const leituraAnterior = await prisma.leitura.findFirst({
      where: {
        medidorId: medidorId,
        tipo: "energy_total",
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    if (leituraAnterior) {
      const consumo = valorAtual - leituraAnterior.valor;

      if (consumo > 0) {
        const consumoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidorId,
            tipo: "consumo",
            timestamp: timestamp,
          },
        });

        if (!consumoExistente) {
          await prisma.leitura.create({
            data: {
              valor: consumo,
              tipo: "consumo",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidorId,
            },
          });

          console.log(
            `📊 Consumo calculado e salvo: ${consumo.toFixed(
              4
            )} kWh (${valorAtual} - ${leituraAnterior.valor})`
          );
          return consumo;
        } else {
          console.log(
            `⏭️ Consumo já existe para este período: ${medidor.nome}`
          );
        }
      } else if (consumo < 0) {
        console.log(
          `⚠️ Consumo negativo detectado (possível reset do medidor): ${consumo.toFixed(
            4
          )} kWh`
        );
      }
    } else {
      console.log(`ℹ️ Primeira leitura do medidor - consumo não calculado`);
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
  console.log("⚡ Coletando dados de energia dos medidores...");

  try {
    const { setTuyaUid, getDeviceStatus } = await import("@/lib/tuya-api");
    setTuyaUid("az1742355872329ya07v");

    const medidores = await prisma.medidor.findMany({
      where: { ativo: true },
    });

    if (medidores.length === 0) {
      console.log("ℹ️ Nenhum medidor ativo encontrado");
      return;
    }

    for (const medidor of medidores) {
      if (!medidor.tuyaDeviceId) {
        console.warn(
          `⚠️ Medidor ${medidor.nome} não possui tuyaDeviceId definido.`
        );
        continue;
      }

      try {
        console.log(
          `🔎 Consultando dispositivo Tuya: ${medidor.nome} — ID: ${medidor.tuyaDeviceId}`
        );
        const status = await getDeviceStatus(medidor.tuyaDeviceId);

        const timestamp = new Date();
        timestamp.setMinutes(0, 0, 0);

        for (const s of status) {
          const leituraMapeada = MAPA_CODES[s.code as keyof typeof MAPA_CODES];
          if (!leituraMapeada) {
            continue;
          }

          console.log(`📊 Processando: ${s.code} = ${JSON.stringify(s.value)}`);

          if (s.code === "forward_energy_total") {
            let valor =
              typeof s.value === "number"
                ? s.value
                : Number.parseFloat(s.value);
            if (!isNaN(valor)) {
              valor = valor / 100; // scale 2
              console.log(`🔢 Energia total: ${s.value} / 100 = ${valor} kWh`);

              const leituraExistente = await prisma.leitura.findFirst({
                where: {
                  medidorId: medidor.id,
                  tipo: "energy_total",
                  timestamp: timestamp,
                },
              });

              if (!leituraExistente) {
                await prisma.leitura.create({
                  data: {
                    valor: valor,
                    tipo: "energy_total",
                    unidade: "kWh",
                    timestamp: timestamp,
                    medidorId: medidor.id,
                  },
                });
                console.log(`✅ ${medidor.nome} — energy_total: ${valor} kWh`);

                await calcularESalvarConsumo(
                  medidor.id,
                  valor,
                  timestamp,
                  medidor
                );
              } else {
                console.log(
                  `⏭️ Leitura de energia total já existe: ${medidor.nome}`
                );
              }
            }
          }
        }

        await prisma.medidor.update({
          where: { id: medidor.id },
          data: { ultimaLeitura: new Date() },
        });
      } catch (err: any) {
        console.error(`❌ Erro no medidor ${medidor.nome}:`, err.message);
      }
    }

    console.log("✅ Coleta de dados de energia finalizada.");
  } catch (error: any) {
    console.error("❌ Erro na coleta de dados:", error.message);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Autenticação via query string (usada pelo Cronhub)
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const isFromGitHub =
      userAgent.includes("curl") || request.headers.get("x-github-actions");

    console.log(
      `🚀 Iniciando coleta de dados via ${
        isFromGitHub ? "GitHub Actions" : "API Route"
      }...`
    );

    await coletarDadosDeStatus();

    return NextResponse.json({
      success: true,
      message: "Coleta de dados executada com sucesso",
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
