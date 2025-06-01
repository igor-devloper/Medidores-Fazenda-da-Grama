/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardHeader } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Power } from "lucide-react"

interface DeviceStatusCardProps {
  medidor: any
  ultimaLeitura: any
}

export function DeviceStatusCard({ medidor, ultimaLeitura }: DeviceStatusCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <h3 className="font-medium">{medidor.nome || `Medidor ${medidor.id}`}</h3>
          {medidor.localizacao && <p className="text-sm text-gray-500">{medidor.localizacao}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={medidor.ativo ? "default" : "secondary"} className="h-6">
            {medidor.ativo ? "Ativo" : "Inativo"}
          </Badge>
          <div className={`rounded-full p-1.5 ${medidor.ativo ? "bg-emerald-500" : "bg-gray-300"}`}>
            <Power className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ID Virtual:</span>
            <span className="font-mono text-xs">{medidor.idVirtual.slice(0, 12)}...</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">IP:</span>
            <span>{medidor.ip}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Última Leitura:</span>
            <span>{new Date(medidor.ultimaLeitura).toLocaleString()}</span>
          </div>

          {ultimaLeitura && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-700">Energia Total:</span>
                <span className="text-lg font-bold text-blue-900">
                  {ultimaLeitura.valor.toFixed(2)} {ultimaLeitura.unidade}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>{medidor._count.leituras} leituras</span>
            <span>Ver detalhes →</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
