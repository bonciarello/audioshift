<script>
  /**
   * App — Convertitore Audio
   * Carica un file audio via drag & drop, mostra la waveform,
   * seleziona il formato di output e converte via ffmpeg.wasm.
   */
  import DropZone from './lib/DropZone.svelte'
  import WaveformPreview from './lib/WaveformPreview.svelte'
  import FormatSelector from './lib/FormatSelector.svelte'
  import ProgressBar from './lib/ProgressBar.svelte'
  import { convertAudio } from './lib/ffmpeg-service.js'
  import { extractWaveform, formatDuration, formatSampleRate, formatFileSize } from './lib/waveform.js'

  // ── State ──
  let file = $state(null)
  let waveformData = $state(null)
  let waveformLoading = $state(false)
  let outputFormat = $state('mp3')
  let converting = $state(false)
  let progress = $state(0)
  let progressStatus = $state('')
  let error = $state('')
  let successMessage = $state('')

  // ── Derived ──
  let fileSize = $derived(file ? formatFileSize(file.size) : '')
  let hasFile = $derived(file !== null && !converting)

  // ── Actions ──
  async function handleFile(newFile) {
    error = ''
    successMessage = ''
    file = newFile
    waveformLoading = true
    waveformData = null

    try {
      const data = await extractWaveform(newFile)
      waveformData = data
    } catch (err) {
      console.error('Waveform extraction failed:', err)
      error = 'Impossibile analizzare il file audio. Verifica che sia un formato supportato e non sia corrotto.'
      file = null
    } finally {
      waveformLoading = false
    }
  }

  async function handleConvert() {
    if (!file || converting) return

    converting = true
    progress = 0
    error = ''
    successMessage = ''

    const fmtLabels = { wav: 'WAV', mp3: 'MP3', ogg: 'OGG', flac: 'FLAC', m4a: 'M4A' }
    progressStatus = `Convertendo in ${fmtLabels[outputFormat] || outputFormat.toUpperCase()}…`

    try {
      const result = await convertAudio(file, outputFormat, (pct) => {
        progress = pct
      })

      // Trigger download
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      successMessage = `File convertito e scaricato: ${result.filename}`
      progressStatus = 'Completato'
    } catch (err) {
      console.error('Conversion failed:', err)
      error = 'La conversione non è riuscita. Riprova con un altro file o formato.'
      progressStatus = 'Errore'
    } finally {
      converting = false
      // Reset progress after a short delay
      setTimeout(() => {
        if (progress === 100) {
          progress = 0
          progressStatus = ''
        }
      }, 3000)
    }
  }

  function handleFormatChange(fmt) {
    outputFormat = fmt
  }

  function handleReset() {
    file = null
    waveformData = null
    waveformLoading = false
    error = ''
    successMessage = ''
    progress = 0
    progressStatus = ''
  }

  let fileExt = $derived(file ? file.name.split('.').pop()?.toUpperCase() : '')
</script>

