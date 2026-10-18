import {memo} from 'react';
import {Link} from 'react-router-dom';
import type { RegistrosTabelaProps } from '@/types/registros.types';
import { formatarData, formatarMoeda, formatarNumero } from '@/utils/formato';
import { galinhasAtuais } from '@/utils/registros';

const colunas = [
    'Id do lote',
    'Data de emissão',
    'Hidrômetro (m3)',
    'Custo do lote',
    'Galinhas que entraram',
    'Galinhas que saíram',
    'Galinhas atuais',
    'Ações',
];

function RegistrosTabelaBase({ registros, onEditar, onExcluir}: RegistrosTabelaProps){
    return(
        <div className="registros-tabela__moldura">
            <div className="registros-tabela__rolagem" tabIndex={0} role="region" aria-label="Tabela de registros de lotes">
                <table className="registros-tabela">
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
                        {registros.length === 0 ? (
                            <tr>
                                <td colSpan={colunas.length} className="registros-tabela__vazio">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                            ) : (
                                registros.map((registro) => (
                                <tr key={registro.id}>
                                    <th scope="row">
                                        <Link to={`/registros/${registro.id}`} className="registros-tabela__link">
                                        {registro.idLote}
                                        </Link>
                                    </th>
                                    <td>{formatarData(registro.dataEmissao)}</td>
                                    <td>{formatarNumero(registro.hidrometro)}</td>
                                    <td>{formatarMoeda(registro.custo)}</td>
                                    <td>{formatarNumero(registro.entraram)}</td>
                                    <td>{formatarNumero(registro.sairam)}</td>
                                    <td>{formatarNumero(galinhasAtuais(registro))}</td>
                                    <td>
                                        <div className="registros-tabela__acoes">
                                            <button onClick={() => onEditar(registro)} aria-label={`Editar lote ${registro.idLote}`} title='Editar'>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                                                    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />"
                                                </svg>
                                            </button>
                                            <button type='button' className='registros-tabela__acao' onClick={() => onExcluir(registro)} aria-label={`Excluir lote ${registro.idLote}`} title='Excluir'>
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
    )
}

export const RegistrosTabela = memo(RegistrosTabelaBase)