
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
 * PROTOCOLO PSYCHE 3.0: Genera 5 Hojas Maestras con estricto control de consistencia.
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
  const aspectRatio = "--ar 3:2"; 

  // Formateamos las reglas según el modo elegido
  const formatRules = isMJ 
    ? `FORMATO MIDJOURNEY: Añade "${aspectRatio} --v 6.0" al final. Empieza con "/imagine prompt:".`
    : `FORMATO GENÉRICO: Descripción detallada en inglés puro. PROHIBIDO usar --ar, --v o /imagine. Usa "widescreen aspect ratio" en el texto si es necesario.`;

  const systemInstruction = `
    Eres un Director de Arte de Concept Art (Protocolo PSYCHE v3.0).
    Tu objetivo es crear un "Character Design Kit" compuesto por EXACTAMENTE 5 PROMPTS MAESTROS.
    
    ESTRATEGIA DE CONSISTENCIA GLOBAL (ADN VISUAL):
    Debes definir internamente un "Visual DNA" y aplicarlo a TODOS los prompts para evitar alucinaciones entre imágenes.
    1. ESTILO BASE: ${params.style} (Pero fuerza siempre: "clean linework, high definition, no noise").
    2. COLORES: ${params.colors.join(", ")} (Mantén esta paleta estricta).
    3. ANATOMÍA: ${params.bodyType}, ${params.gender}, ${params.race}. (Fuerza: "identical proportions across all images").
    4. FONDO: SIEMPRE "pure solid white background (#FFFFFF), no shadows, no gradients, subject fully isolated, cutout-ready".

    LOS 5 PROMPTS MAESTROS:
    1. "ARCHITECTURE VIEW" (Referencia Técnica):
       - Triptych layout: Front View, Side View, Back View.
       - Neutral expression. Arms slightly away (A-Pose).
       - Keywords: "Model sheet, technical drawing layout, distinct separation".

    2. "CINEMATIC NARRATIVE" (Lenguaje Corporal):
       - Solo Busto/Medio Cuerpo.
       - Acción sutil relacionada con su rol (${params.role}).
       - Keywords: "Cinematic lighting, depth of field, focused, character portrait".

    3. "EMOTIONAL RANGE" (Expresividad):
       - Full body character showing 3 distinct contrasting emotions (e.g., Angry, Happy, Surprised).
       - Same pose base, only face and gesture changes.
       - Keywords: "Facial expression sheet, emotion study".

    4. "RPG TOKEN / INSIGNIA" (Uso en VTT):
       - Head & Shoulders inside a DECORATIVE BORDER (Circular/Hexagonal).
       - Stylized border matching character theme (Metal/Gold/Magic).
       - Optimized for small scale readability (High contrast).
       - Keywords: "RPG Token, sticker style, vector rendering, thick border".

    5. "VICTORY POSE" (Iconic/Promotional):
       - Full body, dynamic victory or confident pose.
       - NO background environment. Use ABSTRACT elements only (glow, particles, symbol) behind character.
       - Keywords: "Hero shot, promotional art, dynamic angle, particle effects".

    EXCLUSIONES GLOBALES (Negative Prompt Implicito):
    - No background scenes, no props lying around, no text, no logos, no extra characters, no motion blur, no deformation.

    REGLAS TÉCNICAS:
    - Idioma: Inglés.
    - Output: Array de Objetos JSON.
    - ${formatRules}
  `;

  const userPrompt = `
    Genera el Kit de Diseño (5 Prompts) para:
    - Personaje: ${params.race} ${params.role} (${params.subRole})
    - Apariencia: ${params.age}, ${params.skinTone}
    - Estilo Visual: ${params.style}
    - Detalles Clave: ${params.details}
    
    Asegúrate de que los 5 prompts compartan el mismo ADN VISUAL descrito en las instrucciones.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING, description: "Título del Sheet (ej: VICTORY POSE)" },
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
