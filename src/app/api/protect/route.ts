import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import crypto from "crypto";
import { currentUser } from "@clerk/nextjs/server";

// Helper to hash file as buffer
async function getSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(buffer))
    .digest("hex");
  return hash;
}

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "User is not authorized ",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const data = await request.formData();

    const ipName = data.get("ipName") as string;
    const yourName = data.get("yourName") as string;
    const file: File | null = data.get("file") as unknown as File;

    if (!ipName || !yourName || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: SHA256 hash of file
    const sha256 = await getSHA256(file);

    // Step 2: Upload file to IPFS via Pinata
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);

    // Step 3: Create metadata JSON
    const metadata = {
      name: ipName,
      description: `IP registered by ${yourName}`,
      image: url,
      attributes: [
        { trait_type: "Creator", value: yourName },
        { trait_type: "SHA256", value: sha256 },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    // Step 4: Upload metadata JSON
    const { cid: metadataCid } = await pinata.upload.public.file(metadataFile);
    const metadataUrl = await pinata.gateways.public.convert(metadataCid);

    // Step 5: Send response
    return NextResponse.json(
      {
        message: "File and metadata uploaded to IPFS via Pinata",
        ipName,
        yourName,
        sha256,
        file: {
          cid,
          url,
        },
        metadata: {
          cid: metadataCid,
          url: metadataUrl,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
