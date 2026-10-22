import { useCallback, useState } from "react";
import { prepararFoto } from "@/utils/fotos";

export function usePerfilFoto(salva: string | null){
    const [editada, setEditada] = useState<string | null | undefined >(undefined);
    const [erro, setErro] = useState('');
    const [processando, setProcessando] = useState(false);

    const foto = editada === undefined ? salva : editada;

    const escolher = useCallback(async (arquivo: File) => {
        setErro('');
        setProcessando(true);
        try{
            setEditada(await prepararFoto(arquivo));
        }
        catch(error){
            setErro(error instanceof Error ? error.message : 'Não foi possível carregar a imagem.');
        }
        finally{
            setProcessando(false);
        }
    }, []);

    const remover = useCallback(() => {
        setErro('');
        setEditada(null);
    }, []);

    const reiniciar = useCallback(() => setEditada(undefined), []);

    return {foto, erro, processando, escolher, remover, reiniciar};
}