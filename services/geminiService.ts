import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterParams, GeneratedData, ExpressionEntry } from "../types";

const modelId = "gemini-2.5-flash";

// Helper para obtener la instancia de IA solo cuando se necesita
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key no configurada. Por favor revisa tu archivo .env o configuración de Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePrompt = async (params: CharacterParams): Promise<GeneratedData> => {
  const ai = getAI(); // Inicialización Lazy
  
  const isVideo = params.mode === 'video';
  const isMJ = params.promptFormat === 'midjourney';

  const systemInstruction = `
    Eres un Arquitecto de Prompts IA experto (Prompt Engineer).
    Tu tarea es generar un prompt optimizado basado en los parámetros del usuario.
    
    IDIOMA DE SALIDA: Inglés (SIEMPRE, las IAs de imagen entienden mejor el inglés).

    MODO SELECCIONADO: ${params.mode.toUpperCase()}
    FORMATO SOLICITADO: ${params.promptFormat.toUpperCase()}

    Reglas para formato MIDJOURNEY:
    1. Debes comenzar con "/imagine prompt:"
    2. Estructura: [Sujeto principal + Descripción física] + [Acción] + [Entorno] + [Estilo/Iluminación/Atmósfera] + [Parámetros técnicos].
    3. Añade parámetros al final: ${params.aspectRatio} --v 6.0
    4. Si es VIDEO, enfocate en el movimiento y la fluidez.

    Reglas para formato GENÉRICO (Stable Diffusion / DALL-E / RunwayGen):
    1. Descripción natural y fluida muy detallada.
    2. Enfócate en la calidad visual: "masterpiece, best quality, 8k, ultra-detailed, cinematic lighting, sharp focus".
    
    Colores solicitados: ${params.colors.join(", ")}. Asegúrate de integrar estos colores en la paleta de la imagen/video.
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
              description: isMJ ? "El prompt completo comenzando con /imagine..." : "La descripción detallada del prompt.",
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
 * PROTOCOLO PSYCHE 2.0: Genera 4 Hojas de Modelo maestras.
 */
export const generateExpressionSheet = async (params: CharacterParams): Promise<ExpressionEntry[]> => {
  const ai = getAI(); // Inicialización Lazy

  const isMJ = params.promptFormat === 'midjourney';
  const aspectRatio = "--ar 3:2"; // Apaisado forzado para Character Sheets

  // Formateamos las reglas según el modo elegido
  const formatRules = isMJ 
    ? `SI usa el formato Midjourney: Añade "${aspectRatio} --v 6.0" al final de cada prompt. Empieza con "/imagine prompt:". Usa parámetros como "--no overlapping, clutter" si es posible.`
    : `SI usa el formato GENÉRICO (para Nano Banana, Stable Diffusion, etc): NO uses comandos como /imagine ni parámetros --ar. Escribe una descripción detallada, rica y fluida en inglés. Enfócate en la calidad visual.`;

  const systemInstruction = `
    Eres un Director de Arte de Concept Art. Tu objetivo es crear un "Character Design Kit" compuesto por EXACTAMENTE 4 PROMPTS MAESTROS.
    
    ESTRATEGIA DE DISEÑO (CRÍTICO: EVITAR SUPERPOSICIÓN):
    1. Define internamente la apariencia exacta (Core Appearance) basada en los inputs.
    2. Aplica esa apariencia a 4 situaciones distintas (Sheets).
    3. Fondo: SIEMPRE "Neutral Solid White Background" para fácil recorte.
    4. COMPOSICIÓN: Exige SIEMPRE "Wide spacing between figures", "No overlap", "Distinctly separated elements". Queremos que el usuario pueda recortar cada figura fácilmente en Photoshop.
    
    LOS 4 PROMPTS DEBEN SER:
    1. "ARCHITECTURE VIEW": Character Sheet clásico. Front View, Side View, Back View. Usa keywords: "Triptych layout, distinct separation, white space in between".
    2. "CINEMATIC CUTS": Composición artística. 3/4 Portrait, Extreme Close-up (ojos/cara), Dynamic Action Pose. Usa keywords: "Split screen composition, distinct panels, collage style, isolated figures".
    3. "EMOTIONAL RANGE A": Full Body Character sheet mostrando 3 emociones distintas (ej: Alegría, Sorpresa, Curiosidad). "Three distinct poses standing side by side, not touching".
    4. "EMOTIONAL RANGE B": Full Body Character sheet mostrando 3 emociones distintas contrastantes (ej: Enfado, Miedo, Pícaro/Travieso). "Three distinct poses standing side by side, wide gap between characters".

    REGLAS TÉCNICAS:
    - Idioma: Inglés.
    - Estilo: Concept Art, Model Sheet, High definition.
    - Formato Salida: Array de Objetos JSON.
    - ${formatRules}
  `;

  const userPrompt = `
    Datos del Personaje:
    - Raza/Rol: ${params.race} ${params.role}
    - Género/Edad: ${params.gender}, ${params.age}
    - Cuerpo: ${params.bodyType}
    - Estilo: ${params.style}
    - Colores: ${params.colors.join(", ")}
    - Detalles Clave: ${params.details || "Inventa detalles coherentes de ropa y accesorios"}
    
    Genera los 4 prompts maestros descritos en las instrucciones.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING, description: "Título del Sheet (ej: ARCHITECTURE VIEW)" },
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