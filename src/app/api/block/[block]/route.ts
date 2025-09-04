import { NextResponse } from "next/server";
import { getUrl, getUrlSide } from "@/utils/network";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

async function getBlocksRecursive(block_id: string, limit: number, apiUrl: string): Promise<any[]> {
  let blocks = [];
  if (limit > 0 && block_id) {
    try {
      const block_response = await fetch(apiUrl + "/block/" + block_id, {
        cache: "force-cache", // block content is not changing
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await block_response.json();

      if (!data.error) {
        blocks.push(data);
        blocks = blocks.concat(await getBlocksRecursive(data.header.previous_block_id, limit - 1, apiUrl));
      }
    } catch (error) {
      console.error("Error fetching block for median time:", error);
    }
  }
  return blocks;
}

function calculateMedianTimePast(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  const sorted = [...timestamps].sort((a, b) => a - b);
  const medianIndex = Math.floor(sorted.length / 2);
  return sorted[medianIndex];
}

type AddressResponse = {
  hash?: string;
  block?: string;
  height?: string;
  transactions?: any[];
  transactions_count?: number;
  parent_hash?: string;
  timestamp?: number;
  info?: {
    merkle_root?: string;
    target_difficulty?: number;
    median_time?: number;
  };
  pool?: string;
  summary?: {
    total_inputs?: number;
    total_outputs?: number;
    total_fee?: any;
  };
};

export async function GET(request: Request, { params }: { params: { block: string } }) {
  const { searchParams } = new URL(request.url);
  const transactionsPage = Number(searchParams.get("transactionsPage")) || 1;
  const transactionsPerPage = Number(searchParams.get("transactionsPerPage")) || 10;

  const getHash = async (apiUrl: string) => {
    const chain_height_hash = await fetch(apiUrl + "/chain/" + params.block, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const hash = await chain_height_hash.json();
    return hash;
  };

  const getBlockByHash = async (apiUrl: string, hash: string) => {
    const res = await fetch(apiUrl + "/block/" + hash, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };

  const getBlockByHeightOrHash = async (apiUrl: string) => {
    const isHeight = /^[0-9]+$/.test(params.block);
    let hash = params.block;

    if (isHeight) {
      const blockHash = await getHash(apiUrl);
      if (blockHash.error) {
        return { error: "Block not found" };
      }

      hash = blockHash;
    }

    const data = await getBlockByHash(apiUrl, hash);
    data.hash = hash;
    return data;
  };

  const data = await getBlockByHeightOrHash(NODE_API_URL);

  if (data.error) {
    // try another node
    const anotherNodeData = await getBlockByHeightOrHash(NODE_SIDE_API_URL);

    if (anotherNodeData.height) {
      return NextResponse.json({ error: "Block found in another network" }, { status: 404 });
    }
    return NextResponse.json({ error: data.error }, { status: 404 });
  }

  let total_inputs = 0;
  let total_outputs = 0;
  let total_fee = BigInt(0);

  data.body.transactions.forEach((tx: any) => {
    const amount_inputs = tx?.inputs?.reduce((acc: number, { utxo: value, input }: any) => {
      if (value?.type === "Transfer") {
        return parseFloat(value?.value?.amount?.decimal) + acc;
      }
      if (value?.type === "DelegateStaking") {
        return parseFloat(value?.amount?.decimal) + acc;
      }
      if (value?.type === "LockThenTransfer") {
        return parseFloat(value?.value?.amount?.decimal) + acc;
      }
      if (value?.type === "CreateStakePool") {
        return parseFloat(value?.data?.amount?.decimal) + acc;
      }
      if (value === null && input.input_type === "Account") {
        return parseFloat(input.amount.decimal) + acc;
      }
      return acc;
    }, 0);

    const amount_outputs = tx?.outputs?.reduce((acc: number, value: any) => {
      if (value?.type === "Transfer") {
        return parseFloat(value?.value?.amount?.decimal) + acc;
      }
      if (value?.type === "DelegateStaking") {
        return parseFloat(value?.amount?.decimal) + acc;
      }
      if (value?.type === "LockThenTransfer") {
        return parseFloat(value?.value?.amount?.decimal) + acc;
      }
      if (value?.type === "CreateStakePool") {
        return parseFloat(value?.data?.amount?.decimal) + acc;
      }
      return acc;
    }, 0);

    amount_outputs && (total_outputs += amount_outputs);
    amount_inputs && (total_inputs += amount_inputs);
    total_fee += BigInt(tx.fee.atoms);
  });

  let response: AddressResponse = {};

  response.info = {};

  response.hash = data.hash;
  response.height = data.height;
  response.transactions = data.body.transactions.slice((transactionsPage - 1) * transactionsPerPage, transactionsPage * transactionsPerPage).map((tx: any) => {
    tx.total_inputs = tx.inputs.length;
    tx.total_outputs = tx.outputs.length;
    tx.inputs = tx.inputs.slice(0, 5);
    tx.outputs = tx.outputs.slice(0, 5);
    return tx;
  });
  response.transactions_count = data.body.transactions.length;
  response.parent_hash = data.header.previous_block_id;
  response.timestamp = data.header.timestamp.timestamp;
  response.pool = data.body.reward[0].pool_id;
  response.info.merkle_root = data?.header?.merkle_root;
  response.info.target_difficulty = parseInt(data?.header?.consensus_data.target, 16) / (Math.pow(2, 256) - 1);

  try {
    const blocks = await getBlocksRecursive(data.header.previous_block_id, 10, NODE_API_URL);
    const timestamps = [data.header.timestamp.timestamp, ...blocks.map(block => block.header.timestamp.timestamp)]
      .filter(timestamp => timestamp && typeof timestamp === 'number');

    if (timestamps.length > 0) {
      response.info.median_time = calculateMedianTimePast(timestamps);
    } else {
      response.info.median_time = data.header.timestamp.timestamp; // fallback to current block timestamp
    }
  } catch (error) {
    console.error("Error calculating median time:", error);
    response.info.median_time = data.header.timestamp.timestamp; // fallback to current block timestamp
  }

  response.summary = {
    total_inputs,
    total_outputs,
    total_fee: (Number(total_fee) / 1e11).toString(),
  };

  return NextResponse.json(response);
}
