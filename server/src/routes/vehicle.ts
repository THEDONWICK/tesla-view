import { Router, Request, Response } from 'express';
import { listVehicles, getVehicleData } from '../tesla/client.js';
import { getLastData } from '../tesla/poller.js';
import { getCachedVehicleData } from '../auth/tokens.js';

const router = Router();

router.get('/vehicles', async (_req: Request, res: Response) => {
  try {
    const vehicles = await listVehicles();
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list vehicles' });
  }
});

router.get('/vehicles/:id/data', async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id, 10);
  if (isNaN(vehicleId)) {
    res.status(400).json({ error: 'Invalid vehicle ID' });
    return;
  }

  const cached = getLastData();
  if (cached && cached.id === vehicleId) {
    res.json({ data: cached, source: 'live' });
    return;
  }

  try {
    const data = await getVehicleData(vehicleId);
    res.json({ data, source: 'fresh' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to get vehicle data';
    const cachedDb = getCachedVehicleData(req.params.id);
    if (cachedDb) {
      res.json({ data: cachedDb, source: 'cache', warning: msg });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

export default router;
