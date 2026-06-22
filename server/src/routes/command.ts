import { Router, Request, Response } from 'express';
import { sendCommand, wakeUp } from '../tesla/client.js';

const router = Router();

const ALLOWED_COMMANDS = new Set([
  'door_lock',
  'door_unlock',
  'flash_lights',
  'honk_horn',
  'auto_conditioning_start',
  'auto_conditioning_stop',
  'set_temps',
  'charge_port_door_open',
  'charge_port_door_close',
  'set_charge_limit',
  'charge_start',
  'charge_stop',
  'set_sentry_mode',
  'window_control',
  'actuate_trunk',
  'remote_start_drive',
  'set_seat_heater',
  'set_steering_wheel_heater',
  'schedule_software_update',
]);

router.post('/vehicles/:id/wake', async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id, 10);
  if (isNaN(vehicleId)) {
    res.status(400).json({ error: 'Invalid vehicle ID' });
    return;
  }

  try {
    const result = await wakeUp(vehicleId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Wake failed' });
  }
});

router.post('/vehicles/:id/command/:cmd', async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id, 10);
  const { cmd } = req.params;

  if (isNaN(vehicleId)) {
    res.status(400).json({ error: 'Invalid vehicle ID' });
    return;
  }

  if (!ALLOWED_COMMANDS.has(cmd)) {
    res.status(403).json({ error: `Command '${cmd}' not permitted` });
    return;
  }

  try {
    const result = await sendCommand(vehicleId, cmd, req.body ?? {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Command failed' });
  }
});

export default router;
