<script>
  /** WaveformPreview — canvas che disegna la forma d'onda del file audio. */
  import { renderWaveform } from './waveform.js'
  import { onMount } from 'svelte'

  let { data, loading = false } = $props()

  let canvasEl = $state(null)
  let containerEl = $state(null)
  let width = $state(600)
  let height = $state(160)

  $effect(() => {
    if (canvasEl && data && !loading) {
      const dpr = window.devicePixelRatio || 1
      canvasEl.width = width * dpr
      canvasEl.height = height * dpr
      canvasEl.style.width = width + 'px'
      canvasEl.style.height = height + 'px'

      const ctx = canvasEl.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        renderWaveform(ctx, data.peaks, width, height)
      }
    }
  })

  function handleResize() {
    if (containerEl) {
      width = containerEl.clientWidth
    }
  }

  onMount(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })
</script>

<div class="waveform" bind:this={containerEl}>
  {#if loading}
    <div class="waveform__loading">
      <div class="waveform__spinner" aria-label="Decodifica audio in corso…"></div>
      <p class="waveform__loading-text">Analisi della forma d'onda in corso…</p>
    </div>
  {:else if data}
    <canvas bind:this={canvasEl} class="waveform__canvas" aria-label="Forma d'onda del file audio caricato"></canvas>
  {:else}
    <div class="waveform__empty">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="4" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="10" y="14" width="4" height="12" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="16" y="8" width="4" height="24" rx="1" fill="currentColor" opacity="0.6"/>
        <rect x="22" y="10" width="4" height="20" rx="1" fill="currentColor" opacity="0.5"/>
        <rect x="28" y="14" width="4" height="12" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="34" y="17" width="4" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
      <p>Carica un file audio per visualizzare la forma d'onda</p>
    </div>
  {/if}
</div>

<style>
  .waveform {
    position: relative;
    width: 100%;
    min-height: 160px;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .waveform__canvas {
    display: block;
    width: 100%;
    height: auto;
  }

  .waveform__loading,
  .waveform__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .waveform__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .waveform__spinner {
      animation: none;
      opacity: 0.5;
    }
  }
</style>
