import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { startPoller, stopPoller, getLastData } from '../tesla/poller.js';
import { sendCommand, wakeUp } from '../tesla/client.js';
import { loadTokens } from '../auth/tokens.js';

let io: IOServer;
let activeVehicleId: number | null = null;

export function initSocket(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('[socket] client connected', socket.id);

    const last = getLastData();
    if (last) socket.emit('vehicle:data', last);

    socket.on('poll:start', (vehicleId: number) => {
      activeVehicleId = vehicleId;
      startPoller(vehicleId, (event, data) => io.emit(event, data));
    });

    socket.on('poll:stop', () => {
      stopPoller();
    });

    socket.on('command', async ({ vehicleId, command, params }: {
      vehicleId: number;
      command: string;
      params?: Record<string, unknown>;
    }) => {
      try {
        const result = await sendCommand(vehicleId, command, params ?? {});
        socket.emit('command:result', { command, ...result });
      } catch (err) {
        socket.emit('command:error', {
          command,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    });

    socket.on('wake', async (vehicleId: number) => {
      try {
        const res = await wakeUp(vehicleId);
        socket.emit('wake:result', res);
        if (res.state === 'online') {
          startPoller(vehicleId, (event, data) => io.emit(event, data));
        }
      } catch (err) {
        socket.emit('wake:error', { message: err instanceof Error ? err.message : String(err) });
      }
    });

    socket.on('disconnect', () => {
      console.log('[socket] client disconnected', socket.id);
    });
  });

  return io;
}

export function getIO(): IOServer {
  return io;
}
