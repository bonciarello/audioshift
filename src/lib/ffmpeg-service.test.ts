/**
 * Unit tests for ffmpeg-service utility functions.
 */
import { describe, it, expect } from 'vitest'
import { getFormatInfo, isFFmpegReady } from './ffmpeg-service.js'

describe('getFormatInfo', () => {
  it('returns mp3 config', () => {
    const info = getFormatInfo('mp3')
    expect(info.codec).toBe('libmp3lame')
    expect(info.ext).toBe('mp3')
    expect(info.mime).toBe('audio/mpeg')
  })

  it('returns wav config', () => {
    const info = getFormatInfo('wav')
    expect(info.codec).toBe('pcm_s16le')
    expect(info.ext).toBe('wav')
    expect(info.mime).toBe('audio/wav')
  })

  it('returns ogg config', () => {
    const info = getFormatInfo('ogg')
    expect(info.codec).toBe('libvorbis')
    expect(info.ext).toBe('ogg')
    expect(info.mime).toBe('audio/ogg')
  })

  it('returns flac config', () => {
    const info = getFormatInfo('flac')
    expect(info.codec).toBe('flac')
    expect(info.ext).toBe('flac')
    expect(info.mime).toBe('audio/flac')
  })

  it('returns m4a config', () => {
    const info = getFormatInfo('m4a')
    expect(info.codec).toBe('aac')
    expect(info.ext).toBe('m4a')
    expect(info.mime).toBe('audio/mp4')
  })

  it('falls back to mp3 for unknown format', () => {
    const info = getFormatInfo('xyz')
    expect(info.codec).toBe('libmp3lame')
  })
})

describe('isFFmpegReady', () => {
  it('returns false before initialization', () => {
    expect(isFFmpegReady()).toBe(false)
  })
})
