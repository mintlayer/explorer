export const NETWORKS: any = {
  mainnet: {
    coin: "ML",
    network: "MAINNET",
    displayName: "Mainnet",
    domain: "explorer.mintlayer.org",
    api: "api-server.mintlayer.org",
    matchers: {
      block: /^[0-9]+$/,
      blockHash: /^[0-9a-fA-F]{64}$/,
      tx: /^0?x?[0-9a-fA-F]{64}$/,
      address: /^mtc1[a-zA-Z0-9]{40}$/,
      pool: /^mpool1[a-zA-Z0-9]{58}$/,
      delegation: /^mdelg1[a-zA-Z0-9]{58}$/,
    },
  },
  testnet: {
    coin: "TML",
    network: "TESTNET",
    displayName: "Testnet",
    domain: "lovelace.explorer.mintlayer.org",
    api: "api-server-lovelace.mintlayer.org",
    matchers: {
      block: /^[0-9]+$/,
      blockHash: /^[0-9a-fA-F]{64}$/,
      tx: /^0?x?[0-9a-fA-F]{64}$/,
      address: /^tmt1[a-zA-Z0-9]{40}$/,
      pool: /^tpool1[a-zA-Z0-9]{58}$/,
      delegation: /^tdelg1[a-zA-Z0-9]{58}$/,
    },
  },
};
