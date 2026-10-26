import type { ChangeEvent } from 'react';
import type { FiltrosDashboardProps } from '@/types/dashboard.types';
import { opcoesEstado, opcoesPeriodo } from '@/utils/dashboard';
import './FiltrosDashboard.css';

export function FiltrosDashboard({ filtros, onAlterar }: FiltrosDashboardProps){
    const alterarPeriodo = (evento: ChangeEvent<HTMLSelectElement>) =>
        onAlterar({ ...filtros, periodo: evento.target.value });
    
    const alterarEstado = (evento: ChangeEvent<HTMLSelectElement>) =>
        onAlterar({ ...filtros, estado: evento.target.value });
    
    return(
    <section className="filtros-dashboard" aria-label="Filtros do dashboard">
        <div>
            <label htmlFor="dashboard-periodo" className="filtros-dashboard__oculto">
                Filtrar por período
            </label>
            <select id="dashboard-periodo" className="filtros-dashboard__select" value={filtros.periodo} onChange={alterarPeriodo}>
                {opcoesPeriodo.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                    </option>
                ))}
            </select>
        </div>
        
        <div>
            <label htmlFor="dashboard-estado" className="filtros-dashboard__oculto">
                Filtrar por estado
            </label>
            
            <select id="dashboard-estado" className="filtros-dashboard__select" value={filtros.estado} onChange={alterarEstado}>
                {opcoesEstado.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                    </option>
                ))}
            </select>
        </div>
    </section>
    );
}