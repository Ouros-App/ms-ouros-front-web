import { useCallback, useState } from 'react';
import { getCorporateFarmsPage } from '@/services/telemetryDashboardService';
import { usePagedList } from '@/hooks/usePagedList';
import { Pagination } from '@/components/common/Pagination';
import './DashboardFarmsTable.css';

interface DashboardFarmsTableProps {
  enterpriseId?: number | null;
  state?: string;
  management?: string;
  period?: string;
}

export function DashboardFarmsTable({ enterpriseId, state, management, period }: DashboardFarmsTableProps) {
  const [busca, setBusca] = useState('');
  const load = useCallback((page: number, size: number, signal: AbortSignal) =>
    getCorporateFarmsPage({ page, size, search: busca }, {
      enterpriseId: enterpriseId ?? undefined, state, management, month: period,
    }, signal), [busca, enterpriseId, state, management, period]);
  const list = usePagedList(load);
  const granjas = list.items;
  const total = list.pagination.totalElements;
  const carregando = list.status === 'carregando';
  const erro = list.status === 'erro' ? list.mensagemErro : null;

  return (
    <section className="dashboard-farms-table" aria-label="Tabela Corporativa de Granjas">
      <header className="dashboard-farms-table__header">
        <div>
          <h2 className="dashboard-farms-table__title">Granjas Integradas</h2>
          <p className="dashboard-farms-table__subtitle">
            Acompanhamento operacional de consumo e eficiência ({total} granjas registradas)
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar por granja ou gestor..."
          className="dashboard-farms-table__search"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
          }}
        />
      </header>

      {carregando ? (
        <p role="status" className="dashboard-farms-table__info">Carregando dados das granjas...</p>
      ) : erro ? (
        <div role="alert" className="dashboard-farms-table__info">
          <p>{erro}</p>
          <button
            type="button"
            className="dashboard-farms-table__btn"
            onClick={list.recarregar}
          >
            Tentar novamente
          </button>
        </div>
      ) : granjas.length === 0 ? (
        <p role="status" className="dashboard-farms-table__info">Nenhuma granja encontrada.</p>
      ) : (
        <div className="dashboard-farms-table__wrapper">
          <table className="dashboard-farms-table__table">
            <thead>
              <tr>
                <th>Granja</th>
                <th>Localização</th>
                <th>Gestor</th>
                <th>Lotes</th>
                <th>Consumo Total</th>
                <th>Custo Médio / Lote</th>
                <th>Custo Médio / Ave</th>
              </tr>
            </thead>
            <tbody>
              {granjas.map((g) => (
                <tr key={g.farm_id}>
                  <td className="dashboard-farms-table__strong">{g.farm_name}</td>
                  <td>{g.location} {g.state ? `(${g.state})` : ''}</td>
                  <td>{g.manager_name || 'Não informado'}</td>
                  <td>{g.lots_count}</td>
                  <td>{g.total_consumption}</td>
                  <td>R$ {Number(g.avg_lot_cost ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ {Number(g.avg_cost_per_bird ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...list.pagination} />
    </section>
  );
}
