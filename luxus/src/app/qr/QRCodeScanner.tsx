"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { atom, useSetAtom } from "jotai";

export const decodedTextAtom = atom<string | null>(null);

export const QRCodeScanner: React.FC = () => {
  const setDecodedText = useSetAtom(decodedTextAtom);

  const [isReady, setIsReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = useRef("reader");
  const cameraStartedRef = useRef(false);

  const startScanner = useCallback(async () => {
    if (cameraStartedRef.current || !isReady) return;

    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("devices:", devices);
      if (!devices.length) {
        console.error("No cameras found");
        return;
      }

      const backCamera = devices.find((device) => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("environment"));

      const selectedCameraId = backCamera?.id || devices[0].id;

      const html5QrCode = new Html5Qrcode(readerId.current);
      scannerRef.current = html5QrCode;
      cameraStartedRef.current = true;

      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (text) => {
          console.log("QR Code matched:", text);
          setDecodedText(text);

          await html5QrCode.stop();
          await html5QrCode.clear();

          scannerRef.current = null;
          cameraStartedRef.current = false;
        },
        () => {}
      );
    } catch (err) {
      console.error("Error initializing scanner:", err);
      cameraStartedRef.current = false;
    }
  }, [isReady, setDecodedText]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      startScanner();
    }

    return () => {
      cameraStartedRef.current = false;

      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, [isReady, startScanner]);

  return (
    <div id={readerId.current} className="w-full h-full object-cover" style={{ width: "100%", height: "100%", maxWidth: 400, maxHeight: 300 }} />
  );
};
