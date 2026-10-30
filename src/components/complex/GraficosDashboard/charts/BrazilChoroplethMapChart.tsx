import { useMemo, useState } from 'react';
import type { CostByRegion, CostDistributionBucket } from '@/types/dashboard.types';
import { formatarMoeda, formatarValorAbreviado } from '@/utils/formato';

interface Props {
  dados: CostDistributionBucket[];
  dadosRegioesApi?: CostByRegion[] | null;
}

interface RegionMeta {
  name: string;
  path: string;
  defaultColor: string;
}

// 5 macrorregiões oficiais extraídas com precisão vetorial direta do Node #5998:4543 do Figma
const REGIOES_BRASIL: Record<string, RegionMeta> = {
  Norte: {
    name: 'Norte',
    defaultColor: '#5A53FF',
    path: 'M42.4162 38.9299H63.9148L67.9821 36.6058L70.3063 47.6456H90.6429L113.885 30.2143L110.979 26.728H105.75L99.9396 12.2019C99.9396 12.2019 109.91 14.4946 116.79 13.9451C128.742 12.9903 144.099 0 144.099 0L149.328 1.16209L148.166 5.81044L152.234 10.4588L148.166 24.9849L160.949 40.092L181.867 34.8626H195.231L193.488 30.2143L208.595 28.4712L216.729 30.2143L233.58 28.4712L244.62 9.2967L252.173 31.3764L263.213 38.3489L255.659 45.9025L257.402 56.3613L277.739 59.2665L266.699 73.7926L274.834 73.2115L286.455 64.4959L305.629 69.7253L290.522 101.102L278.901 110.398L290.522 116.209L285.874 133.64L292.265 142.937H299.238L290.522 153.977L304.467 170.246L296.913 180.124L300.4 196.393L288.779 199.879L275.996 201.041L268.442 195.231L260.308 198.136L257.984 192.907L252.173 195.812L251.011 173.151L256.24 161.53L187.096 157.463C187.096 157.463 183.768 155.529 181.867 153.977C179.878 152.353 177.218 149.328 177.218 149.328L171.989 136.545L167.341 152.234H134.802V176.056H151.652C151.652 176.056 149.448 182.76 151.071 186.515C151.721 188.017 153.396 190.001 153.396 190.001L144.68 204.527L105.75 191.745L94.7102 179.543V163.854L77.2788 166.76L60.4286 177.799L37.1868 178.962V162.111L19.7555 167.922L0 144.099L1.16209 138.87L8.71566 133.059V124.924L17.4313 111.56L41.2541 106.331L48.2267 69.7253L40.092 59.2665V52.875L51.1319 50.5508L50.5508 44.7404L42.4162 45.3214V38.9299Z',
  },
  'Centro-Oeste': {
    name: 'Centro-Oeste',
    defaultColor: '#110B95',
    path: 'M134.802 152.233H167.34L171.989 136.545L177.218 149.328L182.447 154.557L187.677 157.463L256.24 161.53L251.011 173.151L252.173 195.811L257.983 192.906L260.307 198.136L268.442 195.23L275.995 201.041L288.778 199.879L300.399 196.392L301.561 220.796L293.427 220.215V228.931L286.454 231.836V252.754L282.387 257.402L257.983 260.307L248.686 269.604V277.158L217.31 309.696L214.986 319.574C214.986 319.574 210.457 316.188 208.013 315.506C205.817 314.894 202.203 314.925 202.203 314.925L196.392 299.237L176.637 296.913C176.637 296.913 175.015 283.456 175.475 274.833C175.978 265.409 179.542 251.011 179.542 251.011L170.245 244.038V232.998H150.49C150.49 232.998 151.626 217.681 147.585 209.756C146.612 207.849 144.68 204.527 144.68 204.527L153.395 190.001C153.395 190.001 151.143 187.972 150.49 185.934C149.374 182.449 151.461 176.637 151.461 176.637H134.802V152.233Z',
  },
  Nordeste: {
    name: 'Nordeste',
    defaultColor: '#1A12C3',
    path: 'M305.629 69.7256L320.155 79.6033V90.6432L335.263 84.8327L354.437 90.6432H371.868L398.596 112.723L419.514 117.952L423 131.897V143.518L420.676 159.206L398.015 178.962L384.07 201.042L379.422 197.555L374.193 208.014V237.647L370.125 255.079L365.477 259.727C365.477 259.727 360.943 258.394 359.085 256.241C356.784 253.573 356.761 247.525 356.761 247.525L366.058 234.742C366.058 234.742 355.182 232.487 349.208 229.513C341.813 225.832 332.357 216.73 332.357 216.73L326.547 220.797L320.155 213.243L301.562 220.797L300.4 196.393L296.914 180.124L304.467 170.246L290.522 153.977L299.238 142.937H292.265L285.874 133.64L290.522 116.209L278.901 110.399L290.522 101.102L305.629 69.7256Z',
  },
  Sudeste: {
    name: 'Sudeste',
    defaultColor: '#0E0925',
    path: 'M293.427 220.216L301.562 220.797L320.155 213.243L326.547 220.797L332.357 216.729C332.357 216.729 341.803 225.852 349.208 229.512C355.384 232.565 366.058 234.742 366.058 234.742L356.761 247.525C356.761 247.525 356.784 253.573 359.085 256.24C360.943 258.393 365.477 259.727 365.477 259.727L362.572 274.253L349.208 290.522L347.465 300.4C347.465 300.4 342.906 301.609 340.492 303.305C337.994 305.06 335.263 309.115 335.263 309.115L310.278 307.953L307.373 312.602L292.846 318.412L275.415 330.614L262.632 324.223L257.984 305.629L225.445 300.981L248.687 277.158V269.604L257.984 260.308L282.388 257.403L286.455 252.754V231.837L293.427 228.931V220.216Z',
  },
  Sul: {
    name: 'Sul',
    defaultColor: '#1E1354',
    path: 'M225.446 300.98L257.984 305.629L262.632 324.222L275.415 330.614L269.605 335.262L268.443 367.219C268.443 367.219 260.235 372.051 256.241 376.516C251.568 381.74 247.525 392.204 247.525 392.204C247.525 392.204 237.819 399.329 233.58 405.568C231.412 408.759 228.932 414.284 228.932 414.284L221.378 423V416.027L224.283 411.96C224.283 411.96 219.935 407.077 216.73 404.406C212.959 401.264 206.271 397.434 206.271 397.434L188.84 384.07L183.029 384.651C183.029 384.651 189.787 375.521 194.65 370.125C198.947 365.357 206.271 358.504 206.271 358.504L218.473 351.531C218.473 351.531 219.96 346.234 219.635 342.816C219.343 339.743 217.311 335.262 217.311 335.262L209.757 334.1L212.663 317.831L214.987 319.574L217.311 309.696L225.446 300.98Z',
  },
};

