"use client";

import Image from 'next/image';
import { DollarSign, Star } from 'lucide-react';

interface Skin {
  id: number;
  name: string;
  image: string;
  value: number;
  wear: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
  rarity: 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert';
}

const loadedSkins: Skin[] = [
  { id: 1, name: 'USP-S | Cyrex', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756921875798-cxoo5h5lqlt.png', value: 15.50, wear: 'Field-Tested', rarity: 'Mil-Spec' },
  { id: 2, name: 'AK-47 | Aquamarine Revenge', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756921999429-jpt5vg9b6d.png', value: 85.00, wear: 'Minimal Wear', rarity: 'Covert' },
  { id: 3, name: 'AK-47 | Asiimov', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922003763-qdi7p34cwth.png', value: 165.20, wear: 'Field-Tested', rarity: 'Covert' },
  { id: 4, name: 'AK-47 | Redline', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922011899-iehsx9m3d3h.png', value: 45.75, wear: 'Minimal Wear', rarity: 'Classified' },
  { id: 5, name: 'AK-47 | Vulcan', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922017602-7y066y6x4m.png', value: 1250.00, wear: 'Factory New', rarity: 'Covert' },
  { id: 6, name: 'AK-47 | Neon Revolution', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1756922021378-23lp3rstkyx.png', value: 92.50, wear: 'Minimal Wear', rarity: 'Covert' }
];

const rarityColors = {
  Consumer: 'from-gray-400 to-gray-500',
  Industrial: 'from-blue-400 to-blue-500',
  'Mil-Spec': 'from-purple-400 to-purple-500',
  Restricted: 'from-pink-400 to-pink-500',
  Classified: 'from-red-400 to-red-500',
  Covert: 'from-yellow-400 to-amber-500',
};

const wearColors = {
  'Factory New': 'text-green-400',
  'Minimal Wear': 'text-lime-400',
  'Field-Tested': 'text-yellow-400',
  'Well-Worn': 'text-orange-400',
  'Battle-Scarred': 'text-red-400',
};

const SkinCard = ({ skin }: { skin: Skin }) => {
  return (
    <button className="flex flex-col w-full text-left relative overflow-hidden bg-slate-900/80 backdrop-blur-sm border border-orange-600/20 rounded-lg cursor-pointer transition-all duration-300 hover:border-orange-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-orange-600/10 py-4 group">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityColors[skin.rarity]} opacity-80`} />
      <div className="px-3 h-[100px] flex items-center justify-center">
        <div className="w-full h-full relative">
          <Image src={skin.image} alt={skin.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain mx-auto group-hover:scale-105 transition-transform duration-300" />
        </div>
      </div>
      <div className="relative flex flex-col px-3 mt-3 mb-2">
        <h3 className="text-orange-100 text-sm font-bold truncate">{skin.name}</h3>
        <span className={`text-xs font-medium ${wearColors[skin.wear]} mt-1`}>{skin.wear}</span>
      </div>
      <div className="px-3 flex justify-between items-center">
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs text-orange-400/80">Market Value</span>
          <span className="text-sm font-bold text-orange-100 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-orange-400" />
            {skin.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-xs text-orange-400/80">Rarity</span>
          <span className="text-sm font-bold text-orange-100 whitespace-nowrap flex items-center gap-1">
            <Star className="w-3 h-3 text-orange-400" />
            {skin.rarity}
          </span>
        </div>
      </div>
    </button>
  );
};

export default function LoadedInventorySidebar() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-orange-100 text-lg font-bold flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        Available Cases
      </h2>
      <div className="flex flex-col gap-4">
        {loadedSkins.map((skin, index) => (
          <div key={skin.id} className="animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
            <SkinCard skin={skin} />
          </div>
        ))}
      </div>
    </div>
  );
}
