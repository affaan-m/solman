"use client";

import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, TrendingUp } from "lucide-react";

type Opening = {
  id: number;
  skinName: string;
  skinImage: string;
  userName: string;
  timeAgo: string;
  value: number;
  rarity: 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert';
};

const recentOpenings: Opening[] = [
  { id: 1, skinName: "AK-47 | Neon Revolution", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922021378-23lp3rstkyx.png", userName: "SteamUser_7S...TER", timeAgo: "2 minutes ago", value: 92.50, rarity: 'Covert' },
  { id: 2, skinName: "AK-47 | Asiimov", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922003763-qdi7p34cwth.png", userName: "ProGamer...H4H", timeAgo: "5 minutes ago", value: 165.20, rarity: 'Covert' },
  { id: 3, skinName: "AK-47 | Vulcan", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922017602-7y066y6x4m.png", userName: "CaseOpener...bou", timeAgo: "8 minutes ago", value: 1250.00, rarity: 'Covert' },
  { id: 4, skinName: "AK-47 | Case Hardened", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922025308-pe06lhc3mdl.png", userName: "BlueGem...vjl", timeAgo: "12 minutes ago", value: 450.00, rarity: 'Classified' },
  { id: 5, skinName: "AK-47 | Jaguar", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922029037-28ciiznk17y.png", userName: "JaguarHunter...Guy", timeAgo: "15 minutes ago", value: 88.75, rarity: 'Restricted' },
  { id: 6, skinName: "AK-47 | Case Hardened", skinImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922035958-m9rge0wy6fo.png", userName: "BluePattern...Pro", timeAgo: "18 minutes ago", value: 1850.00, rarity: 'Covert' }
];

const rarityColors: Record<Opening['rarity'], string> = {
  Consumer: 'bg-gray-500',
  Industrial: 'bg-blue-500',
  'Mil-Spec': 'bg-purple-500',
  Restricted: 'bg-pink-500',
  Classified: 'bg-red-500',
  Covert: 'bg-yellow-500',
};

export default function RecentOpeningsPanel() {
  return (
    <div className="rounded-lg border border-orange-600/20 bg-slate-900/90 backdrop-blur-sm p-4 shadow-xl">
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-0 [&>svg]:hidden">
            <div className="flex w-full items-center justify-between">
              <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Recent Case Openings
              </h3>
              <Minus className="h-4 w-4 text-orange-400" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 px-0 pb-0">
            <div className="flex flex-col gap-4">
              {recentOpenings.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-orange-600/10 hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-12 h-8 flex-shrink-0 bg-slate-700/50 rounded p-1">
                    <Image src={item.skinImage} alt={item.skinName} width={48} height={32} className="rounded-sm object-contain w-full h-full" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-bold text-orange-100 truncate text-xs">{item.skinName}</p>
                    <p className="text-xs text-orange-300">Opened by <span className="text-orange-200 font-medium truncate">{item.userName}</span></p>
                  </div>
                  <div className="ml-2 flex flex-col items-end text-right flex-shrink-0">
                    <p className="text-xs text-orange-400">{item.timeAgo}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={cn('h-1.5 w-1.5 rounded-full', rarityColors[item.rarity])} />
                      <span className="font-bold text-orange-100 text-xs">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-200 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300">
              View All Big Wins
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
