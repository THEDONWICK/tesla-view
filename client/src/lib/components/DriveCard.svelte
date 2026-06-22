<script lang="ts">
  import type { DriveState } from '../types.js';

  let { drive }: { drive: DriveState } = $props();

  const speedMph = $derived(drive.speed != null ? Math.round(drive.speed) : null);
  const powerKw = $derived(Math.abs(drive.power));
  const isRegen = $derived(drive.power < 0);
  const gear = $derived(drive.shift_state ?? 'P');
  const gears = ['P', 'R', 'N', 'D'];

  function compassHeading(deg: number): string {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }
</script>

<div class="card">
  <div class="card-header">
    <span class="card-label">DRIVE</span>
    <span class="gear-state" class:driving={gear === 'D' || gear === 'R'}>
      {gear === 'D' ? 'DRIVING' : gear === 'R' ? 'REVERSE' : gear === 'N' ? 'NEUTRAL' : 'PARKED'}
    </span>
  </div>

  <div class="drive-main">
    <div class="speed-block">
      {#if speedMph != null && speedMph > 0}
        <div class="speed-val">{speedMph}</div>
        <div class="speed-unit">mph</div>
      {:else}
        <div class="speed-val dim">0</div>
        <div class="speed-unit">mph</div>
      {/if}
    </div>

    <div class="gear-strip">
      {#each gears as g}
        <div class="gear-pip" class:active={gear === g}>{g}</div>
      {/each}
    </div>
  </div>

  {#if drive.power !== 0}
    <div class="power-row">
      <span class="power-label">{isRegen ? '↓ REGEN' : '↑ POWER'}</span>
      <div class="power-bar-wrap">
        <div
          class="power-bar"
          class:regen={isRegen}
          style="width: {Math.min(100, (powerKw / 300) * 100)}%"
        ></div>
      </div>
      <span class="power-val">{powerKw} kW</span>
    </div>
  {/if}

  <div class="gps-row">
    {#if drive.latitude && drive.longitude}
      <span class="gps-item">📍 {drive.latitude.toFixed(4)}, {drive.longitude.toFixed(4)}</span>
    {/if}
    <span class="gps-item">{compassHeading(drive.heading)} {drive.heading}°</span>
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

  .gear-state {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .gear-state.driving {
    color: var(--green);
    background: rgba(0,212,170,0.1);
    border-color: var(--green-dim);
  }

  .drive-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .speed-block {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
  }

  .speed-val {
    font-size: 3.5rem;
    font-weight: 200;
    color: var(--text-primary);
    line-height: 1;
  }

  .speed-val.dim { color: var(--text-muted); }

  .speed-unit {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 400;
    padding-bottom: 0.5rem;
  }

  .gear-strip {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .gear-pip {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    letter-spacing: 0.05em;
  }

  .gear-pip.active {
    background: var(--red);
    border-color: var(--red);
    color: white;
    box-shadow: 0 0 12px rgba(232,33,39,0.4);
  }

  .power-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .power-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    flex-shrink: 0;
    width: 60px;
  }

  .power-bar-wrap {
    flex: 1;
    height: 4px;
    background: var(--surface-3);
    border-radius: 2px;
    overflow: hidden;
  }

  .power-bar {
    height: 100%;
    background: var(--red);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .power-bar.regen {
    background: var(--green);
  }

  .power-val {
    font-size: 0.7rem;
    color: var(--text-secondary);
    flex-shrink: 0;
    width: 48px;
    text-align: right;
  }

  .gps-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .gps-item {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: 'Courier New', monospace;
  }
</style>
