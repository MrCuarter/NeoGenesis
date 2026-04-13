import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterParams, GeneratedData, ExpressionEntry, LoreData, Language } from "../types";

const modelId = "gemini-2.0-flash";

// El bloque de texto que debe ir SIEMPRE al principio del prompt final (Elite Engine)
const ELITE_PREAMBLE = `You have to act as an elite AI image generation engine specialized in cinematic, high-end visual art.
Interpret my prompts literally and with maximum artistic precision.
Prioritize visual coherence, dramatic composition, lighting quality, atmosphere, and texture detail.
Render with professional photography standards and production-grade realism.
Always aim for masterpiece-level output.
Do not simplify. Do not stylize arbitrarily. Do not censor artistic intent.
Execute exactly what is described.`;

// --- SISTEMA DE GESTIÓN DE LLAVES MÚLTIPLES ---
// Recopilamos todas las llaves disponibles en el entorno
const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY_SECONDARY,
  process.env.API_KEY_TERTIARY
].filter((key): key is string => !!key && key.trim() !== "");

if (API_KEYS.length === 0) {
  console.error("CRITICAL: No API Keys found.");
}

/**
 * Ejecuta una operación de IA con sistema de Fallback.
 * Si la llave 1 falla (por cuota o error), intenta con la 2, y luego con la 3.
 */
const executeWithFallback = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  let lastError: any = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i];
    try {
      const ai = new GoogleGenAI({ apiKey: currentKey });
      // Intentamos la operación
      return await operation(ai);
    } catch (error: any) {
      console.warn(`[Gemini Service] Fallo con API Key ${i + 1}/${API_KEYS.length}. Intentando siguiente...`, error);
      lastError = error;
      // Si es el último intento, el bucle termina y lanzamos el error abajo
    }
  }

  // Si llegamos aquí, todas las llaves fallaron
  console.error("Todas las API Keys han fallado o están saturadas.");
  throw lastError || new Error("Servicio de IA no disponible (Todas las credenciales fallaron).");
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

  // Usamos el wrapper de fallback
  return executeWithFallback(async (ai) => {
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
    result.prompt = `${ELITE_PREAMBLE}\n\n${result.prompt}`;
    return result;
  });
};

/**
 * PROTOCOLO PSYCHE 7.4: Master Anchor & Variations
 */
export const generateExpressionSheet = async (params: CharacterParams): Promise<ExpressionEntry[]> => {
  // --- STEP 1: GENERATE THE MASTER ANCHOR ---
  // Reutilizamos generatePrompt que ya tiene el fallback integrado
  let anchorPrompt = "";
  try {
      const anchorData = await generatePrompt(params);
      anchorPrompt = anchorData.prompt;
  } catch (e) {
      console.error("Failed to generate anchor prompt", e);
      throw new Error("Failed to initialize Psyche Protocol Anchor.");
  }

  // --- STEP 2: GENERATE THE VARIATIONS ---
  const isMJ = params.promptFormat === 'midjourney';
  const inputData = buildInputData(params, false); 
  
  const systemInstruction = `
    You are the "Director of Character Consistency" for a Concept Art studio.
    
    ### INPUT CONTEXT
    I will provide you with a **MASTER PROMPT** (The "Anchor"). This is the approved, high-end description of the character.
    
    ### YOUR TASK
    Generate a JSON Array of 7 Prompts based on the Input Data and the MASTER PROMPT.

    **PROMPT 1: THE ANCHOR**
    - This MUST be the "MASTER PROMPT" exactly as provided. Do not change it.

    **PROMPTS 2-7: THE VARIATIONS**
    - **CRITICAL:** Do NOT repeat the full physical description of the character (e.g., do not list hair color, armor details again) unless absolutely necessary for the action.
    - **MANDATORY COMMAND:** Start prompts 2-7 with: "Maintain strict consistency with the previously generated character. [Insert specific Action/Framing here]...".
    - Focus strictly on the **POSE**, **ACTION**, and **FRAMING** specific to that sheet type.
    - **SAFETY MARGINS:** For sheets (Arch, Action, Expressions), ensure figures do NOT touch. Use "Solid White Background".

    ### FORMATTING RULES (STRICT)
    ${isMJ ? 
      '- Start prompts with "/imagine prompt:"\n- End with parameters (e.g. --v 6.0 --ar X:Y)' : 
      '- Use descriptive natural language tags.\n- **FORBIDDEN:** Do NOT use "--ar" parameters in Generic Mode. Instead, use words like "Vertical format", "Square format", "Wide format".'}

    ### THE 7 REQUIRED PROMPTS:
    1. **"Personaje potenciado con IA"**: The MASTER PROMPT provided.
    2. **"CASUAL TRIPTYCH"**: 3 distinct, casual, habitual poses. No T-Pose. Example: One w/ arms crossed looking at camera, one smiling with thumbs up, one with hands on hips/waist. Wide spacing. Solid White BG.
    3. **"ACTION DYNAMICS"**: 3 distinct combat/movement poses. Non-overlapping. Solid White BG.
    4. **"EXPRESSION GRID"**: 2x3 grid of facial emotions. Focus on face. Solid White BG.
    5. **"TOKEN SHEET COLLECTION"**: A cinematic 16:9 image showing **6 distinctive RPG Tokens** arranged in 2 rows of 3. Center the character's bust in each. The token borders/frames must be highly elaborate and constructed from materials specific to the character's class/lore. High quality, game-ready assets. Solid White Background.
    6. **"GEAR KNOLLING"**: The character's items (Weapons, Accessories) laid out on a flat surface. Top-down view.
    7. **"VICTORY POSE"**: A full-body heroic pose showing the character in their prime.
  `;

  const userPrompt = `
    MASTER PROMPT (Source of Truth):
    ${anchorPrompt}

    RAW PARAMS:
    ${inputData}

    Generate the 7-Prompt Design Kit. Output JSON Array.
  `;

  // Usamos el wrapper de fallback también para el paso 2
  return executeWithFallback(async (ai) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["label", "prompt"]
          }
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    
    const sheet = JSON.parse(jsonText) as ExpressionEntry[];

    if (sheet.length > 0) {
        sheet[0].label = "Personaje potenciado con IA";
        sheet[0].prompt = anchorPrompt;
    }

    return sheet;
  });
};

