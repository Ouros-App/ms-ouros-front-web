import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 5173),
    proxy: {
      '/v1/auth': {
        target: process.env.VITE_AUTH_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            // Intercepta ECONNREFUSED quando o ms-auth-service ainda não está rodando localmente
            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  detail: 'Serviço ms-auth-service não está em execução na porta 8000.',
                  offline: true,
                  error: (err as Error).message,
                }),
              );
            }
          });
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 4173),
  },
});
