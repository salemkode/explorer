# Bitcoin Cash Explorer

Nuxt 3 explorer with CashTokens, address tools, and transaction analytics.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The default data source is the public Chaingraph demo. Its availability and sync
status are independent of this website. Configure a maintained instance using
build-time environment variables:

```bash
CHAINGRAPH_HTTP=https://your-chaingraph-host/v1/graphql
CHAINGRAPH_WS=wss://your-chaingraph-host/v1/graphql
```

These URLs are included in the browser bundle; do not include private credentials.

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
