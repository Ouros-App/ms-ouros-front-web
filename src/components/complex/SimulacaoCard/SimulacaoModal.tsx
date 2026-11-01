import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { SimulacaoModalProps, SimulacaoValores } from '@/types/simulacoes.types';
import { listarGranjas, type Granja } from '@/services/farmService';
import { simularRanking, type PrevisaoRanking } from '@/services/rankingService';
import { isAbortError } from '@/utils/delay';
import { Dialogo } from './Dialogo';
import { useSimulacaoForm } from './useSimulacaoForms';

interface CampoConfig{
    nome: keyof SimulacaoValores;
    rotulo: string;
    tipo: 'text' | 'number';
    passo?: string;
}

const campos: CampoConfig[] = [
    { nome: 'idLote', rotulo: 'Id do lote', tipo: 'text' },
    { nome: 'quantidadeAves', rotulo: 'Quantidade de aves', tipo: 'number', passo: '1' },
    { nome: 'consumoAtual', rotulo: 'Consumo atual (CGI)', tipo: 'number', passo: 'any' },
    { nome: 'consumoAlvo', rotulo: 'Consumo alvo (CGI)', tipo: 'number', passo: 'any' },
    { nome: 'precoAgua', rotulo: 'Preço por m³ da água (R$)', tipo: 'number', passo: '0.01' },
    { nome: 'precoEnergia', rotulo: 'Preço da energia (R$)', tipo: 'number', passo: '0.01' },
    { nome: 'gastoAlvoEnergia', rotulo: 'Gasto alvo de energia por ave (KWh)', tipo: 'number', passo: '0.01' },
];

export function SimulacaoModal({ simulacao, onFechar, onSalvar }: SimulacaoModalProps) {
    const { values, errors, change, validar } = useSimulacaoForm(simulacao);
    const [granjas, setGranjas] = useState<Granja[]>([]);
    const [idFarm, setIdFarm] = useState(simulacao?.idFarm ? String(simulacao.idFarm) : '');
    useEffect(() => {
        const controller = new AbortController();
        listarGranjas(controller.signal).then(setGranjas).catch((error: unknown) => {
            if (!controller.signal.aborted) setFalha(error instanceof Error ? error.message : 'Não foi possível carregar as granjas.');
        });
        return () => controller.abort();
    }, []);
    const [enviando, setEnviando] = useState(false);
    const [falha, setFalha] = useState('');
    const [previsao, setPrevisao] = useState<PrevisaoRanking | undefined>(simulacao?.previsao);
    const [calculando, setCalculando] = useState(false);
    const [erroPrevisao, setErroPrevisao] = useState('');

    const calcularPrevisao = async () => {
        const alvo = Number(values.consumoAlvo);
        if (!(alvo > 0)) {
            setErroPrevisao('Informe um consumo alvo (CGI) maior que zero para calcular a previsão.');
            return;
        }
        setCalculando(true);
        setErroPrevisao('');
        try {
            const farmId = Number(idFarm);
            if (!farmId) throw new Error('Nenhuma granja disponível para calcular a previsão.');
            setPrevisao(await simularRanking(farmId, alvo));
        } catch (error) {
            setErroPrevisao(error instanceof Error ? error.message : 'Não foi possível calcular a previsão.');
        } finally {
            setCalculando(false);
        }
    };

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const dados = validar();
        if (!dados) return;
        if (!idFarm) { setFalha('Selecione a granja.'); return; }
        setEnviando(true);
        setFalha('');
        
        try{
            await onSalvar({ ...dados, idFarm: Number(idFarm) }, simulacao?.id);
            onFechar();
        }
        catch(error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível salvar a simulação.');
            setEnviando(false);
        }
    };
    
    return (
    <Dialogo titulo={simulacao ? 'Editar simulação' : 'Nova simulação'} onFechar={onFechar}>
        <form className="simulacao-form" onSubmit={enviar} noValidate>
            <div className="simulacao-form__grade">
                <div className="simulacao-form__campo simulacao-form__campo--granja">
                    <label htmlFor="simulacao-granja" className="simulacao-form__rotulo">Granja</label>
                    <select id="simulacao-granja" className="simulacao-form__input simulacao-form__select" value={idFarm} onChange={(e) => setIdFarm(e.target.value)} disabled={enviando || Boolean(simulacao)} required>
                        <option value="">Selecione a granja</option>
                        {granjas.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                </div>
                {campos.map((campo) => {
                    const id = `simulacao-${campo.nome}`;
                    const erro = errors[campo.nome];
                    
                    return(
                    <div key={campo.nome} className="simulacao-form__campo">
                        <label htmlFor={id} className="simulacao-form__rotulo">
                            {campo.rotulo}
                        </label>
                        
                        <input
                        id={id}
                        name={campo.nome}
                        type={campo.tipo}
                        step={campo.passo}
                        min={campo.tipo === 'number' ? 0 : undefined}
                        className={`simulacao-form__input${erro ? ' simulacao-form__input--erro' : ''}`}
                        value={values[campo.nome]}
                        onChange={(evento) => change(campo.nome, evento.target.value)}
                        aria-invalid={erro ? true : undefined}
                        aria-describedby={erro ? `${id}-erro` : undefined}
                        disabled={enviando}
                    />
                    
                    {erro && (
                        <p id={`${id}-erro`} className="simulacao-form__erro" role="alert">
                            {erro}
                        </p>
                    )}
                    </div>
                );
            })}
        </div>

        <div className="simulacao-form__previsao" aria-live="polite">
            <button type="button" className="simulacoes-botao simulacoes-botao--secundario" onClick={calcularPrevisao} disabled={enviando || calculando}>
                {calculando ? 'Calculando...' : 'Calcular previsão no ranking'}
            </button>
            {erroPrevisao && <p className="simulacao-form__erro" role="alert">{erroPrevisao}</p>}
            {previsao && !erroPrevisao && (
                <p className="simulacao-form__resumo">
                    Posição atual: {previsao.posicaoAtual ?? '-'} · Posição simulada: {previsao.posicaoSimulada ?? '-'}
                    {previsao.posicoesGanhas !== null && previsao.posicoesGanhas > 0 ? ` (+${previsao.posicoesGanhas})` : ''}
                    {previsao.ligaSimulada ? ` · Liga: ${previsao.ligaSimulada}` : ''}
                </p>
            )}
        </div>

        {falha && (
            <p className="simulacao-form__falha" role="alert">
                {falha}
            </p>
        )}

        <div className="simulacao-form__acoes">
            <button type="button" className="simulacoes-botao simulacoes-botao--secundario" onClick={onFechar} disabled={enviando}>
                Cancelar
            </button>

            <button type="submit" className="simulacoes-botao--salavar" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar'}
            </button>
        </div>
        </form>
    </Dialogo>
    );
}