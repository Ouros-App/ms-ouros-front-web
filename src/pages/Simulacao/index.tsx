import { useEffect, useState } from 'react';
import { listarGranjas, type Granja } from '@/services/farmService';
import { IndicadoresSimulacao } from '@/components/complex/IndicadoresSimulacao';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { Sidebar } from '@/components/complex/Sidebar';
import { SimulacoesCard } from '@/components/complex/SimulacaoCard';
import { useIndicadoresSimulacao } from '@/hooks/useIndicadoresSimulacao';
import { useSimulacoes } from '@/hooks/useSimulacoes';
import { asaFundo } from '../Registros/RegistrosAssets';
import './Simulacao.css';

export default function SimulacaoPage(){
    const [granjas, setGranjas] = useState<Granja[]>([]);
    const [idFarm, setIdFarm] = useState('');
    const [erroGranjas, setErroGranjas] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        listarGranjas(controller.signal).then(setGranjas).catch((error: unknown) => {
            if (!controller.signal.aborted) setErroGranjas(error instanceof Error ? error.message : 'Falha ao carregar granjas.');
        });
        return () => controller.abort();
    }, []);
    const indicadores = useIndicadoresSimulacao(idFarm ? Number(idFarm) : undefined);
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
                <div className="simulacao-page__filtro">
                    <label htmlFor="indicadores-granja" className="simulacao-page__filtro-rotulo">Granja dos indicadores</label>
                    <select id="indicadores-granja" className="simulacao-page__filtro-select" value={idFarm} onChange={(e) => setIdFarm(e.target.value)}>
                        <option value="">Selecione a granja</option>
                        {granjas.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                {erroGranjas && <p className="simulacao-page__filtro-erro" role="alert">{erroGranjas}</p>}
                </div>
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
                    pagination={simulacoes.pagination}
                />
            </main>
        </div>
    </div>
);
}