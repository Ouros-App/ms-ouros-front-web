import { useMemo, useState } from 'react';
import type { BoxPlotStats, CostByRegion } from '@/types/dashboard.types';
import { formatarMoeda, formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: CostByRegion[];
}

interface HoverInfo {
  regiao: string;
  serie: 'Ano passado' | 'Este ano';
  stats?: BoxPlotStats;
  custo?: number;
  x: number;
  y: number;
}

export function CostByRegionChart({ dados }: Props) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  // Ordenação das macrorregiões oficiais conforme o Figma: Norte, Nordeste, Centro-Oeste, Sudeste, Sul
  const dadosOrdenados = useMemo(() => {
    if (!dados || dados.length === 0) return [];
    const ordem = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
    return [...dados].sort((a, b) => {
      const idxA = ordem.indexOf(a.region);
      const idxB = ordem.indexOf(b.region);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.region.localeCompare(b.region);
    });
  }, [dados]);

  // Cálculo do teto do eixo Y baseado nos máximos das distribuições ou dos custos
  const maximoY = useMemo(() => {
    if (dadosOrdenados.length === 0) return 250_000;
    let teto = 0;
    for (const d of dadosOrdenados) {
      if (d.previous_year?.max) teto = Math.max(teto, d.previous_year.max);
      if (d.current_year?.max) teto = Math.max(teto, d.current_year.max);
      teto = Math.max(teto, d.previous_year_cost ?? 0, d.current_year_cost ?? 0, d.cost ?? 0);
    }
    if (teto <= 0) return 250_000;
    // Arredondar para um valor amigável (múltiplos de 50k ou 20% acima)
    const expoente = Math.pow(10, Math.floor(Math.log10(teto)));
    const fator = Math.ceil((teto * 1.15) / expoente);
    return fator * expoente;
  }, [dadosOrdenados]);

  if (!dados || dados.length === 0) {
    return <p className="graficos-dashboard__vazio">Sem dados regionais para o período selecionado.</p>;
  }

  // Dimensões da área de plotagem SVG
  const svgWidth = 560;
  const svgHeight = 240;
  const marginTop = 30;
  const marginBottom = 35;
  const marginLeft = 60;
  const marginRight = 15;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maximoY));
    return marginTop + plotHeight - (clamped / maximoY) * plotHeight;
  };

  // 5 linhas de grade Y
  const numDivisoes = 5;
  const ticksY = Array.from({ length: numDivisoes + 1 }, (_, i) => (maximoY / numDivisoes) * i);

  const numRegioes = dadosOrdenados.length;
  const larguraCategoria = plotWidth / numRegioes;
  const larguraBox = Math.min(22, larguraCategoria * 0.28);
  const larguraCap = Math.min(14, larguraBox * 0.7);
  const espacamentoSeries = larguraBox * 0.65;

  return (
    <div
      className="grafico-container"
      style={{
        width: '100%',
        height: 260,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseLeave={() => setHoverInfo(null)}
    >
      {/* Legenda Superior */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          paddingRight: '15px',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: '#110B95',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#111827' }}>Ano passado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: '#D8A23A',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#111827' }}>Este ano</span>
        </div>
      </div>

      {/* SVG Responsivo do Box Plot */}
      <div style={{ width: '100%', flex: 1, position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          {/* Linhas de Grade e Ticks do Eixo Y */}
          {ticksY.map((tick, index) => {
            const y = getY(tick);
            return (
              <g key={`grid-y-${index}`}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={svgWidth - marginRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={index === 0 ? 'none' : '3 3'}
                  strokeWidth={1}
                />
                <text
                  x={marginLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={10}
                  fill="#64748B"
                  fontFamily="Poppins, sans-serif"
                >
                  {formatarValorAbreviado(tick)}
                </text>
              </g>
            );
          })}

          {/* Renderização dos Box Plots por Região */}
          {dadosOrdenados.map((item, index) => {
            const centerX = marginLeft + (index + 0.5) * larguraCategoria;
            const xPassado = centerX - espacamentoSeries;
            const xAtual = centerX + espacamentoSeries;

            // Função para desenhar 1 caixa box plot ou barra fallback
            const renderBox = (
              x: number,
              cor: string,
              stats?: BoxPlotStats,
              custoFallback?: number,
              serie?: 'Ano passado' | 'Este ano',
            ) => {
              if (stats && stats.min !== undefined && stats.max !== undefined) {
                const yMin = getY(stats.min);
                const yQ1 = getY(stats.q1);
                const yMed = getY(stats.median);
                const yQ3 = getY(stats.q3);
                const yMax = getY(stats.max);
                const yAvg = typeof stats.avg === 'number' ? getY(stats.avg) : null;

                const topBox = Math.min(yQ1, yQ3);
                const heightBox = Math.max(3, Math.abs(yQ1 - yQ3));

                return (
                  <g
                    key={`box-${item.region}-${serie}`}
                    cursor="pointer"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      const clientX = rect ? ((x) / svgWidth) * rect.width : x;
                      const clientY = rect ? (topBox / svgHeight) * rect.height : topBox;
                      setHoverInfo({
                        regiao: item.region,
                        serie: serie || 'Este ano',
                        stats,
                        custo: stats.total_cost ?? custoFallback,
                        x: clientX,
                        y: clientY,
                      });
                    }}
                  >
                    {/* Haste Inferior e Cap (Mínimo ao Q1) */}
                    <line x1={x} y1={yMin} x2={x} y2={yQ1} stroke={cor} strokeWidth={1.5} />
                    <line
                      x1={x - larguraCap / 2}
                      y1={yMin}
                      x2={x + larguraCap / 2}
                      y2={yMin}
                      stroke={cor}
                      strokeWidth={1.5}
                    />

                    {/* Haste Superior e Cap (Q3 ao Máximo) */}
                    <line x1={x} y1={yQ3} x2={x} y2={yMax} stroke={cor} strokeWidth={1.5} />
                    <line
                      x1={x - larguraCap / 2}
                      y1={yMax}
                      x2={x + larguraCap / 2}
                      y2={yMax}
                      stroke={cor}
                      strokeWidth={1.5}
                    />

                    {/* Corpo da Caixa (Q1 ao Q3) */}
                    <rect
                      x={x - larguraBox / 2}
                      y={topBox}
                      width={larguraBox}
                      height={heightBox}
                      fill={cor}
                      rx={2}
                      style={{ transition: 'opacity 0.15s ease' }}
                    />

                    {/* Linha da Mediana (Corte branco horizontal no centro da caixa) */}
                    <line
                      x1={x - larguraBox / 2}
                      y1={yMed}
                      x2={x + larguraBox / 2}
                      y2={yMed}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />

                    {/* Ponto da Média (losango/círculo opcional se presente) */}
                    {yAvg !== null && (
                      <circle
                        cx={x}
                        cy={yAvg}
                        r={2.5}
                        fill="#FFFFFF"
                        stroke={cor}
                        strokeWidth={1}
                      />
                    )}
                  </g>
                );
              }

              // Fallback para quando o item não tiver stats completas: desenha barra elegante
              const valor = custoFallback ?? 0;
              const yVal = getY(valor);
              const yZero = getY(0);
              const barHeight = Math.max(3, yZero - yVal);

              return (
                <g
                  key={`bar-${item.region}-${serie}`}
                  cursor="pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    const clientX = rect ? (x / svgWidth) * rect.width : x;
                    const clientY = rect ? (yVal / svgHeight) * rect.height : yVal;
                    setHoverInfo({
                      regiao: item.region,
                      serie: serie || 'Este ano',
                      custo: valor,
                      x: clientX,
                      y: clientY,
                    });
                  }}
                >
                  <rect
                    x={x - larguraBox / 2}
                    y={yVal}
                    width={larguraBox}
                    height={barHeight}
                    fill={cor}
                    rx={2}
                  />
                </g>
              );
            };

            return (
              <g key={`region-${item.region}`}>
                {/* Box Plot - Ano Passado */}
                {renderBox(
                  xPassado,
                  '#110B95',
                  item.previous_year,
                  item.previous_year_cost,
                  'Ano passado',
                )}

                {/* Box Plot - Este Ano */}
                {renderBox(
                  xAtual,
                  '#D8A23A',
                  item.current_year,
                  item.current_year_cost,
                  'Este ano',
                )}

                {/* Rótulo da Região no Eixo X */}
                <text
                  x={centerX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#64748B"
                  fontFamily="Poppins, sans-serif"
                  fontWeight={500}
                >
                  {item.region}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Dinâmico do Box Plot */}
        {hoverInfo && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(Math.max(hoverInfo.x - 70, 10), svgWidth - 180)}px`,
              top: `${Math.max(hoverInfo.y - 120, 10)}px`,
              backgroundColor: '#0E0E50',
              border: `1px solid ${hoverInfo.serie === 'Ano passado' ? '#5A53FF' : '#D8A23A'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: '11px',
              pointerEvents: 'none',
              zIndex: 30,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              minWidth: '150px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#D8A23A', marginBottom: '2px' }}>
              {hoverInfo.regiao}
            </div>
            <div style={{ fontSize: '10px', color: '#B8B6C7', marginBottom: '4px' }}>
              {hoverInfo.serie}
            </div>

            {hoverInfo.stats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 8px' }}>
                <span style={{ color: '#B8B6C7' }}>Máximo:</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>
                  {formatarMoeda(hoverInfo.stats.max)}
                </span>

                <span style={{ color: '#B8B6C7' }}>Q3 (75%):</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>
                  {formatarMoeda(hoverInfo.stats.q3)}
                </span>

                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Mediana:</span>
                <span style={{ fontWeight: 600, color: '#D8A23A', textAlign: 'right' }}>
                  {formatarMoeda(hoverInfo.stats.median)}
                </span>

                {typeof hoverInfo.stats.avg === 'number' && (
                  <>
                    <span style={{ color: '#B8B6C7' }}>Média:</span>
                    <span style={{ fontWeight: 500, textAlign: 'right' }}>
                      {formatarMoeda(hoverInfo.stats.avg)}
                    </span>
                  </>
                )}

                <span style={{ color: '#B8B6C7' }}>Q1 (25%):</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>
                  {formatarMoeda(hoverInfo.stats.q1)}
                </span>

                <span style={{ color: '#B8B6C7' }}>Mínimo:</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>
                  {formatarMoeda(hoverInfo.stats.min)}
                </span>

                {typeof hoverInfo.stats.lots_count === 'number' && (
                  <>
                    <span style={{ color: '#B8B6C7' }}>Lotes:</span>
                    <span style={{ fontWeight: 500, textAlign: 'right' }}>
                      {hoverInfo.stats.lots_count}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div>
                <span style={{ color: '#B8B6C7' }}>Custo Total: </span>
                <span style={{ fontWeight: 500 }}>
                  {formatarMoeda(hoverInfo.custo ?? 0)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
