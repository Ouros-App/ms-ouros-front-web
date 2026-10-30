import { useCallback, useState } from 'react';
import { listarRankingPaginado, atualizarParticipante, excluirParticipante } from '@/services/rankingService';
import type { ParticipanteEdicao, CampoOrdenacaoRanking } from '@/types/ranking.types';
import { opcoesOrdenacaoRanking } from '@/utils/ranking';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';
import { usePagedList } from './usePagedList';

const CHAVE = 'ouros:ranking-ordenacao';
export function useRanking(empresaSelecionada?: number | null) {
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacaoRanking>(() => {
        const value = lerArmazenado<CampoOrdenacaoRanking>(CHAVE);
        return opcoesOrdenacaoRanking.some((o) => o.valor === value) ? value! : 'padrao';
    });
    const load = useCallback((page: number, size: number, signal: AbortSignal) => {
        const orders = {padrao: { sort: 'padrao', direction: 'asc' }, nome: { sort: 'nome', direction: 'asc' }, pontuacao: { sort: 'pontuacao', direction: 'asc' }} as const;
        const order = orders[ordenacao as keyof typeof orders] ?? orders.padrao;
        return listarRankingPaginado({ page, size, search: busca, ...order }, signal, empresaSelecionada ?? undefined);
    }, [busca, ordenacao, empresaSelecionada]);
    const list = usePagedList(load);
    const setOrdenacao = useCallback((campo: CampoOrdenacaoRanking) => {
        setOrdenacaoEstado(campo);
        salvarArmazenado(CHAVE, campo);
    }, []);
    const salvar = async (id: string, dados: ParticipanteEdicao) => { await atualizarParticipante(id, dados); list.recarregar(); };
    const excluir = async (id: string) => { await excluirParticipante(id); list.recarregar(); };
    return { participantes: list.items, status: list.status, mensagemErro: list.mensagemErro,
        busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar: list.recarregar, pagination: list.pagination };
}
