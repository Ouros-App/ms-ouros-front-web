export interface FiltrosDashboard{
    periodo: string;
    estado: string;
}

export interface OpcaoFiltro{
    valor: string;
    rotulo: string;
}

export interface IndicadoresDashboard{
    gastoAnoPassado: number;
    gastoAnoAtual: number;
    custoPorAve: number;
    totalLotes: number;
}

export type DashboardStatus = 'carregando' | 'pronto' | 'erro';
export interface CustoPorEstado{
    uf: string;
    custo: number;
}

export interface CustoPorLote{
    faixa: string;
    anoPassado: number;
    esteAno: number;
}

export interface DistribuicaoCusto{
    minimo: number;
    primeiroQuartil: number;
    mediana: number;
    terceiroQuartil: number;
    maximo: number;
}

export interface CustoPorRegiao{
    regiao: string;
    anoPassado: DistribuicaoCusto;
    esteAno: DistribuicaoCusto;
}

export interface CustoMensal{
    mes: string;
    anoPassado: number | null;
    esteAno: number | null;
}

export interface DadosGraficos{
    'mapa-custo': CustoPorEstado[];
    'custo-lote': CustoPorLote[];
    'custo-regiao': CustoPorRegiao[];
    'custo-mensal': CustoMensal[];
}

export type GraficoId = keyof DadosGraficos;
export type GraficoStatus = 'aguardando' | 'carregando' | 'pronto' | 'erro';

export interface KpiCardProps{
    rotulo: string;
    prefixo?: string;
    valor: string;
    descricao: string;
}

export interface KpisDashboardProps{
    indicadores: IndicadoresDashboard | null;
    status: DashboardStatus;
    mensagemErro: string;
    onRecarregar: () => void;
}

export interface FiltrosDashboardProps{
    filtros: FiltrosDashboard;
    onAlterar: (filtros: FiltrosDashboard) => void;
}

export interface PainelGraficoProps{
    titulo: string;
    status: GraficoStatus;
    mensagemErro: string;
    onRecarregar: () => void;
    children?: React.ReactNode;
}

export interface GraficosDashboardProps{
    filtros: FiltrosDashboard;
}