"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface TuyaDevice {
  id: string
  name: string
  product_name: string
  category: string
  online: boolean
}

export default function NovoMedidor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [tuyaDevices, setTuyaDevices] = useState<TuyaDevice[]>([])
  const [formData, setFormData] = useState({
    idVirtual: "",
    ip: "",
    enderecoMAC: "",
    fusoHorario: "America/Sao_Paulo",
    forcaSinal: "",
    nome: "",
    localizacao: "",
    tuyaDeviceId: "",
  })

  useEffect(() => {
    loadTuyaDevices()
  }, [])

  const loadTuyaDevices = async () => {
    try {
      setLoadingDevices(true)
      const response = await fetch("/api/tuya/devices")
      if (response.ok) {
        const devices = await response.json()
        setTuyaDevices(devices)
      }
    } catch (error) {
      console.error("Erro ao carregar dispositivos Tuya:", error)
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-preencher campos quando selecionar um dispositivo Tuya
    if (field === "tuyaDeviceId") {
      const selectedDevice = tuyaDevices.find((d) => d.id === value)
      if (selectedDevice) {
        setFormData((prev) => ({
          ...prev,
          nome: prev.nome || selectedDevice.name,
          idVirtual: prev.idVirtual || selectedDevice.id,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/medidores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar medidor")
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Erro:", error)
      alert(error instanceof Error ? error.message : "Erro ao cadastrar medidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Cadastrar Novo Medidor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Medidor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Dispositivo Tuya */}
            <div className="space-y-2">
              <Label htmlFor="tuyaDevice">Dispositivo Tuya (Opcional)</Label>
              <Select onValueChange={(value) => handleChange("tuyaDeviceId", value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingDevices ? "Carregando dispositivos..." : "Selecione um dispositivo Tuya"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {tuyaDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex flex-col">
                        <span>{device.name}</span>
                        <span className="text-xs text-gray-500">{device.product_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingDevices && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando dispositivos da Tuya...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Medidor</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Ex: Medidor Principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => handleChange("localizacao", e.target.value)}
                  placeholder="Ex: Galpão 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idVirtual">ID Virtual *</Label>
              <Input
                id="idVirtual"
                value={formData.idVirtual}
                onChange={(e) => handleChange("idVirtual", e.target.value)}
                placeholder="Ex: ebf1fb81f8402bd505uwx9"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP *</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) => handleChange("ip", e.target.value)}
                  placeholder="Ex: 191.193.107.100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoMAC">Endereço MAC *</Label>
                <Input
                  id="enderecoMAC"
                  value={formData.enderecoMAC}
                  onChange={(e) => handleChange("enderecoMAC", e.target.value)}
                  placeholder="Ex: f8:17:2d:29:98:5f"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fusoHorario">Fuso Horário</Label>
                <Input
                  id="fusoHorario"
                  value={formData.fusoHorario}
                  onChange={(e) => handleChange("fusoHorario", e.target.value)}
                  placeholder="America/Sao_Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forcaSinal">Força do Sinal</Label>
                <Input
                  id="forcaSinal"
                  value={formData.forcaSinal}
                  onChange={(e) => handleChange("forcaSinal", e.target.value)}
                  placeholder="Ex: -28dBm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Medidor"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
