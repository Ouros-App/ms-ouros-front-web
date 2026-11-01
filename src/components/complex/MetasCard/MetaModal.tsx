import { useState } from 'react';
import type { FormEvent } from 'react';
import type { MetaModalProps, MetaValores } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { LIMITES_META } from '@/utils/metasValidators';
import { Dialogo } from './Dialogo';
import { useMetaForm } from './useMetaForm';

interface CampoConfig{
    nome: keyof MetaValores;
    rotulo: string;
    tipo: 'text' | 'number';
    completo?: boolean;
}

const campos: CampoConfig[] =[
    { nome: 'meta', rotulo: 'Meta estadual', tipo: 'text', completo: true },
    { nome: 'totalGranjas', rotulo: 'Valor alvo da métrica', tipo: 'number' },
];

export function MetaModal({ meta, onFechar, onSalvar }: MetaModalProps){
    const { values, errors, change, validar } = useMetaForm(meta);
    const [enviando, setEnviando] = useState(false);
    const [falha, setFalha] = useState('');
    
    const enviar = async (evento: FormEvent<HTMLFormElement>) =>{
        evento.preventDefault();
        const dados = validar();
        if (!dados) return;
        
        setEnviando(true);
        setFalha('');
        
        try{
            await onSalvar(meta.id, dados);
            onFechar();
        } 
        catch (error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível salvar a meta.');
            setEnviando(false);
        }
    };
    
    return(
        <Dialogo titulo={`Editar meta de ${meta.estado}`} onFechar={onFechar}>
            <form className="metas-form" onSubmit={enviar} noValidate>
                <div className="metas-form__grade">
                    {campos.filter((campo) => meta.type !== 'TASK_COMPLETION' || campo.nome === 'meta').map((campo) =>{
                        const id = `meta-${campo.nome}`;
                        const erro = errors[campo.nome];
                        return(
                            <div key={campo.nome} className={`metas-form__campo${campo.completo ? ' metas-form__campo--completo' : ''}`}>
                                <label htmlFor={id} className="metas-form__rotulo">
                                    {campo.rotulo}
                                </label>
                            
                                <input
                                id={id}
                                name={campo.nome}
                                type={campo.tipo}
                                step={campo.tipo === 'number' ? 'any' : undefined}
                                min={campo.tipo === 'number' ? 0 : undefined}
                                maxLength={campo.tipo === 'text' ? LIMITES_META.tituloMax : undefined}
                                className={`metas-form__input${erro ? ' metas-form__input--erro' : ''}`}
                                value={values[campo.nome]}
                                onChange={(evento) => change(campo.nome, evento.target.value)}
                                aria-invalid={erro ? true : undefined}
                                aria-describedby={erro ? `${id}-erro` : undefined}
                                disabled={enviando}
                                />
                            
                                {erro &&(
                                    <p id={`${id}-erro`} className="metas-form__erro" role="alert">
                                        {erro}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    <div className="metas-form__campo metas-form__campo--completo">
                        <label htmlFor="meta-status" className="metas-form__rotulo">
                            Status da meta
                        </label>
                        <select
                            id="meta-status"
                            name="status"
                            className="metas-form__input metas-form__select"
                            value={values.status}
                            onChange={(evento) => change('status', evento.target.value)}
                            disabled={enviando}
                        >
                            <option value="PENDING">Pendente</option>
                            <option value="IN_PROGRESS">Em andamento</option>
                            <option value="COMPLETED">Concluída</option>
                        </select>
                    </div>
                </div>
                
                {falha &&(
                    <p className="metas-form__falha" role="alert">
                        {falha}
                    </p>
                )}

                <div className="metas-form__acoes">
                    <button type="button" className="metas-botao metas-botao--secundario" onClick={onFechar} disabled={enviando}>
                        Cancelar
                    </button>

                    <button type="submit" className="metas-botao" disabled={enviando}>
                        {enviando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}
