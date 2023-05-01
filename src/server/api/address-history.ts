import {
  electrumChipnet,
  getBalance,
  getHistory,
  type history,
  type balance,
  type network,
} from "~/module/electrum";

export type AddressHistoryResponse =
  | {
      success: true;
      balance: balance;
      history: history;
    }
  | {
      success: false;
      message: string;
    };
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    await electrumChipnet.connect().catch(console.log);
    const address = body?.address as string;
    const network = body?.network as network;

    if (!address) {
      return {
        success: false,
        message: "You must provide address",
      } as AddressHistoryResponse;
    }
    const balance = await getBalance(address, network);
    const history = await getHistory(address, network);

    if ("message" in balance || "message" in history) {
      const error = balance instanceof Error ? balance : (history as Error);
      return {
        success: false,
        message: error.message,
      } as AddressHistoryResponse;
    }

    return {
      success: true,
      balance,
      history,
    } as AddressHistoryResponse;
  } catch (e) {
    return {
      success: false,
      message: "Server Error",
    } as AddressHistoryResponse;
  }
});
