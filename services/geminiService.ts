
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterParams, GeneratedData, ExpressionEntry } from "../types";

const modelId = "gemini-2.5-flash";

// Helper para obtener la instancia de IA de forma segura
const getAI = () => {
  const apiKey = process.env.API_KEY;
  
  // Depuración en consola (F12)
  if (!apiKey) {
    console.error("DEBUG: La API Key es undefined o null.");
  } else if (apiKey === "") {
    console.error("DEBUG: La API Key es un string vacío. Vite no la ha inyectado.");
  } else {
    // console.log("DEBUG: API Key detectada.");
  }

  // Verificación estricta
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === "") {
    throw new Error("API Key no configurada. Asegúrate de que la variable API_KEY existe en Vercel y has hecho Redeploy.");
  }

  return new GoogleGenAI({ apiKey });
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

  const systemInstruction = `
    Eres un Arquitecto de Prompts IA experto (Prompt Engineer).
    Tu tarea es generar un prompt optimizado basado en los parámetros del usuario.
    
    IDIOMA DE SALIDA: Inglés (SIEMPRE).
    MODO: ${params.mode.toUpperCase()}
    FORMATO: ${params.promptFormat.toUpperCase()}

    === REGLAS CRÍTICAS DE FORMATO ===
    
    SI EL FORMATO ES "MIDJOURNEY":
    1. Comienza con "/imagine prompt:".
    2. Usa sintaxis de parámetros: añade "${params.aspectRatio} --v 6.0" al final.
    3. Usa "::" para pesos si es necesario (ej: "Character::2 Background::1").

    SI EL FORMATO ES "GENERIC" (Stable Diffusion / Flux / DALL-E):
    1. PROHIBIDO usar comandos que empiecen por "--" o "/" (Ej: NO USAR --ar, --v, --no, /imagine).
    2. Convierte el Aspect Ratio a lenguaje natural (Ej: si el usuario pide 16:9, escribe "cinematic 16:9 aspect ratio").
    3. Estructura: "Subject description, Action, Environment, Artstyle keywords, Quality tags".
    4. Usa palabras clave de calidad: "masterpiece, best quality, ultra-detailed, 8k uhd".

    === PALETA DE COLOR ===
    Colores obligatorios: ${params.colors.join(", ")}.
  `;

  const actionPart = isVideo ? `Acción (VIDEO): ${params.action}` : `Pose (IMAGEN): ${params.pose}`;

  const userPrompt = `
    Genera un prompt con estos datos:
    - Sujeto: ${params.race} ${params.subRole ? `(${params.subRole})` : params.role}
    - Género: ${params.gender}
    - Edad: ${params.age}
    - Cuerpo: ${params.bodyType}
    - Emoción: ${params.emotion}
    - ${actionPart}
    - Estilo: ${params.style}
    - Encuadre: ${params.framing}
    - Iluminación: ${params.lighting}
    - Atmósfera: ${params.atmosphere}
    - Entorno: ${params.setting}
    - Tipo de Fondo: ${params.background}
    - Colores Clave: ${params.colors.join(", ")}
    - Detalles extra: ${params.details}
    - Formato de Aspecto: ${params.aspectRatio} (Recuerda: si es Genérico, tradúcelo a texto, NO uses --ar).
    
    Output JSON.
  `;

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
            prompt: {
              type: Type.STRING,
              description: isMJ ? "El prompt completo con /imagine y parámetros." : "La descripción detallada sin parámetros técnicos.",
            },
            negativePrompt: {
              type: Type.STRING,
              description: "Lista de exclusión (deformidades, watermark, text, etc).",
            },
          },
          required: ["prompt", "negativePrompt"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text from Gemini");

    return JSON.parse(jsonText) as GeneratedData;

  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
};

