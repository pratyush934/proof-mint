import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load a signer keypair from an environment variable (for paying fees)
const signerSecretKey = process.env.SIGNER_SECRET_KEY;
if (!signerSecretKey) {
  throw new Error("SIGNER_SECRET_KEY not set in environment variables");
}
const signer = Keypair.fromSecretKey(Buffer.from(signerSecretKey, "base64"));

export async function POST(request: NextRequest) {
  try {
    const { metadataUrl, name, publicKey } = await request.json();

    if (!metadataUrl || !name || !publicKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const metaplex = Metaplex.make(connection).use(keypairIdentity(signer));

    const { nft } = await metaplex.nfts().create({
      uri: metadataUrl,
      name,
      symbol: "NFT",
      sellerFeeBasisPoints: 0,
      isMutable: true,
      tokenOwner: new PublicKey(publicKey), // Mint to the user's wallet
    });

    return NextResponse.json({
      success: true,
      mintAddress: nft.mint.address.toString(),
      tokenAddress: nft.address.toString(),
      txSignature: nft.mint.mintAuthority.toString(), // Adjust based on response
    });
  } catch (error) {
    console.error("Minting error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}