"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Zap } from "lucide-react"

export function TotalPowerCard() {
  const [loading, setLoading] = useState(true)
  const [totalPower, setTotalPower] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch("/api/tuya")

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`)
        }

        const data = await response.json()
        setTotalPower(data.summary.totalPower)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
        console.error("Erro ao buscar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Potência Total</CardTitle>
          <CardDescription>Consumo em tempo real</CardDescription>
        </div>
        <Zap className="h-6 w-6 text-amber-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse h-8 bg-muted rounded" />
        ) : error ? (
          <div className="text-destructive text-sm">Erro ao carregar dados</div>
        ) : (
          <div className="text-3xl font-bold">{totalPower.toFixed(2)} W</div>
        )}
      </CardContent>
    </Card>
  )
}
