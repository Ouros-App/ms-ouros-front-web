import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { RegistroCard } from '@/components/complex/RegistroCard';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { Sidebar } from '@/components/complex/Sidebar';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { useRegistros } from '@/hooks/useRegistros';
import { asaFundo } from './RegistrosAssets';
import './Registros.css';

export default function RegistrosPage() {
    const { empresaSelecionada } = useAdminEnterprise();
    const registros = useRegistros(empresaSelecionada);
    
    return (
    <div className="registros-page">
        <a href="#conteudo-principal" className="registros-page__pular"> Pular para o conteúdo </a>
        
        <Sidebar />
        
        <div className="registros-page__coluna">
            {asaFundo && <img src={asaFundo} alt="" className="registros-page__fundo" />}
            
            <header className="registros-page__topo">
                <h1 className="registros-page__titulo">Registros</h1>
                
                <div className="registros-page__acoes-topo">
                    <SeletorEmpresaAdm />
                    <PerfilUsuario />
                </div>
            </header>
            
            <main id="conteudo-principal" className="registros-page__conteudo" tabIndex={-1}>
                <RegistroCard
                registros={registros.registros}
                status={registros.status}
                mensagemErro={registros.mensagemErro}
                busca={registros.busca}
                ordenacao={registros.ordenacao}
                onBuscar={registros.setBusca}
                onOrdenar={registros.setOrdenacao}
                onSalvar={registros.salvar}
                onExcluir={registros.excluir}
                onRecarregar={registros.recarregar}
                    pagination={registros.pagination}
                />
            </main>
        </div>
    </div>
);
}