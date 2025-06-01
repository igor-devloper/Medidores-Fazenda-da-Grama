import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"
import { DetailedEnergyChart } from "@/app/components/detailed-energy-chart"
import { ConsumptionTable } from "@/app/components/consumption-table"
import { HourlyConsumptionChart } from "@/app/components/hourly-consumption-chart"
import { ExportPdfButton } from "@/app/components/export-pdf-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

export default async function MedidorPage({ params }: { params: { id: string } }) {
  const medidor = await prisma.medidor.findUnique({
    where: {
      id: Number.parseInt(params.id),
    },
    include: {
      leituras: {
        where: {
          tipo: "energy_total", // Apenas energia total
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 168, // Últimas 168 leituras (7 dias x 24 horas)
      },
    },
  })

  if (!medidor) {
    notFound()
  }

  // Ordenar leituras por timestamp (mais antiga primeiro) para calcular consumo
  const leiturasOrdenadas = medidor.leituras
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Calcular consumo para cada leitura
  const leiturasComConsumo = leiturasOrdenadas.map((leitura, index) => {
    let consumo = 0
    if (index > 0) {
      const leituraAnterior = leiturasOrdenadas[index - 1]
      consumo = leitura.valor - leituraAnterior.valor
      consumo = Math.max(0, consumo) // Garantir que não seja negativo
    }

    return {
      ...leitura,
      consumo,
    }
  })

  // Pegar a última leitura de energia total
  const ultimaLeituraEnergia = medidor.leituras[0] // Já está ordenado desc

  // Calcular consumo da última hora
  let consumoUltimaHora = 0
  if (medidor.leituras.length >= 2) {
    const ultimaLeitura = medidor.leituras[0]
    const penultimaLeitura = medidor.leituras[1]
    consumoUltimaHora = Math.max(0, ultimaLeitura.valor - penultimaLeitura.valor)
  }

  // Organizar leituras por dia e hora para a tabela
  const consumoPorDiaHora: Record<string, Record<number, number>> = {}

  leiturasComConsumo.forEach((leitura) => {
    const data = new Date(leitura.timestamp)
    const dia = data.toLocaleDateString()
    const hora = data.getHours()

    if (!consumoPorDiaHora[dia]) {
      consumoPorDiaHora[dia] = {}
    }

    consumoPorDiaHora[dia][hora] = leitura.consumo
  })

  // Obter dias únicos ordenados (mais recente primeiro)
  const dias = Object.keys(consumoPorDiaHora).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // Dia mais recente para o gráfico de consumo hora a hora
  const diaAtual = dias.length > 0 ? dias[0] : new Date().toLocaleDateString()

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{medidor.nome || `Medidor ${medidor.id}`}</h1>
          <Badge variant={medidor.ativo ? "default" : "secondary"}>{medidor.ativo ? "Ativo" : "Inativo"}</Badge>
        </div>

        <div className="flex gap-2">
          <ExportPdfButton
            medidorId={medidor.id}
            medidorNome={medidor.nome || `Medidor ${medidor.id}`}
            leituras={leiturasComConsumo}
            consumoPorDiaHora={consumoPorDiaHora}
          />
        </div>
      </div>

      {/* Informações do Medidor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID Virtual</p>
                <p className="font-mono text-sm">{medidor.idVirtual}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Endereço MAC</p>
                <p className="font-mono text-sm">{medidor.enderecoMAC}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IP</p>
                <p>{medidor.ip}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p>{medidor.localizacao || "Não definida"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fuso Horário</p>
                <p>{medidor.fusoHorario}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Força do Sinal</p>
                <p>{medidor.forcaSinal || "-00dBm"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{ultimaLeituraEnergia?.valor.toFixed(2) || "0.00"}</span>
              <span className="ml-1 text-sm text-gray-500">kWh</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Energia acumulada total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Última Hora</CardTitle>
            <Clock className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-emerald-600">{consumoUltimaHora.toFixed(2)}</span>
              <span className="ml-1 text-sm text-gray-500">kWh</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ultimaLeituraEnergia
                ? `Registrado em ${new Date(ultimaLeituraEnergia.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Nenhum dado disponível"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Histórico */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Energia</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailedEnergyChart leituras={leiturasComConsumo} />
        </CardContent>
      </Card>

      {/* Consumo Hora a Hora */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Consumo Hora a Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grafico">
            <TabsList className="mb-4">
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
            </TabsList>
            <TabsContent value="grafico">
              <div className="mb-2 text-sm text-gray-500">
                Data:{" "}
                {new Date(diaAtual).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
              <HourlyConsumptionChart consumoPorHora={consumoPorDiaHora[diaAtual] || {}} data={diaAtual} />
            </TabsContent>
            <TabsContent value="tabela">
              <ConsumptionTable consumoPorDiaHora={consumoPorDiaHora} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
