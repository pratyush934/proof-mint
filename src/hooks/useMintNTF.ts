"use client";

import {
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    getAccount,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export const useMintNFT = () => {
  const { publicKey, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNFT = async (
    metadataUri: string,
    name: string,
    symbol = "IPNFT"
  ) => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // 1. Create Mint Account + Initialize Mint
      const createMintIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      const initMintIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        0,
        publicKey,
        publicKey
      );

      const tx1 = new Transaction().add(createMintIx, initMintIx);
      tx1.feePayer = publicKey;
      tx1.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx1.partialSign(mintKeypair);
      const signedTx1 = await signTransaction(tx1);
      const txId1 = await connection.sendRawTransaction(signedTx1.serialize());
      await connection.confirmTransaction(txId1, "confirmed");

      // 2. Create Associated Token Account - MANUAL APPROACH
      // First, find the associated token address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      // Try to get the account to see if it exists
      let tokenAccount;
      try {
        tokenAccount = await getAccount(connection, associatedTokenAddress);
      } catch (error) {
        // If account doesn't exist, create it
        const createATAIx = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          associatedTokenAddress, // ATA address
          publicKey, // owner
          mintKeypair.publicKey // mint
        );

        const createATATx = new Transaction().add(createATAIx);
        createATATx.feePayer = publicKey;
        createATATx.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        const signedCreateATATx = await signTransaction(createATATx);
        const createATASig = await connection.sendRawTransaction(
          signedCreateATATx.serialize()
        );
        await connection.confirmTransaction(createATASig, "confirmed");

        tokenAccount = {
          address: associatedTokenAddress,
          mint: mintKeypair.publicKey,
        };
      }

      // 3. Mint to your wallet (1 token)
      const mintIx = createMintToInstruction(
        mintKeypair.publicKey, // Mint address
        associatedTokenAddress, // Destination (ATA)
        publicKey, // Authority (your wallet)
        1 // Amount
      );

      const mintTx = new Transaction().add(mintIx);
      mintTx.feePayer = publicKey;
      mintTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      // Only need to sign with mintKeypair if it's the mint authority
      if (mintKeypair.publicKey.equals(publicKey)) {
        mintTx.partialSign(mintKeypair);
      }

      const signedMintTx = await signTransaction(mintTx);
      const mintSig = await connection.sendRawTransaction(
        signedMintTx.serialize()
      );
      await connection.confirmTransaction(mintSig, "confirmed");

      // 4. Create Metadata PDA
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const metadataIx = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mintKeypair.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name,
              symbol,
              uri: metadataUri,
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: publicKey,
                  verified: true,
                  share: 100,
                },
              ],
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      const metadataTx = new Transaction().add(metadataIx);
      metadataTx.feePayer = publicKey;
      metadataTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedMetadataTx = await signTransaction(metadataTx);
      const metadataSig = await connection.sendRawTransaction(
        signedMetadataTx.serialize()
      );
      await connection.confirmTransaction(metadataSig, "confirmed");

      return {
        success: true,
        mintAddress: mintKeypair.publicKey.toBase58(),
        tokenAccount: associatedTokenAddress.toBase58(),
        metadataPDA: metadataPDA.toBase58(),
        txId1,
        mintSig,
        metadataSig,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Mint error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { mintNFT, isLoading, error };
};
