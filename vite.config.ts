import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { SPRING_API_URL_PADRAO, validarSpringApiUrl } from './src/utils/validarSpringApiUrl';

function removerBarrasFinais(url: string): string {
  let fim = url.length;
  while (fim > 0 && url[fim - 1] === '/') {
    fim -= 1;
  }
  return url.slice(0, fim);
}

export default defineConfig(({ mode, command, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (command === 'build' && !isPreview) {
    validarSpringApiUrl(env.VITE_SPRING_API_URL || SPRING_API_URL_PADRAO);
  }
  const authTarget = removerBarrasFinais(env.VITE_AUTH_API_URL || 'https://ms-auth-service.discloud.app');
  const springTarget = removerBarrasFinais(env.VITE_SPRING_API_URL || SPRING_API_URL_PADRAO);
  const telemetryTarget = removerBarrasFinais(env.VITE_TELEMETRY_API_URL || 'https://ouros-dashboard.discloud.app');

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
            proxy.on('proxyRes', (proxyRes) => {
              const setCookie = proxyRes.headers['set-cookie'];
              if (Array.isArray(setCookie)) {
                proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                  cookie
                    .replace(/;\s*Secure/gi, '')
                    .replace(/SameSite=None/gi, 'SameSite=Lax'),
                );
              }
            });
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
        '/spring': {
          target: springTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/spring/, ''),
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    detail: 'Servico ms-spring-api indisponivel no momento (' + springTarget + ').',
                    offline: true,
                    error: (err as Error).message,
                  }),
                );
              }
            });
          },
        },
        '/v1/admin': {
          target: telemetryTarget,
          changeOrigin: true,
          secure: false,
        },
        '/v1/user': {
          target: telemetryTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    detail: `Serviço ms-telemetry-dashboard-service indisponível no momento (${telemetryTarget}).`,
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
      port: Number(env.PORT || 5173),
    },
  };
});
