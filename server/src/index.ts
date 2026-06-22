import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, loadTokens } from './auth/tokens.js';
import { initSocket } from './socket/index.js';
import { startPoller } from './tesla/poller.js';
import { listVehicles } from './tesla/client.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicle.js';
import commandRoutes from './routes/command.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT ?? '4895', 10);

initDb();

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', vehicleRoutes);
app.use('/api', commandRoutes);

const staticDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({ status: 'Tesla-View API running', note: 'Frontend not built yet — run npm run build in /client' });
  });
}

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`[tesla-view] running on http://0.0.0.0:${PORT}`);

  const tokens = loadTokens();
  if (tokens) {
    try {
      const vehicles = await listVehicles();
      if (vehicles.length > 0) {
        const v = vehicles[0];
        console.log(`[tesla-view] auto-starting poller for ${v.display_name} (${v.vin})`);
        startPoller(v.id, (event, data) => io.emit(event, data));
      }
    } catch (err) {
      console.warn('[tesla-view] could not auto-start poller:', err instanceof Error ? err.message : err);
    }
  } else {
    console.log('[tesla-view] not authenticated — visit the dashboard to connect your Tesla');
  }
});
