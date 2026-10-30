import { useCallback, useEffect, useMemo, useState } from 'react';
import { atualizarParticipante, excluirParticipante, listarParticipantes } from '@/services/rankingService';
import type { CampoOrdenacaoRanking, Participante, ParticipanteEdicao, RankingStatus } from '@/types/ranking.types';
import { isAbortError } from '@/utils/delay';
import { classificar, filtrarEOrdenarRanking, opcoesOrdenacaoRanking } from '@/utils/ranking';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';

const CHAVE_ORDENACAO = 'ouros:ranking-ordenacao';

function ordenacaoSalva(): CampoOrdenacaoRanking {
    const salva = lerArmazenado<CampoOrdenacaoRanking>(CHAVE_ORDENACAO);
    return opcoesOrdenacaoRanking.some((o) => o.valor === salva) ? (salva as CampoOrdenacaoRanking) : 'padrao';
}

export function useRanking(empresaSelecionada?: number | null) {
    const [todos, setTodos] = useState<Participante[]>([]);
    const [status, setStatus] = useState<RankingStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacaoRanking>(ordenacaoSalva);
    const [tentativa, setTentativa] = useState(0);
    
    useEffect(() => {
        const controller = new AbortController();
        setStatus('carregando');
        
        listarParticipantes(controller.signal, empresaSelecionada ?? undefined)
        .then((dados: Participante[]) => {
            setTodos(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) => {
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar o ranking.');
            setStatus('erro');
        });
        
        return () => controller.abort();
    }, [tentativa, empresaSelecionada]);
    
    const setOrdenacao = useCallback((campo: CampoOrdenacaoRanking) => {
        setOrdenacaoEstado(campo);
        salvarArmazenado(CHAVE_ORDENACAO, campo);
    }, []);
    
    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
    const salvar = useCallback(async (id: string, dados: ParticipanteEdicao) => {
        const atualizado = await atualizarParticipante(id, dados);
        setTodos((lista) => lista.map((p) => (p.id === id ? atualizado : p)));
    }, []);
    
    const excluir = useCallback(async (id: string) => {
        await excluirParticipante(id);
        setTodos((lista) => lista.filter((p) => p.id !== id));
    }, []);

    const classificados = useMemo(() => classificar(todos), [todos]);
    const participantes = useMemo(
        () => filtrarEOrdenarRanking(classificados, busca, ordenacao),
        [classificados, busca, ordenacao],
    );
    return { participantes, status, mensagemErro, busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar };
}
