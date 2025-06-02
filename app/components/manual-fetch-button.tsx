/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/app/components/ui/alert"

export function ManualFetchButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null)

  const handleManualFetch = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/manual-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Se não for JSON, tratar como texto
        const textResponse = await response.text()
        throw new Error(`Resposta não-JSON recebida: ${textResponse.substring(0, 100)}...`)
      }

      const result = await response.json()

      if (response.ok) {
        setMessage({
          text: "✅ Coleta executada com sucesso!",
          type: "success",
        })
      } else {
        setMessage({
          text: `❌ Erro: ${result.error || "Erro desconhecido"}`,
          type: "error",
        })
      }
    } catch (error: any) {
      console.error("Erro na coleta manual:", error)
      setMessage({
        text: `❌ Erro: ${error.message || "Erro desconhecido"}`,
        type: "error",
      })
    } finally {
      setIsLoading(false)
      // Não limpar mensagem de erro automaticamente
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleManualFetch} disabled={isLoading} variant="outline" className="w-full">
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

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-2">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
