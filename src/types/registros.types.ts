export interface Registro{
    id: string;
    idLote: string;
    dataEmissao: string;
    hidrometro: number;
    custo: number;
    entraram: number;
    sairam: number;
    idFarm?: number;
    farmName?: string;
}

export type RegistroNovo = Omit<Registro, 'id'>;
export type CampoOrdenacao = 'padrao' | 'hidrometro' | 'custo' | 'entraram' | 'sairam' | 'atuais';
export type RegistrosStatus = 'carregando' | 'pronto' | 'erro';
export type RegistroErrors = Partial<Record<keyof RegistroValores, string>>;

export interface RegistroValores{
    idLote: string;
    dataEmissao: string;
    hidrometro: string;
    custo: string;
    entraram: string;
    sairam: string;
}

export type RegistrosCardProps ={
    registros: Registro[]
    status: RegistrosStatus
    mensagemErro: string
    busca: string
    ordenacao: CampoOrdenacao
    onBuscar: (valor: string) => void
    onOrdenar: (campo: CampoOrdenacao) => void
    onSalvar: (valores: RegistroNovo, id?: string) => Promise<void>
    onExcluir: (id: string) => Promise<void>
    onRecarregar: () => void
}

export interface RegistroModalProps{
    registro: Registro | null;
    onFechar: () => void;
    onSalvar: (dados: RegistroNovo, id?: string) => Promise<void>;
}

export interface ConfirmarExclusaoProps{
    registro: Registro;
    onFechar: () => void;
    onExcluir: (id: string) => Promise<void>;
}

export interface DialogoProps{
    titulo: string;
    onFechar: () => void;
    children: React.ReactNode;
}

export interface RegistrosTabelaProps{
    registros: Registro[];
    onEditar: (registro: Registro) => void;
    onExcluir: (registro: Registro) => void
}