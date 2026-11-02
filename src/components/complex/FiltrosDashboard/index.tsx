import type { ChangeEvent } from 'react';
import type { FiltrosDashboardProps } from '@/types/dashboard.types';
import { opcoesPeriodo } from '@/utils/dashboard';
import './FiltrosDashboard.css';

export function FiltrosDashboard({ filtros, opcoes, onAlterar }: FiltrosDashboardProps) {
  const alterarPeriodo = (evento: ChangeEvent<HTMLSelectElement>) =>
    onAlterar({ ...filtros, periodo: evento.target.value });

  const temPeriodos = Boolean(opcoes?.periods && opcoes.periods.length > 0);

  return (
    <section className="filtros-dashboard" aria-label="Filtros do dashboard">
      <div>
        <label htmlFor="dashboard-periodo" className="filtros-dashboard__oculto">
          Filtrar por período
        </label>
        <select
          id="dashboard-periodo"
          className="filtros-dashboard__select"
          value={filtros.periodo}
          onChange={alterarPeriodo}
        >
          {temPeriodos ? (
            <>
              <option value="atual">Mês Atual</option>
              {opcoes?.periods
                .filter((p) => p !== 'Mês Atual')
                .map((periodo) => (
                  <option key={periodo} value={periodo}>
                    {periodo}
                  </option>
                ))}
            </>
          ) : (
            opcoesPeriodo.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))
          )}
        </select>
      </div>
    </section>
  );
}
