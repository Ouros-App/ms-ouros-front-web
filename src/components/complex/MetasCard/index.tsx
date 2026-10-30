import { Pagination } from '@/components/common/Pagination';
import { useCallback, useState } from 'react';
import type { MetaEdicao, MetaEstadual, MetasCardProps } from '@/types/metas.types';
import { sanitizeText } from '@/utils/sanitizers';
import { ConfirmarExclusao } from './ConfirmarExclusao';
import { MetaModal } from './MetaModal';
import { MetasTabela } from './MetasTabela';
import './MetasCard.css';

type DialogoAberto = | { tipo: 'editar'; meta: MetaEstadual } | { tipo: 'excluir'; meta: MetaEstadual } | null;

export function MetasCard({ metas, status, mensagemErro, busca, onBuscar, onSalvar, onExcluir,onRecarregar, pagination }: MetasCardProps){
    const [dialogo, setDialogo] = useState<DialogoAberto>(null);
    const [aviso, setAviso] = useState('');
    const fechar = useCallback(() => setDialogo(null), []);
    const abrirEdicao = useCallback((meta: MetaEstadual) => setDialogo({ tipo: 'editar', meta }), []);
    const abrirExclusao = useCallback((meta: MetaEstadual) => setDialogo({ tipo: 'excluir', meta }), []);
    
    const salvarComAviso = useCallback(
        async (id: string, dados: MetaEdicao) =>{
            await onSalvar(id, dados);
            setAviso('Meta atualizada.');
        },[onSalvar],
    );
    
    const excluirComAviso = useCallback(
        async (id: string) =>{
            await onExcluir(id);
            setAviso('Meta excluída.');
        },[onExcluir],
    );
    
    return(
        <section className="metas-card" aria-label="Metas por estado">
            <div className="metas-card__ferramentas">
                <div className="metas-card__busca">
                    <label htmlFor="metas-busca" className="metas-card__oculto">
                        Pesquisar meta ou estado
                    </label>
                    
                    <svg className="metas-card__lupa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    
                    <input id="metas-busca"
                    type="search"
                    className="metas-card__campo"
                    placeholder="Pesquisar meta ou estado..."
                    value={busca}
                    onChange={(evento) => onBuscar(sanitizeText(evento.target.value))}
                    maxLength={40}
                    />
                </div>
            </div>
            
            <p className="metas-card__oculto" role="status" aria-live="polite">
                {aviso}
            </p>
            
            {status === 'carregando' &&(
                <p className="metas-card__estado" role="status">
                    Carregando metas...
                </p>
            )}
            
            {status === 'erro' && (
                <div className="metas-card__estado" role="alert">
                    <p>{mensagemErro}</p>
                    <button type="button" className="metas-botao" onClick={onRecarregar}>
                        Tentar novamente
                    </button>
                </div>
            )}
            
            {status === 'pronto' && <MetasTabela metas={metas} onEditar={abrirEdicao} onExcluir={abrirExclusao} />}
            
            {dialogo?.tipo === 'editar' && <MetaModal meta={dialogo.meta} onFechar={fechar} onSalvar={salvarComAviso} />}
            
            {dialogo?.tipo === 'excluir' && (
                <ConfirmarExclusao meta={dialogo.meta} onFechar={fechar} onExcluir={excluirComAviso} />
            )}
        {pagination && <Pagination {...pagination} />}
        </section>
    );
}