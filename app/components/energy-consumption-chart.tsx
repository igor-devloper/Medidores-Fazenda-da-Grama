/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface EnergyConsumptionChartProps {
  leituras?: any[]
}

export function EnergyConsumptionChart({ leituras = [] }: EnergyConsumptionChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (leituras.length > 0) {
      // Usar dados reais das leituras de consumo
      const chartData = leituras
        .slice()
        .reverse() // Inverter para ordem cronológica
        .map((leitura) => {
          const timestamp = new Date(leitura.timestamp)
          const hora = timestamp.getHours()
          return {
            hour: `${hora}:00`,
            consumo: leitura.valor,
          }
        })

      setData(chartData)
    } else {
      // Dados de demonstração se não houver leituras
      const hours = Array.from({ length: 24 }, (_, i) => i)
      const demoData = hours.map((hour) => {
        const value = Math.random() * 5 + (hour >= 8 && hour <= 20 ? 2 : 0.5)
        return {
          hour: `${hour}:00`,
          consumo: Number.parseFloat(value.toFixed(2)),
        }
      })
      setData(demoData)
    }
  }, [leituras])

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              const hour = Number.parseInt(value.split(":")[0])
              return hour % 6 === 0 ? `${hour}h` : ""
            }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}kW`} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(4)} kWh`, "Consumo"]}
            labelFormatter={(label) => `Hora: ${label}`}
          />
          <Bar dataKey="consumo" fill="#10b981" radius={[4, 4, 0, 0]} name="Consumo" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
