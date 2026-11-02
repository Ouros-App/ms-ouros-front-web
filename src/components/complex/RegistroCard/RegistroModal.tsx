import { listarGranjas } from '@/services/farmService';
import type { Granja } from '@/types/granjas.types';
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
    somenteEdicao?: boolean;
}

const campos: CampoConfig[] = [
    { nome: 'dataEmissao', rotulo: 'Data de alojamento / emissão', tipo: 'date' },
    { nome: 'entraram', rotulo: 'Galinhas que entraram (alojadas)', tipo: 'number', passo: '1' },
    { nome: 'custo', rotulo: 'Custo inicial do lote (R$)', tipo: 'number', passo: '0.01' },
    { nome: 'hidrometro', rotulo: 'Hidrômetro (m³)', tipo: 'number', passo: 'any', somenteEdicao: true },
    { nome: 'sairam', rotulo: 'Galinhas que saíram', tipo: 'number', passo: '1', somenteEdicao: true },
];

function obterRotuloBotao(enviando: boolean, isEdicao: boolean): string {
    if (enviando) {
        return 'Salvando...';
    }
    if (isEdicao) {
        return 'Salvar';
    }
    return 'Cadastrar Lote';
}

export function RegistroModal({ registro, onFechar, onSalvar }: RegistroModalProps) {
    const isEdicao = Boolean(registro);
    const { values, errors, change, validar, atuais } = useRegistroForm(registro);
    const [granjas, setGranjas] = useState<Granja[]>([]);
    const [idFarm, setIdFarm] = useState(registro?.idFarm ? String(registro.idFarm) : '');
    const camposExibidos = campos.filter((c) => !c.somenteEdicao || isEdicao);

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
    <Dialogo titulo={isEdicao ? 'Editar registro do lote' : 'Cadastrar novo lote'} onFechar={onFechar}>
        <form className="registro-form" onSubmit={enviar} noValidate>
            <div className="registro-form__grade">
                <div className="registro-form__campo registro-form__campo--granja">
                    <label htmlFor="registro-granja" className="registro-form__rotulo">Granja</label>
                    <select id="registro-granja" className="registro-form__input registro-form__select" value={idFarm} onChange={(e) => setIdFarm(e.target.value)} disabled={enviando || isEdicao} required>
                        <option value="">Selecione a granja</option>
                        {granjas.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                </div>
                {camposExibidos.map((campo) => {
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
                        disabled={enviando || (isEdicao && campo.nome === 'hidrometro')}
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

            <p className="registro-form__ajuda">
                {isEdicao
                    ? 'Na edição, o hidrômetro reflete o consumo acumulado registrado pela fazenda.'
                    : 'Cadastre o lote para a granja. A fazenda lançará as leituras diárias de água, energia e mortalidade no aplicativo.'}
            </p>
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
                    {obterRotuloBotao(enviando, isEdicao)}
                </button>
            </div>
        </form>
    </Dialogo>
  );
}
