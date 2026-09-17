import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'
import QRCodeGenerator from 'qrcode-generator'
import type { NormalizedRenderRequest } from './request'

interface Rect {
  x: number
  y: number
  width: number
  height: number
  color: string
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function hexToRgba(color: string): [number, number, number, number] {
  const hex = color.slice(1)

  if (hex.length === 6) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
      255
    ]
  }

  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    Number.parseInt(hex.slice(6, 8), 16)
  ]
}

function createQr(data: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H') {
  const qr = QRCodeGenerator(0, errorCorrectionLevel)
  qr.addData(data)
  qr.make()
  return qr
}

function isInFinderOuter(row: number, col: number, count: number): boolean {
  const topLeft = row < 7 && col < 7
  const topRight = row < 7 && col >= count - 7
  const bottomLeft = row >= count - 7 && col < 7

  return topLeft || topRight || bottomLeft
}

function isInFinderInner(row: number, col: number, count: number): boolean {
  const topLeft = row >= 2 && row <= 4 && col >= 2 && col <= 4
  const topRight = row >= 2 && row <= 4 && col >= count - 5 && col <= count - 3
  const bottomLeft = row >= count - 5 && row <= count - 3 && col >= 2 && col <= 4

  return topLeft || topRight || bottomLeft
}

function createRects(request: NormalizedRenderRequest): Rect[] {
  const qr = createQr(request.data, request.errorCorrectionLevel)
  const count = qr.getModuleCount()
  const drawableSize = request.size - request.margin * 2

  if (drawableSize <= 0) {
    throw new Error('margin is too large for the requested size')
  }

  const cellSize = drawableSize / count
  const rects: Rect[] = []

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue

      const color = isInFinderInner(row, col, count)
        ? request.colors.finderInner
        : isInFinderOuter(row, col, count)
          ? request.colors.finderOuter
          : request.colors.foreground

      const x = request.margin + col * cellSize
      const y = request.margin + row * cellSize
      const nextX = request.margin + (col + 1) * cellSize
      const nextY = request.margin + (row + 1) * cellSize

      rects.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        color
      })
    }
  }

  return rects
}

export function renderSvg(request: NormalizedRenderRequest): string {
  const rects = createRects(request)

  const parts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${request.size}" height="${request.size}" viewBox="0 0 ${request.size} ${request.size}" role="img" aria-label="QR code">`,
    `<title>${escapeXml(request.data)}</title>`,
    `<rect width="${request.size}" height="${request.size}" fill="${request.colors.background}"/>`
  ]

  for (const rect of rects) {
    parts.push(
      `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${rect.color}"/>`
    )
  }

  parts.push(`</svg>`)
  return parts.join('')
}

function paintRect(
  buffer: Uint8Array,
  imageSize: number,
  rect: Rect,
  color: [number, number, number, number]
) {
  const startX = Math.max(0, Math.round(rect.x))
  const startY = Math.max(0, Math.round(rect.y))
  const endX = Math.min(imageSize, Math.round(rect.x + rect.width))
  const endY = Math.min(imageSize, Math.round(rect.y + rect.height))

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const offset = (y * imageSize + x) * 4
      buffer[offset] = color[0]
      buffer[offset + 1] = color[1]
      buffer[offset + 2] = color[2]
      buffer[offset + 3] = color[3]
    }
  }
}

function createRgbaBuffer(request: NormalizedRenderRequest): Uint8Array {
  const rects = createRects(request)
  const buffer = new Uint8Array(request.size * request.size * 4)
  const background = hexToRgba(request.colors.background)

  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = background[0]
    buffer[i + 1] = background[1]
    buffer[i + 2] = background[2]
    buffer[i + 3] = background[3]
  }

  for (const rect of rects) {
    paintRect(buffer, request.size, rect, hexToRgba(rect.color))
  }

  return buffer
}

export function renderPng(request: NormalizedRenderRequest): Uint8Array {
  const png = new PNG({ width: request.size, height: request.size })
  png.data = Buffer.from(createRgbaBuffer(request))
  return PNG.sync.write(png)
}

export function renderJpg(request: NormalizedRenderRequest): Uint8Array {
  const rawImageData = {
    data: Buffer.from(createRgbaBuffer(request)),
    width: request.size,
    height: request.size
  }

  return jpeg.encode(rawImageData, 92).data
}
