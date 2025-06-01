import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface PhaseDetailsProps {
  title: string
  voltage: string
  current: string
  powerFactor: string
  activePower: string
  color: string
}

export function PhaseDetails({ title, voltage, current, powerFactor, activePower, color }: PhaseDetailsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${color}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Tensão</span>
          <span className="font-medium">{voltage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Corrente</span>
          <span className="font-medium">{current}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Fator de Potência</span>
          <span className="font-medium">{powerFactor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Potência Ativa</span>
          <span className="font-medium">{activePower}</span>
        </div>
      </CardContent>
    </Card>
  )
}
