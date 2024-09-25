import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const res = await fetch(NODE_API_URL + "/token/" + params.token, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  const res_stats = await fetch(NODE_API_URL + "/statistics/token/" + params.token, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data_stats = await res_stats.json();

  let response: any = {};

  response = {
    ...data,
    ...data_stats,
  };

  return NextResponse.json(response);
}
