import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";
import { parseDecodedTx } from "./utils";

/**
 * Convert atoms string to decimal representation for coins
 * Coins use 11 decimal places (10^11 atoms = 1 unit)
 */
function atomsToDecimalCoin(atoms: string): string {
  const atomsBigInt = BigInt(atoms);
  const divisor = BigInt('100000000000'); // 10^11
  const wholePart = atomsBigInt / divisor;
  const fractionalPart = atomsBigInt % divisor;

  // if (fractionalPart === 0n) {
  //   return wholePart.toString();
  // }

  // Convert fractional part to string with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(11, '0');
  // Remove trailing zeros
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return `${wholePart}.${trimmedFractional}`;
}

// Import WASM functions
import {
  decode_signed_transaction_to_js,
  decode_partially_signed_transaction_to_js,
  get_transaction_id
} from "@/utils/mintlayer-crypto/pkg";

export const dynamic = "force-dynamic";

const NODE_API_URL = getUrl();

type DecodeRequest = {
  hex: string;
  network?: number;
  type?: 'signed' | 'partially_signed';
};

type TransactionResponse = {
  id?: string;
  hash?: string;
  fee?: any;
  inputs?: any[];
  outputs?: any[];
  confirmations?: number;
  version_byte?: number;
  block_height?: number;
  used_tokens?: string[];
  amount?: number;
  timestamp?: string;
  status?: string;
  transaction_type?: string;
  decoded?: any;
};

/**
 * Convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  // Remove 0x prefix if present
  const cleanHex = hex.replace(/^0x/, '');

  // Validate hex string
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error('Invalid hex string');
  }

  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }

  return new Uint8Array(cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

/**
 * Fetch UTXO data for inputs that reference other transactions
 */
