<template>
  <TableView
    :title="title"
    :rows="addressList"
    :columns="['address', 'amount']"
    :has-prev-page="page > 0"
    :has-next-page="hasNextPage"
    :loading="holders.status === 'loading'"
    :error="holders.status === 'error' ? holders.message : undefined"
    @next="page += 1"
    @previous="page = Math.max(0, page - 1)"
  />
</template>

<script setup lang="ts">
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import type { LoadState } from "~/hooks/tokenStats";
import { formatTokenAmount } from "~/module/tokenAmount";
import type { TokenHolderStats } from "~/module/tokenStats";
import type { tableColumn } from "~/types";

const PAGE_SIZE = 8;
const props = defineProps<{
	holders: LoadState<TokenHolderStats>;
	decimals: number;
}>();
const page = ref(0);

const allHolders = computed(() =>
	props.holders.status === "ready" ? props.holders.value.holders : [],
);
watch(allHolders, () => {
	page.value = 0;
});
const title = computed(() =>
	props.holders.status === "ready"
		? `Token Addresses (${allHolders.value.length.toLocaleString("en-US")})`
		: "Token Addresses",
);
const hasNextPage = computed(
	() => (page.value + 1) * PAGE_SIZE < allHolders.value.length,
);

const amountText = (fungibleAmount: bigint, nftCount: number) => {
	const parts: string[] = [];
	if (fungibleAmount > 0n || nftCount === 0)
		parts.push(formatTokenAmount(fungibleAmount, props.decimals));
	if (nftCount > 0)
		parts.push(`${nftCount.toLocaleString("en-US")} NFT${nftCount === 1 ? "" : "s"}`);
	return parts.join(" + ");
};

const addressList = computed<tableColumn[][]>(() =>
	allHolders.value
		.slice(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE)
		.map(({ lockingBytecode, fungibleAmount, nftCount }) => {
			const address = formatLockingBytecodeAddress(lockingBytecode);
			return [
				typeof address === "string"
					? { text: address, copy: true, short: true, url: `/address/${address}` }
					: { text: lockingBytecode, copy: true, short: true },
				{ text: amountText(fungibleAmount, nftCount) },
			];
		}),
);
</script>
