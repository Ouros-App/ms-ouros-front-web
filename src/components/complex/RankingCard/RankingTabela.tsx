import { memo } from 'react';
import type { RankingTabelaProps } from '@/types/ranking.types';
import { formatarDecimal, formatarDataHora } from '@/utils/formato';
import { ligaPorId } from '@/utils/ranking';

const colunas = ['Posição', 'Participante', 'Liga', 'Pontuação', 'Última atualização', 'Ações'];

function RankingTabelaBase({ participantes, onEditar, onExcluir }: RankingTabelaProps){
    return(
        <div className="ranking-tabela__moldura">
            <div className="ranking-tabela__rolagem" tabIndex={0} role="region" aria-label="Tabela de ranking">

                <table className="ranking-tabela">
                    <caption className="ranking-card__oculto">Ranking de participantes</caption>
                    <thead>
                        <tr>
                            {colunas.map((coluna) =>(
                                <th key={coluna} scope="col">
                                    {coluna}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    <tbody>
                        {participantes.lengh === 0 ?(
                            <tr>
                                <td colSpan={colunas.length} className="ranking-tabela__vazio">
                                    Nenhum participante encontrado.
                                </td>
                            </tr>
                        ) : (
                            participantes.map((participante) =>{
                                const liga = ligaPorId(participante.liga);
                                return(
                                <tr key={participante.id}>
                                    <td>{participante.posicao}</td>
                                    <td>
                                        <span className="ranking-tabela__participante">
                                            <span className="ranking-tabela__avatar" aria-hidden="true" />
                                            {participante.nome}
                                        </span>
                                    </td>
                                    
                                    <td>
                                        <span className="ranking-tabela__liga">
                                            <span className="ranking-tabela__ponto" style={{ backgroundColor: liga.cor }} aria-hidden="true" />
                                            {liga.nome}
                                        </span>
                                    </td>

                                    <td>{formatarDecimal(participante.pontuacao)}</td>
                                    <td>{formatarDataHora(participante.atualizadoEm)}</td>
                                    
                                    <td>
                                        <div className="ranking-tabela__acoes">
                                            <button type="button" className="ranking-tabela__acao" onClick={() => onEditar(participante)} aria-label={`Editar ${participante.nome}`} title="Editar">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                                    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                                                </svg>
                                            </button>
                                            
                                            <button type="button" className="ranking-tabela__acao" onClick={() => onExcluir(participante)} aria-label={`Excluir ${participante.nome}`} title="Excluir" >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                                    <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export const RankingTabela = memo(RankingTabelaBase);