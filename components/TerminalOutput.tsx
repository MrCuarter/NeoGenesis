import React, { useState } from 'react';
import { GeneratedData } from '../types';

interface TerminalOutputProps {
  data: GeneratedData | null;
  loading: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ data, loading }) => {
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const copyToClipboard = (text: string, isPositive: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPositive) {
      setCopiedPositive(true);
      setTimeout(() => setCopiedPositive(false), 2000);
    } else {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    }
  };

  if (!data && !loading) return null;

  return (
    <div className="w-full mt-8 relative">
      <div className="absolute -top-3 left-4 bg-[#050505] px-2 text-cyan-500 text-sm font-bold tracking-widest border border-cyan-900 z-10">
        TERMINAL DE SALIDA
      </div>
      
      <div className="border border-cyan-900 bg-slate-950/90 rounded-sm p-1 relative overflow-hidden min-h-[200px] flex flex-col shadow-2xl shadow-cyan-900/20">
        
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 pointer-events-none animate-scanline z-0"></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-4 z-10">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-cyan-400 font-mono text-sm animate-pulse">PROCESANDO DATOS NEURALES...</p>
            <div className="w-64 h-1 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-cyan-500 animate-progress"></div>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col space-y-6 z-10">
            
            {/* Positive Prompt */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                 <span className="text-green-400 font-mono text-xs font-bold">&gt;&gt; PROMPT PRINCIPAL</span>
                 <button 
                  onClick={() => copyToClipboard(data!.prompt, true)}
                  className="text-xs bg-slate-800 hover:bg-cyan-700 hover:text-white text-cyan-400 px-2 py-1 rounded transition-colors uppercase font-mono"
                 >
                   {copiedPositive ? 'Copiado!' : 'Copiar'}
                 </button>
              </div>
              <p className="font-mono text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                {data!.prompt}
              </p>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                 <span className="text-red-400 font-mono text-xs font-bold">&gt;&gt; NEGATIVE PROMPT</span>
                 <button 
                  onClick={() => copyToClipboard(data!.negativePrompt, false)}
                  className="text-xs bg-slate-800 hover:bg-red-900 hover:text-white text-red-400 px-2 py-1 rounded transition-colors uppercase font-mono"
                 >
                   {copiedNegative ? 'Copiado!' : 'Copiar'}
                 </button>
              </div>
              <p className="font-mono text-sm text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                {data!.negativePrompt}
              </p>
            </div>
            
            <div className="pt-4 text-xs text-slate-600 font-mono text-center">
               // SISTEMA LISTO PARA TRANSFERENCIA //
            </div>
          </div>
        )}
      </div>
    </div>
  );
};