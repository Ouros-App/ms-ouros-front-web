export interface ErrorContent{
    titulo: string;
    descricao: string;
}

export interface ErrorPageProps{
    titulo: string;
    descricao: string;
    onTentarNovamente?: () => void;
    rotaRetorno?: string;
    rotuloRetorno?: string;
}

export interface ErrorProps{
    children: React.ReactNode;
}

export interface ErrorState{
    erro: Error | null;
}