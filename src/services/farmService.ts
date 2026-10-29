import { springRequest } from './springClient';

export interface Granja {
    id: number;
    nome: string;
    regiao: string | null;
    idEnterprise: number | null;
}

interface FarmResponse {
    id: number;
    name: string;
    region: string | null;
    id_enterprise: number | null;
}

/** Granjas visíveis ao usuário (GET /farms). Para admin, restrinja por empresa no cliente quando houver contexto. */
export async function listarGranjas(signal?: AbortSignal): Promise<Granja[]> {
    const lista = await springRequest<FarmResponse[]>('/farms', { signal }, 'Não foi possível carregar as granjas.');
    return (lista ?? []).map((f) => ({
        id: f.id,
        nome: f.name,
        regiao: f.region,
        idEnterprise: f.id_enterprise,
    }));
}
