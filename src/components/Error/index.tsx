import { Component } from 'react';
import type { ErrorProps, ErrorState } from '@/types/error.types';
import { ErrorPage } from '../complex/ErrorPage';
import { conteudoGenerico, conteudoRede } from '../complex/ErrorPage/errorContent';

export class Error extends Component<ErrorProps, ErrorState>{
    state: ErrorState = { erro: null };
    static getDerivedStateFromError(erro: NonNullable<ErrorState['erro']>): ErrorState{
    return { erro };
}
tentarNovamente = () =>{
    this.setState({ erro: null });
};

render() {
    if (!this.state.erro) return this.props.children;
    const conteudo = navigator.onLine ? conteudoGenerico : conteudoRede;
    return <ErrorPage titulo={conteudo.titulo} descricao={conteudo.descricao} onTentarNovamente={this.tentarNovamente} />;
}
}