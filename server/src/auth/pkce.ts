import crypto from 'crypto';

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function buildAuthUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: 'ownerapi',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    locale: 'en-US',
    prompt: 'login',
    redirect_uri: 'https://auth.tesla.com/void/callback',
    response_type: 'code',
    scope: 'openid email offline_access',
    state,
  });
  return `https://auth.tesla.com/oauth2/v3/authorize?${params.toString()}`;
}
