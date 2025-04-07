"use client";

import { useMintNFT } from "@/hooks/useMintNTF";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

// Define the MintResult type (or import it from useMintNFT.ts if exported)
interface MintResult {
  success: boolean;
  mintAddress?: string;
  tokenAddress?: string;
  txSignature?: string;
  error?: string;
}

export default function MintButton({
  metadataUrl,
  name,
}: {
  metadataUrl: string;
  name: string;
}) {
  const { mintNFT } = useMintNFT();
  const { connected, publicKey } = useWallet();
  const [minted, setMinted] = useState<MintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Starting mint process with:", { metadataUrl, name });

      const nft = await mintNFT(metadataUrl, name);
      console.log("Mint result:", nft);

      if (nft.success) {
        setMinted(nft);
      } else {
        setError(
          nft.error || "Failed to mint NFT. Please check console for details."
        );
      }
    } catch (e: unknown) {
      console.error("Mint failed with exception:", e);
      setError(
        e instanceof Error ? e.message : "An error occurred during minting."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
        <p>
          Please connect your wallet using the button at the bottom of the page
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-md">
      <div className="p-4 bg-green-100 text-green-800 rounded w-full">
        <h3 className="font-bold">Ready to mint</h3>
        <p>Wallet connected: {publicKey?.toString().substring(0, 4)}...</p>
        <p>Metadata URL: {metadataUrl.substring(0, 20)}...</p>
        <p>NFT Name: {name}</p>
      </div>

      <button
        onClick={handleMint}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 transition text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Minting... Please Wait" : "Mint NFT"}
      </button>

      {minted && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded w-full">
          <h3 className="font-bold">✅ NFT Minted Successfully!</h3>
          <p>Mint Address: {minted.mintAddress}</p>
          <a
            href={`https://explorer.solana.com/address/${minted.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View on Solana Explorer
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded w-full">
          <h3 className="font-bold">❌ Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
