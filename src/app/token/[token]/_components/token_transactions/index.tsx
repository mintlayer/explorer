'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, shortenString } from "@/utils/format";
import { formatML } from "@/utils/numbers";
import { getCoin } from "@/utils/network";
import { Copy } from "@/app/tx/[tx]/_components/copy";

import icon_tx from "@/app/(homepage)/_icons/16px/transactions.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import arrow from "@/app/(homepage)/_icons/16px/arrow.svg";

const coin = getCoin();

// Determine transaction type based on inputs/outputs
function getTransactionType(tx: any): { type: string; label: string; color: string } {
  const inputs = tx.inputs || [];
  const outputs = tx.outputs || [];

  // Check for order-related operations
  for (const input of inputs) {
    if (input.input?.input_type === 'AccountCommand') {
      const command = input.input.command;
      if (command === 'FillOrder') {
        return { type: 'swap', label: 'Swap', color: 'bg-purple-100 text-purple-800' };
      }
      if (command === 'ConcludeOrder') {
        return { type: 'conclude_order', label: 'Conclude Order', color: 'bg-orange-100 text-orange-800' };
      }
    }
  }

  // Check outputs for token operations
  for (const output of outputs) {
    if (output.type === 'CreateOrder') {
      return { type: 'create_order', label: 'Create Order', color: 'bg-blue-100 text-blue-800' };
    }
    if (output.type === 'IssueFungibleToken' || output.type === 'IssueNft') {
      return { type: 'issue', label: 'Issue Token', color: 'bg-green-100 text-green-800' };
    }
    if (output.type === 'Mint') {
      return { type: 'mint', label: 'Mint', color: 'bg-emerald-100 text-emerald-800' };
    }
    if (output.type === 'Burn') {
      return { type: 'burn', label: 'Burn', color: 'bg-red-100 text-red-800' };
    }
  }

  // Check for token transfers
  const hasTokenInput = inputs.some((i: any) => i.utxo?.value?.type === 'TokenV1');
  const hasTokenOutput = outputs.some((o: any) => o.value?.type === 'TokenV1');

  if (hasTokenInput || hasTokenOutput) {
    return { type: 'transfer', label: 'Transfer', color: 'bg-gray-100 text-gray-800' };
  }

  return { type: 'unknown', label: 'Transaction', color: 'bg-gray-100 text-gray-600' };
}

// Get token amounts from transaction
function getTokenAmounts(tx: any, tokenId: string): { input: string; output: string } {
  const inputs = tx.inputs || [];
  const outputs = tx.outputs || [];

  let inputAmount = BigInt(0);
  let outputAmount = BigInt(0);

  for (const input of inputs) {
    if (input.utxo?.value?.type === 'TokenV1' && input.utxo?.value?.token_id === tokenId) {
      inputAmount += BigInt(input.utxo.value.amount?.atoms || 0);
    }
  }

  for (const output of outputs) {
    if (output.value?.type === 'TokenV1' && output.value?.token_id === tokenId) {
      outputAmount += BigInt(output.value.amount?.atoms || 0);
    }
  }

  return {
    input: inputAmount > 0 ? formatML((Number(inputAmount) / 1e11).toString()) : '-',
    output: outputAmount > 0 ? formatML((Number(outputAmount) / 1e11).toString()) : '-',
  };
}

export function TokenTransactionsList({ token_id }: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState<number>(999999999);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const getTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/token/" + token_id + "/transactions?offset=" + offset, { cache: "no-store" });
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setTransactions(data.data);
          setHasMore(data.next_offset !== offset);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
      setLoading(false);
    };
    getTransactions();
  }, [token_id, offset]);

  const handlePrevious = () => {
    if (transactions.length > 0) {
      const lastTx = transactions[transactions.length - 1];
      // This is a simplified approach - in production you'd track offsets properly
      setOffset(offset - 10);
    }
  };

  const handleNext = () => {
    if (transactions.length > 0) {
      setOffset(offset + 10);
    }
  };

  return (
    <div className="">
      <div className="bg-white px-4 py-4">
        <div className="font-bold text-2xl mb-4">Token Transactions</div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-4 border-b border-gray-100">
                <div className="bg-secondary-100 h-6 w-24 rounded"></div>
                <div className="bg-secondary-100 h-6 w-32 rounded"></div>
                <div className="bg-secondary-100 h-6 w-20 rounded"></div>
                <div className="bg-secondary-100 h-6 w-40 rounded flex-1"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="h-[40px] text-left font-bold text-sm text-base-dark uppercase px-4">
                    <div className="flex items-center gap-2">
                      <Image src={icon_tx} alt="" className="w-4 h-4" data-tooltip-id="tooltip" data-tooltip-content="Transaction hash" />
                      <span>Tx Hash</span>
                    </div>
                  </th>
                  <th className="h-[40px] text-left font-bold text-sm text-base-dark uppercase px-4">Type</th>
                  <th className="h-[40px] text-center font-bold text-sm text-base-dark uppercase px-4">
                    <div className="flex items-center justify-center gap-2">
                      <span>Inputs</span>
                      <Image src={arrow} alt="" className="w-3 h-3" />
                      <span>Outputs</span>
                    </div>
                  </th>
                  <th className="h-[40px] text-right font-bold text-sm text-base-dark uppercase px-4">Fee</th>
                  <th className="h-[40px] text-right font-bold text-sm text-base-dark uppercase px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Image src={icon_time} alt="" className="w-4 h-4" data-tooltip-id="tooltip" data-tooltip-content="Date and time" />
                      <span>Date</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any, index: number) => {
                  const txType = getTransactionType(tx);
                  const tokenAmounts = getTokenAmounts(tx, token_id);

                  return (
                    <tr key={tx.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link className="text-primary-110 font-semibold" href={`/tx/${tx.id}`}>
                            {shortenString(tx.id, 4, 4)}
                          </Link>
                          <Copy text={tx.id} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${txType.color}`}>
                          {txType.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="font-medium">{tx.inputs?.length || 0}</span>
                          <Image src={arrow} alt="" className="w-3 h-3" />
                          <span className="font-medium">{tx.outputs?.length || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-sm">
                        {tx.fee?.decimal ? `${formatML(tx.fee.decimal)} ${coin}` : '-'}
                      </td>
                      <td className="py-4 px-4 text-right text-sm text-gray-600">
                        {tx.timestamp ? formatDate(Number(tx.timestamp)) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
