# Token supply and holder statistics

The token page's figures use the same definitions as
[tokenexplorer.cash](https://tokenexplorer.cash), so both explorers report
identical numbers for the same token. The logic lives in
`src/module/tokenStats.ts` (pure functions, unit tested) and the queries in
`src/module/tokenStatsQueries.ts`.

All arithmetic uses `bigint` base units. Token decimals are applied only when
formatting (`src/module/tokenAmount.ts`), never through JavaScript `number`.

## Which outputs count

An output counts only when the transaction that created it is valid (in a
mempool or included in a block), and it is spent only when a valid transaction
spends it. Chaingraph keeps transactions it once saw in a mempool even after
they were dropped; without these checks dropped double-spends add phantom
outputs (about 3,900 for ParyonUSD) or hide real ones.

Validity uses block inclusion rather than the accepting node: joining
`accepted_by` makes these queries time out on busy categories (Moria USD), and a
category only exists on one network. Results are paged 5,000 rows at a time with
a stable order and deduplicated by outpoint.

**Provable burns** are token outputs locked by `OP_RETURN` (`6a…`) or sent to the
[tokenburner.cash](https://tokenburner.cash) contract, which can only be spent
into a single token-less `OP_RETURN` output. They are never holdings or reserves.
A burn row counts only while its transaction is in a mempool or a block.

## Figures

| Figure                                      | Definition                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Genesis supply                              | FT minted to this category in the genesis transaction (other categories excluded)                                                          |
| Reserved supply                             | FT on unspent minting/mutable NFT outputs, plus FT on the selected authchain's authhead identity output when it is not already one of them |
| Circulating supply                          | genesis − reserved                                                                                                                         |
| Circulating supply (excluding burns)        | all unspent FT − reserved                                                                                                                  |
| Burned (sent to a burn output)              | FT on provable burn outputs                                                                                                                |
| Removed without a burn output               | genesis − all unspent FT − burned (tokens spent without being passed on)                                                                   |
| Total NFTs / Burned NFTs                    | unspent NFT outputs of any capability / NFTs on burn outputs                                                                               |
| Is active minting                           | an unspent minting NFT exists                                                                                                              |
| User / smart contract addresses             | distinct P2PKH / other locking bytecodes holding the token                                                                                 |
| Held on user addresses / in smart contracts | unspent FT by address type, excluding reserved outputs                                                                                     |

If unspent supply exceeds genesis minus burns (stale Chaingraph data), the page
says so instead of showing a negative figure.

Reserved and circulating supply first come from a small query of the unspent
minting/mutable outputs, so they appear while the full holder scan loads (15–40
seconds for the busiest tokens on the current Chaingraph host). Once the scan
completes, every figure is derived from that one consistent snapshot.

## Holders and address balances

The holders table lists every holding address with its exact balance and NFT
count, sorted by balance. Address token balances sum every unspent output of the
address per category (including FT carried on NFT outputs), using the indexed
`search_output` lookup with the selected network's validity filter: an address's
locking bytecode is the same on every network.

## Verification

On 2026-11-21 these figures were compared with tokenexplorer.cash for BLAZE
EMBER, ParyonUSD, Moria USD, DogeCash, Furu, Photon V0, FoldingCash, ELECTRIC
DUDE and an NFT collection: every compared figure matched.
