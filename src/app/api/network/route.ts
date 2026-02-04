import { NextResponse } from "next/server";
import { getNetwork } from "@/utils/network";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ network: getNetwork() });
}
