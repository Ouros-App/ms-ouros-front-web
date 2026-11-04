import { memo } from "react";
import type { GraficoProgressoProps } from "@/types/metas.types";
import './GraficoProgresso.css'

const RAIO = 54;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function GraficoProgressoBase({percentual}: GraficoProgressoProps){
    const valorValido = Number.isFinite(percentual) ? Math.min(100, Math.max(0, percentual)) : 0;
    const valorArredondado = Math.round(valorValido);
    const preenchido = (CIRCUNFERENCIA * valorValido) / 100;

    return(
        <svg className="grafico-progresso" viewBox="0 0 140 140" role="img" aria-label={`${valorArredondado}% das metas concluídas`}>
            <circle className="grafico-progresso__fundo" cx="70" cy="70" r={RAIO} />

            <circle className="grafico-progresso__valor" cx="70" cy="70" r={RAIO} strokeDasharray={`${preenchido} ${CIRCUNFERENCIA}`}
            transform="rotate(-90 70 70)"/>
            <text className="grafico-progresso__texto" x="70" y="70" textAnchor="middle" dominantBaseline="central">
                {valorArredondado}%
            </text>
        </svg>
    );
}

export const GraficoProgresso = memo(GraficoProgressoBase);
