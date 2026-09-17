import { describe, expect, it } from 'vitest'
import { normalizeRenderRequest } from './request'

describe('worker request normalization', () => {
  it('uses the plain preset by default', () => {
    const request = normalizeRenderRequest({ data: 'https://example.com' })

    expect(request.format).toBe('svg')
    expect(request.colors.foreground).toBe('#000000')
    expect(request.colors.background).toBe('#ffffff')
  })

  it('accepts preset and style overrides', () => {
    const request = normalizeRenderRequest({
      data: 'https://example.com',
      preset: 'default-lyqht',
      format: 'png',
      style: {
        foreground: '#112233'
      }
    })

    expect(request.format).toBe('png')
    expect(request.colors.foreground).toBe('#112233')
    expect(request.colors.background).toBe('#697d80')
  })

  it('normalizes jpeg requests to jpg', () => {
    const request = normalizeRenderRequest({ data: 'hello', format: 'jpeg' })

    expect(request.format).toBe('jpg')
  })
})
