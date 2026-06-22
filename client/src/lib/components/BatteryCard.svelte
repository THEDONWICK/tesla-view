<script lang="ts">
  import type { ChargeState } from '../types.js';

  let { charge }: { charge: ChargeState } = $props();

  const level = $derived(charge.battery_level);
  const range = $derived(Math.round(charge.battery_range));
  const limit = $derived(charge.charge_limit_soc);
  const isCharging = $derived(charge.charging_state === 'Charging');
  const isComplete = $derived(charge.charging_state === 'Complete');
  const isPlugged = $derived(charge.charging_state !== 'Disconnected');
  const minutesToFull = $derived(charge.minutes_to_full_charge);

  const levelColor = $derived(
    level <= 20 ? '#e82127'
    : level <= 40 ? '#f5a623'
    : '#00d4aa'
  );

  const hoursToFull = $derived(Math.floor(minutesToFull / 60));
  const minsRemaining = $derived(minutesToFull % 60);

  const chargingLabel = $derived(
    isCharging && minutesToFull > 0
      ? `${hoursToFull > 0 ? hoursToFull + 'h ' : ''}${minsRemaining}m to ${limit}%`
      : isComplete ? 'Charge Complete'
      : isPlugged ? 'Plugged In — Stopped'
      : 'Not Plugged In'
  );
</script>

<div class="card battery-card">
  <div class="card-header">
    <span class="card-label">BATTERY</span>
    {#if isCharging}
      <span class="badge charging">⚡ CHARGING</span>
    {:else if isPlugged}
      <span class="badge plugged">PLUGGED IN</span>
    {/if}
  </div>

  <div class="gauge-row">
    <div class="gauge-wrap">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-3)" stroke-width="8"/>
        <circle
          cx="60" cy="60" r="50"
          fill="none"
          stroke={levelColor}
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray={`${(level / 100) * 314} 314`}
          transform="rotate(-90 60 60)"
          style="filter: drop-shadow(0 0 4px {levelColor}); transition: stroke-dasharray 1s ease;"
        />
        {#if isCharging}
          <circle cx="60" cy="60" r="50" fill="none"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="8"
            stroke-dasharray={`${((limit - level) / 100) * 314} 314`}
            stroke-dashoffset={`${-(level / 100) * 314}`}
            transform="rotate(-90 60 60)"
          />
        {/if}
        <text x="60" y="55" text-anchor="middle" fill="var(--text-primary)" font-size="22" font-weight="700" font-family="Inter">{level}</text>
        <text x="60" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="11" font-family="Inter">%</text>
      </svg>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{range}</span>
        <span class="stat-unit">mi</span>
        <span class="stat-label">EST RANGE</span>
      </div>
      <div class="stat">
        <span class="stat-value">{limit}</span>
        <span class="stat-unit">%</span>
        <span class="stat-label">CHARGE LIMIT</span>
      </div>
      {#if isCharging}
        <div class="stat">
          <span class="stat-value">{charge.charger_power}</span>
          <span class="stat-unit">kW</span>
          <span class="stat-label">POWER</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="charge-label" style="color: {isCharging ? 'var(--green)' : 'var(--text-muted)'}">
    {chargingLabel}
  </div>

  {#if isCharging && charge.charge_energy_added > 0}
    <div class="session-row">
      <span class="session-stat">{charge.charge_energy_added.toFixed(1)} kWh added this session</span>
    </div>
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

  .badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .badge.charging {
    background: rgba(0,212,170,0.15);
    color: var(--green);
    border: 1px solid var(--green-dim);
  }

  .badge.plugged {
    background: rgba(74,163,232,0.12);
    color: var(--blue);
    border: 1px solid rgba(74,163,232,0.3);
  }

  .gauge-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .gauge-wrap {
    flex-shrink: 0;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .stat-unit {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .stat-label {
    width: 100%;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .charge-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    padding-top: 0.25rem;
  }

  .session-row {
    text-align: center;
  }

  .session-stat {
    font-size: 0.7rem;
    color: var(--text-muted);
  }
</style>
