import { SALE_ABI, SALE_ADDRESS } from "@/lib/constants";
import { ethers } from "ethers";

export async function listProductForSale(tokenId: string, productName: string, price: number, signer: ethers.JsonRpcSigner): Promise<string> {
  const saleContract = new ethers.Contract(SALE_ADDRESS, SALE_ABI, signer);

  const tx = await saleContract.sale(tokenId, productName, ethers.parseUnits(price.toString(), "wei"));
  await tx.wait();

  return tx.hash;
}

export async function saleTransfer(tokenId: string, buyer: string, signer: ethers.JsonRpcSigner): Promise<string> {
  const saleContract = new ethers.Contract(SALE_ADDRESS, SALE_ABI, signer);

  const tx = await saleContract.saleTransfer(tokenId, buyer);
  await tx.wait();

  console.log("Sale Transfer Tx Hash:", tx.hash);
  return tx.hash;
}
