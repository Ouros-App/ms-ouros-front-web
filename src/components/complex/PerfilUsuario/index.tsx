import { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import './PerfilUsuario.css'

function formatarData(iso: string): string {
    const data = new Date(iso);
    return Number.isNaN(data.getTime()) ? '' : data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function PerfilUsuario(){
    const {user} = useAuth();
    const {naoLidas, notificacoes, status, mensagemErro, carregarLista, marcarLida, marcarTodas} = useNotificacoes();
    const [aberto, setAberto] = useState(false);
    const raizRef = useRef<HTMLDivElement>(null);
    const nome = user?.name ?? 'Usuário';
    const cargo = user?.role === 'admin' ? 'Administrador' : 'Usuário';

    useEffect(() => {
        if(!aberto) return;
        const aoClicarFora = (evento: MouseEvent) => {
            if(raizRef.current && !raizRef.current.contains(evento.target as Node)) setAberto(false);
        };
        const aoTeclar = (evento: KeyboardEvent) => {
            if(evento.key === 'Escape') setAberto(false);
        };
        document.addEventListener('mousedown', aoClicarFora);
        document.addEventListener('keydown', aoTeclar);
        return () => {
            document.removeEventListener('mousedown', aoClicarFora);
            document.removeEventListener('keydown', aoTeclar);
        };
    }, [aberto]);

    const alternarPainel = () => {
        const proximo = !aberto;
        setAberto(proximo);
        if(proximo) void carregarLista();
    };

    return(
        <div className="perfil-usuario" ref={raizRef}>
            <button type="button" className="perfil-usuario__sino" onClick={alternarPainel} aria-expanded={aberto} aria-haspopup="true" aria-controls="painel-notificacoes" aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
                </svg>
                {naoLidas > 0 && (
                    <span className='perfil-usuario__selo' aria-hidden="true">
                        {naoLidas}
                    </span>
                )}
            </button>
            {aberto && (
                <div id="painel-notificacoes" className="perfil-usuario__painel" role="region" aria-label="Notificações">
                    <h2 className="perfil-usuario__painel-titulo">Notificações</h2>
                    {status === 'pronto' && notificacoes.some((n) => !n.lida) && <button type="button" className="perfil-usuario__painel-acao" onClick={() => void marcarTodas()}>Marcar todas como lidas</button>}
                    {status === 'pronto' && mensagemErro && <p role="alert" className="perfil-usuario__painel-info perfil-usuario__painel-info--erro">{mensagemErro}</p>}
                    {status === 'carregando' && <p role="status" className="perfil-usuario__painel-info">Carregando...</p>}
                    {status === 'erro' && (
                        <p role="alert" className="perfil-usuario__painel-info perfil-usuario__painel-info--erro">
                            {mensagemErro}{' '}
                            <button type="button" className="perfil-usuario__painel-acao" onClick={() => void carregarLista()}>Tentar novamente</button>
                        </p>
                    )}
                    {status === 'pronto' && notificacoes.length === 0 && (
                        <p className="perfil-usuario__painel-info">Nenhuma notificação por aqui.</p>
                    )}
                    {status === 'pronto' && notificacoes.length > 0 && (
                        <ul className="perfil-usuario__lista">
                            {notificacoes.map((n) => (
                                <li key={n.id} className={`perfil-usuario__item${n.lida ? '' : ' perfil-usuario__item--nova'}`}>
                                    <p className="perfil-usuario__item-titulo">{n.titulo}</p>
                                    <p className="perfil-usuario__item-texto">{n.mensagem}</p>
                                    <div className="perfil-usuario__item-rodape">
                                        <time dateTime={n.criadaEm}>{formatarData(n.criadaEm)}</time>
                                        {!n.lida && (
                                            <button type="button" className="perfil-usuario__painel-acao" onClick={() => void marcarLida(n.id)}>Marcar como lida</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <Link to="/perfil" className='perfil-usuario__link' aria-label={`Perfil de ${nome}`}>
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className='perfil-usuario__avatar'/>
            ) : (
                <span className="perfil-usuario__avatar perfil-usuario__avatar--inicial" aria-hidden="true">
                    {nome.charAt(0).toUpperCase()}
                </span>
            )}
            <span className="perfil-usuario__identidade">
                <span className="perfil-usuario__nome">{nome}</span>
                <span className="perfil-usuario__cargo">{cargo}</span>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="m6 9 6 6 6-6" />
            </svg>
            </Link>
        </div>
    );
}
