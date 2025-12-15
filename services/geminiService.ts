import { GoogleGenAI, Type } from "@google/genai";
import { CharacterParams, GeneratedData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrompt = async (params: CharacterParams): Promise<GeneratedData> => {
  const modelId = "gemini-2.5-flash";

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
    2. Enfócate en la calidad visual: "masterpiece, best quality, 8k, ultra-detailed".
    
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