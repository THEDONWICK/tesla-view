<script lang="ts">
  import type { ClimateState } from '../types.js';
  import { sendCommand } from '../socket.js';
  import { showFeedback } from '../stores.js';

  let { climate, vehicleId }: { climate: ClimateState; vehicleId: number } = $props();

  const cToF = (c: number) => Math.round(c * 9 / 5 + 32);

  const inside = $derived(climate.inside_temp != null ? cToF(climate.inside_temp) : null);
  const outside = $derived(climate.outside_temp != null ? cToF(climate.outside_temp) : null);
  const driverSetF = $derived(cToF(climate.driver_temp_setting));

  let busy = $state(false);

  async function toggleClimate() {
    busy = true;
    try {
      const cmd = climate.is_climate_on ? 'auto_conditioning_stop' : 'auto_conditioning_start';
      const r = await sendCommand(vehicleId, cmd);
      showFeedback(r.result ? (climate.is_climate_on ? 'Climate off' : 'Climate on') : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }

  async function setSeat(side: string, level: number) {
    busy = true;
    try {
      const r = await sendCommand(vehicleId, 'set_seat_heater', { heater: side, level });
      showFeedback(r.result ? `Seat heater set` : r.reason, r.result);
    } catch (e) {
      showFeedback(e instanceof Error ? e.message : 'Failed', false);
    }
    busy = false;
  }
</script>

<div class="card">
  <div class="card-header">
    <span class="card-label">CLIMATE</span>
    <span class="status-dot" class:on={climate.is_climate_on}>
      {climate.is_climate_on ? 'ON' : 'OFF'}
    </span>
  </div>

  <div class="temps">
    <div class="temp-block">
      {#if inside != null}
        <div class="temp-val">{inside}°</div>
        <div class="temp-label">INSIDE</div>
      {:else}
        <div class="temp-val dim">—</div>
        <div class="temp-label">INSIDE</div>
      {/if}
    </div>
    <div class="temp-divider"></div>
    <div class="temp-block">
      {#if outside != null}
        <div class="temp-val secondary">{outside}°</div>
        <div class="temp-label">OUTSIDE</div>
      {:else}
        <div class="temp-val dim">—</div>
        <div class="temp-label">OUTSIDE</div>
      {/if}
    </div>
    <div class="temp-divider"></div>
    <div class="temp-block">
      <div class="temp-val set">{driverSetF}°</div>
      <div class="temp-label">SET</div>
    </div>
  </div>

  <button class="climate-toggle" class:active={climate.is_climate_on} onclick={toggleClimate} disabled={busy}>
    {#if climate.is_front_defroster_on}
      ❄️ Defrost On
    {:else if climate.is_climate_on}
      🌬️ Climate On
    {:else}
      ○ Climate Off
    {/if}
  </button>

  <div class="seat-row">
    <div class="seat-label">SEAT HEAT</div>
    <div class="seats">
      <div class="seat-ctrl">
        <span class="seat-name">L</span>
        {#each [0,1,2,3] as lvl}
          <button
            class="seat-btn"
            class:active={climate.seat_heater_left >= lvl && lvl > 0}
            onclick={() => setSeat('0', lvl)}
          >●</button>
        {/each}
      </div>
      <div class="seat-ctrl">
        <span class="seat-name">R</span>
        {#each [0,1,2,3] as lvl}
          <button
            class="seat-btn"
            class:active={climate.seat_heater_right >= lvl && lvl > 0}
            onclick={() => setSeat('1', lvl)}
          >●</button>
        {/each}
      </div>
    </div>
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

  .status-dot {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .status-dot.on {
    color: var(--blue);
    background: rgba(74,163,232,0.1);
    border-color: rgba(74,163,232,0.3);
  }

  .temps {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .temp-block {
    flex: 1;
    text-align: center;
  }

  .temp-val {
    font-size: 2rem;
    font-weight: 300;
    color: var(--text-primary);
    line-height: 1;
  }

  .temp-val.secondary { font-weight: 300; color: var(--text-secondary); font-size: 1.5rem; }
  .temp-val.set { color: var(--blue); font-weight: 500; font-size: 1.5rem; }
  .temp-val.dim { color: var(--text-muted); }

  .temp-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }

  .temp-divider {
    width: 1px;
    height: 40px;
    background: var(--border);
  }

  .climate-toggle {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.6rem 1rem;
    transition: all 0.15s;
    width: 100%;
  }

  .climate-toggle:hover:not(:disabled) {
    border-color: var(--blue);
    color: var(--blue);
  }

  .climate-toggle.active {
    background: rgba(74,163,232,0.1);
    border-color: var(--blue);
    color: var(--blue);
  }

  .climate-toggle:disabled { opacity: 0.4; cursor: not-allowed; }

  .seat-row { display: flex; align-items: center; gap: 0.75rem; }

  .seat-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .seats { display: flex; gap: 0.75rem; flex: 1; }

  .seat-ctrl { display: flex; align-items: center; gap: 0.25rem; }

  .seat-name {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text-muted);
    width: 12px;
  }

  .seat-btn {
    background: var(--surface-3);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.4rem;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s;
  }

  .seat-btn.active {
    background: rgba(245,166,35,0.15);
    border-color: var(--amber);
    color: var(--amber);
  }
</style>
