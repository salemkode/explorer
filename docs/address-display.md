# Address display policy

Settings and the quick settings panel share three browser-saved address modes:

- **Auto** (default): BCH-only inputs/outputs use regular CashAddr. Outputs with
  a token category use token-aware CashAddr, including NFTs with zero fungible
  amount. Inputs use the token category of their spent output (outpoint).
- **Always token-aware** / **Always regular BCH**: explicitly override the encoding
  everywhere; token data and balances are unaffected.

Auto never consults address history or balances. Token-aware encoding indicates
receiver capability, not proof of token ownership. On address pages Auto retains
an opened CashAddr’s encoding and network, so transaction links, copying and QR
codes identify the same destination. Legacy Base58 addresses become regular
CashAddr on their original network. Both encodings identify the same locking script.

Valid saved `token` and `regular` preferences (JSON or legacy raw strings) are
preserved. The old setting does not distinguish an explicit token choice from a
persisted default, so both are retained. Select Auto to opt in. Missing, invalid
or corrupt preferences fall back to Auto; invalid saved values are repaired.
