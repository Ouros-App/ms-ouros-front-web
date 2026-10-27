import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyCost } from '@/types/dashboard.types';
import { formatarMes, formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: MonthlyCost[];
}

export function MonthlyCostChart({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados mensais para o período selecionado.</p>;
  }

  const dadosFormatados = dados.map((d) => ({
    ...d,
    mesRotulo: formatarMes(d.month_start),
  }));

  return (
    <div className="grafico-container" style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={dadosFormatados}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="mesRotulo"
            stroke="#64748b"
            fontSize={11}
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
            formatter={(value: unknown) => {
              const numVal = typeof value === 'number' ? value : 0;
              return [formatarValorAbreviado(numVal), 'Custo'];
            }}
            labelFormatter={(label) => `Mês: ${label}`}
            contentStyle={{
              backgroundColor: '#0e0e50',
              borderColor: '#D8A23A',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            name="Custo Mensal"
            stroke="#110B95"
            strokeWidth={3}
            dot={{ r: 4.5, fill: '#D8A23A', stroke: '#110B95', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#D8A23A', stroke: '#0e0e50', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
