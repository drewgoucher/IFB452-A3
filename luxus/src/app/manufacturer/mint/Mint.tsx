"use client";

import { useState, ChangeEvent, JSX, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PulseLoader } from "react-spinners";
import { mintProduct, registerProduct, verifyProduct } from "./functions";

import QRCodeStyling from "qr-code-styling";
import { Download } from "lucide-react";
import { uploadQRCodeToIPFS } from "@/app/manufacturer/mint/upload";
import { createQRCodeInstance } from "@/app/manufacturer/mint/generator";
import { ethers } from "ethers";

export const randomString = "-7c7cb38581816ea79587d1481aca067958f0eb3e643c78e881fa428d9a8aed7a";

interface ProductForm {
  brand: string;
  serialNumber: string;
  productType: string;
  material: string;
}

export default function Mint(): JSX.Element {
  const [form, setForm] = useState<ProductForm>({
    brand: "",
    serialNumber: "",
    productType: "",
    material: "",
  });

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null); // no need for `| null` in logic
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    qrCodeRef.current?.download({
      extension: "png",
      name: "qr-code",
    });
  };

  async function mintNFT(
    form: ProductForm,
    setStatus: (s: string | null) => void,
    setError: (e: string | null) => void,
    setTx: (tx: string | null) => void
  ): Promise<void> {
    const { brand, serialNumber, productType, material } = form;

    if (!brand || !serialNumber || !productType || !material) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Connecting to wallet...");
      setError(null);

      if (ref.current) {
        ref.current.innerHTML = "";
      }

      setTx(null);

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const { tokenId } = await mintProduct(form, signer, setStatus);

      setStatus("Generating QR code...");

      if (ref.current) {
        const qrCode = createQRCodeInstance(tokenId.toString() + randomString);
        qrCode.append(ref.current);
        qrCodeRef.current = qrCode;
      }

      setStatus("Uploading QR code to IPFS...");
      let url: string = "";
      try {
        setUploading(true);
        url = await uploadQRCodeToIPFS(qrCodeRef.current!);

        if (!url) {
          throw new Error("IPFS upload returned an empty URL");
        }

        setIpfsUrl(url);
      } catch (err) {
        console.error("IPFS upload failed:", err);
      } finally {
        setUploading(false);
      }

      if (!url) {
        throw new Error("Failed to upload QR code to IPFS");
      }

      const registerProductTx = await registerProduct(tokenId, signer, url, setStatus);

      await verifyProduct(tokenId, signer, setStatus);

      setStatus("✅ Product minted and registered successfully!");
      setTx(registerProductTx);
    } catch (err) {
      const error = err as { code?: string; message: string };
      const code = error.code;

      if (code === "ACTION_REJECTED") {
        setError("❌ You cancelled the transaction.");
      }

      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-xl items-center shadow flex flex-col w-full max-w-3xl">
      <div className="space-y-2 w-full">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. AcmeCo" />

        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="e.g. SN-123456" />

        <Label htmlFor="productType">Product Type</Label>
        <Input id="productType" name="productType" value={form.productType} onChange={handleChange} placeholder="e.g. Smartwatch" />

        <Label htmlFor="material">Material</Label>
        <Input id="material" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Titanium" />
      </div>

      <Button onClick={() => mintNFT(form, setStatus, setError, setTx)} className="bg-blue-600 text-white w-full">
        Mint Product
      </Button>

      <div className="flex justify-center w-full">
        {status && loading ? (
          <div className="text-sm text-green-600 flex flex-col gap-y-4 mt-2 items-center break-words whitespace-pre-wrap">
            <PulseLoader size={6} color="#16a34a" />
            <pre className="ml-2">{status}</pre>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full overflow-hidden justify-center gap-y-2">
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

      <div className="flex items-center justify-center mt-4">
        <div className="flex flex-col items-center space-y-3">
          <div ref={ref} style={{ width: 280, height: 280 }} className={tx ? "" : "invisible absolute"} />
          {tx && (
            <>
              <button onClick={handleDownload} className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">
                <Download className="inline mr-2" size={16} />
                Download QR Code
              </button>
              {uploading && <p className="text-gray-500 text-sm">Uploading to IPFS...</p>}
              {ipfsUrl && (
                <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                  View on IPFS
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
