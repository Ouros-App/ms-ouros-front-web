import { useCallback, useEffect, useMemo, useState } from "react";
import { atualizarRegistro, criarRegistro, excluirRegistro, listarRegistro } from "@/services/registroService";
import type { CampoOrdenacao, Registro, RegistroNovo, RegistrosStatus } from "@/types/registros.types";
import { isAbortError } from "@/utils/delay";
import { filtrarEOrdenar, opcoesOrdenacao } from "@/utils/registros";
import { lerArmazenado, salvarArmazenado } from "@/utils/storage";

const CHAVE_ORDENACAO = 'ouros:registro-ordenacao';

function ordenacaoSalva(): CampoOrdenacao{
    const salva = lerArmazenado<CampoOrdenacao>(CHAVE_ORDENACAO);
    return opcoesOrdenacao.some((o)=> o.valor === salva) ? (salva as CampoOrdenacao): 'padrao';
}

export function useRegistros(){
    const [todos,setTodos] = useState<Registro[]>([]);
    const [status, setStatus] = useState<RegistrosStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacaoEstado] = useState<CampoOrdenacao>(ordenacaoSalva);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setStatus('carregando');
    
        listarRegistro(controller.signal)
            .then((dados) => {
                setTodos(dados);
                setStatus('pronto');
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted || isAbortError(error)) return;
                setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar os registros.');
                setStatus('erro');
            });
            return () => controller.abort();
        }, [tentativa]);
        const setOrdenacao = useCallback((campo: CampoOrdenacao) => {
            setOrdenacaoEstado(campo);
            salvarArmazenado(CHAVE_ORDENACAO, campo);
        }, []);
        const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
        const salvar = useCallback(async (dados: RegistroNovo, id?: string) => {
            if (id) {
                const atualizado = await atualizarRegistro(id, dados);
                setTodos((lista) => lista.map((r) => (r.id === id ? atualizado : r)));
                return;
            }
            const criado = await criarRegistro(dados);
            setTodos((lista) => [...lista, criado]);
        }, []);
        
        const excluir = useCallback(async (id: string) => {
            await excluirRegistro(id);
            setTodos((lista) => lista.filter((r) => r.id !== id));
        }, []);

        const registros = useMemo(() => filtrarEOrdenar(todos, busca, ordenacao), [todos, busca, ordenacao]);
        return { registros, status, mensagemErro, busca, ordenacao, setBusca, setOrdenacao, salvar, excluir, recarregar };
}
