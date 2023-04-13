import { defineStore } from "pinia";
import { getBchPrice } from "~/module/fullstack.api";
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
      const _usdPrice = await getBchPrice();
      usdPrice.value = _usdPrice;
    });
    const calculatePrice = (sat: string) =>
      utils.calculatePrice(sat, usdPrice.value || "");

    const lastBlockHeight = ref("0");
    return {
      network,
      usdPrice,
      lastBlockHeight,
      search,
      calculatePrice,
      toggleNetwork,
    };
  },
  {
    persist: true,
  }
);
