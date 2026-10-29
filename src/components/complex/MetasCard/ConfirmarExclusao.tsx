import { useState } from 'react';
import type { ConfirmarExclusaoMetaProps } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { Dialogo } from './Dialogo';

export function ConfirmarExclusao({ meta, onFechar, onExcluir }: ConfirmarExclusaoMetaProps){
    const [excluindo, setExcluindo] = useState(false);
    const [falha, setFalha] = useState('');

    const confirmar = async () =>{
        setExcluindo(true);
        setFalha('');
        
        try{
            await onExcluir(meta.id);
            onFechar();
        } 
        catch (error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível excluir a meta.');
            setExcluindo(false);
        }
    };
    
    return(
        <Dialogo titulo="Excluir meta" onFechar={onFechar}>
            <p className="metas-form__texto">
                Tem certeza que deseja excluir a meta <strong>{meta.meta}</strong> do estado <strong>{meta.estado}</strong>? Essa ação não pode ser desfeita.
            </p>
            
            {falha &&(
                <p className="metas-form__falha" role="alert">
                    {falha}
                </p>
            )}
            
            <div className="metas-form__acoes">
                <button type="button" className="metas-botao metas-botao--secundario" onClick={onFechar} disabled={excluindo}>
                    Cancelar
                </button>

                <button type="button" className="metas-botao metas-botao--perigo" onClick={confirmar} disabled={excluindo}>
                    {excluindo ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </Dialogo>
    );
}