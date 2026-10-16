import {Link} from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import './PerfilUsuario.css'

export function PerfilUsuario(){
    const {user} = useAuth();
    const {naoLidas} = useNotificacoes();
    const nome = user?.name ?? 'Usuário';
    const cargo = user?.role === 'admin' ? 'Administrador' : 'Usuário';

    return(
        <div className="perfil-usuario">
            <button type="button" className="perfil-usuario__sino" aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
                </svg>
                {naoLidas > 0 && (
                    <span className='perfil-usuario__selo' aria-hidden="true">
                        {naoLidas}
                    </span>
                )}
            </button>
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