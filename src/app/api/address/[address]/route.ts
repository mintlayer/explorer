import { NextResponse } from "next/server";
import { getUrl, getUrlSide, isMainNetwork } from "@/utils/network";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

type AddressResponse = {
  address?: string;
  updated_at?: string;
  block_included?: number;
  wallet?: any[] | null;
  transaction_history?: any[];
  transaction_count?: number;
  error?: string;
  delegations?: any[];
  vesting?: any[];
  note?: string;
};

export async function GET(request: Request, { params }: { params: { address: string } }) {
  const getAddress = async (apiUrl: string) => {
    const res = await fetch(apiUrl + "/address/" + params.address, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };

  const data = await getAddress(NODE_API_URL);

  if (data.error === "Address not found") {
    let response: AddressResponse = {};
    response.address = params.address;
    response.wallet = null;
    response.updated_at = "";
    response.block_included = 0;
    response.transaction_history = [];
    response.transaction_count = 0;

    return NextResponse.json({ response });
  }

  if (data.error === "Invalid address") {
    // try another node
    const anotherNodeData = await getAddress(NODE_SIDE_API_URL);

    let response: AddressResponse = {};
    response.address = params.address;
    response.wallet = null;
    response.updated_at = "";
    response.block_included = 0;
    response.transaction_history = [];
    response.transaction_count = 0;

    response.error = anotherNodeData.coin_balance ? "Address found in another network" : "Invalid address";

    return NextResponse.json({ response });
  }

  const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const chain_tip_data = await chain_tip.json();

  const { block_height } = chain_tip_data;

  const res_delegations = await fetch(NODE_API_URL + "/address/" + params.address + "/delegations", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data_delegations = await res_delegations.json();

  if (data_delegations.length > 0) {
    // fetch block data for each delegation based on field creation_block_height
    for (let i = 0; i < data_delegations.length; i++) {
      const red_delegation = await fetch(NODE_API_URL + "/delegation/" + data_delegations[i].delegation_id, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data_delegation = await red_delegation.json();

      const res_chain = await fetch(NODE_API_URL + "/chain/" + data_delegation.creation_block_height, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const block_hash = await res_chain.json();

      const res_block = await fetch(NODE_API_URL + "/block/" + block_hash + "/header", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data_block = await res_block.json();
      data_delegations[i].creation_block_timestamp = data_block.timestamp.timestamp;
    }
  }

  let data_utxos = [];

  try {
    const res_utxos = await fetch(NODE_API_URL + "/address/" + params.address + "/all-utxos", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    data_utxos = await res_utxos.json();
  } catch (e) {
    console.error("Error fetching utxos", e);
  }

  let vesting = [];

  for (let i = 0; i < data_utxos.length; i++) {
    if (data_utxos[i].utxo.type === "LockThenTransfer") {
      if (data_utxos[i].utxo.lock.type === "UntilTime" && data_utxos[i].utxo.lock.content.timestamp > Date.now() / 1000) {
        vesting.push({
          coin: "ML",
          symbol: "ML",
          type: "Coin",
          amount: data_utxos[i].utxo.value.amount.decimal,
          unlock_time: data_utxos[i].utxo.lock.content.timestamp,
        });
      }
      if (data_utxos[i].utxo.lock.type === "ForBlockCount") {
        const res_tx = await fetch(NODE_API_URL + "/transaction/" + data_utxos[i].outpoint.source_id, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data_tx = await res_tx.json();

        const res_block = await fetch(NODE_API_URL + "/block/" + data_tx.block_id, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data_block = await res_block.json();

        if (data_utxos[i].utxo.lock.content + data_block.height > block_height) {
          vesting.push({
            coin: "ML",
            symbol: "ML",
            type: "Coin",
            amount: data_utxos[i].utxo.value.amount.decimal,
            unlock_time: data_block.header.timestamp.timestamp + data_utxos[i].utxo.lock.content * 60 * 2,
            unlock_block: data_utxos[i].utxo.lock.content + data_block.height,
          });
        }
      }
    }
  }

  // token balances
  const token_balances: any = {};

  for (let i = 0; i < data_utxos.length; i++) {
    if (data_utxos[i].utxo.type === "Transfer") {
      if (data_utxos[i].utxo.value.type === "TokenV1") {
        const token_id = data_utxos[i].utxo.value.token_id;
        if (!token_balances[token_id]) {
          token_balances[token_id] = {
            amount: 0,
            amount_locked: 0,
          };
        }
        token_balances[token_id].amount += +data_utxos[i].utxo.value.amount.decimal;
      }
    }
  }

  // get token info for each token
  const token_info: any = {};
  for (const token_id in token_balances) {
    const res_token = await fetch(NODE_API_URL + "/token/" + token_id, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data_token = await res_token.json();
    token_info[token_id] = data_token;
  }

  const token_wallet_data = Object.keys(token_balances).map((token_id) => {
    return {
      coin: token_info[token_id].token_ticker.string,
      symbol: token_info[token_id].token_ticker.string,
      type: "Token",
      amount: token_balances[token_id].amount,
      amount_locked: 0,
      token_id: token_id,
    };
  });

  let response: AddressResponse = {};

  const bridgeTreasuryAddresses = ["mtc1q83x75alqe0wptrfrz5jv3a6n3qayzlacy9mnjvj", "mtc1q9d860uag5swe78ac9c2lct9mkctfyftqvwj3ypa"];

  if (isMainNetwork && bridgeTreasuryAddresses.includes(params.address)) {
    response.note = "This is Bridge Treasury Wallet Address for tokens transitioning from ERC20 to Mintlayer Mainnet.";
  }

  response.address = data.address;
  response.wallet = [
    {
      coin: "ML",
      symbol: "ML",
      type: "Coin",
      amount: data.coin_balance.decimal,
      amount_locked: data.locked_coin_balance.decimal || "",
      vesting: vesting,
    },
    ...token_wallet_data,
  ];
  response.updated_at = data.updated_at;
  response.block_included = data.block_included;
  response.transaction_history = data.transaction_history;
  response.transaction_count = data.transaction_history.length;
  response.delegations = data_delegations;

  return NextResponse.json({ response });
}
