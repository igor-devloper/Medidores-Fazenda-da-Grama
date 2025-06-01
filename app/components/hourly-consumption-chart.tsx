/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface HourlyConsumptionChartProps {
  consumoPorHora: Record<number, number>
  data: string
}

export function HourlyConsumptionChart({ consumoPorHora, data }: HourlyConsumptionChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Criar dados para todas as 24 horas
    const dados = Array.from({ length: 24 }, (_, hora) => {
      return {
        hora: `${hora.toString().padStart(2, "0")}:00`,
        consumo: consumoPorHora[hora] || 0,
      }
    })

    setChartData(dados)
  }, [consumoPorHora])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hora"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const hour = Number.parseInt(value.split(":")[0])
              return hour % 3 === 0 ? value : ""
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(1)}`}
            label={{ value: "kWh", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} kWh`, "Consumo"]}
            labelFormatter={(label) => `Hora: ${label}`}
          />
          <Bar dataKey="consumo" fill="#10b981" radius={[4, 4, 0, 0]} name="Consumo" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
