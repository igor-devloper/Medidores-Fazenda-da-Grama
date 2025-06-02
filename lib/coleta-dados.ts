/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"

// Mapa de códigos da API Tuya
const MAPA_CODES = {
  // Energia total consumida (acumulada)
  forward_energy_total: { tipo: "energy_total", unidade: "kWh", scale: 2 } as const,

  // Energia reversa/injetada (se disponível)
  reverse_energy_total: { tipo: "energy_reverse", unidade: "kWh", scale: 2 } as const,

  // Estado online/offline para monitoramento
  online_state: { tipo: "online_status", unidade: "status" } as const,
} as const

// Função para calcular e salvar consumo
export async function calcularESalvarConsumo(medidorId: number, valorAtual: number, timestamp: Date, medidor: any) {
  try {
    // Buscar a leitura anterior de energy_total
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
    })

    if (leituraAnterior) {
      const consumo = valorAtual - leituraAnterior.valor

      // Só registrar consumo se for positivo (evitar valores negativos por reset do medidor)
      if (consumo > 0) {
        // Verificar se já existe uma leitura de consumo para este timestamp
        const consumoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidorId,
            tipo: "consumo",
            timestamp: timestamp,
          },
        })

        if (!consumoExistente) {
          await prisma.leitura.create({
            data: {
              valor: consumo,
              tipo: "consumo",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidorId,
            },
          })

          console.log(
            `📊 Consumo calculado e salvo: ${consumo.toFixed(4)} kWh (${valorAtual} - ${leituraAnterior.valor})`,
          )
          return consumo
        } else {
          console.log(`⏭️ Consumo já existe para este período: ${medidor.nome}`)
        }
      } else if (consumo < 0) {
        console.log(`⚠️ Consumo negativo detectado (possível reset do medidor): ${consumo.toFixed(4)} kWh`)
      }
    } else {
      console.log(`ℹ️ Primeira leitura do medidor - consumo não calculado`)
    }

    return 0
  } catch (error) {
    console.error("Erro ao calcular consumo:", error)
    return 0
  }
}

