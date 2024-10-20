"use client";
import { useWallet } from "@/hooks/useWallet";
import Image from "next/image";
import Link from "next/link";

import icon_firefox from "./ff-addon.svg";
import icon_chrome from "./chrome-white.svg";

export function WalletConnect() {
  const { handleConnect, detected } = useWallet();

  if (!detected) {
    return (
      <div className="mt-10 max-w-2xl mx-auto bg-white shadow-md rounded-md p-4 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Get Mojito Wallet</div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Link
              data-tooltip-id="tooltip"
              data-tooltip-content="Mojito Wallet is available for Chrome"
              href="https://chromewebstore.google.com/detail/mojito-a-mintlayer-wallet/hbnpcbochkgodkmmicbhfpmmkhbfbhim"
              className="bg-primary-100 text-white text-base px-3 py-1 inline-flex gap-2 mx-auto rounded-md"
            >
              Download for <Image width={24} height={24} src={icon_chrome} alt="" />
            </Link>
            <Link
              data-tooltip-id="tooltip"
              data-tooltip-content="Mojito Wallet is also available for Firefox"
              href="https://addons.mozilla.org/en-US/firefox/addon/mojito-a-mintlayer-wallet/"
              className="bg-primary-100 text-white text-base px-3 py-1 inline-flex gap-2 mx-auto rounded-md"
            >
              Download for <Image width={24} height={24} src={icon_firefox} alt="" />
            </Link>
          </div>
          or
          <div className="flex items-center space-x-2">
            <button
              data-tooltip-id="tooltip"
              data-tooltip-content="If the wallet is installed but not automatically detected, click 'connect'."
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-2xl mx-auto bg-white shadow-md rounded-md p-4 hidden md:block">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">Mojito Wallet</div>
        {/*<div className="flex items-center space-x-2">*/}
        {/*  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md" onClick={handleConnect}>*/}
        {/*    Mojito*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>
      <div className="mt-4">
        <div className="text-gray-500">Wallet detected. Choose pool and press Stake</div>
      </div>
    </div>
  );
}
