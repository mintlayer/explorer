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
import {WalletConnect} from "@/app/_components/wallet_connect";

const coin = getCoin();

export function Table() {
  const { detected, delegations, balance, handleConnect, handleDelegate, handleAddFunds, handleWithdraw, refreshDelegations } = useWallet();
  const [pools, setPools] = useState<any>([]);
  const [orderField, setOrderField] = useState<any>("pool_id");
  const [blockHeight, setBlockHeight] = useState<any>(0);
  const [order, setOrder] = useState<any>("asc");
  const [difficulty, setDifficulty] = useState<any>(0);
  const [hideNonProfitPools, setHideNonProfitPools] = useState<any>(true);
  const [showOnlyMyPools, setShowOnlyMyPools] = useState<any>(false);
  const [stakingAmountRaw, setStakingAmount] = useState<any>("1000");
  const [copy, setCopy] = useState<any>({});

  const [openModal, setOpenModal] = useState(false);
  const [poolId, setPoolId] = useState("");

  // Withdrawal modal state
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [withdrawPoolId, setWithdrawPoolId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedDelegation, setSelectedDelegation] = useState<any>(null);
  const [poolDelegations, setPoolDelegations] = useState<any[]>([]);

  // Add funds modal state
  const [openAddFundsModal, setOpenAddFundsModal] = useState(false);
  const [addFundsPoolId, setAddFundsPoolId] = useState("");
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [selectedAddFundsDelegation, setSelectedAddFundsDelegation] = useState<any>(null);
  const [addFundsPoolDelegations, setAddFundsPoolDelegations] = useState<any[]>([]);

  // Join modal state
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [joinPoolData, setJoinPoolData] = useState<any>(null);

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

  // Enhanced sorter for number fields and delegation-based sorting
  const sorter = (a: any, b: any) => {
    // Special handling for delegation-based sorting
    if (orderField === "delegation_exists") {
      const aHasDelegation = a.delegation_exists ? 1 : 0;
      const bHasDelegation = b.delegation_exists ? 1 : 0;
      if (order === "asc") {
        return aHasDelegation - bHasDelegation;
      } else {
        return bHasDelegation - aHasDelegation;
      }
    }

    if (orderField === "delegation_balance") {
      const aBalance = a.delegation_balance || 0;
      const bBalance = b.delegation_balance || 0;
      if (order === "asc") {
        return aBalance - bBalance;
      } else {
        return bBalance - aBalance;
      }
    }

    // Default numeric sorting
    if (order === "asc") {
      return a[orderField] - b[orderField];
    } else {
      return b[orderField] - a[orderField];
    }
  };

  const filterer = (item: any) => {
    // Filter by non-profit pools
    if (hideNonProfitPools) {
      if (item.margin_ratio === 1) return false;
      if (item.cost_per_block >= block_subsidy_at_height(blockHeight)) return false;
    }

    // Filter to show only pools where user has delegations
    if (showOnlyMyPools && detected) {
      if (!item.delegation_exists) return false;
    }

    return true;
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

  const handleStackPool = (poolBalance: number, poolId: string, hasExistingDelegation: boolean, poolData: any) => {
    if (hasExistingDelegation) {
      // If user has existing delegations, show add funds modal
      handleAddFundsPool(poolId);
    } else {
      // If no existing delegations, show join modal for confirmation
      handleJoinPool(poolData);
    }
  };

  const handleJoinPool = (poolData: any) => {
    setJoinPoolData(poolData);
    setOpenJoinModal(true);
  };

  const handleConfirmJoin = async () => {
    try {
      if (!joinPoolData) {
        alert("Pool data not available");
        return;
      }

      // Check if pool is oversaturated and show warning
      if (joinPoolData.balance > 600000) {
        setOpenJoinModal(false);
        setOpenModal(true);
        setPoolId(joinPoolData.pool_id);
        return;
      }

      // Create new delegation
      await handleDelegate(joinPoolData.pool_id);
      setOpenJoinModal(false);

      // Reset modal state
      setJoinPoolData(null);

      // Refresh the delegations data
      await refreshDelegations();

    } catch (error) {
      console.error("Join pool failed:", error);
      alert("Failed to join pool. Please try again.");
    }
  };

  const handleWithdrawPool = (poolId: string, totalAmount: number) => {
    // Find all delegations for this pool
    const userPoolDelegations = delegations.filter(d => d.pool_id === poolId);

    setWithdrawPoolId(poolId);
    setPoolDelegations(userPoolDelegations);
    setSelectedDelegation(userPoolDelegations[0] || null); // Select first delegation by default
    setWithdrawAmount(userPoolDelegations[0]?.balance?.decimal?.toString() || "0");
    setOpenWithdrawModal(true);
  };

  const handleDelegationSelect = (delegation: any) => {
    setSelectedDelegation(delegation);
    setWithdrawAmount(delegation.balance.decimal.toString());
  };

  const handleConfirmWithdraw = async () => {
    try {
      if (!selectedDelegation) {
        alert("Please select a delegation to withdraw from");
        return;
      }

      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        alert("Please enter a valid withdrawal amount");
        return;
      }

      if (parseFloat(withdrawAmount) > parseFloat(selectedDelegation.balance.decimal)) {
        alert("Withdrawal amount cannot exceed delegation balance");
        return;
      }

      // Use the delegation's spend_destination as the withdrawal destination
      const destinationAddress = selectedDelegation.spend_destination;

      await handleWithdraw(selectedDelegation.delegation_id, withdrawAmount, destinationAddress);
      setOpenWithdrawModal(false);

      // Reset modal state
      setSelectedDelegation(null);
      setPoolDelegations([]);
      setWithdrawAmount("");

      // Refresh the delegations data
      await refreshDelegations();

    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    }
  };

  const handleAddFundsPool = (poolId: string) => {
    // Find all delegations for this pool
    const userPoolDelegations = delegations.filter(d => d.pool_id === poolId);

    setAddFundsPoolId(poolId);
    setAddFundsPoolDelegations(userPoolDelegations);
    setSelectedAddFundsDelegation(userPoolDelegations[0] || null); // Select first delegation by default
    setAddFundsAmount("");
    setOpenAddFundsModal(true);
  };

  const handleAddFundsDelegationSelect = (delegation: any) => {
    setSelectedAddFundsDelegation(delegation);
  };

  const handleConfirmAddFunds = async () => {
    try {
      if (!selectedAddFundsDelegation) {
        alert("Please select a delegation to add funds to");
        return;
      }

      if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
        alert("Please enter a valid amount to add");
        return;
      }

      if (parseFloat(addFundsAmount) > balance) {
        alert("Amount cannot exceed your available balance");
        return;
      }

      await handleAddFunds(selectedAddFundsDelegation.delegation_id, addFundsAmount);
      setOpenAddFundsModal(false);

      // Reset modal state
      setSelectedAddFundsDelegation(null);
      setAddFundsPoolDelegations([]);
      setAddFundsAmount("");

      // Refresh the delegations data
      await refreshDelegations();

    } catch (error) {
      console.error("Add funds failed:", error);
      alert("Add funds failed. Please try again.");
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

  const injectDelegations = (delegations: any) => (pool: any) => {
    if(!detected) return pool;

    const delegationsByPoolId = delegations.reduce((acc: any, delegation: any) => {
      const poolId = delegation.pool_id;
      if (!acc[poolId]) {
        acc[poolId] = [];
      }
      acc[poolId].push(delegation);
      return acc;
    }, {});

    const poolDelegations = delegationsByPoolId[pool.pool_id] || [];

    return {
      ...pool,
      delegation_exists: !!delegationsByPoolId[pool.pool_id],
      delegation_balance: poolDelegations.reduce((acc: any, delegation: any) => {
        return acc + parseFloat(delegation.balance.decimal);
      }, 0) || 0,
      delegation_count: poolDelegations.length,
      user_delegations: poolDelegations, // Store the actual delegation objects for detailed access
    }
  }

  return (
    <>
      <WalletConnect handleConnect={handleConnect} detected={detected} delegations={delegations}/>

      {openModal && (
        <Modal active={openModal} setActive={setOpenModal}>
          <div className="text-xl font-semibold w-full">Joining a pool that has reached saturation</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            This pool has reached saturation (over 600,000 {coin}). Joining a saturated pool is not recommended as contributions will have minimal impact on the pool’s
            effective balance, potentially diminishing the rewards you might expect. Please consider joining a less populated pool to optimize your
            delegation benefits.
          </p>
          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className="cursor-pointer p-2 rounded bg-orange-500 text-white"
              onClick={() => {
                setOpenModal(false);
                handleDelegate(poolId);
                refreshDelegations();
              }}
            >
              Join Anyway
            </div>
            <div className="cursor-pointer p-2 rounded bg-primary-100 text-white" onClick={() => setOpenModal(false)}>
              Cancel
            </div>
          </div>
        </Modal>
      )}

      {openWithdrawModal && (
        <Modal active={openWithdrawModal} setActive={setOpenWithdrawModal}>
          <div className="text-xl font-semibold w-full">Withdraw from Pool</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            You are about to withdraw from your delegation. Please note that withdrawn coins will have a 7200-block maturity period (approximately 10 days) before they become available.
          </p>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Delegation to Withdraw From</label>
              <div className="space-y-2">
                {poolDelegations.map((delegation, index) => (
                  <div
                    key={delegation.delegation_id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedDelegation?.delegation_id === delegation.delegation_id
                        ? 'border-primary-100 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleDelegationSelect(delegation)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-mono text-sm">
                          {delegation.delegation_id.slice(0, 20)}...{delegation.delegation_id.slice(-10)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Destination: {delegation.spend_destination.slice(0, 15)}...{delegation.spend_destination.slice(-10)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatML(delegation.balance.decimal)} {coin}
                        </div>
                        <div className="text-xs text-gray-500">
                          Available
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedDelegation && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount to withdraw ({coin})</label>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter amount"
                  max={selectedDelegation.balance.decimal}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Max available: {formatML(selectedDelegation.balance.decimal)} {coin}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Withdrawal destination: {selectedDelegation.spend_destination}
                </div>
              </div>
            )}
          </div>
          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className="cursor-pointer p-2 rounded bg-red-500 text-white"
              onClick={handleConfirmWithdraw}
            >
              Confirm Withdrawal
            </div>
            <div className="cursor-pointer p-2 rounded bg-gray-400 text-white" onClick={() => setOpenWithdrawModal(false)}>
              Cancel
            </div>
          </div>
        </Modal>
      )}

      {openAddFundsModal && (
        <Modal active={openAddFundsModal} setActive={setOpenAddFundsModal}>
          <div className="text-xl font-semibold w-full">Add Funds to Delegation</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            You are about to add funds to your existing delegation. Select which delegation to add funds to and specify the amount.
          </p>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Delegation to Add Funds To</label>
              <div className="space-y-2">
                {addFundsPoolDelegations.map((delegation, index) => (
                  <div
                    key={delegation.delegation_id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedAddFundsDelegation?.delegation_id === delegation.delegation_id
                        ? 'border-primary-100 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleAddFundsDelegationSelect(delegation)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-mono text-sm">
                          {delegation.delegation_id.slice(0, 20)}...{delegation.delegation_id.slice(-10)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Destination: {delegation.spend_destination.slice(0, 15)}...{delegation.spend_destination.slice(-10)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatML(delegation.balance.decimal)} {coin}
                        </div>
                        <div className="text-xs text-gray-500">
                          Current Balance
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedAddFundsDelegation && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount to add ({coin})</label>
                <input
                  type="text"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter amount to add"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Your available balance: {formatML(balance.toString())} {coin}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Current delegation balance: {formatML(selectedAddFundsDelegation.balance.decimal)} {coin}
                </div>
              </div>
            )}
          </div>
          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className="cursor-pointer p-2 rounded bg-primary-100 text-white"
              onClick={handleConfirmAddFunds}
            >
              Add Funds
            </div>
            <div className="cursor-pointer p-2 rounded bg-gray-400 text-white" onClick={() => setOpenAddFundsModal(false)}>
              Cancel
            </div>
          </div>
        </Modal>
      )}

      {openJoinModal && joinPoolData && (
        <Modal active={openJoinModal} setActive={setOpenJoinModal}>
          <div className="text-xl font-semibold w-full">Join Pool</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            You are about to create a new delegation to this pool. This will create an empty delegation that you can add funds to later.
          </p>

          <div className="flex flex-col gap-4 py-4">
            {/* Pool Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold mb-3">Pool Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Pool ID:</span>
                  <div className="font-mono text-xs mt-1">
                    {joinPoolData.pool_id.slice(0, 20)}...{joinPoolData.pool_id.slice(-15)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Balance:</span>
                  <div className="font-semibold mt-1">
                    {formatML(joinPoolData.balance, 0)} {coin}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Cost per Block:</span>
                  <div className="font-semibold mt-1">
                    {joinPoolData.cost_per_block} {coin}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Margin Ratio:</span>
                  <div className="font-semibold mt-1">
                    {(joinPoolData.margin_ratio * 100).toFixed(1)}%
                  </div>
                </div>
                {apyCalculator && stakingAmount > 0 && (
                  <>
                    <div>
                      <span className="text-gray-600">Estimated APY:</span>
                      <div className="font-semibold mt-1 text-primary-100">
                        {joinPoolData.apy?.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. Daily Reward:</span>
                      <div className="font-semibold mt-1 text-primary-100">
                        {joinPoolData.reward_per_day_delegator?.toFixed(2)} {coin}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Transaction Fee Info */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-blue-800">Transaction Information</h3>
              <div className="text-sm text-blue-700">
                <div className="mb-2">
                  <span className="font-medium">Transaction Fee:</span> Network fee will be deducted from your balance
                </div>
                <div className="mb-2">
                  <span className="font-medium">Delegation Creation:</span> This creates an empty delegation
                </div>
              </div>
            </div>

            {/* Next Steps Info */}
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-yellow-800">Next Steps</h3>
              <div className="text-sm text-yellow-700">
                <div className="mb-2">
                  1. After joining, you'll need to add funds to your delegation to start earning rewards
                </div>
                <div className="mb-2">
                  2. Use the "Add Coins" button to fund your delegation
                </div>
                <div>
                  3. Your delegation will start earning rewards once funded
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className="cursor-pointer p-2 rounded bg-primary-100 text-white"
              onClick={handleConfirmJoin}
            >
              Confirm & Join Pool
            </div>
            <div className="cursor-pointer p-2 rounded bg-gray-400 text-white" onClick={() => setOpenJoinModal(false)}>
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
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Switch checked={hideNonProfitPools} onChange={() => setHideNonProfitPools(!hideNonProfitPools)} />
              Hide pools that do not provide any rewards to delegators
            </div>
            {detected && (
              <div className="flex flex-row items-center gap-2">
                <Switch checked={showOnlyMyPools} onChange={() => setShowOnlyMyPools(!showOnlyMyPools)} />
                Show only pools where I have delegations
              </div>
            )}
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
            ...(detected ? [
              { field: "delegation_exists", label: "My Pools" },
              { field: "delegation_balance", label: "My Stake" },
            ] : []),
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
            {detected && (
              <th className="px-2 py-2 text-right">
                <span
                  onClick={handleSort("delegation_balance", "asc")}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort ascending`}
                  className="cursor-pointer font-normal"
                >
                  ↑
                </span>
                <span
                  onClick={handleSort("delegation_balance", "desc")}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={`Sort descending`}
                  className="cursor-pointer font-normal"
                >
                  ↓
                </span>
                <span data-tooltip-id="tooltip" data-tooltip-content={`Your stake in this pool`}>
                  Your Stake
                </span>
              </th>
            )}
            {detected && <th></th>}
          </tr>
        </thead>
        <tbody className="flex flex-col md:table-row-group">
          {pools
            .map(injectApy(stakingAmount))
            .map(injectDelegations(delegations))
            ?.sort(sorter)
            .filter(filterer)
            .map((value: any, i: number) => {
              const { apy, reward_per_day_pool, reward_per_day_delegator, part_label, hours_for_block } = value;

              return (
                <tr key={"s" + i} className={`grid grid-cols-5 gap-0 h-full ${detected && value.delegation_exists ? 'bg-blue-50 border-blue-200' : 'bg-white'} hover:bg-gray-50 group border mb-3 md:table-row`}>
                  <td className="col-start-1 col-end-6 row-start-1 row-end-2 px-2 py-2 font-mono hover:text-primary-100 w-full">
                    <div className="flex items-center gap-2">
                      {detected && value.delegation_exists && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={`You have ${value.delegation_count} delegation${value.delegation_count > 1 ? 's' : ''} in this pool`}
                        >
                          My Pool ({value.delegation_count})
                        </span>
                      )}
                      <Link href={"/pool/" + value.pool_id}>
                        {value.pool_id.slice(0, 10)}...{value.pool_id.slice(-10)}
                      </Link>
                      <span
                        className="cursor-pointer md:opacity-5 group-hover:opacity-100"
                        data-tooltip-id="tooltip"
                        data-tooltip-content={copy[value.pool_id] ? "Copied" : "Click to copy pool address"}
                        onClick={handleCopy(value.pool_id)}
                      >
                        <Image className="inline" src={copy_icon} alt="" />
                      </span>
                    </div>
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
                  {detected && (
                    <td className="border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                      <span className="md:hidden text-sm">Your Stake</span>
                      <div className="flex flex-col items-end">
                        {value?.delegation_balance > 0 ? (
                          <div>
                            <div className="font-semibold text-primary-100">
                              {formatML(value.delegation_balance)} {coin}
                            </div>
                            <div className="text-xs text-gray-500">
                              {value.delegation_count} delegation{value.delegation_count > 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </div>
                    </td>
                  )}
                  {detected && (
                    <td className="border-l whitespace-nowrap px-2 py-2 tabular-nums text-right">
                      <div className="flex flex-col gap-1">
                        <button
                          data-tooltip-id="tooltip"
                          data-tooltip-content={value?.delegation_exists ? "Add funds to existing delegation" : "Create new delegation in this pool"}
                          className="bg-primary-100 hover:bg-primary-110 px-2 py-1 text-white rounded text-sm"
                          onClick={() => handleStackPool(value.balance, value.pool_id, value?.delegation_exists, value)}
                        >
                          {value?.delegation_exists ? 'Add Coins' : 'Join'}
                        </button>
                        {value?.delegation_balance > 0 && (
                          <button
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Withdraw from this pool"
                            className="bg-red-500 hover:bg-red-600 px-2 py-1 text-white rounded text-sm"
                            onClick={() => handleWithdrawPool(value.pool_id, value.delegation_balance)}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
