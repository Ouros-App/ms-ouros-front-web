import { memo } from 'react';
import type { KpiCardProps } from '@/types/dashboard.types';
import './KpiCard.css';

function KpiCardBase({ rotulo, prefixo, valor, descricao }: KpiCardProps){
    return(
        <article className="kpi-card">
            <p className="kpi-card__rotulo">{rotulo}</p>
            <p className="kpi-card__valor">
                {prefixo && <span className="kpi-card__prefixo">{prefixo}</span>}
                {valor}
            </p>
            <p className="kpi-card__descricao">{descricao}</p>
        </article>
    );
}

export const KpiCard = memo(KpiCardBase);