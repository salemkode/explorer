# NFT gallery

On a token collection page, choose **Grid View** above the child NFT list. On an
address page, open **Cash token**, then choose **Grid View** above **Address NFTs**.
**Table View** remains available in both contexts. The collection view preference
continues to be saved by the token page; the address view starts as a table.

The gallery shows up to 24 unspent NFT outputs per page. Previous/next buttons
load adjacent pages; switching views, addresses, collections, or networks returns
to the first page. Queries use a transaction-hash/output-index ordering and fetch
one extra output to detect another page. Holdings can change between requests;
this is offset pagination over current holdings, not a historical snapshot.
The existing child collection query excludes minting outputs; address NFTs include
them. This change does not alter those filters or token totals.

Each card shows its category, exact hexadecimal commitment, capability, owner
when the locking script can be represented as a CashAddr, and output outpoint.
Category, owner, and output link to their explorer pages. Two NFTs with the same
commitment are separate cards because their outpoints differ. An empty commitment
is a valid NFT state and is labeled **Empty commitment**.

Collection names and artwork follow the selected registry. Artwork uses the registered full image, then the token icon, then a generated
category placeholder. Image and metadata loading are labeled separately. Missing
metadata does not remove the NFT or hide its on-chain details. A generated
placeholder is labeled **Image unavailable** and cannot open an image preview.

Activate **View token image** with a pointer, Enter, or Space after artwork loads.
The full image opens in a native modal dialog. Close it using **Close**, Escape,
or the backdrop. The browser confines focus to the dialog and restores it to the
trigger on dismissal. No animation is required. The card layout uses the existing
slate/zinc surfaces, emerald focus/link colors, and responsive grid.

## Regression checks

Run from the repository root:

```bash
bun install --frozen-lockfile
bun run lint
bun run test
bun run lint:type
bun run build
```

`tests/nft-gallery.test.ts` compiles the actual Vue components using the Vue
compiler and runs them through a small Vue host fixture without adding a browser
test dependency. It checks duplicate-commitment reconciliation, missing metadata,
empty commitments, query binding and retry, first/last pages and lookahead,
context/view/network resets, disabled loading navigation, image fallback/reset,
and image-dialog open/close event handlers.

These fixtures do not verify browser focus management or CSS layout. For browser
QA, use an allowed built-in browser session and verify:

- A collection and an address with NFTs switch between both views. Navigate
  forward/back, including the final partial page; no lookahead card is rendered.
- Distinct outputs with identical commitments stay separate, including after
  pagination. Confirm full commitments and owner/category/output destinations.
- A metadata-free NFT remains visible with on-chain details. Check a failed image,
  an icon-only NFT, and a fully missing image; the placeholder does not loop.
- Query loading hides stale cards, an empty result is explained, and a failed
  query offers **Try again** and a previous-page action when applicable.
- At narrow and desktop widths in light/dark themes, long commitments and names
  stay within cards. Keyboard focus remains visible; Enter/Space opens artwork,
  Tab stays within the dialog, Escape closes it, and focus returns to the trigger.
