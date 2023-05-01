import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { defineStore } from "pinia";
import { isValidAddress } from "~/module/bitcoin";
import * as utils from "~/module/utils";
import {
  type GetLastBlockSubscription,
  GetLastBlock,
} from "~/module/chaingraph";

export const useStateStore = defineStore("state", () => {
  const network = ref("chipnet" as "mainnet" | "chipnet");
  const lastBlockHeight = ref("0");
  const variables = computed(() => ({
    network: network.value,
  }));
  const { onResult } = useSubscription<GetLastBlockSubscription>(
    GetLastBlock,
    variables
  );
  onResult(
    ({ data }) =>
      (lastBlockHeight.value = data?.node_block.at(0)?.block.height || "0")
  );

  function toggleNetwork() {
    if (network.value === "mainnet") {
      network.value = "chipnet";
    } else {
      network.value = "mainnet";
    }
  }

  const router = useRouter();
  const search = (keyword: string) => {
    if (!keyword) {
      return;
    }
    clearError();
    if (!isNaN(+keyword)) {
      router.push(`/block/${keyword}`);
    } else if (isValidAddress(keyword)) {
      router.push(`/address/${keyword}`);
    } else {
      router.push(`/tx/${keyword}`);
    }
  };

  const usdPrice = ref<string>("0");
  onMounted(async () => {
    const response = await fetch("/api/price").then((res) => res.json());
    if (
      typeof response === "object" &&
      response &&
      "usd" in response &&
      typeof response.usd === "string"
    ) {
      if (!isNaN(+response.usd)) usdPrice.value = response.usd;
    }
  });

  const calculatePrice = (sat: string) => {
    return utils.calculatePrice(sat, usdPrice.value || "");
  };

  const lockingBytecodeHexToCashAddress = (
    hexCode: string,
    tokenSupport = true
  ) => {
    const bytecode = hexToBin(hexCode);
    const address = lockingBytecodeToCashAddress(
      bytecode,
      network.value === "mainnet" ? "bitcoincash" : "bchtest",
      {
        tokenSupport,
      }
    );

    return typeof address === "string" ? address : undefined;
  };

  return {
    network,
    usdPrice,
    lastBlockHeight,
    lockingBytecodeHexToCashAddress,
    search,
    calculatePrice,
    toggleNetwork,
  };
});
