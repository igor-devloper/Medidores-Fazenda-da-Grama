import { Card, CardContent } from "@/app/components/ui/card"
import { Zap, Sun } from "lucide-react"

interface PhaseEnergyCardProps {
  consumo: string
  geracao: string
  color: string
  bgColor: string
  className?: string
}

export function PhaseEnergyCard({ consumo, geracao, color, bgColor, className = "" }: PhaseEnergyCardProps) {
  return (
    <Card className={`${bgColor} ${className}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Zap className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energia Consumida</p>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${color}`}>{consumo}</span>
                <span className="ml-1 text-sm text-gray-500">kW·h</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Sun className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Energia Produzida</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-amber-500">{geracao}</span>
                <span className="ml-1 text-sm text-gray-500">kW·h</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
