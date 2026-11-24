# Bitcoin Cash Explorer

Nuxt 4 explorer with CashTokens, address tools, and transaction analytics.

## Development

Use Bun **1.4.4** and Node **24.15.0+** (the supported LTS line is pinned in
`.node-version`). Node must satisfy the `engines` range in `package.json`.
Bun is the package manager for local work, CI, and Cloudflare; commit `bun.lock`
when dependencies change. Do not generate npm or pnpm lockfiles.

```bash
bun install --frozen-lockfile
bun run dev
```

The default data source is `gql.chaingraph.pat.mn`, in code and in the
production deployment.
Override the deployment default using build-time environment variables:

```bash
CHAINGRAPH_HTTP=https://your-chaingraph-host/v1/graphql
CHAINGRAPH_WS=wss://your-chaingraph-host/v1/graphql
NUXT_PUBLIC_IPFS_GATEWAY=https://ipfs.filebase.io
```

These URLs are included in the browser bundle; do not include private credentials.
`NUXT_PUBLIC_IPFS_GATEWAY` should be the gateway origin (without `/ipfs`); it can
be replaced with any IPFS HTTP gateway your deployment is allowed to use. The
legacy `IPFS_GATEWAY` variable is also supported for local builds.

Visitors can also pick another Chaingraph server on the Settings page. It lists
the known public servers (pat.mn, the Chaingraph demo) with a live
check of each one: online or offline, response time, and whether it indexes
mainnet and chipnet. A custom `https://` URL is accepted too (plain `http://`
only for localhost); its `wss://` subscription URL is derived from it. The
choice is stored in the browser and applied on reload, before the GraphQL
clients start.

The Settings page includes these public gateway options:

- Filebase: `https://ipfs.filebase.io`
- Pinata: `https://gateway.pinata.cloud`
- 4EVERLAND: `https://4everland.io`
- Web3.Storage: `https://w3s.link`

The selected gateway is stored in the browser and overrides the deployment
default for that browser.

## BCH BLAZE announcement banner

A dismissible banner above the header promotes the author's BCH BLAZE 2026 entry, Focus Garden. It is configured when the site is built (`ssr: false` static output), so changing it needs a rebuild and redeploy:

| Variable                          | Default                       | Meaning                                                                                                                                            |
| --------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_BLAZE_PROMO_ENABLED` | `true`                        | Feature flag. `false`, `0`, `no`, `off` or `disabled` removes the banner.                                                                          |
| `NUXT_PUBLIC_BLAZE_PROMO_URL`     | `https://focus.salemkode.com` | Link target. By default the call to action is "Try it"; when set (for example to the project's DoraHacks BUIDL page) it becomes "See it in BLAZE". |
| `NUXT_PUBLIC_BLAZE_PROMO_UNTIL`   | `2026-11-29T00:00:00Z`        | ISO time after which the banner hides. Empty means no expiry; an invalid value hides the banner.                                                   |
| `NUXT_PUBLIC_BLAZE_PROMO_ID`      | `bchblaze-2026-focus-garden`  | Campaign id. Visitors who dismissed a campaign see a new id again.                                                                                 |

## Transaction token badges

Transaction input/output badges use compact **display** amounts: `2000` becomes
`2k`. Amounts below 1000 retain every decimal; larger amounts use up to three
significant digits with `k`, `m`, `b`, or `t` (scientific notation from `10^15`).
`≈` marks rounding, including rounding up into the next suffix. BCMR token
decimals are applied before compaction using arbitrary-precision arithmetic.
Until metadata is available, the amount is shown in base units and identified
as such in its exact-value disclosure.

Long NFT commitments show the first seven and last eight characters, separated
by `......`; values of 21 characters or fewer stay intact, including leading zeros.
Tap/click an amount or commitment, or focus it and press Enter/Space, to inspect
and copy the full exact value. Token disclosures also include the original
on-chain base units when they differ. Titles and accessible labels contain the
exact value. Compact text is never used for copying or on-chain operations;
other full-value tables and details keep their existing exact-display behavior.

## Generated assets

`bun install` generates the typed GraphQL documents and prepares Nuxt. The checked-in
`schema/chaingraph.graphql` snapshot makes installation, typechecking, and builds
independent of the live indexer's availability. Generated files in `src/graphql`
and icon fonts in `src/public/font` are ignored; the Vite plugins regenerate them
for development and production builds.

After changing a GraphQL operation, run `bun run codegen` (also run automatically
by `lint:type` and Vite). To deliberately update the schema from the configured
Chaingraph endpoint, run `bun run schema:pull` and review the snapshot diff.
Use `bun run icons` to regenerate the icon font manually.

## Dependency maintenance

This project uses Nuxt 4, Vue 3, Vue Router 5, Pinia 4, Tailwind 4, and Biome 2.
Tailwind configuration lives in `src/assets/css/main.css` and runs through the
Vite plugin. Biome checks Vue templates and scripts; `bun run lint` is read-only
and `bun run lint:fix` applies safe formatting and fixes.

Two packages intentionally use the latest compatible release:

- TypeScript **6.0.3**: `vue-tsc` currently requires the JavaScript compiler entry
  point that TypeScript 7 no longer exports.
- GraphQL **16.15.0**: Nuxt Apollo's current Nuxt-compatible release
  (`5.0.0-alpha.16`) depends on Apollo Client 3 and GraphQL 16. The package's
  `latest` dist-tag points to the older Nuxt 2 module, so it is pinned explicitly.

The deprecated `electrum-cash` dependency has been replaced by
`@electrum-cash/network`; balance and history responses are validated with Valibot.
A scoped Undici 6 override patches the icon-generation toolchain without changing
Nuxt's or Wrangler's newer Undici major versions.

`bun audit` currently reports three upstream build-tool advisories: `deepmerge`
(low, no patched release), and `glob` / `minimatch` (moderate, older major ranges
required by their consumers). No high or critical advisories remain. Recheck these
when updating the toolchain; do not force incompatible transitive major versions.

## Verification and deployment

```bash
bun run lint
bun run test
bun run lint:type
bun run build
bunx wrangler deploy --dry-run
bunx wrangler deploy
```

Wrangler runs a fresh static build and uploads `.output/public` to the `explorer`
Worker, with SPA routing for address, transaction, block, and token URLs.
The configured custom domain is `explorer.salemkode.com`.

Wrangler 4 is installed with the project. Authenticate with
`bunx wrangler login` before deploying.
The Cloudflare account must manage the `salemkode.com` zone. An existing DNS record
for the custom domain may need replacement when moving from another host.

The GitHub Actions workflow runs a frozen install, lint, regression tests,
typechecking, and a static build on pull requests and `main`. Cloudflare owns
deployments; the obsolete GitHub Pages deployment has been removed.

Hosting is Cloudflare only. The former Netlify site is disconnected from this
repository and no longer serves the custom domain.

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

The compact badge suite also retains issue #26's exact-value regressions, including
`72624976668144285` and the maximum fungible amount. Its disclosure and copy-value
assertions replace the earlier raw-only text snapshots because compact labels
and registry decimal scaling intentionally change the visible summary.
