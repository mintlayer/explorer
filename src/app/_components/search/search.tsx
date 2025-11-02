"use client";
import {useEffect, useRef, useState} from "react";
import { useCallback } from "react";
import classnames from "classnames";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { debounce } from "@/utils/time";
import { formatDate, shortenString } from "@/utils/format";
import { getMatcher } from "@/utils/network";

import icon_hash from "@/app/(homepage)/_icons/16px/hash.svg";
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_transactions from "@/app/(homepage)/_icons/16px/transactions.svg";
import icon_coin from "@/app/(homepage)/_icons/16px/coin.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import icon_pickaxe from "@/app/(homepage)/_icons/16px/pickaxe.svg";
import search from "./search.svg";
import close from "./close.svg";

// matchers
const block_matcher = getMatcher("block");
const block_hash_matcher = getMatcher("blockHash");
const tx_matcher = getMatcher("tx");
const address_matcher = getMatcher("address");
const pool_matcher = getMatcher("pool");
const delegation_matcher = getMatcher("delegation");
const token_matcher = getMatcher("token");
const token_name_matcher = getMatcher("tokenName");

// url patterns
const block_url_pattern = (block_number: string) => `/block/${block_number}`;
const tx_url_pattern = (tx_hash: string) => `/tx/${tx_hash}`;
const address_url_pattern = (address: string) => `/address/${address}`;
const pool_url_pattern = (pool: string) => `/pool/${pool}`;
const delegation_url_pattern = (delegation: string) => `/delegation/${delegation}`;
const token_url_pattern = (token: string) => `/token/${token}`;
const nft_url_pattern = (nft: string) => `/nft/${nft}`;

const icons: any = {
  block: icon_block,
  transactions: icon_transactions,
  coin: icon_coin,
  time: icon_time,
  pickaxe: icon_pickaxe,
  hash: icon_hash,
};

const getQueryType = (query: string) => {
  const types = [];
  if (query.match(tx_matcher)) {
    types.push("transaction");
  }
  if (query.match(block_matcher) || query.match(block_hash_matcher)) {
    types.push("block");
  }
  if (query.match(address_matcher)) {
    types.push("address");
  }
  if (query.match(pool_matcher)) {
    types.push("pool");
  }
  if (query.match(delegation_matcher)) {
    types.push("delegation");
  }
  if (query.match(token_matcher)) {
    types.push("token");
  }
  if (query.match(token_name_matcher)) {
    types.push("token_ticker");
  }
  return types;
};

const getQuerySkeleletonData = (query: string) => {
  const types = getQueryType(query);
  const data: any = [];
  const type = types[0];
  if (type === "transaction") {
    data.push({ icon: "transactions", value: shortenString(query) });
  }
  if (type === "block") {
    data.push(
      { icon: "block", value: "#" + query },
      { icon: "pickaxe", value: null },
      { icon: "transactions", value: null },
      { icon: "time", value: null }
    );
  }
  if (type === "address") {
    data.push({ icon: "hash", value: shortenString(query) });
  }
  if (type === "pool") {
    data.push({ icon: "hash", value: shortenString(query) });
  }
  if (type === "delegation") {
    data.push({ icon: "hash", value: shortenString(query) });
  }
  if (type === "token") {
    data.push({ icon: "hash", value: shortenString(query) });
  }
  if (type === "token_ticker") {
    data.push({ icon: "hash", value: query });
  }
  return data;
};

const pushByType = (push: any, type: string, query: string) => {
  if (type === "block") {
    push(block_url_pattern(query));
  }
  if (type === "pool") {
    push(pool_url_pattern(query));
  }
  if (type === "transaction") {
    push(tx_url_pattern(query.startsWith("0x") ? query.slice(2) : query));
  }
  if (type === "transaction or block") {
    push(tx_url_pattern(query.startsWith("0x") ? query.slice(2) : query));
  }
  if (type === "address") {
    push(address_url_pattern(query));
  }
  if (type === "delegation") {
    push(delegation_url_pattern(query));
  }
  if (type === "token") {
    push(token_url_pattern(query));
  }
};

