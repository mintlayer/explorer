import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";
import {env} from "next-runtime-env";

const NODE_API_URL = getUrl();
const network = env("NEXT_PUBLIC_NETWORK") || "testnet";

export const dynamic = "force-dynamic";

export async function GET() {
  // const data = []
  const res = await fetch(NODE_API_URL + '/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
      type: '/token?offset=:address',
      network: network === 'mainnet' ? 0 : 1,
    }),
  })

  const tokens = await res.json();

  const ids = tokens.results.flat();

  // @ts-ignore
  const uniqueIds = [...new Set(ids)];

  const data = uniqueIds;

  // fetch data for each token in loop from data
  const tokenData = await Promise.all(
    data.map(async (token: any) => {
      const tokenRes = await fetch(NODE_API_URL + "/token/" + token, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const tokenData = await tokenRes.json();
      return tokenData;
    }),
  );

  // merge token_id with token data
  const tokenDataWithId = data
    .map((token: any, index: number) => {
      if (tokenData[index].error) {
        return {
          id: token,
          error: tokenData[index].error,
        };
      }
      return {
        id: token,
        frozen: tokenData[index].frozen,
        is_locked: tokenData[index].is_locked,
        is_token_freezable: tokenData[index].is_token_freezable,
        is_token_unfreezable: tokenData[index].is_token_unfreezable,
        token_ticker: tokenData[index].token_ticker.string,
        metadata_uri: tokenData[index].metadata_uri.string,
        total_supply:
          typeof tokenData[index].total_supply === "string"
            ? tokenData[index].total_supply
            : tokenData[index].total_supply.Fixed.atoms / Math.pow(10, tokenData[index].number_of_decimals),
        circulating_supply: tokenData[index].circulating_supply.decimal,
      };
    })
    .filter((token: any) => !token.error);

  let response: any = [];

  response = tokenDataWithId;

  return NextResponse.json(response);
}
