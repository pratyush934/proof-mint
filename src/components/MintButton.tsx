"use client";

import { useMintNFT } from "@/hooks/useMintNTF";
import { useState } from "react";

export default function MintButton({ metadataUrl, name }: { metadataUrl: string, name: string }) {
  const { mintNFT } = useMintNFT();
  const [minted, setMinted] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    try {
      setLoading(true);
      const nft = await mintNFT(metadataUrl, name);
      setMinted(nft);
    } catch (e) {
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
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {minted && (
        <div className="mt-2">
          <a
            className="text-blue-500 underline"
            href={`https://explorer.solana.com/address/${minted.address.toString()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
}
