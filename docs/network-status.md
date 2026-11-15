# Homepage network status

The compact status panel reports the selected **Mainnet** or **Chipnet** node’s
current accepted tip, its miner-reported block age, and the node’s mempool count.
It identifies both the configured Chaingraph host and the node name. These are
one node’s observations, not global network totals, hashrate, peer count, or a
guarantee that the node is fully synchronized.

The summary shares the existing mempool subscription with Latest Transactions:
the highest current accepted block for the selected network, one accepting node
(`node_internal_id` ascending), and at most nine recent transactions.
Reorganizations replace the accepted tip, including a lower height. Switching
networks remounts this feed, immediately
clearing the previous network’s values and disposing its subscription, connection
listeners, and timers.

- **Connecting**: no response yet; missing values display “Loading…”.
- **Live**: a successful subscription result, with no freshness warning.
- **Reconnecting**: the existing WebSocket reported an interruption; last received
  values remain labeled until a fresh result arrives.
- **Unavailable**: a subscription error, or no response within 30 seconds of
  mounting/reconnecting. Use **Retry connection** to restart this subscription.
- **No chain data**: a successful response contains no accepted block for the
  selected network. Missing counts stay unavailable; a reported mempool count of
  zero remains a real zero.
- **Stale**: no subscription update for five minutes, or the accepted tip’s block
  timestamp is at least two hours old. A quiet subscription can also produce the
  first warning; this is a freshness caution, not proof of an outage. Block age
  comes from the miner’s timestamp and can differ from actual time.

A component-scoped 15-second clock updates ages and freshness warnings without
polling the provider. The existing WebSocket handles automatic reconnection;
terminal errors expose the manual retry button. No extra endpoint or credentials
are required. Fixture tests cover missing/zero data, failures, stale/recovery,
reorganizations, network isolation, retry, and lifecycle cleanup.
