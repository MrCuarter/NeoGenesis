import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { sfx } from '../services/audioEngine';

interface AssistantHudProps {
  isActive: boolean;
  message: string;
  onClose: () => void;
}

export const AssistantHud: React.FC<AssistantHudProps> = ({ isActive, message, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');

  // Efecto de máquina de escribir para el texto
  useEffect(() => {
    if (!message) return;
    
    // Reiniciamos inmediatamente para evitar flash del texto anterior
    setDisplayedText('');
    
    let i = 0;
    const speed = 20; // velocidad de escritura en ms
    
    const interval = setInterval(() => {
      // Incrementamos índice
      i++;
      
      // Usamos slice sobre el mensaje original. 
      // Esto es más robusto que concatenar (prev + char) porque no depende 
      // del ciclo de renderizado de React para saber qué mostrar.
      // slice(0, 1) devuelve el primer caracter.
      setDisplayedText(message.slice(0, i));

      // Sonido de tipeo (cada 3 caracteres para no saturar)
      if (i % 3 === 0) sfx.playTyping(); 

      // Detener al llegar al final
      if (i >= message.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[90%] md:w-[400px] flex items-end gap-2 animate-slide-up pointer-events-none">
      
      {/* Panel de Texto */}
      <div className="bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md p-4 rounded-tl-xl rounded-tr-xl rounded-bl-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex-1 relative overflow-hidden min-h-[100px] flex flex-col pointer-events-auto">
        
        {/* Header del Asistente */}
        <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2 mb-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                N.E.O. SYSTEM LINK
            </span>
            <button 
                onClick={onClose}
                className="text-cyan-700 hover:text-cyan-400 text-xs font-bold uppercase transition-colors"
            >
                [ DESACTIVAR ]
            </button>
        </div>

        {/* Contenido */}
        <p className="font-mono text-xs md:text-sm text-cyan-100 leading-relaxed drop-shadow-md">
            {displayedText}
            <span className="animate-pulse text-cyan-500">_</span>
        </p>

        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </div>

      {/* Avatar (Logo Mini) */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 border border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0 relative overflow-hidden pointer-events-auto">
          <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
          <Logo className="w-10 h-10 md:w-12 md:h-12 animate-spin-slow" />
      </div>
    </div>
  );
};