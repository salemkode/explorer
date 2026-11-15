# Homepage CashToken activity

The homepage samples output activity from the latest **three blocks accepted by
nodes matching the selected network** in the configured Chaingraph provider.
These are the provider's indexed blocks, not a guarantee of the current network
tip; the section links each block and displays the newest block's UTC timestamp.
It refreshes every minute and has a manual Refresh button. Changing the network
loads a new window; errors replace metrics rather than presenting cached counts
as current.

Each block contributes at most **20 transactions with token outputs**, ordered by
descending transaction index. Each transaction contributes at most **50 token
outputs**, ordered by ascending output index. The query requests one extra
transaction/output at each level only to detect truncation. Extra rows are
excluded from every count and amount. If either limit is exceeded, the UI says
that the metrics cover a sample. There is no browser full-chain scan or automatic
pagination through chain history. Category pagination displays eight categories
per page within the same sampled window, in first-observed order.

Metrics have deliberately narrow meanings:

- **Transactions observed:** unique transaction hashes with sampled token outputs.
  A transaction can contribute to multiple category rows but counts once in the
  section total. Duplicate block inclusions and outpoints are deduplicated.
- **FT output units:** the sum of raw on-chain fungible amounts for that category,
  using `BigInt` and decimal strings throughout. Categories are never summed
  together, and registry decimals never rescale these figures.
- **NFT outputs:** outputs whose NFT capability is present, including `none`,
  `mutable`, and `minting`. An empty NFT commitment still represents an NFT.
  Minting-capability counts describe authority outputs, not newly minted NFTs.

Outputs may include change, genesis and repeated movement. This is neither
transfer volume nor circulating supply, issuance, holder statistics, or a global
ranking. Burn-only transactions without token outputs are excluded. Missing or
invalid registry names use “Unnamed token”; category IDs and transaction links
remain usable without metadata. Names are rendered as text, never HTML.

`tests/cash-token-activity.test.ts` covers exact quantities, multiple categories,
NFT/FT combinations, duplicate outpoints, window and sample limits, optional
metadata, pagination, and execution of the query against the checked-in schema.
