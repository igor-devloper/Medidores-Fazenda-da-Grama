/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/tuya.ts
import crypto from "crypto";
import fetch from "node-fetch";
import { env } from "@/lib/env";


export interface DeviceLogEntry {
  dp_id: string;
  value: string;
  event_time: number;
}

const { TUYA_ACCESS_ID, TUYA_ACCESS_KEY, TUYA_API_ENDPOINT } = env;

// UID global (você pode setar via setTuyaUid)
let TUYA_UID = "";

// Tipos
interface TuyaProfileResponse {
  result: {
    uid: string
  }
}
export interface TuyaApiResponse<T> {
  success: boolean;
  result: T;
  t: number;
  tid: string;
  code?: number;
  msg?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  uid: string;
  local_key: string;
  category: string;
  product_id: string;
  product_name: string;
  sub: boolean;
  uuid: string;
  online: boolean;
  active_time: number;
  create_time: number;
  update_time: number;
  time_zone: string;
  ip: string;
  status: Array<{
    code: string;
    value: any;
  }>;
}

export interface DeviceStatus {
  code: string;
  value: any;
}

// Helpers
function hmacSHA256(key: string, data: string) {
  return crypto
    .createHmac("sha256", key)
    .update(data, "utf8")
    .digest("hex")
    .toUpperCase();
}

function buildSignString(method: string, path: string, body = "") {
  const bodyHash = crypto
    .createHash("sha256")
    .update(body, "utf8")
    .digest("hex");
  return `${method}\n${bodyHash}\n\n${path}`;
}
export async function getDeviceLogs(
  deviceId: string,
  dpId: string,
  startTime: number,
  endTime: number
): Promise<DeviceLogEntry[]> {
  const token = await getTuyaToken();
  const t = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const path = `/v1.0/devices/${deviceId}/logs?dp_id=${dpId}&start_time=${startTime}&end_time=${endTime}`;
  const method = "GET";
  const stringToSign = buildSignString(method, path);
  const signStr = `${TUYA_ACCESS_ID}${token}${t}${nonce}${stringToSign}`;
  const sign = hmacSHA256(TUYA_ACCESS_KEY, signStr);

  const res = await fetch(`${TUYA_API_ENDPOINT}${path}`, {
    method,
    headers: {
      client_id: TUYA_ACCESS_ID,
      access_token: token,
      sign: sign,
      t: t,
      nonce: nonce,
      sign_method: "HMAC-SHA256",
    },
  });

  const json = (await res.json()) as TuyaApiResponse<{ logs: DeviceLogEntry[] }>;

  if (!json.success) {
    throw new Error(`Erro ao buscar logs: ${json.msg} (Código: ${json.code})`);
  }

  return json.result.logs;
}

export async function getTuyaDevicesWithReadings(token: string) {
  const t = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const method = "GET";

  // Descobrir UID do usuário a partir do token (se não setado manualmente)
  if (!TUYA_UID) {
    const profile = await fetch(`${TUYA_API_ENDPOINT}/v1.0/users/me`, {
      method,
      headers: {
        client_id: TUYA_ACCESS_ID,
        access_token: token,
        sign: hmacSHA256(
          TUYA_ACCESS_KEY,
          `${TUYA_ACCESS_ID}${token}${t}${nonce}${method}\n\n\n/v1.0/users/me`
        ),
        t: t,
        nonce: nonce,
        sign_method: "HMAC-SHA256",
      },
    }).then((res) => res.json() as Promise<TuyaApiResponse<{ uid: string }>>);

    if (profile?.result?.uid) {
      setTuyaUid(profile.result.uid);
    } else {
      throw new Error("Não foi possível obter UID do usuário Tuya.");
    }
  }

  const devices = await getAllDevices();
  const readings = await Promise.all(
    devices.map(async (device) => {
      const status = await getDeviceStatus(device.id);
      const getVal = (code: string) =>
        status.find((s) => s.code.includes(code))?.value ?? null;

      return {
        deviceId: device.id,
        deviceName: device.name,
        voltage: getVal("voltage"),
        current: getVal("current"),
        power: getVal("power"),
        energy:
          getVal("energy") ||
          getVal("electricity") ||
          getVal("add_electricity"),
        timestamp: new Date().toISOString(),
        online: device.online,
      };
    })
  );

  return { devices, readings };
}

