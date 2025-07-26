import { Hero } from "@/app/_components/hero";
import TokenVerificationForm from "@/app/_components/token-verification-form";
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
            <p className="text-lg mb-8 text-gray-600">
              Use this page to submit a request for token verification on the Mintlayer network.
              This will help users identify your token as legitimate and increase trust.
            </p>
          </div>
        </div>
      </Hero>
      <div className="max-w-6xl w-full px-5 md:mx-auto pb-10">
        <TokenVerificationForm />
      </div>
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