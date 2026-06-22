<script lang="ts">
  import type { VehicleStateData } from '../types.js';
  import { sendCommand } from '../socket.js';
  import { showFeedback } from '../stores.js';

  let { vs, vehicleId }: { vs: VehicleStateData; vehicleId: number } = $props();

  let busy = $state(false);

  const frontLeft = $derived(vs.df === 1);
  const frontRight = $derived(vs.pf === 1);
  const rearLeft = $derived(vs.dr === 1);
  const rearRight = $derived(vs.pr === 1);
  const frunk = $derived(vs.ft === 1);
  const trunk = $derived(vs.rt === 1);
  const anyOpen = $derived(frontLeft || frontRight || rearLeft || rearRight || frunk || trunk);

  const windowMap = $derived([
    { label: 'FL', val: vs.fd_window },
    { label: 'FR', val: vs.fp_window },
    { label: 'RL', val: vs.rd_window },
    { label: 'RR', val: vs.rp_window },
  ]);
  const anyWindowOpen = $derived(windowMap.some(w => w.val > 0));

  async function toggleLock() {
    busy = true;
    try {
      const cmd = vs.locked ? 'door_unlock' : 'door_lock';
      const r = await sendCommand(vehicleId, cmd);
      showFeedback(r.result ? (vs.locked ? 'Unlocked' : 'Locked') : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }

  async function toggleSentry() {
    busy = true;
    try {
      const r = await sendCommand(vehicleId, 'set_sentry_mode', { on: !vs.sentry_mode });
      showFeedback(r.result ? (vs.sentry_mode ? 'Sentry off' : 'Sentry on') : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }

  async function ventWindows() {
    busy = true;
    try {
      const r = await sendCommand(vehicleId, 'window_control', { command: 'vent', lat: 0, lon: 0 });
      showFeedback(r.result ? 'Windows vented' : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }

  async function closeWindows() {
    busy = true;
    try {
      const r = await sendCommand(vehicleId, 'window_control', { command: 'close', lat: 0, lon: 0 });
      showFeedback(r.result ? 'Windows closed' : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }
</script>

<div class="card">
  <div class="card-header">
    <span class="card-label">SECURITY</span>
    <span class="lock-state" class:locked={vs.locked}>
      {vs.locked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
    </span>
  </div>

  <div class="car-diagram">
    <div class="door-grid">
      <div class="door" class:open={frontLeft}>FL {frontLeft ? '○' : '●'}</div>
      <div class="door" class:open={frontRight}>FR {frontRight ? '○' : '●'}</div>
      <div class="door" class:open={rearLeft}>RL {rearLeft ? '○' : '●'}</div>
      <div class="door" class:open={rearRight}>RR {rearRight ? '○' : '●'}</div>
    </div>
    <div class="trunk-row">
      <span class="trunk-item" class:open={frunk}>Frunk {frunk ? 'OPEN' : 'CLOSED'}</span>
      <span class="trunk-item" class:open={trunk}>Trunk {trunk ? 'OPEN' : 'CLOSED'}</span>
    </div>
  </div>

  {#if anyWindowOpen}
    <div class="window-alert">⚠ Window open — {windowMap.filter(w => w.val > 0).map(w => w.label).join(', ')}</div>
  {/if}

  <div class="actions">
    <button class="action-btn" class:active-red={!vs.locked} onclick={toggleLock} disabled={busy}>
      {vs.locked ? '🔓 Unlock' : '🔒 Lock'}
    </button>
    <button class="action-btn" class:active-amber={vs.sentry_mode} onclick={toggleSentry} disabled={busy}>
      {vs.sentry_mode ? '👁 Sentry On' : '○ Sentry'}
    </button>
  </div>

  <div class="window-actions">
    <button class="action-btn-sm" onclick={ventWindows} disabled={busy}>Vent Windows</button>
    <button class="action-btn-sm" onclick={closeWindows} disabled={busy || !anyWindowOpen}>Close Windows</button>
  </div>
</div>

<style>
  .card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .lock-state {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--green);
  }

  .lock-state:not(.locked) {
    color: var(--amber);
  }

  .door-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
  }

  .door {
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }

  .door.open {
    background: rgba(245,166,35,0.1);
    border-color: var(--amber);
    color: var(--amber);
  }

  .trunk-row {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 0.25rem;
  }

  .trunk-item {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  .trunk-item.open {
    color: var(--amber);
  }

  .car-diagram { display: flex; flex-direction: column; gap: 0.4rem; }

  .window-alert {
    font-size: 0.7rem;
    color: var(--amber);
    background: rgba(245,166,35,0.1);
    border: 1px solid rgba(245,166,35,0.3);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.75rem;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .action-btn {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.6rem 0.5rem;
    border-radius: var(--radius-sm);
    transition: all 0.15s;
  }

  .action-btn:hover:not(:disabled) {
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  .action-btn.active-red {
    background: rgba(232,33,39,0.1);
    border-color: var(--red);
    color: var(--red);
  }

  .action-btn.active-amber {
    background: rgba(245,166,35,0.1);
    border-color: var(--amber);
    color: var(--amber);
  }

  .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .window-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .action-btn-sm {
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.4rem 0.5rem;
    border-radius: var(--radius-sm);
    transition: all 0.15s;
  }

  .action-btn-sm:hover:not(:disabled) {
    border-color: var(--border);
    color: var(--text-secondary);
  }

  .action-btn-sm:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
