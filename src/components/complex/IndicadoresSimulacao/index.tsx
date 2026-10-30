import { IndicadorCard } from "../IndicadorCard";
import type { IndicadoresSimulacaoProps } from "@/types/simulacoes.types";
import { ItensIndicadores } from "./IndicadoresItens";
import './IndicadoresSimulacao.css';

export function IndicadoresSimulacao({indicadores, status, mensagemErro, onRecarregar}: IndicadoresSimulacaoProps){
    if(status === 'erro'){
        return(
            <section className="indicadores-simulacao indicadores-simulacao--estado" aria-label="Indicadores da simulação" role="alert">
                <p className="indicadores-simulacao__mensagem">{mensagemErro}</p>
                <button type="button" className="indicadores-simulacao__botao" onClick={onRecarregar}>
                    Tentar novamente
                </button>
            </section>
        );
    }

    if (status === 'carregando' || !indicadores){
        return(
            <section className="indicadores-simulacao" aria-label="Indicadores de simulação" aria-busy="true">
                <p className="indicadores-simulacao__oculto" role="status">
                    Carregando indicadores...
                </p>
                {ItensIndicadores.map((item) => (
                    <div key={item.chave} className="indicadores-simulacao__esqueleto" aria-hidden="true"/>
                ))}
            </section>
        );
    }

    return(
        <section className="indicadores-simulacao" aria-label="Indicadores da simulação">
            {ItensIndicadores.map((item) => (
                <IndicadorCard
                    key={item.chave}
                    rotulo={item.rotulo}
                    valor={item.formatar(indicadores[item.chave])}
                    icone={item.icone}
                />    
            ))}
        </section>
    );
}