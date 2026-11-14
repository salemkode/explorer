# Address converter

Open `/converter` and paste a Bitcoin Cash address. Conversion runs locally;
it does not query balances, send funds, or verify a wallet's capabilities.

- Inputs: regular or token-aware CashAddr, with or without the `bitcoincash:`
  or `bchtest:` prefix, and legacy Base58 addresses. Surrounding whitespace and
  all-uppercase CashAddr are accepted. Mixed-case CashAddr, payment URIs,
  malformed checksums, and other prefixes are rejected.
- Scripts: P2PKH, P2SH20, and P2SH32. P2SH32 has no legacy representation;
  its legacy output is explicitly unavailable.
- Output network: Mainnet uses `bitcoincash:` and mainnet legacy versions.
  Chipnet uses `bchtest:` and testnet legacy versions. Testnet and Chipnet
  share address encodings, so an input cannot identify which test chain holds
  funds. Changing this selection changes the encoding, not the funds' network.
- Token-aware and regular outputs identify the same locking script. Only the
  token-aware format signals CashTokens support. Converting an address does
  not make a wallet token-compatible.
- Each Copy button copies the complete displayed address. Its QR code encodes
  that same string, including the CashAddr prefix. Clipboard failure leaves
  the address selectable and explains how to copy it manually.

## Regression verification

Run `bun install --frozen-lockfile`, then:

```bash
bun test tests/address-converter.test.ts
bun run lint
bun run test
bun run lint:type
bun run build
```

Stop this worktree's dev server before running the production build; Nuxt does
not allow both to own the same build directory.

The converter regression suite pins full address vectors and decodes results
to check the locking script, network prefix/version, and token-support flag.
It covers both input and output networks, all three script types, legacy
input where supported, prefixless and uppercase CashAddr, whitespace, and
invalid or unsupported input. These tests use Libauth, not an independent
addressing implementation. The page's external-tool links are optional
independent checks; this converter makes no cross-check claim.

For a browser smoke check, run `bun run dev` and visit `/converter`:

1. Paste `1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu`. Mainnet outputs should include
   regular `bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a` and
   token-aware `bitcoincash:zpm2qsznhks23z7629mms6s4cwef74vcwvrqekrq9w`.
2. Select Chipnet. All three output strings must change; Copy and QR contents
   must match their corresponding full strings, without shortening.
3. Paste the token-aware result, then remove its prefix. The detected format
   should remain token-aware and the receiver should remain unchanged.
4. Paste `bitcoincash:rvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77pq5a8aj8`.
   Expect P2SH32, two CashAddr outputs, and an unavailable legacy explanation
   with no legacy Copy or QR control.
5. Paste `:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a`. Expect a validation
   message and no stale outputs. Clear the input; expect guidance without an error.
6. Use Tab and Enter to reach Copy and toggle each QR. Confirm visible focus
   and readable, wrapping output in light and dark themes at narrow widths.
7. Deny clipboard access. Expect manual-copy guidance rather than success.

Browser checks do not replace scanning a QR with a compatible wallet. Confirm
the actual destination network and wallet support before sending funds.
