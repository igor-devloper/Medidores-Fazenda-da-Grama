import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface LiveMetricCardProps {
  title: string
  value: string
  unit: string
  isNegative: boolean
}

export function LiveMetricCard({ title, value, unit, isNegative }: LiveMetricCardProps) {
  return (
    <Card className={isNegative ? "bg-red-50" : "bg-emerald-50"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${isNegative ? "text-red-600" : "text-emerald-600"}`}>
          {value}
          <span className="text-lg font-normal ml-1">{unit}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Atualizado em tempo real</p>
      </CardContent>
    </Card>
  )
}
