import { useState } from 'react';
import type { ConfirmarExclusaoSimulacaoProps } from '@/types/simulacoes.types';
import { isAbortError } from '@/utils/delay';
import { Dialogo } from './Dialogo';

export function ConfirmarExclusao({simulacao, onFechar, onExcluir }: ConfirmarExclusaoSimulacaoProps){
    const [excluindo, setExcluindo] = useState(false);
    const [falha, setFalha] = useState('');
    
    const confirmar = async () => {
        setExcluindo(true);
        setFalha('');
        
        try {
            await onExcluir(simulacao.id);
            onFechar();
        } catch (error) {
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível excluir a simulação.');
            setExcluindo(false);
        }
    };
    
    return(
    <Dialogo titulo="Excluir simulação" onFechar={onFechar}>
        <p className="simulacao-form__texto">
            Tem certeza que deseja excluir a simulação do lote <strong>{simulacao.idLote}</strong>? Essa ação não pode ser desfeita.
        </p>
        
        {falha && (
            <p className="simulacao-form__falha" role="alert">
                {falha}
            </p>
        )}
        
        <div className="simulacao-form__acoes">
            <button type="button" className="simulacoes-botao simulacoes-botao--secundario" onClick={onFechar} disabled={excluindo}>
                Cancelar
            </button>
            
            <button type="button" className="simulacoes-botao simulacoes-botao--perigo" onClick={confirmar} disabled={excluindo}>
                {excluindo ? 'Excluindo...' : 'Excluir'}
            </button>
        </div>
    </Dialogo>
    );
}