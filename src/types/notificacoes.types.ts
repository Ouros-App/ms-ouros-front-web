export interface Notificacao {
    id: number;
    titulo: string;
    mensagem: string;
    tipo: string;
    lida: boolean;
    criadaEm: string;
}

export type NotificacoesStatus = 'idle' | 'carregando' | 'pronto' | 'erro';
