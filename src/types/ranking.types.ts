import React from "react";

export type LigaId = 'ouro' | 'prata' | 'bronze' | 'cobre' | 'ferro';
export interface Participante{
    id: string;
    nome: string;
    pontuacao: number;
    atualizadoEm: string;
}

export interface ParticipanteRanking extends Participante{
    posicao: number;
    liga: LigaId;
}

export type ParticipanteEdicao = Pick<Participante, 'nome' | 'pontuacao'>;
export type CampoOrdenacaoRanking = 'padrao' | 'nome' | 'pontuacao' | 'atualizacao';
export type RankingStatus = 'carregando' | 'pronto' | 'erro';

export interface LigaInfo{
    id: string;
    nome: string;
    descricao: string;
    cor: string;
}

export interface RankingCardProps{
    participantes: ParticipanteRanking[];
    status: RankingStatus;
    mensagemErro: string;
    busca: string;
    ordenacao: CampoOrdenacaoRanking;
    onBuscar: (valor: string) => void;
    onOrdenar: (campo: CampoOrdenacaoRanking) => void;
    onSalvar: (id: string, dados: ParticipanteEdicao) => Promise<void>;
    onExcluir: (id: string) => Promise<void>;
    onRecarregar: () => void;
}

export interface RankingTabelaProps{
    participantes: ParticipanteRanking;
    onEditar: () => void;
    onExcluir: (id: string, dados: ParticipanteEdicao) => Promise<void>;
}

export interface RankingModalProps{
    participante: ParticipanteRanking;
    onFechar: () => void;
    onSalvar: (id: string, dados: ParticipanteEdicao) => Promise<void>;
}

export interface ConfirmarExclusaoRankingProps{
    titulo: string;
    onFechar: () => void;
    onExcluir: (id: string) => Promise<void>;
}

export interface DialogoRankingProps{
    titulo: string;
    onFechar: () => void;
    children: React.ReactNode;
}