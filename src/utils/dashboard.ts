import type { FiltrosDashboard, OpcaoFiltro } from '@/types/dashboard.types';

export const filtrosPadrao: FiltrosDashboard = { periodo: 'atual', estado: 'todos' };
export const opcoesPeriodo: OpcaoFiltro[] = [
    { valor: 'atual', rotulo: 'Mês Atual' },
    { valor: 'ultimos-3', rotulo: 'Últimos 3 meses' },
    { valor: 'ultimos-6', rotulo: 'Últimos 6 meses' },
    { valor: 'ano-atual', rotulo: 'Ano atual' },
    { valor: 'ano-passado', rotulo: 'Ano passado' },
];

const estados: [string, string][] = [
    ['AC', 'Acre'],
    ['AL', 'Alagoas'],
    ['AP', 'Amapá'],
    ['AM', 'Amazonas'],
    ['BA', 'Bahia'],
    ['CE', 'Ceará'],
    ['DF', 'Distrito Federal'],
    ['ES', 'Espírito Santo'],
    ['GO', 'Goiás'],
    ['MA', 'Maranhão'],
    ['MT', 'Mato Grosso'],
    ['MS', 'Mato Grosso do Sul'],
    ['MG', 'Minas Gerais'],
    ['PA', 'Pará'],
    ['PB', 'Paraíba'],
    ['PR', 'Paraná'],
    ['PE', 'Pernambuco'],
    ['PI', 'Piauí'],
    ['RJ', 'Rio de Janeiro'],
    ['RN', 'Rio Grande do Norte'],
    ['RS', 'Rio Grande do Sul'],
    ['RO', 'Rondônia'],
    ['RR', 'Roraima'],
    ['SC', 'Santa Catarina'],
    ['SP', 'São Paulo'],
    ['SE', 'Sergipe'],
    ['TO', 'Tocantins'],
];

export const opcoesEstado: OpcaoFiltro[] = [
    { valor: 'todos', rotulo: 'Estado' },
    ...estados.map(([valor, rotulo]) => ({ valor, rotulo })),
];

export function filtrosValidos(filtros: FiltrosDashboard | null): FiltrosDashboard {
    if (!filtros) return filtrosPadrao;
    const periodo = opcoesPeriodo.some((o) => o.valor === filtros.periodo) ? filtros.periodo : filtrosPadrao.periodo;
    const estado = opcoesEstado.some((o) => o.valor === filtros.estado) ? filtros.estado : filtrosPadrao.estado;
    return { periodo, estado };
}