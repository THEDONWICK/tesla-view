import fetch from 'node-fetch';

const TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';

export interface TeslaTokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  obtained_at: number;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TeslaTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'ownerapi',
      code,
      code_verifier: codeVerifier,
      redirect_uri: 'https://auth.tesla.com/void/callback',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as Omit<TeslaTokens, 'obtained_at'>;
  return { ...data, obtained_at: Date.now() };
}

export async function refreshAccessToken(refreshToken: string): Promise<TeslaTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'ownerapi',
      refresh_token: refreshToken,
      scope: 'openid email offline_access',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as Omit<TeslaTokens, 'obtained_at'>;
  return { ...data, obtained_at: Date.now() };
}

export function isExpired(tokens: TeslaTokens, bufferSeconds = 300): boolean {
  const expiresAt = tokens.obtained_at + tokens.expires_in * 1000;
  return Date.now() > expiresAt - bufferSeconds * 1000;
}
