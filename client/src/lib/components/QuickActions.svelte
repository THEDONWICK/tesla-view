<script lang="ts">
  import { sendCommand, wakeVehicle } from '../socket.js';
  import { showFeedback, vehicleStatus } from '../stores.js';

  let { vehicleId }: { vehicleId: number } = $props();

  let busy = $state<string | null>(null);
  const status = $derived($vehicleStatus);

  async function run(label: string, cmd: string, params: Record<string, unknown> | undefined = undefined) {
    busy = cmd;
    try {
      const r = await sendCommand(vehicleId, cmd, params);
      showFeedback(r.result ? `${label} ✓` : (r.reason || `${label} failed`), r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = null;
  }

  function wake() {
    busy = 'wake';
    wakeVehicle(vehicleId);
    showFeedback('Wake command sent…', true);
    setTimeout(() => { if (busy === 'wake') busy = null; }, 5000);
  }

  const actions: { label: string; icon: string; cmd?: string; params?: Record<string, unknown>; special?: string; color?: string }[] = [
    { label: 'Flash', icon: '⚡', cmd: 'flash_lights' },
    { label: 'Honk', icon: '📢', cmd: 'honk_horn' },
    { label: 'Wake', icon: '☀️', special: 'wake' },
    { label: 'Sentry', icon: '👁', cmd: 'set_sentry_mode', params: { on: true } },
    { label: 'Vent', icon: '🌬', cmd: 'window_control', params: { command: 'vent', lat: 0, lon: 0 } },
    { label: 'Charge Port', icon: '🔌', cmd: 'charge_port_door_open' },
  ];
</script>

<div class="card">
  <div class="card-header">
    <span class="card-label">QUICK ACTIONS</span>
    {#if status === 'asleep'}
      <span class="sleeping-badge">😴 ASLEEP</span>
    {/if}
  </div>

  <div class="action-grid">
    {#each actions as a}
      <button
        class="action"
        class:sleeping={status === 'asleep' && a.special !== 'wake'}
        disabled={busy !== null}
        onclick={() => {
          if (a.special === 'wake') wake();
          else if (a.cmd) run(a.label, a.cmd, a.params);
        }}
      >
        <span class="action-icon">{a.icon}</span>
        <span class="action-label">{a.label}</span>
        {#if busy === (a.special ?? a.cmd)}
          <span class="spinner"></span>
        {/if}
      </button>
    {/each}
  </div>

  {#if status === 'asleep'}
    <p class="sleep-note">Car is asleep. Most commands require waking first.</p>
  {/if}
</div>

<style>
  .card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  .sleeping-badge {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--amber);
    letter-spacing: 0.06em;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.875rem 0.5rem;
    position: relative;
    transition: all 0.15s;
  }

  .action:hover:not(:disabled):not(.sleeping) {
    background: var(--surface-3);
    border-color: var(--text-muted);
  }

  .action:disabled { cursor: not-allowed; }

  .action.sleeping {
    opacity: 0.35;
  }

  .action-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .action-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  .spinner {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    border: 1px solid var(--text-muted);
    border-top-color: var(--red);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .sleep-note {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-align: center;
  }
</style>
