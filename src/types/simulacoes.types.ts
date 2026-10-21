export interface Simulacao{
    id: string;
    idLote: string;
    consumoAtual: number;
    consumoAlvo: number;
    precoAgua: number;
    precoEnergia: number;
    quantidadeAves: number;
    gastoAlvoEnergia: number;
}

export type SimulacaoNova = Omit<Simulacao, 'id'>;

export type CampoOrdenacaoSimulacao = | 'padrao' | 'consumoAtual' | 'consumoAlvo' | 'precoAgua' | 'precoEnergia' | 'quantidadeAves' | 'gastoAlvoEnergia';

export type SimulacoesStatus = 'carregando' | 'pronto' | 'erro';

export interface SimulacaoValores{
    idLote: string;
    consumoAtual: string;
    consumoAlvo: string;
    precoAgua: string;
    precoEnergia: string;
    quantidadeAves: string;
    gastoAlvoEnergia: string;
}

export type SimulacaoErros = Partial<Record<keyof SimulacaoValores, string>>;

export interface IndicadoresSimulacao{
    consumo: number;
    kwhPorAve: number;
    litrosPorAve: number;
    posicao: number;
}

export type IndicadoresStatus = 'carregando' | 'pronto' | 'erro';

    export interface IndicadorCardProps {
        rotulo: string;
        valor: string;
        icone: React.ReactNode;
}

export interface IndicadoresSimulacaoProps{
    indicadores: IndicadoresSimulacao | null;
    status: IndicadoresStatus;
    mensagemErro: string;
    onRecarregar: () => void;
}

export interface SimulacoesCardProps{
    simulacoes: Simulacao[];
    status: SimulacoesStatus;
    mensagemErro: string;
    busca: string;
    ordenacao: CampoOrdenacaoSimulacao;
    onBuscar: (valor: string) => void;
    onOrdenar: (campo: CampoOrdenacaoSimulacao) => void;
    onSalvar: (dados: SimulacaoNova, id?: string) => Promise<void>;
    onExcluir: (id: string) => Promise<void>;
    onRecarregar: () => void;
}

export interface SimulacaoModalProps{
    simulacao: Simulacao | null;
    onFechar: () => void;
    onSalvar: (dados: SimulacaoNova, id?: string) => Promise<void>;
}

export interface ConfirmarExclusaoSimulacaoProps{
    simulacao: Simulacao;
    onFechar: () => void;
    onExcluir: (id: string) => Promise<void>;
}

export interface DialogoSimulacaoProps{
    titulo: string;
    onFechar: () => void;
    children: React.ReactNode;
}

export interface SimulacoesTabelaProps{
    simulacoes: Simulacao[];
    onEditar: (simulacao: Simulacao) => void;
    onExcluir: (simulacao: Simulacao) => void;
}