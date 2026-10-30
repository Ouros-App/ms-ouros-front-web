import { useCallback, useState } from 'react';
import { listarSimulacoesPaginadas, atualizarSimulacao, criarSimulacao, excluirSimulacao } from '@/services/simulacoesService';
import type { SimulacaoNova, CampoOrdenacaoSimulacao } from '@/types/simulacoes.types';
import { opcoesOrdenacaoSimulacao } from '@/utils/simulacoes';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';
import { usePagedList } from './usePagedList';

const CHAVE = 'ouros:simulacoes-ordenacao';
export function useSimulacoes() {
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacaoSimulacao>(() => {
        const value = lerArmazenado<CampoOrdenacaoSimulacao>(CHAVE);
        return opcoesOrdenacaoSimulacao.some((o) => o.valor === value) ? value! : 'padrao';
    });
    const load = useCallback((page: number, size: number, signal: AbortSignal) => {
        const orders = {padrao: { sort: 'padrao', direction: 'desc' }, consumoAtual: { sort: 'current_cgi', direction: 'desc' }, consumoAlvo: { sort: 'target_cgi', direction: 'desc' }, precoAgua: { sort: 'water_price', direction: 'desc' }, precoEnergia: { sort: 'energy_price', direction: 'desc' }, quantidadeAves: { sort: 'poultry_quantity', direction: 'desc' }, gastoAlvoEnergia: { sort: 'target_energy_kwh', direction: 'desc' }} as const;
        const order = orders[ordenacao as keyof typeof orders] ?? orders.padrao;
        return listarSimulacoesPaginadas({ page, size, search: busca, ...order }, signal);
    }, [busca, ordenacao]);
    const list = usePagedList(load);
    const setOrdenacao = useCallback((campo: CampoOrdenacaoSimulacao) => {
        setOrdenacaoEstado(campo);
        salvarArmazenado(CHAVE, campo);
    }, []);
    const salvar = async (dados: SimulacaoNova, id?: string) => {
        if (id) await atualizarSimulacao(id, dados);
        else await criarSimulacao(dados);
        list.recarregar();
    };
    const excluir = async (id: string) => { await excluirSimulacao(id); list.recarregar(); };
    return { simulacoes: list.items, status: list.status, mensagemErro: list.mensagemErro,
        busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar: list.recarregar, pagination: list.pagination };
}
