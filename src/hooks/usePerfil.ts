import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { atualizarPerfil, obterPerfil } from "@/services/perfilService";
import type { Perfil, PerfilAtualizacao, PerfilStatus } from "@/types/perfil.types";
import { isAbortError } from "@/utils/delay";

export function usePerfil(){
    const {user, updateUser} = useAuth();
    const id = user?.id;
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [status, setStatus] = useState<PerfilStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if(!id) return;
        const controller = new AbortController();
        setStatus('carregando');

        obterPerfil(id, controller.signal)
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
    }, [id, tentativa]);

    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

    const salvar = useCallback(
        async (dados: PerfilAtualizacao) => {
            if(!id) return;
            const atualizado = await atualizarPerfil(id, dados);
            setPerfil(atualizado);
            updateUser({name: atualizado.nome, email: atualizado.email, avatarUrl: atualizado.avatarUrl ?? undefined,});
        },
        [id, updateUser],
    );
    return {perfil, status, mensagemErro, recarregar, salvar};
}