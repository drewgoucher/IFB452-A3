import { pinata } from "@/utils/config";
import QRCodeStyling from "qr-code-styling";

export async function uploadQRCodeToIPFS(qrCode: QRCodeStyling): Promise<string> {
  const blob = await qrCode.getRawData("png");
  if (!blob) throw new Error("Failed to generate QR code blob");

  const file = new File([blob], "qr-code.png", { type: "image/png" });

  const urlRequest = await fetch("/api/url");
  if (!urlRequest.ok) throw new Error("Failed to fetch upload URL");
  const { url } = await urlRequest.json();

  const upload = await pinata.upload.public.file(file).url(url);

  const fileUrl = await pinata.gateways.public.convert(upload.cid);

  return fileUrl;
}
