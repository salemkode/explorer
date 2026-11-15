<template>
  <TableView
    title="Token addresses"
    :rows="addressList"
    :row-keys="page.map((item) => item.key)"
    :columns="['address', 'amount']"
    :has-prev-page="offset > 0"
    :has-next-page="offset + 8 < balances.length"
    :loading="state.status === 'loading'"
    :error="state.status === 'error' ? state.message : ''"
    empty-message="No confirmed token balances."
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import type { useTokenBalanceSnapshot } from "~/hooks/tokenBalances";
import { calculateDecimal } from "~/module/bitcoin";
import { groupTokenBalances } from "~/module/tokenBalances";
import type { tableColumn } from "~/types";

const props = defineProps<{
	state: ReturnType<typeof useTokenBalanceSnapshot>["state"]["value"];
	decimals: number;
}>();
const offset = ref(0);
watch(
	() => props.state,
	() => {
		offset.value = 0;
	},
	{ flush: "sync" },
);
const balances = computed(() =>
	props.state.status === "ready"
		? groupTokenBalances(props.state.outputs, "locking_bytecode")
		: [],
);
const page = computed(() =>
	balances.value.slice(offset.value, offset.value + 8),
);
const addressList = computed<tableColumn[][]>(() =>
	page.value.map(({ key, amount }) => {
		const address = formatLockingBytecodeAddress(key.substring(2), { tokenCategory: props.state.status === "ready" ? props.state.outputs[0]?.token_category : undefined });
		const recipient: tableColumn =
			typeof address === "string"
				? { text: address, copy: true, short: true, url: `/address/${address}` }
				: { text: key.substring(2), copy: true, short: true };
		return [
			recipient,
			{ text: calculateDecimal(amount, props.decimals).toFixed() },
		];
	}),
);
</script>