async function augmentInputsWithUtxoData(inputs: any[]): Promise<any[]> {
  const augmentedInputs = await Promise.all(inputs.map(async (inputData: any) => {
    // If input is not UTXO type or already has utxo data, return as is
    if (inputData.input?.input_type !== 'UTXO' || inputData.utxo) {
      return inputData;
    }

    try {
      // Fetch the source transaction
      const res = await fetch(NODE_API_URL + "/transaction/" + inputData.input.source_id, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch UTXO data for ${inputData.input.source_id}`);
        return inputData;
      }

      const tx = await res.json();

      // Get the output at the specified index
      const utxo = tx.outputs?.[inputData.input.index];

      return {
        ...inputData,
        utxo: utxo || null
      };
    } catch (error) {
      console.warn(`Error fetching UTXO data for ${inputData.input.source_id}:`, error);
      return inputData;
    }
  }));

  return augmentedInputs;
}

export async function POST(request: Request) {
  try {
    // Validate request body
    let body: DecodeRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        error: "Invalid JSON in request body"
      }, { status: 400 });
    }

    if (!body.hex) {
      return NextResponse.json({
        error: "Missing hex data",
        details: "Request body must include 'hex' field with transaction data"
      }, { status: 400 });
    }

    if (typeof body.hex !== 'string') {
      return NextResponse.json({
        error: "Invalid hex data type",
        details: "Hex data must be a string"
      }, { status: 400 });
    }

    // Validate network parameter
    const network = body.network || 1;
    if (![0, 1, 2].includes(network)) {
      return NextResponse.json({
        error: "Invalid network",
        details: "Network must be 0 (regtest), 1 (mainnet), or 2 (testnet)"
      }, { status: 400 });
    }

    // Validate transaction type if provided
    if (body.type && !['signed', 'partially_signed'].includes(body.type)) {
      return NextResponse.json({
        error: "Invalid transaction type",
        details: "Type must be 'signed' or 'partially_signed'"
      }, { status: 400 });
    }

    // Convert hex to Uint8Array
    let transactionBytes: Uint8Array;
    try {
      transactionBytes = hexToUint8Array(body.hex);
    } catch (error) {
      return NextResponse.json({
        error: "Invalid hex data",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Decode the transaction using automatic type detection or specified type
    let decoded: any;
    let detectedType: string;

    if (body.type) {
      // Use specified type
      try {
        if (body.type === 'partially_signed') {
          decoded = decode_partially_signed_transaction_to_js(transactionBytes, network);
          detectedType = 'partially_signed';
        } else {
          decoded = decode_signed_transaction_to_js(transactionBytes, network);
          detectedType = 'signed';
        }
      } catch (error) {
        return NextResponse.json({
          error: "Failed to decode transaction",
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    } else {
      // Automatic type detection: try signed first, then partially_signed
      try {
        decoded = decode_signed_transaction_to_js(transactionBytes, network);
        detectedType = 'signed';
      } catch (signedError) {
        try {
          decoded = decode_partially_signed_transaction_to_js(transactionBytes, network);
          detectedType = 'partially_signed';
        } catch (partiallySignedError) {
          return NextResponse.json({
            error: "Failed to decode transaction",
            details: `Could not decode as signed transaction: ${signedError instanceof Error ? signedError.message : 'Unknown error'}. Could not decode as partially signed transaction: ${partiallySignedError instanceof Error ? partiallySignedError.message : 'Unknown error'}`
          }, { status: 400 });
        }
      }
    }

    // Calculate transaction ID
    let transactionId: string;
    try {
      transactionId = get_transaction_id(transactionBytes, false);
    } catch (error) {
      console.warn("Failed to calculate transaction ID:", error);
      transactionId = "unknown";
    }

    // Parse the decoded transaction into explorer format
    const parsedTx = parseDecodedTx(decoded);

    // Augment inputs with UTXO data
    const augmentedInputs = await augmentInputsWithUtxoData(parsedTx.inputs || []);

    // Calculate used tokens
    const usedTokens: Set<string> = new Set();

    // Check outputs for tokens
    parsedTx.outputs?.forEach((output: any) => {
      if (output?.value?.token_id) {
        usedTokens.add(output.value.token_id);
      }
    });

    // Check inputs for tokens
    augmentedInputs?.forEach((input: any) => {
      if (input?.utxo?.value?.token_id) {
        usedTokens.add(input.utxo.value.token_id);
      }
    });

    // Calculate total amount transferred
    const amount = parsedTx.outputs?.reduce((acc: number, output: any) => {
      if (output?.type === "Transfer" && output?.value?.amount?.decimal) {
        return parseFloat(output.value.amount.decimal) + acc;
      }
      if (output?.type === "DelegateStaking" && output?.amount?.decimal) {
        return parseFloat(output.amount.decimal) + acc;
      }
      if (output?.type === "LockThenTransfer" && output?.value?.amount?.decimal) {
        return parseFloat(output.value.amount.decimal) + acc;
      }
      if (output?.type === "CreateStakePool" && output?.data?.amount?.decimal) {
        return parseFloat(output.data.amount.decimal) + acc;
      }
      return acc;
    }, 0) || 0;

    // Calculate basic fee estimate (transaction size * base fee rate)
    // This is a rough estimate since we don't have all the context
    const transactionSizeBytes = transactionBytes.length;
    const baseFeePerByte = 100000000; // atoms per byte (rough estimate)
    const estimatedFeeAtoms = (transactionSizeBytes * baseFeePerByte).toString();

    // Create fee object with atoms and decimal representation
    const feeObject = {
      atoms: estimatedFeeAtoms,
      decimal: atomsToDecimalCoin(estimatedFeeAtoms)
    };

    // Get current block height for context
    let currentBlockHeight = 0;
    try {
      const chainTipRes = await fetch(NODE_API_URL + "/chain/tip", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (chainTipRes.ok) {
        const chainTipData = await chainTipRes.json();
        currentBlockHeight = chainTipData.block_height || 0;
      }
    } catch (error) {
      console.warn("Failed to fetch current block height:", error);
    }

    // Build response in explorer transaction format
    const response: TransactionResponse = {
      id: transactionId,
      hash: transactionId,
      confirmations: 0, // Decoded transactions are unconfirmed
      used_tokens: Array.from(usedTokens),
      inputs: augmentedInputs,
      outputs: parsedTx.outputs || [],
      version_byte: 1,
      fee: feeObject,
      amount: amount,
      status: 'decoded', // Indicate this is a decoded transaction
      transaction_type: detectedType, // Include the detected/specified transaction type
      decoded: decoded,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in transaction decode endpoint:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
