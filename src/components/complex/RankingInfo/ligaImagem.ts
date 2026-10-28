import type { LigaId } from '@/types/ranking.types';

const arquivos = import.meta.glob('/src/assets/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function imagemDaLiga(id: LigaId): string | undefined {
  const padrao = new RegExp(`/liga-${id}\\.(png|jpe?g|webp|svg)$`, 'i');
  return Object.entries(arquivos).find(([caminho]) => padrao.test(caminho))?.[1];
}