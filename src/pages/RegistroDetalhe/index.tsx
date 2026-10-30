import { Link, useParams } from "react-router-dom";
import { ErrorPage } from "@/components/complex/ErrorPage";
import { Sidebar } from "@/components/complex/Sidebar";
import { useRegistro } from "@/hooks/useRegistro";
import { formatarData, formatarMoeda, formatarNumero } from "@/utils/formato";
import { galinhasAtuais } from "@/utils/registros";
import './RegistroDetalhe.css'

export default function RegistroDetalhePage(){
    const {id} = useParams<{id:string}>();
    const {registro, status, mensagemErro} = useRegistro(id);

    if(status === 'pronto' && !registro){
        return(
            <ErrorPage
            titulo="Registro não encontrado"
            descricao="Esse lote não existe ou foi excluído. Volte para a lista de registro e tente novamente"
            />
        );
    }

    const dados = registro?[
        {rotulo: 'Id do lote', valor: registro.idLote},
        {rotulo: 'Data de emissão', valor: formatarData(registro.dataEmissao)},
        {rotulo: 'Hidrômetro (m3)', valor: formatarNumero(registro.hidrometro)},
        {rotulo: 'Custo do lote', valor: formatarMoeda(registro.custo)},
        {rotulo: 'Galinhas que entraram', valor: formatarNumero(registro.entraram)},
        {rotulo: 'Galinhas que sairam', valor: formatarNumero(registro.sairam)},
        {rotulo: 'Galinhas atuais', valor: formatarNumero(galinhasAtuais(registro))},
    ] : [];

    return(
        <div className="registro-detalhe">
            <Sidebar/>

            <main className="registro-detalhe__conteudo">
                <Link to="/registros" className="registro-detalhe__voltar">
                    <span aria-hidden="true">←</span> Voltar para registros
                </Link>

                <h1 className="registro-detalhe__titulo">{registro ? `Lote ${registro.idLote}` : 'Detalhe do lote'} </h1>

                {status === 'carregando' && (
                    <p className="registro-detalhe__estado" role="status">Carregando registro...</p>
                )}

                {status === 'erro' &&(
                    <p className="reregistro-detalhe__estado" role="alert">{mensagemErro}</p>
                )}

                {status === 'pronto' && registro && (
                    <dl className="registro-detalher__cartao">
                        {dados.map((item)=>(
                            <div key={item.rotulo} className="registro-detalher__linha">
                                <dt>{item.rotulo}</dt>
                                <dt>{item.valor}</dt>
                            </div>
                        ))}
                    </dl>
                )}
            </main>
        </div>
    );
}