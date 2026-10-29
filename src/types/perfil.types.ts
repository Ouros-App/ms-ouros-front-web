export interface Perfil{
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    avatarUrl: string | null;
    idEnterprise?: number | null;
}

export interface PerfilAtualizacao{
    nome: string;
    telefone: string;
    novaSenha: string;
    avatarUrl: string | null;
}

export type PerfilDadosFormulario = Omit<PerfilAtualizacao, 'avatarUrl'>;
export type PerfilStatus = 'carregando' | 'pronto' | 'erro';

export interface PerfilValores{
    nome: string;
    telefone: string;
    senha: string;
}

export type PerfilErros = Partial<Record<keyof PerfilValores, string>>;

export interface CampoPerfilProps{
    id: string;
    rotulo: string;
    value: string;
    onChange?: (valor: string) => void;
    tipo?: 'text' | 'password' | 'email' | 'tel';
    erro?: string;
    ajuda?: string;
    placeholder?: string;
    somenteLeitura?: boolean;
    desabilitado?: boolean;
    autoComplete?: string;
    inputMode?: 'text' | 'tel' | 'numeric' | 'email';
    maxLength?: number;
    acao?: React.ReactNode;
}

export interface PerfilFotoProps{
    nome: string;
    foto: string | null;
    erro: string;
    processando: boolean;
    onEscolher: (arquivo: File) => void;
    onRemover: () => void;
}

export interface PerfilFormProps{
    perfil: Perfil;
    onSalvar: (dados: PerfilDadosFormulario) => Promise<void>;
    onSair: () => void;
}