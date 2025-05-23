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
    const t = await client.delegationCreate({ pool_id: pool_id, destination: 'tmt1q9ujk3d8hfu6jhhnsrx0r2tes7t6teujt5xx3wxx' });
    console.log('t', t);
  };

  const handleConnect = () => {
    if (client) {
      client.connect()
        .then(async () => {
          setDetected(true);
          const delegationData = await client.getDelegations();
          console.log('delegationData', delegationData);
          setDelegations(delegationData);
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
    handleConnect,
    delegations,
  };
}
