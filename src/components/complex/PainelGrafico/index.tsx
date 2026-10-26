import { useId } from 'react';
import type { PainelGraficoProps } from '@/types/dashboard.types';
import './PainelGrafico.css';

export function PainelGrafico({ titulo, status, mensagemErro, onRecarregar, children }: PainelGraficoProps){
    const tituloId = useId();
    return(
        <section className="painel-grafico" aria-labelledby={tituloId} aria-busy={status === 'carregando'}>
            <h2 id={tituloId} className="painel-grafico__titulo">
                {titulo}
            </h2>
            
            <div className="painel-grafico__area">
                {status === 'aguardando' && (
                    <p className="painel-grafico__aviso">O gráfico será carregado do Databricks.</p>
                )}
                
                {status === 'carregando' && (
                    <p className="painel-grafico__aviso" role="status">
                        Carregando gráfico...
                    </p>
                )}
                
                {status === 'erro' && (
                    <div className="painel-grafico__erro" role="alert">
                        <p>{mensagemErro}</p>
                        <button type="button" className="painel-grafico__botao" onClick={onRecarregar}>
                            Tentar novamente
                        </button>
                    </div>
                )}
                {status === 'pronto' && children}
            </div>
        </section>
    );
}