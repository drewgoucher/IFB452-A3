"use client";

import { JSX, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { decodedTextAtom, QRCodeScanner } from "@/app/qr/QRCodeScanner";
import { ethers } from "ethers";
import { CONTROL_ABI, CONTROL_ADDRESS, MINT_ABI, MINT_ADDRESS, SALE_ABI, SALE_ADDRESS } from "@/lib/constants";
import { MoonLoader } from "react-spinners";
import { TokenCard } from "@/app/OwnedProducts";

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

export default function Verify(): JSX.Element {
  const decodedText = useAtomValue(decodedTextAtom);
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async (tokenIdStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokenId = BigInt(tokenIdStr);
      if (!window.ethereum) throw new Error("MetaMask is not available");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const controlContract = new ethers.Contract(CONTROL_ADDRESS, CONTROL_ABI, signer);
      const mintContract = new ethers.Contract(MINT_ADDRESS, MINT_ABI, signer);
      const saleContract = new ethers.Contract(SALE_ADDRESS, SALE_ABI, signer);

      const history: string[] = await controlContract.getHistory(tokenId);
      const [tokenID, qrCode, verified, currentOwner] = await controlContract.products(tokenId);
      const [brand, serialNumber, productType, material] = await mintContract.getMetadata(tokenID);
      const forSale: boolean = (await saleContract.sales(tokenId))[2];

      setToken({
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
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch token data. Check the QR code or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decodedText) {
      fetchToken(decodedText.split("-")[0]);
    }
  }, [decodedText]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      {!decodedText && (
        <>
          <p className="text-xl">
            <span className="font-bold">1.</span> Scan your QR code of your luxury item
          </p>
          <div className="w-[400px] h-[300px]">
            <QRCodeScanner />
          </div>
        </>
      )}

      {decodedText && (
        <>
          {loading && <MoonLoader color="#000" size={24} />}
          {error && <p className="text-red-600">{error}</p>}
          {token && (
            <div className="mt-6 w-full max-w-xl">
              <TokenCard token={token} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
