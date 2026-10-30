import { useCallback, useEffect, useMemo, useState } from 'react';
import {atualizarSimulacao, criarSimulacao, excluirSimulacao, listarSimulacoes} from '@/services/simulacoesService';
import type {CampoOrdenacaoSimulacao, Simulacao, SimulacaoNova, SimulacoesStatus} from '@/types/simulacoes.types';
import { isAbortError } from '@/utils/delay';
import { filtrarEOrdenarSimulacoes, opcoesOrdenacaoSimulacao } from '@/utils/simulacoes';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';

const CHAVE_ORDENACAO = 'ouros:simulacoes-ordenacao';
function ordenacaoSalva(): CampoOrdenacaoSimulacao {
    const salva = lerArmazenado<CampoOrdenacaoSimulacao>(CHAVE_ORDENACAO);
    return opcoesOrdenacaoSimulacao.some((o) => o.valor === salva) ? (salva as CampoOrdenacaoSimulacao) : 'padrao';
}

export function useSimulacoes() {
    const [todas, setTodas] = useState<Simulacao[]>([]);
    const [status, setStatus] = useState<SimulacoesStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacaoSimulacao>(ordenacaoSalva);
    const [tentativa, setTentativa] = useState(0);
    
    useEffect(() => {
        const controller = new AbortController();
        setStatus('carregando');
        
        listarSimulacoes(controller.signal)
        .then((dados) => {
            setTodas(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) => {
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar as simulações.');
            setStatus('erro');
        });

        return () => controller.abort();
        }, [tentativa]);

        const setOrdenacao = useCallback((campo: CampoOrdenacaoSimulacao) => {
            setOrdenacaoEstado(campo);
            salvarArmazenado(CHAVE_ORDENACAO, campo);
        }, []);
        
        const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
        const salvar = useCallback(async (dados: SimulacaoNova, id?: string) => {
        if (id) {
            const atualizada = await atualizarSimulacao(id, dados);
            setTodas((lista) => lista.map((s) => (s.id === id ? atualizada : s)));
            return;
        }
    
        const criada = await criarSimulacao(dados);
        setTodas((lista) => [...lista, criada]);
    }, []);
    
    const excluir = useCallback(async (id: string) => {
        await excluirSimulacao(id);
        setTodas((lista) => lista.filter((s) => s.id !== id));
    }, []);
    
    const simulacoes = useMemo(() => filtrarEOrdenarSimulacoes(todas, busca, ordenacao), [todas, busca, ordenacao]);
    
    return { simulacoes, status, mensagemErro, busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar };
}