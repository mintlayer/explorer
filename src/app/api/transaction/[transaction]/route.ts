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

/**
 * Augment outputs with spent status by checking each output's spent status
 */
async function augmentOutputsWithSpentStatus(transactionId: string, outputs: any[]): Promise<any[]> {
  const augmentedOutputs = await Promise.all(outputs.map(async (output: any, index: number) => {
    try {
      // Fetch spent status for this output
      const res = await fetch(`${NODE_API_URL}/transaction/${transactionId}/output/${index}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch spent status for ${transactionId}/output/${index}`);
        return {
          ...output,
          spent: null // Unknown spent status
        };
      }

      const spentData = await res.json();

      return {
        ...output,
        spent: spentData.spent || false
      };
    } catch (error) {
      console.warn(`Error fetching spent status for ${transactionId}/output/${index}:`, error);
      return {
        ...output,
        spent: null // Unknown spent status on error
      };
    }
  }));

  return augmentedOutputs;
}

export async function GET(request: Request, { params }: { params: { transaction: string } }) {
  const transaction_id = (await params).transaction;
  const getTransaction = async (apiUrl: string) => {
    const res = await fetch(apiUrl + "/transaction/" + transaction_id, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  };

  const data = await getTransaction(NODE_API_URL);

  if (data.confirmations === 0) {
    // get block height
    const chain_tip = await fetch(NODE_API_URL + "/chain/tip", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const chain_tip_data = await chain_tip.json();
    const { block_height } = chain_tip_data;

    // fill utxo with data. There is an issue, utxo is not known but we have source_id and index, need to fetch that and augment to input.utxo
    const inputs = data.inputs.map(async ({ input }: any) => {
      if(!input.input_type) {
        return {
          input,
          utxo: null,
        };
      }

      if(input.input_type !== 'UTXO'){
        return {
          input,
          utxo: null,
        };
      }
      const res = await fetch(NODE_API_URL + "/transaction/" + input.source_id, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const tx = await res.json();

      return {
        input,
        utxo: tx.outputs[input.index],
      };
    });

    const inputs_data = await Promise.all(inputs);
    data.inputs = inputs_data;

    // Augment outputs with spent status
    const augmentedOutputs = await augmentOutputsWithSpentStatus(transaction_id, data.outputs || []);

    return NextResponse.json({
      ...data,
      id: data.id,
      hash: data.id,
      confirmations: 0,
      used_tokens: [],
      inputs: data.inputs || [],
      outputs: augmentedOutputs,
      block_height: parseInt(block_height) + 1,
      version_byte: 1,
      fee: data.fee.decimal, // half of hex length in kb
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

  // Augment outputs with spent status
  const augmentedOutputs = await augmentOutputsWithSpentStatus(transaction_id, data.outputs || []);

  response.confirmations = data.confirmations;
  response.fee = data.fee.decimal;
  response.timestamp = data.timestamp;
  response.hash = transaction_id;
  response.inputs = data.inputs;
  response.outputs = augmentedOutputs;
  response.amount = Number(amount);
  response.version_byte = data.version_byte;
  response.block_height = block.height;
  response.used_tokens = Array.from(usedTokens);

  return NextResponse.json(response);
}
