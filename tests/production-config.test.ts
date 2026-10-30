import { expect, it } from 'vitest';
import { validarSpringApiUrl } from '@/utils/validarSpringApiUrl';
for (const value of [undefined, '', 'http://localhost:8080', 'https://localhost', 'https://127.0.0.1', 'https://10.0.0.1', 'https://192.168.1.1', 'https://172.16.0.1', 'https://[::1]', '//remote.example.com', '/\\remote.example.com', 'https://u:p@api.example.com', 'http://api.example.com']) {
  it(`rejeita configuração Spring de produção insegura: ${value}`, () => {
    expect(() => validarSpringApiUrl(value)).toThrow('VITE_SPRING_API_URL');
  });
}
for (const value of ['https://ms-spring-api.discloud.app', '/spring', '/']) {
  it(`aceita API HTTPS ou proxy explícito: ${value}`, () => expect(validarSpringApiUrl(value)).toBe(value));
}
