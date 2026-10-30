import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CostDistributionBucket } from '@/types/dashboard.types';

interface Props {
  dados: CostDistributionBucket[];
}

const CORES_DONUT = ['#0E0925', '#1E1354', '#110B95', '#1A12C3', '#332BF2'];

export function CostDistributionDonutChart({ dados }: Props) {
  const dadosValidos = useMemo(() => {
    if (!dados || dados.length === 0) return [];
    return dados.map((d, index) => ({
      ...d,
      value: d.value ?? d.count ?? 0,
      color: CORES_DONUT[index % CORES_DONUT.length],
    }));
  }, [dados]);

  const total = useMemo(() => {
    return dadosValidos.reduce((acc, curr) => acc + curr.value, 0);
  }, [dadosValidos]);

  if (dadosValidos.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados de distribuição para o período selecionado.</p>;
  }

  return (
    <div className="grafico-container" style={{ width: '100%', height: 260, position: 'relative' }}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Tooltip
            formatter={(value: unknown) => {
              const numVal = typeof value === 'number' ? value : 0;
              const pct = total > 0 ? ((numVal / total) * 100).toFixed(1) : '0';
              return [`${numVal} lotes (${pct}%)`, 'Quantidade'];
            }}
            contentStyle={{
              backgroundColor: '#0e0e50',
              borderColor: '#D8A23A',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            itemStyle={{ color: '#D8A23A' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#111827', fontSize: '11px', fontWeight: 500 }}>{value}</span>}
          />
          <Pie
            data={dadosValidos}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={3}
          >
            {dadosValidos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
