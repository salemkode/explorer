# Bitcoin Cash Explorer

Nuxt 3 explorer with CashTokens, address tools, and transaction analytics.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The default data source is `gql.chaingraph.pat.mn`, matching the configured
Cloudflare build variables. Override it using build-time environment variables:

```bash
CHAINGRAPH_HTTP=https://your-chaingraph-host/v1/graphql
CHAINGRAPH_WS=wss://your-chaingraph-host/v1/graphql
NUXT_PUBLIC_IPFS_GATEWAY=https://ipfs.filebase.io
```

These URLs are included in the browser bundle; do not include private credentials.
`NUXT_PUBLIC_IPFS_GATEWAY` should be the gateway origin (without `/ipfs`); it can
be replaced with any IPFS HTTP gateway your deployment is allowed to use. The
legacy `IPFS_GATEWAY` variable is also supported for local builds.

The Settings page includes these public gateway options:

- Filebase: `https://ipfs.filebase.io`
- Pinata: `https://gateway.pinata.cloud`
- 4EVERLAND: `https://4everland.io`
- Web3.Storage: `https://w3s.link`

The selected gateway is stored in the browser and overrides the deployment
default for that browser.

## Verification and deployment

```bash
pnpm lint:type
pnpm generate
wrangler deploy --dry-run
wrangler deploy
```

Wrangler runs a fresh static build and uploads `.output/public` to the `explorer`
Worker, with SPA routing for address, transaction, block, and token URLs.
The configured custom domain is `explorer.salemkode.com`.

Use Wrangler 4 and authenticate with `wrangler login` before deploying.
The Cloudflare account must manage the `salemkode.com` zone. An existing DNS record
for the custom domain may need replacement when moving from another host.

## Automatic GitHub deployments

Cloudflare Workers Builds is connected to `salemkode/explorer`:

- Pushes to `main` build and publish to `https://explorer.salemkode.com`.
- Pushes to other branches build and upload a version without replacing production.
- The build command is `bun run build`; production uses `npx wrangler deploy`.
- Non-production branches use `npx wrangler versions upload`.
- Set `CHAINGRAPH_HTTP`, `CHAINGRAPH_WS`, and `NUXT_PUBLIC_IPFS_GATEWAY` under
  Cloudflare's build variables.

Push changes to a task branch, check its Cloudflare build, and merge the pull
request manually in GitHub when ready to publish. Do not commit or push directly
to the protected `main` branch.

## Traffic analytics

Free Cloudflare Web Analytics is installed through the script in `nuxt.config.mts`.
View visits, page views, referrers, and performance in the Cloudflare account's
**Analytics → Web Analytics → explorer.salemkode.com** dashboard. The beacon token
is a public site identifier, not an API credential. Future builds retain the
tracking script automatically.
