export interface EnvioEstado {
    enviando: boolean;
    falha: string;
}

export interface PrevisaoEstado<T> {
    previsao: T | undefined;
    calculando: boolean;
    erro: string;
}