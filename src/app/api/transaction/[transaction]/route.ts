import { NextResponse } from "next/server";
import { getUrl, getUrlSide } from "@/utils/network";

const NODE_API_URL = getUrl();

const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

type TransactionResponse = {
  hash?: string;
  fee?: string;
  block?: string;
  timestamp?: string;
  inputs?: any[];
  outputs?: any[];
  amount?: number;
  confirmations?: number;
  version_byte?: number;
  block_height?: number;
  used_tokens?: string[];
};

export async function GET(request: Request, { params }: { params: { transaction: string } }) {
  const getTransaction = async (apiUrl: string) => {
    const res = await fetch(apiUrl + "/transaction/" + params.transaction, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  };

  const data = await getTransaction(NODE_API_URL);

  if (data.source === 'mempool') {
    return NextResponse.json({
      ...data,
      timestamp: Math.floor(Date.now() / 1000),
      id: data.tx_id,
      hash: data.tx_id,
      confirmations: 0,
      used_tokens: [],
      inputs: [],
      outputs: [],
      block_height: '~123123',
      version_byte: 1,
      fee: data.transaction.length / 2 / 1000,
      amount: 0,
    }, { status: 200 });
  }

  if (data.error === "Invalid transaction Id") {
    return NextResponse.json({ error: "Invalid Txn hash" }, { status: 400 });
  }

  if (data.error) {
    // try another node
    const anotherNodeData = await getTransaction(NODE_SIDE_API_URL);

    if (anotherNodeData.id) {
      return NextResponse.json({ error: "Transaction found in another network" }, { status: 404 });
    }
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  let response: TransactionResponse = {};

  const usedTokens: Set<string> = new Set();

  const amount = data?.outputs?.reduce((acc: any, value: any) => {
    if (value?.value?.token_id) {
      usedTokens.add(value?.value?.token_id);
    }

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
    if (value?.type === "CreateDelegationId") {
      return acc;
    }
    return acc;
  }, 0);

  const data_block = await fetch(NODE_API_URL + "/block/" + data.block_id, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const block = await data_block.json();

  response.confirmations = data.confirmations;
  response.fee = data.fee.decimal;
  response.timestamp = data.timestamp;
  response.hash = params.transaction;
  response.inputs = data.inputs;
  response.outputs = data.outputs;
  response.amount = Number(amount);
  response.version_byte = data.version_byte;
  response.block_height = block.height;
  response.used_tokens = Array.from(usedTokens);

  return NextResponse.json(response);
}
