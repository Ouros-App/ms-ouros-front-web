/** Produção exige uma API HTTPS pública ou um caminho explícito de proxy na mesma origem. */
export function validarSpringApiUrl(valor?: string): string {
  const url = valor ?? '';
  const mensagem = 'Configure VITE_SPRING_API_URL com uma URL HTTPS pública ou um caminho de proxy de mesma origem (ex.: /spring).';
  if (!url || /[\\\s?#]/.test(url)) throw new Error(mensagem);
  if (url.startsWith('/') && !url.startsWith('//')) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(mensagem);
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  const ipv4 = /^\d+\.\d+\.\d+\.\d+$/.test(host) ? host.split('.').map(Number) : null;
  const privado = ipv4 && (
    ipv4[0] === 0 || ipv4[0] === 10 || ipv4[0] === 127 || ipv4[0] >= 224 ||
    (ipv4[0] === 169 && ipv4[1] === 254) ||
    (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) ||
    (ipv4[0] === 192 && ipv4[1] === 168) ||
    (ipv4[0] === 100 && ipv4[1] >= 64 && ipv4[1] <= 127)
  );
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || privado ||
      host.includes(':') || !host.includes('.') ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host)) {
    throw new Error(mensagem);
  }
  return url;
}
