"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"

interface ConsumptionTableProps {
  consumoPorDiaHora: Record<string, Record<number, number>>
}

export function ConsumptionTable({ consumoPorDiaHora }: ConsumptionTableProps) {
  // Extrair dias únicos e ordenar em ordem decrescente (mais recente primeiro)
  const dias = Object.keys(consumoPorDiaHora).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // Limitar a 7 dias para não sobrecarregar a tabela
  const diasLimitados = dias.slice(0, 7)

  // Criar array com todas as horas do dia (0-23)
  const horas = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Hora</TableHead>
            {diasLimitados.map((dia) => (
              <TableHead key={dia} className="text-center">
                {new Date(dia).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {horas.map((hora) => (
            <TableRow key={hora}>
              <TableCell className="font-medium">{hora.toString().padStart(2, "0")}:00</TableCell>
              {diasLimitados.map((dia) => (
                <TableCell key={`${dia}-${hora}`} className="text-center">
                  {consumoPorDiaHora[dia] && consumoPorDiaHora[dia][hora] !== undefined
                    ? consumoPorDiaHora[dia][hora].toFixed(2)
                    : "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
