"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";

export const WalletDebug = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWalletBalance = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

      setBalance(balanceInSOL);
    } catch (err) {
      console.error("Error checking balance:", err);
      setError("Failed to check balance");
    } finally {
      setLoading(false);
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const signature = await connection.requestAirdrop(
        publicKey,
        2 * LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(signature, "confirmed");

      // Update balance after airdrop
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

      setBalance(balanceInSOL);
    } catch (err) {
      console.error("Error requesting airdrop:", err);
      setError("Failed to request airdrop");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="p-4 bg-orange-100 text-orange-800 rounded">
        Wallet not connected
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-300 rounded">
      <h3 className="font-bold">Wallet Debug</h3>
      <p>Address: {publicKey?.toString()}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      {balance !== null && <p>Balance: {balance.toFixed(4)} SOL</p>}

      <div className="flex gap-2 mt-2">
        <button
          onClick={checkWalletBalance}
          disabled={loading || !connected}
          className="bg-blue-500 text-black px-2 py-1 rounded text-sm"
        >
          Check Balance
        </button>

        <button
          onClick={requestAirdrop}
          disabled={loading || !connected}
          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
        >
          Request 2 SOL
        </button>
      </div>

      {loading && <p className="text-gray-500 mt-2">Loading...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default WalletDebug;
