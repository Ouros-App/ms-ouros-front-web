import { memo } from 'react';
import type { MetasTabelaProps } from '@/types/metas.types';
import { calcularProgresso } from '@/utils/metas';

const colunas = ['Estado', 'Meta Estadual', 'Total de Granjas', 'Concluídos', 'Progresso', 'Ações'];

function MetasTabelaBase({ metas, onEditar, onExcluir }: MetasTabelaProps){
    return(
        <div className="metas-tabela__moldura">
            <div className="metas-tabela__rolagem" tabIndex={0} role="region" aria-label="Tabela de metas">
                <table className="metas-tabela">
                    <caption className="metas-card__oculto">Metas estaduais</caption>
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
                        {metas.length === 0 ?(
                            <tr>
                                <td colSpan={colunas.length} className="metas-tabela__vazio">
                                    Nenhuma meta encontrada.
                                </td>
                            </tr>
                        ):(
                            metas.map((meta) => (
                            <tr key={meta.id}>
                                <td>{meta.estado}</td>
                                <td>{meta.meta}</td>
                                <td>{meta.totalGranjas}</td>
                                <td>{meta.concluidos}</td>
                                <td>{calcularProgresso(meta)}%</td>

                                <td>
                                    <div className="metas-tabela__acoes">
                                        <button type="button" className="metas-tabela__acao" onClick={() => onEditar(meta)}
                                        aria-label={`Editar meta ${meta.meta} de ${meta.estado}`}
                                        title="Editar"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                                <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                                            </svg>
                                        </button>
                                        
                                        <button type="button" className="metas-tabela__acao"
                                        onClick={() => onExcluir(meta)} aria-label={`Excluir meta ${meta.meta} de ${meta.estado}`} title="Excluir">
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

export const MetasTabela = memo(MetasTabelaBase);