
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
Un generador aleatorio inteligente que opera exclusivamente en **Modo Rápido**.
*   **Funcionamiento:** Selecciona automáticamente opciones aleatorias para Raza, Rol, Género y Estilo, pero mantiene una configuración fija optimizada para personajes de alta calidad en dispositivos móviles.
*   **Configuración Fija:**
    *   **Clase Secundaria:** Ninguna.
    *   **Encuadre:** Cuerpo entero (Full Body).
    *   **Fondo/Escenario:** Blanco sólido (Isolated on Solid White).
    *   **Formato:** Móvil (9:16).
*   **Visualización:** Despliega automáticamente todas las opciones seleccionadas en el Wizard para que el usuario pueda revisarlas antes de generar.

### Caos Genómico (Genome Chaos)
Un generador de aleatoriedad total que opera en **Modo Avanzado**.
*   **Funcionamiento:** Activa y rellena absolutamente todos los campos disponibles en la herramienta con valores aleatorios.
*   **Alcance:** Incluye selección aleatoria de colores de ojos (heterocromía), pelo, equipo, detalles faciales, accesorios y entornos complejos. Ideal para inspiración extrema y resultados inesperados.

### Protocolo PSYCHE (Character Sheets)
Esta es la función más potente de la herramienta. En lugar de generar un solo prompt, utiliza IA para crear un **Kit de Diseño Completo** con 4 variaciones coherentes:
1.  **Hoja de Arquitectura:** Vistas frontal, lateral y trasera (T-Pose).
2.  **Cortes Cinemáticos:** Primeros planos y tomas de acción.
3.  **Rango Emocional:** El mismo personaje mostrando diferentes emociones.
4.  **Insignia/Token VTT:** Un diseño circular o hexagonal listo para usar en tableros virtuales como Roll20.

### Memory Core (Historial)
Un sistema de almacenamiento local que guarda los últimos 20 prompts generados. Permite recuperar configuraciones perdidas si se recarga la página.

---

## 4. Experiencia de Usuario (UX)

*   **Estética Cyberpunk:** Interfaz inmersiva con efectos de neón, sonidos SFX futuristas y animaciones fluidas.
*   **Modo CRT:** Un filtro visual opcional que simula un monitor antiguo con scanlines y aberración cromática.
*   **Asistente N.E.O.:** Un sistema de ayuda contextual que explica cada parámetro al pasar el cursor por encima.
*   **Buffer de Previsualización:** Muestra en tiempo real cómo se construye el prompt antes de enviarlo a la IA.

---

## 5. Especificaciones Técnicas
*   **Frontend:** React 19 + TypeScript + Vite.
*   **Estilos:** Tailwind CSS con animaciones personalizadas.
*   **IA:** Google Gemini 2.5 Flash (vía API).
*   **Audio:** Motor de audio sintetizado en tiempo real (Web Audio API) para los efectos de sonido.
*   **Almacenamiento:** LocalStorage para el historial y preferencias.
