"use client";

import { useState, ChangeEvent, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PulseLoader } from "react-spinners";
import { ethers } from "ethers";
import { listProductForSale, saleTransfer } from "./functions";

export default function Sale(): JSX.Element {
  const [listForm, setListForm] = useState({
    tokenId: "",
    name: "",
    price: "",
  });

  const [buyForm, setBuyForm] = useState({
    tokenId: "",
    buyer: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleListChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setListForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuyForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleList() {
    const { tokenId, name, price } = listForm;
    if (!tokenId || !name || !price) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Connecting to wallet...");
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install it to continue.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Submitting listing...");
      const txHash = await listProductForSale(tokenId, name, parseFloat(price), signer);
      setTx(txHash);
      setStatus("✅ Product successfully listed for sale!");
    } catch (err) {
      setError((err as Error).message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy() {
    const { tokenId, buyer } = buyForm;
    if (!tokenId || !buyer) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Connecting to wallet...");
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install it to continue.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Submitting purchase...");
      const txHash = await saleTransfer(tokenId, buyer, signer);
      setTx(txHash);
      setStatus("✅ Sale transferred successfully!");
    } catch (err) {
      setError((err as Error).message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 border rounded-xl shadow flex flex-col items-center w-full max-w-3xl">
      <h2 className="text-xl font-bold">List Product for Sale</h2>
      <div className="space-y-2 w-full">
        <Label htmlFor="tokenId">Token ID</Label>
        <Input id="tokenId" name="tokenId" value={listForm.tokenId} onChange={handleListChange} placeholder="e.g. 1" />
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" value={listForm.name} onChange={handleListChange} placeholder="Awesome Item" />
        <Label htmlFor="price">Price (ETH)</Label>
        <Input id="price" name="price" value={listForm.price} onChange={handleListChange} placeholder="0.01" />
        <Button onClick={handleList} className="bg-green-600 text-white w-full">
          List Product
        </Button>
      </div>

      <h2 className="text-xl font-bold pt-6">Transfer Sold Product to Buyer</h2>
      <div className="space-y-2 w-full">
        <Label htmlFor="tokenId">Token ID</Label>
        <Input id="tokenId" name="tokenId" value={buyForm.tokenId} onChange={handleBuyChange} placeholder="e.g. 1" />
        <Label htmlFor="buyer">Buyer Address</Label>
        <Input id="buyer" name="buyer" value={buyForm.buyer} onChange={handleBuyChange} placeholder="0x..." />
        <Button onClick={handleBuy} className="bg-blue-600 text-white w-full">
          Transfer Sold Product
        </Button>
      </div>

      <div className="flex flex-col items-center w-full">
        {status && loading ? (
          <div className="text-sm text-green-600 flex flex-col gap-y-4 mt-2 items-center break-words whitespace-pre-wrap">
            <PulseLoader size={6} color="#16a34a" />
            <pre className="ml-2">{status}</pre>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full justify-center gap-y-3">
            <p className="text-sm text-green-600 break-words whitespace-pre-wrap">{status}</p>
            {tx && (
              <a
                href={`https://sepolia.etherscan.io/tx/${tx}`}
                className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tx}
              </a>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 break-words whitespace-pre-wrap">{error}</p>}
    </div>
  );
}
