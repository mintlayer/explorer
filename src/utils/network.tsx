import { NETWORKS } from "@/config/const";

export type NetworkKey = keyof typeof NETWORKS;

const DEFAULT_NETWORK: NetworkKey = "testnet";

const normalizeNetwork = (value?: string | null): NetworkKey => {
  if (!value) {
    return DEFAULT_NETWORK;
  }

  const normalized = value.toLowerCase();
  if (normalized in NETWORKS) {
    return normalized as NetworkKey;
  }

  return DEFAULT_NETWORK;
};

export const getNetwork = (): NetworkKey => {
  if (typeof window === "undefined") {
    return normalizeNetwork(process.env.NETWORK);
  }

  const runtimeNetwork = window.__ENV__?.NETWORK;
  return normalizeNetwork(runtimeNetwork);
};

export function getUrl() {
  const active = getNetwork();
  const networkObj = NETWORKS[active];

  if (process.env.NODE_API_URL) {
    // override networkObj.api with NODE_API_URL
    return process.env.NODE_API_URL;
  }

  return `https://${networkObj.api}/api/v2`;
}

export function getUrlSide() {
  const select = getNetwork() === "testnet" ? "mainnet" : "testnet";
  const active = select;
  const networkObj = NETWORKS[active];

  return `https://${networkObj.api}/api/v2`;
}

export const isMainNetwork = getNetwork() === "mainnet";
export const MAINNET_EXPLORER_URL = "https://" + NETWORKS["mainnet"].domain;
export const TESTNET_EXPLORER_URL = "https://" + NETWORKS["testnet"].domain;
export const EXPLORER_URL = isMainNetwork ? MAINNET_EXPLORER_URL : TESTNET_EXPLORER_URL;

export function getMatcher(type: string) {
  const active = getNetwork();
  const networkObj = NETWORKS[active];

  return networkObj.matchers[type];
}

export function getCoin() {
  const active = getNetwork();
  const networkObj = NETWORKS[active];

  return networkObj.coin;
}

export function getDisplayName() {
  const active = getNetwork();
  const networkObj = NETWORKS[active];

  return networkObj.displayName;
}
