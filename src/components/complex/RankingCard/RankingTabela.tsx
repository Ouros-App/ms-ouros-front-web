import { memo } from 'react';
import type { RankingTabelaProps } from '@/types/ranking.types';
import { formatarDecimal, formatarDataHora } from '@/utils/formato';
import { ligaPorId } from '@/utils/ranking';

const colunas = ['Posição', 'Participante', 'Liga', 'Pontuação', 'Última atualização'];

function RankingTabelaBase({ participantes }: RankingTabelaProps){
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
                        {participantes.length === 0 ?(
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