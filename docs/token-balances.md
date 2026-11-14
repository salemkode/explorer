# Confirmed token balances

Token metrics and the address/token balance tables describe a confirmed-chain
snapshot. The status text gives its accepted block height. Pending transactions
are excluded. Use **Refresh balances** for a new snapshot.

## Calculation

- Read the highest block accepted by nodes matching the selected network.
- Include token outputs confirmed on that accepted chain at or below the snapshot
  height. For current balances, exclude an output only when a spending transaction
  is also confirmed on that network at or below that height. Pending, orphaned,
  later-height, and other-network spends do not remove snapshot balances.
- Request 500 outputs at a time, ordered by transaction hash then numeric output
  index. Continue from the last outpoint until an **empty** response, even when a
  server returns fewer than 500 rows. A repeated page fails rather than silently
  adding it again or looping forever.
- Deduplicate by outpoint and aggregate the complete result by category (address
  page) or locking bytecode (token page). Table pagination happens after grouping;
  a token/address cannot be split into misleading per-page balances. Unsupported
  address scripts remain visible as locking bytecode.
- Keep amounts as integer strings/BigNumber values. Registry decimals affect
  display only; missing decimal metadata uses base units. NFT-bearing outputs may
  also hold fungible tokens, so they contribute to both relevant metrics. NFT
  counts include immutable, mutable, and minting capabilities.
- Re-check that the pinned block hash is still accepted before publishing totals.
  A detected reorganization fails the scan and requires an explicit refresh.
- Scan genesis outputs separately, matching both the category and genesis
  transaction hash and including already spent outputs. Genesis detection requires
  the first input to spend output zero of the category transaction. The nested
  authchain output list is not used as the displayed supply total.

All pages must finish before a balance is displayed. Errors discard partial data.
Changing network, address, or category cancels the old request and clears its
results immediately; a late response cannot restore stale totals. Refresh replaces
rather than accumulates results.

## What the labels mean

**Unspent fungible supply** is the sum of confirmed unspent category amounts. It
is not a claim about spendability: outputs can be locked by unspendable or unknown
scripts. Burn accounting is outside this change.

**Minting-capable NFT exists** reports a confirmed unspent minting capability. It
does not claim the holder is currently minting.

**Issuer reserves** and **circulating supply** are unknown. Neither the BCMR
authhead's identity output nor a genesis recipient identifies every output under
issuer control. **First genesis recipient** identifies the first matching output,
not a present owner.

## Verification and limits

Run from the repository root:

```sh
bun install --frozen-lockfile
bun run lint
bun test
bun run lint:type
bun run build
```

Code generation uses the checked-in Chaingraph schema. No backend, indexer, schema
refresh, or extra dependency is required. Fixtures cover multiple server-capped
pages, outpoint ordering, duplicate responses, exact large integers, fungible
amounts in NFT outputs, category isolation, network/accepted-chain spend filters,
genesis outputs that are already spent, zero/empty/error results, refresh, and
cancellation of late results.

For browser review, check a fungible category with multiple outputs per holder and
an address holding multiple categories. Compare the sums with confirmed outputs at
the displayed height, navigate all grouped table pages, refresh twice, and switch
networks/categories while loading. Force a request failure and verify no partial
number survives. Check light/dark themes, narrow layouts, keyboard pagination, and
the refresh focus indicator.

A full scan uses time and browser memory proportional to matching output count;
large categories can take longer. Results depend on the configured indexer's
completeness and accepted-chain data. The before/after block check detects a changed
pinned block, but does not provide a database-wide transaction during transient
indexer updates. Genesis metadata can remain unknown if its authchain is unavailable.
The built-in browser was unavailable during implementation, so visual and live
interactive navigation checks remain for review.

Integration guarantees: amounts accept decimal integer strings or safe nonnegative
JSON integers only. Unsafe numeric scalars fail the snapshot; they are never
published as exact amounts. The accepted node selected with the initial block is
pinned by internal id for creations, spends, and final verification. Unconfirmed
spends and another node’s competing branch cannot remove or duplicate outputs.
Genesis authorization checks every input spending the category’s output zero,
consistent with the CashTokens specification’s Token Categories section:
https://github.com/bitjson/cashtokens#token-categories
