# AGENTS.md — mini-qr (fork 16bit)

Fork di `lyqht/mini-qr` (upstream) su `zupolgec/mini-qr` (origin).
Checkout locale di lavoro: cartella di prova `tries/2026-03-09-qr-code-generator`.

## Preferenze persistenti

- Tenere il fork sempre allineato a `upstream/main`: merge di upstream in `main`
  e push su `origin`. Il layer custom 16bit (vedi sotto) va preservato nel merge.
- Documentazione di sessione in `docs/16bit-*.md` (prefisso `16bit-` per non
  collidere con i file di upstream in `docs/`).

## Layer custom 16bit (non upstreamare)

- `worker/`, `wrangler.jsonc`, `src/utils/appUrlParams*.ts`: deploy Cloudflare
  Workers + prefill QR da query string (`?data=`, `?text=`).
- `package.json`: script `worker:dev`/`worker:deploy`, dipendenze `wrangler`,
  `pngjs`, `jpeg-js` (serve al worker).
- Deploy: worker `qr`, account 16bit, `qr.16bit.workers.dev` + custom domain
  `qr.16bit.cloud`. In `wrangler.jsonc` tenere `workers_dev: true` altrimenti
  il deploy con `--domain` spegne il workers.dev.
