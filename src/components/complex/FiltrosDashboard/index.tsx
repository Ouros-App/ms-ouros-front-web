import type { ChangeEvent } from 'react';
import type { FiltrosDashboardProps } from '@/types/dashboard.types';
import { opcoesEstado, opcoesPeriodo } from '@/utils/dashboard';
import './FiltrosDashboard.css';

export function FiltrosDashboard({ filtros, opcoes, onAlterar }: FiltrosDashboardProps) {
  const alterarPeriodo = (evento: ChangeEvent<HTMLSelectElement>) =>
    onAlterar({ ...filtros, periodo: evento.target.value });

  const alterarEstado = (evento: ChangeEvent<HTMLSelectElement>) =>
    onAlterar({ ...filtros, estado: evento.target.value });

  const alterarGerencia = (evento: ChangeEvent<HTMLSelectElement>) =>
    onAlterar({ ...filtros, gerencia: evento.target.value });

  const temPeriodos = Boolean(opcoes?.periods && opcoes.periods.length > 0);
  const temEstados = Boolean(opcoes?.states && opcoes.states.length > 0);
  const temGerencias = Boolean(opcoes?.regional_managements && opcoes.regional_managements.length > 0);

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
              {opcoes?.periods.map((periodo) => (
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

      <div>
        <label htmlFor="dashboard-estado" className="filtros-dashboard__oculto">
          Filtrar por estado
        </label>
        <select
          id="dashboard-estado"
          className="filtros-dashboard__select"
          value={filtros.estado}
          onChange={alterarEstado}
        >
          {temEstados ? (
            <>
              <option value="todos">Estado</option>
              {opcoes?.states.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </>
          ) : (
            opcoesEstado.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))
          )}
        </select>
      </div>

      {temGerencias && (
        <div>
          <label htmlFor="dashboard-gerencia" className="filtros-dashboard__oculto">
            Filtrar por gerência regional
          </label>
          <select
            id="dashboard-gerencia"
            className="filtros-dashboard__select"
            value={filtros.gerencia ?? 'todas'}
            onChange={alterarGerencia}
          >
            <option value="todas">Gerência Regional</option>
            {opcoes?.regional_managements.map((gerencia) => (
              <option key={gerencia} value={gerencia}>
                {gerencia}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
