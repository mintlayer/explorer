import { NextResponse } from "next/server";

// @ts-ignore
import cache from "@/app/api/_utils/cache";
import { get_total_subsidy } from "@/utils/emission";
import { getCMCInfo } from "@/utils/exchange";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cachedData = cache.get("summary_data");
  if (cachedData) {
    console.log("Summary: Returning cached data");
    return NextResponse.json(cachedData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  console.log("Summary: Gather data");

  const last_block = await fetch("https://api-server.mintlayer.org/api/v2/chain/tip");
  const last_block_data = await last_block.json();
  const { block_height } = last_block_data;

  const exchange_rate = await getCMCInfo().catch(() => {
    return {
      price: 0,
    };
  });

  const req_circulating_supply_ml = await fetch("https://api-server.mintlayer.org/api/v2/statistics/coin");
  const circulating_supply_ml = await req_circulating_supply_ml.json();

  const req_circulating_supply_erc20 = await fetch("https://token.api.mintlayer.org/api/circulatingerc");
  const circulating_supply_erc20 = await req_circulating_supply_erc20.text();

  const req_total_supply_erc20 = await fetch("https://token.api.mintlayer.org/api/totalclaimed");
  const total_supply_erc20 = await req_total_supply_erc20.text();

  const req_staking = await fetch("https://explorer.mintlayer.org/api/pool/summary");
  const staking = await req_staking.json();

  const bridge_addresses = [
    "mtc1q83x75alqe0wptrfrz5jv3a6n3qayzlacy9mnjvj",
    "mtc1q9d860uag5swe78ac9c2lct9mkctfyftqvwj3ypa",
    "mtc1qy7pwq9qu3ugk27zn34l54z54tel5vnjssnk66y8",
    "mtc1q93rq4kqem8rme005v38p6v2p6xpgvqc6qrxtuwf",
    "mtc1q9jl52r05j65wupdsxa53jp9ks9tctc2rynpuacg",
    "mtc1qy74ylf2p4cpht2pn2cwjz8mp8j80v7n4q9fuk4v",
    "mtc1qxpngdalz3h0cwrd0y3ydlrpgqgatl8yfv4eprcp",
    "mtc1q90wa00fffsvfyps7hs3dk97pldsl460hgkj3dnq",
    "mtc1qxalhy7y3w0mrzkv3gdygkp3tkapyk77aczzgldq",
    "mtc1q9twmvnfmxxhdd78hfe4ves0d77xthr5fqr4wewu",
    "mtc1q83a50h2xe0ka2uzljdf0s0auvuewxs5cvnemc3s",
  ];

  const bridge_balance = await bridge_addresses.reduce(async (accPromise, address) => {
    const acc = await accPromise;
    const response = await fetch(`https://api-server.mintlayer.org/api/v2/address/${address}`);
    const data = await response.json();
    if(data.error) {
      return acc;
    }
    return acc + parseInt(data.coin_balance.decimal, 10);
  }, Promise.resolve(0));

  const bridge_balance_erc20 = parseInt(total_supply_erc20) - parseInt(circulating_supply_erc20);

  const block_subsidy = get_total_subsidy(block_height);

  const ml_total_supply = 400_000_000 + block_subsidy - bridge_balance - circulating_supply_ml.burned.decimal;
  const erc20_total_supply = 400_000_000 - bridge_balance_erc20;

  const response = {
    exchange_rate: exchange_rate.price,
    cmc_info: exchange_rate,
    burned: {
      ml: circulating_supply_ml.burned.decimal,
    },
    max_supply: {
      ml: 599_990_800 - circulating_supply_ml.burned.decimal,
    },
    total_supply: {
      erc20: erc20_total_supply,
      ml: ml_total_supply,
      total: ml_total_supply + erc20_total_supply,
    },
    circulating_supply: {
      erc20: parseInt(circulating_supply_erc20),
      ml: ml_total_supply,
      total: ml_total_supply + parseInt(circulating_supply_erc20),
    },
    staking: {
      total_apy: staking.total_apy,
      validators_count: staking.validators_count,
      delegation_count: staking.delegation_count,
      total_amount: parseInt(staking.total_amount),
      total_effective_amount: staking.total_effective_amount,
    },
    block_rewards: {
      ml: block_subsidy,
      height: block_height,
    },
  };

  cache.set("summary_data", response, 24 * 60 * 60 * 1000); // 24 hours only for data_summary

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
