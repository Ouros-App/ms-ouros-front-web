import { GraficoProgresso } from '@/components/complex/GraficoProgresso';
import { NovaMetaForm } from '@/components/complex/NovaMetaForm';
import type { MetasResumoProps } from '@/types/metas.types';
import './MetasResumo.css';

export function MetasResumo({ resumo, status, mensagemErro, onRecarregar, onLancar }: MetasResumoProps){
    const progresso = resumo && resumo.total > 0 ? Math.round((resumo.concluidas / resumo.total) * 100) : 0;
    return(
        <section className="metas-resumo" aria-label="Resumo das metas">
            <div className="metas-resumo__progresso">
            {status === 'carregando' && (
                    <p className="metas-resumo__estado" role="status">
                        Carregando resumo...
                    </p>
            )}

            {status === 'erro' &&(
                <div className="metas-resumo__estado" role="alert">
                    <p>{mensagemErro || 'Não foi possível carregar o resumo das metas.'}</p>
                    <button type="button" className="metas-resumo__botao" onClick={onRecarregar}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {status === 'pronto' && resumo &&(
            <>
            <GraficoProgresso percentual={resumo.percentual} />

            <div className="metas-resumo__contagem">
                <p className="metas-resumo__numeros">
                    {resumo.concluidas} de {resumo.total}
                </p>
                <p className="metas-resumo__legenda">metas completadas</p>
                <div className="metas-resumo__barra" role="progressbar" aria-label="Metas completadas" aria-valuemin={0} aria-valuemax={resumo.total} aria-valuenow={resumo.concluidas}>
                    <div className="metas-resumo__barra-preenchida" style={{ width: `${progresso}%` }} />
                </div>
            </div>
            </>
        )}
        </div>

        <div className="metas-resumo__divisor" aria-hidden="true" />
        <div className="metas-resumo__formulario">
            <NovaMetaForm onLancar={onLancar} />
        </div>
    </section>
    );
}
