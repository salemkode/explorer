import { defineStore } from "pinia";
import { getBchPrice } from "../module/fullstack.api";
import { GetLastBlockSubscription } from "../graphql/graphql";
import { GetLastBlock } from "../module/chaingraph";

export const useUserStore = defineStore({
  id: "user-store",
  state: () => ({
    network: ref("chipnet" as "mainnet" | "testnet" | "chipnet"),
    bchPrice: "",
  }),
  actions: {
    toggleNetwork() {
      if (this.$state.network === "mainnet") {
        this.$state.network = "chipnet";
      } else {
        this.$state.network = "mainnet";
      }
    },
  },
  persist: true,
});

export const useSettingStore = defineStore(
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

    const usdPrice = ref<undefined | string>(undefined);
    onMounted(async () => {
      const _usdPrice = await getBchPrice();
      usdPrice.value = _usdPrice;
    });

    const variables = computed(() => ({
      network: network.value,
    }));
    const { result } = useQuery<GetLastBlockSubscription>(
      GetLastBlock,
      variables
    );
    const lastBlockHeight = computed(
      () => result.value?.node_block[0]?.block.height
    );
    return {
      network,
      usdPrice,
      lastBlockHeight,
      toggleNetwork,
    };
  },
  {
    persist: true,
  }
);
