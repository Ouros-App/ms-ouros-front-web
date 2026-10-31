import { Pagination } from '@/components/common/Pagination';
import type { CampoOrdenacaoRanking, RankingCardProps } from '@/types/ranking.types';
import { opcoesOrdenacaoRanking } from '@/utils/ranking';
import { sanitizeBusca } from '@/utils/sanitizadores';
import { RankingTabela } from './RankingTabela';
import './RankingCard.css';

export function RankingCard({ participantes, status, mensagemErro, busca, ordenacao, onBuscar, onOrdenar, onRecarregar, pagination }: RankingCardProps){
    return(
        <section className="ranking-card" aria-label="Ranking de participantes">
            <div className="ranking-card__ferramentas">
                <div className="ranking-card__busca">
                    
                    <label htmlFor="ranking-busca" className="ranking-card__oculto">
                        Pesquisar participante
                    </label>

                    <svg className="ranking-card__lupa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    
                    <input
                    id="ranking-busca"
                    type="search"
                    className="ranking-card__campo"
                    placeholder="Pesquisar lote específico..."
                    value={busca}
                    onChange={(evento) => onBuscar(sanitizeBusca(evento.target.value))}
                    maxLength={40}
                    />
                </div>

                <div>
                
                    <label htmlFor="ranking-ordenar" className="ranking-card__oculto">
                        Ordenar ranking por
                    </label>
                
                    <select id="ranking-ordenar" className="ranking-card__ordenar" value={ordenacao} onChange={(evento) => onOrdenar(evento.target.value as CampoOrdenacaoRanking)}>
                        {opcoesOrdenacaoRanking.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>
                                {opcao.rotulo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

{status === 'carregando' && (
                <p className="ranking-card__estado" role="status">
                    Carregando ranking...
                </p>
            )}

            {status === 'erro' && (
                <div className="ranking-card__estado" role="alert">
                    <p>{mensagemErro}</p>
                    <button type="button" className="ranking-botao" onClick={onRecarregar}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {status === 'pronto' && (
                <RankingTabela participantes={participantes} />
            )}
        {pagination && <Pagination {...pagination} />}
        </section>
    );
}