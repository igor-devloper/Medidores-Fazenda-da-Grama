import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Activity, Plus, Bolt } from "lucide-react"
import { DeviceStatusCard } from "@/app/components/device-status-card"
import { ManualFetchButton } from "@/app/components/manual-fetch-button"

export default async function Home() {
  const medidores = await prisma.medidor.findMany({
    include: {
      leituras: {
        where: {
          tipo: "energy_total",
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 1, // Apenas a última leitura de energia total
      },
      _count: {
        select: {
          leituras: true,
        },
      },
    },
  })

  const totalMedidores = medidores.length
  const medidoresAtivos = medidores.filter((m) => m.ativo).length
  const totalLeituras = medidores.reduce((acc, m) => acc + m._count.leituras, 0)

  // Calcular energia total de todos os medidores
  const energiaTotal = medidores.reduce((acc, m) => {
    const ultimaLeitura = m.leituras[0]
    return acc + (ultimaLeitura?.valor || 0)
  }, 0)

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sistema de Monitoramento de Medidores</h1>
          <p className="text-gray-600 mt-1">Fazenda da Grama - Monitoramento em Tempo Real</p>
        </div>
        <div className="flex gap-2">
          <ManualFetchButton />
          <Link href="/medidores/novo">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Medidor
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Total do Sistema</CardTitle>
            <Bolt className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-emerald-600">{energiaTotal.toFixed(2)}</div>
              <div className="ml-1 text-sm text-muted-foreground">kWh</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Energia acumulada total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medidores Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{medidoresAtivos}</div>
            <p className="text-xs text-muted-foreground">de {totalMedidores} medidores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leituras</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeituras}</div>
            <p className="text-xs text-muted-foreground">Registros históricos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dispositivos */}
      <h2 className="text-xl font-semibold mb-4">Dispositivos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medidores.map((medidor) => (
          <Link key={medidor.id} href={`/medidores/${medidor.id}`}>
            <DeviceStatusCard medidor={medidor} ultimaLeitura={medidor.leituras[0]} />
          </Link>
        ))}
      </div>

      {medidores.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum medidor cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando seu primeiro medidor ao sistema.</p>
          <Link href="/medidores/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Medidor
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}
