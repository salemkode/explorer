# Exploring token auth chains

On `/token/<category>`, use **Auth chains** to choose a possible authhead. The
chain identifier is its full authhead transaction ID, not a registry provider.
Unspent authheads appear first, then transaction ID order; this deterministic
default is a browsing convenience, not a trust recommendation.

The timeline shows migrations newest first using the indexer's `migration_index`,
not block timestamps. **Latest** identifies the newest returned migration;
**Selected** identifies the migration being inspected. Each migration and the
chain's authhead link to their transaction pages. Chain length and the number of
returned migrations are displayed separately to expose incomplete indexer data.

Selecting a migration resolves its publication, or the nearest preceding BCMR
publication on that same chain if the migration made no new publication. It never
borrows a publication from another chain. A malformed publication stops resolution
rather than silently showing older metadata. Genesis statistics remain genesis
statistics; reserves are explicitly labeled as the selected chain's current
**Authhead Reserve Supply**, not historical reserves at the selected migration.

Selections are shareable with `?chain=<authhead-txid>&revision=<migration-txid>`.
Changing chains resets the migration to that chain's newest returned migration.
Browser back/forward restores selections. Missing IDs show an explicit message
and **Show the default chain**; they do not substitute another publication.

**BCMR registry source** is a separate control. The selected auth-chain publication
is the token page's initial source. Choosing another configured registry changes
the displayed token metadata without changing the auth-chain timeline. Returning
to **Selected auth-chain publication** restores the selected migration's metadata.
The token heading, icon, description, decimals, and NFT child metadata use this
choice; it does not overwrite the shared metadata cache used elsewhere.

## Integrity and availability

SHA-256 publications are checked against the downloaded bytes. Mismatched content
is not displayed. A match proves content integrity, **not issuer identity or
trustworthiness**. CID publications are labeled as not checked; a gateway response
is not treated as an independently verified CID. Registry-provider metadata is
also explicitly labeled as not checked against a publication hash.

The interface distinguishes no chains, no publication yet, malformed publications,
HTTP/network/JSON errors, invalid BCMR documents, missing current token identities,
and hash mismatch. Metadata requests are canceled when selection changes; late
responses cannot replace the new selection. Older publication URLs can return
changed content or disappear, and browser CORS policy can block a registry. Such
failures remain visible rather than falling back to unrelated metadata. Identity
history is resolved to the latest currently effective identity within the selected
document; this is publication history, not arbitrary historical wall-clock lookup.

## Regression checks

```sh
bun install --frozen-lockfile
bun run lint
bun test
bun run lint:type
bun run build
```

`tests/fixtures/authchains.ts` contains two chains and multiple migrations with
identical timestamps, deliberately shuffled. `tests/authchains.test.ts` exercises
selection and metadata using a local HTTP server, real SHA-256 verification, the
checked-in BCMR schema, and Vue reactivity, including a late-response race.
Code generation uses `schema/chaingraph.graphql`; no schema refresh is needed.

For a browser check, open a token with indexed auth chains, select an older
migration, copy/reopen its URL, switch chain, and navigate back. Check that the
selected label and metadata agree. Switch registry source and back, test a stale
`revision` ID, and check keyboard navigation, narrow layouts, and light/dark mode.
This PR has no completed browser visual pass because the allowed preview and
built-in browser integrations were unavailable in the implementation session.
