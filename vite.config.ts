import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables desde archivos .env
  // Fix: Cast process to any to avoid type error if @types/node is missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // CRÍTICO: En Vercel/Hostinger, las variables están en process.env, no siempre en el objeto env de loadEnv.
  const apiKey = process.env.API_KEY || env.API_KEY || "";
  const apiKeySec = process.env.API_KEY_SECONDARY || env.API_KEY_SECONDARY || "";
  const apiKeyTer = process.env.API_KEY_TERTIARY || env.API_KEY_TERTIARY || "";

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // Incrustamos las claves en el código final de forma segura
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY_SECONDARY': JSON.stringify(apiKeySec),
      'process.env.API_KEY_TERTIARY': JSON.stringify(apiKeyTer)
    }
  };
});