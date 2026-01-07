
import React, { useState, useEffect } from 'react';
import { FuturisticSelect } from './components/FuturisticSelect';
import { FuturisticInput } from './components/FuturisticInput';
import { FuturisticToggle } from './components/FuturisticToggle';
import { ColorPicker } from './components/ColorPicker';
import { TerminalOutput } from './components/TerminalOutput';
import { QuickDesignWizard } from './components/QuickDesignWizard';
import { AssistantHud } from './components/AssistantHud';
import { HistorySidebar } from './components/HistorySidebar'; 
import { generatePrompt, generateExpressionSheet, generateInventoryPrompt } from './services/geminiService';
import { buildLocalPrompt } from './services/promptBuilder'; 
import { CharacterParams, GeneratedData, LoadingState, Language, ExpressionEntry } from './types';
import * as C from './constants';
import { sfx } from './services/audioEngine';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ES');
  const [isMuted, setIsMuted] = useState(false); 
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [crtMode, setCrtMode] = useState(true); 
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GeneratedData[]>([]);
  
  const [assistantMessage, setAssistantMessage] = useState("Sistemas en línea. Esperando input...");
  
  const [params, setParams] = useState<CharacterParams>({
    mode: 'image',
    promptFormat: 'generic', 
    designMode: 'quick', 
    
    // Identity
    race: '', gender: '', age: '', classCategory: 'fantasy', role: '', secondaryRole: '', subRole: '', bodyType: '',
    
    // Head & Face
    skinTone: '', skinColor: [], 
    hairStyle: '', hairColors: [],
    eyeFeature: '', eyeColors: [],
    denture: '', noseShape: '', faceMarkings: 'None',

    // Outfit
    headwear: '', upperBody: '', lowerBody: '', fullBody: '', footwear: '', 
    outfitColors: [],
    heldItem: '', classExtras: '',

    // Visuals & Tech
    style: '', setting: '', background: '', emotion: '', pose: '', action: '', 
    framing: '', lighting: '', atmosphere: '', colors: [], details: '', aspectRatio: '--ar 16:9',
  });

  const [livePrompt, setLivePrompt] = useState<string>('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [expressionSheet, setExpressionSheet] = useState<ExpressionEntry[] | null>(null);
  const [inventoryData, setInventoryData] = useState<GeneratedData | null>(null);
  const [copiedInventory, setCopiedInventory] = useState(false);
  const [copiedMatrixIndex, setCopiedMatrixIndex] = useState<number | null>(null);
  const [copiedAllExpressions, setCopiedAllExpressions] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('neo_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error("Corrupt history"); }
    }
  }, []);

  useEffect(() => {
    try {
      const prompt = buildLocalPrompt(params);
      setLivePrompt(prompt);
    } catch (e) {
      console.error("Error building prompt:", e);
    }
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
    setIsTutorialMode(!isTutorialMode);
    sfx.playClick();
  };

  const addToHistory = (data: GeneratedData) => {
    const newItem = { ...data, timestamp: Date.now(), modelParams: params };
    const newHistory = [newItem, ...history].slice(0, 20);
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

  const validateParams = () => {
     if (!params.race && !params.role && !params.details) {
      setErrorMsg(lang === 'ES' ? "Faltan datos esenciales (Raza/Rol)." : "Missing essential data (Race/Role).");
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
    return true;
  };

  const handleGenerateExpressions = async () => {
      sfx.playClick(); if (!validateParams()) return;
      setLoadingState(LoadingState.LOADING); setGeneratedData(null); setExpressionSheet(null); setInventoryData(null); setErrorMsg(null);
      try {
          const sheet = await generateExpressionSheet(params);
          setExpressionSheet(sheet); setLoadingState(LoadingState.SUCCESS); sfx.playSuccess();
          setTimeout(() => document.getElementById('expression-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (error) { console.error(error); setErrorMsg("API Error (Check Console)"); setLoadingState(LoadingState.ERROR); }
  };

  const handleGenerateInventory = async () => {
      sfx.playClick(); if (!validateParams()) return;
      setLoadingState(LoadingState.LOADING); setInventoryData(null); setErrorMsg(null);
      try {
          const result = await generateInventoryPrompt(params);
          setInventoryData(result); setLoadingState(LoadingState.SUCCESS); sfx.playSuccess();
          setTimeout(() => document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (error) { setErrorMsg("API Error (Check Console)"); setLoadingState(LoadingState.ERROR); }
  };

  const handleGenerate = async () => {
      sfx.playClick(); if (!validateParams()) return;
      setLoadingState(LoadingState.LOADING); setErrorMsg(null); setGeneratedData(null); setExpressionSheet(null); setInventoryData(null);
      try {
          const result = await generatePrompt(params);
          setGeneratedData(result); addToHistory(result); setLoadingState(LoadingState.SUCCESS); sfx.playSuccess();
      } catch (error) { setErrorMsg("API Error (Check Console)"); setLoadingState(LoadingState.ERROR); }
  };

  const handleCopyMatrixItem = (text: string, index: number) => {
    sfx.playClick(); navigator.clipboard.writeText(text); setCopiedMatrixIndex(index); setTimeout(() => setCopiedMatrixIndex(null), 1500);
  };

  const handleCopyInventory = () => {
      if (!inventoryData) return;
      sfx.playClick(); navigator.clipboard.writeText(inventoryData.prompt); setCopiedInventory(true); setTimeout(() => setCopiedInventory(false), 2000);
  };

  const handleCopyAllExpressions = () => {
    sfx.playClick(); if (!expressionSheet) return;
    const isMJ = params.promptFormat === 'midjourney';
    let intro = isMJ ? "Here is a list of 5 Midjourney prompts (including Token and Victory)...\n\n" : "Act as an expert image generator. Create a Character Design Kit...\n\n";
    const body = expressionSheet.map((item, i) => `👇 IMAGE ${i + 1}: [${item.label}]\n${item.prompt}`).join("\n\n" + "-".repeat(40) + "\n\n");
    navigator.clipboard.writeText(intro + body); setCopiedAllExpressions(true); setTimeout(() => setCopiedAllExpressions(false), 2000);
  };
  
  // ELITE PRESET
  const handleElitePreset = () => {
    sfx.playClick();
    const randomPreset = C.PRESETS[Math.floor(Math.random() * C.PRESETS.length)];
    setParams(prev => ({ ...prev, ...randomPreset.params as any, designMode: 'advanced' }));
    help("Agente Élite desplegado.", "Elite Agent deployed.");
  };

  // GENOME EXPERIMENT
  const getRandom = (arr: any[]) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)].value : '';
  const getRandomColors = (count: number) => Array.from({length: count}, () => C.SKIN_TONES[Math.floor(Math.random() * C.SKIN_TONES.length)].value); // Fallback color gen

  const handleRandomize = () => {
    sfx.playClick();
    const isVideo = Math.random() > 0.5;
    const isFantasy = Math.random() > 0.4;
    setParams(prev => ({
      ...prev,
      designMode: 'advanced', mode: isVideo ? 'video' : 'image', classCategory: isFantasy ? 'fantasy' : 'realistic',
      race: getRandom(C.RACES), gender: getRandom(C.GENDERS), age: getRandom(C.AGES), skinTone: getRandom(C.SKIN_TONES),
      role: isFantasy ? getRandom(C.ROLES_FANTASY) : getRandom(C.ROLES_REALISTIC), secondaryRole: Math.random() > 0.7 ? getRandom(C.ROLES_FANTASY) : '',
      
      // Physical
      hairStyle: getRandom(C.HAIR_STYLES), hairColors: [], eyeFeature: getRandom(C.EYE_FEATURES), eyeColors: [],
      denture: Math.random() > 0.8 ? getRandom(C.DENTURES) : '', noseShape: getRandom(C.NOSE_SHAPES), faceMarkings: Math.random() > 0.7 ? getRandom(C.FACE_MARKINGS) : 'None',

      // Outfit
      headwear: Math.random() > 0.8 ? getRandom(C.HEADWEAR) : '', 
      fullBody: Math.random() > 0.8 ? getRandom(C.FULL_BODY) : '',
      upperBody: getRandom(C.UPPER_BODY), lowerBody: getRandom(C.LOWER_BODY), footwear: getRandom(C.FOOTWEAR),
      heldItem: Math.random() > 0.6 ? getRandom(C.HELD_ITEMS) : '',
      classExtras: Math.random() > 0.6 ? getRandom(C.CLASS_EXTRAS) : '',
      outfitColors: [],

      style: getRandom(C.STYLES), setting: getRandom(C.SETTINGS), background: Math.random() > 0.8 ? getRandom(C.BACKGROUNDS) : '',
      emotion: getRandom(C.EMOTIONS), pose: isVideo ? '' : getRandom(C.POSES_IMAGE), action: isVideo ? getRandom(C.ACTIONS_VIDEO) : '',
      framing: getRandom(C.FRAMINGS), lighting: getRandom(C.LIGHTINGS), atmosphere: getRandom(C.ATMOSPHERES), aspectRatio: getRandom(C.ASPECT_RATIOS),
    }));
    help("Mutación aleatoria completada.", "Random mutation completed.");
  };

  const mapOpts = (list: any[]) => list ? list.map(item => ({ label: lang === 'ES' ? item.es : item.en, value: item.value })) : [];

  return (
    <div className="min-h-screen w-full bg-[#030712] relative overflow-x-hidden selection:bg-cyan-500 selection:text-black flex flex-col font-sans">
      
      {crtMode && <div className="fixed inset-0 z-[999] pointer-events-none mix-blend-screen opacity-60"><div className="crt-overlay absolute inset-0"></div><div className="scanline absolute inset-0"></div></div>}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black -z-10"></div>
      
      <HistorySidebar isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} onSelect={(item) => { setGeneratedData(item); if (item.modelParams) setParams(item.modelParams as any); }} onClear={clearHistory} lang={lang} />
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
         <button onClick={toggleCrt} className="bg-slate-900 border border-cyan-500 text-cyan-400 px-2 py-1 text-xs font-mono">CRT_FX</button>
         <button onClick={() => setShowHistory(true)} className="bg-slate-900 border border-amber-500 text-amber-400 px-2 py-1 text-xs font-mono">MEMORY</button>
         <button onClick={() => setLang(l => l === 'ES' ? 'EN' : 'ES')} className="bg-slate-900 border border-slate-600 text-white px-2 py-1 text-xs font-mono">{lang}</button>
      </div>

      <div className="flex-grow max-w-[1400px] mx-auto px-4 py-8 md:py-16 relative z-10 w-full mt-12">
        <header className="mb-8 text-center relative">
           <h1 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-tighter mb-4 brand-font">NEOGENESIS v7.0</h1>
           <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={handleElitePreset} className="border border-cyan-500 text-cyan-400 px-6 py-2 uppercase text-sm tracking-widest hover:bg-cyan-900/30 transition-all font-bold">ELITE AGENT</button>
              <button onClick={handleRandomize} className="border border-purple-500 text-purple-400 px-6 py-2 uppercase text-sm tracking-widest hover:bg-purple-900/30 transition-all font-bold">GENOME CHAOS</button>
           </div>
        </header>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
            <FuturisticToggle leftLabel="QUICK MODE" rightLabel="ADVANCED MODE" value={params.designMode} leftValue="quick" rightValue="advanced" onChange={(v) => setParams(prev => ({...prev, designMode: v}))} />
            <FuturisticToggle leftLabel="IMAGE GEN" rightLabel="VIDEO GEN" value={params.mode} leftValue="image" rightValue="video" onChange={(v) => setParams(prev => ({...prev, mode: v}))} />
            <FuturisticToggle leftLabel="MIDJOURNEY" rightLabel="GENERIC AI" value={params.promptFormat} leftValue="midjourney" rightValue="generic" onChange={(v) => setParams(prev => ({...prev, promptFormat: v}))} />
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-lg relative min-h-[600px] shadow-2xl">
           
           {params.designMode === 'quick' ? (
               <QuickDesignWizard lang={lang} params={params} setParams={setParams} onComplete={() => document.querySelector('#generate-controls')?.scrollIntoView({ behavior: 'smooth' })} />
           ) : (
               /* --- ADVANCED MODE: NEW GRID LAYOUT --- */
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 animate-fade-in">
                  
                  {/* COL 1: CORE IDENTITY */}
                  <div className="space-y-4 border-b xl:border-b-0 xl:border-r border-slate-800 pb-4 xl:pb-0 xl:pr-4">
                    <div className="flex items-center gap-2 border-b border-cyan-900 pb-2 mb-4">
                        <span className="text-cyan-500 font-mono text-xl font-bold">01</span>
                        <h3 className="text-slate-300 font-brand tracking-widest text-sm uppercase">Core Identity</h3>
                    </div>
                    
                    <FuturisticSelect label="Especie / Raza" value={params.race} onChange={(v) => setParams(prev => ({...prev, race: v}))} options={mapOpts(C.RACES)} />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <FuturisticSelect label="Género" value={params.gender} onChange={(v) => setParams(prev => ({...prev, gender: v}))} options={mapOpts(C.GENDERS)} />
                        <FuturisticSelect label="Edad" value={params.age} onChange={(v) => setParams(prev => ({...prev, age: v}))} options={mapOpts(C.AGES)} />
                    </div>
                    
                    <FuturisticSelect label="Constitución" value={params.bodyType} onChange={(v) => setParams(prev => ({...prev, bodyType: v}))} options={mapOpts(C.BODY_TYPES)} />
                    
                    <div className="pt-2 border-t border-slate-800/50">
                        <label className="text-purple-400 text-xs uppercase tracking-widest font-semibold block mb-2">Clase & Rol</label>
                        <FuturisticToggle 
                            leftLabel="FANTASY" rightLabel="REALISTIC" 
                            value={params.classCategory} leftValue="fantasy" rightValue="realistic" 
                            onChange={(v) => setParams(prev => ({...prev, classCategory: v, role: ''}))} 
                        />
                        <div className="mt-2">
                            <FuturisticSelect label="Rol Principal" value={params.role} onChange={(v) => setParams(prev => ({...prev, role: v}))} options={mapOpts(params.classCategory === 'realistic' ? C.ROLES_REALISTIC : C.ROLES_FANTASY)} />
                            <div className="mt-2">
                                <FuturisticSelect label="Subclase (Hybrid)" value={params.secondaryRole} onChange={(v) => setParams(prev => ({...prev, secondaryRole: v}))} options={mapOpts(params.classCategory === 'realistic' ? C.ROLES_REALISTIC : C.ROLES_FANTASY)} />
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* COL 2: HEAD & FACE (Symmetric Color Pickers) */}
                  <div className="space-y-4 border-b xl:border-b-0 xl:border-r border-slate-800 pb-4 xl:pb-0 xl:pr-4">
                    <div className="flex items-center gap-2 border-b border-cyan-900 pb-2 mb-4">
                        <span className="text-cyan-500 font-mono text-xl font-bold">02</span>
                        <h3 className="text-slate-300 font-brand tracking-widest text-sm uppercase">Face & Head</h3>
                    </div>

                    {/* Skin: w-20 to match Hair */}
                    <div className="flex gap-2 items-end">
                         <div className="flex-grow">
                            <FuturisticSelect label="Piel (Tono)" value={params.skinTone} onChange={(v) => setParams(prev => ({...prev, skinTone: v}))} options={mapOpts(C.SKIN_TONES)} />
                         </div>
                         <div className="w-20">
                             <ColorPicker label="2 Tones" selectedColors={params.skinColor} onChange={(c) => setParams(prev => ({...prev, skinColor: c}))} maxColors={2} />
                         </div>
                    </div>

                    {/* Hair */}
                    <div className="flex gap-2 items-end">
                        <div className="flex-grow">
                             <FuturisticSelect label="Estilo Pelo" value={params.hairStyle} onChange={(v) => setParams(prev => ({...prev, hairStyle: v}))} options={mapOpts(C.HAIR_STYLES)} />
                        </div>
                        <div className="w-20">
                             <ColorPicker label="2 Tones" selectedColors={params.hairColors} onChange={(c) => setParams(prev => ({...prev, hairColors: c}))} maxColors={2} />
                        </div>
                    </div>

                    {/* Eyes: w-20 to match others */}
                    <div className="flex gap-2 items-end">
                        <div className="flex-grow">
                             <FuturisticSelect label="Rasgo Ojos" value={params.eyeFeature} onChange={(v) => setParams(prev => ({...prev, eyeFeature: v}))} options={mapOpts(C.EYE_FEATURES)} />
                        </div>
                        <div className="w-20">
                             <ColorPicker label="2 Tones" selectedColors={params.eyeColors} onChange={(c) => setParams(prev => ({...prev, eyeColors: c}))} maxColors={2} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/50">
                        <FuturisticSelect label="Nariz" value={params.noseShape} onChange={(v) => setParams(prev => ({...prev, noseShape: v}))} options={mapOpts(C.NOSE_SHAPES)} />
                        <FuturisticSelect label="Dientes" value={params.denture} onChange={(v) => setParams(prev => ({...prev, denture: v}))} options={mapOpts(C.DENTURES)} />
                    </div>
                    <FuturisticSelect label="Marcas Faciales" value={params.faceMarkings} onChange={(v) => setParams(prev => ({...prev, faceMarkings: v}))} options={mapOpts(C.FACE_MARKINGS)} />
                  </div>

                  {/* COL 3: OUTFIT & GEAR */}
                  <div className="space-y-4 border-b xl:border-b-0 xl:border-r border-slate-800 pb-4 xl:pb-0 xl:pr-4">
                    <div className="flex items-center gap-2 border-b border-cyan-900 pb-2 mb-4">
                        <span className="text-cyan-500 font-mono text-xl font-bold">03</span>
                        <h3 className="text-slate-300 font-brand tracking-widest text-sm uppercase">Outfit & Gear</h3>
                    </div>

                    {/* Clean Color Picker */}
                    <div className="mb-4">
                         <ColorPicker label="Colores de Equipo (Principal & Secundario)" selectedColors={params.outfitColors} onChange={(c) => setParams(prev => ({...prev, outfitColors: c}))} maxColors={2} />
                    </div>

                    <FuturisticSelect label="Cabeza / Casco" value={params.headwear} onChange={(v) => setParams(prev => ({...prev, headwear: v}))} options={mapOpts(C.HEADWEAR)} />
                    
                    <div className="my-2 border-l-2 border-cyan-500/30 pl-2">
                        <FuturisticSelect label="Traje Completo" value={params.fullBody} onChange={(v) => setParams(prev => ({...prev, fullBody: v}))} options={mapOpts(C.FULL_BODY)} />
                        {!params.fullBody && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FuturisticSelect label="Superior" value={params.upperBody} onChange={(v) => setParams(prev => ({...prev, upperBody: v}))} options={mapOpts(C.UPPER_BODY)} />
                                <FuturisticSelect label="Inferior" value={params.lowerBody} onChange={(v) => setParams(prev => ({...prev, lowerBody: v}))} options={mapOpts(C.LOWER_BODY)} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <FuturisticSelect label="Calzado" value={params.footwear} onChange={(v) => setParams(prev => ({...prev, footwear: v}))} options={mapOpts(C.FOOTWEAR)} />
                        <FuturisticSelect label="Extra Clase" value={params.classExtras} onChange={(v) => setParams(prev => ({...prev, classExtras: v}))} options={mapOpts(C.CLASS_EXTRAS)} />
                    </div>
                    <FuturisticSelect label="Item en Mano" value={params.heldItem} onChange={(v) => setParams(prev => ({...prev, heldItem: v}))} options={mapOpts(C.HELD_ITEMS)} />
                  </div>

                  {/* COL 4: STYLE & VIBES */}
                  <div className="space-y-4 border-b xl:border-b-0 xl:border-r border-slate-800 pb-4 xl:pb-0 xl:pr-4">
                     <div className="flex items-center gap-2 border-b border-cyan-900 pb-2 mb-4">
                        <span className="text-cyan-500 font-mono text-xl font-bold">04</span>
                        <h3 className="text-slate-300 font-brand tracking-widest text-sm uppercase">Style & Vibe</h3>
                    </div>
                     <FuturisticSelect label="Estilo Artístico" value={params.style} onChange={(v) => setParams(prev => ({...prev, style: v}))} options={mapOpts(C.STYLES)} />
                     <FuturisticSelect label="Emoción" value={params.emotion} onChange={(v) => setParams(prev => ({...prev, emotion: v}))} options={mapOpts(C.EMOTIONS)} />
                     <FuturisticSelect label="Pose / Acción" value={params.pose} onChange={(v) => setParams(prev => ({...prev, pose: v}))} options={mapOpts(C.POSES_IMAGE)} />
                     
                     <div className="mt-4 pt-4 border-t border-slate-800">
                        <ColorPicker label="Paleta Global (Ambiente)" selectedColors={params.colors} onChange={(c) => setParams(prev => ({...prev, colors: c}))} />
                     </div>
                  </div>
                  
                  {/* COL 5: ENVIRONMENT & RENDER */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 border-b border-cyan-900 pb-2 mb-4">
                        <span className="text-cyan-500 font-mono text-xl font-bold">05</span>
                        <h3 className="text-slate-300 font-brand tracking-widest text-sm uppercase">World & Render</h3>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <FuturisticSelect label="Lugar" value={params.setting} onChange={(v) => setParams(prev => ({...prev, setting: v}))} options={mapOpts(C.SETTINGS)} />
                        <FuturisticSelect label="Atmósfera" value={params.atmosphere} onChange={(v) => setParams(prev => ({...prev, atmosphere: v}))} options={mapOpts(C.ATMOSPHERES)} />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <FuturisticSelect label="Iluminación" value={params.lighting} onChange={(v) => setParams(prev => ({...prev, lighting: v}))} options={mapOpts(C.LIGHTINGS)} />
                        <FuturisticSelect label="Encuadre" value={params.framing} onChange={(v) => setParams(prev => ({...prev, framing: v}))} options={mapOpts(C.FRAMINGS)} />
                     </div>
                     <FuturisticSelect label="Aspect Ratio" value={params.aspectRatio} onChange={(v) => setParams(prev => ({...prev, aspectRatio: v}))} options={C.ASPECT_RATIOS} />
                  </div>

                   {/* FULL WIDTH DETAILS */}
                   <div className="col-span-1 md:col-span-2 xl:col-span-5 mt-4 pt-4 border-t border-slate-700">
                      <FuturisticInput label="Detalles Específicos (Escribe libremente...)" value={params.details} onChange={(v) => setParams(prev => ({...prev, details: v}))} placeholder="Ej: Cicatriz brillante en forma de rayo, espada con runas azules..." multiline />
                   </div>
               </div>
           )}

           {/* --- CONTROLS SECTION --- */}
           <div className="mt-8 p-4 bg-black/50 border-l-4 border-cyan-500 rounded-sm" id="generate-controls">
                <div className="flex justify-between mb-2">
                    <span className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase animate-pulse">Live Prompt Buffer</span>
                    <button onClick={handleCopyLive} className="text-[10px] bg-cyan-900/40 hover:bg-cyan-500 hover:text-black text-cyan-300 px-2 py-1 uppercase font-bold transition-all">{copiedLive ? 'COPIED!' : 'COPY RAW'}</button>
                </div>
                <div className="font-mono text-sm text-slate-300 min-h-[50px] whitespace-pre-wrap">{livePrompt}</div>
           </div>

           <div className="mt-6 flex flex-col md:flex-row gap-4">
               <button onClick={handleGenerate} className="flex-1 bg-cyan-600/20 border border-cyan-500 text-cyan-400 py-4 font-bold tracking-[0.2em] hover:bg-cyan-500 hover:text-black transition-all rounded-sm uppercase flex items-center justify-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">Mejorar descripción con IA</span>
               </button>
               <button onClick={handleGenerateInventory} className="flex-1 bg-emerald-600/20 border border-emerald-500 text-emerald-400 py-4 font-bold tracking-[0.2em] hover:bg-emerald-500 hover:text-black transition-all rounded-sm uppercase flex items-center justify-center gap-2 group">
                   <span className="group-hover:translate-x-1 transition-transform">Generate Inventory</span>
               </button>
               <button onClick={handleGenerateExpressions} className="flex-1 bg-amber-600/20 border border-amber-500 text-amber-400 py-4 font-bold tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all rounded-sm uppercase flex items-center justify-center gap-2 group">
                   <span className="group-hover:translate-x-1 transition-transform">Psyche Protocol (Sheets)</span>
               </button>
           </div>
           
           {errorMsg && <div className="mt-4 text-red-500 text-center font-mono bg-red-950/20 border border-red-900/50 p-2">{errorMsg}</div>}
        </div>

        {/* OUTPUT: INVENTORY */}
        {inventoryData && (
             <div id="inventory-section" className="mt-12 p-8 bg-slate-900/90 border-t-2 border-emerald-500 rounded-sm animate-slide-up relative shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <button onClick={handleCopyInventory} className="absolute top-4 right-4 text-emerald-500 border border-emerald-500/50 px-4 py-2 text-xs hover:bg-emerald-500 hover:text-black transition-colors uppercase font-bold tracking-widest">{copiedInventory ? 'COPIED' : 'COPY PROMPT'}</button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-900/50 flex items-center justify-center border border-emerald-500 rounded-full">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                    <div>
                        <h3 className="text-emerald-400 font-brand text-2xl tracking-widest uppercase">Inventory Cache</h3>
                        <p className="text-slate-500 text-xs font-mono">ASSET GENERATION COMPLETE</p>
                    </div>
                </div>
                <div className="bg-black/40 p-6 rounded border border-emerald-900/30">
                    <p className="font-mono text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{inventoryData.prompt}</p>
                </div>
             </div>
        )}

        {/* OUTPUT: PSYCHE SHEETS */}
        {expressionSheet && (
             <div id="expression-section" className="mt-16 animate-slide-up">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-amber-900/50 pb-4">
                     <div>
                        <h3 className="text-amber-400 font-brand text-3xl tracking-widest uppercase mb-1">Psyche Protocol</h3>
                        <p className="text-slate-500 text-xs font-mono uppercase">Character Design Kit v6.0</p>
                     </div>
                     <button onClick={handleCopyAllExpressions} className="mt-4 md:mt-0 text-amber-400 border border-amber-500/50 px-6 py-3 hover:bg-amber-500 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest">{copiedAllExpressions ? 'ALL COPIED' : 'COPY ALL SHEETS'}</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {expressionSheet.map((item, i) => (
                         <div key={i} className="bg-slate-900/60 border border-amber-900/30 p-6 rounded-sm hover:border-amber-500/50 transition-colors relative group">
                             <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => handleCopyMatrixItem(item.prompt, i)} className="text-amber-500 hover:text-white text-xs uppercase font-bold tracking-wider">{copiedMatrixIndex === i ? 'COPIED' : 'COPY'}</button>
                             </div>
                             <div className="mb-4">
                                 <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] bg-amber-950/30 px-2 py-1 rounded border border-amber-900/50">{item.label}</span>
                             </div>
                             <p className="text-xs text-slate-300 font-mono leading-relaxed border-l-2 border-amber-900/50 pl-4 group-hover:border-amber-500 transition-colors">{item.prompt}</p>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        <TerminalOutput data={generatedData} loading={loadingState === LoadingState.LOADING} format={params.promptFormat} />
      </div>

      <AssistantHud isActive={isTutorialMode} message={assistantMessage} onClose={toggleTutorial} />
    </div>
  );
};

export default App;
