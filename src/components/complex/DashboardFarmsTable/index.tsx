import { useEffect, useState } from 'react';
import { getCorporateFarms } from '@/services/telemetryDashboardService';
import type { FarmSummaryItem } from '@/types/dashboard.types';
import { isAbortError } from '@/utils/delay';
import './DashboardFarmsTable.css';

interface DashboardFarmsTableProps {
  enterpriseId?: number | null;
  state?: string;
  management?: string;
  period?: string;
}

export function DashboardFarmsTable({ enterpriseId, state, management, period }: DashboardFarmsTableProps) {
  const [granjas, setGranjas] = useState<FarmSummaryItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);
    setErro(null);

    getCorporateFarms(
      {
        search: busca || undefined,
        page: pagina,
        limit: 10,
        enterpriseId: enterpriseId ?? undefined,
        state: state || undefined,
        management: management || undefined,
        month: period || undefined,
      },
      controller.signal,
    )
      .then((res) => {
        setGranjas(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        console.warn('Falha ao carregar tabela de granjas:', err);
        setGranjas([]);
        setTotal(0);
        setErro('Não foi possível carregar os dados das granjas.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [busca, pagina, enterpriseId, state, management, period, tentativa]);

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
            setPagina(1);
          }}
        />
      </header>

      {carregando ? (
        <p className="dashboard-farms-table__info">Carregando dados das granjas...</p>
      ) : erro ? (
        <div className="dashboard-farms-table__info">
          <p>{erro}</p>
          <button
            type="button"
            className="dashboard-farms-table__btn"
            onClick={() => setTentativa((n) => n + 1)}
          >
            Tentar novamente
          </button>
        </div>
      ) : granjas.length === 0 ? (
        <p className="dashboard-farms-table__info">Nenhuma granja encontrada.</p>
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

      {total > 10 && (
        <footer className="dashboard-farms-table__footer">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            className="dashboard-farms-table__btn"
          >
            Anterior
          </button>
          <span>Página {pagina} de {Math.ceil(total / 10)}</span>
          <button
            type="button"
            disabled={pagina >= Math.ceil(total / 10)}
            onClick={() => setPagina((p) => p + 1)}
            className="dashboard-farms-table__btn"
          >
            Próxima
          </button>
        </footer>
      )}
    </section>
  );
}
