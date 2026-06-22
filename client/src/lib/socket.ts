import { io, Socket } from 'socket.io-client';
import { vehicleData, vehicleStatus, connectionStatus } from './stores.js';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io', transports: ['websocket'] });

    socket.on('connect', () => {
      connectionStatus.set('connected');
    });

    socket.on('disconnect', () => {
      connectionStatus.set('disconnected');
    });

    socket.on('vehicle:data', (data) => {
      vehicleData.set(data);
      vehicleStatus.set(data.state ?? 'online');
    });

    socket.on('vehicle:state', ({ state }: { state: string }) => {
      vehicleStatus.set(state);
    });

    socket.on('vehicle:error', ({ message }: { message: string }) => {
      console.warn('[socket] vehicle error:', message);
    });
  }
  return socket;
}

export function startPolling(vehicleId: number): void {
  getSocket().emit('poll:start', vehicleId);
}

export function sendCommand(
  vehicleId: number,
  command: string,
  params?: Record<string, unknown>
): Promise<{ result: boolean; reason: string }> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    s.emit('command', { vehicleId, command, params });

    const onResult = (data: { command: string; result: boolean; reason: string }) => {
      if (data.command === command) {
        s.off('command:result', onResult);
        s.off('command:error', onError);
        resolve(data);
      }
    };

    const onError = (data: { command: string; message: string }) => {
      if (data.command === command) {
        s.off('command:result', onResult);
        s.off('command:error', onError);
        reject(new Error(data.message));
      }
    };

    s.on('command:result', onResult);
    s.on('command:error', onError);

    setTimeout(() => {
      s.off('command:result', onResult);
      s.off('command:error', onError);
      reject(new Error('Command timed out'));
    }, 15_000);
  });
}

export function wakeVehicle(vehicleId: number): void {
  getSocket().emit('wake', vehicleId);
}
