export interface FiltrosDashboard {
  periodo: string;
  estado: string;
  gerencia?: string;
  enterpriseId?: number | null;
}

export interface OpcaoFiltro {
  valor: string;
  rotulo: string;
}

export interface OpcoesFiltrosCorporativos {
  periods: string[];
  states: string[];
  regional_managements: string[];
}

export interface CorporateKpiItem {
  value: number;
  formatted: string;
  unit: string | null;
  year: number | null;
}

export interface CorporateKpisResponse {
  spend_previous_year: CorporateKpiItem;
  spend_current_year: CorporateKpiItem;
  avg_cost_per_bird: CorporateKpiItem;
  total_lots: CorporateKpiItem;
}

// 1. Gráfico Custo (Mapa Coroplético / Buckets)
export interface CostDistributionBucket {
  bucket: string;
  label: string;
  count: number;
  value: number;
  color?: string;
  low?: number;
  high?: number | null;
  total_cost?: number;
  percentage?: number;
  regions?: string[];
}

// 2. Gráfico Custo por Lote (Coortes adaptativas ou fixas de tamanho de lote)
export interface CostByLotSizeCohort {
  cohort: string;
  previous_year_cost: number;
  current_year_cost: number;
  previous_year_lots?: number;
  current_year_lots?: number;
  min_birds?: number | null;
  max_birds?: number | null;
}

// 3. Gráfico Custo por Região (Box Plot Stats)
export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  avg?: number;
  total_cost?: number;
  lots_count?: number;
}

export interface CostByRegion {
  region: string;
  previous_year_cost: number;
  current_year_cost: number;
  cost?: number;
  color?: string;
  bucket?: string;
  previous_year?: BoxPlotStats;
  current_year?: BoxPlotStats;
}

// 4. Gráfico Custo Mensal (12 meses comparativos)
export interface MonthlyCost {
  month?: number;
  month_label?: string;
  month_start?: string;
  previous_year_cost?: number;
  current_year_cost?: number;
  cost?: number;
}

// Opcionais de Telemetria
export interface TendenciaKwhAves {
  month_start: string;
  chickens: number;
  energy_kwh: number;
}

export interface TendenciaLitrosAves {
  month_start: string;
  chickens: number;
  water_liters: number;
}

export interface FarmSummaryItem {
  farm_id: number;
  farm_name: string;
  manager_name: string | null;
  location: string;
  state?: string | null;
  regional_management?: string | null;
  total_consumption: string;
  lots_count: number;
  avg_lot_cost: number;
  avg_cost_per_bird: number;
}

export interface CorporateFarmsTableResponse {
  total: number;
  page: number;
  limit: number;
  items: FarmSummaryItem[];
}

export interface DadosGraficosCorporativos {
  'cost-distribution-buckets': CostDistributionBucket[];
  'cost-by-lot-size-cohort': CostByLotSizeCohort[];
  'cost-by-region': CostByRegion[];
  'monthly-cost': MonthlyCost[];
  'trend-kwh-aves'?: TendenciaKwhAves[];
  'trend-liters-aves'?: TendenciaLitrosAves[];
}

export type CorporateGraficoId = keyof DadosGraficosCorporativos;

// Compatibilidade legada
export interface IndicadoresDashboard {
  gastoAnoPassado: number;
  gastoAnoAtual: number;
  custoPorAve: number;
  totalLotes: number;
}

export type DashboardStatus = 'carregando' | 'pronto' | 'erro';
export type GraficoStatus = 'aguardando' | 'carregando' | 'pronto' | 'erro';

export interface CustoPorEstado {
  uf: string;
  custo: number;
}

export interface CustoPorLote {
  faixa: string;
  anoPassado: number;
  esteAno: number;
}

export interface DistribuicaoCusto {
  minimo: number;
  primeiroQuartil: number;
  mediana: number;
  terceiroQuartil: number;
  maximo: number;
}

export interface CustoPorRegiao {
  regiao: string;
  anoPassado: DistribuicaoCusto;
  esteAno: DistribuicaoCusto;
}

export interface CustoMensal {
  mes: string;
  anoPassado: number | null;
  esteAno: number | null;
}

export interface DadosGraficos {
  'mapa-custo': CustoPorEstado[];
  'custo-lote': CustoPorLote[];
  'custo-regiao': CustoPorRegiao[];
  'custo-mensal': CustoMensal[];
}

export type GraficoId = keyof DadosGraficos;

export interface KpiCardProps {
  rotulo: string;
  prefixo?: string;
  valor: string;
  descricao: string;
}

export interface KpisDashboardProps {
  indicadores: CorporateKpisResponse | IndicadoresDashboard | null;
  status: DashboardStatus;
  mensagemErro: string;
  onRecarregar: () => void;
}

export interface FiltrosDashboardProps {
  filtros: FiltrosDashboard;
  opcoes?: OpcoesFiltrosCorporativos | null;
  carregandoOpcoes?: boolean;
  onAlterar: (filtros: FiltrosDashboard) => void;
}

export interface PainelGraficoProps {
  titulo: string;
  status: GraficoStatus;
  mensagemErro: string;
  onRecarregar: () => void;
  children?: React.ReactNode;
}

export interface GraficosDashboardProps {
  filtros: FiltrosDashboard;
}
