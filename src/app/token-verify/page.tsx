import { Hero } from "@/app/_components/hero";
import { Summary } from "@/app/_components/summary";
import React from "react";

// icons
import icon_info from "@/app/(homepage)/_icons/16px/info.svg";

export default function TokenVerify() {
  return (
    <>
      <Hero>
        <div className="max-w-6xl px-5 md:mx-auto">
          <div className="md:col-span-7">
            <div className="text-5xl font-bold mt-4 mb-8 leading-[4rem]">Token Verification</div>
          </div>
          <div className="mb-8">
            <Summary
              data={[
                {title: 'Status', value: 'Enter token ID for verification', icon: icon_info},
              ]}
            />
          </div>
          
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Enter Token ID</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Token ID" 
                  className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Verify
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Enter token ID to verify its status and authenticity.
              </p>
            </div>
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Verification Information</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This page allows you to verify the authenticity and status of a token on the Mintlayer network.
            After entering the token ID, you will receive complete information about it, including:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-400">
            <li>Verification status</li>
            <li>Creation date</li>
            <li>Token issuer information</li>
            <li>Transaction history</li>
          </ul>
        </div>
      </div>
    </>
  );
} 