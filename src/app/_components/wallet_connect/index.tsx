"use client";
import { useWallet } from "@/hooks/useWallet";
import Image from "next/image";
import Link from "next/link";

import icon_firefox from "./ff-addon.svg";
import icon_chrome from "./chrome-white.svg";

export function WalletConnect({ handleConnect, handleDisconnect, detected, delegations }: any) {
  if (!detected) {
    return (
      <div className="mt-10 max-w-2xl mx-auto">
        {/* Content */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold">Get Mojito Wallet</div>
          </div>

          {/* All buttons in one line */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Link
                data-tooltip-id="tooltip"
                data-tooltip-content="Mojito Wallet is available for Chrome"
                href="https://chromewebstore.google.com/detail/mojito-a-mintlayer-wallet/hbnpcbochkgodkmmicbhfpmmkhbfbhim"
                className="bg-[#94A4A1] hover:bg-[#7A8B87] text-[#FFFFFF] text-base px-3 py-1 inline-flex gap-2 rounded-md transition-colors"
              >
                Download for <Image width={24} height={24} src={icon_chrome} alt="" />
              </Link>
              
              <Link
                data-tooltip-id="tooltip"
                data-tooltip-content="Mojito Wallet is also available for Firefox"
                href="https://addons.mozilla.org/en-US/firefox/addon/mojito-a-mintlayer-wallet/"
                className="bg-[#94A4A1] hover:bg-[#7A8B87] text-[#FFFFFF] text-base px-3 py-1 inline-flex gap-2 rounded-md transition-colors"
              >
                Download for <Image width={24} height={24} src={icon_firefox} alt="" />
              </Link>
            </div>
            or
            <div className="flex items-center space-x-2">
              <button
                data-tooltip-id="tooltip"
                data-tooltip-content="If the wallet is installed but not automatically detected, click 'connect'."
                className="bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-gray-200 hover:border-gray-300 text-[#4B5563] hover:text-[#374151] px-4 py-2 rounded-lg font-medium transition-all duration-200"
                onClick={handleConnect}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected state - компактная версия
  return (
    <div className="mt-10 max-w-2xl mx-auto">
      {/* Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        {/* Success header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[rgba(17,150,127,1)]">
              Mojito Wallet Connected
            </h2>
            <p className="text-[rgba(17,150,127,1)] font-medium text-sm">Ready to stake and earn rewards!</p>
          </div>
          {/* Disconnect button */}
          <button
            onClick={handleDisconnect}
            className="text-[rgba(17,150,127,1)] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
            data-tooltip-id="tooltip"
            data-tooltip-content="Disconnect wallet"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
            </svg>
          </button>
        </div>

        {/* Stats in one row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Delegations card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[rgba(17,150,127,1)] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[rgba(17,150,127,1)]">Delegations</h3>
            </div>
            <div className="text-2xl font-bold text-[rgba(17,150,127,1)]">
              {delegations.length}
            </div>
            <p className="text-[rgba(17,150,127,1)] text-xs mt-1">
              {delegations.length === 0 ? "Start staking to earn" : "Active pools"}
            </p>
          </div>

          {/* Action card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[rgba(17,150,127,1)] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7l5 5-5 5M6 7l5 5-5 5"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[rgba(17,150,127,1)]">
                {delegations.length === 0 ? "Next Step Choose Pool" : "Manage Your Stakes"}
              </h3>
            </div>
            <div className="text-2xl font-bold text-transparent">
              {/* Пустое пространство для выравнивания с соседней карточкой */}
              &nbsp;
            </div>
            <p className="text-xs mt-1 text-[rgba(17,150,127,1)]">
              {delegations.length === 0 
                ? "Browse pools below and press Join" 
                : "Add or withdraw stake from your pools"}
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}
