"use client";

import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function requestAirdrop(publicKey: PublicKey): Promise<string> {
  try {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    const signature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL * 2 // Requesting 2 SOL
    );
    
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    throw error;
  }
}