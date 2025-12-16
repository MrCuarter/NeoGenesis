
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FuturisticSelect } from './components/FuturisticSelect';
import { FuturisticInput } from './components/FuturisticInput';
import { FuturisticToggle } from './components/FuturisticToggle';
import { ColorPicker } from './components/ColorPicker';
import { TerminalOutput } from './components/TerminalOutput';
import { QuickDesignWizard } from './components/QuickDesignWizard';
import { Logo } from './components/Logo';
import { AssistantHud } from './components/AssistantHud';
import { HistorySidebar } from './components/HistorySidebar'; // New component
import { generatePrompt, generateExpressionSheet, generateInventoryPrompt } from './services/geminiService'; // Added generateInventoryPrompt
import { buildLocalPrompt } from './services/promptBuilder'; 
import { CharacterParams, GeneratedData, LoadingState, Language, ExpressionEntry } from './types';
import * as C from './constants';
import { sfx } from './services/audioEngine';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ES');
  const [isMuted, setIsMuted] = useState(false); 
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [crtMode, setCrtMode] = useState(true); // Default to on for "wow" factor
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GeneratedData[]>([]);
  
  const [assistantMessage, setAssistantMessage] = useState("Sistemas en línea. Esperando input...");
  
  const [params, setParams] = useState<CharacterParams>({
    mode: 'image',
    promptFormat: 'generic', 
    designMode: 'quick', 
    race: '',
    gender: '',
    age: '',
    skinTone: '',
    classCategory: 'fantasy',
    role: '',
    subRole: '',
    bodyType: '',
    style: '',
    setting: '',
    background: '',
    emotion: '',
    pose: '',
    action: '',
    framing: '',
    lighting: '',
    atmosphere: '',
    colors: [],
    details: '',
    aspectRatio: '--ar 16:9',
  });

  const [livePrompt, setLivePrompt] = useState<string>('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [expressionSheet, setExpressionSheet] = useState<ExpressionEntry[] | null>(null);
  const [inventoryData, setInventoryData] = useState<GeneratedData | null>(null); // New State for Inventory
  const [copiedInventory, setCopiedInventory] = useState(false); // New Copied State

  const [copiedMatrixIndex, setCopiedMatrixIndex] = useState<number | null>(null);
  const [copiedAllExpressions, setCopiedAllExpressions] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('neo_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Corrupt history data");
      }
    }
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
       sfx.playStartup();
       window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    const prompt = buildLocalPrompt(params);
    setLivePrompt(prompt);
  }, [params]);

  const toggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
    if (!muted) sfx.playClick();
  };

  const toggleCrt = () => {
    setCrtMode(!crtMode);
    sfx.playClick();
  };

  const toggleTutorial = () => {
    const newState = !isTutorialMode;
    setIsTutorialMode(newState);
    sfx.playClick();
    if (newState) {
        setAssistantMessage(lang === 'ES' 
            ? "Protocolo N.E.O. activado. Pasa el cursor sobre cualquier elemento de la interfaz para recibir análisis táctico en tiempo real." 
            : "N.E.O. Protocol initialized. Hover over any interface element to receive real-time tactical analysis.");
    }
  };

  const addToHistory = (data: GeneratedData) => {
    const newItem = { ...data, timestamp: Date.now(), modelParams: params };
    const newHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('neo_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('neo_history');
  };

  const help = (textEs: string, textEn: string) => {
    if (isTutorialMode) {
        setAssistantMessage(lang === 'ES' ? textEs : textEn);
    }
  };

  const handleCopyLive = () => {
    sfx.playClick();
    navigator.clipboard.writeText(livePrompt);
    setCopiedLive(true);
    setTimeout(() => setCopiedLive(false), 2000);
  };

  // --- GENERATION HANDLERS ---

  const validateParams = () => {
     if (!params.race && !params.role && !params.details) {
      setErrorMsg(t.errorRequired);
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
    return true;
  };

  const handleGenerateExpressions = async () => {
     sfx.playClick();
     if (!validateParams()) return;

    setLoadingState(LoadingState.LOADING);
    setGeneratedData(null);
    setExpressionSheet(null);
    setInventoryData(null); // Clear inventory
    setErrorMsg(null);

    try {
        const sheet = await generateExpressionSheet(params);
        setExpressionSheet(sheet);
        setLoadingState(LoadingState.SUCCESS);
        sfx.playSuccess(); 
        setTimeout(() => document.getElementById('expression-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
        console.error(error);
        setErrorMsg(lang === 'ES' ? "Error generando protocolo Psyche (Revisa API KEY)." : "Error generating Psyche protocol (Check API KEY).");
        setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerateInventory = async () => {
    sfx.playClick();
    if (!validateParams()) return;

    setLoadingState(LoadingState.LOADING);
    // Note: We don't necessarily clear the other data (generatedData/expressionSheet) 
    // because the user might want to see the character AND the inventory together.
    // But for layout cleanliness, we might clear or just append. Let's clear to avoid scroll jumping madness.
    setInventoryData(null);
    setErrorMsg(null);

    try {
        const result = await generateInventoryPrompt(params);
        setInventoryData(result);
        setLoadingState(LoadingState.SUCCESS);
        sfx.playSuccess();
        setTimeout(() => document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
         console.error(error);
         setErrorMsg(lang === 'ES' ? "Error generando Inventario." : "Error generating Inventory.");
         setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerate = async () => {
    sfx.playClick();
    if (!validateParams()) return;
    
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setGeneratedData(null);
    setExpressionSheet(null);
    setInventoryData(null);

    try {
      const result = await generatePrompt(params);
      setGeneratedData(result);
      addToHistory(result); // Auto-save
      setLoadingState(LoadingState.SUCCESS);
      sfx.playSuccess(); 
    } catch (error) {
      console.error(error);
      setErrorMsg(t.errorApi);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // --- COPY HANDLERS ---

  const handleCopyMatrixItem = (text: string, index: number) => {
    sfx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedMatrixIndex(index);
    setTimeout(() => setCopiedMatrixIndex(null), 1500);
  };

  const handleCopyInventory = () => {
      if (!inventoryData) return;
      sfx.playClick();
      navigator.clipboard.writeText(inventoryData.prompt);
      setCopiedInventory(true);
      setTimeout(() => setCopiedInventory(false), 2000);
  };

  const handleCopyAllExpressions = () => {
    sfx.playClick();
    if (!expressionSheet) return;
    const isMJ = params.promptFormat === 'midjourney';
    let intro = "";
    if (isMJ) {
       intro = lang === 'ES'
        ? "Aquí tienes una lista de 5 prompts para Midjourney (incluyendo Insignia y Victoria). Por favor, preséntamelos en bloques de código separados para que pueda copiarlos y pegarlos en Discord fácilmente:\n\n"
        : "Here is a list of 5 Midjourney prompts (including Token and Victory). Please display them in separate code blocks so I can easily copy and paste them into Discord:\n\n";
    } else {
       intro = lang === 'ES'
        ? "Actúa como un generador de imágenes experto. Necesito crear un Kit de Diseño de Personaje completo (Incluyendo Token). Por favor, genera las siguientes 5 imágenes secuencialmente (una tras otra) utilizando exactamente las descripciones provistas a continuación. Mantén la consistencia visual estricta:\n\n"
        : "Act as an expert image generator. I need to create a full Character Design Kit (Including Token). Please generate the following 5 images sequentially (one after another) using exactly the descriptions provided below. Maintain strict visual consistency:\n\n";
    }
    const body = expressionSheet.map((item, i) => 
        `👇 IMAGEN ${i + 1}: [${item.label}]\n${item.prompt}`
    ).join("\n\n" + "-".repeat(40) + "\n\n");
    const fullPayload = intro + body;
    navigator.clipboard.writeText(fullPayload);
    setCopiedAllExpressions(true);
    setTimeout(() => setCopiedAllExpressions(false), 2000);
  };
  
  // ELITE PRESET (Coherent)
  const handleElitePreset = () => {
    sfx.playClick();
    const randomPreset = C.PRESETS[Math.floor(Math.random() * C.PRESETS.length)];
    setParams(prev => ({
        ...prev,
        ...randomPreset.params as any,
        designMode: 'advanced' // Switch to advanced to see the details
    }));
    help(
        "Agente Élite desplegado. Se han cargado parámetros predefinidos de alta calidad visual.",
        "Elite Agent deployed. High-quality visual presets have been loaded."
    );
  };

  // GENOME EXPERIMENT (Random)
  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)].value;
  const handleRandomize = () => {
    sfx.playClick();
    const isVideo = Math.random() > 0.5;
    const isFantasy = Math.random() > 0.4;
    setParams(prev => ({
      ...prev,
      designMode: 'advanced',
      mode: isVideo ? 'video' : 'image',
      classCategory: isFantasy ? 'fantasy' : 'realistic',
      race: getRandom(C.RACES),
      gender: getRandom(C.GENDERS),
      age: getRandom(C.AGES),
      skinTone: getRandom(C.SKIN_TONES),
      role: isFantasy ? getRandom(C.ROLES_FANTASY) : getRandom(C.ROLES_REALISTIC),
      subRole: '',
      bodyType: getRandom(C.BODY_TYPES),
      style: getRandom(C.STYLES),
      setting: getRandom(C.SETTINGS),
      background: Math.random() > 0.8 ? getRandom(C.BACKGROUNDS) : '',
      emotion: getRandom(C.EMOTIONS),
      pose: isVideo ? '' : getRandom(C.POSES_IMAGE),
      action: isVideo ? getRandom(C.ACTIONS_VIDEO) : '',
      framing: getRandom(C.FRAMINGS),
      lighting: getRandom(C.LIGHTINGS),
      atmosphere: getRandom(C.ATMOSPHERES),
      aspectRatio: getRandom(C.ASPECT_RATIOS),
    }));
    help(
        "Experimento Genoma completado. Mutación aleatoria exitosa.",
        "Genome Experiment completed. Random mutation successful."
    );
  };

  // SECTION RANDOMIZERS
  const randomizeSection = (section: 'identity' | 'visuals' | 'tech') => {
      sfx.playClick();
      setParams(prev => {
          const updates: any = {};
          if (section === 'identity') {
              updates.race = getRandom(C.RACES);
              updates.gender = getRandom(C.GENDERS);
              updates.age = getRandom(C.AGES);
              updates.skinTone = getRandom(C.SKIN_TONES);
              updates.bodyType = getRandom(C.BODY_TYPES);
              const isFantasy = Math.random() > 0.4;
              updates.classCategory = isFantasy ? 'fantasy' : 'realistic';
              updates.role = isFantasy ? getRandom(C.ROLES_FANTASY) : getRandom(C.ROLES_REALISTIC);
          } else if (section === 'visuals') {
              updates.emotion = getRandom(C.EMOTIONS);
              updates.style = getRandom(C.STYLES);
              if (prev.mode === 'video') updates.action = getRandom(C.ACTIONS_VIDEO);
              else updates.pose = getRandom(C.POSES_IMAGE);
          } else if (section === 'tech') {
              updates.framing = getRandom(C.FRAMINGS);
              updates.lighting = getRandom(C.LIGHTINGS);
              updates.atmosphere = getRandom(C.ATMOSPHERES);
              updates.setting = getRandom(C.SETTINGS);
              updates.background = Math.random() > 0.7 ? getRandom(C.BACKGROUNDS) : '';
          }
          return { ...prev, ...updates };
      });
      help("Sección aleatorizada. Los demás parámetros se han mantenido intactos.", "Section randomized. Other parameters remain intact.");
  };

  const mapOpts = (list: any[]) => list.map(item => ({
    label: lang === 'ES' ? item.es : item.en,
    value: item.value
  }));

  const T = {
    ES: {
      subtitle: "[ Sistema de Arquitectura de Personajes v5.1 Platinum ]",
      designedSuffix: "Diseñado por Mr. Cuarter",
      race: "Especie / Raza",
      gender: "Género",
      age: "Edad",
      skinTone: "Tono de Piel",
      classCategory: "Categoría de Clase",
      catFantasy: "Fantasía / Sci-Fi",
      catReal: "Realista / Moderno",
      bodyType: "Constitución",
      role: "Profesión / Clase",
      subRole: "Especialización (Opcional)",
      
      emotion: "Emoción / Carácter",
      pose: "Pose (Estática)",
      action: "Acción (Dinámica)",
      
      style: "Estilo Visual",
      framing: "Encuadre / Cámara",
      lighting: "Iluminación",
      atmosphere: "Atmósfera",
      
      setting: "Entorno (Lugar)",
      background: "Tipo de Fondo",
      colors: "Paleta de Color",
      
      format: "Aspect Ratio",
      details: "Detalles Específicos",
      placeholderDetails: "Ojos brillantes, armadura dorada, pelo flotando...",
      
      lblLivePreview: "BUFFER DE PREVISUALIZACIÓN",
      btnCopyLive: "COPIAR BASE",
      btnGenerate: "MEJORAR CON IA (SINGLE)",
      btnPsyche: "PROTOCOLO PSYCHE (SHEETS)",
      btnInventory: "GENERAR ARSENAL / LOOT",
      btnRandom: "EXPERIMENTACIÓN GENOMA",
      btnElite: "DESPLEGAR AGENTE DE ÉLITE",
      btnLoading: "OPTIMIZANDO NEURONAS...",
      
      errorRequired: "Selecciona al menos Raza y Clase o añade detalles.",
      errorApi: "Error crítico: Verifica tu API Key.",
      
      psycheTitle: "HOJAS DE MODELADO (CHARACTER SHEETS)",
      inventoryTitle: "SUMINISTROS TÁCTICOS (ASSET SHEET)",
      btnCopyAllMJ: "COPIAR COMANDOS MIDJOURNEY (LISTA)",
      btnCopyAllGen: "COPIAR TODO EL KIT (AUTO-GENERAR)",
      
      modeLabel: "Tipo de Media",
      modeImg: "Imagen",
      modeVid: "Video",

      designModeLabel: "Modo Diseño",
      designQuick: "RÁPIDO",
      designAdv: "AVANZADO",
      
      formatLabel: "Sintaxis Prompt",
      fmtMJ: "Midjourney",
      fmtGen: "Genérico",
      
      secIdentity: "1. IDENTIDAD BIOMÉTRICA",
      secExpression: "2. EXPRESIÓN Y MOVIMIENTO",
      secVisuals: "3. COMPOSICIÓN Y ENTORNO",

      designedBy: "Diseñada por",
    },
    EN: {
      subtitle: "[ Character Architecture System v5.1 Platinum ]",
      designedSuffix: "Designed by Mr. Cuarter",
      race: "Species / Race",
      gender: "Gender",
      age: "Age",
      skinTone: "Skin Tone",
      classCategory: "Class Category",
      catFantasy: "Fantasy / Sci-Fi",
      catReal: "Realistic / Modern",
      bodyType: "Body Type",
      role: "Profession / Class",
      subRole: "Specialization (Optional)",
      
      emotion: "Emotion / Character",
      pose: "Pose (Static)",
      action: "Action (Dynamic)",
      
      style: "Visual Style",
      framing: "Framing / Camera",
      lighting: "Lighting",
      atmosphere: "Atmosphere",
      
      setting: "Environment (Place)",
      background: "Background Type",
      colors: "Color Palette",
      
      format: "Aspect Ratio",
      details: "Specific Details",
      placeholderDetails: "Glowing eyes, golden armor, floating hair...",
      
      lblLivePreview: "LIVE PREVIEW BUFFER",
      btnCopyLive: "COPY BASE",
      btnGenerate: "ENHANCE WITH AI (SINGLE)",
      btnPsyche: "PSYCHE PROTOCOL (SHEETS)",
      btnInventory: "GENERATE ARSENAL / LOOT",
      btnRandom: "GENOME EXPERIMENTATION",
      btnElite: "DEPLOY ELITE AGENT",
      btnLoading: "OPTIMIZING NEURONAS...",
      
      errorRequired: "Select at least Race and Class or add details.",
      errorApi: "Critical Error: Check API Key.",

      psycheTitle: "CHARACTER MODEL SHEETS",
      inventoryTitle: "TACTICAL SUPPLIES (ASSET SHEET)",
      btnCopyAllMJ: "COPY MIDJOURNEY COMMANDS (LIST)",
      btnCopyAllGen: "COPY FULL KIT (AUTO-GENERATE)",
      
      modeLabel: "Media Type",
      modeImg: "Image",
      modeVid: "Video",

      designModeLabel: "Design Mode",
      designQuick: "QUICK",
      designAdv: "ADVANCED",
      
      formatLabel: "Prompt Syntax",
      fmtMJ: "Midjourney",
      fmtGen: "Generic",
      
      secIdentity: "1. BIOMETRIC IDENTITY",
      secExpression: "2. EXPRESSION & MOVEMENT",
      secVisuals: "3. COMPOSITION & ENVIRONMENT",

      designedBy: "Designed by",
    }
  };

  const t = T[lang];

  return (
    <div className="min-h-screen w-full bg-[#030712] relative overflow-x-hidden selection:bg-cyan-500 selection:text-black flex flex-col font-sans">
      
      {/* --- CRT OVERLAY --- */}
      {crtMode && (
        <div className="fixed inset-0 z-[999] pointer-events-none mix-blend-screen opacity-60">
           <div className="crt-overlay absolute inset-0"></div>
           <div className="scanline absolute inset-0"></div>
        </div>
      )}

      {/* Background FX */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] -z-10"></div>
      <div className="fixed top-20 left-0 w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[80px] -z-10"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none -z-5"></div>

      {/* HEADER NAVBAR (Existing) */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800 px-4 py-2 md:py-3 md:px-8 flex justify-between items-center shadow-lg shadow-cyan-900/5 transition-all">
         <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar mask-image-fade-sides">
            <a href="https://mistercuarter.es" className="relative group px-3 py-1.5 md:px-4 md:py-2 overflow-hidden bg-slate-900 border border-slate-700 text-cyan-500 text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center md:min-w-[100px] rounded-sm shrink-0" onMouseEnter={() => sfx.playHover()}>
                 <span className="absolute inset-0 w-full h-full bg-cyan-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span><span className="relative z-10 flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg><span className="hidden md:inline">INICIO</span></span>
            </a>
            
            <a href="https://laboratorio.mistercuarter.es" className="relative group px-3 py-1.5 md:px-4 md:py-2 overflow-hidden bg-slate-900 border border-slate-700 text-purple-400 text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center md:min-w-[120px] rounded-sm shrink-0" onMouseEnter={() => sfx.playHover()}>
                 <span className="absolute inset-0 w-full h-full bg-purple-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span><span className="relative z-10 flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg><span className="hidden md:inline">LABORATORIO</span></span>
            </a>

            <a href="https://atlascore.mistercuarter.es" className="relative group px-3 py-1.5 md:px-4 md:py-2 overflow-hidden bg-slate-900 border border-slate-700 text-amber-500 text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center md:min-w-[120px] rounded-sm shrink-0" onMouseEnter={() => sfx.playHover()}>
                 <span className="absolute inset-0 w-full h-full bg-amber-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span><span className="relative z-10 flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span className="hidden md:inline">ATLAS_CORE</span></span>
            </a>
         </div>
         <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-3 cursor-pointer group" onMouseEnter={() => sfx.playHover()}>
                <h2 className="text-lg font-bold tracking-wider text-slate-200 group-hover:text-cyan-400 transition-colors brand-font">
                    NEO<span className="text-cyan-500">GENESIS</span>
                </h2>
                <Logo className="w-8 h-8 md:w-12 md:h-12 shrink-0 group-hover:rotate-180 transition-transform duration-700" />
            </div>

            {/* NEW: CRT Toggle */}
            <button onClick={toggleCrt} className={`relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border ${crtMode ? 'border-cyan-500 text-cyan-400 shadow-[0_0_10px_cyan]' : 'border-slate-700 text-slate-500'} text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm`} title="Toggle CRT FX" onMouseEnter={() => sfx.playHover()}>
                 <span className="relative z-10 text-[8px] md:text-[10px] font-mono">CRT</span>
            </button>

            {/* NEW: History Toggle */}
             <button onClick={() => {setShowHistory(true); sfx.playClick()}} className={`relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border border-slate-700 text-amber-500 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm`} title="Memory Core" onMouseEnter={() => sfx.playHover()}>
                 <span className="absolute inset-0 w-full h-full bg-amber-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm"></span><span className="relative z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            </button>

             <button onClick={toggleTutorial} className={`relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border ${isTutorialMode ? 'border-green-500 text-green-400' : 'border-slate-700 text-slate-500'} text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm`} title="Toggle Assistant" onMouseEnter={() => sfx.playHover()}>
                 <span className={`absolute inset-0 w-full h-full ${isTutorialMode ? 'bg-green-500/10' : 'bg-cyan-500/20'} scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm`}></span><span className="relative z-10 font-mono text-xs font-bold">?</span>
            </button>
             <button onClick={toggleMute} className={`relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border ${isMuted ? 'border-red-900 text-red-700' : 'border-slate-700 text-cyan-500'} text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm`} title="Toggle SFX" onMouseEnter={() => sfx.playHover()}>
                 <span className={`absolute inset-0 w-full h-full ${isMuted ? 'bg-red-500/10' : 'bg-cyan-500/20'} scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm`}></span><span className="relative z-10">{isMuted ? (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>) : (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>)}</span>
            </button>
             <button onClick={() => { setLang(prev => prev === 'ES' ? 'EN' : 'ES'); sfx.playClick(); }} className="relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border border-slate-700 text-cyan-500 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm" onMouseEnter={() => sfx.playHover()}>
                 <span className="absolute inset-0 w-full h-full bg-cyan-500/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm"></span><span className="relative z-10">{lang}</span>
            </button>
         </div>
      </nav>

      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={(item) => {
            setGeneratedData(item);
            if (item.modelParams) setParams(item.modelParams as any);
        }}
        onClear={clearHistory}
        lang={lang}
      />

      <div className="flex-grow max-w-6xl mx-auto px-4 py-8 md:py-16 relative z-10 w-full mt-20 md:mt-24">
        
        {/* HERO TITLE */}
        <header className="mb-8 text-center relative">
           <div className="flex flex-col items-center justify-center mb-4">
              <h1 className="text-3xl md:text-7xl font-bold glitch-wrapper text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tighter">
                <span className="glitch" data-text="NEOGENESIS">NEO<span className="text-white">GENESIS</span></span>
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2">
                <p className="text-slate-400 tracking-widest text-xs md:text-sm font-mono uppercase">{t.subtitle}</p>
              </div>
           </div>
           
           {/* UNIFIED ACTION BUTTONS ROW (Elite First) */}
           <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mt-6">
                
                {/* 1. ELITE AGENT (Coherent) - NOW FIRST */}
                <button
                    onClick={handleElitePreset}
                    onMouseEnter={() => {
                        sfx.playHover();
                        help(
                            "🛡️ AGENTE DE ÉLITE: Despliega un perfil pre-configurado, coherente y listo para la acción.",
                            "🛡️ ELITE AGENT: Deploys a pre-configured, coherent profile ready for action."
                        );
                    }}
                    className="group relative w-full md:w-auto px-6 md:px-10 overflow-hidden bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all rounded-sm py-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] min-w-[280px] active:scale-95"
                >
                    <div className="absolute inset-0 bg-cyan-900/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                    <span className="relative z-10 flex flex-col items-center justify-center gap-1">
                        <span className="flex items-center justify-center gap-3 text-cyan-400 font-brand font-bold text-sm tracking-widest uppercase">
                             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                             {t.btnElite}
                        </span>
                    </span>
                </button>

                {/* 2. GENOME EXPERIMENT (Chaos) - NOW SECOND */}
                <button
                    onClick={handleRandomize}
                    onMouseEnter={() => {
                        sfx.playHover();
                        help(
                            "⚠️ EXPERIMENTACIÓN GENOMA: Mutación aleatoria impredecible. Mezcla ADN y conceptos dispares.",
                            "⚠️ GENOME EXPERIMENTATION: Unpredictable random mutation. Mixes DNA and disparate concepts."
                        );
                    }}
                    className="group relative w-full md:w-auto px-6 md:px-10 overflow-hidden bg-slate-950 border border-purple-500/40 hover:border-purple-400 transition-all rounded-sm py-4 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] min-w-[280px] active:scale-95"
                >
                    <div className="absolute inset-0 bg-purple-900/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                    <span className="relative z-10 flex flex-col items-center justify-center gap-1">
                        <span className="flex items-center justify-center gap-3 text-purple-400 font-brand font-bold text-sm tracking-widest uppercase">
                             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                             {t.btnRandom}
                        </span>
                    </span>
                </button>

           </div>
           
           <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-8 mx-auto"></div>
        </header>

        {/* Global Controls: Design Mode & Format */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4 mb-8 max-w-5xl mx-auto">
            
            {/* Design Mode Toggle (NEW) */}
            <FuturisticToggle 
                leftLabel={t.designQuick} rightLabel={t.designAdv}
                value={params.designMode} leftValue="quick" rightValue="advanced"
                onChange={(v) => {
                    setParams(prev => ({...prev, designMode: v}));
                    sfx.playClick();
                }}
            />

            {/* Media Type Toggle */}
            <FuturisticToggle 
                leftLabel={t.modeImg} rightLabel={t.modeVid}
                value={params.mode} leftValue="image" rightValue="video"
                onChange={(v) => {
                    setParams(prev => ({...prev, mode: v}));
                    sfx.playClick();
                }}
            />

            {/* Format Toggle */}
            <FuturisticToggle 
                leftLabel={t.fmtMJ} rightLabel={t.fmtGen}
                value={params.promptFormat} leftValue="midjourney" rightValue="generic"
                onChange={(v) => {
                    setParams(prev => ({...prev, promptFormat: v}));
                    sfx.playClick();
                }}
            />
        </div>

        {/* MAIN INTERFACE CONTAINER */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 md:p-8 rounded-lg relative shadow-2xl shadow-cyan-900/10 min-h-[600px]">
           {/* Decorative Corners */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-lg"></div>

           {/* --- CONDITIONAL RENDERING: QUICK vs ADVANCED --- */}
           {params.designMode === 'quick' ? (
               <QuickDesignWizard 
                 lang={lang} 
                 params={params} 
                 setParams={setParams} 
                 onComplete={() => {
                     document.querySelector('#generate-controls')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               />
           ) : (
               /* --- ADVANCED MODE (Classic Form) --- */
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2 animate-fade-in">
                  
                  {/* SECTION 1: IDENTITY */}
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                        <div className="text-cyan-500 font-mono text-sm">{t.secIdentity}</div>
                        {/* Section Randomizer Dice */}
                        <button 
                            onClick={() => randomizeSection('identity')}
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                            title="Randomize Identity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FuturisticSelect 
                        label={t.race} value={params.race} onChange={(v) => setParams(prev => ({...prev, race: v}))} options={mapOpts(C.RACES)} 
                        onHelp={() => help("Define la especie base.", "Defines base species.")}
                      />
                      <FuturisticSelect 
                        label={t.gender} value={params.gender} onChange={(v) => setParams(prev => ({...prev, gender: v}))} options={mapOpts(C.GENDERS)} 
                        onHelp={() => help("Género o presentación física.", "Gender.")}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <FuturisticSelect 
                        label={t.age} value={params.age} onChange={(v) => setParams(prev => ({...prev, age: v}))} options={mapOpts(C.AGES)} 
                        onHelp={() => help("Edad aparente.", "Apparent age.")}
                       />
                       <FuturisticSelect 
                        label={t.bodyType} value={params.bodyType} onChange={(v) => setParams(prev => ({...prev, bodyType: v}))} options={mapOpts(C.BODY_TYPES)} 
                        onHelp={() => help("Constitución física.", "Physical build.")}
                       />
                    </div>

                    {/* Skin Tone Selector */}
                    <div className="flex flex-col space-y-2 group">
                         <label className="text-cyan-400 text-xs uppercase tracking-widest font-semibold ml-1">{t.skinTone}</label>
                         <div className="flex flex-wrap gap-2 p-2 bg-slate-900/60 border border-slate-700 rounded-sm">
                             {C.SKIN_TONES.map(tone => (
                                 <button
                                    key={tone.value}
                                    onClick={() => { setParams(prev => ({...prev, skinTone: tone.value})); sfx.playClick(); }}
                                    title={lang === 'ES' ? tone.es : tone.en}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${params.skinTone === tone.value ? 'border-cyan-400 scale-110 shadow-[0_0_10px_cyan]' : 'border-slate-600'}`}
                                    style={{ backgroundColor: tone.color }}
                                 />
                             ))}
                         </div>
                    </div>

                    {/* Class Category Toggle */}
                    <div className="pt-2">
                        <FuturisticToggle 
                            leftLabel={t.catFantasy} rightLabel={t.catReal}
                            value={params.classCategory} leftValue="fantasy" rightValue="realistic"
                            onChange={(v) => {
                                setParams(prev => ({...prev, classCategory: v, role: ''})); // Reset role on switch
                                sfx.playClick();
                            }}
                        />
                    </div>

                    <FuturisticSelect 
                        label={t.role} value={params.role} onChange={(v) => setParams(prev => ({...prev, role: v}))} 
                        options={mapOpts(params.classCategory === 'realistic' ? C.ROLES_REALISTIC : C.ROLES_FANTASY)} 
                        onHelp={() => help("Ocupación principal.", "Main occupation.")}
                    />
                  </div>

                  {/* SECTION 2: VISUALS & EXPRESSION */}
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                        <div className="text-cyan-500 font-mono text-sm">{t.secExpression}</div>
                        {/* Section Randomizer Dice */}
                        <button 
                            onClick={() => randomizeSection('visuals')}
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                            title="Randomize Visuals"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </div>
                    <FuturisticSelect 
                        label={t.emotion} value={params.emotion} onChange={(v) => setParams(prev => ({...prev, emotion: v}))} options={mapOpts(C.EMOTIONS)} 
                        onHelp={() => help("Expresión facial.", "Facial expression.")}
                    />
                    {params.mode === 'video' ? (
                      <FuturisticSelect 
                        label={t.action} value={params.action} onChange={(v) => setParams(prev => ({...prev, action: v}))} options={mapOpts(C.ACTIONS_VIDEO)} 
                        onHelp={() => help("Acción dinámica.", "Dynamic action.")}
                      />
                    ) : (
                      <FuturisticSelect 
                        label={t.pose} value={params.pose} onChange={(v) => setParams(prev => ({...prev, pose: v}))} options={mapOpts(C.POSES_IMAGE)} 
                        onHelp={() => help("Postura estática.", "Static pose.")}
                      />
                    )}
                    <FuturisticSelect 
                        label={t.style} value={params.style} onChange={(v) => setParams(prev => ({...prev, style: v}))} options={mapOpts(C.STYLES)} 
                        onHelp={() => help("Estilo artístico.", "Art style.")}
                    />
                    <div onMouseEnter={() => help("Colores dominantes.", "Dominant colors.")}>
                        <ColorPicker label={t.colors} selectedColors={params.colors} onChange={(colors) => setParams(prev => ({...prev, colors}))} />
                    </div>
                  </div>

                  {/* SECTION 3: COMPOSITION & TECH */}
                  <div className="space-y-5">
                     <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                        <div className="text-cyan-500 font-mono text-sm">{t.secVisuals}</div>
                        {/* Section Randomizer Dice */}
                        <button 
                            onClick={() => randomizeSection('tech')}
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                            title="Randomize Tech"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FuturisticSelect 
                            label={t.framing} value={params.framing} onChange={(v) => setParams(prev => ({...prev, framing: v}))} options={mapOpts(C.FRAMINGS)} 
                            onHelp={() => help("Cámara.", "Camera.")}
                        />
                        <FuturisticSelect 
                            label={t.lighting} value={params.lighting} onChange={(v) => setParams(prev => ({...prev, lighting: v}))} options={mapOpts(C.LIGHTINGS)} 
                            onHelp={() => help("Luz.", "Light.")}
                        />
                     </div>
                     <FuturisticSelect 
                        label={t.atmosphere} value={params.atmosphere} onChange={(v) => setParams(prev => ({...prev, atmosphere: v}))} options={mapOpts(C.ATMOSPHERES)} 
                        onHelp={() => help("Ambiente.", "Atmosphere.")}
                     />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FuturisticSelect 
                            label={t.setting} value={params.setting} onChange={(v) => setParams(prev => ({...prev, setting: v}))} options={mapOpts(C.SETTINGS)} 
                            onHelp={() => help("Ubicación.", "Location.")}
                        />
                        <FuturisticSelect 
                            label={t.background} value={params.background} onChange={(v) => setParams(prev => ({...prev, background: v}))} options={mapOpts(C.BACKGROUNDS)} 
                            onHelp={() => help("Fondo específico.", "Specific background.")}
                        />
                     </div>
                     <FuturisticSelect 
                        label={t.format} value={params.aspectRatio} onChange={(v) => setParams(prev => ({...prev, aspectRatio: v}))} options={C.ASPECT_RATIOS.map(ar => ({ label: ar.label, value: ar.value }))} 
                        onHelp={() => help("Ratio.", "Ratio.")}
                     />
                  </div>
                  
                  {/* DETAILS (FULL WIDTH IN ADVANCED) */}
                  <div className="col-span-1 lg:col-span-3 mt-6 border-t border-slate-800 pt-6">
                    <div onMouseEnter={() => help("Detalles adicionales.", "Extra details.")}>
                        <FuturisticInput
                            label={t.details}
                            value={params.details}
                            onChange={(v) => setParams(prev => ({...prev, details: v}))}
                            placeholder={t.placeholderDetails}
                            multiline={true}
                        />
                    </div>
                  </div>
               </div>
           )}

           {/* --- LIVE PREVIEW BUFFER SECTION --- */}
           <div 
            className="mt-8 bg-black/40 border border-slate-700 rounded-sm p-4 relative group hover:border-cyan-500/50 transition-colors"
            id="generate-controls"
            onMouseEnter={() => help(
                "Vista previa del prompt 'crudo' que se enviará a la IA.",
                "Preview of the 'raw' prompt sent to AI."
            )}
           >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono font-bold animate-pulse">
                   {t.lblLivePreview}
                </span>
                <button
                   onClick={handleCopyLive}
                   onMouseEnter={() => sfx.playHover()}
                   className="text-[10px] bg-slate-800 border border-slate-600 hover:bg-cyan-900 hover:text-white hover:border-cyan-500 text-slate-300 px-3 py-1 uppercase font-bold tracking-widest transition-all"
                >
                   {copiedLive ? 'COPIED!' : t.btnCopyLive}
                </button>
              </div>
              <div className="font-mono text-xs md:text-sm text-slate-300 leading-relaxed break-words bg-black/50 p-3 rounded-sm min-h-[60px] border-l-2 border-cyan-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                 {livePrompt || <span className="text-slate-600 italic opacity-50">...Esperando datos para inicializar secuencia de prompt...</span>}
              </div>
           </div>

           {/* ACTION BUTTONS (REORDERED: Single - Inventory - Psyche) */}
           <div className="mt-6 flex flex-col md:flex-row justify-center gap-4 items-stretch">
              
             {/* 1. AI ENHANCE BUTTON (SINGLE) */}
             <button
              onClick={handleGenerate}
              disabled={loadingState === LoadingState.LOADING}
              onMouseEnter={() => {
                  sfx.playHover();
                  help("Genera UN solo prompt altamente optimizado.", "Generates A SINGLE highly optimized prompt.");
              }}
              className={`
                relative px-6 py-5 bg-transparent overflow-hidden group
                text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed w-full md:flex-1
                border border-cyan-500/50 group-hover:border-cyan-400 active:scale-95 touch-manipulation min-h-[60px]
              `}
             >
               <span className="absolute inset-0 w-full h-full bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
               <span className="relative z-10 flex items-center justify-center gap-2">
                 {loadingState === LoadingState.LOADING ? (
                    <>
                      <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      {t.btnLoading}
                    </>
                 ) : (
                    <>
                      {t.btnGenerate}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                    </>
                 )}
               </span>
             </button>

             {/* 2. INVENTORY BUTTON (CENTERED) */}
             <button
              onClick={handleGenerateInventory}
              disabled={loadingState === LoadingState.LOADING}
              onMouseEnter={() => {
                  sfx.playHover();
                  help("Genera un SET DE OBJETOS para este personaje (Sprite Sheet sin fondo).", "Generates an ITEM SET for this character (Backgroundless Sprite Sheet).");
              }}
              className={`
                relative px-6 py-5 bg-transparent overflow-hidden group
                text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed w-full md:flex-1
                border border-emerald-500/30 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 touch-manipulation min-h-[60px]
              `}
             >
               <span className="absolute inset-0 w-full h-full bg-emerald-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-500"></span>
               <span className="relative z-10 flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                 {t.btnInventory}
               </span>
             </button>

             {/* 3. PSYCHE PROTOCOL BUTTON (RIGHT) */}
             <button
              onClick={handleGenerateExpressions}
              disabled={loadingState === LoadingState.LOADING}
              onMouseEnter={() => {
                  sfx.playHover();
                  help("Genera 5 VARIACIONES maestras (Sheets, Token y Victoria).", "Generates 5 MASTER VARIATIONS (Sheets, Token, Victory).");
              }}
              className={`
                relative px-6 py-5 bg-transparent overflow-hidden group
                text-amber-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed w-full md:flex-1
                border border-amber-500/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-95 touch-manipulation min-h-[60px]
              `}
             >
               <span className="absolute inset-0 w-full h-full bg-amber-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
               <span className="relative z-10 flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 {t.btnPsyche}
               </span>
             </button>

           </div>

           {/* Error Message */}
           {errorMsg && (
             <div className="mt-6 p-4 bg-red-950/40 border border-red-500/50 text-red-400 text-sm text-center font-mono animate-pulse">
               ⚠ SYSTEM ERROR: {errorMsg}
             </div>
           )}
        </div>

        {/* --- INVENTORY OUTPUT SECTION (LOOT CRATE STYLE) --- */}
        {inventoryData && (
          <div id="inventory-section" className="w-full mt-12 relative animate-fade-in">
             <div className="flex flex-col items-center justify-center mb-6">
                <div className="flex items-center gap-3 border border-emerald-900/50 bg-emerald-950/20 px-6 py-2 rounded-full mb-2">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                   <h3 className="text-xl font-bold text-emerald-400 tracking-widest font-brand uppercase">{t.inventoryTitle}</h3>
                </div>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">SUPPLY DROP RECEIVED</p>
             </div>

             <div className="relative group max-w-4xl mx-auto">
                 {/* Crate Border Design */}
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
                 
                 <div className="bg-slate-900/90 border-x border-emerald-900/30 p-6 md:p-8 rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                    <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-xs text-emerald-600 font-mono font-bold bg-emerald-950/50 px-2 py-1 border border-emerald-900/50 rounded">CLASS: {params.role.toUpperCase()}</span>
                        <button 
                            onClick={handleCopyInventory}
                            onMouseEnter={() => sfx.playHover()}
                            className="text-xs bg-emerald-900/20 hover:bg-emerald-500 hover:text-black border border-emerald-700 hover:border-emerald-500 text-emerald-400 px-4 py-2 rounded-sm transition-all uppercase font-bold tracking-wider flex items-center gap-2"
                        >
                           {copiedInventory ? 'COPIED!' : 'COPY PROMPT'}
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>

                    <div className="bg-black/60 p-4 rounded-sm border border-emerald-900/50 font-mono text-emerald-100/90 text-sm leading-relaxed whitespace-pre-wrap shadow-inner relative z-10">
                       {inventoryData.prompt}
                    </div>

                    {/* Negative Prompt Mini Section */}
                    <div className="mt-4 pt-4 border-t border-emerald-900/30 relative z-10 opacity-70 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-1">NEGATIVE PROMPT (EXCLUSIONS)</p>
                        <p className="text-xs text-slate-400 font-mono">{inventoryData.negativePrompt}</p>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {/* --- PSYCHE OUTPUT SECTION --- */}
        {expressionSheet && (
          <div id="expression-section" className="w-full mt-16 relative">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-amber-900/30 pb-4 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wider brand-font text-center md:text-left">
                   {t.psycheTitle}
                </h3>
                <button
                   onClick={handleCopyAllExpressions}
                   onMouseEnter={() => sfx.playHover()}
                   className="w-full md:w-auto text-sm md:text-base bg-amber-600/20 border border-amber-500 hover:bg-amber-500 hover:text-black text-amber-300 px-6 py-4 uppercase font-black tracking-widest transition-all rounded-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 active:scale-95 touch-manipulation"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                   {copiedAllExpressions ? "COPIED!" : (params.promptFormat === 'midjourney' ? t.btnCopyAllMJ : t.btnCopyAllGen)}
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expressionSheet.map((item, idx) => (
                   <div key={idx} className="bg-slate-900/80 border border-amber-900/50 p-5 rounded-sm hover:border-amber-500 transition-colors group relative overflow-hidden flex flex-col h-full shadow-lg shadow-black/50">
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-xs text-amber-400 font-black tracking-[0.2em] uppercase bg-amber-950/40 px-3 py-1 rounded-sm border border-amber-900/50">{item.label}</span>
                         <button onClick={() => handleCopyMatrixItem(item.prompt, idx)} onMouseEnter={() => sfx.playHover()} className="text-slate-500 hover:text-white transition-colors p-2 md:p-1 active:scale-110">
                            {copiedMatrixIndex === idx ? <span className="text-green-400 text-xs font-bold flex items-center gap-1">COPIED <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span> : <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>}
                         </button>
                      </div>
                      <div className="bg-black/40 p-3 rounded-sm border border-slate-800 flex-grow">
                          <p className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{item.prompt}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        <TerminalOutput data={generatedData} loading={loadingState === LoadingState.LOADING} format={params.promptFormat} />

      </div>

      {/* FOOTER (Existing) */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/50 backdrop-blur-sm relative z-20 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex flex-col items-center md:items-start space-y-1">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-mono">{t.designedBy}</p>
              <h3 className="text-lg font-bold text-slate-300 font-mono tracking-tight hover:text-cyan-400 transition-colors cursor-default">Norberto Cuartero</h3>
              <a href="https://mistercuarter.es" target="_blank" className="text-cyan-600 text-xs hover:text-cyan-400 transition-colors font-mono">mistercuarter.es</a>
           </div>
           <div className="flex items-center gap-4">
              <SocialIcon href="https://instagram.com/MrCuarter" icon="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
              <SocialIcon href="https://twitter.com/MrCuarter" icon="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              <SocialIcon href="https://es.linkedin.com/in/norberto-cuartero-toledo-9279a813b" icon="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h5v-8.306c0-4.613 5.432-5.17 5.432 0v8.306h5v-10.502c0-8.586-9.213-7.974-10.463-3.715v-2.089z" />
              <SocialIcon href="mailto:hola@mistercuarter.es" icon="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
           </div>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>
      </footer>

      <AssistantHud isActive={isTutorialMode} message={assistantMessage} onClose={toggleTutorial} />
    </div>
  );
};

const SocialIcon: React.FC<{href: string, icon: string}> = ({href, icon}) => (
  <a href={href} target="_blank" onMouseEnter={() => sfx.playHover()} className="w-10 h-10 flex items-center justify-center border border-slate-800 bg-slate-900 rounded-sm text-slate-500 hover:text-cyan-400 hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all group">
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d={icon}/></svg>
  </a>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("CRITICAL: Root element not found.");
}
