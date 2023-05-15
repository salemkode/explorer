import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { defineStore } from "pinia";
import { isValidAddress } from "~/module/bitcoin";
import * as utils from "~/module/utils";
import {
  type GetLastBlockSubscription,
  GetLastBlock,
} from "~/module/chaingraph";

export const useStateStore = defineStore(
  "state",
  () => {
    const network = ref("mainnet" as "mainnet" | "chipnet");
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

    const usdPrice = ref(0);
    onMounted(async () => {
      const response = await fetch(
        "https://markets.api.bitcoin.com/rates?c=BCH"
      ).then((res) => res.json());
      if (Array.isArray(response)) {
        const price = utils.toObject(
          response.find((price) => {
            const priceObj = utils.toObject(price);
            if (priceObj && "code" in priceObj && priceObj.code === "USD") {
              return true;
            }
          })
        );

        if (price && "rate" in price && typeof price.rate === "number")
          usdPrice.value = price.rate;
      }
    });

    const darkmode = ref(false);
    watch(
      darkmode,
      () => {
        if (utils.isServer) return;
        document
          .querySelector("html")
          ?.setAttribute("data-bs-theme", darkmode.value ? "dark" : "light");
      },
      { immediate: true }
    );

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
      darkmode,
      lockingBytecodeHexToCashAddress,
      search,
      calculatePrice,
      toggleNetwork,
    };
  },
  {
    persist: {
      storage: window.localStorage,
      paths: ["darkmode"],
    },
  }
);
