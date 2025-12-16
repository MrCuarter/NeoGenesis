
import React, { useState } from 'react';
import { GeneratedData } from '../types';
import { sfx } from '../services/audioEngine';

interface TerminalOutputProps {
  data: GeneratedData | null;
  loading: boolean;
  format?: 'midjourney' | 'generic';
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ data, loading, format }) => {
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyToClipboard = (text: string, type: 'pos' | 'neg' | 'all') => {
    sfx.playClick();
    navigator.clipboard.writeText(text);
    if (type === 'pos') {
      setCopiedPositive(true);
      setTimeout(() => setCopiedPositive(false), 2000);
    } else if (type === 'neg') {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    
    let fullText = "";
    if (format === 'midjourney') {
        // MJ: Append negative prompt with parameter
        fullText = `${data.prompt} --no ${data.negativePrompt}`;
    } else {
        // Generic: Clear separation for easy manual copy
        fullText = `${data.prompt}\n\nNegative Prompt:\n${data.negativePrompt}`;
    }
    copyToClipboard(fullText, 'all');
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
                  onClick={() => copyToClipboard(data!.prompt, 'pos')}
                  onMouseEnter={() => sfx.playHover()}
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
                  onClick={() => copyToClipboard(data!.negativePrompt, 'neg')}
                  onMouseEnter={() => sfx.playHover()}
                  className="text-xs bg-slate-800 hover:bg-red-900 hover:text-white text-red-400 px-2 py-1 rounded transition-colors uppercase font-mono"
                 >
                   {copiedNegative ? 'Copiado!' : 'Copiar'}
                 </button>
              </div>
              <p className="font-mono text-sm text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                {data!.negativePrompt}
              </p>
            </div>
            
            {/* NEW: COPY ALL BUTTON */}
            <div className="pt-2">
                <button
                    onClick={handleCopyAll}
                    onMouseEnter={() => sfx.playHover()}
                    className="w-full bg-slate-900 border border-slate-600 hover:border-cyan-400 hover:bg-cyan-950 text-slate-300 hover:text-white py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
                >
                    {copiedAll ? (
                        <span className="text-green-400">¡COPIADO AL PORTAPAPELES!</span>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h4.586"></path></svg>
                            COPIAR KIT COMPLETO (POS + NEG)
                        </>
                    )}
                </button>
                <div className="mt-2 text-center">
                    <span className="text-[10px] text-slate-600 font-mono">
                        {format === 'midjourney' ? 'Formato: Prompt --no Negative' : 'Formato: Prompt + Salto de línea + Negative'}
                    </span>
                </div>
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
