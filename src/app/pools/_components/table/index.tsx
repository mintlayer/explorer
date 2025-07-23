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
  const { detected, delegations, balance, handleConnect, handleDisconnect, handleDelegate, handleAddFunds, handleWithdraw, refreshDelegations } = useWallet();
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
  const [isJoining, setIsJoining] = useState(false);

  const apyCalculator = difficulty !== 0;

  const stakingAmount = parseFloat(stakingAmountRaw.replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    const getBlocks: any = async (offset: number, pools_data: any) => {
      try {
        const res = await fetch("/api/pool/list?withBalance=1&" + (offset ? "&offset=" + offset : ""), { cache: "no-store" });
        const data = await res.json();
        console.log('Pools data loaded:', data);
        console.log('Pools array length:', data?.length);
        console.log('Is array:', Array.isArray(data));
        
        if (data && Array.isArray(data) && data.length > 0) {
          setPools(data);
          console.log('Pools state set with', data.length, 'pools');
        } else {
          console.log('No pools data or empty array, data:', data);
          
          // Добавляем мок-данные для тестирования верстки
          const mockPools = [
            {
              pool_id: "mpool1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
              balance: 516505,
              staker_balance: 400000,
              delegations_amount: 116505,
              margin_ratio: 0.1,
              cost_per_block: 5,
              effective_pool_balance: 516505,
              pledge: 400000
            },
            {
              pool_id: "mpool2def456ghi789jkl012mno345pqr678stu901vwx234yz567abc",
              balance: 622675,
              staker_balance: 500000,
              delegations_amount: 122675,
              margin_ratio: 0.05,
              cost_per_block: 3,
              effective_pool_balance: 622675,
              pledge: 500000
            },
            {
              pool_id: "mpool3ghi789jkl012mno345pqr678stu901vwx234yz567abc890def",
              balance: 41149,
              staker_balance: 30000,
              delegations_amount: 11149,
              margin_ratio: 0.5,
              cost_per_block: 5,
              effective_pool_balance: 41149,
              pledge: 30000
            },
            {
              pool_id: "mpool4jkl012mno345pqr678stu901vwx234yz567abc890def123ghi",
              balance: 184481,
              staker_balance: 150000,
              delegations_amount: 34481,
              margin_ratio: 0.05,
              cost_per_block: 5,
              effective_pool_balance: 184481,
              pledge: 150000
            },
            {
              pool_id: "mpool5mno345pqr678stu901vwx234yz567abc890def123ghi456jkl",
              balance: 650615,
              staker_balance: 600000,
              delegations_amount: 50615,
              margin_ratio: 0.1,
              cost_per_block: 10,
              effective_pool_balance: 650615,
              pledge: 600000
            }
          ];
          
          console.log('Using mock pools data for testing');
          setPools(mockPools);
        }
      } catch (error) {
        console.error('Error loading pools:', error);
      }
    };
    getBlocks();
  }, []);

  useEffect(() => {
    const getDifficulty: any = async () => {
      try {
        const res = await fetch("/api/block/last", { cache: "no-store" });
        const data = await res.json();
        console.log('Block data loaded:', data);
        const [block] = data;
        const difficulty = block?.target_difficulty;
        console.log('Difficulty:', difficulty);
        setDifficulty(difficulty);
        setBlockHeight(block.block);
      } catch (error) {
        console.error('Error loading difficulty:', error);
      }
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
    // Only apply this filter if wallet is detected
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
    setIsJoining(false); // Reset loading state when opening modal
    setOpenJoinModal(true);
  };

  const handleConfirmJoin = async () => {
    try {
      setIsJoining(true);

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
      const tx_id = await handleDelegate(joinPoolData.pool_id);
      console.log('tx_id', tx_id);
      setOpenJoinModal(false);

      // Reset modal state
      setJoinPoolData(null);

      // Refresh the delegations data
      await refreshDelegations();

    } catch (error) {
      console.error("Join pool failed:", error);
      alert("Failed to join pool. Please try again.");
    } finally {
      setIsJoining(false);
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
      <WalletConnect handleConnect={handleConnect} handleDisconnect={handleDisconnect} detected={detected} delegations={delegations}/>

      {openModal && (
        <Modal active={openModal} setActive={setOpenModal}>
          <div className="text-xl font-semibold w-full">Joining a pool that has reached saturation</div>
          <p className="relative py-5 text-base text-justify before:absolute before:w-full before:top-2 before:border-t-1">
            This pool has reached saturation (over 600,000 {coin}). Joining a saturated pool is not recommended as contributions will have minimal impact on the pool&apos;s
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
        <Modal
          active={openJoinModal}
          setActive={(active) => {
            if (!isJoining) {
              setOpenJoinModal(active);
              if (!active) {
                setIsJoining(false); // Reset loading state when modal closes
              }
            }
          }}
        >
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
                  1. After joining, you&apos;ll need to add funds to your delegation to start earning rewards
                </div>
                <div className="mb-2">
                  2. Use the &quot;Add Coins&quot; button to fund your delegation
                </div>
                <div>
                  3. Your delegation will start earning rewards once funded
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-row justify-around w-full before:absolute before:w-full before:-top-2 before:border-t-1">
            <div
              className={`p-2 rounded text-white flex items-center justify-center gap-2 ${
                isJoining
                  ? 'bg-primary-100/70 cursor-not-allowed'
                  : 'bg-primary-100 cursor-pointer hover:bg-primary-110'
              }`}
              onClick={isJoining ? undefined : handleConfirmJoin}
            >
              {isJoining && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isJoining ? 'Confirming...' : 'Confirm & Join Pool'}
            </div>
            <div
              className={`p-2 rounded text-white ${
                isJoining
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-400 cursor-pointer hover:bg-gray-500'
              }`}
              onClick={isJoining ? undefined : () => {
                setOpenJoinModal(false);
                setIsJoining(false); // Reset loading state when canceling
              }}
            >
              Cancel
            </div>
          </div>
        </Modal>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <Switch checked={hideNonProfitPools} onChange={() => setHideNonProfitPools(!hideNonProfitPools)} />
            <span className="text-sm">Hide pools that do not provide any rewards to delegators</span>
          </div>
          {detected && (
            <div className="flex flex-row items-center gap-2">
              <Switch checked={showOnlyMyPools} onChange={() => setShowOnlyMyPools(!showOnlyMyPools)} />
              <span className="text-sm">Show only pools where I have delegations</span>
            </div>
          )}
        </div>

        {apyCalculator && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm">Your delegation amount</span>
              <input 
                type="text" 
                className="px-3 py-1 border border-gray-300 rounded-md w-20 text-center" 
                value={stakingAmountRaw} 
                onChange={({ target: { value } }) => setStakingAmount(value)} 
              />
              <span className="text-sm">{coin}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              Enter delegation amount to show estimated APY
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sort Controls */}
      <div className="md:hidden mb-6">
        <div className="text-sm font-medium mb-2">Sort by</div>
        <div className="flex flex-wrap gap-2">
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
                className={`inline-flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                  orderField === field 
                    ? 'bg-primary-100 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={handleSort(field, order === "asc" ? "desc" : "asc")}
              >
                {orderField === field && <Image alt="" className="w-4 h-4 mr-1" src={check_icon} />}
                {label}
                {orderField === field && (order === "desc" ? " ↓" : " ↑")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend for Mobile */}
      <div className="md:hidden mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" src={icon_time} alt="" />
            <span>Time to find 1 block</span>
          </div>
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" src={icon_coin} alt="" />
            <span>Cost per block</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">%</span>
            <span>Commission rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">●</span>
            <span>Saturation indicator</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-12">
        <table className="w-full border-collapse">
          <thead className="bg-white border-b border-gray-200 shadow-sm">
            <tr className="hidden md:table-row">
              {/* Pool Address */}
              <th className="text-left py-4 px-3 font-medium text-gray-700 w-[22%]">
                <div className="flex items-center gap-1">
                  <span>Pool address</span>
                </div>
              </th>
              
              {/* TML/ML Amount */}
              {apyCalculator && stakingAmount > 0 && (
                <th className="text-center py-4 px-3 font-medium text-gray-700 w-[10%]">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      onClick={handleSort("reward_per_day_delegator", "asc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort ascending"
                    >
                      ↑
                    </span>
                    <span
                      onClick={handleSort("reward_per_day_delegator", "desc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort descending"
                    >
                      ↓
                    </span>
                    <span>{coin}</span>
                  </div>
                </th>
              )}
              
              {/* APY */}
              {apyCalculator && stakingAmount > 0 && (
                <th className="text-center py-4 px-3 font-medium text-gray-700 w-[10%]">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      onClick={handleSort("apy", "asc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort ascending"
                    >
                      ↑
                    </span>
                    <span
                      onClick={handleSort("apy", "desc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort descending"
                    >
                      ↓
                    </span>
                    <span>APY</span>
                  </div>
                </th>
              )}

              {/* Time */}
              <th className="text-center py-4 px-3 font-medium text-gray-700 w-[9%]">
                <div className="flex items-center justify-center gap-1">
                  <span
                    onClick={handleSort("hours_for_block", "asc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort ascending"
                  >
                    ↑
                  </span>
                  <span
                    onClick={handleSort("hours_for_block", "desc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort descending"
                  >
                    ↓
                  </span>
                  <span
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Average time to find 1 block"
                  >
                    <Image className="w-4 h-4" src={icon_time} alt="" />
                  </span>
                </div>
              </th>

              {/* Cost per Block */}
              <th className="text-center py-4 px-3 font-medium text-gray-700 w-[9%]">
                <div className="flex items-center justify-center gap-1">
                  <span
                    onClick={handleSort("cost_per_block", "asc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort ascending"
                  >
                    ↑
                  </span>
                  <span
                    onClick={handleSort("cost_per_block", "desc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort descending"
                  >
                    ↓
                  </span>
                  <span
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Cost per block. How much a pool takes ML of the reward before splitting"
                  >
                    <Image className="w-4 h-4" src={icon_coin} alt="" />
                  </span>
                </div>
              </th>

              {/* Commission */}
              <th className="text-center py-4 px-3 font-medium text-gray-700 w-[10%]">
                <div className="flex items-center justify-center gap-1">
                  <span
                    onClick={handleSort("margin_ratio", "asc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort ascending"
                  >
                    ↑
                  </span>
                  <span
                    onClick={handleSort("margin_ratio", "desc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort descending"
                  >
                    ↓
                  </span>
                  <span
                    data-tooltip-id="tooltip"
                    data-tooltip-content="% of the reward after fixed pool cost per block goes to the delegators"
                  >
                    %
                  </span>
                </div>
              </th>

              {/* Saturation Indicator */}
              <th className={`text-center py-4 px-3 font-medium text-gray-700 ${detected ? 'w-[9%]' : 'w-[11%]'}`}>
                <div className="flex items-center justify-center gap-1">
                  <span
                    onClick={handleSort("balance", "asc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort by saturation ascending"
                  >
                    ↑
                  </span>
                  <span
                    onClick={handleSort("balance", "desc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort by saturation descending"
                  >
                    ↓
                  </span>
                </div>
              </th>

              {/* Total Balance */}
              <th className="text-center py-4 px-3 font-medium text-gray-700 w-[15%]">
                <div className="flex items-center justify-center gap-1">
                  <span
                    onClick={handleSort("balance", "asc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort ascending"
                  >
                    ↑
                  </span>
                  <span
                    onClick={handleSort("balance", "desc")}
                    className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Sort descending"
                  >
                    ↓
                  </span>
                  <span>Total Balance</span>
                </div>
              </th>

              {/* Stake - for non-connected wallets */}
              {!detected && (
                <th className="text-center py-4 px-3 font-medium text-gray-700 w-[10%]">
                  Stake
                </th>
              )}

              {/* Your Stake */}
              {detected && (
                <th className="text-center py-4 px-3 font-medium text-gray-700 w-[10%]">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      onClick={handleSort("delegation_balance", "asc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort ascending"
                    >
                      ↑
                    </span>
                    <span
                      onClick={handleSort("delegation_balance", "desc")}
                      className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Sort descending"
                    >
                      ↓
                    </span>
                    <span>Your Stake</span>
                  </div>
                </th>
              )}

              {/* Actions */}
              {detected && (
                <th className="text-center py-4 px-3 font-medium text-gray-700 w-[7%]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pools
              .map(injectApy(stakingAmount))
              .map(injectDelegations(delegations))
              .sort(sorter)
              .filter(filterer)
              .map((value: any, i: number) => {
                const { apy, reward_per_day_pool, reward_per_day_delegator, part_label, hours_for_block } = value;

                return (
                  <tr 
                    key={"pool-" + i} 
                    className={`
                      group
                      ${detected && value.delegation_exists ? 'bg-blue-50' : 'bg-white'} 
                      hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100
                      md:table-row flex flex-col md:flex-none p-4 md:p-0 mb-4 md:mb-0 rounded-lg md:rounded-none shadow md:shadow-none
                      cursor-pointer
                    `}
                  >
                    {/* Pool Address */}
                    <td className="py-4 px-3 md:w-[22%] align-middle">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase">Pool Address</div>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={"/pool/" + value.pool_id}
                            className="font-mono text-primary-100 group-hover:text-primary-110 group-hover:font-bold text-sm md:text-base transition-all duration-200"
                          >
                            <span className="hidden md:inline">
                              {value.pool_id.slice(0, 10)}...{value.pool_id.slice(-10)}
                            </span>
                            <span className="md:hidden">
                              {value.pool_id.slice(0, 8)}...{value.pool_id.slice(-8)}
                            </span>
                          </Link>
                          <span
                            className="cursor-pointer opacity-60 hover:opacity-100"
                            data-tooltip-id="tooltip"
                            data-tooltip-content={copy[value.pool_id] ? "Copied" : "Click to copy pool address"}
                            onClick={handleCopy(value.pool_id)}
                          >
                            <Image className="w-4 h-4" src={copy_icon} alt="" />
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TML/ML Amount */}
                    {apyCalculator && stakingAmount > 0 && (
                      <td className="py-4 px-3 text-center md:w-[10%] align-middle">
                        <div className="flex flex-col md:block">
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Daily Reward</div>
                          <div 
                            className="font-mono"
                            data-tooltip-id="tooltip-multiline"
                            data-tooltip-content={`${`Total ${coin} for the pool: ${reward_per_day_pool.toFixed(0)} ${coin}/day`}\n${`Your part in the pool: ${part_label}%`}\n${`You get ${reward_per_day_delegator.toFixed(2)} ${coin}/day.`}`}
                          >
                            {reward_per_day_delegator.toFixed(2)} {coin}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* APY */}
                    {apyCalculator && stakingAmount > 0 && (
                      <td className="py-4 px-3 text-center md:w-[10%] align-middle">
                        <div className="flex flex-col md:block">
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">APY</div>
                          <div 
                            className="font-bold text-black"
                            data-tooltip-id="tooltip"
                            data-tooltip-content={`Your estimated APY for this pool by delegating ${stakingAmount} ${coin}`}
                          >
                            {apy.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Time */}
                    <td className="py-4 px-3 text-center md:w-[9%] align-middle">
                      <div className="flex flex-col md:block">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Block Time</div>
                        <div 
                          className="font-mono text-sm"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={`On average, it takes ${forPopup(hoursToTimeFormatWithMinutes(hours_for_block))} to find 1 block`}
                        >
                          {forTable(hoursToTimeFormatWithMinutes(hours_for_block))}
                        </div>
                      </div>
                    </td>

                    {/* Cost per Block */}
                    <td className="py-4 px-3 text-center md:w-[9%] align-middle">
                      <div className="flex flex-col md:block">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Cost per Block</div>
                        <div 
                          className="font-mono text-sm"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={`Pool takes ${value?.cost_per_block} ${coin} of the reward before splitting`}
                        >
                          {value?.cost_per_block} {coin}
                        </div>
                      </div>
                    </td>

                    {/* Commission */}
                    <td className="py-4 px-3 text-center md:w-[10%] align-middle">
                      <div className="flex flex-col md:block">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Commission</div>
                        <div 
                          className="font-mono"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={`${((1 - value.margin_ratio) * 100).toFixed(1)}% of the reward after fixed pool cost per block goes to the delegators`}
                        >
                          {(value.margin_ratio * 100).toFixed(1)}%
                        </div>
                      </div>
                    </td>

                    {/* Saturation Indicator */}
                    <td className={`py-4 px-3 text-center align-middle ${detected ? 'md:w-[9%]' : 'md:w-[11%]'}`}>
                      <div className="flex flex-col justify-center">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-2">Saturation</div>
                        
                        {/* Progress Bar */}
                        <div className="flex items-center justify-center gap-1 px-1">
                          <div className="w-full relative">
                            <div className={`overflow-hidden h-5 text-xs flex rounded-md bg-emerald-200`}>
                              <div
                                style={{
                                  width: Math.min((value.staker_balance / 600000) * 100, 100) + "%",
                                }}
                                data-tooltip-id="tooltip"
                                data-tooltip-content={`Pool pledge amount: ${formatML(value.staker_balance, 0)} ${coin}`}
                                className="bg-[#5E726E]"
                              ></div>
                              <div
                                style={{
                                  width: Math.min(((value.balance - value.staker_balance) / 600000) * 100, 100 - (value.staker_balance / 600000) * 100) + "%",
                                }}
                                data-tooltip-id="tooltip"
                                data-tooltip-content={`Delegations balance: ${formatML((value.balance - value.staker_balance).toString(), 0)} ${coin}`}
                                className="bg-[#94A4A1]"
                              ></div>
                              {value.balance > 600000 && (
                                <div
                                  style={{
                                    width: Math.min(((value.balance - 600000) / 600000) * 100, 20) + "%",
                                  }}
                                  data-tooltip-id="tooltip"
                                  data-tooltip-content={`Oversaturated by: ${formatML((value.balance - 600000).toString(), 0)} ${coin}`}
                                  className="bg-red-400"
                                ></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Balance */}
                    <td className="py-4 px-3 text-center md:w-[15%] align-middle">
                      <div className="flex flex-col justify-center">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Total Balance</div>
                        
                        {/* Balance Amount */}
                        <div className="flex items-center justify-center gap-1">
                          <span 
                            className="font-mono text-sm"
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Total balance of the pool consists of the pool pledge and the delegations"
                          >
                            {formatML(value.balance, 0)} {coin}
                          </span>
                          <span
                            className="cursor-pointer inline-flex justify-center items-center text-xs bg-primary-110 text-white rounded-full w-4 h-4"
                            data-tooltip-id="tooltip-multiline"
                            data-tooltip-content={`Effective balance: ${formatML(value.effective_pool_balance)} ${coin} \nThe effective balance is a value proportional to the balance, \nwhich has properties that prevent centralization of pools`}
                          >
                            ?
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stake - for non-connected wallets */}
                    {!detected && (
                      <td className="py-4 px-3 text-center md:w-[10%] align-middle">
                        <div className="flex flex-col justify-center items-center">
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-2">Stake</div>
                          <button
                            disabled
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Connect your wallet to stake in this pool"
                            className="bg-gray-300 text-gray-500 px-3 py-1.5 rounded-md text-sm font-medium cursor-not-allowed w-full min-w-[70px] max-w-[90px] whitespace-nowrap"
                          >
                            Stake
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Your Stake */}
                    {detected && (
                      <td className="py-4 px-3 text-center md:w-[10%] align-middle">
                        <div className="flex flex-col justify-center">
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase mb-1">Your Stake</div>
                          {value?.delegation_balance > 0 ? (
                            <div>
                              <div className="font-bold text-primary-100 font-mono">
                                {formatML(value.delegation_balance)} {coin}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {value.delegation_count} delegation{value.delegation_count > 1 ? 's' : ''}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    {detected && (
                      <td className="py-4 px-3 text-center md:w-[7%] align-middle">
                        <div className="flex flex-col gap-2 justify-center items-center">
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase">Actions</div>
                          
                          <button
                            data-tooltip-id="tooltip"
                            data-tooltip-content={value?.delegation_exists ? "Add funds to existing delegation" : "Create new delegation in this pool"}
                            className="bg-primary-100 hover:bg-primary-110 px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors w-full min-w-[90px] max-w-[110px] whitespace-nowrap"
                            onClick={() => handleStackPool(value.balance, value.pool_id, value?.delegation_exists, value)}
                          >
                            {value?.delegation_exists ? 'Add Coins' : 'Join'}
                          </button>
                          
                          {value?.delegation_balance > 0 && (
                            <button
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Withdraw from this pool"
                              className="bg-red-500 hover:bg-red-600 px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors w-full min-w-[90px] max-w-[110px] whitespace-nowrap"
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
      </div>

      {pools.length === 0 && difficulty === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading pools...</div>
        </div>
      ) : pools.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">No pools available</div>
          <div className="text-xs text-gray-400 mt-2">
            Debug: pools.length={pools.length}, difficulty={difficulty}
          </div>
        </div>
      ) : pools.filter((item: any) => {
          // Apply same filtering logic  
          if (hideNonProfitPools) {
            if (item.margin_ratio === 1) return false;
            if (item.cost_per_block >= block_subsidy_at_height(blockHeight)) return false;
          }
          if (showOnlyMyPools && detected) {
            const hasDeleg = delegations.some((d: any) => d.pool_id === item.pool_id);
            if (!hasDeleg) return false;
          }
          return true;
        }).length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">No pools match the selected filters</div>
          <div className="text-xs text-gray-400 mt-2">
            Debug: pools.length={pools.length}, hideNonProfitPools={hideNonProfitPools}, showOnlyMyPools={showOnlyMyPools}, detected={detected}
          </div>
          <button 
            onClick={() => {
              setHideNonProfitPools(true);
              setShowOnlyMyPools(false);
            }}
            className="ml-4 text-primary-100 hover:text-primary-110 underline text-sm"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function forTable({ d, h, m }: { d: number; h: number; m: number }) {
  if (d > 100) {
    return <div className="w-[60px] text-center">-</div>;
  }
  return (
    <div className="flex gap-1 justify-center items-center text-xs">
      {d > 0 && <span>{d}d</span>}
      {h > 0 && <span>{h}h</span>}
      {m > 0 && <span>{m}m</span>}
    </div>
  );
}

function forPopup({ d, h, m }: { d: number; h: number; m: number }) {
  return `${d > 0 ? `${d} day${d > 1 ? "s" : ""} ` : ""}${h > 0 ? `${h} hour${h > 1 ? "s" : ""} ` : ""}${m === 1 ? `${m} minute ` : ""}${m > 1 ? `${m} minutes ` : ""}`;
}

function hoursToTimeFormatWithMinutes(hours: number) {
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  const m = Math.floor((hours % 1) * 60);
  return { d, h, m };
}
