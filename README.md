# Bitcoin Cash Explorer

Pure client-side SPA (Vue 3 + Vite) for exploring Bitcoin Cash blocks,
transactions, addresses and CashTokens. Data is fetched by the browser
directly from Chaingraph (GraphQL), an Electrum server and CoinGecko — the
hosting serves static files only.

## Setup

Install dependencies (pnpm is the package manager used by CI and the
deploy targets — the lockfile is `pnpm-lock.yaml`):

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in the endpoints if you don't want
the defaults.

## Development Server

```bash
npm run dev
```

## Production

Build the static site (outputs to `dist/`, also writes a `404.html` copy of
the app shell for GitHub Pages-style hosts):

```bash
npm run generate
```

Locally preview the production build:

```bash
npm run preview
```

## Environment variables

These are read at **build time** (the SPA bundles them):

| Variable | Purpose |
| --- | --- |
| `VITE_CHAINGRAPH_HTTP` / `CHAINGRAPH_HTTP` | Chaingraph GraphQL HTTP endpoint |
| `VITE_CHAINGRAPH_WS` / `CHAINGRAPH_WS` | Chaingraph GraphQL WebSocket endpoint (subscriptions) |
| `VITE_FEATURE_CONVERTER_ALPHA` | Set to `false` to hide the alpha address converter |

## Deployment

The site is fully static — no server functions are involved, so hosting
function/invocation limits never apply.

### Cloudflare Pages

- Build command: `npm run generate`
- Build output directory: `dist`
- Environment variables: the ones above (set for the *build*, not runtime)

SPA fallback for deep links like `/tx/<hash>` is handled by
`src/public/_redirects`.

### Netlify

`netlify.toml` in the repo root pins the build command (`npm run generate`),
publish directory (`dist`) and the SPA redirect — no dashboard config needed
beyond the build environment variables.

### GitHub Pages

`.github/workflows/nuxtjs.yml` builds with `pnpm run generate` and publishes
`dist/`.
