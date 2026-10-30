import { IndicadoresSimulacao } from '@/components/complex/IndicadoresSimulacao';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { Sidebar } from '@/components/complex/Sidebar';
import { SimulacoesCard } from '@/components/complex/SimulacaoCard';
import { useIndicadoresSimulacao } from '@/hooks/useIndicadoresSimulacao';
import { useSimulacoes } from '@/hooks/useSimulacoes';
import { asaFundo } from '../Registros/RegistrosAssets';
import './Simulacao.css';

export default function SimulacaoPage(){
    const indicadores = useIndicadoresSimulacao();
    const simulacoes = useSimulacoes();
    
    return (
    <div className="simulacao-page">
        <a href="#conteudo-principal" className="simulacao-page__pular">
            Pular para o conteúdo
        </a>
        
        <Sidebar />
        
        <div className="simulacao-page__coluna">
            {asaFundo && <img src={asaFundo} alt="" className="simulacao-page__fundo" />}
            
            <header className="simulacao-page__topo">
                <h1 className="simulacao-page__titulo">Simulação</h1>
                
                <PerfilUsuario />
            </header>
            
            <main id="conteudo-principal" className="simulacao-page__conteudo" tabIndex={-1}>
                <IndicadoresSimulacao
                indicadores={indicadores.indicadores}
                status={indicadores.status}
                mensagemErro={indicadores.mensagemErro}
                onRecarregar={indicadores.recarregar}
                />

                <SimulacoesCard
                simulacoes={simulacoes.simulacoes}
                status={simulacoes.status}
                mensagemErro={simulacoes.mensagemErro}
                busca={simulacoes.busca}
                ordenacao={simulacoes.ordenacao}
                onBuscar={simulacoes.setBusca}
                onOrdenar={simulacoes.setOrdenacao}
                onSalvar={simulacoes.salvar}
                onExcluir={simulacoes.excluir}
                onRecarregar={simulacoes.recarregar}
                />
            </main>
        </div>
    </div>
);
}