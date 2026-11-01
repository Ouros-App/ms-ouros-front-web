import { useCallback, useEffect, useState } from "react";
import { contarNaoLidas, listarNotificacoes, marcarComoLida, marcarTodasComoLidas } from "@/services/notificacaoService";
import type { Notificacao, NotificacoesStatus } from "@/types/notificacoes.types";
import { isAbortError } from "@/utils/delay";

const INTERVALO_CONTAGEM_MS = 60_000;

export function useNotificacoes(){
    const [naoLidas, setNaoLidas] = useState(0);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [status, setStatus] = useState<NotificacoesStatus>('idle');
    const [mensagemErro, setMensagemErro] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const atualizar = () => {
            contarNaoLidas(controller.signal)
            .then(setNaoLidas)
            .catch((error: unknown) => {
                if(!isAbortError(error)) setNaoLidas(0);
            });
        };
        atualizar();
        const timer = window.setInterval(atualizar, INTERVALO_CONTAGEM_MS);
        return() => {
            window.clearInterval(timer);
            controller.abort();
        };
    }, []);

    const carregarLista = useCallback(async () => {
        setStatus('carregando');
        try {
            const lista = await listarNotificacoes();
            setNotificacoes(lista);
            setStatus('pronto');
        } catch (error) {
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar as notificações.');
            setStatus('erro');
        }
    }, []);

    const marcarLida = useCallback(async (id: number) => {
        const alvo = notificacoes.find((n) => n.id === id);
        if(!alvo || alvo.lida) return;
        try {
            const atualizada = await marcarComoLida(id);
            setNotificacoes((lista) => lista.map((n) => (n.id === id ? atualizada : n)));
            setNaoLidas((n) => Math.max(0, n - 1));
        } catch (error) {
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível marcar como lida.');
        }
    }, [notificacoes]);

    const marcarTodas = useCallback(async () => {
        try {
            await marcarTodasComoLidas();
            setNotificacoes((lista) => lista.map((n) => ({ ...n, lida: true })));
            setNaoLidas(0);
            setMensagemErro('');
        } catch (error) {
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível marcar as notificações como lidas.');
        }
    }, []);

    return {marcarTodas, naoLidas, notificacoes, status, mensagemErro, carregarLista, marcarLida};
}
