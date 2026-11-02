import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminAiComparativeCohortPoint } from '@/services/adminAiMetricsService';
import { formatarMoeda, formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: AdminAiComparativeCohortPoint[];
}

interface TooltipItem {
  dataKey?: string | number;
  value?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: '#0E0E50',
        border: '1px solid #D8A23A',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#FFFFFF',
        fontSize: '11px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        minWidth: '150px',
      }}
    >
      <div style={{ fontWeight: 600, color: '#D8A23A', marginBottom: '6px' }}>
        Faixa de Requisições: {label}
      </div>
      {payload.map((entry) => {
        const isPassado = entry.dataKey === 'previous_year_cost';
        const rotulo = isPassado ? 'Ano passado' : 'Este ano';
        const numVal = typeof entry.value === 'number' ? entry.value : 0;
        const corCirculo = isPassado ? '#110B95' : '#D8A23A';

        return (
          <div
            key={String(entry.dataKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: corCirculo,
                  border: '1px solid #FFFFFF',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{rotulo}:</span>
            </div>
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{formatarMoeda(numVal)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AiRequestSpendChart({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return <p className="dashboard-ai-metrics__vazio">Sem dados de gasto por requisição.</p>;
  }

  return (
    <div className="dashboard-ai-metrics__grafico-shell">
      <ResponsiveContainer width="100%" height={290}>
        <BarChart
          data={dados}
          margin={{ top: 15, right: 15, left: -5, bottom: 20 }}
          barGap={6}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="cohort"
            stroke="#7E7D89"
            fontSize={11}
            interval={0}
            tickLine={false}
            axisLine={{ stroke: '#CACACA' }}
          />
          <YAxis
            stroke="#7E7D89"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => formatarValorAbreviado(val)}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            height={30}
            iconType="rect"
            iconSize={10}
            formatter={(value) => {
              const label = value === 'previous_year_cost' ? 'Ano passado' : 'Este ano';
              return <span style={{ color: '#010B13', fontSize: '13px', fontWeight: 400, marginLeft: 4 }}>{label}</span>;
            }}
          />
          <Bar
            dataKey="previous_year_cost"
            name="previous_year_cost"
            fill="#110B95"
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="current_year_cost"
            name="current_year_cost"
            fill="#D8A23A"
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
