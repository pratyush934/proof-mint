"use client";

import { useMintNFT } from "@/hooks/useMintNTF";
import { useState } from "react";

export default function MintButton({ metadataUrl, name }: { metadataUrl: string, name: string }) {
  const { mintNFT } = useMintNFT();
  const [minted, setMinted] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    try {
      setLoading(true);
      setError(null);
      const nft = await mintNFT(metadataUrl, name);
      if (nft.success) {
        setMinted(nft);
      } else {
        setError(nft.error || "Failed to mint NFT.");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred during minting.");
      console.error("Mint failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleMint}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded"
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {minted && (
        <div className="mt-4 text-green-600">
          ✅ NFT Minted Successfully!
          <br />
          <a
            className="text-blue-500 underline"
            href={`https://explorer.solana.com/address/${minted.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View NFT on Solana Explorer
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
