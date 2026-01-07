
import { CharacterParams } from "../types";

// Helper to ensure we don't add empty strings or double spaces
const joinParts = (parts: (string | undefined | null)[], separator: string = " ") => {
  return parts.filter(p => p && p.trim() !== "").join(separator).trim();
};

// Traductor de Aspect Ratio técnico (--ar) a Lenguaje Natural para Generic Mode
const getNaturalAspectRatio = (arParam: string): string => {
  if (arParam.includes('16:9')) return "cinematic widescreen 16:9 format";
  if (arParam.includes('1:1')) return "square 1:1 format, centered composition";
  if (arParam.includes('9:16')) return "vertical mobile 9:16 format, tall aspect ratio";
  if (arParam.includes('4:5')) return "vertical portrait 4:5 format";
  if (arParam.includes('4:3')) return "classic TV 4:3 format";
  if (arParam.includes('21:9')) return "ultrawide panoramic 21:9 format";
  return "";
};

// Tags de calidad adaptativos según el estilo visual
const getQualityTags = (style: string): string => {
  const s = style.toLowerCase();
  if (s.includes('photorealistic') || s.includes('cinematic') || s.includes('real') || s.includes('gothic')) {
    return "raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, intricate details";
  }
  if (s.includes('anime') || s.includes('ghibli') || s.includes('illustration') || s.includes('arcane')) {
    return "masterpiece, best quality, highly detailed, sharp lines, 4k, pixiv top tier, trending on artstation";
  }
  if (s.includes('3d') || s.includes('pixar') || s.includes('render') || s.includes('fortnite')) {
    return "unreal engine 5 render, octane render, 8k, raytracing, global illumination, 3d masterpiece";
  }
  // Default fallback
  return "masterpiece, best quality, ultra-detailed, sharp focus, 8k";
};

// Helper: Formats color arrays nicely
const formatColors = (colors: string[]) => {
    if (!colors || colors.length === 0) return "";
    if (colors.length === 1) return colors[0];
    return `two-toned ${colors[0]} and ${colors[1]}`;
};

const ELITE_PREAMBLE = `You have to act as an elite AI image generation engine specialized in cinematic, high-end visual art.
Interpret my prompts literally and with maximum artistic precision.
Prioritize visual coherence, dramatic composition, lighting quality, atmosphere, and texture detail.
Render with professional photography standards and production-grade realism.
Always aim for masterpiece-level output.
Do not simplify. Do not stylize arbitrarily. Do not censor artistic intent.
Execute exactly what is described.`;

