import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { atualizarPerfil, obterPerfil } from "@/services/perfilService";
import type { Perfil, PerfilAtualizacao, PerfilStatus } from "@/types/perfil.types";
import { isAbortError } from "@/utils/delay";

export function usePerfil(){
    const {user, updateUser} = useAuth();
    const autenticado = Boolean(user);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [status, setStatus] = useState<PerfilStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if(!autenticado) return;
        const controller = new AbortController();
        setStatus('carregando');

        obterPerfil(controller.signal)
        .then((dados) => {
            setPerfil(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) => {
            if(controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar p érfil.');
            setStatus('erro');
        });

        return() => controller.abort();
    }, [autenticado, tentativa]);

    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

    const salvar = useCallback(
        async (dados: PerfilAtualizacao) => {
            if(!perfil) return;
            const atualizado = await atualizarPerfil(perfil.id, dados);
            setPerfil(atualizado);
            updateUser({name: atualizado.nome, avatarUrl: atualizado.avatarUrl ?? undefined});
        },
        [perfil, updateUser],
    );
    return {perfil, status, mensagemErro, recarregar, salvar};
}