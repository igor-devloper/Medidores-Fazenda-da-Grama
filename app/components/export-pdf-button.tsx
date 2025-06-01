/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportPdfButtonProps {
  medidorId: number
  medidorNome: string
  leituras: any[]
  consumoPorDiaHora: Record<string, Record<number, number>>
}

export function ExportPdfButton({ medidorId, medidorNome, leituras, consumoPorDiaHora }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Função para formatar data no padrão brasileiro
  const formatarData = (data: Date) => {
    return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1).toString().padStart(2, "0")}/${data.getFullYear()}`
  }

  // Função para exportar leituras completas em PDF
  const exportLeiturasCompletas = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()

      // Título do documento
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(`Leituras Completas - ${medidorNome}`, 14, 22)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Data de geração: ${formatarData(new Date())}`, 14, 30)

      // Preparar dados para a tabela
      const tableData = leituras.map((leitura) => [
        new Date(leitura.timestamp).toLocaleString("pt-BR"),
        leitura.valor.toFixed(2),
        (leitura.consumo || 0).toFixed(2),
        leitura.tipo || "energy_total",
      ])

      // Gerar tabela usando autoTable
      autoTable(doc, {
        startY: 40,
        head: [["Data/Hora", "Energia Total (kWh)", "Consumo (kWh)", "Tipo"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 3 },
      })

      // Salvar o PDF
      doc.save(`${medidorNome.replace(/\s+/g, "_")}_leituras_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Erro ao exportar leituras em PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Função para exportar consumo diário em formato de tabela por hora
  const exportConsumoDiario = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF("landscape")

      // Título do documento
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(`Consumo Diário por Hora - ${medidorNome}`, 14, 22)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Data de geração: ${formatarData(new Date())}`, 14, 30)

      // Obter dias únicos e ordenar
      const dias = Object.keys(consumoPorDiaHora).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime()
      })

      // Limitar a 7 dias para caber na página
      const diasLimitados = dias.slice(Math.max(0, dias.length - 7))

      // Preparar cabeçalho da tabela
      const tableHead = [["Hora", ...diasLimitados.map((dia) => formatarData(new Date(dia)))]]

      // Preparar corpo da tabela
      const tableBody = []

      // Para cada hora do dia (0-23)
      for (let hora = 0; hora < 24; hora++) {
        const horaFormatada = `${hora.toString().padStart(2, "0")}:00`
        const row = [horaFormatada]

        // Para cada dia, adicionar o consumo daquela hora
        for (const dia of diasLimitados) {
          const consumo = consumoPorDiaHora[dia]?.[hora]
          row.push(consumo !== undefined ? consumo.toFixed(2) : "-")
        }

        tableBody.push(row)
      }

      // Adicionar linha de totais
      const totaisRow = ["Total Diário (kWh)"]
      for (const dia of diasLimitados) {
        const totalDia = Object.values(consumoPorDiaHora[dia] || {}).reduce((acc, val) => acc + val, 0)
        totaisRow.push(totalDia.toFixed(2))
      }
      tableBody.push(totaisRow)

      // Gerar tabela usando autoTable
      autoTable(doc, {
        startY: 40,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 2 },
        willDrawCell: (data: any) => {
          // Destacar a linha de totais
          if (data.row.index === tableBody.length - 1) {
            data.cell.styles.fillColor = [240, 240, 240]
            data.cell.styles.textColor = [0, 0, 0]
            data.cell.styles.fontStyle = "bold"
          }
        },
      })

      // Salvar o PDF
      doc.save(`${medidorNome.replace(/\s+/g, "_")}_consumo_diario_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Erro ao exportar consumo diário em PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Função para exportar resumo mensal em PDF
  const exportResumoMensal = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()

      // Título do documento
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(`Resumo Mensal de Consumo - ${medidorNome}`, 14, 22)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Data de geração: ${formatarData(new Date())}`, 14, 30)

      // Agrupar consumo por mês
      const consumoPorMes: Record<string, { total: number; dias: Set<string> }> = {}

      Object.entries(consumoPorDiaHora).forEach(([dia, horas]) => {
        const data = new Date(dia)
        const mesAno = `${(data.getMonth() + 1).toString().padStart(2, "0")}/${data.getFullYear()}`

        if (!consumoPorMes[mesAno]) {
          consumoPorMes[mesAno] = { total: 0, dias: new Set() }
        }

        const consumoDia = Object.values(horas).reduce((acc, consumo) => acc + consumo, 0)
        consumoPorMes[mesAno].total += consumoDia
        consumoPorMes[mesAno].dias.add(dia)
      })

      // Preparar dados para a tabela
      const tableData = Object.entries(consumoPorMes).map(([mesAno, dados]) => {
        const mediaDiaria = dados.total / dados.dias.size
        return [mesAno, dados.total.toFixed(2), mediaDiaria.toFixed(2), dados.dias.size.toString()]
      })

      // Gerar tabela usando autoTable
      autoTable(doc, {
        startY: 40,
        head: [["Mês/Ano", "Consumo Total (kWh)", "Média Diária (kWh)", "Dias com Leitura"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 3 },
      })

      // Salvar o PDF
      doc.save(`${medidorNome.replace(/\s+/g, "_")}_resumo_mensal_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Erro ao exportar resumo mensal em PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              Exportando...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportLeiturasCompletas}>
          <FileText className="h-4 w-4 mr-2" />
          Leituras Completas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportConsumoDiario}>
          <FileText className="h-4 w-4 mr-2" />
          Consumo Diário por Hora
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportResumoMensal}>
          <FileText className="h-4 w-4 mr-2" />
          Resumo Mensal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
