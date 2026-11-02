export interface Granja{
    id: number;
    nome: string;
    regiao: string | null;
    idEnterprise: number | null;
}

export type GranjasStatus = 'carregando' | 'pronto' | 'erro';

export interface GranjasEstado {
    lista: Granja[];
    status: GranjasStatus;
    mensagemErro: string;
}

export interface FiltrosGranjasCorporativas {
    enterpriseId?: number | null;
    state?: string;
    management?: string;
    period?: string;
}