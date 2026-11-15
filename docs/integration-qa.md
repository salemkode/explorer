# Explorer compatibility integration evidence

All work was performed in the assigned checkout. No protected branch was advanced. PR32, PR33 and PR36 are unchanged. Nine existing heads were rewritten; no additional PR was created.

## Dependency graph

- #32 → #33 → #37
- #32 → #35 → #38 → #40 → #39 → #42 → #41
- #32 → #34 → #43
- #32 → #36

All GitHub bases remain `main`. Merge manually in prerequisite order. Feature docs replace competing README additions on the independent paths. The local `t3/compat-all` branch contains the complete tested aggregate and is not pushed.

## Updated heads

| PR                                                   | Existing head branch              | Previous SHA                               | Final SHA                                  | Top-level passing tests |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------ | ------------------------------------------ | ----------------------- |
| [#34](https://github.com/salemkode/explorer/pull/34) | `t3/homepage-cashtoken-activity`  | `3f0cfde395a65460f6e4251c201c5a9e8cbe0b50` | `5b2454790c352f7c81f88347cd6dbd343f913dbd` | 60                      |
| [#35](https://github.com/salemkode/explorer/pull/35) | `fix/11-auto-cashaddr`            | `fb6644ac6ec65c35ac1a003c3c420c3afef316ca` | `7e3acecb08b534ab8013af2e4ec4cb6c3f19db3a` | 136                     |
| [#37](https://github.com/salemkode/explorer/pull/37) | `fix/13-compact-token-badges`     | `15f7b2af717f77e1f75a6d71fd84e6e33996e5d7` | `f8b7e58bf2de1585becd664f92e4cdf4c63b41a2` | 87                      |
| [#38](https://github.com/salemkode/explorer/pull/38) | `t3/nft-gallery-completion`       | `3f3474eb806e94faa68543dd654ab88d6359dba2` | `a9bb934b996b8f7fe508f12013f9d0ffe51b7fc2` | 137                     |
| [#39](https://github.com/salemkode/explorer/pull/39) | `t3/auth-chain-selection`         | `c8dc1bf6c14f13672619284b282ec7fdd5ee9b92` | `d7814006275c41324be568c13cc0c459b01915f3` | 151                     |
| [#40](https://github.com/salemkode/explorer/pull/40) | `fix/token-transaction-context`   | `96a909684f56254ca7cd0a61bb56119c8bfc663b` | `d97cc004a7e06c4cee5803ce20968ddb4b1e14b9` | 139                     |
| [#41](https://github.com/salemkode/explorer/pull/41) | `fix/20-burned-supply`            | `5be5eb657c6b293ae194b5ea938de07379453d4d` | `a0e73f5fe592d83c8e7d93247157ccf6b1c0f0c6` | 193                     |
| [#42](https://github.com/salemkode/explorer/pull/42) | `t3/exact-token-balances-metrics` | `f7d30b77ffe4cdd99fcbf8f29b52c0d9ff78bf14` | `e261e56237b95976204ad50bfec7129b5c148540` | 170                     |
| [#43](https://github.com/salemkode/explorer/pull/43) | `feat/12-network-status`          | `e3a68af203ef4d1b65d3ac0d8b8343a14f1b493e` | `6116d8402d9f74269936427e068430ca402e8236` | 84                      |

Unchanged: [#32](https://github.com/salemkode/explorer/pull/32) `4cd0fb6c2fe09a60dfbf6889fa7b67d72c23a949`; [#33](https://github.com/salemkode/explorer/pull/33) `73b5f17341cd99a962fa12db0bef043103755b84`; [#36](https://github.com/salemkode/explorer/pull/36) `a9eab06f83ebc25d4fd6ad688dad58ac45480b80`.

## Validation

Every updated head passed frozen-compatible dependency reuse, lint, all combined tests, every test file independently, checked-in-schema query codegen/Nuxt typecheck, static generation, and diff checks. Subprocess wrappers preserve the actual component assertions while isolating global Nuxt/Vue shims. The aggregate passes 426 top-level tests across 18 files (plus the child suites run by wrappers).

Machine-readable matrix and full logs: `/tmp/explorer-compat-qa/results.json`, `/tmp/explorer-compat-qa/<PR>-{lint,type,tests,build,diff}.log`, and per-file individual logs. PR body drafts are retained beside them.

## Independent review findings and regression evidence

| Finding                                        | Earliest affected fixed head                                | Evidence                                                                                                                                                                                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gallery 1: icon-only readiness                 | #38, inherited by #40/#39/#42/#41                           | `changing only an inactive icon preserves loaded artwork and dialog readiness`; existing failed-artwork fallback fixture                                                                                                                             |
| Gallery 2: explicit null selection             | #38 gallery; #40 Info/Icon; #39 selected callers            | `explicit missing selected metadata never falls back to an unrelated registry`; `icon selection distinguishes an explicit missing revision from an omitted selection`; collection/table metadata propagation                                         |
| Gallery 3: Auto owner addresses                | #38, preserving #35 policy                                  | Address and collection integration fixtures assert 24 category-aware owner links; PR35 helper cases cover zero-FT NFTs, saved overrides, networks, copy/QR semantics                                                                                 |
| Supply 1: unsafe JSON scalars                  | #42 → #41                                                   | `raw JSON unsafe numeric amounts cannot become an exact ready snapshot`; scalar string/safe-number/max-range cases                                                                                                                                   |
| Supply 2: conflicting nodes                    | #42 → #41                                                   | `one accepted node scopes creation, spends, and final snapshot verification`; competing same-network nodes, pending spender, changed-node/reorg rejection                                                                                            |
| Supply 3 and Context 6: genesis input position | #40 → #39 → #42 → #41                                       | `genesis checks every authorizing input and rejects BCH-only or foreign category outputs`; `a later index-zero input authorizes genesis with either safe numeric or string indices`; NFT-only zero-FT cases                                          |
| Supply 4: isolated bitcoin suite               | #42 → #41                                                   | BCMR import moved after runtime setup; bitcoin suite passes alone and combined on every affected head                                                                                                                                                |
| Context 1: initial cached results              | #40; replacement coverage retained in #42                   | `initial cached complete balances and auth-chain results are consumed without a network response`; `cached first pages advance and repeated terminal emissions are counted once`; replacement complete keyset-page/idempotence fixtures              |
| Context 2: network isolation                   | #39 inherits #40 scope/disposal                             | `missing revisions retain recovery controls and network rejection clears selected identity`; delayed old route failures and network-bound metadata fetch fixtures                                                                                    |
| Context 3: ordinary BCH chains                 | #40 guard retained in #39                                   | Genesis fixtures reject absence/foreign token outputs while accepting zero-FT NFTs; actual transaction publication gate remains conditional on matching genesis                                                                                      |
| Context 4: publication-specific metadata       | #40 → #39/#42/#41                                           | `transaction metadata is publication-specific across A → B → A and ignores category cache`; real Info/Icon selected artwork tests separately verify the image boundary, including explicit null                                                      |
| Context 5: mempool spend consistency           | #40; stronger snapshot loader #42                           | `confirmed accounting queries pin the same node for creations and spends, retaining pending transfers` asserts legacy GraphQL acceptance predicates and minting response handling; #42 fixture models unconfirmed and competing-node spend exclusion |
| Context 7: selected artwork in BCMR info       | #40 identity-aware Icon/Info, #39 selected metadata callers | `BCMR info forwards the selected historical/provider image instead of the registry default`; missing revision recovery plus gallery selection tests                                                                                                  |
| Joint supply/auth selection                    | #41                                                         | `selected authhead changes recalculate reserves without treating all issuer balances as reserves`; no duplicate circulation/reserve fields; existing burn coverage and double-subtraction regressions preserved                                      |

The CashTokens source was read at https://github.com/bitjson/cashtokens#token-categories: any input spending output zero can authorize category genesis, not only the first transaction input. Actual query documents were validated against `schema/chaingraph.graphql`.

## Limits and handback

Two focused independent re-reviews completed. Their final query-boundary and shared-icon readiness findings were corrected with regressions that fail before the fixes. No interactive browser, native focus trapping/layout, OS clipboard, real-wallet, or live-indexer proof was obtained in this integration pass. Fixture coverage is deterministic; it does not establish current provider availability. Remote CI is checked separately in the handback and may still be pending. No merges, issue closures, watches, schema updates, dependency churn, device operations, or other-worktree edits were performed.

## Remote CI observed at handback

GitHub `Validate explorer / validate` passed on all nine rewritten heads. Netlify
deploy-preview and its Pages/Header/Redirect checks failed on every updated head,
and also on unchanged PR32, PR33 and PR36. The checks expose only “Deploy failed”;
public deploy metadata reports `error` with no cause message. The build-log API
returned 404. Root must investigate the Netlify dashboard; cleanup PR32 was not
changed. Full check URLs and diagnostics are retained in
`/tmp/explorer-compat-qa/remote-pr-state.json` and
`/tmp/explorer-compat-qa/netlify-check-diagnostics.json`.

## Final parent review correction

The financial re-review found that PR42 had reintroduced a first-input query cap.
The helper was correct but the query withheld later authorizing inputs. PR42 and
its dependent PR41 now fetch every eligible output-zero input. The new generated
query execution fixture applies actual GraphQL filtering and limit arguments; it
fails with the original cap and passes after correction for string/numeric indices.
PR42 passes 170 tests and PR41 passes 193 tests, plus typecheck and static build.
Root final logs: `/tmp/explorer-{42,41,aggregate}-final-{tests,types,build}.log`.
The final UI/selection re-review completed. Its shared-icon provider-switch finding is fixed at PR40 and inherited by PR39, PR42, and PR41; their full suites, typechecks and static builds pass.

## Manual merge instructions

Merge cleanup #32 first, then follow each dependency path above. Every PR targets
`main`. Use merge commits for prerequisites so dependent PRs retain their ancestry
and focused diffs. A squash/rebase merge requires updating dependent branches
before proceeding. No protected branch was advanced by an agent.

The final shared-icon regression runs the actual compiled component setup with
real Vue reactivity. Readiness follows the effective thumbnail URL; changing the
selected identity closes the old preview without disabling an unchanged loaded
thumbnail. A changed icon still requires its own successful load.
Root final artwork logs: `/tmp/explorer-{40,39,42,41}-ui-{tests,types,build}.log`.
