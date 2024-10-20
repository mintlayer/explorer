import { NETWORKS } from "@/config/const";

import { env } from "next-runtime-env";

export const network = env("NEXT_PUBLIC_NETWORK") || "testnet";

export function getUrl() {
  const active = network;
  const networkObj = NETWORKS[active];

  if (process.env.NODE_API_URL) {
    // override networkObj.api with NODE_API_URL
    return process.env.NODE_API_URL;
  }

  return `https://${networkObj.api}/api/v2`;
}

export function getUrlSide() {
  const select = network === "testnet" ? "mainnet" : "testnet";
  const active = select;
  const networkObj = NETWORKS[active];

  return `https://${networkObj.api}/api/v2`;
}

export const isMainNetwork = network === "mainnet";
export const MAINNET_EXPLORER_URL = "https://" + NETWORKS["mainnet"].domain;
export const TESTNET_EXPLORER_URL = "https://" + NETWORKS["testnet"].domain;
export const EXPLORER_URL = isMainNetwork ? MAINNET_EXPLORER_URL : TESTNET_EXPLORER_URL;

export function getMatcher(type: string) {
  const active = network;
  const networkObj = NETWORKS[active];

  return networkObj.matchers[type];
}

export function getCoin() {
  const active = network;
  const networkObj = NETWORKS[active];

  return networkObj.coin;
}

export function getDisplayName() {
  const active = network;
  const networkObj = NETWORKS[active];

  return networkObj.displayName;
}
