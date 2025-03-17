"use client";

import React, { useEffect, useState } from "react";
import icon_coin from "@/app/(homepage)/_icons/16px/coin.svg";
import copy_icon from "@/app/(homepage)/_icons/16px/copy.svg";
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import check_icon from "@/app/(homepage)/_icons/24px/check.svg";
import Link from "next/link";
import { getCoin } from "@/utils/network";
import Image from "next/image";

import { Switch } from "@/app/tx/[tx]/_components/switch";
import { formatML } from "@/utils/numbers";
import { useWallet } from "@/hooks/useWallet";
import { Modal } from "@/app/_components/modal";

import {calculateDelegationInfo} from "@/utils/staking";
import {block_subsidy_at_height} from "@/utils/emission";

const coin = getCoin();

export function Table() {
  const { detected } = useWallet();
  const [pools, setPools] = useState<any>([]);
  const [orderField, setOrderField] = useState<any>("pool_id");
  const [blockHeight, setBlockHeight] = useState<any>(0);
  const [order, setOrder] = useState<any>("asc");
  const [difficulty, setDifficulty] = useState<any>(0);
  const [hideNonProfitPools, setHideNonProfitPools] = useState<any>(true);
  const [stakingAmountRaw, setStakingAmount] = useState<any>("1000");
  const [copy, setCopy] = useState<any>({});

  const [openModal, setOpenModal] = useState(false);
  const [poolId, setPoolId] = useState("");

  const { handleDelegate } = useWallet();

  const apyCalculator = difficulty !== 0;

  const stakingAmount = parseFloat(stakingAmountRaw.replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    const getBlocks: any = async (offset: number, pools_data: any) => {
      const res = await fetch("/api/pool/list?withBalance=1&" + (offset ? "&offset=" + offset : ""), { cache: "no-store" });
      const data = await res.json();
      if (data.length > 0) {
        setPools(data);
      }
    };
    getBlocks();
  }, []);

  useEffect(() => {
    const getDifficulty: any = async () => {
      const res = await fetch("/api/block/last", { cache: "no-store" });
      const data = await res.json();
      const [block] = data;
      const difficulty = block?.target_difficulty;
      setDifficulty(difficulty);
      setBlockHeight(block.block);
    };
    getDifficulty();
  }, []);

  // sorter for number fields
  const sorter = (a: any, b: any) => {
    if (order === "asc") {
      return a[orderField] - b[orderField];
    } else {
      return b[orderField] - a[orderField];
    }
  };

  const filterer = (item: any) => {
    if (hideNonProfitPools) {
      if (item.margin_ratio === 1) return false;
      if (item.cost_per_block >= block_subsidy_at_height(blockHeight)) return false;
      return true;
    } else {
      return true;
    }
  };

  const handleSort =
    (field: string, order = "asc") =>
    () => {
      setOrderField(field);
      setOrder(order);
    };

  const handleCopy = (text: string) => () => {
    navigator.clipboard.writeText(text);
    setCopy({ [text]: true });
    setTimeout(() => {
      setCopy({});
    }, 1000);
  };

  const handleStackPool = (balance: number, poolId: string) => {
    if (balance > 600000) {
      setOpenModal(true);
      setPoolId(poolId);
    } else {
      handleDelegate(poolId);
    }
  };

  const injectApy = (amountToDelegate: any) => (pool: any) => {
    const {
      apy,
      reward_per_day_pool,
      reward_per_day_delegator,
      part_label,
      hours_for_block,
    } = calculateDelegationInfo({
      pool,
      amountToDelegate,
      blockHeight,
      difficulty,
    });

    return {
      ...pool,
      apy,
      reward_per_day_pool,
      reward_per_day_delegator,
      part_label,
      hours_for_block,
    };
  };

  return (
    <>
      {openModal && (
        <Modal active={openModal} setActive={setOpenModal}>
          <div className="text-xl font-semibold w-full">Delegating to a pool that has reached saturation</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            Delegating to a pool that has reached saturation is not recommended. Contributions to a saturated pool will have a minimal impact on the pool’s
            effective balance, potentially diminishing the rewards you might expect. Please consider delegating to a less populated pool to optimize your
            delegation benefits.
          </p>
          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className="cursor-pointer p-2 rounded bg-base-gray40 text-white"
              onClick={() => {
                setOpenModal(false);
                handleDelegate(poolId);
              }}
            >
              Stake Anyway
            </div>
            <div className="cursor-pointer p-2 rounded bg-primary-100 text-white" onClick={() => setOpenModal(false)}>
              Cancel
            </div>
          </div>
        </Modal>
      )}

      <div className="md:hidden">
        <div className="flex flex-row">
          <div className="w-5 flex justify-center items-center mr-2">
            <Image className="inline" src={icon_coin} alt="" />
          </div>
          <div>Cost per block</div>
        </div>
        <div className="flex flex-row">
          <div className="w-5 flex justify-center items-center mr-2">
            <Image className="inline" src={icon_time} alt="" />
          </div>
          <div>Margin ratio</div>
        </div>
        <div className="flex flex-row">
          <div className="w-5 flex justify-center items-center mr-2">
            <Image className="inline" src={icon_block} alt="" />
          </div>
          <div>Average time required to find one block</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="mt-3">
          <div>
            <div className="flex flex-row items-center gap-2">
              <Switch checked={hideNonProfitPools} onChange={() => setHideNonProfitPools(!hideNonProfitPools)} />
              Hide pools that do not provide any rewards to delegators
            </div>
          </div>
        </div>

        {apyCalculator ? (
          <div className="mt-3">
            <div className="flex flex-col items-end">
              <div>
                Your delegation amount{" "}
                <input type="text" className="px-2 py-1" value={stakingAmountRaw} size={8} onChange={({ target: { value } }) => setStakingAmount(value)} /> ML
              </div>
              <div className="text-xs">Enter the amount of coins you plan to delegate to show the estimated APY</div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className="mt-5 md:hidden">
        <div>Sort by</div>
        <div className="flex flex-wrap">
          {[
            { field: "apy", label: "APY" },
            { field: "reward_per_day_delegator", label: "Reward" },
            { field: "balance", label: "Pool Balance" },
          ].map(({ field, label }) => {
            return (
              <button
                key={field}
                className="inline-flex mr-2 my-1 items-center rounded-xl bg-primary-100 text-white px-4 py-2"
                onClick={handleSort(field, order === "asc" ? "desc" : "asc")}
              >
                {orderField === field ? <Image alt="" className="w-4 h-4" src={check_icon} /> : ""} {label}{" "}
                {orderField === field ? (order === "desc" ? "↓" : "↑") : ""}
              </button>
            );
          })}
        </div>
      </div>

      <table className="w-full mt-10">
        <thead className="hidden md:table-header-group sticky top-[72px] bg-white z-10">
          <tr>
            <th className="px-2 py-2 text-left">Pool address</th>
            {apyCalculator && stakingAmount > 0 ? (
              <th>
                <span
                  onClick={handleSort("reward_per_day_delegator", "asc")}
                  className="cursor-pointer font-normal"
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort ascending`}
                >
                  ↑
                </span>
                <span
                  onClick={handleSort("reward_per_day_delegator", "desc")}
                  className="cursor-pointer font-normal"
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort descending`}
                >
                  ↓
                </span>

                <span data-tooltip-id="tooltip" data-tooltip-content={`Average coins per day`}>
                  {coin}
                </span>
              </th>
            ) : (
              <></>
            )}
            {apyCalculator && stakingAmount > 0 ? (
              <th>
                <span
                  onClick={handleSort("apy", "asc")}
                  className="cursor-pointer font-normal"
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort ascending`}
                >
                  ↑
                </span>
                <span
                  onClick={handleSort("apy", "desc")}
                  className="cursor-pointer font-normal"
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort descending`}
                >
                  ↓
                </span>
                APY
              </th>
            ) : (
              <></>
            )}

            <th className="px-2 py-2 text-right w-20">
              <span
                onClick={handleSort("hours_for_block", "asc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort ascending`}
              >
                ↑
              </span>
              <span
                onClick={handleSort("hours_for_block", "desc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort descending`}
              >
                ↓
              </span>

              <span data-tooltip-id="tooltip" data-tooltip-content={`Average time to find 1 block`}>
                <Image className="inline" src={icon_time} alt="" />
              </span>
            </th>
            <th className="px-2 py-2 text-right w-30">
              <span
                onClick={handleSort("cost_per_block", "asc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort ascending`}
              >
                ↑
              </span>
              <span
                onClick={handleSort("cost_per_block", "desc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort descending`}
              >
                ↓
              </span>
              <span data-tooltip-id="tooltip" data-tooltip-content={`Cost per block. How much a pool takes ML of the reward before splitting`}>
                <Image className="inline" src={icon_coin} alt="" />
              </span>
            </th>
            <th className="px-2 py-2 text-right w-20">
              <span
                onClick={handleSort("margin_ratio", "asc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort ascending`}
              >
                ↑
              </span>
              <span
                onClick={handleSort("margin_ratio", "desc")}
                className="cursor-pointer font-normal"
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort descending`}
              >
                ↓
              </span>
              <span data-tooltip-id="tooltip" data-tooltip-content={`% of the reward after fixed pool cost per block goes to the delegators`}>
                <Image className="inline" src={icon_time} alt="" />
              </span>
            </th>
            <th className="px-2 py-2 text-right"></th>
            <th className="px-2 py-2 text-right">
              <span
                onClick={handleSort("balance", "asc")}
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort ascending`}
                className="cursor-pointer font-normal"
              >
                ↑
              </span>
              <span
                onClick={handleSort("balance", "desc")}
                data-tooltip-id="tooltip"
                data-tooltip-content={`Sort descending`}
                className="cursor-pointer font-normal"
              >
                ↓
              </span>
              <span data-tooltip-id="tooltip" data-tooltip-content={`Total balance of the pool consists of the pool pledge and the delegations`}>
                Total Balance
              </span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody className="flex flex-col md:table-row-group">
          {pools
            .map(injectApy(stakingAmount))
            ?.sort(sorter)
            .filter(filterer)
            .map((value: any, i: number) => {
              const { apy, reward_per_day_pool, reward_per_day_delegator, part_label, hours_for_block } = value;

              return (
                <tr key={"s" + i} className={`grid grid-cols-5 gap-0 h-full bg-white hover:bg-white group border mb-3 md:table-row`}>
                  <td className="col-start-1 col-end-6 row-start-1 row-end-2 px-2 py-2 font-mono hover:text-primary-100 w-full">
                    <Link href={"/pool/" + value.pool_id}>
                      {value.pool_id.slice(0, 10)}...{value.pool_id.slice(-10)}
                    </Link>

                    <span
                      className="cursor-pointer md:opacity-5 group-hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content={copy[value.pool_id] ? "Copied" : "Click to copy pool address"}
                      onClick={handleCopy(value.pool_id)}
                    >
                      <Image className="inline ml-2" src={copy_icon} alt="" />
                    </span>
                  </td>
                  {apyCalculator && stakingAmount > 0 ? (
                    <td className="col-start-1 col-end-3 row-start-2 row-end-3 md:border-l px-2 py-2 text-right tabular-nums  hidden md:table-cell">
                      <span className="md:hidden text-sm">Reward</span>
                      <div
                        className="whitespace-nowrap"
                        data-tooltip-id="tooltip-multiline"
                        data-tooltip-content={`${`Total ML for the pool: ${reward_per_day_pool.toFixed(0)} ML/day`}\n${`Your part in the pool: ${part_label}%`}\n${`You get ${reward_per_day_delegator.toFixed(2)} ML/day.`}`}
                      >
                        {reward_per_day_delegator.toFixed(2)} ML
                      </div>
                    </td>
                  ) : (
                    <></>
                  )}
                  {apyCalculator && stakingAmount > 0 ? (
                    <td
                      className="col-start-1 col-end-3 row-start-2 row-end-3 md:border-l px-2 py-2 text-right tabular-nums"
                      data-tooltip-id="tooltip"
                      data-tooltip-content={`Your estimated APY for this pool by delegating ${stakingAmount} ${coin}`}
                    >
                      <span className="md:hidden text-sm">APY</span>
                      <div className="whitespace-nowrap">{apy.toFixed(2)}%</div>
                    </td>
                  ) : (
                    <></>
                  )}
                  <td className="md:border-l whitespace-nowrap px-2 py-2 tabular-nums text-right hidden md:table-cell">
                    <span
                      className="hpb"
                      data-tooltip-id="tooltip"
                      data-tooltip-content={`On average, it takes ${forPopup(hoursToTimeFormatWithMinutes(hours_for_block))} to find 1 block`}
                    >
                      {forTable(hoursToTimeFormatWithMinutes(hours_for_block))}
                    </span>
                  </td>
                  <td className="col-start-3 col-end-5 row-start-2 row-end-3 md:border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                    <span className="md:hidden text-sm">Cost per block</span>
                    <div>
                      <span
                        className="hpb"
                        data-tooltip-id="tooltip"
                        data-tooltip-content={`Pool takes ${value?.cost_per_block} ${coin} of the reward before splitting`}
                      >
                        {value?.cost_per_block + " " + coin}
                      </span>
                    </div>
                  </td>
                  <td className="col-start-5 col-end-6 row-start-2 row-end-3 md:border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                    <span className="md:hidden text-sm">Margin</span>
                    <div>
                      <span
                        className="px-2"
                        data-tooltip-id="tooltip"
                        data-tooltip-content={`${((1 - value.margin_ratio) * 100).toFixed(1)}% of the reward after fixed pool reward goes to the delegators`}
                      >
                        {(value.margin_ratio * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="col-start-1 col-end-4 row-start-3 row-end-4 md:border-l whitespace-nowrap px-2 py-2 md:w-32 tabular-nums text-right">
                    <div className="flex flex-row items-end gap-0">
                      <div className="relative w-full md:w-[150px]">
                        <span className="md:hidden text-sm">Saturation</span>
                        <div className={`overflow-hidden h-4 text-xs flex ${value.balance > 600000 ? "rounded-l" : "rounded"} bg-emerald-200`}>
                          <div
                            style={{
                              width: (value.staker_balance / 600000) * 100 + "%",
                            }}
                            data-tooltip-id="tooltip"
                            data-tooltip-content={`Pool pledge ML amount: ${formatML(value.staker_balance, 0) + " " + coin}`}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-110"
                          ></div>
                          <div
                            style={{
                              width: (value.delegations_amount / 600000) * 100 + "%",
                            }}
                            data-tooltip-id="tooltip"
                            data-tooltip-content={`Delegations balance: ${formatML((value.balance - value.staker_balance).toString(), 0) + " " + coin}`}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-100"
                          ></div>
                          <div data-tooltip-id="tooltip" data-tooltip-content={`Free space`} className="w-auto"></div>
                        </div>
                      </div>
                      {value.balance > 600000 ? (
                        <div className="hpb" data-tooltip-id="tooltip" data-tooltip-content={`Oversaturated pool`}>
                          <span className={`block w-3 h-4 rounded-r relative z-2 bg-red-400`}></span>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </td>
                  <td className="col-start-4 col-end-6 row-start-3 row-end-4 md:border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                    <span className="md:hidden text-sm">Total balance</span>
                    <div className="flex flex-row justify-end items-center">
                      <span
                        className="hpb"
                        data-tooltip-id="tooltip"
                        data-tooltip-content={`Total balance of the pool consists of the pool pledge and the delegations`}
                      >
                        {formatML(value.balance, 0) + " " + coin}
                      </span>
                      <span
                        className={"cursor-pointer inline-flex justify-center items-center text-sm bg-primary-110 text-white rounded-full ml-1 w-4 h-4"}
                        data-tooltip-id="tooltip-multiline"
                        data-tooltip-content={`Effective balance: ${formatML(value.effective_pool_balance)} ${coin} \nThe effective balance is a value proportional to the balance, \nwhich has properties that prevent centralization of pools`}
                      >
                        ?
                      </span>
                    </div>
                  </td>
                  <td className="border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                    <button
                      data-tooltip-id="tooltip"
                      data-tooltip-content={detected ? "Stake to this pool" : "Connect wallet to stake"}
                      disabled={!detected}
                      className={`${detected ? "bg-primary-100 hover:bg-primary-110" : "bg-secondary-100"} px-2 py-1 text-white rounded`}
                      onClick={() => handleStackPool(value.balance, value.pool_id)}
                    >
                      Stake
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {pools.length === 0 || !difficulty ? <div className="p-5 w-full text-center">Loading</div> : <></>}
    </>
  );
}

function forTable({ d, h, m }: any) {
  if (d > 100) {
    return <div className="w-[50px]"></div>;
  }
  return (
    <div className="flex gap-1 justify-end items-end">
      {d > 0 ? <div>{d}d</div> : <></>}
      {h > 0 ? <div>{h}h</div> : <></>}
      {m > 0 ? <div>{m}m</div> : <></>}
    </div>
  );
}

function forPopup({ d, h, m }: any) {
  return `${d > 0 ? `${d} day${d > 1 ? "s" : ""} ` : ""}${h > 0 ? `${h} hour${h > 1 ? "s" : ""} ` : ""}${m === 1 ? `${m} minute ` : ""}${m > 1 ? `${m} minutes ` : ""}`;
}

function hoursToTimeFormatWithMinutes(hours: any) {
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  const m = Math.floor((hours % 1) * 60);
  return { d, h, m };
}
