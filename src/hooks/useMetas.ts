import { useCallback, useState } from 'react';
import { atualizarMeta, excluirMeta, lancarMetaEstadual, listarMetasPaginadas } from '@/services/metasService';
import type { MetaEdicao } from '@/types/metas.types';
import type { MetasPageResponse } from '@/services/metasService';
import { usePagedList } from './usePagedList';

export function useMetas() {
    const [busca, setBusca] = useState('');
    const load = useCallback((page: number, size: number, signal: AbortSignal) =>
        listarMetasPaginadas({ page, size, search: busca }, signal), [busca]);
    const list = usePagedList<MetasPageResponse>(load);
    const lancar = async (titulo: string) => {
        await lancarMetaEstadual(titulo);
        list.recarregar();
        return 1;
    };
    const salvar = async (id: string, dados: MetaEdicao) => { await atualizarMeta(id, dados); list.recarregar(); };
    const excluir = async (id: string) => { await excluirMeta(id); list.recarregar(); };
    const resumo = list.response?.summary ?? null;
    return { metas: list.items, resumo, status: list.status, mensagemErro: list.mensagemErro,
        busca, setBusca, lancar, salvar, excluir, recarregar: list.recarregar, pagination: list.pagination };
}
