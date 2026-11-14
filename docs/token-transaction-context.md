# Token and transaction navigation (#18)

Issue [#18](https://github.com/salemkode/explorer/issues/18) only says
“Check is open token page still show in tx page.” This fix interprets it as
context leaking between token and transaction pages, including parameter changes
without a full reload. It does not change transaction status or search behavior.

## Expected behavior

- Navigating token A → transaction B → token C removes the previous page's data.
- Replacing a token ID or transaction ID updates requests, even when Vue reuses
  the page component and the router replaces its `params` object.
- A network change resets auth-chain metadata, supply totals and pagination.
  Delayed results from the previous context cannot restore cards or trigger a
  global error page. Shared registry providers remain available.
- A token's registry selection and mobile tab reset when its ID/network changes.
  Token address, child and transaction lists start with fresh pagination.
- “Open Token Page” remains available for a transaction hash that is a known
  token category. It does not imply that transaction publishes BCMR metadata.
- The transaction BCMR card appears only when that transaction's own outputs
  contain the valid, latest publication decoded from its category's auth chain.
  Its identity comes from the auth-chain registry for that category, rather than
  another configured provider. A later descendant's publication is not presented
  as metadata published by the selected transaction. Historical publication
  browsing and discovering other categories published by a transaction are
  outside this fix.
- Failed requests display a connection/reload instruction. Only a successfully
  completed empty lookup displays “not found.” Missing or failed token registry
  metadata has an explicit empty state rather than a previous token's card.

## Regression checks

Run `bun install --frozen-lockfile`, then `bun test tests/token-navigation.test.ts`.
These tests compile the actual Vue pages and BCMR card and render them with a
small in-memory Vue host. They use real Apollo queries with controlled responses;
external registry fetches are isolated. They cover navigation, replaced params,
delayed old responses/errors, metadata publication gating, network isolation,
and supply pagination without duplicate accumulation.

Full checks: `bun run lint`, `bun run test`, `bun run lint:type`, `bun run build`.
Code generation uses `schema/chaingraph.graphql`; no live schema pull is needed.
Apollo 3 emits upstream deprecation notices during the intentional error test
because Vue Apollo calls its legacy error recovery methods.

For browser QA, use two known token IDs and an unrelated transaction on the
selected network. Open A, choose a registry/mobile tab, then navigate to the
transaction and C using in-app links or the search bar without reloading. Repeat
with two token URLs and two transaction URLs while delaying requests. Check that
old cards disappear immediately, the new page stays usable after an old request
fails, and only the current successful empty lookup shows “not found.” Repeat
after switching networks and check both light/dark themes and narrow/wide layouts.
The in-memory renderer checks behavior, not browser layout or live indexer data.
