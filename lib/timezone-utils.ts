/**
 * Utilitários para conversão de fuso horário
 * Garante funcionamento consistente entre desenvolvimento e produção
 */

// Fuso horário do Brasil
export const BRAZIL_TIMEZONE = "America/Sao_Paulo"

/**
 * Converte um timestamp UTC para o horário brasileiro
 */
export function convertToBrazilTime(utcDate: Date): Date {
  // Usar Intl.DateTimeFormat para conversão precisa
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(utcDate)
  const brazilDateString = `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}T${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}:${parts.find((p) => p.type === "second")?.value}`

  return new Date(brazilDateString)
}

/**
 * Obtém a hora brasileira atual
 */
export function getBrazilNow(): Date {
  return convertToBrazilTime(new Date())
}

/**
 * Formata uma data para exibição no horário brasileiro
 */
export function formatBrazilTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    ...options,
  }).format(date)
}

/**
 * Extrai a hora (0-23) de uma data no fuso horário brasileiro
 */
export function getBrazilHour(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  })

  return Number.parseInt(formatter.format(date))
}

/**
 * Cria um timestamp arredondado para a hora no fuso brasileiro
 */
export function createBrazilHourTimestamp(): Date {
  const now = getBrazilNow()
  now.setMinutes(0, 0, 0)
  return now
}
