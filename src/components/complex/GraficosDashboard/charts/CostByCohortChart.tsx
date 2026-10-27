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
import { formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: CostByLotSizeCohort[];
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
          barGap={4}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="cohort"
            stroke="#64748b"
            fontSize={10}
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
          <Tooltip
            formatter={(value: unknown, name: unknown) => {
              const numVal = typeof value === 'number' ? value : 0;
              const label = name === 'previous_year_cost' ? 'Ano passado' : 'Este ano';
              return [formatarValorAbreviado(numVal), label];
            }}
            labelFormatter={(label) => `Faixa: ${label}`}
            contentStyle={{
              backgroundColor: '#0e0e50',
              borderColor: '#D8A23A',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
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
