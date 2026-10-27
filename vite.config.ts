import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authTarget = env.VITE_AUTH_API_URL || 'https://ms-auth-service.discloud.app';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.PORT || 5173),
      proxy: {
        '/v1/auth': {
          target: authTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    detail: `Serviço ms-auth-service indisponível no momento (${authTarget}).`,
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
      port: Number(env.PORT || 4173),
    },
  };
});
