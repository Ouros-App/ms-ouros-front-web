import type { StateGoalAudience } from '@/services/metasService';

export interface EstadoBrasil {
    uf: string;
    nome: string;
}

export interface NovaMetaFormulario {
    state: string;
    title: string;
    deadline: string;
}

export interface NovaMetaPublico extends StateGoalAudience {
    scope: number | null;
}

export interface NovaMetaConsulta {
    estadosDisponiveis: EstadoBrasil[];
    audience: NovaMetaPublico | null;
    audienceError: string;
    attempt: number;
}

export interface NovaMetaEnvio {
    sending: boolean;
    error: string;
    message: string;
}