export const buildLocalPrompt = (params: CharacterParams): string => {
  const isMJ = params.promptFormat === 'midjourney';
  
  // --- 1. SUBJECT IDENTITY ---
  const subjectAdjectives = joinParts([params.age, params.gender, params.race]);
  
  // Role
  let roleStr = params.role;
  if (params.secondaryRole) {
      roleStr = `${params.role} / ${params.secondaryRole} Hybrid`;
  }
  if (params.subRole) {
      roleStr += ` (${params.subRole})`;
  }
  
  let subjectSegment = `A ${subjectAdjectives} ${roleStr}`;
  
  // --- 2. PHYSICAL TRAITS ---
  const physicalTraits = [];
  
  // Skin (Updated for 2 colors)
  const skinColorStr = formatColors(params.skinColor);
  let skinDesc = params.skinTone;
  if (skinColorStr) {
      skinDesc = `${skinColorStr} ${skinDesc || 'skin'}`;
  } else if (skinDesc) {
      skinDesc = `${skinDesc}`;
  }
  if (skinDesc) physicalTraits.push(`with ${skinDesc}`);
  
  // Hair
  const hairColorsStr = formatColors(params.hairColors);
  if (params.hairStyle) {
      physicalTraits.push(`has ${hairColorsStr} ${params.hairStyle} hair`);
  } else if (hairColorsStr) {
      physicalTraits.push(`has ${hairColorsStr} hair`);
  }
  
  // Eyes (Updated for 2 colors)
  const eyeColorStr = formatColors(params.eyeColors);
  let eyeDesc = params.eyeFeature;
  if (eyeColorStr) {
      eyeDesc = `${eyeColorStr} ${eyeDesc || 'eyes'}`;
  } else if (eyeDesc) {
      eyeDesc = `${eyeDesc}`;
  }
  if (eyeDesc) physicalTraits.push(`${eyeDesc}`);

  // Face
  if (params.denture) physicalTraits.push(`${params.denture}`);
  if (params.noseShape) physicalTraits.push(`${params.noseShape}`);
  if (params.faceMarkings && params.faceMarkings !== 'None') physicalTraits.push(`${params.faceMarkings}`);
  if (params.bodyType) physicalTraits.push(`${params.bodyType}`);

  // Combine traits
  if (physicalTraits.length > 0) {
      subjectSegment += `, ${physicalTraits.join(", ")}`;
  }

  // --- 3. OUTFIT & EQUIPMENT ---
  const outfitParts = [];
  
  // Outfit Colors context
  const outfitColorStr = formatColors(params.outfitColors);
  const colorPrefix = outfitColorStr ? `colored in ${outfitColorStr}` : "";

  if (params.headwear && params.headwear !== 'None') outfitParts.push(`wearing a ${params.headwear}`);
  
  // Body Gear
  if (params.fullBody) {
      outfitParts.push(`dressed in a ${params.fullBody}`);
  } else {
      const parts = [];
      if (params.upperBody) parts.push(`a ${params.upperBody}`);
      if (params.lowerBody) parts.push(`${params.lowerBody}`);
      if (parts.length > 0) outfitParts.push(`wearing ${parts.join(" and ")}`);
  }
  
  if (params.footwear) outfitParts.push(`with ${params.footwear}`);
  
  // Class Extra
  if (params.classExtras) outfitParts.push(`equipped with ${params.classExtras}`);
  
  // Assembly Outfit
  let outfitSegment = outfitParts.join(", ");
  if (colorPrefix && outfitSegment) {
      outfitSegment = `${outfitSegment} (${colorPrefix})`;
  }
  
  // Held Item
  if (params.heldItem && params.heldItem !== 'Nothing') {
      outfitSegment += outfitSegment ? `, holding a ${params.heldItem}` : `holding a ${params.heldItem}`;
  }

  // --- 4. ACTION & EMOTION ---
  let actionSegment = "";
  if (params.emotion) actionSegment += `looking ${params.emotion}`;
  
  const movement = params.mode === 'video' ? params.action : params.pose;
  if (movement) {
    actionSegment += actionSegment ? `, while ${movement}` : `while ${movement}`;
  }

  // --- 5. ENVIRONMENT & LIGHTING ---
  let envSegment = "";
  if (params.setting) envSegment += `in a ${params.setting}`;
  if (params.background && !params.background.includes("Detailed")) envSegment += `, with ${params.background}`;
  if (params.lighting) envSegment += `. The scene is illuminated by ${params.lighting}`;
  if (params.atmosphere) envSegment += `, creating a ${params.atmosphere}`;

  // --- 6. STYLE & TECHNICAL ---
  let styleSegment = "";
  if (params.style) styleSegment += `Artstyle: ${params.style}`;
  if (params.framing) styleSegment += `, shot as ${params.framing}`;
  if (params.details) styleSegment += `. Extra details: ${params.details}`;
  
  if (params.colors.length > 0) {
    styleSegment += `. Overall Palette: ${params.colors.join(", ")}`;
  }

  // --- ASSEMBLY ---
  
  let finalPrompt = "";

  if (isMJ) {
    // --- MIDJOURNEY LOGIC ---
    const corePrompt = joinParts([subjectSegment, outfitSegment, actionSegment, envSegment, styleSegment], ". ");
    finalPrompt = `/imagine prompt: ${corePrompt} ${params.aspectRatio} --v 6.0`;
    // Cleanup double periods
    finalPrompt = finalPrompt.replace(/\.\./g, ".").replace(/\s\./g, ".");
  } else {
    // --- GENERIC / STABLE DIFFUSION LOGIC ---
    const qualityTags = getQualityTags(params.style);
    const arDescription = getNaturalAspectRatio(params.aspectRatio);
    
    // Construct components array to ensure clean commas
    const components = [
      subjectSegment,
      outfitSegment,
      actionSegment,
      envSegment,
      styleSegment,
      arDescription, 
      qualityTags
    ];

    finalPrompt = joinParts(components, ", ");
  }

  // Inject the Elite Preamble
  return `${ELITE_PREAMBLE}\n\n${finalPrompt}`;
};
