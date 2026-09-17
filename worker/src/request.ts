import { getWorkerPreset } from './presets'

export type OutputFormat = 'svg' | 'png' | 'jpg'

export interface RenderRequestInput {
  data?: unknown
  format?: unknown
  size?: unknown
  margin?: unknown
  preset?: unknown
  style?: {
    foreground?: unknown
    background?: unknown
    finderOuter?: unknown
    finderInner?: unknown
  }
}

export interface NormalizedRenderRequest {
  data: string
  format: OutputFormat
  size: number
  margin: number
  preset: string
  colors: {
    foreground: string
    background: string
    finderOuter: string
    finderInner: string
  }
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

export class RequestValidationError extends Error {
  code = 'INVALID_REQUEST'

  constructor(message: string) {
    super(message)
    this.name = 'RequestValidationError'
  }
}

function parseSize(value: unknown, fallback: number): number {
  if (value == null || value === '') return fallback

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 64 || parsed > 4096) {
    throw new RequestValidationError('size must be a number between 64 and 4096')
  }

  return Math.round(parsed)
}

function parseMargin(value: unknown, fallback: number): number {
  if (value == null || value === '') return fallback

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 512) {
    throw new RequestValidationError('margin must be a number between 0 and 512')
  }

  return Math.round(parsed)
}

function parseFormat(value: unknown, fallback: OutputFormat): OutputFormat {
  if (value == null || value === '') return fallback

  if (value === 'svg' || value === 'png' || value === 'jpg') {
    return value
  }

  if (value === 'jpeg') {
    return 'jpg'
  }

  throw new RequestValidationError('format must be one of svg, png, jpg, or jpeg')
}

function normalizeHexColor(value: unknown, fallback: string, fieldName: string): string {
  if (value == null || value === '') return fallback

  if (typeof value !== 'string') {
    throw new RequestValidationError(`${fieldName} must be a string color value`)
  }

  const normalized = value.trim()
  if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)) {
    throw new RequestValidationError(`${fieldName} must be a hex color like #000000 or #000000ff`)
  }

  return normalized.toLowerCase()
}

export function normalizeRenderRequest(
  input: RenderRequestInput,
  fallbackFormat: OutputFormat = 'svg'
): NormalizedRenderRequest {
  if (typeof input.data !== 'string' || input.data.trim() === '') {
    throw new RequestValidationError('data is required')
  }

  const preset = getWorkerPreset(typeof input.preset === 'string' ? input.preset : undefined)
  const format = parseFormat(input.format, fallbackFormat)
  const size = parseSize(input.size, 512)
  const margin = parseMargin(input.margin, preset.margin)

  return {
    data: input.data,
    format,
    size,
    margin,
    preset: preset.name,
    colors: {
      foreground: normalizeHexColor(input.style?.foreground, preset.foreground, 'style.foreground'),
      background: normalizeHexColor(input.style?.background, preset.background, 'style.background'),
      finderOuter: normalizeHexColor(
        input.style?.finderOuter,
        preset.finderOuter,
        'style.finderOuter'
      ),
      finderInner: normalizeHexColor(
        input.style?.finderInner,
        preset.finderInner,
        'style.finderInner'
      )
    },
    errorCorrectionLevel: preset.errorCorrectionLevel
  }
}

export function requestFromUrl(url: URL, format: OutputFormat): RenderRequestInput {
  return {
    data: url.searchParams.get('data') ?? undefined,
    format,
    size: url.searchParams.get('size') ?? undefined,
    margin: url.searchParams.get('margin') ?? undefined,
    preset: url.searchParams.get('preset') ?? undefined,
    style: {
      foreground: url.searchParams.get('foreground') ?? undefined,
      background: url.searchParams.get('background') ?? undefined,
      finderOuter: url.searchParams.get('finderOuter') ?? undefined,
      finderInner: url.searchParams.get('finderInner') ?? undefined
    }
  }
}
