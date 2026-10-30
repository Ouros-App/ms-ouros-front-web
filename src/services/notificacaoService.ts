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
    const pagina = await springRequest<Page<NotificationResponse>>(
        '/notifications',
        { query: { page, size }, signal },
        'Não foi possível carregar as notificações.',
    );
    return (pagina?.content ?? []).map(paraNotificacao);
}

export async function marcarComoLida(id: number): Promise<Notificacao> {
    const dto = await springRequest<NotificationResponse>(
        `/notifications/${id}/read`,
        { method: 'PATCH' },
        'Não foi possível marcar a notificação como lida.',
    );
    return paraNotificacao(dto);
}
