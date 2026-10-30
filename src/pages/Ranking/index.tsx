import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { RankingCard } from '@/components/complex/RankingCard';
import { RankingInfo } from '@/components/complex/RankingInfo';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { Sidebar } from '@/components/complex/Sidebar';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { useRanking } from '@/hooks/useRanking';
import { asaFundo } from '../Registros/RegistrosAssets';
import './Ranking.css';

export default function RankingPage(){
    const { empresaSelecionada } = useAdminEnterprise();
    const ranking = useRanking(empresaSelecionada);
    
    return(
        <div className="ranking-page">
            <a href="#conteudo-principal" className="ranking-page__pular">
                Pular para o conteúdo
            </a>
            <Sidebar />
            
            <div className="ranking-page__coluna">
                {asaFundo && <img src={asaFundo} alt="" className="ranking-page__fundo" />}
                
                <header className="ranking-page__topo">
                    <h1 className="ranking-page__titulo">Ranking</h1>
                    <div className="ranking-page__acoes-topo">
                        <SeletorEmpresaAdm />
                        <PerfilUsuario />
                    </div>
                </header>
                
                <main id="conteudo-principal" className="ranking-page__conteudo" tabIndex={-1}>
                    <RankingCard
                    participantes={ranking.participantes}
                    status={ranking.status}
                    mensagemErro={ranking.mensagemErro}
                    busca={ranking.busca}
                    ordenacao={ranking.ordenacao}
                    onBuscar={ranking.setBusca}
                    onOrdenar={ranking.setOrdenacao}
                    onSalvar={ranking.salvar}
                    onExcluir={ranking.excluir}
                    onRecarregar={ranking.recarregar}
                    pagination={ranking.pagination}
                    />
                    
                    <RankingInfo />
                </main>
            </div>
        </div>
    );
}
