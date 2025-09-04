"use client";

import * as React from "react";
import { Info, Target, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PackDetailsPanel() {
  return (
    <div className="sticky top-[95px] flex h-fit flex-col gap-4 rounded-lg border border-orange-600/20 bg-slate-900/90 backdrop-blur-sm p-6 text-orange-100 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold leading-tight text-white">Operation Bravo Case</h3>
          <p className="text-sm text-orange-300 mt-1">Premium CS2 Weapon Case</p>
        </div>
        <div className="text-right">
          <h4 className="text-2xl font-bold text-orange-400 flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            2.50
          </h4>
          <p className="text-xs text-orange-300">Market Price</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button size="lg" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 py-6 text-base font-bold text-white shadow-lg hover:shadow-orange-600/25 transition-all duration-300">
          Sign In to Open Case
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-orange-200">Fast Open</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="Fast open mode info">
                    <Info className="h-4 w-4 text-orange-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-orange-600/30 text-orange-100">
                  <p>Skip opening animation for faster results.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch id="turbo-mode" />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 rounded-md border border-orange-600/20 bg-slate-800/60 p-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgb(71 85 105)" strokeWidth="4" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgb(251 146 60)" strokeWidth="4" strokeDasharray="0, 100" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-orange-400">0</div>
        </div>
        <div>
          <p className="font-semibold text-white">Free cases remaining</p>
          <p className="text-sm text-orange-300">0 points until next free case</p>
        </div>
      </div>

      <Button size="lg" className="w-full border border-orange-600 bg-slate-800/80 py-6 text-base font-bold text-orange-200 hover:bg-slate-700/80 hover:text-orange-100 transition-all duration-300">
        Connect Steam Wallet
      </Button>

      <div className="grid grid-cols-3 gap-4 border-t border-orange-600/20 pt-4 text-center">
        <div>
          <h5 className="text-lg font-bold text-white flex items-center justify-center gap-1">
            <Target className="w-4 h-4 text-orange-400" />
            1 Skin
          </h5>
          <p className="text-xs text-orange-300">Per case</p>
        </div>
        <div>
          <h5 className="text-lg font-bold text-white">90% of value</h5>
          <p className="text-xs text-orange-300">Instant sellback</p>
        </div>
        <div>
          <h5 className="text-lg font-bold text-white">15%</h5>
          <p className="text-xs text-orange-300">Rare+ chance</p>
        </div>
      </div>

      <div className="space-y-3 border-t border-orange-600/20 pt-4">
        <h5 className="font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          Drop Rates:
        </h5>
        <ul className="space-y-2 text-sm text-orange-200">
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" />Consumer Grade (79.92%)</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-400" />Industrial Grade (15.98%)</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-400" />Mil-Spec (3.20%)</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400" />Restricted (0.64%)</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-400" />Classified (0.26%)</li>
        </ul>
      </div>

      <p className="text-xs text-orange-400/80">Market data from Steam Community Market and third-party trading platforms. Prices may vary.</p>
    </div>
  );
}
