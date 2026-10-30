import { useCallback, useState } from 'react';
import { listarRegistrosPaginados, atualizarRegistro, criarRegistro, excluirRegistro } from '@/services/registroService';
import type { RegistroNovo, CampoOrdenacao } from '@/types/registros.types';
import { opcoesOrdenacao } from '@/utils/registros';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';
import { usePagedList } from './usePagedList';

const CHAVE = 'ouros:registro-ordenacao';
export function useRegistros() {
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacao>(() => {
        const value = lerArmazenado<CampoOrdenacao>(CHAVE);
        return opcoesOrdenacao.some((o) => o.valor === value) ? value! : 'padrao';
    });
    const load = useCallback((page: number, size: number, signal: AbortSignal) => {
        const orders = {padrao: { sort: 'padrao', direction: 'desc' }, hidrometro: { sort: 'hidrometro', direction: 'desc' }, custo: { sort: 'custo', direction: 'desc' }, entraram: { sort: 'entraram', direction: 'desc' }, sairam: { sort: 'sairam', direction: 'desc' }, atuais: { sort: 'galinhas_atuais', direction: 'desc' }} as const;
        const order = orders[ordenacao as keyof typeof orders] ?? orders.padrao;
        return listarRegistrosPaginados({ page, size, search: busca, ...order }, signal);
    }, [busca, ordenacao]);
    const list = usePagedList(load);
    const setOrdenacao = useCallback((campo: CampoOrdenacao) => {
        setOrdenacaoEstado(campo);
        salvarArmazenado(CHAVE, campo);
    }, []);
    const salvar = async (dados: RegistroNovo, id?: string) => {
        if (id) await atualizarRegistro(id, dados);
        else await criarRegistro(dados);
        list.recarregar();
    };
    const excluir = async (id: string) => { await excluirRegistro(id); list.recarregar(); };
    return { registros: list.items, status: list.status, mensagemErro: list.mensagemErro,
        busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar: list.recarregar, pagination: list.pagination };
}
