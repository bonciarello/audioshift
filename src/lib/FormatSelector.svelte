<script>
  /** FormatSelector — selezione del formato di output. */

  let { format, onFormatChange } = $props()

  const formats = [
    { value: 'mp3', label: 'MP3', desc: 'Buona compressione, compatibilità universale' },
    { value: 'wav', label: 'WAV', desc: 'Senza perdita, qualità massima, file grandi' },
    { value: 'ogg', label: 'OGG Vorbis', desc: 'Open source, qualità elevata' },
    { value: 'flac', label: 'FLAC', desc: 'Compressione senza perdita, metà delle dimensioni del WAV' },
    { value: 'm4a', label: 'M4A (AAC)', desc: 'Standard Apple, ottimo rapporto qualità/dimensioni' },
  ]
</script>

<div class="selector" role="radiogroup" aria-label="Seleziona il formato di output">
  <label class="selector__label" for="format-select">Formato di output</label>

  <div class="selector__cards">
    {#each formats as fmt}
      <button
        class="selector__card"
        class:selector__card--active={format === fmt.value}
        role="radio"
        aria-checked={format === fmt.value}
        tabindex={format === fmt.value ? 0 : -1}
        onclick={() => onFormatChange(fmt.value)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onFormatChange(fmt.value)
          }
        }}
      >
        <span class="selector__card-name">{fmt.label}</span>
        <span class="selector__card-desc">{fmt.desc}</span>
      </button>
    {/each}
  </div>

  <select
    id="format-select"
    class="selector__native"
    value={format}
    onchange={(e) => onFormatChange(e.target.value)}
    aria-label="Formato di output"
  >
    {#each formats as fmt}
      <option value={fmt.value}>{fmt.label}</option>
    {/each}
  </select>
</div>

<style>
  .selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .selector__label {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .selector__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-2);
  }

  .selector__card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    text-align: left;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
    min-height: 68px;
  }

  .selector__card:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .selector__card:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .selector__card--active {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    box-shadow: 0 0 0 1px var(--color-primary);
  }

  .selector__card-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.04em;
  }

  .selector__card--active .selector__card-name {
    color: var(--color-primary);
  }

  .selector__card-desc {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    line-height: var(--leading-tight);
  }

  /* Native select shown only on very narrow mobile */
  .selector__native {
    display: none;
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    appearance: none;
    cursor: pointer;
    min-height: 44px;
  }

  .selector__native:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-color: var(--color-primary);
  }

  @media (max-width: 480px) {
    .selector__cards {
      display: none;
    }

    .selector__native {
      display: block;
    }
  }
</style>
