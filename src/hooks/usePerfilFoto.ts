import { useCallback, useState } from 'react';
import { uploadParaCloudinary } from '@/services/cloudinaryService';
import { prepararFoto, validarFoto } from '@/utils/fotos';

export function usePerfilFoto(salva: string | null) {
    const [preview, setPreview] = useState<string | null | undefined>(undefined);
    const [arquivoPendente, setArquivoPendente] = useState<File | null>(null);
    const [removido, setRemovido] = useState(false);
    const [erro, setErro] = useState('');
    const [processando, setProcessando] = useState(false);

    // Se o usuário removeu explicitamente, é null. Se há preview, usa preview. Senão, usa a foto salva.
    const foto = removido ? null : (preview !== undefined ? preview : salva);

    const escolher = useCallback(async (arquivo: File) => {
        setErro('');
        setProcessando(true);
        try {
            validarFoto(arquivo);
            // Prepara preview com fallback seguro
            let previewUrl = '';
            try {
                previewUrl = await prepararFoto(arquivo);
            } catch {
                if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
                    previewUrl = URL.createObjectURL(arquivo);
                } else {
                    previewUrl = 'data:image/png;base64,preview';
                }
            }
            setPreview(previewUrl);
            setArquivoPendente(arquivo);
            setRemovido(false);
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Não foi possível carregar a imagem.');
        } finally {
            setProcessando(false);
        }
    }, []);

    const remover = useCallback(() => {
        setErro('');
        setPreview(null);
        setArquivoPendente(null);
        setRemovido(true);
    }, []);

    const reiniciar = useCallback(() => {
        setPreview(undefined);
        setArquivoPendente(null);
        setRemovido(false);
        setErro('');
    }, []);

    /**
     * Resolve a URL final a ser enviada ao backend:
     * - Se o usuário removeu a foto, retorna null.
     * - Se o usuário escolheu uma nova foto, envia para o Cloudinary e retorna a secure_url.
     * - Se nada mudou, retorna a foto salva original.
     */
    const obterFotoFinal = useCallback(async (): Promise<string | null> => {
        if (removido) {
            return null;
        }
        if (arquivoPendente) {
            setProcessando(true);
            try {
                const secureUrl = await uploadParaCloudinary(arquivoPendente);
                return secureUrl;
            } finally {
                setProcessando(false);
            }
        }
        return salva;
    }, [removido, arquivoPendente, salva]);

    return {
        foto,
        erro,
        processando,
        arquivoPendente,
        removido,
        escolher,
        remover,
        reiniciar,
        obterFotoFinal,
    };
}
