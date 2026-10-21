import { memo } from "react";
import type { IndicadorCardProps } from "@/types/simulacoes.types";
import 'IndicadoresCard.css';

function IndicadorCardBase({rotulo, valor, icone}: IndicadorCardProps){
    return (
        <article className="indicador-card">
            <span className="indicador-card__icone" aria-hidden="true">
                {icone}
            </span>
            
            <div className="indicador-card__texto">
                <p className="indicador-card__rotulo">{rotulo}</p>
                <p className="indicador-card__valor">{valor}</p>
            </div>
        </article>
    );
}

export const IndicadoresCard = memo(IndicadorCardBase);