
import React, { useState, useEffect, useRef } from 'react';
import * as C from '../constants';
import { CharacterParams, Language } from '../types';
import { sfx } from '../services/audioEngine';

interface QuickDesignWizardProps {
  lang: Language;
  params: CharacterParams;
  setParams: React.Dispatch<React.SetStateAction<CharacterParams>>;
  onComplete: () => void;
}

export const QuickDesignWizard: React.FC<QuickDesignWizardProps> = ({ lang, params, setParams, onComplete }) => {
  // We keep track of how many steps are visible
  const [visibleSteps, setVisibleSteps] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map of Steps Configuration
  const stepsConfig = [
    { id: 1, key: 'gender', titleEs: "Selecciona el Género", titleEn: "Select Gender" },
    { id: 2, key: 'race', titleEs: "Selecciona la Raza", titleEn: "Select Race" },
    { id: 3, key: 'skinTone', titleEs: "Tono de Piel", titleEn: "Skin Tone" },
    { id: 4, key: 'classCategory', titleEs: "Categoría de Clase", titleEn: "Class Category" },
    { id: 5, key: 'role', titleEs: "Elige Profesión / Clase", titleEn: "Choose Profession / Class" },
    { id: 6, key: 'secondaryRole', titleEs: "Clase Secundaria (Opcional)", titleEn: "Secondary Class (Optional)" }, // NEW STEP
    { id: 7, key: 'emotion', titleEs: "Carácter / Emoción", titleEn: "Character / Emotion" },
    { id: 8, key: 'style', titleEs: "Estilo Visual", titleEn: "Visual Style" },
    { id: 9, key: 'framing', titleEs: "Encuadre de Cámara", titleEn: "Camera Framing" },
    { id: 10, key: 'setting', titleEs: "Fondo / Entorno", titleEn: "Background / Setting" },
    { id: 11, key: 'aspectRatio', titleEs: "Formato", titleEn: "Format" },
  ];

  // Auto-expand if params are pre-filled (Elite Agent)
  useEffect(() => {
    // Check if the last critical step (aspectRatio) is filled
    if (params.aspectRatio && params.aspectRatio !== '--ar 16:9' && visibleSteps === 1) {
       // Only if it's not default or specifically set (Elite sets it to 9:16)
       // Actually, Elite Agent sets many things. If race, role and setting are set, expand all.
       if (params.race && params.role && params.setting) {
           setVisibleSteps(stepsConfig.length);
       }
    }
  }, [params]);

  const handleSelect = (key: keyof CharacterParams, value: any, stepId: number) => {
    sfx.playClick();
    setParams(prev => ({ ...prev, [key]: value }));
    
    // Reveal next step if not already revealed
    if (stepId === visibleSteps && stepId < stepsConfig.length) {
       setVisibleSteps(prev => prev + 1);
    } 
    
    if (stepId === stepsConfig.length) {
       onComplete();
    }
  };

  // Auto-scroll to bottom when new step is added
  useEffect(() => {
    if (scrollRef.current && visibleSteps > 1) {
        // Scroll slightly down to reveal the new section
        const yOffset = -100; // Offset for fixed header
        const element = scrollRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
  }, [visibleSteps]);

  const StepButton = ({ label, value, active, onClick, color }: any) => (
    <button
      onClick={() => onClick(value)}
      onMouseEnter={() => sfx.playHover()}
      className={`
        relative p-4 md:p-5 rounded-sm border transition-all duration-200 flex flex-col items-center justify-center gap-2 group w-full
        active:scale-95 touch-manipulation
        ${active 
            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-500/50' 
            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 hover:bg-slate-800'
        }
      `}
    >
      {color && (
          <div className="w-8 h-8 rounded-full border border-slate-500 shadow-sm mb-1" style={{ backgroundColor: color }}></div>
      )}
      <span className="text-sm md:text-base font-bold uppercase tracking-widest text-center leading-tight">{label}</span>
      {active && (
         <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_cyan]"></div>
      )}
    </button>
  );

  const renderStepContent = (stepId: number) => {
    // Mobile First approach: grid-cols-1 by default for ease of use, grid-cols-2/3/4 on larger screens
    switch (stepId) {
      case 1: // GENDER
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {C.GENDERS.map(opt => (
              <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.gender === opt.value} onClick={(v: string) => handleSelect('gender', v, 1)} />
            ))}
          </div>
        );
      case 2: // RACE
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {C.RACES.map(opt => (
              <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.race === opt.value} onClick={(v: string) => handleSelect('race', v, 2)} />
            ))}
          </div>
        );
      case 3: // SKIN TONE
        return (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {C.SKIN_TONES.map(opt => (
              <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} color={opt.color} active={params.skinTone === opt.value} onClick={(v: string) => handleSelect('skinTone', v, 3)} />
            ))}
          </div>
        );
      case 4: // CATEGORY
         return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
                 <StepButton label={lang === 'ES' ? "Fantasía / Sci-Fi" : "Fantasy / Sci-Fi"} value="fantasy" active={params.classCategory === 'fantasy'} onClick={(v: any) => handleSelect('classCategory', v, 4)} />
                 <StepButton label={lang === 'ES' ? "Realista / Actual" : "Realistic / Modern"} value="realistic" active={params.classCategory === 'realistic'} onClick={(v: any) => handleSelect('classCategory', v, 4)} />
             </div>
         );
      case 5: // ROLE - Single column on mobile for long names
        const roles = params.classCategory === 'realistic' ? C.ROLES_REALISTIC : C.ROLES_FANTASY;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {roles.map(opt => (
                <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.role === opt.value} onClick={(v: string) => handleSelect('role', v, 5)} />
                ))}
            </div>
        );
      case 6: // SECONDARY ROLE (OPTIONAL)
        const secRoles = params.classCategory === 'realistic' ? C.ROLES_REALISTIC : C.ROLES_FANTASY;
        return (
            <div className="space-y-4">
                <div className="flex justify-center mb-2">
                    <button 
                       onClick={() => handleSelect('secondaryRole', '', 6)} // Skip/None option
                       className={`text-xs text-slate-500 hover:text-cyan-400 uppercase tracking-widest border border-slate-700 hover:border-cyan-500 px-4 py-2 rounded-sm ${params.secondaryRole === '' ? 'border-cyan-500 text-cyan-400' : ''}`}
                    >
                       {lang === 'ES' ? "Saltar / Ninguna" : "Skip / None"}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {secRoles.map(opt => (
                    <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.secondaryRole === opt.value} onClick={(v: string) => handleSelect('secondaryRole', v, 6)} />
                    ))}
                </div>
            </div>
        );
      case 7: // EMOTION
         return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {C.EMOTIONS.map(opt => (
                <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.emotion === opt.value} onClick={(v: string) => handleSelect('emotion', v, 7)} />
                ))}
            </div>
        );
      case 8: // STYLE
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {C.STYLES.map(opt => (
                <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.style === opt.value} onClick={(v: string) => handleSelect('style', v, 8)} />
                ))}
            </div>
        );
      case 9: // FRAMING
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {C.FRAMINGS.map(opt => (
                <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.framing === opt.value} onClick={(v: string) => handleSelect('framing', v, 9)} />
                ))}
            </div>
        );
      case 10: // BACKGROUND
        const bgOptions = [...C.SETTINGS.filter(s => s.value.includes('Contextual') || s.value.includes('White') || s.value.includes('Studio')), ...C.BACKGROUNDS];
        // Unique logic
        const seen = new Set();
        const uniqueBgs = bgOptions.filter(el => {
            const duplicate = seen.has(el.value);
            seen.add(el.value);
            return !duplicate;
        });

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {uniqueBgs.map(opt => (
                <StepButton key={opt.value} label={lang === 'ES' ? opt.es : opt.en} value={opt.value} active={params.setting === opt.value} onClick={(v: string) => handleSelect('setting', v, 10)} />
                ))}
            </div>
        );
      case 11: // ASPECT RATIO
         return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {C.ASPECT_RATIOS.map(opt => (
                <StepButton key={opt.value} label={opt.label} value={opt.value} active={params.aspectRatio === opt.value} onClick={(v: string) => handleSelect('aspectRatio', v, 11)} />
                ))}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col space-y-8 pb-10">
        {stepsConfig.map((step, index) => {
            if (index + 1 > visibleSteps) return null;
            
            const isLast = index + 1 === visibleSteps;
            
            return (
                <div 
                    key={step.id} 
                    ref={isLast ? scrollRef : null}
                    className={`animate-fade-in ${!isLast ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}
                >
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm ${isLast ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-cyan-500'}`}>
                             {step.id}
                         </div>
                         <h2 className={`text-lg md:text-xl font-bold font-brand tracking-widest uppercase ${isLast ? 'text-cyan-400' : 'text-slate-400'}`}>
                             {lang === 'ES' ? step.titleEs : step.titleEn}
                         </h2>
                    </div>
                    
                    {renderStepContent(step.id)}
                </div>
            );
        })}
    </div>
  );
};
