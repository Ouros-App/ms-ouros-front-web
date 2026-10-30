import { useCallback, useState } from 'react';
import type { CampoOrdenacaoSimulacao, Simulacao, SimulacaoNova, SimulacoesCardProps } from '@/types/simulacoes.types';
import { sanitizeBusca } from '@/utils/sanitizadores';
import { opcoesOrdenacaoSimulacao } from '@/utils/simulacoes';
import { ConfirmarExclusao } from './ConfirmarExclusao';
import { SimulacaoModal } from './SimulacaoModal';
import { SimulacoesTabela } from './SimulacoesTabela';
import './SimulacoesCard.css';

type DialogoAberto = | { tipo: 'form'; simulacao: Simulacao | null } | { tipo: 'excluir'; simulacao: Simulacao } | null;

export function SimulacoesCard({ simulacoes, status, mensagemErro, busca, ordenacao, onBuscar, onOrdenar, onSalvar, onExcluir, onRecarregar, }: SimulacoesCardProps){
    
    const [dialogo, setDialogo] = useState<DialogoAberto>(null);
    const [aviso, setAviso] = useState('');
    const fechar = useCallback(() => setDialogo(null), []);
    const abrirEdicao = useCallback((simulacao: Simulacao) => setDialogo({ tipo: 'form', simulacao }), []);
    const abrirExclusao = useCallback((simulacao: Simulacao) => setDialogo({ tipo: 'excluir', simulacao }), []);

    const salvarComAviso = useCallback(
        async (dados: SimulacaoNova, id?: string) => {
            await onSalvar(dados, id);
            setAviso(id ? `Simulação do lote ${dados.idLote} atualizada.` : `Simulação do lote ${dados.idLote} criada.`);
        },
        [onSalvar],
    );

    const excluirComAviso = useCallback(
        async (id: string) => {
            await onExcluir(id);
            setAviso('Simulação excluída.');
        },
        [onExcluir],
    );
    
    return (
    <section className="simulacoes-card" aria-label="Simulações de consumo">
        <div className="simulacoes-card__ferramentas">
            <div className="simulacoes-card__busca">
                <label htmlFor="simulacoes-busca" className="simulacoes-card__oculto">
                    Pesquisar lote específico
                </label>
                <svg className="simulacoes-card__lupa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                
                <input
                id="simulacoes-busca"
                type="search"
                className="simulacoes-card__campo"
                placeholder="Pesquisar lote específico..."
                value={busca}
                onChange={(evento) => onBuscar(sanitizeBusca(evento.target.value))}
                maxLength={20}
            />
        </div>

        <button type="button" className="simulacoes-botao" onClick={() => setDialogo({ tipo: 'form', simulacao: null })}>
            <span aria-hidden="true" className="simulacoes-botao__icone">+</span>Nova Simulação
        </button>

        <div>
            <label htmlFor="simulacoes-ordenar" className="simulacoes-card__oculto">
                Ordenar simulações por
            </label>
            
            <select id="simulacoes-ordenar" className="simulacoes-card__ordenar" value={ordenacao} onChange={(evento) => onOrdenar(evento.target.value as CampoOrdenacaoSimulacao)}>
                {opcoesOrdenacaoSimulacao.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                    </option>
                ))}
            </select>
        </div>
    </div>
    
    <p className="simulacoes-card__oculto" role="status" aria-live="polite">
        {aviso}
    </p>
    
    {status === 'carregando' && (
        <p className="simulacoes-card__estado" role="status">
            Carregando simulações...
        </p>
    )}
    
    {status === 'erro' && (
        <div className="simulacoes-card__estado" role="alert">
            <p>{mensagemErro}</p>
            <button type="button" className="simulacoes-botao" onClick={onRecarregar}>
                Tentar novamente
            </button>
        </div>
    )}
    
    {status === 'pronto' && (
        <SimulacoesTabela simulacoes={simulacoes} onEditar={abrirEdicao} onExcluir={abrirExclusao} />
    )}
    
    {dialogo?.tipo === 'form' && (
        <SimulacaoModal simulacao={dialogo.simulacao} onFechar={fechar} onSalvar={salvarComAviso} />
    )}
    
    {dialogo?.tipo === 'excluir' && (
        <ConfirmarExclusao simulacao={dialogo.simulacao} onFechar={fechar} onExcluir={excluirComAviso} />
    )}
    </section>
    );
}