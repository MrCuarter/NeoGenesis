
# NeoGenesis Prompt Architect - Manual Funcional

## 1. Visión General
**NeoGenesis** es una aplicación web progresiva diseñada para artistas digitales, escritores y creadores de rol. Su función principal es actuar como un **"Arquitecto de Prompts"**: una interfaz visual que traduce selecciones creativas (raza, clase, estilo, iluminación) en instrucciones de texto optimizadas (Prompts) para inteligencias artificiales generativas como Midjourney, Stable Diffusion o DALL-E 3.

El sistema utiliza la API de **Google Gemini** para enriquecer y estructurar estos prompts, asegurando una coherencia semántica y añadiendo detalles artísticos que un usuario promedio podría omitir.

---

## 2. Características Principales

### A. Modos de Generación
1.  **Modo Imagen:** Optimizado para generar ilustraciones estáticas, retratos y arte conceptual.
2.  **Modo Video:** Ajusta el prompt para centrarse en movimiento, fluidez y acciones continuas (para herramientas como Runway Gen-2 o Pika).

### B. Formatos de Salida
1.  **Midjourney (`--v 6.0`):** Genera la sintaxis específica de Discord, incluyendo comandos como `/imagine prompt:` y parámetros técnicos (`--ar`).
2.  **Genérico:** Un formato de prosa descriptiva ("Natural Language") compatible con Stable Diffusion XL, DALL-E 3 y la mayoría de generadores modernos.

### C. Flujos de Diseño
1.  **Wizard Rápido (Quick Mode):** Un asistente paso a paso ideal para móviles o usuarios novatos. Guía al usuario a través de 10 preguntas clave.
2.  **Panel Avanzado (Advanced Mode):** Un dashboard completo con todos los controles visibles, permitiendo micro-gestión de detalles (iluminación, encuadre, paleta de colores).

---

## 3. Herramientas Especiales

### Agente de Élite (Elite Agent)
Un generador inteligente optimizado para resultados rápidos y efectivos en dispositivos móviles.
*   **Modo Operativo:** Fuerza automáticamente el **Quick Mode (Wizard)**.
*   **Comportamiento:** Rellena aleatoriamente los campos de identidad y estilo, pero **fija** ciertos parámetros para garantizar calidad y legibilidad:
    *   **Clase Secundaria:** Siempre marcada como "Saltar / Ninguna" para evitar sobrecarga conceptual.
    *   **Encuadre:** Siempre "Cuerpo Entero" (Full Body).
    *   **Fondo:** Siempre "Fondo Blanco" (Isolated on Solid White) para facilitar el recorte.
    *   **Formato:** Siempre "Móvil (9:16)".
*   **Visualización:** Despliega automáticamente el Wizard completo para que el usuario pueda ver todas las elecciones antes de generar.

### Caos Genómico (Genome Chaos)
Un generador de aleatoriedad pura para romper bloqueos creativos.
*   **Modo Operativo:** Fuerza automáticamente el **Advanced Mode (Grid)**.
*   **Comportamiento:** Rellena **absolutamente todos** los campos disponibles con valores aleatorios.
*   **Alcance:** Incluye combinaciones exóticas de colores (ojos, pelo, piel), equipamiento, accesorios de clase, detalles faciales y entornos complejos.
*   **Objetivo:** Generar personajes únicos e inesperados que sirvan de inspiración radical.

### Protocolo PSYCHE (Character Sheets)
Utiliza IA para crear un **Kit de Diseño Completo** con variaciones coherentes basadas en el diseño actual:
1.  **Hoja de Arquitectura:** Vistas frontal, lateral y trasera.
2.  **Cortes Cinemáticos:** Primeros planos y tomas de acción.
3.  **Rango Emocional:** El mismo personaje mostrando diferentes emociones.
4.  **Insignia/Token VTT:** Diseños listos para tableros virtuales.

### Archivos Narrativos (Narrative Archives)
Genera una biografía profunda del personaje en pantalla, incluyendo:
*   Nombre y Epíteto (Alias).
*   Historia de fondo (Backstory).
*   Perfil Psicológico (Motivación, Miedo, Alineamiento).
*   Rasgos de personalidad.
*   *Nota: La visualización es exclusiva en pantalla para copiado rápido.*

### Memory Core (Historial)
Un sistema de almacenamiento local que guarda los últimos 20 prompts generados. Permite recuperar configuraciones perdidas si se recarga la página.

---

## 4. Experiencia de Usuario (UX)

*   **Navegación:** Enlaces directos a `mistercuarter.es` y redes sociales del autor en el encabezado y pie de página.
*   **Estética Cyberpunk:** Interfaz inmersiva con efectos de neón, sonidos SFX futuristas y animaciones fluidas.
*   **Modo CRT:** Un filtro visual opcional que simula un monitor antiguo.
*   **Buffer de Previsualización:** Muestra en tiempo real cómo se construye el prompt antes de enviarlo a la IA.

---

## 5. Especificaciones Técnicas
*   **Frontend:** React 19 + TypeScript + Vite.
*   **Estilos:** Tailwind CSS.
*   **IA:** Google Gemini 2.5 Flash.
*   **Audio:** Motor de audio sintetizado en tiempo real (Web Audio API).
