import { listarGranjas, type Granja } from '@/services/farmService';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { RegistroModalProps, RegistroValores } from '@/types/registros.types';
import { isAbortError } from '@/utils/delay';
import { formatarNumero } from '@/utils/formato';
import { Dialogo } from './Dialogo';
import { useRegistroForm } from './useRegistroForm';

interface CampoConfig {
    nome: keyof RegistroValores;
    rotulo: string;
    tipo: 'text' | 'date' | 'number';
    passo?: string;
}

const campos: CampoConfig[] = [
        { nome: 'dataEmissao', rotulo: 'Data de emissão', tipo: 'date' },
    { nome: 'hidrometro', rotulo: 'Hidrômetro (m³)', tipo: 'number', passo: 'any' },
    { nome: 'custo', rotulo: 'Custo do lote (R$)', tipo: 'number', passo: '0.01' },
    { nome: 'entraram', rotulo: 'Galinhas que entraram', tipo: 'number', passo: '1' },
    { nome: 'sairam', rotulo: 'Galinhas que saíram', tipo: 'number', passo: '1' },
];

export function RegistroModal({ registro, onFechar, onSalvar }: RegistroModalProps) {
    const { values, errors, change, validar, atuais } = useRegistroForm(registro);
    const [granjas, setGranjas] = useState<Granja[]>([]);
    const [idFarm, setIdFarm] = useState(registro?.idFarm ? String(registro.idFarm) : '');
    useEffect(() => {
        const controller = new AbortController();
        listarGranjas(controller.signal).then(setGranjas).catch((error: unknown) => {
            if (!controller.signal.aborted) setFalha(error instanceof Error ? error.message : 'Não foi possível carregar as granjas.');
        });
        return () => controller.abort();
    }, []);
    const [enviando, setEnviando] = useState(false);
    const [falha, setFalha] = useState('');

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const dados = validar();
        if (!dados) return;
        if (!idFarm) { setFalha('Selecione a granja.'); return; }
        setEnviando(true);
        setFalha('');
        
        try {
            await onSalvar({ ...dados, idFarm: Number(idFarm) }, registro?.id);
            onFechar();
        }
        catch (error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível salvar o registro.');
            setEnviando(false);
        }
    };
    
    return (
    <Dialogo titulo={registro ? 'Editar registro' : 'Novo registro'} onFechar={onFechar}>
        <form className="registro-form" onSubmit={enviar} noValidate>
            <div className="registro-form__grade">
                <label>Granja
                    <select aria-label="Granja" value={idFarm} onChange={(e) => setIdFarm(e.target.value)} disabled={enviando || Boolean(registro)} required>
                        <option value="">Selecione a granja</option>
                        {granjas.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                </label>
                {campos.map((campo) => {
                    const id = `registro-${campo.nome}`;
                    const erro = errors[campo.nome];
                    
                    return (
                    <div key={campo.nome} className="registro-form__campo">
                        <label htmlFor={id} className="registro-form__rotulo">
                            {campo.rotulo}
                        </label>
                        <input
                        id={id}
                        name={campo.nome}
                        type={campo.tipo}
                        step={campo.passo}
                        min={campo.tipo === 'number' ? 0 : undefined}
                        className={`registro-form__input${erro ? ' registro-form__input--erro' : ''}`}
                        value={values[campo.nome]}
                        onChange={(evento) => change(campo.nome, evento.target.value)}
                        aria-invalid={erro ? true : undefined}
                        aria-describedby={erro ? `${id}-erro` : undefined}
                        disabled={enviando || (Boolean(registro) && campo.nome === 'hidrometro')}
                        />
                        
                        {erro && (
                            <p id={`${id}-erro`} className="registro-form__erro" role="alert">
                                {erro}
                            </p>
                        )}
                    </div>
                    );
                })}

                <div className="registro-form__campo">
                    <span className="registro-form__rotulo" id="registro-atuais-rotulo">
                        Galinhas atuais
                    </span>
                    
                    <output className="registro-form__saida" aria-labelledby="registro-atuais-rotulo">
                        {atuais === null ? '—' : formatarNumero(atuais)}
                    </output>
                </div>
            </div>

            <p>A leitura inicial é registrada na granja. Na edição, o hidrômetro mostra o consumo acumulado da granja em m³.</p>
            {falha && (
                <p className="registro-form__falha" role="alert">
                    {falha}
                </p>
            )}

            <div className="registro-form__acoes">
                <button type="button" className="registros-botao registros-botao--secundario" onClick={onFechar} disabled={enviando}>
                    Cancelar
                </button>
                
                <button type="submit" className="registros-botao" disabled={enviando}>
                    {enviando ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    </Dialogo>
  );
}