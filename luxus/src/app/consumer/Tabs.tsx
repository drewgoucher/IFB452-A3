"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OwnedProducts from "../OwnedProducts";
import Transfer from "../manufacturer/transfer/Transfer";
import Verify from "../manufacturer/verify/Verify";
import Sale from "../manufacturer/sale/Sale";

export default function ConsumerTabs() {
  return (
    <div className="w-full p-6 my-10 xl:my-0">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="flex flex-col xl:grid xl:grid-cols-4 gap-2 w-full max-w-2xl mx-auto mb-6">
          <TabsTrigger value="products">Owned Products</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Product</TabsTrigger>
          <TabsTrigger value="verify">Verify Product</TabsTrigger>
          <TabsTrigger value="sell">Sell Product</TabsTrigger>
        </TabsList>

        <TabsContent className="flex items-center justify-center" value="products">
          <OwnedProducts />
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
