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

const projects = [
  {
    "project": "Badger Survivors",
    "address": "bitcoincash:zr2pasf2h8cecfj8st2qyht4hecwlc9f4ymp5l9dm7"
  },
  {
    "project": "Coingraze",
    "address": "bitcoincash:zr2zzu0wjzze67x24vkc358lnhpm5plj6vjeswfl08"
  },
  {
    "project": "Crypto Focus Garden",
    "address": 
      "bitcoincash:zzzyq9g0n2ywatt0eajwre5h89aju3kk0svl94s4k9"
    
  },
  {
    "project": "Dance.Cash (kavinm)",
    "address": "bitcoincash:qzw2pdwvc8p2x2acenet4l8k5ma704ly4qaa4cw23r"
  },
  {
    "project": "bch-ipfs-scrape",
    "address": "bitcoincash:zr7vzteyt0dflw75quhcldg0sdph30d08cmxlt835u"
  },
  {
    "project": "Jump to Layer 1",
    "address": "bitcoincash:zqk0qjl5p7fgndtsph494ul9ydjy0acv5c54wves4y"
  },
  {
    "project": "FlowGuard",
    "address": "bitcoincash:zpdah7k0pxmqu4sj8t0r4mjvxxwv4f0t7vvwchz4zh"
  },
  {
    "project": "FortressVault",
    "address": "bitcoincash:zqkxtz9m4pl3sqxvah7z689x9j07x5vzrvmv9ve90r"
  },
  {
    "project": "Mean Reversion Portfolio Rebalancer",
    "address": "bitcoincash:qp3jgmqxf9lrfhmqxzd0j7rrurccsic8agvquppaecx"
  },
  {
    "project": "Advent Of Cash",
    "address": "bitcoincash:zztcwdzny29vurzahmmlken9xuzvpj2yucmejnyamf"
  },
  {
    "project": "Fun(d) Tokens",
    "address": "bitcoincash:zpxq59t78fflnxxpe4v4v5cjgugt703rx5gsal96v2"
  },
  {
    "project": "eventcollect.cash",
    "address": "bitcoincash:zptlllye6aydcv7kndx4sr4vdfldv09ltyys40vrxzn"
  },
  {
    "project": "EternalCash",
    "address": "bitcoincash:zp7jqy9vprhaaezkew5cvk93enmnv325ngpftxhn0c"
  },
  {
    "project": "USSD.Cash",
    "address": "bitcoincash:zry267zd6qu2z9frxhq8q46j9d79v5y55cd1mck684"
  },
  {
    "project": "BCH Game BattleCash",
    "address": "bitcoincash:zqykhddZw6qjanvl7jr5khftss6mhy7s8qanpw3rxu"
  },
  {
    "project": "Personas",
    "address": "qpq8yv3w69474fjmcr2cw7qt729rklx0muzp2vs79j"
  }
]

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

	let items: tableColumn[][] = Array.from(
		lockingBytecode,
		([lockingBytecode, amount]) => {
			const address = stateStore.lockingBytecodeHexToCashAddress(
				lockingBytecode.substring(2),
			);
			if (typeof address !== "string") {
				return [];
			}
			return [
				{
					text: projects.find((project) => addressToLockingBytecodeHex(project.address) === lockingBytecode.substring(2))?.project || "",
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
	).filter((item) => item.length > 0).filter((item) => item[0].text !== "");

	if (items.length === limit.value) {
		items = items.slice(0, -1);
	}

	return items;
});
</script>
