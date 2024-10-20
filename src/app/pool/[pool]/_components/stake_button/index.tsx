"use client";

import { useWallet } from "@/hooks/useWallet";

export const StakeButton = ({ pool_id }: any) => {
  const { handleDelegate, detected } = useWallet();

  return (
    <button
      data-tooltip-id="tooltip"
      data-tooltip-content={detected ? "Stake to this pool" : "Connect wallet to stake"}
      disabled={!detected}
      className={`${detected ? "bg-primary-100 hover:bg-primary-110" : "bg-secondary-100"} px-2 py-1 text-white rounded`}
      onClick={() => handleDelegate(pool_id)}
    >
      Stake
    </button>
  );
};
