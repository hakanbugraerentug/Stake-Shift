import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, counterPDA, CounterData } from "../anchor/setup";
import IncrementButton from "./ui/increment-button";

export default function CounterState() {
  const { connection } = useConnection();
  const [counterData, setCounterData] = useState<CounterData | null>(null);

  useEffect(() => {
    const fetchCounterData = async () => {
      try {
        // Fetch initial account data
        const data = await program.account.counter.fetch(counterPDA);
        setCounterData(data);
      } catch (error) {
        console.error("Error fetching counter data:", error);
      }
    };

    fetchCounterData();

    // Subscribe to account change
    const subscriptionId = connection.onAccountChange(
      counterPDA,
      accountInfo => {
        try {
          const decodedData = program.coder.accounts.decode(
            "counter",
            accountInfo.data,
          );
          setCounterData(decodedData);
        } catch (error) {
          console.error("Error decoding account data:", error);
        }
      },
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="dark:text-dark-text mb-2">Count: {counterData?.count?.toString()}</div>
      </div>
      <IncrementButton />
      <div className="text-xs text-gray-400 dark:text-gray-600 italic mt-2">
        This is just for fun lol. The counter is stored on blockchain so anyone can increase the counter but it will be removed in the future
      </div>
    </div>
  );
}