import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import type { ReactNode } from "react"

interface EnergyOverviewCardProps {
  title: string
  value: string
  unit: string
  icon: ReactNode
  className?: string
}

export function EnergyOverviewCard({ title, value, unit, icon, className = "" }: EnergyOverviewCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-3xl font-bold">{value}</div>
          <div className="ml-1 text-sm text-muted-foreground">{unit}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Atualizado em tempo real</p>
      </CardContent>
    </Card>
  )
}
