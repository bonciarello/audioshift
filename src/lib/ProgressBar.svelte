<script>
  /** ProgressBar — barra di avanzamento animata con messaggio di stato. */

  let { percent = 0, status = '', visible = false } = $props()

  let displayPercent = $state(0)
  let animFrame = $state(null)

  $effect(() => {
    // Animate percent changes for smooth transitions
    const target = percent

    function step() {
      displayPercent += (target - displayPercent) * 0.2
      if (Math.abs(target - displayPercent) < 0.3) {
        displayPercent = target
        animFrame = null
        return
      }
      animFrame = requestAnimationFrame(step)
    }

    if (animFrame) cancelAnimationFrame(animFrame)
    animFrame = requestAnimationFrame(step)

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  })

  let roundedPercent = $derived(Math.round(displayPercent))
</script>

{#if visible}
  <div class="progress" role="progressbar" aria-valuenow={roundedPercent} aria-valuemin="0" aria-valuemax="100" aria-label="Avanzamento conversione">
    <div class="progress__header">
      <span class="progress__status">{status || 'Conversione in corso…'}</span>
      <span class="progress__percent">{roundedPercent}%</span>
    </div>

    <div class="progress__track">
      <div
        class="progress__fill"
        style="width: {displayPercent}%"
      ></div>
    </div>
  </div>
{/if}

<style>
  .progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .progress__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress__status {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .progress__percent {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-primary);
    tabular-nums: 0;
  }

  .progress__track {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-primary-light);
    overflow: hidden;
  }

  .progress__fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    transition: width 0.3s var(--ease-out);
    will-change: width;
  }
</style>
