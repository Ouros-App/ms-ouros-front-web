import {useState} from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { NovaMetaFormProps } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { validateTituloMeta, LIMITES_META } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizadores';
import './NovaMetaForm.css'

export function NovaMetaForm({onLancar}: NovaMetaFormProps){
    const [titulo, setTitulo] = useState('');
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [enviando, setEnviando] = useState(false);

    const alterar = (evento: ChangeEvent<HTMLInputElement>) =>{
        setTitulo(evento.target.value);
        setErro('');
        setAviso('');
    };

    const enviar = async(evento: FormEvent<HTMLFormElement>) =>{
        evento.preventDefault();

        const mensagem = validateTituloMeta(titulo);
        if (mensagem){
            setErro(mensagem);
            document.getElementById('meta-nova')?.focus();
            return;
        }

            setEnviando(true);
            setErro('');
            setAviso('');

            try{
                const quantidade = await onLancar(sanitizeText(titulo.trim()));
                setTitulo('');
                setAviso(`Meta lançada para ${quantidade} estados.`);
            }
            catch(error){
                if (isAbortError(error)) return;
                setErro(error instanceof Error ? error.message : 'Não foi possível lançar a meta.');
            }
            finally{
                setEnviando(false);
            }
    };

    return(
        <form className='nova-meta' onSubmit={enviar} noValidate>
            <label htmlFor="meta-nova" className='nova-meta__titulo'>
                Adicionar meta estadual:
            </label>

            <div className='nova-meta__linha'>
                <input
                id="meta-nova"
                type="text"
                className={`nova-meta__campo${erro ? ' nova-meta__campo--erro' : ''}`}
                placeholder="Não gastar mais de 10L/ave."
                value={titulo}
                onChange={alterar}
                maxLength={LIMITES_META.tituloMax}
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? 'meta-nova-erro' : undefined}
                disabled={enviando}
                />

                <button type='submit' className='nova-meta__botao' aria-label='Lançar meta para todos os estados' title='Lançar para todos os estados' disabled={enviando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="m5 12 5 5 9-11" />
                    </svg>
                </button>
            </div>

            {erro &&(
                <p id='meta-nova-erro' className='nova-meta__erro' role='alert'>
                    {erro}
                </p>
            )}

            <p className='nova-meta__aviso' role='status' aria-live="polite">
                {enviando ? 'Lançando meta...' : aviso}
            </p>
        </form>
    );
}


