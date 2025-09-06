"use client";

import HeaderNavigation from "@/components/sections/header-navigation";
import LoadedInventorySidebar from "@/components/sections/loaded-inventory-sidebar";
import GachaMachineCenter from "@/components/sections/gacha-machine-center";
import PackDetailsPanel from "@/components/sections/pack-details-panel";
import RecentOpeningsPanel from "@/components/sections/recent-openings-panel";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <main className="container mx-auto px-4 pt-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          <div className="lg:col-span-3">
            <LoadedInventorySidebar />
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center">
            <div className="w-full max-w-md">
              <GachaMachineCenter />
            </div>
          </div>
          <div className="lg:col-span-4 xl:col-span-5 space-y-6">
            <PackDetailsPanel />
            <RecentOpeningsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
