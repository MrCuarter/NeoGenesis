
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterParams, GeneratedData, ExpressionEntry } from "../types";

const modelId = "gemini-2.5-flash";

// El bloque de texto que debe ir SIEMPRE al principio del prompt final (Elite Engine)
const ELITE_PREAMBLE = `You have to act as an elite AI image generation engine specialized in cinematic, high-end visual art.
Interpret my prompts literally and with maximum artistic precision.
Prioritize visual coherence, dramatic composition, lighting quality, atmosphere, and texture detail.
Render with professional photography standards and production-grade realism.
Always aim for masterpiece-level output.
Do not simplify. Do not stylize arbitrarily. Do not censor artistic intent.
Execute exactly what is described.`;

// Helper para obtener la instancia de IA de forma segura
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === "") {
    console.error("DEBUG: La API Key es inválida.");
    throw new Error("API Key no configurada.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- HELPER: CONSTRUCCIÓN DE DATOS COMUNES ---
const buildInputData = (params: CharacterParams, isVideo: boolean) => {
  const physParts = [];
  
  const hairC = params.hairColors?.join(" & ");
  if (params.hairStyle) physParts.push(`${hairC || ''} ${params.hairStyle} hair`);
  
  const eyeC = params.eyeColors?.join(" & ");
  const eyeF = params.eyeFeature || "eyes";
  physParts.push(`${eyeC || ''} ${eyeF}`);
  
  const skinC = params.skinColor?.join(" & ");
  if (skinC) physParts.push(`${skinC} colored skin`);
  else if (params.skinTone) physParts.push(`${params.skinTone}`);

  if (params.faceMarkings && params.faceMarkings !== 'None') physParts.push(`${params.faceMarkings}`);
  if (params.denture) physParts.push(`Dentures: ${params.denture}`);
  
  const outfitParts = [];
  const outfitC = params.outfitColors?.join(" & ");
  const colorContext = outfitC ? `(Palette: ${outfitC})` : "";

  if (params.headwear && params.headwear !== 'None') outfitParts.push(`Headwear: ${params.headwear}`);
  
  if (params.fullBody) outfitParts.push(`Attire: ${params.fullBody}`);
  else {
      if (params.upperBody) outfitParts.push(`Upper: ${params.upperBody}`);
      if (params.lowerBody) outfitParts.push(`Lower: ${params.lowerBody}`);
  }
  
  if (params.classExtras) outfitParts.push(`Accessory: ${params.classExtras}`);
  if (params.footwear) outfitParts.push(`Shoes: ${params.footwear}`);
  if (params.heldItem && params.heldItem !== 'Nothing') outfitParts.push(`Holding: ${params.heldItem}`);

  let roleDesc = params.role;
  if (params.secondaryRole) roleDesc += ` / ${params.secondaryRole}`;

  return `
    INPUT DATA:
    - Subject: ${params.race} ${roleDesc} (${params.classCategory})
    - Stats: ${params.gender}, ${params.age}, ${params.bodyType}
    - Physical: ${physParts.join(", ")}
    - Gear: ${outfitParts.join(", ")} ${colorContext}
    - Mood: ${params.emotion}
    - Action: ${isVideo ? params.action : params.pose}
    - Framing: ${params.framing}
    - Style: ${params.style}
    - Location: ${params.setting}
    - Ambience: ${params.atmosphere}, ${params.lighting}
    - Colors: ${params.colors.join(", ")}
    - Extra: ${params.details}
    - Aspect Ratio: ${params.aspectRatio}
    - Target Format: ${params.promptFormat === 'midjourney' ? 'Midjourney v6' : 'Generic/Stable Diffusion'}
  `;
};

export const generatePrompt = async (params: CharacterParams): Promise<GeneratedData> => {
  let ai;
  try {
    ai = getAI();
  } catch (e: any) {
    console.error("Failed to initialize AI:", e);
    throw new Error(e.message);
  }
  
  const isVideo = params.mode === 'video';
  const isMJ = params.promptFormat === 'midjourney';
  const inputData = buildInputData(params, isVideo);

  const systemInstruction = `
    You have to act as a senior cinematic prompt engineer for high-end image generation.
    Your task is to enhance the prompt by adding relevant details that strengthen the existing concept, character, and visual impact.
    You are allowed to enrich the description with elements that logically belong to the character, setting, or art style.
    You are NOT allowed to change, remove, or contradict any existing concept.
    Do NOT replace the subject, art style, environment, camera framing, or mood.
    Do NOT introduce unrelated themes.
    All additions must reinforce the original idea.
    Improve structure, clarity, artistic language, lighting, texture, and composition.
    Preserve the core identity of the prompt at all times.
    Return only the improved prompt.

    ### CRITICAL INSTRUCTION: CAMERA FRAMING
    You MUST strictly adhere to the provided 'Framing' (Camera Shot).
    - If input says "Close-up", the prompt MUST describe a Close-up.
    - If input says "Full Body", you MUST ensure the full character is visible.
    - Do NOT change the shot type for "artistic reasons". The user's choice is final.

    ### FORMATTING RULES
    1. Output MUST be valid JSON.
    2. ${isMJ ? 
       'FORMAT FOR MIDJOURNEY: Start with "/imagine prompt:", include descriptive tags, and END with parameters (e.g., --v 6.0 --ar 16:9).' : 
       'FORMAT FOR GENERIC AI: Use dense, descriptive, high-quality tags separated by commas. No /imagine command. DO NOT USE --ar parameters.'}
    3. Do NOT include the "Elite AI" preamble in the JSON output, I will add it programmatically.
  `;

  const userPrompt = `${inputData}\n\nOutput JSON only with keys: "prompt", "negativePrompt".`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
          },
          required: ["prompt", "negativePrompt"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text from Gemini");
    
    const result = JSON.parse(jsonText) as GeneratedData;

    // --- CRITICAL: INJECT ELITE PREAMBLE ---
    result.prompt = `${ELITE_PREAMBLE}\n\n${result.prompt}`;

    return result;

  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
};

/**
 * PROTOCOLO PSYCHE 7.1: Strict Consistency Enforcement & Clean Formatting
 */
export const generateExpressionSheet = async (params: CharacterParams): Promise<ExpressionEntry[]> => {
  let ai;
  try {
    ai = getAI();
  } catch (e: any) {
    console.error("Failed to initialize AI:", e);
    throw new Error(e.message);
  }

  const isMJ = params.promptFormat === 'midjourney';
  const inputData = buildInputData(params, false); 
  
  // Extraemos rasgos clave para forzar la consistencia
  const coreIdentity = `${params.race} ${params.role} ${params.gender}`;
  const appearance = `${params.hairColors?.join("&")} ${params.hairStyle}, ${params.skinTone}, ${params.outfitColors?.join("&")} outfit`;

  const systemInstruction = `
    You are the "Director of Character Consistency" for a Concept Art studio.
    Your goal is to generate a JSON Array of 7 Prompts based on the Input Data.

    ### STRATEGY: ABSOLUTE CONSISTENCY
    
    **PROMPT 1: THE ANCHOR ("Personaje potenciado con IA")**
    - This is the Masterpiece. Use the exact Lighting, Framing, and Style requested.
    - This defines the Source of Truth for the character's look.

    **PROMPTS 2-7: THE VARIATIONS (Consistency Mode)**
    - **CRITICAL:** In EVERY single prompt from 2 to 7, you MUST explicitly describe the character again to ensure the AI doesn't hallucinate a new person.
    - **MANDATORY INJECTION:** You must include this phrase in prompts 2-7: "Character consistency: ${coreIdentity}, ${appearance}".
    - Do NOT rely on "same character as above". You must describe them again.
    - Change only the pose, framing, and action suitable for the specific sheet type.
    - **SAFETY MARGINS:** For sheets (Arch, Action, Expressions), ensure figures do NOT touch. Use "Solid White Background".

    ### FORMATTING RULES (STRICT)
    ${isMJ ? 
      '- Start prompts with "/imagine prompt:"\n- End with parameters (e.g. --v 6.0 --ar X:Y)' : 
      '- Use descriptive natural language tags.\n- **FORBIDDEN:** Do NOT use "--ar" parameters in Generic Mode. Instead, use words like "Vertical format", "Square format", "Wide format".'}

    ### THE 7 REQUIRED PROMPTS:
    1. **"Personaje potenciado con IA"**: The main artistic shot.
    2. **"ARCHITECTURE TRIPTYCH"**: Front view, Side view, Back view. T-Pose or A-Pose. Wide spacing. Solid White BG.
    3. **"ACTION DYNAMICS"**: 3 distinct combat/movement poses. Non-overlapping. Solid White BG.
    4. **"EXPRESSION GRID"**: 2x3 grid of facial emotions. Focus on face. Solid White BG.
    5. **"RPG TOKEN"**: Circular or Square framing focused on the head/bust. High contrast.
    6. **"GEAR KNOLLING"**: The character's items (Weapons, Accessories) laid out on a flat surface. Top-down view.
    7. **"VICTORY POSE"**: A full-body heroic pose showing the character in their prime.
  `;

  const userPrompt = `${inputData}\n\nGenerate the 7-Prompt Design Kit. Output JSON Array.`;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        prompt: { type: Type.STRING }
      },
      required: ["label", "prompt"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    
    const sheet = JSON.parse(jsonText) as ExpressionEntry[];

    // --- CRITICAL: INJECT ELITE PREAMBLE TO THE FIRST PROMPT ONLY ---
    if (sheet.length > 0) {
        // Force correct label
        sheet[0].label = "Personaje potenciado con IA";
        sheet[0].prompt = `${ELITE_PREAMBLE}\n\n${sheet[0].prompt}`;
    }

    return sheet;

  } catch (error) {
    console.error("Error generating sheets:", error);
    throw error;
  }
};

export const generateInventoryPrompt = async (params: CharacterParams): Promise<GeneratedData> => {
    let ai;
    try {
        ai = getAI();
    } catch (e: any) {
        throw new Error(e.message);
    }
    const isMJ = params.promptFormat === 'midjourney';
    const outfitC = params.outfitColors?.join(" and ");

    const systemInstruction = `
        Eres un Diseñador de Assets de Videojuegos.
        Genera una Hoja de Inventario (Sprite Sheet, Knolling style) para: ${params.race} ${params.role}.
        Estilo: ${params.style}.
        Items clave: ${params.heldItem}, ${params.headwear}, ${params.footwear}, ${params.classExtras}.
        Paleta de items: ${outfitC}.
        Fondo: Solid White. Objetos separados.
        Format: ${isMJ ? '/imagine prompt: ... --ar 3:2' : 'Detailed description without --ar parameters'}.
        OUTPUT ENGLISH.
    `;
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: "Genera prompt inventario.",
        config: { systemInstruction, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { prompt: {type: Type.STRING}, negativePrompt: {type:Type.STRING} } } }
    });
    return JSON.parse(response.text!) as GeneratedData;
};
