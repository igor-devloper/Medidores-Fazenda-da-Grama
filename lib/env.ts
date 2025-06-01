// lib/env.ts
import * as dotenv from "dotenv"
import path from "path"

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
}

function getEnvVar(name: string, required = true): string {
  const value = process.env[name]
  if (!value && required) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${name}`)
  }
  return value || ""
}

export const env = {
  TUYA_ACCESS_ID: getEnvVar("TUYA_ACCESS_ID"),
  TUYA_ACCESS_KEY: getEnvVar("TUYA_ACCESS_KEY"),
  TUYA_API_ENDPOINT: getEnvVar("TUYA_API_ENDPOINT", false) || "https://openapi.tuyaus.com",
  DATABASE_URL: getEnvVar("DATABASE_URL"),
}
