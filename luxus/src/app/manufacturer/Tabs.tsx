"use client";

import Mint from "@/app/manufacturer/mint/Mint";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Transfer from "./transfer/Transfer";
import OwnedProducts from "../OwnedProducts";
import Verify from "./verify/Verify";
import Sale from "./sale/Sale";

export default function ManufacturerTabs() {
  return (
    <div className="w-full p-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto mb-6">
          <TabsTrigger value="products">Owned Products</TabsTrigger>
          <TabsTrigger value="mint">Mint Product</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Product</TabsTrigger>
          <TabsTrigger value="verify">Verify Product</TabsTrigger>
          <TabsTrigger value="sell">Sell Product</TabsTrigger>
        </TabsList>

        <TabsContent className="flex items-center justify-center" value="products">
          <OwnedProducts />
        </TabsContent>
        <TabsContent className="flex items-center justify-center" value="mint">
          <Mint />
        </TabsContent>
        <TabsContent className="flex items-center justify-center" value="transfer">
          <Transfer />
        </TabsContent>
        <TabsContent className="flex items-center justify-center" value="verify">
          <Verify />
        </TabsContent>
        <TabsContent className="flex items-center justify-center" value="sell">
          <Sale />
        </TabsContent>
      </Tabs>
    </div>
  );
}
