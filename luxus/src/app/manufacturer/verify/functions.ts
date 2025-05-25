import { SALE_ABI, SALE_ADDRESS } from "@/lib/constants";
import { ethers } from "ethers";

export async function transferToken(tokenId: string, signer: ethers.JsonRpcSigner, recipient: string): Promise<string> {
  const saleContract = new ethers.Contract(SALE_ADDRESS, SALE_ABI, signer);

  const tx = await saleContract.directTransfer(tokenId, recipient);
  await tx.wait();

  return tx.hash;
}
