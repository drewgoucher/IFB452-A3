"use client";

import { useAtomValue } from "jotai";
import { Gem } from "lucide-react";
import ConnectWalletButton from "./web3/ConnectWallet";
import { stakeholderTypeAtom } from "./atoms/wallet";
import ManufacturerTabs from "./manufacturer/Tabs";
import ConsumerTabs from "./consumer/Tabs";

export default function Home() {
  const stakeholderType = useAtomValue(stakeholderTypeAtom);

  return (
    <div className="w-full h-full font-[family-name:var(--font-geist-sans)]">
      <div className="w-full h-full flex flex-col gap-x-10 ">
        <div className="flex flex-col gap-y-3 md:flex-row items-center justify-between border-b md:px-8 px-6 py-6">
          <div className="flex items-center gap-x-2">
            <Gem className="w-7 h-7 text-zinc-900" />
            <h1 className="text-[1.7rem] font-semibold  tracking-tight ">luxus</h1>
            <p className="text-lg font-normal tracking-tight ">v1.2</p>
          </div>
          <ConnectWalletButton />
        </div>
        <>
          {stakeholderType === "manufacturer" ? (
            <ManufacturerTabs />
          ) : stakeholderType === "consumer" ? (
            <ConsumerTabs />
          ) : (
            <div className="flex justify-center h-full my-8">
              <p className="text-lg text-zinc-600">Please connect your wallet to continue</p>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