export const Search = () => {
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]); // [block, tx, address, token]
  const abortControllerRef = useRef<AbortController | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onQueryUpdate = useCallback(
    debounce(async (query: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);

      try {
        const res = await fetch("/api/search", {
          cache: "no-store",
          method: "POST",
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data);
      } catch (error) {
        // @ts-ignore
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    let [type] = getQueryType(query);
    if (type) {
      setResults([]);
      onQueryUpdate(query);
    }
  }, [query, onQueryUpdate]);

  const handleOnChangeEvent = (event: any) => {
    setQuery(event.target.value);
  };

  const handleOnKeyPress = (event: any) => {
    // if enter pressed
    if (event.charCode === 13) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      let [type] = getQueryType(query);

      pushByType(push, type, query);
      setQuery("");
      setResults([]);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
  };

  const onResultClick = (type: any, query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    pushByType(push, type, query);
  };

  const isWrongQuery = query && getQueryType(query).length === 0;
  const inputWrapperClassName = classnames(
    "flex items-center h-12 border-1 border-solid border-[#c9cccb]",
    "py-3 px-6 bg-white box-border focus-within:border-1 focus-within:border-solid",
    "focus-within:outline-1 focus-within:outline",
    isWrongQuery ? "focus-within:border-red-600 focus-within:outline-red-600" : "focus-within:border-primary-100 focus-within:outline-primary-100",
  );

  const mergedResults = [
    ...(!isWrongQuery && query.length > 0 && results.length === 0
      ? [
          {
            type: getQueryType(query).join(" or "),
            data: getQuerySkeleletonData(query),
          },
        ]
      : []),
    ...results,
  ];

  return (
    <div className="relative w-full md:min-w-full">
      <div className={inputWrapperClassName}>
        <Image src={search} alt={""} />
        <input
          className="border-none outline-none ml-2 w-full placeholder:text-base-gray placeholder:text-base"
          value={query}
          onChange={handleOnChangeEvent}
          onKeyPress={handleOnKeyPress}
          type="text"
          placeholder="Search by hash (blocks, transactions, address or pools)"
        />
        {query.length > 0 && <Image src={close} className="cursor-pointer" onClick={handleReset} alt={""} />}
      </div>
      {query.length > 0 && (
        <div className="absolute top-16 w-full border-2 border-secondary-110">
          {mergedResults.length > 0 ? (
            mergedResults.map((result: any, index: number) => (
              <ResultItem key={"result" + index + query} result={result} query={query} onClick={onResultClick} skeleton={loading} />
            ))
          ) : (
            <div className="cursor-pointer bg-white w-full border-solid border-b-4 border-b-red-600 shadow-search">
              <div className="text-sm px-4 py-2 border-b-2 border-secondary-100 bg-white capitalize animate-pulse">Not found</div>
              <div className="px-4 py-2 text-[14px] break-all">
                The term “{query}”, is not a valid hash, transaction ID, contract principal, or account address principal
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function ResultItem({ result, query, onClick, skeleton }: any) {
  const handleOnClick = () => {
    if(result.link){
      window.location.href = result.link;
      return;
    }
    onClick(result.type, query);
  };

  return (
    <div className="cursor-pointer bg-white w-full border-b-4 border-primary-100 hover:bg-secondary-100 shadow-search" onClick={handleOnClick}>
      <div className="text-sm px-4 py-2 border-b-2 border-secondary-100 bg-white capitalize">{result.type}</div>
      <div className="px-4 py-2 text-[14px]">
        <div className="grid-cols-2 grid gap-2 py-2">
          {result.data.map(({ icon, value }: any, index: number) => (
            <div
              key={query + index}
              className={`flex items-center ${skeleton ? "animate-pulse" : ""} first:text-[20px] first:font-bold first:text-primary-110`}
            >
              <Image className="mr-2" src={icons[icon]} alt={""} />
              {value === null ? <div className="bg-secondary-100 w-full h-5 rounded block"></div> : icon !== "time" ? value : formatDate(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
