import { useEffect, useState } from "react";
import { Client } from "@mintlayer/sdk";

export function useWallet() {
  const [detected, setDetected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [client, setClient] = useState<Client | null>(null);
  const [delegations, setDelegations] = useState<any[]>([]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const newClient = await Client.create({ network: "testnet" });
        setClient(newClient);
      } catch (error) {
        console.error("Error creating client:", error);
      }
    };

    fetchClient();
  }, []);

  const handleDelegate = async (pool_id: string) => {
    const destination = await client.getAddresses();
    const t = await client.delegationCreate({ pool_id: pool_id, destination: destination?.receiving[0] });

    const { tx_id } = client?.broadcastTx(t);

    return tx_id;
  };

  const handleAddFunds = async (delegation_id: string, amount: string) => {
    try {
      if (!client) {
        throw new Error("Wallet client not available");
      }

      // Note: This is a placeholder for the add funds functionality
      // The actual SDK method might be delegationStake or similar
      const result = await client.delegationStake({
        delegation_id,
        amount: parseFloat(amount),
      });

      console.log('Add funds result:', result);

      // Refresh delegations and balance after adding funds
      const updatedDelegations = await client.getDelegations();
      setDelegations(updatedDelegations);

      const updatedBalance = await client.getBalance();
      setBalance(parseFloat(updatedBalance.toString()) || 0);

      return result;
    } catch (error) {
      console.error("Error adding funds to delegation:", error);
      throw error;
    }
  };

  const handleWithdraw = async (delegation_id: string, amount: string, destination_address: string) => {
    try {
      if (!client) {
        throw new Error("Wallet client not available");
      }

      // Note: This is a placeholder for the withdrawal functionality
      // The actual SDK method might be different - this needs to be verified
      const result = await client.delegationWithdraw({
        delegation_id,
        amount: parseFloat(amount),
      });

      console.log('Withdrawal result:', result);

      // Refresh delegations after withdrawal
      const updatedDelegations = await client.getDelegations();
      setDelegations(updatedDelegations);

      return result;
    } catch (error) {
      console.error("Error withdrawing from delegation:", error);
      throw error;
    }
  };

  const refreshDelegations = async () => {
    try {
      if (client && detected) {
        const delegationData = await client.getDelegations();
        setDelegations(delegationData);

        // Also refresh balance
        const balanceData = await client.getBalance();
        setBalance(parseFloat(balanceData.toString()) || 0);
      }
    } catch (error) {
      console.error("Error refreshing delegations:", error);
    }
  };

  const handleConnect = () => {
    if (client) {
      client.connect()
        .then(async () => {
          setDetected(true);
          const delegationData = await client.getDelegations();
          setDelegations(delegationData);

          // Fetch wallet balance
          try {
            const balanceData = await client.getBalance();
            setBalance(parseFloat(balanceData.toString()) || 0);
          } catch (error) {
            console.error("Error fetching balance:", error);
          }
        })
        .catch((error) => {
          console.error("Error connecting to wallet:", error);
        });
    }
  };

  return {
    detected,
    balance,
    handleDelegate,
    handleAddFunds,
    handleWithdraw,
    handleConnect,
    delegations,
    refreshDelegations,
  };
}
