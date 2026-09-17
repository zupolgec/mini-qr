# Deploy 16bit del QR generator

- Worker: `qr` — account Cloudflare `16bit` (`5a8fc5f3ed230a3157b24a394db4f36b`).
- URL: `https://qr.16bit.workers.dev` e custom domain `qr.16bit.cloud`
  (zona `16bit.cloud`, DNS proxied creato da wrangler).
- Deploy: `pnpm build && npx wrangler deploy --domain qr.16bit.cloud`.
- Il secret `API_TOKEN` del worker è già impostato lato dashboard (serve agli
  endpoint `/api/render.*`).
- Base code: `upstream/main` (`lyqht/mini-qr`, tag `v0.33.0`, package `0.30.2` —
  versione ferma perché upstream è passato a release manuale).