/**
 * BATTLE GENERATOR: Assets para Juegos de Lucha
 */
export const generateBattlePrompts = async (params: CharacterParams): Promise<ExpressionEntry[]> => {
  const isMJ = params.promptFormat === 'midjourney';
  const inputData = buildInputData(params, false); 
  
  const systemInstruction = `
    You are the "Lead Asset Designer" for a Triple-A Fighting Game (like Street Fighter 6, Tekken 8, Guilty Gear Strive).
    Your task is to generate 5 Specific Prompts to create game assets for the character described in the input.

    ### CRITICAL VISUAL RULES
    1. **Character Consistency:** The character MUST maintain their appearance across all prompts.
    2. **Backgrounds:** For Prompts 1, 2, 3, and 4, you MUST strictly specify: "Isolated on Solid White Background". No shadows, no environment.
    3. **Perspective:** 
       - Battle Sprites must be Side View (Facing Right).
       - Select Screen is Front View.
    4. **Safety Area:** Ensure characters are fully visible with padding around the edges.

    ### THE 5 REQUIRED PROMPTS (JSON Array):

    **1. "SELECT SCREEN STATES"** (Triptych Image)
       - Generate 3 distinct full-body poses in one image (horizontal arrangement).
       - Pose A: Arms crossed, confident, slightly turned, looking at camera (Intro).
       - Pose B: Laughing or Victory Pose (Winning).
       - Pose C: DEFEAT STATE. Clothes torn, armor damaged, bruised skin, expression is sad/angry/exhausted.
       - Requirement: Solid White Background.

    **2. "COMBAT SPRITES"** (Action Triptych)
       - Generate 3 distinct fighting poses in one image.
       - **Orientation:** All poses must be SIDE VIEW FACING RIGHT (Player 1 side).
       - Pose A: Attacking (Punch, Kick, or Weapon strike).
       - Pose B: Defensive Stance (Blocking or Dodge).
       - Pose C: Special Move or Idle Stance.
       - Requirement: Solid White Background.

    **3. "VERSUS PORTRAITS"** (Versus Screen)
       - Generate a horizontal diptych containing 2 distinct **Close-Up (Face/Bust)** portraits.
       - **CRITICAL:** Do NOT use circular or rounded frames. Use standard rectangular cinematic framing.
       - **LAYOUT:** Add significant empty white space (safety margin) between the two portraits to clearly separate the Winner from the Loser.
       - Left Portrait: VICTORIOUS. Smiling, proud, clean, intense gaze.
       - Right Portrait: DEFEATED. Heavily bruised, bleeding, swollen eye, looking down or in pain.
       - Requirement: Solid White Background. High detail on facial expressions.

    **4. "CHARACTER EMBLEM"** (Circular Badge)
       - A high-quality **Circular Badge/Icon** featuring the character's face in the center.
       - **CRITICAL:** NO TEXT. NO NUMBERS. NO LETTERS.
       - **FRAME:** The circular border must be constructed from materials/aesthetics that match the character's Race and Style (e.g. if Elf use vines/gold, if Robot use metal/neon).
       - Style: RPG Character Token / UI Badge.
       - Requirement: Solid White Background.

    **5. "FIGHTING STAGE"** (Background Only)
       - The background location where the fight takes place.
       - **CRITICAL:** NO CHARACTERS. The stage must be completely empty.
       - **ASPECT RATIO:** Must be Cinematic 16:9 Widescreen.
       - Perspective: Side view (2D Fighting Game Camera).
       - Ambience: Match the character's 'Setting' and 'Atmosphere' params.

    ### FORMATTING RULES
    ${isMJ ? 
      '- Start prompts with "/imagine prompt:"\n- End with parameters (e.g. --v 6.0 --ar 16:9 for sheets/stage, --ar 3:2 for portraits)' : 
      '- Use descriptive natural language tags.\n- DO NOT use --ar parameters except for the Stage where you must describe it as "16:9 Widescreen".'}
  `;

  const userPrompt = `
    RAW PARAMS:
    ${inputData}

    Generate the 5 Fighting Game Asset Prompts. Output JSON Array.
  `;

  return executeWithFallback(async (ai) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["label", "prompt"]
          }
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    
    return JSON.parse(jsonText) as ExpressionEntry[];
  });
};

