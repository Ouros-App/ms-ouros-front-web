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
import type { CostByLotSizeCohort } from '@/types/dashboard.types';
import { formatarMoeda, formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: CostByLotSizeCohort[];
}

interface TooltipCohortItem {
  dataKey?: string | number;
  value?: number;
  payload?: CostByLotSizeCohort;
}

function TooltipCustoPorLote({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipCohortItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const itemPayload = payload[0]?.payload;
  const avesInfo =
    typeof itemPayload?.min_birds === 'number' && typeof itemPayload?.max_birds === 'number'
      ? ` (${itemPayload.min_birds.toLocaleString('pt-BR')} - ${itemPayload.max_birds.toLocaleString('pt-BR')} aves)`
      : typeof itemPayload?.min_birds === 'number'
      ? ` (acima de ${itemPayload.min_birds.toLocaleString('pt-BR')} aves)`
      : '';

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
        minWidth: '160px',
      }}
    >
      <div style={{ fontWeight: 600, color: '#D8A23A', marginBottom: '6px' }}>
        Faixa de Lote: {label}
        {avesInfo && (
          <span style={{ color: '#E2E8F0', fontWeight: 400, fontSize: '10px', display: 'block', marginTop: '2px' }}>
            {avesInfo}
          </span>
        )}
      </div>
      {payload.map((entry) => {
        const isPassado = entry.dataKey === 'previous_year_cost';
        const rotulo = isPassado ? 'Ano passado' : 'Este ano';
        const numVal = typeof entry.value === 'number' ? entry.value : 0;
        const lots = isPassado
          ? entry.payload?.previous_year_lots
          : entry.payload?.current_year_lots;
        const lotText = typeof lots === 'number' && lots > 0 ? ` (${lots} lotes)` : '';
        const corCirculo = isPassado ? '#6366F1' : '#D8A23A';

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
                  border: '1.5px solid #FFFFFF',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{rotulo}:</span>
            </div>
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {formatarMoeda(numVal)}
              {lotText && (
                <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '10px', marginLeft: '4px' }}>
                  {lotText}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CostByCohortChart({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados de lote para o período selecionado.</p>;
  }

  return (
    <div className="grafico-container" style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={dados}
          margin={{ top: 15, right: 15, left: 0, bottom: 20 }}
          barGap={6}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="cohort"
            stroke="#64748b"
            fontSize={11}
            interval={0}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => formatarValorAbreviado(val)}
            width={60}
          />
          <Tooltip content={<TooltipCustoPorLote />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconType="circle"
            formatter={(value) => {
              const label = value === 'previous_year_cost' ? 'Ano passado' : 'Este ano';
              return <span style={{ color: '#111827', fontSize: '11px', fontWeight: 500 }}>{label}</span>;
            }}
          />
          <Bar
            dataKey="previous_year_cost"
            name="previous_year_cost"
            fill="#110B95"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="current_year_cost"
            name="current_year_cost"
            fill="#D8A23A"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
