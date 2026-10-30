import { MetasCard } from '@/components/complex/MetasCard';
import { MetasResumo } from '@/components/complex/MetasReumo';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { Sidebar } from '@/components/complex/Sidebar';
import { useMetas } from '@/hooks/useMetas';
import { useResumoMetas } from '@/hooks/useResumoMetas';
import { asaFundo } from '../Registros/RegistrosAssets';
import './Metas.css';

export default function MetasPage(){
    const metas = useMetas();
    const resumo = useResumoMetas(metas.todas, metas.status);

    return(
        <div className="metas-page">
            <a href="#conteudo-principal" className="metas-page__pular">
                Pular para o conteúdo
            </a>
            
            <Sidebar />

            <div className="metas-page__coluna">
                {asaFundo && <img src={asaFundo} alt="" className="metas-page__fundo" />}

                <header className="metas-page__topo">
                    <h1 className="metas-page__titulo">Metas</h1>

                    <div className="metas-page__acoes-topo">
                        <SeletorEmpresaAdm />
                        <PerfilUsuario />
                    </div>
                </header>

                <main id="conteudo-principal" className="metas-page__conteudo" tabIndex={-1}>
                    <MetasResumo
                    resumo={resumo.resumo}
                    status={resumo.status}
                    mensagemErro={resumo.mensagemErro}
                    onRecarregar={resumo.recarregar}
                    onLancar={metas.lancar}
                    />

                    <MetasCard
                    metas={metas.metas}
                    status={metas.status}
                    mensagemErro={metas.mensagemErro}
                    busca={metas.busca}
                    onBuscar={metas.setBusca}
                    onSalvar={metas.salvar}
                    onExcluir={metas.excluir}
                    onRecarregar={metas.recarregar}
                    />
                </main>
            </div>
        </div>
    );
}
