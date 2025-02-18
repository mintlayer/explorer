import { NextResponse } from "next/server";

import db from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const row: any = db.prepare("SELECT * FROM pools WHERE id = 1").get();

  const pools = JSON.parse(row.result);

  const response = pools;

  return NextResponse.json(response);
}
