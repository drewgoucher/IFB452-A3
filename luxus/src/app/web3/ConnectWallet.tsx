"use client";

import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { stakeholderTypeAtom, walletAddressAtom } from "../atoms/wallet";
import { MINT_ABI, MINT_ADDRESS } from "@/lib/constants";
import { Check, Copy } from "lucide-react";

export default function ConnectWalletButton() {
  const [walletAddress, setWalletAddress] = useAtom(walletAddressAtom);
  const [stakeholderType, setStakeholderType] = useAtom(stakeholderTypeAtom);
  const [isMetamaskAvailable, setIsMetamaskAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMetamaskAvailable(!!window.ethereum);
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      setLoading(false);
    }
  }, []);

  async function getManufacturerAddress() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not available");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(MINT_ADDRESS, MINT_ABI, provider);

    try {
      const manufacturer = await contract.manufacturer();
      console.log("Manufacturer address:", manufacturer);
      return manufacturer;
    } catch (err) {
      console.error("Failed to fetch manufacturer:", err);
      throw err;
    }
  }

  const connectWallet = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      if (isMobile) {
        const dappUrl = encodeURIComponent(window.location.hostname);
        const metamaskDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = metamaskDeepLink;
      } else {
        alert("MetaMask is not installed!");
      }
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setError("Please switch MetaMask to the Sepolia network.");
        return;
      }

      await ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const manufacturerAddress = await getManufacturerAddress();
      switch (true) {
        case address.toLowerCase() === manufacturerAddress.toLowerCase():
          setStakeholderType("manufacturer");
          break;
        default:
          setStakeholderType("consumer");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Wallet connection failed:", error);
      setError(error.message || "Wallet connection failed.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setStakeholderType(null);
  };

  const formatAddress = (addr: string): string => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (loading) {
    return (
      <Button variant={"ghost"} className="px-5 py-5 text-zinc-500 font-normal">
        Checking for MetaMask...
      </Button>
    );
  }

  return (
    <div>
      {!isMetamaskAvailable && !walletAddress && !isMobile ? (
        <p className="mt-2 text-sm text-red-500">Please install MetaMask extension</p>
      ) : (
        <div className="flex items-center">
          {error ? (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          ) : (
            <>
              {walletAddress ? (
                <div className="flex flex-col gap-y-1">
                  <div className="flex flex-col lg:flex-row items-center gap-x-2 gap-y-3">
                    <div className="flex items-center ">
                      <p className="text-sm mr-2 text-green-600">Connected: {formatAddress(walletAddress)}</p>
                      <button onClick={handleCopy} className="p-1 hover:bg-gray-100 rounded transition" aria-label="Copy Wallet Address">
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-x-2">
                      {stakeholderType && (
                        <>
                          <Button
                            variant={"outline"}
                            className={`text-xs uppercase font-bold pointer-events-none ${
                              stakeholderType === "manufacturer" ? "text-red-600 border-red-200" : "text-blue-600 border-blue-200"
                            } `}
                            size={"sm"}
                          >
                            {stakeholderType}
                          </Button>
                        </>
                      )}
                      <Button onClick={disconnectWallet} variant={"destructive"} size="sm" className="text-sm ">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={connectWallet} size={"sm"} className="px-5 py-5 bg-zinc-800 text-white text-sm rounded">
                  Connect Wallet
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