// Função para calcular energia injetada
export async function calcularEnergiaInjetada(medidorId: number, valorAtual: number, timestamp: Date, medidor: any) {
  try {
    // Buscar a leitura anterior de energy_reverse
    const leituraAnterior = await prisma.leitura.findFirst({
      where: {
        medidorId: medidorId,
        tipo: "energy_reverse",
        timestamp: {
          lt: timestamp,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    if (leituraAnterior) {
      const injecao = valorAtual - leituraAnterior.valor

      if (injecao > 0) {
        // Verificar se já existe uma leitura de injeção para este timestamp
        const injecaoExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidorId,
            tipo: "energy_injected",
            timestamp: timestamp,
          },
        })

        if (!injecaoExistente) {
          await prisma.leitura.create({
            data: {
              valor: injecao,
              tipo: "energy_injected",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidorId,
            },
          })

          console.log(`🔋 Energia injetada calculada: ${injecao.toFixed(4)} kWh`)
          return injecao
        }
      }
    }

    return 0
  } catch (error) {
    console.error("Erro ao calcular energia injetada:", error)
    return 0
  }
}

// Função principal de coleta de dados
export async function coletarDadosDeStatus() {
  console.log("⚡ Coletando dados de energia dos medidores...")

  try {
    // Verificar se há medidores ativos antes de tentar importar a API Tuya
    const medidores = await prisma.medidor.findMany({
      where: { ativo: true },
    })

    if (medidores.length === 0) {
      console.log("ℹ️ Nenhum medidor ativo encontrado")
      return {
        success: true,
        message: "Nenhum medidor ativo encontrado",
        medidores: 0,
        leituras: 0,
      }
    }

    // Importar dinamicamente para evitar problemas no build
    const { setTuyaUid, getDeviceStatus } = await import("@/lib/tuya-api")

    // Configurar o UID da conta Tuya
    setTuyaUid("az1742355872329ya07v")

    let medidoresProcessados = 0
    let leiturasRegistradas = 0
    const erros: string[] = []

    for (const medidor of medidores) {
      if (!medidor.tuyaDeviceId) {
        const erro = `Medidor ${medidor.nome} não possui tuyaDeviceId definido`
        console.warn(`⚠️ ${erro}`)
        erros.push(erro)
        continue
      }

      try {
        console.log(`🔎 Consultando dispositivo Tuya: ${medidor.nome} — ID: ${medidor.tuyaDeviceId}`)
        const status = await getDeviceStatus(medidor.tuyaDeviceId)

        const timestamp = new Date()
        timestamp.setMinutes(0, 0, 0) // Arredondar para a hora

        // Processar apenas os dados essenciais
        for (const s of status) {
          const leituraMapeada = MAPA_CODES[s.code as keyof typeof MAPA_CODES]
          if (!leituraMapeada) {
            continue // Ignorar códigos não mapeados
          }

          console.log(`📊 Processando: ${s.code} = ${JSON.stringify(s.value)}`)

          // Processar energia total (forward_energy_total)
          if (s.code === "forward_energy_total") {
            let valor = typeof s.value === "number" ? s.value : Number.parseFloat(s.value)
            if (!isNaN(valor)) {
              // Aplicar scale para obter o valor correto com casas decimais
              valor = valor / 100 // Dividir por 100 (scale 2)
              console.log(`🔢 Energia total: ${s.value} / 100 = ${valor} kWh`)

              // Verificar se já existe uma leitura para este timestamp
              const leituraExistente = await prisma.leitura.findFirst({
                where: {
                  medidorId: medidor.id,
                  tipo: "energy_total",
                  timestamp: timestamp,
                },
              })

              if (!leituraExistente) {
                // Salvar a leitura de energia total
                await prisma.leitura.create({
                  data: {
                    valor: valor,
                    tipo: "energy_total",
                    unidade: "kWh",
                    timestamp: timestamp,
                    medidorId: medidor.id,
                  },
                })
                console.log(`✅ ${medidor.nome} — energy_total: ${valor} kWh`)
                leiturasRegistradas++

                // Calcular e salvar o consumo
                await calcularESalvarConsumo(medidor.id, valor, timestamp, medidor)
              } else {
                console.log(`⏭️ Leitura de energia total já existe: ${medidor.nome}`)
              }
            }
          }

          // Processar energia reversa (reverse_energy_total) se disponível
          if (s.code === "reverse_energy_total") {
            let valor = typeof s.value === "number" ? s.value : Number.parseFloat(s.value)
            if (!isNaN(valor)) {
              valor = valor / 100 // Aplicar scale
              console.log(`🔢 Energia reversa: ${s.value} / 100 = ${valor} kWh`)

              const leituraExistente = await prisma.leitura.findFirst({
                where: {
                  medidorId: medidor.id,
                  tipo: "energy_reverse",
                  timestamp: timestamp,
                },
              })

              if (!leituraExistente) {
                await prisma.leitura.create({
                  data: {
                    valor: valor,
                    tipo: "energy_reverse",
                    unidade: "kWh",
                    timestamp: timestamp,
                    medidorId: medidor.id,
                  },
                })
                console.log(`✅ ${medidor.nome} — energy_reverse: ${valor} kWh`)
                leiturasRegistradas++

                // Calcular energia injetada
                await calcularEnergiaInjetada(medidor.id, valor, timestamp, medidor)
              }
            }
          }

          // Processar status online
          if (s.code === "online_state") {
            const valorOnline = s.value === "online" ? 1 : 0

            const leituraExistente = await prisma.leitura.findFirst({
              where: {
                medidorId: medidor.id,
                tipo: "online_status",
                timestamp: timestamp,
              },
            })

            if (!leituraExistente) {
              await prisma.leitura.create({
                data: {
                  valor: valorOnline,
                  tipo: "online_status",
                  unidade: "status",
                  timestamp: timestamp,
                  medidorId: medidor.id,
                },
              })
              console.log(`✅ ${medidor.nome} — online_status: ${s.value}`)
              leiturasRegistradas++
            }
          }
        }

        // Atualizar timestamp da última leitura do medidor
        await prisma.medidor.update({
          where: { id: medidor.id },
          data: { ultimaLeitura: new Date() },
        })

        medidoresProcessados++
      } catch (err: any) {
        const erro = `Erro no medidor ${medidor.nome}: ${err.message}`
        console.error(`❌ ${erro}`)
        erros.push(erro)
      }
    }

    console.log("✅ Coleta de dados de energia finalizada.")
    return {
      success: true,
      message: "Coleta finalizada com sucesso",
      medidores: medidoresProcessados,
      leituras: leiturasRegistradas,
      erros: erros.length > 0 ? erros : undefined,
    }
  } catch (error: any) {
    console.error("❌ Erro na coleta de dados:", error.message)
    throw error
  }
}
