import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { defineStore } from "pinia";
import * as utils from "~/module/utils";

export const useAppStore = defineStore(
  "setting",
  () => {
    const network = ref("chipnet" as "mainnet" | "chipnet");
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
      if (utils.isValidAddress(keyword)) {
        router.push(`/address/${keyword}`);
      } else {
        router.push(`/tx/${keyword}`);
      }
    };

    const usdPrice = ref<undefined | string>(undefined);
    onMounted(async () => {
      const response = await fetch("/api/price");
      const data: { usd: string } = await response.json();
      usdPrice.value = data.usd;
    });
    const calculatePrice = (sat: string) =>
      utils.calculatePrice(sat, usdPrice.value || "");

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

    const lastBlockHeight = ref("0");
    return {
      network,
      usdPrice,
      lastBlockHeight,
      lockingBytecodeHexToCashAddress,
      search,
      calculatePrice,
      toggleNetwork,
    };
  },
  {
    persist: true,
  }
);
