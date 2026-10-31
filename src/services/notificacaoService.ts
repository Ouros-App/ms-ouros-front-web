import type { Notificacao } from '@/types/notificacoes.types';
import { springRequest } from './springClient';

interface NotificationResponse {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

interface Page<T> {
    content: T[];
    totalPages?: number;
    last?: boolean;
}

function paraNotificacao(dto: NotificationResponse): Notificacao {
    return {
        id: dto.id,
        titulo: dto.title,
        mensagem: dto.message,
        tipo: dto.type,
        lida: dto.is_read,
        criadaEm: dto.created_at,
    };
}

export async function contarNaoLidas(signal?: AbortSignal): Promise<number> {
    const dto = await springRequest<{ unread_count: number }>(
        '/notifications/unread-count',
        { signal },
        'Não foi possível carregar as notificações.',
    );
    return dto?.unread_count ?? 0;
}

export async function listarNotificacoes(signal?: AbortSignal, size = 50, page = 0): Promise<Notificacao[]> {
    const notificacoes: Notificacao[] = [];
    let paginaAtual = page;
    while (true) {
        const pagina = await springRequest<Page<NotificationResponse>>(
            '/notifications',
            { query: { page: paginaAtual, size }, signal },
            'Não foi possível carregar as notificações.',
        );
        const itens = pagina?.content ?? [];
        notificacoes.push(...itens.map(paraNotificacao));
        paginaAtual++;
        if (itens.length === 0 || pagina?.last === true) break;
        if (pagina?.totalPages !== undefined) {
            if (paginaAtual >= pagina.totalPages) break;
        } else if (pagina?.last === undefined && itens.length < size) {
            break;
        }
    }
    return notificacoes;
}

export async function marcarComoLida(id: number): Promise<Notificacao> {
    const dto = await springRequest<NotificationResponse>(
        `/notifications/${id}/read`,
        { method: 'PATCH' },
        'Não foi possível marcar a notificação como lida.',
    );
    return paraNotificacao(dto);
}

export async function marcarTodasComoLidas(): Promise<void> {
    await springRequest<void>('/notifications/read-all', { method: 'PATCH' });
}
