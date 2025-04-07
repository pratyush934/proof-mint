"use client";

import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useCallback } from "react";

// Define the return type for mintNFT
interface MintResult {
  success: boolean;
  mintAddress?: string;
  tokenAddress?: string;
  txSignature?: string;
  error?: string;
}

const SOLANA_CONNECTION = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

export const useMintNFT = () => {
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;

  const mintNFT = useCallback(
    async (metadataUrl: string, name: string): Promise<MintResult> => {
      try {
        console.log("Starting NFT minting process...");

        if (!publicKey || !signTransaction) {
          console.error("Wallet not connected or cannot sign");
          return { success: false, error: "Wallet not connected or cannot sign." };
        }

        console.log("Connected wallet:", publicKey.toString());
        console.log("Metadata URL:", metadataUrl);
        console.log("NFT Name:", name);

        const metaplex = Metaplex.make(SOLANA_CONNECTION).use(
          walletAdapterIdentity(wallet)
        );

        const { nft, response } = await metaplex.nfts().create({
          uri: metadataUrl,
          name,
          symbol: "NFT",
          sellerFeeBasisPoints: 0,
          isMutable: true,
        });

        console.log("NFT minted:", nft);
        return {
          success: true,
          mintAddress: nft.mint.address.toString(),
          tokenAddress: nft.address.toString(),
          txSignature: response.signature,
        };
      } catch (error) {
        console.error("Error in mintNFT:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred during minting",
        };
      }
    },
    [publicKey, signTransaction]
  );

  return { mintNFT };
};