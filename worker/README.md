# Mini QR API

Small Cloudflare Worker API for rendering QR codes as `svg`, `png`, or `jpg`.

## Local development

```bash
npx pnpm worker:dev
```

## Endpoints

### Health

```bash
curl http://127.0.0.1:8787/
```

The app is served at `/`. All API routes are under `/api` and require either a bearer token or `?token=`.

Set a local token in `.dev.vars`:

```bash
API_TOKEN=replace-me
```

Then call the API with:

```bash
-H "Authorization: Bearer replace-me"
```

Or with a query param:

```bash
?token=replace-me
```

### API health

```bash
curl http://127.0.0.1:8787/api/health \
  -H "Authorization: Bearer replace-me"
```

```bash
curl "http://127.0.0.1:8787/api/health?token=replace-me"
```

### SVG

```bash
curl "http://127.0.0.1:8787/api/render.svg?data=https%3A%2F%2Fexample.com&preset=plain&size=512" \
  -H "Authorization: Bearer replace-me"
```

### PNG

```bash
curl "http://127.0.0.1:8787/api/render.png?data=hello&preset=default-lyqht&size=512" \
  -H "Authorization: Bearer replace-me" \
  --output qr.png
```

### JPG

```bash
curl -X POST http://127.0.0.1:8787/api/render \
  -H "content-type: application/json" \
  -H "Authorization: Bearer replace-me" \
  --data '{"data":"hello from post","format":"jpg","preset":"geekshacking","size":512}' \
  --output qr.jpg
```

## Supported presets

- `plain`
- `default-lyqht`
- `geekshacking`

## Request shape

```json
{
  "data": "https://example.com",
  "format": "svg",
  "size": 512,
  "margin": 0,
  "preset": "plain",
  "style": {
    "foreground": "#000000",
    "background": "#ffffff",
    "finderOuter": "#000000",
    "finderInner": "#000000"
  }
}
```

This first version intentionally keeps the render model small and Worker-safe. It does not yet support logos, frame text, or frontend parity rendering.
