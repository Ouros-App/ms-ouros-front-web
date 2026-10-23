import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { PerfilFotoProps } from '@/types/perfil.types';
import './PerfilFoto.css';

export function PerfilFoto({ nome, foto, erro, processando, onEscolher, onRemover }: PerfilFotoProps){
    const entradaRef = useRef<HTMLInputElement>(null);
    const aoEscolher = (evento: ChangeEvent<HTMLInputElement>) => {
        const arquivo = evento.target.files?.[0];
        if (arquivo) onEscolher(arquivo);
        evento.target.value = '';
    };
    
    return(
    <section className="perfil-foto" aria-label="Foto de perfil">
        <div className="perfil-foto__moldura">
            {foto ?(
                <img src={foto} alt={`Foto de perfil de ${nome}`} className="perfil-foto__imagem" />
            ) : (
                <svg className="perfil-foto__asa" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
                    <path d="M4 28C10 12 20 5 37 7c-6 4-10 8-12 12 6-2 10-3 14-3-8 9-21 15-35 12Z" />
                </svg>
            )}
        
            <div className="perfil-foto__acoes">
                <input
                ref={entradaRef}
                id="perfil-foto-arquivo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="perfil-foto__arquivo"
                onChange={aoEscolher}
                tabIndex={-1}
                aria-label="Escolher uma foto de perfil"
                />
                
                <button type="button" className="perfil-foto__botao" onClick={() => entradaRef.current?.click()} disabled={processando}>
                    {processando ? 'Carregando...' : 'Alterar foto'}
                </button>
                
                {foto && (
                    <button type="button" className="perfil-foto__botao perfil-foto__botao--secundario" onClick={onRemover} disabled={processando}>
                        Remover foto
                    </button>
                )}
            </div>
        </div>
        
        {erro && (
            <p className="perfil-foto__erro" role="alert">
                {erro}
            </p>
        )}
    </section>
    );
}