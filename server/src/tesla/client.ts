import fetch, { RequestInit } from 'node-fetch';
import { loadTokens, saveTokens } from '../auth/tokens.js';
import { refreshAccessToken, isExpired } from '../auth/tesla-oauth.js';
import type { Vehicle, FullVehicleData, CommandResult } from './types.js';

const OWNER_API = 'https://owner-api.teslamotors.com';
const UA = 'TeslaView/1.0 (github.com/THEDONWICK/tesla-view)';

async function getValidToken(): Promise<string> {
  let tokens = loadTokens();
  if (!tokens) throw new Error('Not authenticated');

  if (isExpired(tokens)) {
    tokens = await refreshAccessToken(tokens.refresh_token);
    saveTokens(tokens);
  }

  return tokens.access_token;
}

async function ownerApi<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${OWNER_API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
      ...(opts.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tesla API ${res.status}: ${body}`);
  }

  const json = (await res.json()) as { response: T };
  return json.response;
}

export async function listVehicles(): Promise<Vehicle[]> {
  return ownerApi<Vehicle[]>('/api/1/vehicles');
}

export async function getVehicleData(vehicleId: number): Promise<FullVehicleData> {
  return ownerApi<FullVehicleData>(
    `/api/1/vehicles/${vehicleId}/vehicle_data?endpoints=charge_state%3Bclimate_state%3Bdrive_state%3Bvehicle_state%3Bvehicle_config`
  );
}

export async function wakeUp(vehicleId: number): Promise<{ state: string }> {
  return ownerApi<{ state: string }>(`/api/1/vehicles/${vehicleId}/wake_up`, {
    method: 'POST',
  });
}

export async function sendCommand(
  vehicleId: number,
  command: string,
  body: object = {}
): Promise<CommandResult> {
  return ownerApi<CommandResult>(`/api/1/vehicles/${vehicleId}/command/${command}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getVehicleState(vehicleId: number): Promise<{ state: string }> {
  return ownerApi<{ state: string }>(`/api/1/vehicles/${vehicleId}`);
}
