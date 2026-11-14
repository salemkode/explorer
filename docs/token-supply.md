# Fungible CashToken supply

The token page's **Fungible supply** card calculates detected burns from accepted
transaction history. It does not infer historical burns from an unspent-output
sum. NFT counts and minting capabilities are separate from fungible supply:
fungible units are issued at genesis and cannot be minted later.

## Definitions

All arithmetic uses integer `bigint` base units. The card applies the selected
registry's decimals only when formatting, without conversion to JavaScript
`number`. Safe integer JSON numbers from Hasura are accepted too; unsafe numeric
values are rejected because their precision is already lost. For large amounts,
the indexer must serialize bigint scalars as strings (Hasura
`HASURA_GRAPHQL_STRINGIFY_NUMERIC_TYPES=true`). The existing NFT and metadata
panels do not supply the arithmetic.

For the selected category, each transaction contributes:

- **Genesis supply:** the sum of that category's output amounts in its genesis
  transaction. Genesis authorization is an input spending output index 0 of the
  category's transaction hash; it need not be the first input. Other categories
  in the transaction are excluded.
- **Implicit burns:** input amounts minus output amounts, when positive. This
  includes transactions consuming all category tokens with no category output.
- **Explicit detected burns:** the amounts in outputs whose locking bytecode
  starts with `6a` (`OP_RETURN`) or `006a` (`OP_FALSE OP_RETURN`). Both fail
  regardless of the unlocking script. This includes outputs created at genesis.
  These amounts are still outputs, so they do not overlap input/output loss.
- **Burned supply:** implicit burns plus explicit detected burns. The UI adds
  “detected” and “Partial burn coverage” even after a complete history scan.
- **Supply excluding detected burns:** genesis supply minus detected burns.
- **BCMR reserve:** the selected category's confirmed, unspent amount in output 0
  of the unique current BCMR authhead. This is a metadata convention, not proof
  of every issuer-controlled holding. An output of another category, a confirmed
  spent output, or an output already classified as unspendable contributes zero.
  Missing, ambiguous or unconfirmed authheads leave the reserve unknown.
- **Circulating supply:** supply excluding detected burns minus BCMR reserve.
  Burns are never subtracted a second time from an already reduced supply.
  An unavailable reserve or a reserve exceeding remaining supply makes
  circulation unknown.

Example: genesis issues 100 units; a transaction spends 100 and creates 60, of
which 10 are in an OP_RETURN output. Detected burns are 40 + 10 = 50; remaining
supply is 50. A separate unspent BCMR reserve of 5 gives circulation of 45.

## Coverage and limits

A complete scan means complete **indexed history for this detection model**,
not proof that every remaining token is spendable. Arbitrary scripts, undisclosed
P2SH redeem scripts, lost keys and alleged burn addresses cannot be reliably
classified by this indexer. Tokens in unfamiliar scripts and zero-BCH outputs
are not automatically treated as burned. `OP_RETURN` bytes inside pushed data
or a conditional branch are not classified by a substring search.

Remaining and circulating figures are therefore labelled **At most**, including
when detected burns are zero. Burned supply is a proven lower bound under the
trusted indexer's accepted-chain data, not an invented all-methods total.

## Network, confirmation and pagination

1. Choose the first node by ascending internal ID whose configured name matches
   the selected network (`mainnet` or `chipnet`, the project's existing network
   naming convention). Pin that node's latest accepted block hash and height.
2. Query category transactions accepted by **that node**, at or below the pinned
   height. Match either category outputs **or category input outpoints**, so
   full input-only burns are included. Never mix nodes or include mempool spends.
3. Read transactions once in ascending internal ID using a strictly increasing
   `internal_id > cursor`, requesting 100 rows. Continue until an **empty** page;
   a short page alone is not proof of completion under a lower server row cap.
   Repeated hashes, repeated IDs and out-of-order IDs fail closed.
4. Fetch all inputs/outputs with explicit index order and a limit of 5,000 each.
   Require their lengths and contiguous indices to match the indexer's computed
   `input_count`/`output_count`. Missing previous outputs, malformed amounts,
   truncation, absent/multiple genesis or inconsistent issuance/burn totals make
   the whole result **Unknown**. Partial scans never expose a misleading total.
5. Look up the BCMR authhead independently for this category/network/node. Verify
   reserve creation and any spend against the same node and pinned height.
   Verify the pinned block is still accepted before publishing any amounts.
   A detected reorganization discards all results and offers recalculation.

The scan is bounded to 200 page requests (including the final empty page) and
60 seconds. Timeouts, request errors and exhausted budgets show a concrete
unavailability message and a **Recalculate** button. Category/network changes and
component disposal cancel the old scan; late replies cannot replace new results.
The supply card loads independently of the metadata panels.

This is a client-side read of a trusted indexer, not an independent chain audit or
an atomic database snapshot. The schema has no index-completeness/coverage proof.
Pruned, silently incomplete or concurrently backfilled historical data cannot
always be detected. The final accepted-block check catches a changed chain tip
but cannot prove the absence of every intermediate reorganization. A new block
above the pinned height does not invalidate the displayed historical snapshot;
use **Recalculate** for newer confirmations. No automatic transaction or chain
mutation is performed.

## Regression checks

`bun test tests/token-supply.test.ts tests/token-supply-flow.test.ts` covers
no burn, partial/full loss, multiple categories, genesis burns, script-prefix
classification, large integers, decimal formatting, truncated/missing data,
repeated/short pages, scan bounds, cancellation, reserve overlap, request errors,
retry, reorganization checks and late responses after a network switch.

The GraphQL operations validate against the checked-in Chaingraph schema via
`bun run codegen`; no schema refresh or live service is required for tests.
