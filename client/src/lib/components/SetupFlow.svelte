<script lang="ts">
  let step: 'start' | 'waiting' | 'paste' | 'done' = $state('start');
  let authUrl = $state('');
  let authState = $state('');
  let callbackUrl = $state('');
  let error = $state('');
  let loading = $state(false);

  async function startAuth() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/auth/start');
      const data = await res.json();
      authUrl = data.authUrl;
      authState = data.state;
      step = 'waiting';
    } catch (e) {
      error = 'Could not reach server.';
    }
    loading = false;
  }

  function openTesla() {
    window.open(authUrl, '_blank');
    step = 'paste';
  }

  async function exchangeToken() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackUrl, state: authState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      step = 'done';
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Authentication failed.';
    }
    loading = false;
  }
</script>

<div class="setup">
  <div class="logo">
    <span class="t-mark">T</span>
    <span class="brand">TESLA VIEW</span>
  </div>

  {#if step === 'start'}
    <div class="card">
      <h2>Connect Your Tesla</h2>
      <p>Sign in with your Tesla account to connect your vehicle. No developer registration required — uses your existing Tesla credentials.</p>
      <button class="btn-primary" onclick={startAuth} disabled={loading}>
        {loading ? 'Starting…' : 'Connect Tesla Account'}
      </button>
    </div>

  {:else if step === 'waiting'}
    <div class="card">
      <h2>Open Tesla Login</h2>
      <p>Click below to open Tesla's sign-in page. Log in, and Tesla will redirect you to a blank page. Copy that page's URL and come back here.</p>
      <button class="btn-primary" onclick={openTesla}>Open Tesla Login →</button>
    </div>

  {:else if step === 'paste'}
    <div class="card">
      <h2>Paste the Callback URL</h2>
      <p>After signing in, you'll see a blank page. Copy the full URL from your browser's address bar and paste it below.</p>
      <p class="hint">The URL looks like: <code>https://auth.tesla.com/void/callback?code=…</code></p>
      <textarea
        bind:value={callbackUrl}
        placeholder="https://auth.tesla.com/void/callback?code=…&state=…"
        rows="3"
      ></textarea>
      {#if error}<p class="error">{error}</p>{/if}
      <button
        class="btn-primary"
        onclick={exchangeToken}
        disabled={loading || !callbackUrl.trim()}
      >
        {loading ? 'Connecting…' : 'Connect Vehicle'}
      </button>
    </div>

  {:else if step === 'done'}
    <div class="card success">
      <div class="check">✓</div>
      <h2>Connected</h2>
      <p>Loading your dashboard…</p>
    </div>
  {/if}

  {#if error && step !== 'paste'}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    gap: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .t-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--red);
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: var(--radius-sm);
  }

  .brand {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--text-primary);
  }

  .card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card.success {
    align-items: center;
    text-align: center;
    border-color: var(--green);
  }

  .check {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--green-dim);
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 0.875rem;
  }

  .hint {
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
  }

  code {
    color: var(--green);
    font-size: 0.8rem;
    font-family: 'Courier New', monospace;
  }

  textarea {
    width: 100%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    padding: 0.75rem;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }

  textarea:focus {
    border-color: var(--red);
  }

  .btn-primary {
    background: var(--red);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-sm);
    transition: background 0.15s, opacity 0.15s;
    width: 100%;
  }

  .btn-primary:hover:not(:disabled) {
    background: #cc1d22;
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .error {
    color: var(--red);
    font-size: 0.8rem;
    background: rgba(232,33,39,0.1);
    border: 1px solid rgba(232,33,39,0.2);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
  }
</style>
