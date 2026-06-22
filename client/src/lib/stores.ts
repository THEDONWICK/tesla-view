import { writable, derived } from 'svelte/store';
import type { FullVehicleData } from './types.js';

export const vehicleData = writable<FullVehicleData | null>(null);
export const vehicleStatus = writable<string>('unknown');
export const connectionStatus = writable<'connected' | 'disconnected' | 'connecting'>('connecting');
export const commandFeedback = writable<{ message: string; ok: boolean } | null>(null);

export const isOnline = derived(vehicleStatus, ($s) => $s === 'online');
export const isAsleep = derived(vehicleStatus, ($s) => $s === 'asleep');
export const isCharging = derived(vehicleData, ($d) => $d?.charge_state?.charging_state === 'Charging');
export const isLocked = derived(vehicleData, ($d) => $d?.vehicle_state?.locked ?? true);
export const sentryOn = derived(vehicleData, ($d) => $d?.vehicle_state?.sentry_mode ?? false);
export const batteryLevel = derived(vehicleData, ($d) => $d?.charge_state?.battery_level ?? 0);
export const batteryRange = derived(vehicleData, ($d) => Math.round($d?.charge_state?.battery_range ?? 0));
export const insideTemp = derived(vehicleData, ($d) => $d?.climate_state?.inside_temp ?? null);
export const outsideTemp = derived(vehicleData, ($d) => $d?.climate_state?.outside_temp ?? null);
export const climateOn = derived(vehicleData, ($d) => $d?.climate_state?.is_climate_on ?? false);

let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

export function showFeedback(message: string, ok: boolean): void {
  if (feedbackTimer) clearTimeout(feedbackTimer);
  commandFeedback.set({ message, ok });
  feedbackTimer = setTimeout(() => commandFeedback.set(null), 3000);
}
