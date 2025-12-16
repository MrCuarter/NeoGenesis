import React from 'react';
import { sfx } from '../services/audioEngine'; // Import SFX

interface Option {
  label: string;
  value: string;
}

interface FuturisticSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  onHelp?: () => void; // New Prop
}

export const FuturisticSelect: React.FC<FuturisticSelectProps> = ({ label, value, onChange, options, onHelp }) => {
  return (
    <div 
      className="flex flex-col space-y-2 group"
      onMouseEnter={() => {
        if (onHelp) onHelp();
      }}
    >
      <label className="text-cyan-400 text-xs uppercase tracking-widest font-semibold ml-1 group-hover:text-cyan-300 transition-colors cursor-help">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
             onChange(e.target.value);
             sfx.playClick();
          }}
          onMouseEnter={() => sfx.playHover()}
          className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 p-3 pr-8 rounded-sm focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] appearance-none transition-all duration-300"
        >
          <option value="">-- {label} --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
};