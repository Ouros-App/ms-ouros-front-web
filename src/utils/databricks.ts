import type { GraficoId } from '@/types/dashboard.types';

export const DATABRICKS_ATIVO = import.meta.env.VITE_DATABRICKS_ATIVO === 'true';
export const caminhosDatabricks: Record<GraficoId, string> = {
    'mapa-custo': '/databricks/custo-por-estado',
    'custo-lote': '/databricks/custo-por-lote',
    'custo-regiao': '/databricks/custo-por-regiao',
    'custo-mensal': '/databricks/custo-mensal',
};