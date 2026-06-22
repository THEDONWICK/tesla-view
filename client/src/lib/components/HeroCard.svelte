<script lang="ts">
  import type { FullVehicleData } from '../types.js';
  import { connectionStatus, vehicleStatus } from '../stores.js';

  let { vehicle }: { vehicle: FullVehicleData } = $props();

  const connStatus = $derived($connectionStatus);
  const carStatus = $derived($vehicleStatus);

  const odometer = $derived(Math.round(vehicle.vehicle_state.odometer).toLocaleString());
  const firmware = $derived(vehicle.vehicle_state.car_version);
  const name = $derived(vehicle.display_name || 'Model Y');

  const statusColor = $derived(
    carStatus === 'online' ? 'var(--green)'
    : carStatus === 'asleep' ? 'var(--amber)'
    : 'var(--text-muted)'
  );

  const statusLabel = $derived(
    carStatus === 'online' ? 'Online'
    : carStatus === 'asleep' ? 'Asleep'
    : carStatus === 'waking' ? 'Waking…'
    : 'Offline'
  );

  const softwareUpdate = $derived(
    vehicle.vehicle_state.software_update?.status === 'available'
    ? vehicle.vehicle_state.software_update.version
    : null
  );
</script>

<div class="hero">
  <div class="hero-left">
    <div class="car-name">{name}</div>
    <div class="car-sub">MODEL Y · LONG RANGE · DUAL MOTOR</div>
    <div class="vin">{vehicle.vin}</div>

    <div class="meta-row">
      <div class="meta-item">
        <span class="meta-val">{odometer}</span>
        <span class="meta-label">MILES</span>
      </div>
      <div class="meta-sep"></div>
      <div class="meta-item">
        <span class="meta-val fw">{firmware}</span>
        <span class="meta-label">SOFTWARE</span>
      </div>
    </div>

    {#if softwareUpdate}
      <div class="update-pill">⬆ Update available: {softwareUpdate}</div>
    {/if}
  </div>

  <div class="hero-right">
    <div class="status-ring" style="--color: {statusColor}">
      <div class="status-inner">
        <div class="status-dot" style="background: {statusColor}"></div>
        <span class="status-text" style="color: {statusColor}">{statusLabel}</span>
      </div>
    </div>

    <div class="conn-row">
      <span class="conn-dot" class:ok={connStatus === 'connected'}></span>
      <span class="conn-label">
        {connStatus === 'connected' ? 'Live' : connStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}
      </span>
    </div>
  </div>
</div>

<style>
  .hero {
    background: linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--red) 0%, transparent 60%);
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .car-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .car-sub {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--text-muted);
  }

  .vin {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: 'Courier New', monospace;
    letter-spacing: 0.05em;
    margin-top: 0.1rem;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .meta-val {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
  }

  .meta-val.fw {
    font-size: 0.8rem;
    font-family: 'Courier New', monospace;
  }

  .meta-label {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .meta-sep {
    width: 1px;
    height: 28px;
    background: var(--border);
  }

  .update-pill {
    font-size: 0.65rem;
    color: var(--blue);
    background: rgba(74,163,232,0.1);
    border: 1px solid rgba(74,163,232,0.3);
    border-radius: 100px;
    padding: 0.2rem 0.6rem;
    display: inline-flex;
    width: fit-content;
    margin-top: 0.25rem;
  }

  .hero-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .status-ring {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--color, var(--text-muted));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px color-mix(in srgb, var(--color, transparent) 20%, transparent);
    transition: all 0.3s ease;
  }

  .status-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: background 0.3s ease;
  }

  .status-text {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    transition: color 0.3s ease;
  }

  .conn-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .conn-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: background 0.3s;
  }

  .conn-dot.ok { background: var(--green); }

  .conn-label {
    font-size: 0.6rem;
    color: var(--text-muted);
    font-weight: 500;
  }
</style>
