"use server";
import {
    Metaplex,
    walletAdapterIdentity
} from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";

export const useMintNFT = () => {
  const { publicKey, signTransaction, wallet } = useWallet();

  const mintNFT = async (metadataUrl: string, name: string, symbol: string = "IPNFT") => {
    if (!publicKey || !wallet || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet.adapter))

    const { nft } = await metaplex.nfts().create({
      uri: metadataUrl,
      name,
      symbol,
      sellerFeeBasisPoints: 0, // No royalties for now
    });

    return nft;
  };

  return { mintNFT };
};
