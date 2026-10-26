import { PainelGrafico } from '@/components/complex/PainelGrafico';
import { useGraficoDatabricks } from '@/hooks/useGraficosDatabricks';
import type { GraficosDashboardProps } from '@/types/dashboard.types';
import './GraficosDashboard.css';

function resumo(quantidade: number): string{
    return `Dados recebidos do Databricks (${quantidade} registros).`;
}

export function GraficosDashboard({ filtros }: GraficosDashboardProps){
    const mapa = useGraficoDatabricks('mapa-custo', filtros);
    const lote = useGraficoDatabricks('custo-lote', filtros);
    const regiao = useGraficoDatabricks('custo-regiao', filtros);
    const mensal = useGraficoDatabricks('custo-mensal', filtros);
    
    return(
        <div className="graficos-dashboard">
            <PainelGrafico titulo="Custo" status={mapa.status} mensagemErro={mapa.mensagemErro} onRecarregar={mapa.recarregar}>
                <p className="graficos-dashboard__resumo">{resumo(mapa.dados?.length ?? 0)}</p>
            </PainelGrafico>

            <PainelGrafico titulo="Custo por lote" status={lote.status} mensagemErro={lote.mensagemErro} onRecarregar={lote.recarregar}>
                <p className="graficos-dashboard__resumo">{resumo(lote.dados?.length ?? 0)}</p>
            </PainelGrafico>
            
            <PainelGrafico titulo="Custo por região" status={regiao.status} mensagemErro={regiao.mensagemErro} onRecarregar={regiao.recarregar}>
                <p className="graficos-dashboard__resumo">{resumo(regiao.dados?.length ?? 0)}</p>
            </PainelGrafico>

            <PainelGrafico titulo="Custo mensal" status={mensal.status} mensagemErro={mensal.mensagemErro} onRecarregar={mensal.recarregar}>
                <p className="graficos-dashboard__resumo">{resumo(mensal.dados?.length ?? 0)}</p>
            </PainelGrafico>
        </div>
    );
}