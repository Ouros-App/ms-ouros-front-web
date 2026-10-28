import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyCost } from '@/types/dashboard.types';
import { formatarMes, formatarMoeda, formatarValorAbreviado, MESES_ABREV } from '@/utils/formato';

interface Props {
  dados: MonthlyCost[];
}

export function MonthlyCostChart({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados mensais para o período selecionado.</p>;
  }

  const dadosFormatados = dados.map((d) => {
    let mesRotulo = d.month_label;
    if (!mesRotulo && typeof d.month === 'number' && d.month >= 1 && d.month <= 12) {
      mesRotulo = MESES_ABREV[d.month - 1];
    } else if (!mesRotulo && d.month_start) {
      mesRotulo = formatarMes(d.month_start);
    }

    return {
      ...d,
      mesRotulo: mesRotulo || '',
      anoPassado: d.previous_year_cost ?? 0,
      esteAno: d.current_year_cost ?? d.cost ?? 0,
    };
  });

  return (
    <div className="grafico-container" style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={dadosFormatados}
          margin={{ top: 15, right: 15, left: 0, bottom: 20 }}
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
            formatter={(value: unknown, name: unknown) => {
              const numVal = typeof value === 'number' ? value : 0;
              const rotulo = name === 'anoPassado' ? 'Ano passado' : 'Este ano';
              return [formatarMoeda(numVal), rotulo];
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
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconType="circle"
            formatter={(value) => {
              const label = value === 'anoPassado' ? 'Ano passado' : 'Este ano';
              return <span style={{ color: '#111827', fontSize: '11px', fontWeight: 500 }}>{label}</span>;
            }}
          />
          <Line
            type="monotone"
            dataKey="anoPassado"
            name="anoPassado"
            stroke="#110B95"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#110B95', stroke: '#110B95' }}
            activeDot={{ r: 6, fill: '#110B95', stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="esteAno"
            name="esteAno"
            stroke="#D8A23A"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#D8A23A', stroke: '#D8A23A' }}
            activeDot={{ r: 6, fill: '#D8A23A', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
