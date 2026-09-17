import {
  normalizeRenderRequest,
  RequestValidationError,
  requestFromUrl,
  type OutputFormat,
  type RenderRequestInput
} from './request'
import { renderJpg, renderPng, renderSvg } from './rendering'

interface Env {
  API_TOKEN?: string
  ASSETS: Fetcher
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  })
}

function image(body: BodyInit, contentType: string): Response {
  return new Response(body, {
    headers: {
      'content-type': contentType,
      'cache-control': 'public, max-age=3600'
    }
  })
}

function unauthorized(message: string): Response {
  return json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    },
    401
  )
}

function isApiRequest(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.API_TOKEN) {
    throw new Error('Missing API_TOKEN binding')
  }

  const url = new URL(request.url)
  const tokenFromQuery = url.searchParams.get('token')
  if (tokenFromQuery === env.API_TOKEN) {
    return true
  }

  const authorization = request.headers.get('authorization')
  return authorization === `Bearer ${env.API_TOKEN}`
}

function renderFromInput(input: RenderRequestInput, fallbackFormat: OutputFormat): Response {
  const request = normalizeRenderRequest(input, fallbackFormat)

  if (request.format === 'svg') {
    return image(renderSvg(request), 'image/svg+xml; charset=utf-8')
  }

  if (request.format === 'png') {
    return image(renderPng(request), 'image/png')
  }

  return image(renderJpg(request), 'image/jpeg')
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  if (!isApiRequest(url.pathname)) {
    return env.ASSETS.fetch(request)
  }

  if (!isAuthorized(request, env)) {
    return unauthorized('Provide Authorization: Bearer <token>')
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json({ ok: true, service: 'qr' })
  }

  if (request.method === 'GET' && url.pathname === '/api/render.svg') {
    return renderFromInput(requestFromUrl(url, 'svg'), 'svg')
  }

  if (request.method === 'GET' && url.pathname === '/api/render.png') {
    return renderFromInput(requestFromUrl(url, 'png'), 'png')
  }

  if (request.method === 'GET' && url.pathname === '/api/render.jpg') {
    return renderFromInput(requestFromUrl(url, 'jpg'), 'jpg')
  }

  if (request.method === 'POST' && url.pathname === '/api/render') {
    let body: RenderRequestInput

    try {
      body = (await request.json()) as RenderRequestInput
    } catch {
      throw new RequestValidationError('request body must be valid JSON')
    }

    return renderFromInput(body, 'svg')
  }

  return json(
    {
      error: {
        code: 'NOT_FOUND',
        message:
          'Use GET /api/render.svg, /api/render.png, /api/render.jpg, POST /api/render, or GET /api/health'
      }
    },
    404
  )
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleRequest(request, env)
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return json(
          {
            error: {
              code: error.code,
              message: error.message
            }
          },
          400
        )
      }

      console.error(error)
      return json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to render QR code'
          }
        },
        500
      )
    }
  }
}
