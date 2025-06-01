import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Sun, Zap } from "lucide-react"
import { PhaseEnergyCard } from "@/app/components/phase-energy-card"

export default function OverviewPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Visão Geral de Energia</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Energia Consumida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-emerald-600">1502.92</span>
              <span className="ml-2 text-lg text-emerald-600">kW·h</span>
            </div>
            <div className="mt-4 flex items-center">
              <Zap className="h-5 w-5 text-emerald-500 mr-2" />
              <span className="text-sm text-gray-600">Consumo acumulado do mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Energia Produzida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-amber-600">532.70</span>
              <span className="ml-2 text-lg text-amber-600">kW·h</span>
            </div>
            <div className="mt-4 flex items-center">
              <Sun className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm text-gray-600">Geração acumulada do mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Fase A</h2>
      <PhaseEnergyCard consumo="487.89" geracao="127.72" color="text-red-500" bgColor="bg-red-50" className="mb-6" />

      <h2 className="text-xl font-semibold mb-4">Fase B</h2>
      <PhaseEnergyCard
        consumo="562.23"
        geracao="309.97"
        color="text-emerald-500"
        bgColor="bg-emerald-50"
        className="mb-6"
      />

      <h2 className="text-xl font-semibold mb-4">Fase C</h2>
      <PhaseEnergyCard consumo="452.80" geracao="95.01" color="text-blue-500" bgColor="bg-blue-50" />
    </main>
  )
}