/**
 * PROTOCOLO PSYCHE 4.0: Genera 7 Hojas Maestras (Updated).
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
  
  // Definimos las reglas de formato dinámicamente para permitir distintos Aspect Ratios
  const formatRules = isMJ 
    ? `FORMATO MIDJOURNEY: Empieza con "/imagine prompt:". AL FINAL, añade los parámetros específicos indicados para cada imagen (ej: --ar 3:2 o --ar 1:1) seguido de "--v 6.0".`
    : `FORMATO GENÉRICO: Descripción detallada en inglés puro. PROHIBIDO usar --ar, --v o /imagine. Incluye la descripción del formato (ej: "square format" o "widescreen layout") en el texto.`;

  const systemInstruction = `
    Eres un Director de Arte de Concept Art (Protocolo PSYCHE v4.0).
    Tu objetivo es crear un "Character Design Kit" compuesto por EXACTAMENTE 7 PROMPTS MAESTROS.
    
    ESTRATEGIA DE CONSISTENCIA GLOBAL (ADN VISUAL):
    Debes definir internamente un "Visual DNA" y aplicarlo a TODOS los prompts para evitar alucinaciones entre imágenes.
    1. ESTILO BASE: ${params.style} (Pero fuerza siempre: "clean linework, high definition, no noise").
    2. COLORES: ${params.colors.join(", ")} (Mantén esta paleta estricta).
    3. ANATOMÍA: ${params.bodyType}, ${params.gender}, ${params.race}. (Fuerza: "identical proportions across all images").
    4. FONDO: SIEMPRE "pure solid white background (#FFFFFF), no shadows, no gradients, subject fully isolated, cutout-ready".

    LOS 7 PROMPTS MAESTROS (SECUECIA ESTRICTA):
    
    1. "ARCHITECTURE VIEW" (Referencia Técnica):
       - Triptych layout: Front View, Side View, Back View.
       - Neutral expression. Arms slightly away (A-Pose).
       - Keywords: "Model sheet, technical drawing layout, distinct separation".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    2. "CINEMATIC NARRATIVE" (Lenguaje Corporal):
       - Solo Busto/Medio Cuerpo.
       - Acción sutil relacionada con su rol (${params.role}).
       - Keywords: "Cinematic lighting, depth of field, focused, character portrait".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    3. "ACTION POSES A" (Poses Dinámicas Set 1):
       - Triptych / Three characters layout (Full Body).
       - Pose 1: Profile view, arms crossed, confident, looking at camera.
       - Pose 2: Alert combat stance, gritting teeth, aggressive.
       - Pose 3: Smiling, thumbs up, winking one eye.
       - Keywords: "Action sheet, dynamic poses, character study".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    4. "ACTION POSES B" (Poses Dinámicas Set 2):
       - Triptych / Three characters layout (Full Body).
       - Pose 1: Crouching low, one hand on ground, looking at camera with curiosity/strangeness.
       - Pose 2: Walking away (view from back/side), looking back over shoulder.
       - Pose 3: Facepalm gesture (hand covering face), embarrassed or resigned expression.
       - Keywords: "Action sheet, dynamic poses, character study".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    5. "EXPRESSIONS GRID" (Grid de 6 Caras):
       - Layout: 2 rows of 3 images (6 distinct panels in total).
       - Framing: Chest-up / Headshots.
       - Expressions: 1.Happy, 2.Tired, 3.Disgusted, 4.Scared, 5.Exultant, 6.Angry.
       - Keywords: "Expression sheet, 2x3 grid, emotional study, facial chart".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    6. "RPG TOKEN / INSIGNIA" (Uso en VTT - Formato Cuadrado):
       - Head & Shoulders inside a DECORATIVE BORDER (Circular/Hexagonal).
       - Stylized border matching character theme (Metal/Gold/Magic).
       - Optimized for small scale readability (High contrast).
       - Keywords: "RPG Token, sticker style, vector rendering, thick border".
       - Aspect Ratio: ${isMJ ? '--ar 1:1' : 'square format'}.

    7. "VICTORY POSE" (Iconic/Promotional):
       - Full body, dynamic victory or confident pose.
       - NO background environment. Use ABSTRACT elements only (glow, particles, symbol) behind character.
       - Keywords: "Hero shot, promotional art, dynamic angle, particle effects".
       - Aspect Ratio: ${isMJ ? '--ar 3:2' : 'landscape'}.

    EXCLUSIONES GLOBALES (Negative Prompt Implicito):
    - No background scenes, no props lying around, no text, no logos, no extra characters, no motion blur, no deformation.

    REGLAS TÉCNICAS:
    - Idioma: Inglés (Output en Inglés).
    - Output: Array de Objetos JSON.
    - ${formatRules}
  `;

  const userPrompt = `
    Genera el Kit de Diseño COMPLETO (7 Prompts) para:
    - Personaje: ${params.race} ${params.role} (${params.subRole})
    - Apariencia: ${params.age}, ${params.skinTone}
    - Estilo Visual: ${params.style}
    - Detalles Clave: ${params.details}
    
    Asegúrate de que los 7 prompts sigan estrictamente las poses descritas en las instrucciones.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING, description: "Título del Sheet (ej: ACTION POSES A)" },
        prompt: { type: Type.STRING, description: "El prompt completo." }
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
    if (!jsonText) throw new Error("No response text from Gemini");

    return JSON.parse(jsonText) as ExpressionEntry[];

  } catch (error) {
    console.error("Error generating expression sheet:", error);
    throw error;
  }
};

/**
 * PROTOCOLO INVENTARIO: Genera un Sprite Sheet de objetos (Assets).
 */
