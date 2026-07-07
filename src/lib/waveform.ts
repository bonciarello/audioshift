/**
 * Waveform extraction and rendering utilities.
 * Uses Web Audio API to decode audio and extract amplitude data.
 */

export interface WaveformData {
  /** Normalized peak amplitudes (0–1) */
  peaks: Float32Array
  /** Duration in seconds */
  duration: number
  /** Sample rate */
  sampleRate: number
  /** Number of channels */
  channels: number
}

/**
 * Decode an audio File and extract waveform peak data.
 *
 * @param file       - Audio File to decode.
 * @param numBars    - Number of vertical bars / data points to extract.
 * @returns WaveformData with normalized peaks.
 */
export async function extractWaveform(file: File, numBars: number = 240): Promise<WaveformData> {
  const audioCtx = new AudioContext()
  const arrayBuffer = await file.arrayBuffer()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  await audioCtx.close()

  const { duration, sampleRate, numberOfChannels } = audioBuffer

  // Merge all channels into one by averaging
  const channelData = audioBuffer.getChannelData(0)
  for (let ch = 1; ch < numberOfChannels; ch++) {
    const data = audioBuffer.getChannelData(ch)
    for (let i = 0; i < data.length; i++) {
      channelData[i] = (channelData[i] + data[i]) / 2
    }
  }

  // Split into bar-sized chunks and find peak per chunk
  const peaks = new Float32Array(numBars)
  const samplesPerBar = Math.floor(channelData.length / numBars)

  for (let bar = 0; bar < numBars; bar++) {
    let peak = 0
    const start = bar * samplesPerBar
    const end = start + samplesPerBar
    for (let i = start; i < end; i++) {
      const abs = Math.abs(channelData[i])
      if (abs > peak) peak = abs
    }
    peaks[bar] = peak
  }

  return { peaks, duration, sampleRate, channels: numberOfChannels }
}

/**
 * Render waveform peaks onto a Canvas 2D context.
 *
 * Design: filled area under the curve with a subtle gradient,
 * smooth rounded tops via quadratic curves.
 */
export function renderWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: Float32Array,
  width: number,
  height: number,
  options: {
    fillColor?: string
    peakColor?: string
    barWidth?: number
    gap?: number
    smoothing?: number
  } = {}
) {
  const {
    fillColor = '#6C5CE7',
    peakColor = '#00D68F',
    barWidth = 2,
    gap = 1,
    smoothing = 0.5,
  } = options

  ctx.clearRect(0, 0, width, height)

  const totalBarWidth = barWidth + gap
  const availableBars = Math.floor(width / totalBarWidth)
  const step = Math.max(1, Math.floor(peaks.length / availableBars))

  // Create gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, peakColor + 'CC')
  gradient.addColorStop(0.6, fillColor + '88')
  gradient.addColorStop(1, fillColor + '18')

  ctx.beginPath()

  const halfH = height / 2
  const maxH = halfH - 4 // small padding from edges
  let x = 0

  const points: { x: number; y: number }[] = []

  for (let i = 0; i < peaks.length && x < width; i += step) {
    const peak = peaks[i]
    const barH = peak * maxH * smoothing + (1 - smoothing) * (maxH * 0.15)

    // Top half (positive)
    const yTop = halfH - barH
    points.push({ x: x + barWidth / 2, y: yTop })

    x += totalBarWidth
  }

  // Draw filled area
  ctx.beginPath()

  // Start from bottom-left
  ctx.moveTo(0, halfH)

  // Top envelope with smooth curves
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cpX = (curr.x + next.x) / 2
    ctx.quadraticCurveTo(curr.x, curr.y, cpX, (curr.y + next.y) / 2)
  }

  // Last point
  const last = points[points.length - 1]
  if (last) {
    ctx.lineTo(last.x, last.y)
  }

  // Bottom envelope (mirror)
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    const mirrorY = halfH + (halfH - p.y)
    if (i === points.length - 1) {
      ctx.lineTo(p.x, mirrorY)
    } else {
      const next = points[i + 1]
      const cpX = (p.x + next.x) / 2
      ctx.quadraticCurveTo(next.x, (halfH + (halfH - next.y)), cpX, (mirrorY + (halfH + (halfH - next.y))) / 2)
    }
  }

  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw top envelope stroke for definition
  ctx.beginPath()
  ctx.moveTo(0, halfH)
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cpX = (curr.x + next.x) / 2
    ctx.quadraticCurveTo(curr.x, curr.y, cpX, (curr.y + next.y) / 2)
  }
  if (last) ctx.lineTo(last.x, last.y)

  ctx.strokeStyle = peakColor
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Draw center line
  ctx.beginPath()
  ctx.moveTo(0, halfH)
  ctx.lineTo(width, halfH)
  ctx.strokeStyle = fillColor + '20'
  ctx.lineWidth = 1
  ctx.stroke()
}

/**
 * Format seconds as mm:ss
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Format sample rate for display
 */
export function formatSampleRate(rate: number): string {
  if (rate >= 1000) return `${(rate / 1000).toFixed(0)}kHz`
  return `${rate}Hz`
}

/**
 * Return a human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