// Token
export async function getTuyaToken(): Promise<string> {
  const t = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const method = "GET";
  const path = "/v1.0/token?grant_type=1";
  const stringToSign = buildSignString(method, path);
  const signStr = `${TUYA_ACCESS_ID}${t}${nonce}${stringToSign}`;
  const sign = hmacSHA256(TUYA_ACCESS_KEY, signStr);

  const res = await fetch(`${TUYA_API_ENDPOINT}${path}`, {
    method,
    headers: {
      client_id: TUYA_ACCESS_ID,
      sign: sign,
      t: t,
      nonce: nonce,
      sign_method: "HMAC-SHA256",
    },
  });

  const json = (await res.json()) as TuyaApiResponse<{ access_token: string }>;

  if (!json.success) {
    throw new Error(`Erro ao obter token: ${json.msg} (Código: ${json.code})`);
  }

  return json.result.access_token;
}

// Tuya Fetch utilitário genérico
async function tuyaFetch<T>(
  path: string,
  method: "GET" | "POST" = "GET"
): Promise<T> {
  const token = await getTuyaToken();
  const t = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const stringToSign = buildSignString(method, path);
  const signStr = `${TUYA_ACCESS_ID}${token}${t}${nonce}${stringToSign}`;
  const sign = hmacSHA256(TUYA_ACCESS_KEY, signStr);

  const res = await fetch(`${TUYA_API_ENDPOINT}${path}`, {
    method,
    headers: {
      client_id: TUYA_ACCESS_ID,
      access_token: token,
      sign: sign,
      t: t,
      nonce: nonce,
      sign_method: "HMAC-SHA256",
    },
  });

  const json = (await res.json()) as TuyaApiResponse<T>;

  if (!json.success) {
    throw new Error(`Erro na API Tuya: ${json.msg} (Código: ${json.code})`);
  }

  return json.result;
}

// ✅ Funções principais
export async function getAllDevices(): Promise<DeviceInfo[]> {
  if (!TUYA_UID)
    throw new Error("UID da Tuya não definido. Use setTuyaUid(uid).");
  return tuyaFetch<DeviceInfo[]>(`/v1.0/users/${TUYA_UID}/devices`);
}

export async function getDeviceStatus(
  deviceId: string
): Promise<DeviceStatus[]> {
  return tuyaFetch<DeviceStatus[]>(`/v1.0/devices/${deviceId}/status`);
}

export async function getDeviceInfo(deviceId: string): Promise<DeviceInfo> {
  return tuyaFetch<DeviceInfo>(`/v1.0/devices/${deviceId}`);
}
export async function getDeviceIdFromVirtualId(
  idVirtual: string
): Promise<string | null> {
  const token = await getTuyaToken();

  // Buscar UID se ainda não tiver sido setado
  const t = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const method = "GET";
  const path = "/v1.0/users/me";
  const stringToSign = `${method}\n\n\n${path}`;
  const signStr = `${TUYA_ACCESS_ID}${token}${t}${nonce}${stringToSign}`;
  const sign = hmacSHA256(TUYA_ACCESS_KEY, signStr);

  const response = await fetch(`${TUYA_API_ENDPOINT}${path}`, {
    method: "GET",
    headers: {
      client_id: TUYA_ACCESS_ID,
      access_token: token,
      sign: sign,
      t: t,
      nonce: nonce,
      sign_method: "HMAC-SHA256",
    },
  });

  const json = (await response.json()) as TuyaProfileResponse;
  const uid = json?.result?.uid;

  if (!uid) {
    console.error("Não foi possível obter UID Tuya.");
    return null;
  }

  // Definir globalmente
  setTuyaUid(uid);

  // Buscar dispositivos
  const devices = await getAllDevices();
  const device = devices.find((d) => d.uuid === idVirtual);

  return device?.id ?? null;
}
// Função de teste
export async function testConnection() {
  try {
    const devices = await getAllDevices();
    return {
      success: true,
      devices,
      endpoint: TUYA_API_ENDPOINT,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

// ✅ Setter do UID
export function setTuyaUid(uid: string) {
  TUYA_UID = uid;
}
