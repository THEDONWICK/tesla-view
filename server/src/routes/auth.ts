import { Router, Request, Response } from 'express';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  buildAuthUrl,
} from '../auth/pkce.js';
import { exchangeCodeForTokens } from '../auth/tesla-oauth.js';
import { saveTokens, loadTokens, clearTokens } from '../auth/tokens.js';
import { listVehicles } from '../tesla/client.js';
import { startPoller } from '../tesla/poller.js';
import { getIO } from '../socket/index.js';

const router = Router();

const pendingAuth: Map<string, { verifier: string; state: string }> = new Map();

router.get('/auth/start', (_req: Request, res: Response) => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();

  pendingAuth.set(state, { verifier, state });
  setTimeout(() => pendingAuth.delete(state), 10 * 60_000);

  const authUrl = buildAuthUrl(challenge, state);
  res.json({ authUrl, state });
});

router.post('/auth/exchange', async (req: Request, res: Response) => {
  const { callbackUrl, state } = req.body as { callbackUrl: string; state: string };

  const pending = pendingAuth.get(state);
  if (!pending) {
    res.status(400).json({ error: 'Unknown or expired state. Restart the login flow.' });
    return;
  }

  let code: string;
  try {
    const url = new URL(callbackUrl);
    const extractedCode = url.searchParams.get('code');
    if (!extractedCode) throw new Error('No code in URL');
    code = extractedCode;
  } catch {
    res.status(400).json({ error: 'Invalid callback URL. Paste the full URL from your browser.' });
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code, pending.verifier);
    saveTokens(tokens);
    pendingAuth.delete(state);

    const vehicles = await listVehicles();
    if (vehicles.length > 0) {
      const v = vehicles[0];
      startPoller(v.id, (event, data) => getIO().emit(event, data));
    }

    res.json({ ok: true, vehicles });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Auth failed' });
  }
});

router.get('/auth/status', (_req: Request, res: Response) => {
  const tokens = loadTokens();
  res.json({ authenticated: !!tokens });
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  clearTokens();
  res.json({ ok: true });
});

export default router;
