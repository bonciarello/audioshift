<script>
  /** DropZone — area di drag & drop per il caricamento file audio. */
  import { initFFmpeg } from './ffmpeg-service.js'

  let { onFile, disabled = false } = $props()

  let dragging = $state(false)
  let ffmpegLoading = $state(false)
  let ffmpegLoaded = $state(false)
  let inputEl = $state(null)

  const acceptedFormats = '.wav,.mp3,.ogg,.flac,.m4a,.aac,.wma,.aiff,.aif,.m4a,audio/*'

  function handleDragOver(e) {
    e.preventDefault()
    if (disabled) return
    dragging = true
  }

  function handleDragLeave() {
    dragging = false
  }

  function handleDrop(e) {
    e.preventDefault()
    dragging = false
    if (disabled) return

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  function handleInputChange(e) {
    const files = e.target?.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  async function processFile(file) {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(wav|mp3|ogg|flac|m4a|aac|wma|aiff|aif)$/i)) {
      return
    }

    // Start loading ffmpeg in background
    if (!ffmpegLoaded && !ffmpegLoading) {
      ffmpegLoading = true
      initFFmpeg().then(() => {
        ffmpegLoaded = true
        ffmpegLoading = false
      }).catch(() => {
        ffmpegLoading = false
      })
    }

    onFile(file)
  }

  function handleClick() {
    if (disabled) return
    inputEl?.click()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
</script>

<div
  class="dropzone"
  class:dropzone--active={dragging}
  class:dropzone--disabled={disabled}
  role="button"
  tabindex="0"
  aria-label="Carica un file audio — trascinalo qui o clicca per sfogliare"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <input
    bind:this={inputEl}
    type="file"
    accept={acceptedFormats}
    class="dropzone__input"
    onchange={handleInputChange}
    aria-hidden="true"
  />

  <div class="dropzone__icon" aria-hidden="true">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M24 4L24 34M24 4L16 12M24 4L32 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 28V38C8 40.2091 9.79086 42 12 42H36C38.2091 42 40 40.2091 40 38V28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  <p class="dropzone__title">Trascina qui il tuo file audio</p>
  <p class="dropzone__subtitle">oppure clicca per sfogliare i file</p>

  <div class="dropzone__formats">
    <span class="dropzone__badge">WAV</span>
    <span class="dropzone__badge">MP3</span>
    <span class="dropzone__badge">OGG</span>
    <span class="dropzone__badge">FLAC</span>
    <span class="dropzone__badge">M4A</span>
  </div>
</div>

<style>
  .dropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-10) var(--space-6);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
    min-height: 220px;
    text-align: center;
  }

  .dropzone:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .dropzone:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .dropzone--active {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    box-shadow: var(--shadow-glow);
    border-style: solid;
    transform: scale(1.01);
  }

  .dropzone--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .dropzone__input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .dropzone__icon {
    color: var(--color-primary);
    margin-bottom: var(--space-4);
    transition: transform var(--duration-normal) var(--ease-out);
  }

  .dropzone--active .dropzone__icon {
    transform: translateY(-4px);
  }

  .dropzone__title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: var(--space-1);
    letter-spacing: -0.02em;
  }

  .dropzone__subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-5);
  }

  .dropzone__formats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
  }

  .dropzone__badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.05em;
    border: 1px solid var(--color-border);
  }

  @media (max-width: 480px) {
    .dropzone {
      padding: var(--space-8) var(--space-4);
      min-height: 180px;
    }

    .dropzone__title {
      font-size: var(--text-lg);
    }

    .dropzone__icon svg {
      width: 36px;
      height: 36px;
    }
  }
</style>
