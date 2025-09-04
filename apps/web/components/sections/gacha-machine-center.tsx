"use client";

import { useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const cases = [
  { id: 'operation', label: 'OPERATION', tooltip: 'Operation Bravo Case - Premium drops', isGrayscale: false, price: '$2.50' },
  { id: 'spectrum', label: 'SPECTRUM', tooltip: 'Spectrum Case - High-tier skins', isGrayscale: true, price: '$1.20' }
];

export default function GachaMachineCenter() {
  const [selectedCase, setSelectedCase] = useState('operation');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full pt-8 lg:justify-center lg:pt-0">
      <div className="relative w-full max-w-[400px] md:max-w-[320px] lg:max-w-[400px] xl:max-w-[450px]">
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-8 shadow-2xl border border-orange-600/20">
          <div className="bg-black/60 rounded-xl p-6 mb-6 border border-orange-500/30">
            <div className={`w-full h-48 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border-2 border-dashed border-orange-500/40 flex items-center justify-center transition-all duration-500 ${isSpinning ? 'animate-pulse border-orange-400' : ''}`}>
              {isSpinning ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-orange-400 font-bold text-sm">OPENING CASE...</span>
                </div>
              ) : (
                <div className="text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                  <span className="text-orange-300 font-semibold text-sm">READY TO OPEN</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleSpin} disabled={isSpinning} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-600/25 mb-4">
            {isSpinning ? 'OPENING...' : 'OPEN CASE'}
          </button>
        </div>

        <div className="absolute top-[20px] -right-8 flex flex-col gap-3">
          <TooltipProvider>
            {cases.map(c => (
              <Tooltip key={c.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <button onClick={() => setSelectedCase(c.id)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 bg-slate-800/90 backdrop-blur-sm ${selectedCase === c.id ? 'border-orange-500 shadow-lg shadow-orange-500/25' : 'border-slate-600/50 hover:border-orange-400/60'}`}>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-2">
                      <div className={`w-full h-full bg-gradient-to-br ${c.id === 'operation' ? 'from-orange-400 to-red-500' : 'from-blue-400 to-purple-500'} rounded opacity-80 ${c.isGrayscale ? 'grayscale' : ''}`} />
                    </div>
                    <span className="text-xs font-bold text-orange-100 tracking-wider">{c.label}</span>
                    <span className="text-xs text-orange-400 font-semibold">{c.price}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-slate-800 border-orange-600/30 text-orange-100">
                  <p>{c.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-orange-600/20">
        <ShieldCheck className="w-5 h-5 text-green-400" />
        <span className="text-sm font-medium text-orange-100">Guaranteed Authentic Skins</span>
      </div>
    </div>
  );
}
