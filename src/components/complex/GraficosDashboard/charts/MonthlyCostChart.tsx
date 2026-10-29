import { useMemo } from 'react';
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

interface TooltipItem {
  dataKey?: string | number;
  value?: number;
}

function TooltipCustoMensal({
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
        Mês: {label}
      </div>
      {payload.map((entry) => {
        const isPassado = entry.dataKey === 'anoPassado';
        const rotulo = isPassado ? 'Ano passado' : 'Este ano';
        const valorFormatado =
          typeof entry.value === 'number' && entry.value > 0
            ? formatarMoeda(entry.value)
            : 'Sem registro';
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
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{valorFormatado}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MonthlyCostChart({ dados }: Props) {
  const dadosFormatados = useMemo(() => {
    if (!dados || dados.length === 0) return [];
    return dados.map((d) => {
      let mesRotulo = d.month_label;
      if (!mesRotulo && typeof d.month === 'number' && d.month >= 1 && d.month <= 12) {
        mesRotulo = MESES_ABREV[d.month - 1];
      } else if (!mesRotulo && d.month_start) {
        mesRotulo = formatarMes(d.month_start);
      }

      // Evitar que meses futuros ou sem dados caiam bruscamente para 0 puxando a curva ao chão
      const anoPassado =
        typeof d.previous_year_cost === 'number' && d.previous_year_cost > 0
          ? d.previous_year_cost
          : null;

      const custoAtual = d.current_year_cost ?? d.cost;
      const esteAno =
        typeof custoAtual === 'number' && custoAtual > 0
          ? custoAtual
          : null;

      return {
        ...d,
        mesRotulo: mesRotulo || '',
        anoPassado,
        esteAno,
      };
    });
  }, [dados]);

  if (!dados || dados.length === 0 || dadosFormatados.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados mensais para o período selecionado.</p>;
  }

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
          <Tooltip content={<TooltipCustoMensal />} />
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
            connectNulls={false}
            dot={{ r: 4, fill: '#110B95', stroke: '#110B95' }}
            activeDot={{ r: 6, fill: '#110B95', stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="esteAno"
            name="esteAno"
            stroke="#D8A23A"
            strokeWidth={2.5}
            connectNulls={false}
            dot={{ r: 4, fill: '#D8A23A', stroke: '#D8A23A' }}
            activeDot={{ r: 6, fill: '#D8A23A', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
