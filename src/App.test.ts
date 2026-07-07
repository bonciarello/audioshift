/**
 * Component smoke tests for the main App.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import App from './App.svelte'

describe('App component', () => {
  it('renders the header with app name', () => {
    const { container } = render(App)
    const headings = container.querySelectorAll('.header__title')
    expect(headings.length).toBeGreaterThan(0)
    expect(headings[0]?.textContent).toBe('Convertitore Audio')
  })

  it('renders the drop zone initially', () => {
    render(App)
    const elements = screen.getAllByText('Trascina qui il tuo file audio')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders the footer', () => {
    render(App)
    const elements = screen.getAllByText(/FFmpeg WebAssembly/)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders format badges in drop zone', () => {
    render(App)
    expect(screen.getAllByText('WAV').length).toBeGreaterThan(0)
    expect(screen.getAllByText('MP3').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FLAC').length).toBeGreaterThan(0)
  })
})
