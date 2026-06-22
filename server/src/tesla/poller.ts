import { getVehicleData, wakeUp, getVehicleState } from './client.js';
import { cacheVehicleData } from '../auth/tokens.js';
import type { FullVehicleData } from './types.js';

type StateEmitter = (event: string, data: unknown) => void;

interface PollState {
  vehicleId: number;
  timer: ReturnType<typeof setTimeout> | null;
  lastData: FullVehicleData | null;
  consecutiveSleepCount: number;
  emit: StateEmitter;
}

const state: PollState = {
  vehicleId: 0,
  timer: null,
  lastData: null,
  consecutiveSleepCount: 0,
  emit: () => {},
};

const POLL_ONLINE_MS = 30_000;
const POLL_ASLEEP_MS = 5 * 60_000;
const POLL_OFFLINE_MS = 10 * 60_000;

export function startPoller(vehicleId: number, emit: StateEmitter): void {
  state.vehicleId = vehicleId;
  state.emit = emit;
  state.consecutiveSleepCount = 0;
  scheduleNext(2_000);
}

export function stopPoller(): void {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

export function getLastData(): FullVehicleData | null {
  return state.lastData;
}

function scheduleNext(delayMs: number): void {
  if (state.timer) clearTimeout(state.timer);
  state.timer = setTimeout(poll, delayMs);
}

async function poll(): Promise<void> {
  if (!state.vehicleId) return;

  try {
    const raw = await getVehicleState(state.vehicleId);
    const vehicleStateStr = raw.state;

    if (vehicleStateStr === 'asleep' || vehicleStateStr === 'offline') {
      state.consecutiveSleepCount++;
      state.emit('vehicle:state', { state: vehicleStateStr });
      const delay = vehicleStateStr === 'offline' ? POLL_OFFLINE_MS : POLL_ASLEEP_MS;
      scheduleNext(delay);
      return;
    }

    state.consecutiveSleepCount = 0;

    const data = await getVehicleData(state.vehicleId);
    state.lastData = data;
    cacheVehicleData(data.vin, data);
    state.emit('vehicle:data', data);
    scheduleNext(POLL_ONLINE_MS);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[poller]', message);
    state.emit('vehicle:error', { message });
    scheduleNext(POLL_OFFLINE_MS);
  }
}
