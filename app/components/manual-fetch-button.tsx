/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { RefreshCw } from "lucide-react"

export function ManualFetchButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleManualFetch = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/manual-fetch", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setMessage("✅ Coleta executada com sucesso!")
      } else {
        setMessage(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      setMessage("❌ Erro ao executar coleta manual")
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(""), 5000) // Limpar mensagem após 5 segundos
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleManualFetch} disabled={isLoading} variant="outline">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Coletando...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coletar Dados Agora
          </>
        )}
      </Button>
      {message && <p className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
    </div>
  )
}