export const generateInventoryPrompt = async (params: CharacterParams): Promise<GeneratedData> => {
    const isMJ = params.promptFormat === 'midjourney';
    
    const coreIdentity = `${params.race} ${params.role} ${params.gender}`;
    const appearance = `${params.hairColors?.join("&")} ${params.hairStyle}, ${params.skinTone}, ${params.outfitColors?.join("&")} outfit`;
    const outfitC = params.outfitColors?.join(" and ");

    const systemInstruction = `
        You are a Video Game Asset Designer specialized in Inventory UI.
        Your task is to generate a Knolling/Sprite Sheet prompt for the EQUIPMENT of a specific character.

        ### CRITICAL: CHARACTER CONSISTENCY
        You must design the items to strictly fit the visual identity of the following character:
        - **Identity:** ${coreIdentity}
        - **Appearance:** ${appearance}
        - **Style:** ${params.style}
        
        The items must look like they belong to THIS specific character (same color palette, same tech level, same aesthetic).

        ### TASK DETAILS
        - Generate a flat-lay (knolling) composition of: ${params.heldItem}, ${params.headwear}, ${params.footwear}, ${params.classExtras}.
        - Primary Colors: ${outfitC}.
        - Background: Solid White (for easy masking).
        - Perspective: Top-down, organized layout, assets separated.

        ### OUTPUT FORMAT
        ${isMJ ? 
            'Start with /imagine prompt: ... and end with --ar 3:2 --no human, body, limbs' : 
            'Detailed description. Do NOT use --ar parameters. Add "no human characters" to negative prompt.'}
        
        Return JSON with "prompt" and "negativePrompt".
    `;
    
    return executeWithFallback(async (ai) => {
      const response = await ai.models.generateContent({
          model: modelId,
          contents: "Generate inventory asset prompt.",
          config: { 
              systemInstruction, 
              responseMimeType: "application/json", 
              responseSchema: { 
                  type: Type.OBJECT, 
                  properties: { 
                      prompt: {type: Type.STRING}, 
                      negativePrompt: {type:Type.STRING} 
                  },
                  required: ["prompt", "negativePrompt"]
              } 
          }
      });
      
      const jsonText = response.text;
      if (!jsonText) throw new Error("No response text");

      return JSON.parse(jsonText) as GeneratedData;
    });
};

/**
 * LORE ENGINE: Generación de Narrativa
 */
export const generateLore = async (params: CharacterParams, lang: Language): Promise<LoreData> => {
  const inputData = buildInputData(params, false);

  const languageInstruction = lang === 'ES' 
    ? "OUTPUT LANGUAGE: SPANISH (Español). You MUST write the name, backstory, motivation, fear, and personality traits IN SPANISH."
    : "OUTPUT LANGUAGE: ENGLISH.";

  const systemInstruction = `
    You are a best-selling Sci-Fi/Fantasy novelist and expert RPG Narrative Designer (D&D, Cyberpunk, Pathfinder).
    Your task is to create a compelling, deep, and unique backstory for the character described in the input.

    ### CREATIVE GUIDELINES
    - **Name & Epithet:** Create a name that fits their race/culture perfectly. Add a cool epithet (e.g., "The Iron Saint", "Void-Walker").
    - **Tone:** Match the visual style (e.g., if "Gothic", use melancholic language; if "Cyberpunk", use slang/tech terms).
    - **Backstory:** Write a 1-paragraph summary of their origin, a key tragedy or success, and why they are adventuring now.
    - **Psychology:** Define their core motivation (what drives them) and their deepest fear.
    - **Alignment:** Use a Moral Alignment (e.g., "Chaotic Neutral", "Lawful Good") but explain it briefly.

    ### CRITICAL: LANGUAGE
    ${languageInstruction}

    Output strict JSON.
  `;

  return executeWithFallback(async (ai) => {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${inputData}\n\nGenerate Character Biography & Lore.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            epithet: { type: Type.STRING },
            alignment: { type: Type.STRING },
            personality: { type: Type.ARRAY, items: { type: Type.STRING } },
            backstory: { type: Type.STRING },
            motivation: { type: Type.STRING },
            fear: { type: Type.STRING }
          },
          required: ["name", "epithet", "backstory", "personality", "motivation", "fear", "alignment"]
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No lore generated");

    return JSON.parse(jsonText) as LoreData;
  });
};