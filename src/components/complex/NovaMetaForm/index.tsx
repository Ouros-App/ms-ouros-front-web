import { listarGranjas, type Granja } from '@/services/farmService';
import {useEffect, useState} from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { NovaMetaFormProps } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { validateTituloMeta, LIMITES_META } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizadores';
import './NovaMetaForm.css'

export function NovaMetaForm({onLancar}: NovaMetaFormProps){
    const [granjas, setGranjas] = useState<Granja[]>([]);
    const [idFarm, setIdFarm] = useState('');
    const [target, setTarget] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        listarGranjas(controller.signal).then(setGranjas).catch((error: unknown) => {
            if (!controller.signal.aborted) setErro(error instanceof Error ? error.message : 'Falha ao carregar granjas.');
        });
        return () => controller.abort();
    }, []);
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

        if (!idFarm || !(Number(target) > 0)) { setErro('Informe a granja e o valor alvo.'); return; }
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
                await onLancar(sanitizeText(titulo.trim()), { idFarm: Number(idFarm), targetValue: Number(target) });
                setTitulo('');
                setAviso('Meta de consumo de água criada para a granja selecionada.');
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

            <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-granja">Granja</label>
                <select id="meta-granja" className="nova-meta__campo nova-meta__select" value={idFarm} onChange={(e) => setIdFarm(e.target.value)} disabled={enviando}>
                    <option value="">Selecione a granja</option>
                    {granjas.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
            </div>
            <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-alvo">Valor alvo de consumo de água (m³)</label>
                <input id="meta-alvo" className="nova-meta__campo" aria-label="Valor alvo" type="number" min="0" step="any" value={target} onChange={(e) => setTarget(e.target.value)} disabled={enviando} />
            </div>
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

                <button type='submit' className='nova-meta__botao' aria-label='Criar meta para a granja' title='Criar meta' disabled={enviando}>
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


