import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

async function getTokenRecursive(offset: number, token_ids: any = []): Promise<any> {
  const res = await fetch(NODE_API_URL + "/token?offset=" + offset, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  const updated_token_ids = [...token_ids, ...data];

  if (data.length > 10) {
    return await getTokenRecursive(offset + 10, updated_token_ids);
  }

  // deduplicate token_ids
  return updated_token_ids.reduce((acc: any, token: any) => {
    if (!acc.find((t: any) => t === token)) {
      acc.push(token);
    }
    return acc;
  }, []);
}

export async function GET() {
  const data = await getTokenRecursive(0);

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
        total_supply:
          typeof tokenData[index].total_supply === "string"
            ? tokenData[index].total_supply
            : tokenData[index].total_supply.Fixed.atoms / tokenData[index].number_of_decimals,
        circulating_supply: tokenData[index].circulating_supply.decimal,
      };
    })
    .filter((token: any) => !token.error);

  let response: any = [];

  response = tokenDataWithId;

  return NextResponse.json(response);
}
