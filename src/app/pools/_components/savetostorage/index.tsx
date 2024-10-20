"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SaveToLocalStorage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the query parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("referral-code");

    if (param) {
      // Save the parameter to local storage
      localStorage.setItem("staking-program-referral-code", param);
    }
  }, [router]);

  return null;
};

export default SaveToLocalStorage;
