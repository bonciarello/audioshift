/**
 * Unit tests for waveform utility functions.
 */
import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  formatSampleRate,
  formatFileSize,
} from './waveform.js'

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats seconds less than a minute', () => {
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(45)).toBe('0:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(125)).toBe('2:05')
  })

  it('formats longer durations', () => {
    expect(formatDuration(3661)).toBe('61:01')
  })

  it('pads seconds with leading zero', () => {
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(67)).toBe('1:07')
  })
})

describe('formatSampleRate', () => {
  it('formats kHz values', () => {
    expect(formatSampleRate(44100)).toBe('44kHz')
    expect(formatSampleRate(48000)).toBe('48kHz')
    expect(formatSampleRate(96000)).toBe('96kHz')
  })

  it('formats Hz values below 1000', () => {
    expect(formatSampleRate(500)).toBe('500Hz')
    expect(formatSampleRate(800)).toBe('800Hz')
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB')
    expect(formatFileSize(5242880)).toBe('5.0 MB')
  })
})
