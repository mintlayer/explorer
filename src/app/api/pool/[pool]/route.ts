import { NextResponse } from "next/server";
import { getUrl, getUrlSide, isMainNetwork } from "@/utils/network";
import { effective_pool_balance, Network } from "@/utils/mintlayer-crypto/pkg";

const NODE_API_URL = getUrl();
const NODE_SIDE_API_URL = getUrlSide();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const pool = params.pool;
  const getPool = async (apiUrl: string) => {
    const res = await fetch(apiUrl + "/pool/" + pool, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };

  const data = await getPool(NODE_API_URL);

  if (data.error) {
    const anotherNodeData = await getPool(NODE_SIDE_API_URL);

    if (anotherNodeData.vrf_public_key) {
      return NextResponse.json({ error: "Pool found in another network" }, { status: 404 });
    }
    return NextResponse.json({ error: "Invalid pool Id" }, { status: 404 });
  }

  const res = await fetch(NODE_API_URL + "/pool/" + pool + "/delegations", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const delegations = await res.json();

  const delegations_balance = delegations.reduce((acc: number, delegation: any) => +acc + parseInt(delegation.balance.atoms), 0);

  const network = isMainNetwork ? Network.Mainnet : Network.Testnet;

  let response: any = {};

  response.pool = pool;

  const pool_balance = (BigInt(data.staker_balance.atoms) + BigInt(delegations_balance)).toString();

  // @ts-ignore
  response.pool_balance = (pool_balance / 1e11).toString();
  response.effective_pool_balance = effective_pool_balance(network, data.staker_balance.atoms, pool_balance);
  response.cost_per_block = data.cost_per_block.decimal;
  response.margin_ratio_per_thousand = data.margin_ratio_per_thousand.replace("%", "") * 10;
  response.margin_ratio = (data.margin_ratio_per_thousand.replace("%", "") * 10) / 1000;
  response.margin_ratio_percent = data.margin_ratio_per_thousand;
  response.staker_balance = data.staker_balance.decimal;
  response.vrf_public_key = data.vrf_public_key;
  response.decommission_destination = data.decommission_destination;
  response.delegations_balance = (delegations_balance / 1e11).toString();
  response.mark = 0;

  return NextResponse.json(response);
}