// 6 cores do gradiente oficial do Figma (do mais claro ao mais escuro)
const CORES_PALETA = ['#5A53FF', '#332BF2', '#1A12C3', '#110B95', '#1E1354', '#0E0925'];

export function BrazilChoroplethMapChart({ dados, dadosRegioesApi }: Props) {
  const [regiaoAtiva, setRegiaoAtiva] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Mapeia regiões para os dados recebidos (prioriza custos reais da API por região)
  const dadosRegioes = useMemo(() => {
    const mapa = new Map<
      string,
      {
        bucket: string;
        label: string;
        color?: string;
        totalCost: number;
        lotsCount: number;
        percentage?: number;
      }
    >();

    // 1. Prioridade: dados granulares por macrorregião (cost-by-region)
    if (dadosRegioesApi && dadosRegioesApi.length > 0) {
      for (const reg of dadosRegioesApi) {
        const custoAtual = reg.current_year_cost ?? reg.cost ?? reg.previous_year_cost ?? 0;
        const lotes = reg.current_year?.lots_count ?? reg.previous_year?.lots_count ?? 0;
        mapa.set(reg.region, {
          bucket: reg.bucket || reg.region,
          label: reg.region,
          color: reg.color,
          totalCost: custoAtual,
          lotsCount: lotes,
        });
      }
    }

    // 2. Complemento: buckets de distribuição (cost-distribution-buckets)
    if (dados && dados.length > 0) {
      for (const b of dados) {
        const cor = b.color;
        const custo = b.total_cost ?? b.value ?? 0;
        const lotes = b.count ?? 0;
        const pct = b.percentage;

        if (Array.isArray(b.regions) && b.regions.length > 0) {
          for (const r of b.regions) {
            if (!mapa.has(r) || (mapa.get(r)?.totalCost ?? 0) === 0) {
              mapa.set(r, {
                bucket: b.bucket || b.label,
                label: b.label || b.bucket,
                color: cor,
                totalCost: custo,
                lotsCount: lotes,
                percentage: pct,
              });
            }
          }
        } else if (b.label in REGIOES_BRASIL || b.bucket in REGIOES_BRASIL) {
          const rName = b.label in REGIOES_BRASIL ? b.label : b.bucket;
          if (!mapa.has(rName) || (mapa.get(rName)?.totalCost ?? 0) === 0) {
            mapa.set(rName, {
              bucket: b.bucket || b.label,
              label: b.label || b.bucket,
              color: cor,
              totalCost: custo,
              lotsCount: lotes,
              percentage: pct,
            });
          }
        }
      }
    }

    return mapa;
  }, [dados, dadosRegioesApi]);

  // Cálculo dinâmico das faixas e limites baseado no custo real mínimo e máximo das regiões
  const { minCusto, maxCusto, faixasDinamicas } = useMemo(() => {
    const custosValidos: number[] = [];
    dadosRegioes.forEach((item) => {
      if (item.totalCost > 0) custosValidos.push(item.totalCost);
    });

    const min = custosValidos.length > 0 ? Math.min(...custosValidos) : 0;
    const max = custosValidos.length > 0 ? Math.max(...custosValidos) : 0;

    // 1. Prioridade: buckets calculados e retornados dinamicamente pelo backend
    if (dados && dados.length > 0) {
      // O Figma exibe a barra vertical do maior (topo, escuro) para o menor (base, claro)
      const faixas = [...dados].reverse().map((b) => ({
        label: b.label || b.bucket,
        color: b.color || '#5A53FF',
      }));
      return { minCusto: min, maxCusto: max, faixasDinamicas: faixas };
    }

    // 2. Fallback caso não haja buckets na API mas haja custos de regiões:
    if (custosValidos.length === 0) {
      return {
        minCusto: 0,
        maxCusto: 0,
        faixasDinamicas: [
          { label: '3.0M+', color: '#0E0925' },
          { label: '2.5M', color: '#1E1354' },
          { label: '2.0M', color: '#110B95' },
          { label: '1.5M', color: '#1A12C3' },
          { label: '1.0M', color: '#332BF2' },
          { label: '1.0M-', color: '#5A53FF' },
        ],
      };
    }

    if (min === max) {
      return {
        minCusto: min,
        maxCusto: max,
        faixasDinamicas: [
          { label: `${formatarValorAbreviado(max)}+`, color: '#0E0925' },
          { label: formatarValorAbreviado(max * 0.9), color: '#1E1354' },
          { label: formatarValorAbreviado(max * 0.8), color: '#110B95' },
          { label: formatarValorAbreviado(max * 0.7), color: '#1A12C3' },
          { label: formatarValorAbreviado(max * 0.6), color: '#332BF2' },
          { label: `${formatarValorAbreviado(min)}-`, color: '#5A53FF' },
        ],
      };
    }

    const step = (max - min) / 5;
    const faixas = [
      { label: `${formatarValorAbreviado(max)}+`, color: '#0E0925' },
      { label: formatarValorAbreviado(min + step * 4), color: '#1E1354' },
      { label: formatarValorAbreviado(min + step * 3), color: '#110B95' },
      { label: formatarValorAbreviado(min + step * 2), color: '#1A12C3' },
      { label: formatarValorAbreviado(min + step * 1), color: '#332BF2' },
      { label: `${formatarValorAbreviado(min)}-`, color: '#5A53FF' },
    ];

    return { minCusto: min, maxCusto: max, faixasDinamicas: faixas };
  }, [dados, dadosRegioes]);

  // Função para mapear o custo de uma região à sua cor no gradiente dinâmico
  const getCorRegiao = (key: string): string => {
    const data = dadosRegioes.get(key);
    if (!data || data.totalCost <= 0) {
      return REGIOES_BRASIL[key]?.defaultColor || '#5A53FF';
    }

    if (data.color) {
      return data.color;
    }

    if (maxCusto > minCusto) {
      const ratio = Math.max(0, Math.min(1, (data.totalCost - minCusto) / (maxCusto - minCusto)));
      const idx = Math.min(CORES_PALETA.length - 1, Math.floor(ratio * 5.999));
      return CORES_PALETA[idx];
    }

    return REGIOES_BRASIL[key]?.defaultColor || '#110B95';
  };

  if ((!dados || dados.length === 0) && (!dadosRegioesApi || dadosRegioesApi.length === 0)) {
    return <p className="graficos-dashboard__vazio">Sem dados de custo para o período selecionado.</p>;
  }

  const infoAtiva = regiaoAtiva ? dadosRegioes.get(regiaoAtiva) : null;

  return (
    <div
      className="grafico-container choropleth-map-wrapper"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
        minHeight: '260px',
        padding: '8px',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      onMouseLeave={() => {
        setRegiaoAtiva(null);
        setMousePos(null);
      }}
    >
      {/* Mapa do Brasil SVG Interativo */}
      <div
        className="choropleth-map-svg-container"
        style={{
          flex: '1 1 auto',
          maxWidth: '300px',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 423 423"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Mapa Coroplético do Brasil por Macrorregiões"
          style={{ overflow: 'visible' }}
        >
          {Object.entries(REGIOES_BRASIL).map(([key, regiao]) => {
            const fillCor = getCorRegiao(key);
            const isHovered = regiaoAtiva === key;

            return (
              <path
                key={key}
                d={regiao.path}
                fill={fillCor}
                stroke={isHovered ? '#D8A23A' : '#FFFFFF'}
                strokeWidth={isHovered ? 2.5 : 1}
                strokeLinejoin="round"
                cursor="pointer"
                style={{
                  transition: 'all 0.2s ease-in-out',
                  filter: isHovered ? 'drop-shadow(0 0 6px rgba(216, 162, 58, 0.6))' : 'none',
                  opacity: regiaoAtiva && !isHovered ? 0.75 : 1,
                }}
                onMouseEnter={() => setRegiaoAtiva(key)}
                tabIndex={0}
                role="button"
                aria-label={`Região ${key}`}
              />
            );
          })}
        </svg>
      </div>

      {/* Legenda Vertical de Gradiente do Figma com Faixas Dinâmicas */}
      <div
        className="choropleth-map-legend"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Bloco contínuo das 6 cores */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '16px',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          {faixasDinamicas.map((faixa, i) => (
            <div
              key={`color-${faixa.label}-${i}`}
              style={{
                width: '16px',
                height: '32px',
                backgroundColor: faixa.color,
                borderTopLeftRadius: i === 0 ? '4px' : '0',
                borderTopRightRadius: i === 0 ? '4px' : '0',
                borderBottomLeftRadius: i === faixasDinamicas.length - 1 ? '4px' : '0',
                borderBottomRightRadius: i === faixasDinamicas.length - 1 ? '4px' : '0',
              }}
            />
          ))}
        </div>

        {/* Rótulos de Texto Dinâmicos das Faixas */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: `${faixasDinamicas.length * 32}px`,
            padding: '2px 0',
          }}
        >
          {faixasDinamicas.map((faixa, i) => (
            <span
              key={`label-${faixa.label}-${i}`}
              style={{
                fontSize: '11px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                color: '#7E7D89',
                lineHeight: 1,
              }}
            >
              {faixa.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tooltip Dinâmico Flutuante */}
      {regiaoAtiva && mousePos && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(mousePos.x + 12, 280)}px`,
            top: `${Math.max(mousePos.y - 45, 10)}px`,
            backgroundColor: '#0E0E50',
            border: '1px solid #D8A23A',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#FFFFFF',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 30,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            minWidth: '130px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#D8A23A', marginBottom: '3px' }}>
            Região {regiaoAtiva}
          </div>
          {infoAtiva ? (
            <>
              {infoAtiva.label && infoAtiva.label !== regiaoAtiva && (
                <div>
                  <span style={{ color: '#B8B6C7' }}>Faixa: </span>
                  <span style={{ fontWeight: 500 }}>{infoAtiva.label}</span>
                </div>
              )}
              <div>
                <span style={{ color: '#B8B6C7' }}>Custo Total: </span>
                <span style={{ fontWeight: 500 }}>{formatarMoeda(infoAtiva.totalCost)}</span>
              </div>
              {infoAtiva.lotsCount > 0 && (
                <div>
                  <span style={{ color: '#B8B6C7' }}>Lotes: </span>
                  <span style={{ fontWeight: 500 }}>{infoAtiva.lotsCount}</span>
                </div>
              )}
              {typeof infoAtiva.percentage === 'number' && (
                <div>
                  <span style={{ color: '#B8B6C7' }}>Participação: </span>
                  <span style={{ fontWeight: 500 }}>{infoAtiva.percentage.toFixed(1)}%</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#E2E8F0', fontSize: '10px' }}>
              Dados não agregados para esta região.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
