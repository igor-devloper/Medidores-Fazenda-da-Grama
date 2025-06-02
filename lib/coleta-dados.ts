/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"

// Função principal de coleta de dados (versão simplificada para debug)
export async function coletarDadosDeStatus() {
  console.log("⚡ Iniciando coleta de dados dos medidores...")

  try {
    // Verificar conexão com banco de dados
    console.log("🔍 Verificando conexão com banco de dados...")
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Conexão com banco de dados OK")

    // Verificar se há medidores ativos
    console.log("📊 Buscando medidores ativos...")
    const medidores = await prisma.medidor.findMany({
      where: { ativo: true },
    })

    console.log(`📈 Encontrados ${medidores.length} medidores ativos`)

    if (medidores.length === 0) {
      console.log("ℹ️ Nenhum medidor ativo encontrado")
      return {
        success: true,
        message: "Nenhum medidor ativo encontrado",
        medidores: 0,
        leituras: 0,
      }
    }

    let medidoresProcessados = 0
    let leiturasRegistradas = 0
    const erros: string[] = []

    // Processar cada medidor
    for (const medidor of medidores) {
      try {
        console.log(`🔎 Processando medidor: ${medidor.nome || medidor.id}`)

        if (!medidor.tuyaDeviceId) {
          const erro = `Medidor ${medidor.nome} não possui tuyaDeviceId definido`
          console.warn(`⚠️ ${erro}`)
          erros.push(erro)
          continue
        }

        // Simular coleta de dados (por enquanto)
        console.log(`📡 Simulando coleta para dispositivo: ${medidor.tuyaDeviceId}`)

        // Criar timestamp arredondado para a hora
        const timestamp = new Date()
        timestamp.setMinutes(0, 0, 0)

        // Simular dados de energia
        const energiaSimulada = 1500 + Math.random() * 100 // Valor entre 1500-1600 kWh

        // Verificar se já existe leitura para este timestamp
        const leituraExistente = await prisma.leitura.findFirst({
          where: {
            medidorId: medidor.id,
            tipo: "energy_total",
            timestamp: timestamp,
          },
        })

        if (!leituraExistente) {
          // Criar nova leitura
          await prisma.leitura.create({
            data: {
              valor: energiaSimulada,
              tipo: "energy_total",
              unidade: "kWh",
              timestamp: timestamp,
              medidorId: medidor.id,
            },
          })

          console.log(`✅ ${medidor.nome} — energy_total: ${energiaSimulada.toFixed(2)} kWh`)
          leiturasRegistradas++
        } else {
          console.log(`⏭️ Leitura já existe para ${medidor.nome}`)
        }

        // Atualizar timestamp da última leitura
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

    console.log("✅ Coleta de dados finalizada")
    return {
      success: true,
      message: "Coleta finalizada com sucesso",
      medidores: medidoresProcessados,
      leituras: leiturasRegistradas,
      erros: erros.length > 0 ? erros : undefined,
    }
  } catch (error: any) {
    console.error("❌ Erro na coleta de dados:", error)
    throw new Error(`Erro na coleta: ${error.message}`)
  }
}
