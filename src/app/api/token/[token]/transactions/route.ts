import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token;

  // query params offset
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") || 999999999;

  console.log(NODE_API_URL + "/token/" + token + '/transactions?offset=' + offset);

  const res = await fetch(NODE_API_URL + "/token/" + token + '/transactions?offset=' + offset, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  console.log('data', data);

  // Fetch full transaction details for each transaction
  const transactionsWithDetails = await Promise.all(
    data.map(async (item: { tx_id: string }) => {
      const txRes = await fetch(NODE_API_URL + "/transaction/" + item.tx_id, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const txData = await txRes.json();
      return txData;
    })
  );

  return NextResponse.json({
    data: transactionsWithDetails,
    next_offset: Number(data[data.length - 1].tx_global_index),
  });
}
