/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DetailedEnergyChartProps {
  leituras: any[]
}

export function DetailedEnergyChart({ leituras }: DetailedEnergyChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // As leituras já vêm com o consumo calculado
    const chartData = leituras.map((leitura) => {
      const timestamp = new Date(leitura.timestamp)
      const hora = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const data = timestamp.toLocaleDateString()

      return {
        timestamp: hora,
        data,
        energiaTotal: leitura.valor,
        consumo: leitura.consumo || 0, // Ensure we use the calculated consumption
      }
    })

    setData(chartData)
  }, [leituras])

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case "energiaTotal":
        return [`${value.toFixed(2)} kWh`, "Energia Total"]
      case "consumo":
        return [`${value.toFixed(2)} kWh`, "Consumo"]
      default:
        return [`${value.toFixed(2)} kWh`, name]
    }
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            tickFormatter={(value, index) => {
              // Mostrar apenas algumas horas para não sobrecarregar
              const hour = Number.parseInt(value.split(":")[0])
              return hour % 3 === 0 ? value : ""
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            domain={["dataMin", "dataMax"]}
            label={{
              value: "Energia Total (kWh)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            domain={[0, "dataMax + 1"]} // Add some padding to the max value
            label={{
              value: "Consumo/Injeção (kWh)",
              angle: 90,
              position: "insideRight",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip formatter={formatTooltip} labelFormatter={(label) => `Hora: ${label}`} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="energiaTotal"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Energia Total (kWh)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="consumo"
            stroke="#10b981"
            strokeWidth={3} // Make it thicker
            dot={{ r: 4, fill: "#10b981" }} // Make dots more visible
            activeDot={{ r: 6, fill: "#10b981" }}
            name="Consumo (kWh)"
            connectNulls={false} // Don't connect null values
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
