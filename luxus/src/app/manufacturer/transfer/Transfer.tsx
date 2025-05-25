"use client";

import { useState, ChangeEvent, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PulseLoader } from "react-spinners";
import { ethers } from "ethers";
import { transferToken } from "./functions";
import { Shuffle } from "lucide-react";
import { useAtomValue } from "jotai";
import { walletAddressAtom } from "@/app/atoms/wallet";

interface TransferForm {
  to: string;
  tokenId: string;
}

export default function Transfer(): JSX.Element {
  const [form, setForm] = useState<TransferForm>({
    to: "",
    tokenId: "",
  });

  const walletAddress = useAtomValue(walletAddressAtom);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleTransfer(): Promise<void> {
    const { to, tokenId } = form;

    if (!to || !tokenId) {
      setError("Recipient and token ID are required.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Connecting to wallet...");
      setError(null);

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Waiting for transfer confirmation...");
      const txHash = await transferToken(tokenId, signer, to);
      setTx(txHash);

      setStatus(`✅ Token transfered successfully!`);
    } catch (err) {
      const error = err as { code?: string; message: string };
      const code = error.code;

      if (code === "CALL_EXCEPTION") {
        setError("❌ You are not the owner of this token.");
      }

      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-xl items-center shadow flex flex-col w-full max-w-3xl">
      <div className="space-y-2 w-full">
        <Label htmlFor="tokenId">Token ID</Label>
        <Input id="tokenId" name="tokenId" value={form.tokenId} onChange={handleChange} placeholder="e.g. 1" />

        <Label htmlFor="to">To Address</Label>
        <Input id="to" name="to" value={form.to} onChange={handleChange} placeholder="0x..." />
      </div>

      <Button onClick={handleTransfer} className="bg-blue-600 text-white w-full">
        Transfer Token
      </Button>

      <div className="flex justify-center w-full">
        {status && loading ? (
          <div className="text-sm text-green-600 flex flex-col gap-y-4 mt-2 items-center break-words whitespace-pre-wrap">
            <PulseLoader size={6} color="#16a34a" />
            <pre className="ml-2">{status}</pre>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full overflow-hidden justify-center gap-y-3">
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
            {tx && (
              <div className="flex flex-col items-center mt-6 gap-y-2 gap-x-8">
                <p className="text-sm text-zinc-800 ">{walletAddress}</p>
                <Shuffle className="w-6 h-6 text-sky-600" />
                <p className="text-sm text-zinc-800 break-words whitespace-pre-wrap">{form.to}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 break-words whitespace-pre-wrap">{error}</p>}
    </div>
  );
}
