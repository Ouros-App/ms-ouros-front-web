import type { IndicadoresDashboard } from '@/types/dashboard.types';
import { formatarDecimal, formatarNumero } from '@/utils/formato';

interface ItemKpi{
    chave: keyof IndicadoresDashboard;
    rotulo: string;
    prefixo?: string;
    descricao: (anoAtual: number) => string;
    formatar: (valor: number) => string;
}

const emMilhoes = (valor: number) => `${formatarDecimal(valor / 1_000_000)}M`;
export const itensKpis: ItemKpi[] = [{
    chave: 'gastoAnoPassado',
    rotulo: 'Total',
    prefixo: 'R$',
    descricao: (anoAtual) => `Gasto - ${anoAtual - 1}`,
    formatar: emMilhoes,
},
{
    chave: 'gastoAnoAtual',
    rotulo: 'Total',
    prefixo: 'R$',
    descricao: (anoAtual) => `Gasto - ${anoAtual}`,
    formatar: emMilhoes,
},
{
    chave: 'custoPorAve',
    rotulo: 'Custo',
    prefixo: 'R$',
    descricao: () => 'Reais/ave',
    formatar: formatarDecimal,
},
{
    chave: 'totalLotes',
    rotulo: 'Total',
    descricao: () => 'Lotes',
    formatar: formatarNumero,
},
];