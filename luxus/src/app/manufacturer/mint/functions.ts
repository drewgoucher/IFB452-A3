import { ethers } from "ethers";
import { MINT_ADDRESS, MINT_ABI, CONTROL_ADDRESS, CONTROL_ABI } from "@/lib/constants";

export async function mintProduct(
  form: { brand: string; serialNumber: string; productType: string; material: string },
  signer: ethers.Signer,
  setStatus: (s: string | null) => void
): Promise<{ tokenId: bigint; txHash: string }> {
  const { brand, serialNumber, productType, material } = form;
  const mintContract = new ethers.Contract(MINT_ADDRESS, MINT_ABI, signer);

  setStatus("1. Please confirm minting the token");
  const txResponse = await mintContract.mint(brand, serialNumber, productType, material);

  setStatus("Waiting for mint transaction...");
  const receipt = await txResponse.wait();

  if (!receipt) throw new Error("Minting transaction failed.");

  for (const log of receipt.logs) {
    try {
      const parsed = mintContract.interface.parseLog(log);
      if (parsed?.name === "Minted") {
        return {
          tokenId: parsed.args.tokenId,
          txHash: receipt.hash,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error("Token ID not found in event logs.");
}

export async function registerProduct(
  tokenId: bigint,
  signer: ethers.Signer,
  ipfsUrl: string,
  setStatus: (s: string | null) => void
): Promise<string> {
  const controlContract = new ethers.Contract(CONTROL_ADDRESS, CONTROL_ABI, signer);

  setStatus("2. Please confirm registering the product.");
  const registerTx = await controlContract.register(tokenId, ipfsUrl);

  setStatus("Waiting for registration transaction...");
  await registerTx.wait();

  return registerTx.hash;
}

export async function verifyProduct(tokenId: bigint, signer: ethers.Signer, setStatus: (s: string | null) => void): Promise<string> {
  const controlContract = new ethers.Contract(CONTROL_ADDRESS, CONTROL_ABI, signer);

  setStatus("3. Please confirm verifying the product.");
  const registerTx = await controlContract.verify(tokenId);

  setStatus("Waiting for verification transaction...");
  await registerTx.wait();

  return registerTx.hash;
}
