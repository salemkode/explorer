<template>
  <div class="px-3">
    <b class="d-block py-2" v-text="$t(props.name)" />
    <ul class="mb-0 nav flex-column text-break">
      <li
        v-for="(utxo, i) in utxos"
        :key="i"
        class="mb-2 w-100"
        style="font-size: 12.8px"
      >
        <div class="d-flex">
          <b class="pe-2 mt-1 order-number">
            {{ (i < 9 ? "0" : "") + (i + 1) }}
          </b>
          <div>
            <template v-if="utxo.type === 'address'">
              <div class="d-flex flex-wrap">
                <div
                  v-if="utxo.addressType"
                  class="badge text-bg-primary d-flex align-items-center me-1 mb-1"
                >
                  {{ utxo.addressType }}
                </div>
              </div>
              <BaseCopy
                :text="utxo.address"
                :url="`/address/${utxo.address}`"
                warp
                copy
              />
            </template>
            <b v-else-if="utxo.type === 'op_return'">
              OP_RETURN {{ utxo.data }}
            </b>
            <b v-else-if="utxo.type === 'coinbase'"> Block Reward </b>
            <div class="amount">
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
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { useAuthChains } from "~/hooks/authchains";
import { useUsdPrice } from "~/hooks/usdPrice";
import { getAddressType, removeAddressPrefix } from "~/module/bitcoin";
import { useRegistryStore, useStateStore } from "~/store";
import type { Utxo } from "~/types";

const stateStore = useStateStore();
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

		const address = getAddress(utxo?.locking_bytecode || "");
		return {
			type: "address" as const,
			addressType: getAddressType(address),
			category,
			address: address,
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
const getAddress = (lockingBytecode: string) => {
	return removeAddressPrefix(
		stateStore.lockingBytecodeHexToCashAddress(lockingBytecode.substring(2)) ||
			"",
	);
};
</script>

<style scoped>
.order-number {
  font-size: 14px;
  min-width: 35px;
}
</style>
