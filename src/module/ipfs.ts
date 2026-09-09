import { useStorage } from "~/hooks/storage";

export const PUBLIC_IPFS_GATEWAYS = [
	{ name: "Filebase", url: "https://ipfs.filebase.io" },
	{ name: "Pinata", url: "https://gateway.pinata.cloud" },
	{ name: "4EVERLAND", url: "https://4everland.io" },
	{ name: "Web3.Storage", url: "https://w3s.link" },
] as const;

export const selectedIpfsGateway = useStorage("ipfsGateway", "");
