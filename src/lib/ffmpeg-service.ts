/**
 * FFmpeg.wasm audio conversion service.
 * Handles lazy initialization and file conversion entirely in the browser.
 */
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

type ProgressCallback = (percent: number) => void

const CORE_VERSION = '0.12.10'
const BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`

let ffmpeg: FFmpeg | null = null
let loadingPromise: Promise<void> | null = null

/**
 * Lazily initializes the FFmpeg WebAssembly instance.
 * Caches the loading promise so concurrent calls wait on the same load.
 */
export async function initFFmpeg(): Promise<void> {
  if (ffmpeg) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const instance = new FFmpeg()

    instance.on('log', ({ message }) => {
      // Only surface meaningful logs in dev
      if (import.meta.env.DEV) console.log('[ffmpeg]', message)
    })

    await instance.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpeg = instance
  })()

  return loadingPromise
}

/**
 * Map output format to FFmpeg codec and file extension.
 */
const FORMAT_MAP: Record<string, { codec: string; ext: string; mime: string }> = {
  wav: { codec: 'pcm_s16le', ext: 'wav', mime: 'audio/wav' },
  mp3: { codec: 'libmp3lame', ext: 'mp3', mime: 'audio/mpeg' },
  ogg: { codec: 'libvorbis', ext: 'ogg', mime: 'audio/ogg' },
  flac: { codec: 'flac', ext: 'flac', mime: 'audio/flac' },
  m4a: { codec: 'aac', ext: 'm4a', mime: 'audio/mp4' },
}

export function getFormatInfo(format: string) {
  return FORMAT_MAP[format] ?? FORMAT_MAP.mp3
}

/**
 * Converts an audio File to the specified output format.
 *
 * @param file    - The input audio File.
 * @param format  - Output format key: 'wav' | 'mp3' | 'ogg' | 'flac' | 'm4a'.
 * @param onProgress - Callback receiving a 0–100 percentage.
 * @returns A Blob of the converted audio.
 */
export async function convertAudio(
  file: File,
  format: string,
  onProgress: ProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  await initFFmpeg()

  const fmt = getFormatInfo(format)
  const instance = ffmpeg!

  // Track progress via ffmpeg log parsing
  let lastPercent = 0
  const onLog = ({ message }: { message: string }) => {
    // FFmpeg outputs time=HH:MM:SS.ms — use as rough progress.
    const match = message.match(/time=(\d+):(\d+):(\d+)\.(\d+)/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const s = parseInt(match[3], 10)
      const ms = parseInt(match[4], 10)
      const seconds = h * 3600 + m * 60 + s + ms / 100
      // Rough: assume most audio < 600s; cap progress at 95% until done.
      const est = Math.min(95, Math.round((seconds / 600) * 100))
      if (est > lastPercent) {
        lastPercent = est
        onProgress(est)
      }
    }
  }
  instance.on('log', onLog)

  const inputName = 'input.' + (file.name.split('.').pop() || 'wav')
  const outputName = 'output.' + fmt.ext

  try {
    // Write input file to FFmpeg virtual filesystem
    const data = await fetchFile(file)
    await instance.writeFile(inputName, data)

    // Execute conversion
    await instance.exec([
      '-i', inputName,
      '-c:a', fmt.codec,
      '-b:a', '192k',
      '-y',
      outputName,
    ])

    onProgress(100)

    // Read back the result
    const outputData = await instance.readFile(outputName)
    const blob = new Blob([outputData as BlobPart], { type: fmt.mime })

    // Clean up virtual FS
    await instance.deleteFile(inputName)
    await instance.deleteFile(outputName)

    const baseName = file.name.replace(/\.[^.]+$/, '')
    const filename = `${baseName}.${fmt.ext}`

    return { blob, filename }
  } finally {
    instance.off('log', onLog)
  }
}

/**
 * Returns true once FFmpeg has been loaded and is ready.
 */
export function isFFmpegReady(): boolean {
  return ffmpeg !== null
}
