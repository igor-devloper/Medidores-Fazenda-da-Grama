"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"

export function GitHubActionsStatus() {
  const [lastExecution, setLastExecution] = useState<Date | null>(null)
  const [nextExecution, setNextExecution] = useState<Date | null>(null)
  const [status, setStatus] = useState<"success" | "error" | "running" | "unknown">("unknown")

  useEffect(() => {
    // Calcular próxima execução (próxima hora cheia)
    const now = new Date()
    const next = new Date(now)
    next.setHours(next.getHours() + 1, 0, 0, 0)
    setNextExecution(next)

    // Simular última execução (você pode buscar isso de uma API ou localStorage)
    const lastHour = new Date(now)
    lastHour.setMinutes(0, 0, 0)
    setLastExecution(lastHour)
    setStatus("success")
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status de leitura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status:</span>
          <Badge variant={status === "success" ? "default" : status === "error" ? "destructive" : "secondary"}>
            {status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === "error" && <XCircle className="h-3 w-3 mr-1" />}
            {status === "success" ? "Ativo" : status === "error" ? "Erro" : "Desconhecido"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Última leitura:</span>
          <span className="text-sm font-medium">
            {lastExecution ? lastExecution.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Próxima leitura:</span>
          <span className="text-sm font-medium">
            {nextExecution ? nextExecution.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
