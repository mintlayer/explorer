import { useEffect, useState } from "react";

const requiredVersion = "1.2.0";

export function useWallet() {
  const [extensionId, setExtensionId] = useState("");
  const [detected, setDetected] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    window.addEventListener("InitWalletResponse", (evt: any) => {
      if (evt && evt.detail && "version" in evt.detail) {
        const data = evt.detail;
        setDetected(data.version);
        setExtensionId(data.extension_id);
      }
    });
    const event = new CustomEvent("InitWalletRequest");
    window.dispatchEvent(event);
  }, []);

  const handleDelegate = (pool_id: string) => {
    const referral_code = localStorage.getItem("staking-program-referral-code") || "";

    window.postMessage(
      {
        direction: "from-page-script",
        message: { message: "delegate", pool_id: pool_id, referral_code: referral_code },
      },
      window.location.origin,
    );

    const browser = (window as any).chrome;

    if (typeof browser !== "undefined") {
      browser.runtime.sendMessage(extensionId, { message: "delegate", pool_id: pool_id, referral_code: referral_code }).then(
        (reply: any) => {
          // handle reply
        },
        (error: any) => {
          // handle error
          console.error(error.message);
        },
      );
    }
  };

  const handleConnect = () => {
    const event = new CustomEvent("InitWalletRequest");
    window.dispatchEvent(event);
  };

  return {
    detected,
    balance,
    handleDelegate,
    handleConnect,
  };
}
