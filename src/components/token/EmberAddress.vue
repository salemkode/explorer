<template>
  <div class="alert alert-warning" role="alert">
    Note: This will remove soon
  </div>
  <TableView
    title="Only for hackathon"
    :rows="addressList"
    :columns="['Project name', 'address', 'amount']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import { addressToLockingBytecodeHex, calculateDecimal, removeAddressPrefix } from "~/module/bitcoin";
import { GetTokenAddress } from "~/module/chaingraph";
import { useStateStore } from "~/store";
import type { tableColumn } from "~/types";
// Set up a list of projects to measure.
const projects =
[
        { name: 'Badger Survivors',                    address: 'bitcoincash:zr2pasf2h8cecfj8st2qyht4hecwlc9f4ymp5l9dm7' },
        { name: 'Coingraze',                           address: 'bitcoincash:zr2zzu0wjzze67x24vkc358lnhpm5plj6vjeswfl08' },
        { name: 'Lamport',                             address: 'bitcoincash:zpwxwzqsn6zyhdr77hy34wh4ew2v3c0mk5kccddhgm' },
        { name: 'Dance.Cash (1)',                      address: 'bitcoincash:qzsap449ca5a9vktj04a522l2kgrfqh975vgmjexzh' },
        { name: 'Crypto Focus Garden',                 address: 'bitcoincash:zzzyq9g0n2ywatt0eajwre5h89aju3kk0svl94s4k9' },
        { name: 'Dance.Cash (2)',                      address: 'bitcoincash:qzw2pdwvc8p2x2acenet4l8k5ma704ly4qaa4cw23r' },
        { name: 'BCH Giveaway',                        address: 'bitcoincash:qp0yrpmemusnkzk07ngt790hg8cts7rm2q5lcau9r8' },
        { name: 'bch-ipfs-scrape',                     address: 'bitcoincash:zr7vztevt0dflw75quhcldg0sdph30d08cmxlt835u' },
        { name: 'Jump to Layer 1',                     address: 'bitcoincash:zqk0qjl5p7fgndtsph494ul9ydjy0acv5c54wves4y' },
        { name: 'FlowGuard',                           address: 'bitcoincash:zpdah7k0pxmqu4sj8t0r4mjvxxwv4f0t7vvwchz4zh' },
        { name: 'FortressVault',                       address: 'bitcoincash:qqkxtz9m4pl3sqxvah7z689x9j07x5vzrvuxkjhrss' },
        { name: 'DancePulse',                          address: 'bitcoincash:qzanzk92dwq06s0guje3hlne6v9p4ckkhq98ycqg5z' },
        { name: 'BCH Address Harmony',                 address: 'bitcoincash:zr3c5pd48dq4agyxswgqlkw7etl9vlls3ga0enwf4a' },
        { name: 'Mean Reversion Portfolio Rebalancer', address: 'bitcoincash:zrg8xmhfqytlfmt7nwk44cymp2cv3y5kksr2gsyfyq' },
        { name: 'Advent Of Cash',                      address: 'bitcoincash:zztcwdzny29vurzahmmlken9xuzvpj2yucmejnyamf' },
        { name: 'Fun(d) Tokens',                       address: 'bitcoincash:zpxq59t78fflnxxpe4v4v5cjgugt703rx5gsal96v2' },
        { name: 'eventcollect.cash',                   address: 'bitcoincash:zptlllye6aydcv7kndx4sr4vdfdv09ltyys40vrxzn' },
        { name: 'BCH Game BattleCash',                 address: 'bitcoincash:zqykhddzw6qjanvl7jr5khftss6mhy7s8qanpw3rxu' },
        { name: 'EternalCash',                         address: 'bitcoincash:zp7jqy9vprhaaezkew5cvk93enmnv325ngpftxhn0c' },
        { name: 'Personas',                            address: 'bitcoincash:qpq8yv3w69474fjmcr2cw7qt729rklx0muzp2vs79j' },
        { name: 'USSD.Cash',                           address: 'bitcoincash:zry267zd6qu2z9frxhq8q4ej9d79v5y55cdlmck684' },
];

const limit = ref(5000);
const offset = ref(0);
const props = defineProps<{
	category: string;
	decimals: number;
}>();
const stateStore = useStateStore();
const variables = computed(() => ({
	network: stateStore.network,
	tokenCategory: `\\x${props.category}` as const,
	offset: offset.value,
	limit: limit.value,
}));

const {
	result: tokenAddress,
	loading,
	error,
} = useQuery(GetTokenAddress, variables);
const hasNextPage = computed(() => {
	if (tokenAddress.value) {
		return tokenAddress.value.output.length === limit.value;
	}
	return false;
});

const addressList = computed(() => {
	// Return empty array when tokenAddress not found
	if (!tokenAddress.value) return [];

	// Calculate the sum of fungible_token_amount values for each unique locking_bytecode key
	const lockingBytecode = tokenAddress.value.output.reduce((map, address) => {
		// Retrieve the current amount associated with the locking_bytecode key from the map
		const currentAmount = map.get(address.locking_bytecode) || 0;

		// Update the map by setting the sum of the current amount and fungible_token_amount
		return map.set(
			address.locking_bytecode,
			currentAmount + Number(address.fungible_token_amount),
		);
	}, new Map<`\\x${string}`, number>());

	const foundedTokens: tableColumn[][] = Array.from(
		lockingBytecode,
		([lockingBytecode, amount]) => {
			const address = stateStore.lockingBytecodeHexToCashAddress(
				lockingBytecode.substring(2),
			);
			if (typeof address !== "string") {
				return [];
			}

      if (!projects.find((project) => addressToLockingBytecodeHex(project.address) === lockingBytecode.substring(2))) {
        return [];
      }
			return [
				{
					text: projects.find((project) => addressToLockingBytecodeHex(project.address) === lockingBytecode.substring(2))?.name || "",
				},
				{
					text: removeAddressPrefix(address),
					copy: true,
					short: true,
					url: `/address/${address}`,
				},
				{
					text: calculateDecimal(amount, props.decimals).toString(),
				},
			];
		},
	).filter((item) => item.length > 0).filter((item) => item[0].text !== "").sort((a, b) => {
    const nameA = Number(a[2].text.toLowerCase());
    const nameB = Number(b[2].text.toLowerCase());
    if (nameA < nameB) return 1;
    if (nameA > nameB) return -1;
    return 0;
  });

	return foundedTokens;
});
</script>
