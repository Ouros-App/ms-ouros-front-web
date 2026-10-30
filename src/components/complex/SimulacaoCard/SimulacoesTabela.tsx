import { memo } from 'react';
import type { SimulacoesTabelaProps } from '@/types/simulacoes.types';
import { formatarDecimal, formatarMoeda, formatarNumero } from '@/utils/formato';

const colunas = [
    'Consumo atual (CGI)',
    'Consumo alvo (CGI)',
    'Preço por m³ da água',
    'Preço da energia',
    'Quantidade de aves',
    'Gasto alvo de energia por ave',
    'Ações',
];

function SimulacoesTabelaBase({ simulacoes, onEditar, onExcluir }: SimulacoesTabelaProps){
    return (
    <div className="simulacoes-tabela__moldura">
        <div className="simulacoes-tabela__rolagem" tabIndex={0} role="region" aria-label="Tabela de simulações">
            <table className="simulacoes-tabela">
                <caption className="simulacoes-card__oculto">Simulações de consumo</caption>
                <thead>
                    <tr>
                        {colunas.map((coluna) => (
                            <th key={coluna} scope="col">
                                {coluna}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {simulacoes.length === 0 ? (
                        <tr>
                            <td colSpan={colunas.length} className="simulacoes-tabela__vazio">
                                Nenhuma simulação encontrada.
                            </td>
                        </tr>
                    ) : (
                        simulacoes.map((simulacao) => (
                        <tr key={simulacao.id}>
                            <td>{formatarDecimal(simulacao.consumoAtual)}</td>
                            <td>{formatarDecimal(simulacao.consumoAlvo)}</td>
                            <td>{formatarMoeda(simulacao.precoAgua)}</td>
                            <td>{formatarMoeda(simulacao.precoEnergia)}</td>
                            <td>{formatarNumero(simulacao.quantidadeAves)}</td>
                            <td>{formatarDecimal(simulacao.gastoAlvoEnergia)} KWh</td>
                            <td>
                                <div className="simulacoes-tabela__acoes">
                                    <button type="button" className="simulacoes-tabela__acao" onClick={() => onEditar(simulacao)} aria-label={`Editar simulação do lote ${simulacao.idLote}`} title="Editar" >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                            <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                                        </svg>
                                    </button>
                                    
                                    <button type="button" className="simulacoes-tabela__acao"
                                    onClick={() => onExcluir(simulacao)} aria-label={`Excluir simulação do lote ${simulacao.idLote}`} title="Excluir">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
        </div>
    );
}

export const SimulacoesTabela = memo(SimulacoesTabelaBase);