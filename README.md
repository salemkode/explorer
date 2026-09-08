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

## Automatic GitHub deployments

Cloudflare Workers Builds is connected to `salemkode/explorer`:

- Pushes to `main` build and publish to `https://explorer.salemkode.com`.
- Pushes to other branches build and upload a version without replacing production.
- The build command is `bun run build`; production uses `npx wrangler deploy`.
- Non-production branches use `npx wrangler versions upload`.
- Set `CHAINGRAPH_HTTP` and `CHAINGRAPH_WS` under Cloudflare's build variables.

Push changes to a task branch, check its Cloudflare build, and merge the pull
request manually in GitHub when ready to publish. Do not commit or push directly
to the protected `main` branch.
