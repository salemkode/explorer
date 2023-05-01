import { type balance, ConnectionStatus } from "electrum-cash";
import { electrum, getBalance, type network } from "~/module/electrum";

export type AddressBalanceResponse =
  | {
      success: true;
      balance: balance;
    }
  | {
      success: false;
      message: string;
    };
export default defineEventHandler(async (event) => {
  electrum.connection.status === ConnectionStatus.DISCONNECTED ??
    (await electrum.connect().catch(console.log));
  const address = event.context.params?.address;
  const network = event.context.params?.network as network;

  if (!address) {
    return {
      success: false,
      message: "You must provide address",
    } as AddressBalanceResponse;
  }
  const balance = await getBalance(address, network);

  if ("message" in balance) {
    return {
      success: false,
      message: balance.message,
    } as AddressBalanceResponse;
  }

  return {
    success: true,
    balance: balance,
  } as AddressBalanceResponse;
});
