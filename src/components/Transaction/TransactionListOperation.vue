<template>
  <div>
    <div class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full" :class="props.name === 'from' ? 'bg-amber-500' : 'bg-emerald-500'" />
      <span v-text="$t(props.name)" />
    </div>

    <ul class="space-y-3">
      <li
        v-for="(utxo, i) in utxos"
        :key="i"
        class="flex items-start gap-2.5 text-xs"
      >
        <span class="font-mono font-bold text-[11px] text-slate-400 dark:text-zinc-500 w-5 pt-0.5 shrink-0 select-none">
          {{ (i < 9 ? "0" : "") + (i + 1) }}
        </span>

        <div class="flex-1 min-w-0">
          <template v-if="utxo.type === 'address'">
            <div v-if="utxo.addressType" class="mb-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {{ utxo.addressType }}
              </span>
            </div>
            <div class="min-w-0 break-all">
              <BaseCopy
                :text="utxo.address"
                :url="`/address/${utxo.address}`"
                warp
                copy
              />
            </div>
          </template>

          <div v-else-if="utxo.type === 'op_return'" class="font-mono text-xs text-slate-700 dark:text-zinc-300 break-all bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-lg">
            <span class="text-amber-600 dark:text-amber-400 font-bold">OP_RETURN</span> {{ utxo.data }}
          </div>

          <div v-else-if="utxo.type === 'coinbase'" class="font-semibold text-emerald-600 dark:text-emerald-400">
            Block Reward (Coinbase)
          </div>

          <div class="font-mono text-xs font-semibold text-slate-600 dark:text-zinc-400 mt-1">
            {{ formatPrice(utxo.valueSatoshis || "0") }}
          </div>

          <template v-if="'category' in utxo && utxo.category">
            <TransactionOperationToken
              :category="utxo.category"
              :token-amount="utxo.tokenAmount"
              :token-capability="utxo.tokenCapability"
              :token-commitment="utxo.tokenCommitment"
            />
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useAuthChains } from "~/hooks/authchains";
import { useUsdPrice } from "~/hooks/usdPrice";
import { getAddressType } from "~/module/bitcoin";
import { useRegistryStore } from "~/store";
import type { Utxo } from "~/types";

const { formatPrice } = useUsdPrice();
const registryStore = useRegistryStore();
const props = defineProps<{
	name: "from" | "to";
	utxos: Utxo[];
	isCoinBase?: boolean;
}>();

const categories = computed(() =>
	props.utxos.map((utxo) => utxo.token_category).filter(Boolean),
);
useAuthChains(categories);

const utxos = computed(() => {
	if (props.name === "from" && props.isCoinBase === true) {
		return [
			{
				type: "coinbase" as const,
				value: "0",
				valueSatoshis: "0",
			},
		];
	}
	return props.utxos.map((utxo) => {
		// check is op_return
		if (utxo?.locking_bytecode?.startsWith("\\x6a")) {
			return {
				type: "op_return" as const,
				data: binToUtf8(hexToBin(utxo.locking_bytecode.substring(4))),
				valueSatoshis: utxo.value_satoshis,
				value: formatPrice(utxo.value_satoshis || 0),
			};
		}

		const category = utxo.token_category?.substring(2);

		const fullAddress = getAddress(utxo?.locking_bytecode || "", false);
		const displayAddress = getAddress(utxo?.locking_bytecode || "");
		return {
			type: "address" as const,
			addressType: fullAddress ? getAddressType(fullAddress) : undefined,
			category,
			address: displayAddress,
			valueSatoshis: utxo.value_satoshis,
			value: formatPrice(utxo.value_satoshis || 0),
			tokenRegister:
				utxo.token_category &&
				registryStore.getToken(utxo.token_category?.substring(2)),
			tokenAmount: utxo.fungible_token_amount,
			tokenCommitment: utxo.nonfungible_token_commitment?.substring(2),
			tokenCapability: utxo.nonfungible_token_capability,
		};
	});
});
const getAddress = (lockingBytecode: string, removePrefix = true) => {
	return (
		formatLockingBytecodeAddress(lockingBytecode.substring(2), {
			removePrefix,
		}) || ""
	);
};
</script>
