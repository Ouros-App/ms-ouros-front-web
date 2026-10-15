import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { SidebarItem } from '@/types/sidebar.types';
import { iconeSair, itemConfiguracoes, ItensPrincipais } from './sidebarItems';
import { logoMenu } from './sidebarAssets';
import './Sidebar.css';

function Item({ item }: { item: SidebarItem }) {
    return (
    <li>
        <NavLink to={item.caminho} className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--ativo' : ''}`} aria-label={item.rotulo} title={item.rotulo}>
            {item.icone}
        </NavLink>
    </li>
    );
}

export function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const sair = () => { logout(); navigate('/login', { replace: true });};

    return (
    <aside className="sidebar">
        <div className="sidebar__logo">
            {logoMenu ? (
                <img src={logoMenu} alt="OUROS" className="sidebar__logo-img" />
            ) : (
            <svg width="34" height="34" viewBox="0 0 40 40" role="img" aria-label="OUROS">
                <path d="M4 28C10 12 20 5 37 7c-6 4-10 8-12 12 6-2 10-3 14-3-8 9-21 15-35 12Z" fill="#f5b82e" />
            </svg>
            )}
        </div>
        
        <nav className="sidebar__nav" aria-label="Menu principal">
        <ul className="sidebar__list">
            {ItensPrincipais.map((item) => (
                <Item key={item.caminho} item={item} />
            ))}
        </ul>
        </nav>
        
        <ul className="sidebar__list sidebar__list--base">
            <Item item={itemConfiguracoes} />
            <li>
                <button type="button" className="sidebar__link" onClick={sair} aria-label="Sair" title="Sair">
                    {iconeSair}
                </button>
            </li>
        </ul>
    </aside>
    );
}