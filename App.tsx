import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FuturisticSelect } from './components/FuturisticSelect';
import { FuturisticInput } from './components/FuturisticInput';
import { FuturisticToggle } from './components/FuturisticToggle';
import { ColorPicker } from './components/ColorPicker';
import { TerminalOutput } from './components/TerminalOutput';
import { Logo } from './components/Logo';
import { generatePrompt, generateExpressionSheet } from './services/geminiService';
import { buildLocalPrompt } from './services/promptBuilder'; 
import { CharacterParams, GeneratedData, LoadingState, Language, ExpressionEntry } from './types';
import * as C from './constants';
import { sfx } from './services/audioEngine'; // Import SFX

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ES');
  const [isMuted, setIsMuted] = useState(false); // Mute state
  
  const [params, setParams] = useState<CharacterParams>({
    mode: 'image',
    promptFormat: 'generic', // CHANGED: Default is now Generic
    race: '',
    gender: '',
    age: '',
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
  
  // Expression Sheet State (AI - PSYCHE PROTOCOL)
  const [expressionSheet, setExpressionSheet] = useState<ExpressionEntry[] | null>(null);

  const [copiedMatrixIndex, setCopiedMatrixIndex] = useState<number | null>(null);
  const [copiedAllExpressions, setCopiedAllExpressions] = useState(false);

  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Audio & Startup Sound
  useEffect(() => {
    const handleInteraction = () => {
       sfx.playStartup();
       window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // Update live prompt whenever params change
  useEffect(() => {
    const prompt = buildLocalPrompt(params);
    setLivePrompt(prompt);
  }, [params]);

  const toggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
    if (!muted) sfx.playClick();
  };

  const handleCopyLive = () => {
    sfx.playClick();
    navigator.clipboard.writeText(livePrompt);
    setCopiedLive(true);
    setTimeout(() => setCopiedLive(false), 2000);
  };

  // AI GENERATION (Expression Sheet - PSYCHE)
  const handleGenerateExpressions = async () => {
     sfx.playClick();
     if (!params.race && !params.role && !params.details) {
      setErrorMsg(lang === 'ES' ? "Define el personaje primero." : "Define character first.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setLoadingState(LoadingState.LOADING);
    setGeneratedData(null);
    setExpressionSheet(null);
    setErrorMsg(null);

    try {
        const sheet = await generateExpressionSheet(params);
        setExpressionSheet(sheet);
        setLoadingState(LoadingState.SUCCESS);
        sfx.playSuccess(); // Success Sound
        setTimeout(() => document.getElementById('expression-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
        console.error(error);
        setErrorMsg(lang === 'ES' ? "Error generando protocolo Psyche (Revisa API KEY)." : "Error generating Psyche protocol (Check API KEY).");
        setLoadingState(LoadingState.ERROR);
    }
  };

  // AI GENERATION (Single Prompt - STANDARD)
  const handleGenerate = async () => {
    sfx.playClick();
    if (!params.race && !params.role && !params.details) {
      setErrorMsg(t.errorRequired);
      return;
    }
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setGeneratedData(null);
    setExpressionSheet(null);

    try {
      const result = await generatePrompt(params);
      setGeneratedData(result);
      setLoadingState(LoadingState.SUCCESS);
      sfx.playSuccess(); // Success Sound
    } catch (error) {
      console.error(error);
      setErrorMsg(t.errorApi);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleCopyMatrixItem = (text: string, index: number) => {
    sfx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedMatrixIndex(index);
    setTimeout(() => setCopiedMatrixIndex(null), 1500);
  };

  const handleCopyAllExpressions = () => {
    sfx.playClick();
    if (!expressionSheet) return;
    const isMJ = params.promptFormat === 'midjourney';

    let intro = "";
    
    if (isMJ) {
       intro = lang === 'ES'
        ? "Aquí tienes una lista de 4 prompts para Midjourney. Por favor, preséntamelos en bloques de código separados para que pueda copiarlos y pegarlos en Discord fácilmente:\n\n"
        : "Here is a list of 4 Midjourney prompts. Please display them in separate code blocks so I can easily copy and paste them into Discord:\n\n";
    } else {
       intro = lang === 'ES'
        ? "Actúa como un generador de imágenes experto. Necesito crear un Kit de Diseño de Personaje completo. Por favor, genera las siguientes 4 imágenes secuencialmente (una tras otra) utilizando exactamente las descripciones provistas a continuación. Mantén la consistencia visual:\n\n"
        : "Act as an expert image generator. I need to create a full Character Design Kit. Please generate the following 4 images sequentially (one after another) using exactly the descriptions provided below. Maintain visual consistency:\n\n";
    }

    const body = expressionSheet.map((item, i) => 
        `👇 IMAGEN ${i + 1}: [${item.label}]\n${item.prompt}`
    ).join("\n\n" + "-".repeat(40) + "\n\n");

    const fullPayload = intro + body;

    navigator.clipboard.writeText(fullPayload);
    setCopiedAllExpressions(true);
    setTimeout(() => setCopiedAllExpressions(false), 2000);
  };
  
  const handleElitePreset = () => {
    sfx.playClick();
    const randomPreset = C.PRESETS[Math.floor(Math.random() * C.PRESETS.length)];
    setParams(prev => ({
        ...prev,
        ...randomPreset.params as any,
        mode: prev.mode, 
        promptFormat: prev.promptFormat
    }));
  };

  const mapOpts = (list: any[]) => list.map(item => ({
    label: lang === 'ES' ? item.es : item.en,
    value: item.value
  }));

  // Helper to pick random item
  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)].value;

  const handleRandomize = () => {
    sfx.playClick();
    const isVideo = Math.random() > 0.5;
    setParams(prev => ({
      ...prev,
      mode: isVideo ? 'video' : 'image',
      race: getRandom(C.RACES),
      gender: getRandom(C.GENDERS),
      age: getRandom(C.AGES),
      role: getRandom(C.ROLES),
      subRole: Math.random() > 0.7 ? getRandom(C.ROLES) : '',
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
  };

  // Translation Dictionary
  const T = {
    ES: {
      subtitle: "[ Sistema de Arquitectura de Personajes v3.5 ]",
      designedSuffix: "Diseñado por Mr. Cuarter",
      race: "Especie / Raza",
      gender: "Género",
      age: "Edad",
      bodyType: "Constitución",
      role: "Clase Principal",
      subRole: "Subclase (Opcional)",
      
      emotion: "Emoción",
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
      
      lblLivePreview: "BUFFER DE PREVISUALIZACIÓN (SINTAXIS MEJORADA)",
      btnCopyLive: "COPIAR BASE",
      btnGenerate: "MEJORAR CON IA (SINGLE)",
      btnPsyche: "PROTOCOLO PSYCHE (SHEETS)",
      btnRandom: "PROTOCOLO CAOS",
      btnElite: "DESPLEGAR AGENTE DE ÉLITE",
      btnLoading: "OPTIMIZANDO NEURONAS...",
      
      errorRequired: "Selecciona al menos Raza y Clase o añade detalles.",
      errorApi: "Error crítico: Verifica tu API Key.",
      
      psycheTitle: "HOJAS DE MODELADO (CHARACTER SHEETS)",
      btnCopyAllMJ: "COPIAR COMANDOS MIDJOURNEY (LISTA)",
      btnCopyAllGen: "COPIAR TODO EL KIT (AUTO-GENERAR)",
      
      modeLabel: "Modo Generación",
      modeImg: "Imagen",
      modeVid: "Video",
      
      formatLabel: "Formato Prompt",
      fmtMJ: "Midjourney",
      fmtGen: "Genérico",
      
      secIdentity: "1. IDENTIDAD",
      secExpression: "2. EXPRESIÓN",
      secVisuals: "3. ESTILO Y AMBIENTE",

      designedBy: "Diseñada por",
    },
    EN: {
      subtitle: "[ Character Architecture System v3.5 ]",
      designedSuffix: "Designed by Mr. Cuarter",
      race: "Species / Race",
      gender: "Gender",
      age: "Age",
      bodyType: "Body Type",
      role: "Main Class",
      subRole: "Subclass (Optional)",
      
      emotion: "Emotion",
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
      
      lblLivePreview: "LIVE PREVIEW BUFFER (ENHANCED SYNTAX)",
      btnCopyLive: "COPY BASE",
      btnGenerate: "ENHANCE WITH AI (SINGLE)",
      btnPsyche: "PSYCHE PROTOCOL (SHEETS)",
      btnRandom: "CHAOS PROTOCOL",
      btnElite: "DEPLOY ELITE AGENT",
      btnLoading: "OPTIMIZING NEURONS...",
      
      errorRequired: "Select at least Race and Class or add details.",
      errorApi: "Critical Error: Check API Key.",

      psycheTitle: "CHARACTER MODEL SHEETS",
      btnCopyAllMJ: "COPY MIDJOURNEY COMMANDS (LIST)",
      btnCopyAllGen: "COPY FULL KIT (AUTO-GENERATE)",
      
      modeLabel: "Generation Mode",
      modeImg: "Image",
      modeVid: "Video",
      
      formatLabel: "Prompt Format",
      fmtMJ: "Midjourney",
      fmtGen: "Generic",
      
      secIdentity: "1. IDENTITY",
      secExpression: "2. EXPRESSION",
      secVisuals: "3. STYLE & MOOD",

      designedBy: "Designed by",
    }
  };

  const t = T[lang];

  return (
    <div className="min-h-screen w-full bg-[#030712] relative overflow-x-hidden selection:bg-cyan-500 selection:text-black flex flex-col font-sans">
      
      {/* Background FX */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] -z-10"></div>
      <div className="fixed top-20 left-0 w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[80px] -z-10"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none -z-5"></div>

      {/* FIXED HEADER: Nav Buttons (Left) + Logo (Right) */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 md:px-8 flex justify-between items-center shadow-lg shadow-cyan-900/5 transition-all">
        {/* Left: Navigation Buttons */}
        <div className="flex gap-3 md:gap-4">
            <a 
            href="https://mistercuarter.es"
            className="relative group px-3 py-1.5 md:px-4 md:py-2 overflow-hidden bg-slate-900 border border-slate-700 text-cyan-500 text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center min-w-[90px] md:min-w-[100px] rounded-sm"
            onMouseEnter={() => sfx.playHover()} // SFX
            >
            <span className="absolute inset-0 w-full h-full bg-cyan-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                INICIO
            </span>
            </a>
            <a 
            href="https://laboratorio.mistercuarter.es"
            className="relative group px-3 py-1.5 md:px-4 md:py-2 overflow-hidden bg-slate-900 border border-slate-700 text-cyan-500 text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center min-w-[110px] md:min-w-[120px] rounded-sm"
            onMouseEnter={() => sfx.playHover()} // SFX
            >
            <span className="absolute inset-0 w-full h-full bg-cyan-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                LABORATORIO
            </span>
            </a>
        </div>

        {/* Right: Brand + Logo + Language Switcher + Mute */}
        <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onMouseEnter={() => sfx.playHover()}>
                <h2 className="hidden md:block text-lg font-bold tracking-wider text-slate-200 group-hover:text-cyan-400 transition-colors brand-font">
                    NEO<span className="text-cyan-500">GENESIS</span>
                </h2>
                <Logo className="w-10 h-10 md:w-12 md:h-12 shrink-0 group-hover:rotate-180 transition-transform duration-700" />
            </div>

             {/* Mute Toggle */}
             <button
                onClick={toggleMute}
                className={`relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border ${isMuted ? 'border-red-900 text-red-700' : 'border-slate-700 text-cyan-500'} text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm`}
                title="Toggle SFX"
                onMouseEnter={() => sfx.playHover()}
              >
                 <span className={`absolute inset-0 w-full h-full ${isMuted ? 'bg-red-500/10' : 'bg-cyan-500/20'} scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm`}></span>
                 <span className="relative z-10">
                     {isMuted ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                     ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                     )}
                 </span>
            </button>

            {/* Language Toggle */}
             <button 
                onClick={() => {
                  setLang(prev => prev === 'ES' ? 'EN' : 'ES');
                  sfx.playClick();
                }}
                className="relative group w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-slate-900 border border-slate-700 text-cyan-500 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors flex items-center justify-center rounded-sm"
                onMouseEnter={() => sfx.playHover()}
              >
                 <span className="absolute inset-0 w-full h-full bg-cyan-500/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-sm"></span>
                 <span className="relative z-10">
                     {lang}
                 </span>
            </button>
        </div>
      </nav>

      <div className="flex-grow max-w-6xl mx-auto px-4 py-8 md:py-16 relative z-10 w-full mt-24">
        
        {/* Hero Section - Text Only */}
        <header className="mb-10 text-center relative">
           <div className="flex flex-col items-center justify-center mb-4">
              <h1 className="text-4xl md:text-7xl font-bold glitch-wrapper text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tighter">
                <span className="glitch" data-text="NEOGENESIS">NEO<span className="text-white">GENESIS</span></span>
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2">
                <p className="text-slate-400 tracking-widest text-xs md:text-sm font-mono uppercase">
                  {t.subtitle}
                </p>
                <div className="hidden md:block w-1 h-1 bg-cyan-500 rounded-full"></div>
                <p className="text-cyan-500 tracking-widest text-xs md:text-sm font-mono uppercase font-bold text-shadow-neon">
                  {t.designedSuffix}
                </p>
              </div>
           </div>
           
           {/* ELITE PRESET BUTTON */}
           <div className="flex justify-center mt-6">
                <button
                    onClick={handleElitePreset}
                    onMouseEnter={() => sfx.playHover()}
                    className="group relative px-6 py-2 bg-transparent border-y border-cyan-500/30 hover:border-cyan-400 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                    <span className="relative z-10 font-mono text-cyan-400 text-xs tracking-[0.3em] font-bold flex items-center gap-3">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                        {t.btnElite}
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                    </span>
                </button>
           </div>

           <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-8 mx-auto shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </header>

        {/* Global Controls */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
          {/* Mode Toggle */}
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

        {/* Main Form Interface */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 md:p-8 rounded-lg relative shadow-2xl shadow-cyan-900/10">
           {/* Decorative Corners */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-lg"></div>

            {/* RANDOMIZER BUTTON */}
            <div className="absolute -top-5 right-10 md:right-20 z-20">
              <button 
                onClick={handleRandomize}
                onMouseEnter={() => sfx.playHover()}
                className="bg-slate-950 border border-purple-500/50 text-purple-400 hover:text-white hover:bg-purple-900/30 hover:border-purple-400 px-4 py-1 text-[10px] uppercase font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)] flex items-center gap-2 group"
              >
                <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                {t.btnRandom}
              </button>
            </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
              {/* SECTION 1: IDENTITY */}
              <div className="space-y-5">
                <div className="text-cyan-500 font-mono text-sm border-b border-slate-700 pb-2 mb-4">{t.secIdentity}</div>
                <div className="grid grid-cols-2 gap-3">
                  <FuturisticSelect label={t.race} value={params.race} onChange={(v) => setParams(prev => ({...prev, race: v}))} options={mapOpts(C.RACES)} />
                  <FuturisticSelect label={t.gender} value={params.gender} onChange={(v) => setParams(prev => ({...prev, gender: v}))} options={mapOpts(C.GENDERS)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <FuturisticSelect label={t.age} value={params.age} onChange={(v) => setParams(prev => ({...prev, age: v}))} options={mapOpts(C.AGES)} />
                   <FuturisticSelect label={t.bodyType} value={params.bodyType} onChange={(v) => setParams(prev => ({...prev, bodyType: v}))} options={mapOpts(C.BODY_TYPES)} />
                </div>
                <FuturisticSelect label={t.role} value={params.role} onChange={(v) => setParams(prev => ({...prev, role: v}))} options={mapOpts(C.ROLES)} />
                <FuturisticSelect label={t.subRole} value={params.subRole} onChange={(v) => setParams(prev => ({...prev, subRole: v}))} options={mapOpts(C.ROLES)} />
              </div>

              {/* SECTION 2: VISUALS & EXPRESSION */}
              <div className="space-y-5">
                <div className="text-cyan-500 font-mono text-sm border-b border-slate-700 pb-2 mb-4">{t.secExpression}</div>
                <FuturisticSelect label={t.emotion} value={params.emotion} onChange={(v) => setParams(prev => ({...prev, emotion: v}))} options={mapOpts(C.EMOTIONS)} />
                {params.mode === 'video' ? (
                  <FuturisticSelect label={t.action} value={params.action} onChange={(v) => setParams(prev => ({...prev, action: v}))} options={mapOpts(C.ACTIONS_VIDEO)} />
                ) : (
                  <FuturisticSelect label={t.pose} value={params.pose} onChange={(v) => setParams(prev => ({...prev, pose: v}))} options={mapOpts(C.POSES_IMAGE)} />
                )}
                <FuturisticSelect label={t.style} value={params.style} onChange={(v) => setParams(prev => ({...prev, style: v}))} options={mapOpts(C.STYLES)} />
                <ColorPicker label={t.colors} selectedColors={params.colors} onChange={(colors) => setParams(prev => ({...prev, colors}))} />
              </div>

              {/* SECTION 3: COMPOSITION & TECH */}
              <div className="space-y-5">
                 <div className="text-cyan-500 font-mono text-sm border-b border-slate-700 pb-2 mb-4">{t.secVisuals}</div>
                 <div className="grid grid-cols-2 gap-3">
                    <FuturisticSelect label={t.framing} value={params.framing} onChange={(v) => setParams(prev => ({...prev, framing: v}))} options={mapOpts(C.FRAMINGS)} />
                    <FuturisticSelect label={t.lighting} value={params.lighting} onChange={(v) => setParams(prev => ({...prev, lighting: v}))} options={mapOpts(C.LIGHTINGS)} />
                 </div>
                 <FuturisticSelect label={t.atmosphere} value={params.atmosphere} onChange={(v) => setParams(prev => ({...prev, atmosphere: v}))} options={mapOpts(C.ATMOSPHERES)} />
                 <div className="grid grid-cols-2 gap-3">
                    <FuturisticSelect label={t.setting} value={params.setting} onChange={(v) => setParams(prev => ({...prev, setting: v}))} options={mapOpts(C.SETTINGS)} />
                    <FuturisticSelect label={t.background} value={params.background} onChange={(v) => setParams(prev => ({...prev, background: v}))} options={mapOpts(C.BACKGROUNDS)} />
                 </div>
                 <FuturisticSelect label={t.format} value={params.aspectRatio} onChange={(v) => setParams(prev => ({...prev, aspectRatio: v}))} options={C.ASPECT_RATIOS.map(ar => ({ label: ar.label, value: ar.value }))} />
              </div>
           </div>
           
           {/* DETAILS (FULL WIDTH) */}
           <div className="mt-6 border-t border-slate-800 pt-6">
              <FuturisticInput
                label={t.details}
                value={params.details}
                onChange={(v) => setParams(prev => ({...prev, details: v}))}
                placeholder={t.placeholderDetails}
                multiline={true}
              />
           </div>

           {/* --- LIVE PREVIEW BUFFER SECTION (IMPROVED) --- */}
           <div className="mt-8 bg-black/40 border border-slate-700 rounded-sm p-4 relative group hover:border-cyan-500/50 transition-colors">
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

           {/* ACTION BUTTONS - NEW ORDER */}
           <div className="mt-6 flex flex-col md:flex-row justify-center gap-4 items-center">
              
             {/* 1. AI ENHANCE BUTTON (STANDARD) */}
             <button
              onClick={handleGenerate}
              disabled={loadingState === LoadingState.LOADING}
              onMouseEnter={() => sfx.playHover()}
              className={`
                relative px-8 py-4 bg-transparent overflow-hidden group
                text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto
                border border-cyan-500/50 group-hover:border-cyan-400
              `}
             >
               <span className="absolute inset-0 w-full h-full bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
               <span className="relative z-10 flex items-center justify-center gap-3">
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

             {/* 2. PSYCHE PROTOCOL BUTTON (AI) - THE BIG ONE */}
             <button
              onClick={handleGenerateExpressions}
              disabled={loadingState === LoadingState.LOADING}
              onMouseEnter={() => sfx.playHover()}
              className={`
                relative px-12 py-5 bg-transparent overflow-hidden group
                text-amber-400 font-bold uppercase tracking-[0.2em] text-sm md:text-base transition-all
                disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto
                border border-amber-500/30 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]
              `}
             >
               <span className="absolute inset-0 w-full h-full bg-amber-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-500"></span>
               <span className="relative z-10 flex items-center justify-center gap-3">
                 {/* Face Icon */}
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

        {/* --- OUTPUT SECTION: PSYCHE PROTOCOL (AI) --- */}
        {expressionSheet && (
          <div id="expression-section" className="w-full mt-16 relative">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-amber-900/30 pb-4 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wider brand-font">
                   {t.psycheTitle}
                </h3>
                <button
                   onClick={handleCopyAllExpressions}
                   onMouseEnter={() => sfx.playHover()}
                   className="w-full md:w-auto text-sm md:text-base bg-amber-600/20 border border-amber-500 hover:bg-amber-500 hover:text-black text-amber-300 px-6 py-4 uppercase font-black tracking-widest transition-all rounded-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                   {copiedAllExpressions ? "COPIED!" : (params.promptFormat === 'midjourney' ? t.btnCopyAllMJ : t.btnCopyAllGen)}
                </button>
             </div>
             
             {/* 2x2 GRID FOR THE 4 SHEETS */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expressionSheet.map((item, idx) => (
                   <div key={idx} className="bg-slate-900/80 border border-amber-900/50 p-5 rounded-sm hover:border-amber-500 transition-colors group relative overflow-hidden flex flex-col h-full shadow-lg shadow-black/50">
                      
                      {/* Decoration */}
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-xs text-amber-400 font-black tracking-[0.2em] uppercase bg-amber-950/40 px-3 py-1 rounded-sm border border-amber-900/50">
                            {item.label}
                         </span>
                         <button
                            onClick={() => handleCopyMatrixItem(item.prompt, idx)} 
                            onMouseEnter={() => sfx.playHover()}
                            className="text-slate-500 hover:text-white transition-colors p-1"
                         >
                            {copiedMatrixIndex === idx ? (
                               <span className="text-green-400 text-xs font-bold flex items-center gap-1">COPIED <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                            ) : (
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            )}
                         </button>
                      </div>
                      
                      <div className="bg-black/40 p-3 rounded-sm border border-slate-800 flex-grow">
                          <p className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                             {item.prompt}
                          </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Output Section */}
        <TerminalOutput data={generatedData} loading={loadingState === LoadingState.LOADING} />

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/50 backdrop-blur-sm relative z-20 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="flex flex-col items-center md:items-start space-y-1">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-mono">
                {t.designedBy}
              </p>
              <h3 className="text-lg font-bold text-slate-300 font-mono tracking-tight hover:text-cyan-400 transition-colors cursor-default">
                Norberto Cuartero
              </h3>
              <a href="https://mistercuarter.es" target="_blank" className="text-cyan-600 text-xs hover:text-cyan-400 transition-colors font-mono">
                mistercuarter.es
              </a>
           </div>

           <div className="flex items-center gap-4">
              <SocialIcon href="https://instagram.com/MrCuarter" icon="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              <SocialIcon href="https://twitter.com/MrCuarter" icon="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              {/* LinkedIn Icon */}
              <SocialIcon href="https://es.linkedin.com/in/norberto-cuartero-toledo-9279a813b" icon="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h5v-8.306c0-4.613 5.432-5.17 5.432 0v8.306h5v-10.502c0-8.586-9.213-7.974-10.463-3.715v-2.089z" />
              <SocialIcon href="mailto:hola@mistercuarter.es" icon="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
           </div>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>
      </footer>
    </div>
  );
};

const SocialIcon: React.FC<{href: string, icon: string}> = ({href, icon}) => (
  <a href={href} target="_blank" 
     onMouseEnter={() => sfx.playHover()}
     className="w-10 h-10 flex items-center justify-center border border-slate-800 bg-slate-900 rounded-sm text-slate-500 hover:text-cyan-400 hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all group">
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d={icon}/>
    </svg>
  </a>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("CRITICAL: Root element not found.");
}