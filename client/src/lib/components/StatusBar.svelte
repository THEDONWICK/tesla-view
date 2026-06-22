<script lang="ts">
  import { commandFeedback } from '../stores.js';
  const fb = $derived($commandFeedback);
</script>

{#if fb}
  <div class="status-bar" class:ok={fb.ok} class:err={!fb.ok}>
    <span>{fb.message}</span>
  </div>
{/if}

<style>
  .status-bar {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.6rem 1.5rem;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 1000;
    animation: fadeInUp 0.2s ease;
    white-space: nowrap;
    box-shadow: var(--shadow);
  }

  .ok {
    background: rgba(0,212,170,0.15);
    border: 1px solid var(--green-dim);
    color: var(--green);
  }

  .err {
    background: rgba(232,33,39,0.15);
    border: 1px solid var(--red-dim);
    color: var(--red);
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