export const generateInventoryPrompt = async (params: CharacterParams): Promise<GeneratedData> => {
  let ai;
  try {
    ai = getAI();
  } catch (e: any) {
    console.error("Failed to initialize AI:", e);
    throw new Error(e.message);
  }

  const isMJ = params.promptFormat === 'midjourney';
  // Asset sheet suele funcionar mejor apaisado para tener espacio
  const assetRatio = "--ar 3:2"; 

  const systemInstruction = `
    Eres un Diseñador de Assets de Videojuegos (Game Asset Designer).
    Tu tarea es crear un PROMPT para generar una "Hoja de Inventario" (Sprite Sheet) con los objetos que llevaría el personaje descrito.
    
    ESTILO DE DISEÑO (CRÍTICO):
    - TÉCNICA: "Knolling photography" o "Flat Lay". Objetos organizados en una cuadrícula invisible o líneas paralelas.
    - SEPARACIÓN: Los objetos NO deben tocarse ni solaparse (para poder recortarlos fácilmente en Photoshop).
    - FONDO: "Solid White Background" o "Solid Neutral Hex Background".
    - CONTENIDO: 6 a 10 objetos relevantes para la clase/rol del personaje (armas, pociones, gadgets, libros, munición, comida, herramientas).
    - ESTILO VISUAL: Debe coincidir EXACTAMENTE con el estilo del personaje (ej: si es Cyberpunk, los objetos son neón/tech; si es Fantasía, son madera/acero/magia).

    FORMATO:
    - ${isMJ ? `Empieza con "/imagine prompt:". Termina con "${assetRatio} --v 6.0".` : "Descripción detallada para Stable Diffusion/DALL-E. NO usar comandos --ar."}
  `;

  const userPrompt = `
    Personaje: ${params.race} ${params.role} (${params.subRole}).
    Estilo Visual: ${params.style}.
    Colores: ${params.colors.join(", ")}.
    
    Genera un prompt para una HOJA DE INVENTARIO con el equipamiento típico de este personaje.
    Output JSON.
  `;

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
            prompt: { type: Type.STRING, description: "Prompt para generar la hoja de inventario." },
            negativePrompt: { type: Type.STRING, description: "Negative prompt (blur, crop, hand, fingers, text)." }
          },
          required: ["prompt", "negativePrompt"]
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text from Gemini");

    return JSON.parse(jsonText) as GeneratedData;

  } catch (error) {
    console.error("Error generating inventory:", error);
    throw error;
  }
};