<div class="app">
  <!-- Header -->
  <header class="header">
    <div class="header__inner">
      <a href="./" class="header__logo" aria-label="Convertitore Audio — Torna alla home">
        <svg class="header__logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="10" width="3" height="8" rx="1.5" fill="currentColor"/>
          <rect x="7" y="6" width="3" height="16" rx="1.5" fill="currentColor"/>
          <rect x="12" y="3" width="3" height="22" rx="1.5" fill="currentColor"/>
          <rect x="17" y="7" width="3" height="14" rx="1.5" fill="currentColor"/>
          <rect x="22" y="9" width="3" height="10" rx="1.5" fill="currentColor"/>
        </svg>
        <span class="header__title">Convertitore Audio</span>
      </a>
      <p class="header__tagline">Conversione diretta nel browser — nessun file lascia il tuo computer</p>
    </div>
  </header>

  <!-- Main -->
  <main class="main">
    <div class="main__inner">
      <!-- Error / Success messages -->
      {#if error}
        <div class="alert alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 5.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="9" cy="12.5" r="0.75" fill="currentColor"/>
          </svg>
          <span>{error}</span>
          <button class="alert__dismiss" onclick={() => error = ''} aria-label="Chiudi messaggio di errore">&times;</button>
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert--success" role="status">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5.5 9L8 11.5L12.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      {/if}

      <!-- Drop zone / Waveform area -->
      {#if !file}
        <DropZone onFile={handleFile} disabled={converting} />
      {:else}
        <section class="file-section" aria-label="Dettagli file audio">
          <!-- Waveform -->
          <WaveformPreview data={waveformData} loading={waveformLoading} />

          <!-- File metadata -->
          <div class="file-meta">
            <div class="file-meta__row">
              <div class="file-meta__item">
                <span class="file-meta__label">Nome file</span>
                <span class="file-meta__value" title={file.name}>{file.name}</span>
              </div>

              {#if file.size}
                <div class="file-meta__item">
                  <span class="file-meta__label">Dimensione</span>
                  <span class="file-meta__value">{fileSize}</span>
                </div>
              {/if}

              {#if waveformData}
                <div class="file-meta__item">
                  <span class="file-meta__label">Durata</span>
                  <span class="file-meta__value">{formatDuration(waveformData.duration)}</span>
                </div>

                <div class="file-meta__item">
                  <span class="file-meta__label">Frequenza</span>
                  <span class="file-meta__value">{formatSampleRate(waveformData.sampleRate)}</span>
                </div>

                <div class="file-meta__item">
                  <span class="file-meta__label">Canali</span>
                  <span class="file-meta__value">{waveformData.channels === 1 ? 'Mono' : waveformData.channels === 2 ? 'Stereo' : `${waveformData.channels} canali`}</span>
                </div>
              {/if}

              <div class="file-meta__item">
                <span class="file-meta__label">Formato origine</span>
                <span class="file-meta__value file-meta__badge">{fileExt}</span>
              </div>
            </div>
          </div>

          <!-- Format selector -->
          <FormatSelector format={outputFormat} onFormatChange={handleFormatChange} />

          <!-- Action buttons -->
          <div class="actions">
            <button
              class="btn btn--primary"
              onclick={handleConvert}
              disabled={converting || waveformLoading}
              aria-label="Converti il file audio in {outputFormat.toUpperCase()}"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9L6 6M3 9L6 12M3 9H13C14.1046 9 15 9.89543 15 11V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Converti in {outputFormat.toUpperCase()}
            </button>

            <button
              class="btn btn--ghost"
              onclick={handleReset}
              disabled={converting}
              aria-label="Carica un altro file audio"
            >
              Carica un altro file
            </button>
          </div>

          <!-- Progress -->
          <ProgressBar percent={progress} status={progressStatus} visible={converting || (progress === 100)} />
        </section>
      {/if}
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer__inner">
      <p>Conversione audio locale via <strong>FFmpeg WebAssembly</strong>. I tuoi file non vengono mai caricati su alcun server — tutto avviene nel tuo browser.</p>
      <p class="footer__formats">Supporto: WAV &middot; MP3 &middot; OGG Vorbis &middot; FLAC &middot; M4A (AAC)</p>
    </div>
  </footer>
</div>

<style>
  /* ── App Layout ── */
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  /* ── Header ── */
  .header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-4);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .header__logo {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--color-primary);
  }

  .header__logo-icon {
    flex-shrink: 0;
  }

  .header__title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .header__tagline {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-left: calc(28px + var(--space-2));
  }

  /* ── Main ── */
  .main {
    flex: 1;
    padding: var(--space-6) var(--space-4);
  }

  .main__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* ── Alerts ── */
  .alert {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    line-height: var(--leading-tight);
  }

  .alert--error {
    background: var(--color-error-light);
    color: var(--color-error);
    border: 1px solid var(--color-error);
  }

  .alert--success {
    background: var(--color-accent-light);
    color: #007A55;
    border: 1px solid var(--color-success);
  }

  .alert__dismiss {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    padding: 0 var(--space-1);
    line-height: 1;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert__dismiss:hover {
    opacity: 1;
  }

  /* ── File section ── */
  .file-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* ── File metadata ── */
  .file-meta {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
  }

  .file-meta__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-6);
  }

  .file-meta__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 100px;
  }

  .file-meta__label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }

  .file-meta__value {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-meta__badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    display: inline-block;
    padding: 1px 8px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: 4px;
    letter-spacing: 0.05em;
    width: fit-content;
  }

  /* ── Actions ── */
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
    min-height: 44px;
    min-width: 44px;
  }

  .btn:active {
    transform: scale(0.97);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn--primary {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 2px 8px var(--color-primary-glow);
  }

  .btn--primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    box-shadow: 0 4px 16px var(--color-primary-glow);
  }

  .btn--primary:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn--ghost:hover:not(:disabled) {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border-color: var(--color-border-hover);
  }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid var(--color-border);
    padding: var(--space-5) var(--space-4);
    margin-top: auto;
  }

  .footer__inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-normal);
  }

  .footer__formats {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .header {
      padding: var(--space-3) var(--space-3);
    }

    .header__title {
      font-size: var(--text-base);
    }

    .header__tagline {
      font-size: var(--text-xs);
      margin-left: 0;
    }

    .main {
      padding: var(--space-4) var(--space-3);
    }

    .file-meta__row {
      gap: var(--space-2) var(--space-4);
    }

    .btn {
      width: 100%;
      justify-content: center;
    }

    .actions {
      flex-direction: column;
    }
  }
</style>
