import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables desde archivos .env
  // Fix: Cast process to any to avoid type error if @types/node is missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // CRÍTICO: En Vercel, las variables están en process.env, no siempre en el objeto env de loadEnv.
  // Buscamos primero en el proceso del sistema (Vercel), luego en .env, o devolvemos cadena vacía.
  const apiKey = process.env.API_KEY || env.API_KEY || "";

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // Incrustamos la clave en el código final de forma segura
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});