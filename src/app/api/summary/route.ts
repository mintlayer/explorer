import { NextResponse } from "next/server";

// @ts-ignore
import cache from "@/app/api/_utils/cache";
import { total_reward } from "@/utils/reward";
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

  const exchange_rate = await getCMCInfo();

  const req_circulating_supply_ml = await fetch("https://api-server.mintlayer.org/api/v2/statistics/coin");
  const circulating_supply_ml = await req_circulating_supply_ml.json();

  const req_circulating_supply_erc20 = await fetch("https://token.api.mintlayer.org/api/circulatingerc");
  const circulating_supply_erc20 = await req_circulating_supply_erc20.text();

  const req_total_supply_erc20 = await fetch("https://token.api.mintlayer.org/api/totalclaimed");
  const total_supply_erc20 = await req_total_supply_erc20.text();

  const req_staking = await fetch("https://explorer.mintlayer.org/api/pool/summary");
  const staking = await req_staking.json();

  // bridge data
  const req_brigde_01 = await fetch("https://api-server.mintlayer.org/api/v2/address/mtc1q83x75alqe0wptrfrz5jv3a6n3qayzlacy9mnjvj");
  const bridge_01 = await req_brigde_01.json();
  const req_brigde_02 = await fetch("https://api-server.mintlayer.org/api/v2/address/mtc1q9d860uag5swe78ac9c2lct9mkctfyftqvwj3ypa");
  const bridge_02 = await req_brigde_02.json();

  const bridge_balance = parseInt(bridge_01.coin_balance.decimal) + parseInt(bridge_02.coin_balance.decimal);
  const bridge_balance_erc20 = parseInt(total_supply_erc20) - parseInt(circulating_supply_erc20);

  const block_reward = total_reward(block_height);

  const ml_total_supply = 400_000_000 + block_reward - bridge_balance - circulating_supply_ml.burned.decimal;
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
      ml: block_reward,
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
