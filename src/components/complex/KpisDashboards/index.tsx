import { KpiCard } from '@/components/complex/KpiCard';
import type { KpisDashboardProps } from '@/types/dashboard.types';
import { itensKpis } from './kpiItens';
import './KpisDashboard.css';

export function KpisDashboard({ indicadores, status, mensagemErro, onRecarregar }: KpisDashboardProps){
    const anoAtual = new Date().getFullYear();
    if (status === 'erro'){
        return(
        <section className="kpis-dashboard kpis-dashboard--estado" aria-label="Indicadores do dashboard" role="alert">
            <p className="kpis-dashboard__mensagem">{mensagemErro}</p>
            <button type="button" className="kpis-dashboard__botao" onClick={onRecarregar}>
                Tentar novamente
            </button>
        </section>
        );
    }
    
    if (status === 'carregando' || !indicadores){
        return (
        <section className="kpis-dashboard" aria-label="Indicadores do dashboard" aria-busy="true">
            <p className="kpis-dashboard__oculto" role="status">
                Carregando indicadores...
            </p>
            
            {itensKpis.map((item) => (
                <div key={item.chave} className="kpis-dashboard__esqueleto" aria-hidden="true" />
            ))}
        </section>
    );
}

return(
    <section className="kpis-dashboard" aria-label="Indicadores do dashboard">
        {itensKpis.map((item) => (
            <KpiCard
            key={item.chave}
            rotulo={item.rotulo}
            prefixo={item.prefixo}
            valor={item.formatar(indicadores[item.chave])}
            descricao={item.descricao(anoAtual)}
        />
        ))}
    </section>
    );
}