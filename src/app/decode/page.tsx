"use client";
import React, { useState } from "react";
import { Hero } from "@/app/_components/hero";
import { Summary } from "@/app/_components/summary";
import { HeadingBox } from "@/app/_components/heading_box";
import { Io } from "@/app/tx/[tx]/_components/io";
import { getCoin } from "@/utils/network";
import { formatML } from "@/utils/numbers";
import { Icon } from "@/app/_components/heading_box/icon";

// Icons
import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_size from "@/app/(homepage)/_icons/16px/size.svg";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import icon_transfer from "@/app/(homepage)/_icons/24px/transfer.svg";
import icon_from_to from "@/app/(homepage)/_icons/24px/from_to.svg";
import icon_transactions from "@/app/(homepage)/_icons/24px/txs.svg";

const coin = getCoin();

export default function DecodePage() {
  const [hexInput, setHexInput] = useState("");
  const [decodedData, setDecodedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = async () => {
    if (!hexInput.trim()) {
      setError("Please enter transaction hex data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transaction/decode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hex: hexInput.trim(),
          network: 1,
          // type: "signed",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decode transaction");
      }

      setDecodedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setDecodedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHexInput("");
    setDecodedData(null);
    setError(null);
  };

  return (
    <>
      <Hero>
        <div className="max-w-6xl md:mx-auto px-5">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Transaction Decoder</div>
          </div>

          {/* Input Section */}
          <div className="grid md:grid-cols-1 gap-4 mb-8">
            <div className="bg-white p-6">
              <div className="mb-4">
                <label htmlFor="hex-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Hex Data
                </label>
                <textarea
                  id="hex-input"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="Paste your transaction hex data here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-100 focus:border-transparent resize-vertical font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDecode}
                  disabled={loading || !hexInput.trim()}
                  className="px-6 py-2 bg-primary-100 text-white rounded-md hover:bg-primary-110 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Decoding..." : "Decode Transaction"}
                </button>

                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Decoded Data */}
          {decodedData?.decoded && (
            <div className="grid md:grid-cols-1 gap-4 mb-8">
              <div className="bg-white p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Raw Decoded Transaction
                    {decodedData.transaction_type && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {decodedData.transaction_type}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This shows the decoded transaction data before augmentation.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(decodedData.decoded, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Preview */}
          {decodedData && (
            <>
              <div className="grid md:grid-cols-12 gap-4 mb-8">
                <div className="md:col-span-8 md:mr-20">
                  <Summary
                    layout="narrow"
                    data={[
                      {
                        title: "Transaction ID",
                        icon: icon_hash,
                        iconTooltip: "Transaction ID",
                        value: decodedData.id,
                        copy: decodedData.id,
                      },
                      {
                        title: "Status",
                        value: "Decoded (Unconfirmed)",
                        icon: icon_transactions,
                        iconTooltip: "Transaction Status",
                      },
                      {
                        title: "Version",
                        value: decodedData.version_byte || 1,
                        icon: icon_size,
                        iconTooltip: "Version",
                      },
                    ]}
                  />
                </div>
                <div className="md:col-span-4 grid md:grid-cols-2 grid-cols-1 grid-rows-2 gap-4 md:-ml-20">
                  <div>
                    <HeadingBox
                      title="Decoded"
                      subtitle="Status"
                      icon={<Icon src={icon_transactions} />}
                      iconTooltip="Transaction Status"
                    />
                  </div>
                  <div>
                    <HeadingBox
                      info={[
                        { title: decodedData.inputs?.length || 0, subtitle: "Input" },
                        { title: decodedData.outputs?.length || 0, subtitle: "Output" },
                      ]}
                      icon={<Icon src={icon_from_to} />}
                      iconTooltip="Input Output"
                    />
                  </div>
                  <div>
                    <HeadingBox
                      title={decodedData.fee?.decimal ? `${formatML(decodedData.fee.decimal)} ${coin}` : "Estimated"}
                      subtitle="Transaction fee"
                      icon={<Icon src={icon_fee} />}
                      iconTooltip="Transaction fee"
                    />
                  </div>
                  <div>
                    <HeadingBox
                      title={`${formatML(decodedData.amount || 0)} ${coin}`}
                      subtitle="Total value transferred"
                      icon={<Icon src={icon_transfer} />}
                      iconTooltip="Total value transferred"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Hero>

      {/* Input/Output Details */}
      {decodedData && (
        <Io
          data={{
            inputs: decodedData.inputs || [],
            outputs: decodedData.outputs || []
          }}
          tokens={{}}
        />
      )}
    </>
  );
}
