import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { defineStore } from "pinia";
import { isValidAddress, satToBch } from "~/module/bitcoin";
import { GetLastBlock } from "~/module/chaingraph";
import * as utils from "~/module/utils";

export const useStateStore = defineStore(
  "state",
  () => {
    const network = ref("mainnet" as "mainnet" | "chipnet");
    const lastBlockHeight = ref("0");
    const variables = computed(() => ({
      network: network.value,
    }));
    const { onResult } = useSubscription(GetLastBlock, variables);
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
    const search = (_keyword: string) => {
      const keyword = _keyword.trim();
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
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd"
      ).then((res) => res.json());

      if (
        response &&
        typeof response === "object" &&
        "bitcoin-cash" in response
      ) {
        const bchPrices = response["bitcoin-cash"];
        if (bchPrices && typeof bchPrices === "object" && "usd" in bchPrices) {
          if (bchPrices.usd && typeof bchPrices.usd === "number") {
            usdPrice.value = bchPrices.usd;
          }
        }
      }
    });

    const darkmodeChange = ref(false);
    const _darkmodeRef = ref(false);
    const darkmode = computed({
      get: () => _darkmodeRef.value,
      set: (value) => {
        darkmodeChange.value = true;
        _darkmodeRef.value = value;
      },
    });
    onMounted(() => {
      if (utils.isServer || darkmodeChange.value) return;
      const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)");
      deviceTheme.addEventListener(
        "change",
        (e) => (_darkmodeRef.value = e.matches)
      );

      _darkmodeRef.value = deviceTheme.matches;
    });
    watch(_darkmodeRef, () => {
      if (utils.isServer) return;
      document
        .querySelector("html")
        ?.setAttribute("data-bs-theme", darkmode.value ? "dark" : "light");
    });

    const calculatePrice = (sat: string | number) => {
      return utils.calculatePrice(sat, usdPrice.value || "");
    };

    const formatPrice = (sat: string | number) => {
      if (!sat || sat === "0") return undefined;
      return `${satToBch(sat, 3)}BCH • $${calculatePrice(sat)}`;
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
      darkmodeChange,
      _darkmodeRef,
      formatPrice,
      lockingBytecodeHexToCashAddress,
      search,
      calculatePrice,
      toggleNetwork,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: ["darkmodeChange", "_darkmodeRef"],
    },
  }
);
