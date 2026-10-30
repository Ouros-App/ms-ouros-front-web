import { useState } from "react";
import type { ConfirmarExclusaoProps } from "@/types/registros.types";
import { isAbortError } from "@/utils/delay";
import { Dialogo } from "./Dialogo";
import './RegistroCard.css';
export function ConfirmarExclusao({ registro, onFechar, onExcluir }: ConfirmarExclusaoProps){
    const [excluindo, setExcluindo] = useState(false);
    const [falha, setFalha] = useState('');
    const confirmar = async () => {
        setExcluindo(true);
        setFalha('');

        try{
            await onExcluir(registro.id);
            onFechar();
        } 
        catch (error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível excluir o registro.');
            setExcluindo(false);
        }
    };

    return (
        <Dialogo titulo="Excluir registro" onFechar={onFechar}>
            <p className="registro-form__texto">
                Tem certeza que deseja excluir o lote <strong>{registro.idLote}</strong>? Essa ação não pode ser desfeita.
            </p>
            {falha && (
                <p className="registro-form__falha" role="alert">
                    {falha}
                </p>
            )}

            <div className="registro-form__acoes">
                <button type="button" className="registro-botao registro-botao--secundario" onClick={onFechar} disabled={excluindo}>
                    Cancelar
                </button>

                <button type="button" className="registro-botao registro-botao--perigo" onClick={confirmar} disabled={excluindo}>
                    {excluindo ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </Dialogo>
    );
}