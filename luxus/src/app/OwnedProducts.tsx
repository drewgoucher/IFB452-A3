"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { CONTROL_ABI, CONTROL_ADDRESS, MINT_ABI, MINT_ADDRESS, SALE_ABI, SALE_ADDRESS } from "@/lib/constants";
import { useAtomValue } from "jotai";
import { walletAddressAtom } from "./atoms/wallet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { MoonLoader } from "react-spinners";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TokenMetadata {
  brand: string;
  serialNumber: string;
  productType: string;
  material: string;
}

interface Token {
  tokenId: bigint;
  metadata: TokenMetadata;
  qrCode: string;
  verified: boolean;
  currentOwner: string;
  history: string[];
  forSale: boolean;
}

export function TokenCard({ token }: { token: Token }) {
  const [imgLoading, setImgLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  console.log("token : ", token);

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition text-sm">
      <div className="relative w-full h-48 mb-3 flex justify-center">
        <div className="flex w-full h-full items-center justify-center">
          {imgLoading && <MoonLoader className="absolute" color="#000" size={24} />}
          <Image
            src={token.qrCode}
            alt={`QR Code for Token ${token.tokenId}`}
            fill
            style={{ objectFit: "contain" }}
            unoptimized={true}
            priority={false}
            onLoad={() => setImgLoading(false)}
          />
        </div>
      </div>
      {token.forSale ? (
        <div className="ml-auto bg-green-500 w-min whitespace-nowrap no-underline h-min hover:no-underline text-white hover:bg-green-600 py-2 px-3 rounded-lg">
          For Sale
        </div>
      ) : (
        <div className="ml-auto bg-zinc-500 opacity-70 w-min no-underline whitespace-nowrap h-min hover:no-underline text-white hover:bg-zinc-600 py-2 px-3 rounded-lg">
          Not For Sale
        </div>
      )}

      <p>
        <span className="font-medium">Serial Number:</span> {token.metadata.serialNumber}
      </p>
      <p>
        <span className="font-medium">Token ID:</span> {token.tokenId.toString()}
      </p>
      <p>
        <span className="font-medium">Verified:</span> {token.verified ? "Yes" : "No"}
      </p>

      <div className="flex items-center gap-x-4 mt-1">
        <span className="font-medium">Owner:</span>
        <pre className="overflow-x-auto whitespace-nowrap bg-gray-100 rounded p-1 max-h-12">{token.currentOwner}</pre>
      </div>

      <div className="mt-2">
        <label className="font-medium block mb-1" htmlFor={`history-${token.tokenId.toString()}`}>
          History:
        </label>
        <textarea
          id={`history-${token.tokenId.toString()}`}
          readOnly
          value={token.history.map((addr, i) => `${i}: ${addr}`).join("\n")}
          className="w-full max-h-32 resize-y overflow-y-auto rounded border border-gray-300 p-2 text-xs font-mono bg-gray-50"
        />
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          onClick={() => setIsOpen(!isOpen)}
          className="mt-3 flex items-center w-full gap-1 cursor-pointer text-blue-600 hover:underline font-semibold select-none"
        >
          {isOpen ? (
            <>
              Show Metadata <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Metadata <ChevronDown className="w-4 h-4" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1 text-sm">
          <p>
            <span className="font-medium">Brand:</span> {token.metadata.brand}
          </p>
          <p>
            <span className="font-medium">Product Type:</span> {token.metadata.productType}
          </p>
          <p>
            <span className="font-medium">Material:</span> {token.metadata.material}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function OwnedProducts() {
  const walletAddress = useAtomValue(walletAddressAtom);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenIds = async (owner: string) => {
    if (!owner) return;
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) throw new Error("MetaMask is not available");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const controlContract = new ethers.Contract(CONTROL_ADDRESS, CONTROL_ABI, signer);
      const mintContract = new ethers.Contract(MINT_ADDRESS, MINT_ABI, signer);
      const saleContract = new ethers.Contract(SALE_ADDRESS, SALE_ABI, signer);

      const ids: bigint[] = await controlContract.getOwnedTokenIds(owner);

      const tokenData = await Promise.all(
        ids.map(async (id) => {
          const history: string[] = await controlContract.getHistory(id);
          const [tokenId, qrCode, verified, currentOwner] = await controlContract.products(id);

          const [brand, serialNumber, productType, material] = await mintContract.getMetadata(id);

          const forSale: boolean = (await saleContract.sales(id))[2];

          return {
            tokenId,
            metadata: {
              brand,
              serialNumber,
              productType,
              material,
            },
            qrCode,
            verified,
            currentOwner,
            history,
            forSale,
          };
        })
      );

      setTokens(tokenData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch token data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchTokenIds(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div className="">
      {loading && <p className="text-gray-600 text-center">Loading...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
      {!loading && tokens.length === 0 && walletAddress && <p className="text-gray-500 text-center">No owned products found.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <TokenCard key={token.tokenId.toString()} token={token} />
        ))}
      </div>
    </div>
  );
}
