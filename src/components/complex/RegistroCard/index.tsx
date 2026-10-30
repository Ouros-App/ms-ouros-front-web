import { Pagination } from '@/components/common/Pagination';
import { useCallback, useState } from "react";
import type { CampoOrdenacao, Registro, RegistroNovo, RegistrosCardProps} from "@/types/registros.types";
import { opcoesOrdenacao } from "@/utils/registros";
import { sanitizeBusca } from "@/utils/sanitizadores";
import { ConfirmarExclusao } from "./ConfirmarExclusão";
import { RegistroModal } from "./RegistroModal";
import { RegistrosTabela } from "./RegistrosTabela";
import './RegistroCard.css';

type DialogoAberto = {tipo: 'form'; registro: Registro | null} | {tipo: 'excluir'; registro: Registro} | null;

export function RegistroCard({registros, status, mensagemErro, busca, ordenacao, onBuscar, onOrdenar, onSalvar, onExcluir, onRecarregar, pagination }:RegistrosCardProps){
    const [dialogo, setDialogo] = useState<DialogoAberto>(null);
    const [aviso, setAviso] = useState('');
    const fechar = useCallback(() => setDialogo(null), []);
    const abrirEdicao = useCallback((registro: Registro) => setDialogo({ tipo: 'form', registro }), []);
    const abrirExclusao = useCallback((registro: Registro) => setDialogo({ tipo: 'excluir', registro }), []);

    const salvarComAviso = useCallback(
        async (dados: RegistroNovo, id?: string) => {
            await onSalvar(dados, id);
            setAviso(id ? `Registro do lote ${dados.idLote} atualizado.` : `Registro do lote ${dados.idLote} criado.` );
        },
        [onSalvar],
    );

    const excluirComAviso = useCallback(
        async (id: string) => {
            await onExcluir(id);
            setAviso('Registro excluído.');
        },
        [onExcluir],
    );

    return(
        <section className="registros-card" aria-label="Registros de lotes">
            <div className="registros-card__ferramentas">
                <div className="registros_card__busca">
                    <svg className="registros-card__lupa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                    id="registros-busca"
                    type="search"
                    className="registros-card__campo"
                    placeholder="Pesquisar lote específico..."
                    value={busca}
                    onChange={(evento) => onBuscar(sanitizeBusca(evento.target.value))}
                    maxLength={20}
                    />
                </div>

                <button type="button" className="registros-botao" onClick={() => setDialogo({tipo: 'form', registro: null})}>
                    <span aria-hidden="true" className="registros-botao__ione">+</span> Novo Registro
                </button>

                <div>
                    <select
                    id="registros-ordenar"
                    className="registros-card__ordenar"
                    value={ordenacao}
                    onChange={(evento) => onOrdenar(evento.target.value as CampoOrdenacao)}>
                        {opcoesOrdenacao.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>
                                {opcao.rotulo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="registros-card__oculto" role="status" aria-live="polite">
                {aviso}
            </p>

            {status === 'carregando' && (
                <div className="registros-card__estado" role="status">
                    Carregando registros...
                </div>
            )}

            {status === 'erro' && (
                <div className="registros-card__estado" role="alert">
                    <p>
                        {mensagemErro}
                    </p>
                    <button type="button" className="registros-botao" onClick={onRecarregar}>
                        Tentar Novamente
                    </button>
                </div>
            )}

            {status === 'pronto' && (
                <RegistrosTabela registros={registros} onEditar={abrirEdicao} onExcluir={abrirExclusao}/>
            )}

            {dialogo?.tipo === 'form' && (
                <RegistroModal registro={dialogo.registro} onFechar={fechar} onSalvar={salvarComAviso}/>
            )}

            {dialogo?.tipo === 'excluir' &&(
                <ConfirmarExclusao registro={dialogo.registro} onFechar={fechar} onExcluir={excluirComAviso}/>
            )}
        {pagination && <Pagination {...pagination} />}
        </section>
    );
}