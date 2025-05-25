"use client";

import { JSX } from "react";
import { useAtomValue } from "jotai";
import { decodedTextAtom, QRCodeScanner } from "@/app/qr/QRCodeScanner";

export default function Verify(): JSX.Element {
  const decodedText = useAtomValue(decodedTextAtom);
  return (
    <div>
      {decodedText ? (
        <div className="flex flex-col items-center justify-center gap-y-4">
          <p className="text-xl">
            <span className="font-bold">2.</span> Use the link below to verify the authenticity
          </p>
          <a href={decodedText} className=" text-blue-500 text-sm hover:underline whitespace-nowrap">
            {decodedText}
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-y-4">
          <p className="text-xl">
            <span className="font-bold">1.</span> Scan your QR code of your luxury item
          </p>
          <div className="w-[400px] h-[300px]">
            <QRCodeScanner />
          </div>
        </div>
      )}
    </div>
  );
}
