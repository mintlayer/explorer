import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const pool = (await params).pool;
  const res = await fetch(NODE_API_URL + "/pool/" + pool + "/delegations", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  let response: any = {};

  response.delegations = data;

  return NextResponse.json(response);
}
