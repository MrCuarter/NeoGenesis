
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
  if (s.includes('photorealistic') || s.includes('cinematic') || s.includes('real')) {
    return "raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3";
  }
  if (s.includes('anime') || s.includes('ghibli') || s.includes('illustration')) {
    return "masterpiece, best quality, highly detailed, sharp lines, 4k, pixiv top tier";
  }
  if (s.includes('3d') || s.includes('pixar') || s.includes('render')) {
    return "unreal engine 5 render, octane render, 8k, raytracing, global illumination, 3d masterpiece";
  }
  // Default fallback
  return "masterpiece, best quality, ultra-detailed, sharp focus, 8k";
};

export const buildLocalPrompt = (params: CharacterParams): string => {
  const isMJ = params.promptFormat === 'midjourney';
  
  // --- 1. SUBJECT CONSTRUCTION ---
  const subjectAdjectives = joinParts([params.age, params.gender, params.race]);
  const roleStr = params.subRole ? `${params.role} (${params.subRole})` : params.role;
  
  let subjectSegment = `A ${subjectAdjectives} ${roleStr}`;
  if (params.skinTone) subjectSegment += `, ${params.skinTone}`;
  if (params.bodyType) subjectSegment += `, with a ${params.bodyType}`;
  if (params.details) subjectSegment += `, wearing ${params.details}`;

  // --- 2. ACTION & EMOTION ---
  let actionSegment = "";
  if (params.emotion) actionSegment += `looking ${params.emotion}`;
  
  const movement = params.mode === 'video' ? params.action : params.pose;
  if (movement) {
    actionSegment += actionSegment ? `, while ${movement}` : `while ${movement}`;
  }

  // --- 3. ENVIRONMENT & LIGHTING ---
  let envSegment = "";
  if (params.setting) envSegment += `in a ${params.setting}`;
  if (params.background && !params.background.includes("Detailed")) envSegment += `, with ${params.background}`;
  if (params.lighting) envSegment += `. The scene is illuminated by ${params.lighting}`;
  if (params.atmosphere) envSegment += `, creating a ${params.atmosphere}`;

  // --- 4. STYLE & TECHNICAL ---
  let styleSegment = "";
  if (params.style) styleSegment += `Artstyle: ${params.style}`;
  if (params.framing) styleSegment += `, shot as ${params.framing}`;
  
  if (params.colors.length > 0) {
    styleSegment += `. Dominant colors: ${params.colors.join(", ")}`;
  }

  // --- ASSEMBLY ---
  
  let finalPrompt = "";

  if (isMJ) {
    // --- MIDJOURNEY LOGIC ---
    // Uses specific commands like /imagine, --ar, --v
    const corePrompt = joinParts([subjectSegment, actionSegment, envSegment, styleSegment], ". ");
    finalPrompt = `/imagine prompt: ${corePrompt} ${params.aspectRatio} --v 6.0`;
    // Cleanup double periods
    finalPrompt = finalPrompt.replace(/\.\./g, ".").replace(/\s\./g, ".");
  } else {
    // --- GENERIC / STABLE DIFFUSION LOGIC ---
    // Uses natural language for AR, specific quality tags, comma separated
    const qualityTags = getQualityTags(params.style);
    const arDescription = getNaturalAspectRatio(params.aspectRatio);
    
    // Construct components array to ensure clean commas
    const components = [
      subjectSegment,
      actionSegment,
      envSegment,
      styleSegment,
      arDescription, // "cinematic 16:9" instead of "--ar 16:9"
      qualityTags
    ];

    finalPrompt = joinParts(components, ", ");
  }

  return finalPrompt;
};

/**
 * Generates 6 consistent prompts for a character sheet (Identity Matrix).
 * Forces white background and studio lighting for consistency.
 */
export const generateCharacterSheet = (baseParams: CharacterParams): { label: string, prompt: string }[] => {
  // We create a "Core" params object that overrides environment for consistency
  const coreParams = {
    ...baseParams,
    background: "Isolated on Solid White background",
    setting: "", // Remove setting to avoid distractions
    atmosphere: "Clear atmosphere",
    lighting: "Studio lighting",
    mode: 'image' as const
  };

  const variations = [
    { 
      label: "FRONT VIEW (REFERENCE)",
      overrides: { 
        pose: "Full body Front View, A-Pose, symmetrical", 
        framing: "Full Body",
        emotion: "Neutral expression"
      } 
    },
    { 
      label: "SIDE PROFILE",
      overrides: { 
        pose: "Full body Side Profile View", 
        framing: "Full Body",
        emotion: "Neutral expression"
      } 
    },
    { 
      label: "BACK VIEW",
      overrides: { 
        pose: "Full body Back View", 
        framing: "Full Body",
        emotion: ""
      } 
    },
    { 
      label: "THREE-QUARTER PORTRAIT",
      overrides: { 
        pose: "Standing confidently, 3/4 angle", 
        framing: "Medium Shot",
        emotion: baseParams.emotion || "Confident"
      } 
    },
    { 
      label: "CLOSE-UP (FACE)",
      overrides: { 
        pose: "Looking straight at camera", 
        framing: "Extreme close-up on face",
        emotion: baseParams.emotion || "Intense gaze"
      } 
    },
    { 
      label: "ACTION POSE",
      overrides: { 
        pose: "Dynamic Action Pose, Fighting Stance", 
        framing: "Full Body",
        emotion: "Determined" // Override emotion for action
      } 
    }
  ];

  return variations.map(v => {
    const params = { ...coreParams, ...v.overrides };
    return {
      label: v.label,
      prompt: buildLocalPrompt(params)
    };
  });
};
