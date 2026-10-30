export interface MetaEstadual{
    id: string;
    estado: string;
    meta: string;
    totalGranjas: number;
    concluidos: number;
}

export type MetaEdicao = Pick<MetaEstadual, 'meta' | 'totalGranjas' | 'concluidos'>;
export type MetasStatus = 'carregando' | 'pronto' | 'erro';

export interface ResumoMetas{
    percentual: number;
    concluidas: number;
    total: number;
}

export interface MetaValores{
    meta: string;
    totalGranjas: string;
    concluidos: string;
}

export type MetaErros = Partial<Record<keyof MetaValores, string>>;

export interface GraficoProgressoProps{
    percentual: number;
}

export interface MetasResumoProps{
    resumo: ResumoMetas | null;
    status: MetasStatus;
    mensagemErro: string;
    onRecarregar: () => void;
    onLancar: (titulo: string) => Promise<number>;
}

export interface NovaMetaFormProps{
    onLancar: (titulo: string) => Promise<number>;
}

export interface MetasCardProps{
    metas: MetaEstadual[];
    status: MetasStatus;
    mensagemErro:string;
    busca: string;
    onBuscar: (valor: string) => void;
    onSalvar: (id: string, dados: MetaEdicao) => Promise<void>;
    onExcluir: (id: string) => Promise<void>;
    onRecarregar: () => void;
}

export interface MetasTabelaProps{
    metas: MetaEstadual[];
    onEditar: (meta: MetaEstadual) => void;
    onExcluir: (meta: MetaEstadual) => void;
}

export interface MetaModalProps{
    meta: MetaEstadual;
    onFechar: () => void;
    onSalvar: (id: string, dados: MetaEdicao) => Promise<void>;
}

export interface ConfirmarExclusaoMetaProps{
    meta: MetaEstadual;
    onFechar: () => void;
    onExcluir: (id: string) => Promise<void>;
}

export interface DialogoMetaProps{
    titulo: string;
    onFechar: () => void;
    children: React.ReactNode;
}