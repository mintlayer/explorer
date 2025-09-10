import { NextResponse } from "next/server";
import { getUrl, getUrlSide } from "@/utils/network";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

type BlockResponse = {
  hash?: string;
  block?: string;
  height?: string;
  transactions?: any[];
  transactions_count?: number;
  parent_hash?: string;
  timestamp?: number;
  info?: {
    merkle_root?: string;
  };
  pool?: string;
  summary?: {
    total_inputs?: number;
    total_outputs?: number;
    total_fee?: any;
  };
};

export async function GET(request: Request, { params }: { params: { before_height: string } }) {
  const before_height = params.before_height;

  // get 10 blocks before before_height use 10 parallel requests
  const getHash = async (apiUrl: string, height: string) => {
    const chain_height_hash = await fetch(apiUrl + "/chain/" + height, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const hash = await chain_height_hash.json();
    return hash;
  };
  const getHashes = async (apiUrl: string, height: string) => {
    const hashes = await Promise.all(
      Array.from({ length: 10 }, (_, i) => getHash(apiUrl, (parseInt(height) - i - 1).toString())),
    );
    return hashes;
  };
  const hashes = await getHashes(NODE_API_URL, before_height);
  console.log('hashes', hashes);

  // now get block data for each hash
  const getBlockByHash = async (apiUrl: string, hash: string) => {
    const res = await fetch(apiUrl + "/block/" + hash, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };
  const getBlocks = async (apiUrl: string, hashes: string[]) => {
    const blocks = await Promise.all(hashes.map((hash) => getBlockByHash(apiUrl, hash)));
    return blocks;
  };
  const blocks = await getBlocks(NODE_API_URL, hashes);
  console.log('blocks', blocks);

  let response: BlockResponse = {};

  response = {};

  return NextResponse.json(response);
}
