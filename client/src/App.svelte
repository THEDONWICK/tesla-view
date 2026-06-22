<script lang="ts">
  import { onMount } from 'svelte';
  import { getSocket, startPolling } from './lib/socket.js';
  import { vehicleData, connectionStatus } from './lib/stores.js';
  import SetupFlow from './lib/components/SetupFlow.svelte';
  import HeroCard from './lib/components/HeroCard.svelte';
  import BatteryCard from './lib/components/BatteryCard.svelte';
  import ClimateCard from './lib/components/ClimateCard.svelte';
  import SecurityCard from './lib/components/SecurityCard.svelte';
  import DriveCard from './lib/components/DriveCard.svelte';
  import QuickActions from './lib/components/QuickActions.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';

  let authenticated = $state<boolean | null>(null);
  let vehicleId = $state<number | null>(null);

  const data = $derived($vehicleData);

  onMount(async () => {
    const res = await fetch('/api/auth/status');
    const { authenticated: auth } = await res.json();
    authenticated = auth;

    if (auth) {
      getSocket();
      const vres = await fetch('/api/vehicles');
      if (vres.ok) {
        const { vehicles } = await vres.json();
        if (vehicles?.length) {
          vehicleId = vehicles[0].id;
          startPolling(vehicleId!);
        }
      }
    }
  });
</script>

{#if authenticated === null}
  <div class="loading">
    <div class="spinner-lg"></div>
  </div>

{:else if !authenticated}
  <SetupFlow />

{:else if data}
  <div class="dashboard">
    <header class="top-bar">
      <div class="logo-mark">
        <span class="t">T</span>
        <span class="brand-text">TESLA VIEW</span>
      </div>
      <div class="last-update">
        Updated {new Date(data.vehicle_state.timestamp * 1000).toLocaleTimeString()}
      </div>
    </header>

    <main class="grid">
      <div class="span-2">
        <HeroCard vehicle={data} />
      </div>

      <BatteryCard charge={data.charge_state} />
      <ClimateCard climate={data.climate_state} vehicleId={data.id} />
      <SecurityCard vs={data.vehicle_state} vehicleId={data.id} />
      <DriveCard drive={data.drive_state} />
      <QuickActions vehicleId={data.id} />

      <div class="tpms-card">
        <div class="card-label">TIRE PRESSURE</div>
        <div class="tpms-grid">
          {#each [
            { pos: 'FL', val: data.vehicle_state.tpms_pressure_fl },
            { pos: 'FR', val: data.vehicle_state.tpms_pressure_fr },
            { pos: 'RL', val: data.vehicle_state.tpms_pressure_rl },
            { pos: 'RR', val: data.vehicle_state.tpms_pressure_rr },
          ] as t}
            <div class="tpms-item" class:warn={t.val != null && t.val < 2.5}>
              <span class="tpms-pos">{t.pos}</span>
              <span class="tpms-val">{t.val != null ? (t.val * 14.504).toFixed(0) : '—'}</span>
              <span class="tpms-unit">psi</span>
            </div>
          {/each}
        </div>
      </div>
    </main>
  </div>

{:else}
  <div class="loading">
    <div class="spinner-lg"></div>
    <p class="loading-text">Fetching vehicle data…</p>
  </div>
{/if}

<StatusBar />

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
  }

  .loading-text {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  .spinner-lg {
    width: 40px;
    height: 40px;
    border: 2px solid var(--surface-3);
    border-top-color: var(--red);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .dashboard {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--surface-1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo-mark {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .t {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--red);
    color: white;
    font-size: 0.85rem;
    font-weight: 800;
    border-radius: 6px;
  }

  .brand-text {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
  }

  .last-update {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: 'Courier New', monospace;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.25rem;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
  }

  @media (min-width: 900px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .span-2 {
    grid-column: 1 / -1;
  }

  .tpms-card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .card-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .tpms-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .tpms-item {
    background: var(--surface-2);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.6rem;
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .tpms-item.warn {
    background: rgba(232,33,39,0.1);
    border-color: var(--red-dim);
  }

  .tpms-pos {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    width: 20px;
    letter-spacing: 0.04em;
  }

  .tpms-val {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
  }

  .tpms-unit {
    font-size: 0.6rem;
    color: var(--text-muted);
  }
</style>
