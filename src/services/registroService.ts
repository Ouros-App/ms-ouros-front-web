import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { Registro, RegistroNovo } from "@/types/registros.types";
import { isAbortError } from "@/utils/delay";
import { ServiceError } from "./authService";
import { springRequest } from "./springClient";

interface ProductionSummary {
    id: number;
    id_lote: string;
    data_emissao: string;
    hidrometro: number | null;
    custo: number | null;
    entraram: number | null;
    sairam: number | null;
    galinhas_atuais: number | null;
    id_farm: number | null;
    farm_name: string | null;
}

interface LotResponse {
    id: number;
}

function paraRegistro(dto: ProductionSummary): Registro {
    return {
        id: String(dto.id),
        idLote: dto.id_lote,
        dataEmissao: dto.data_emissao,
        hidrometro: dto.hidrometro ?? 0,
        custo: dto.custo ?? 0,
        entraram: dto.entraram ?? 0,
        sairam: dto.sairam ?? 0,
        idFarm: dto.id_farm ?? undefined,
        farmName: dto.farm_name ?? undefined,
    };
}

function falhar(error: unknown, mensagem: string): Error{
    if(isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

/** Filtro opcional por empresa (visão global do admin) ou granja. */
export interface FiltroRegistros {
    idEnterprise?: number | null;
    idFarm?: number | null;
}

async function buscarResumos(filtro: FiltroRegistros | undefined, signal?: AbortSignal): Promise<Registro[]> {
    const lista = await springRequest<ProductionSummary[]>(
        '/lots/production-summaries',
        { query: { id_enterprise: filtro?.idEnterprise, id_farm: filtro?.idFarm }, signal },
        'Não foi possível carregar os registros.',
    );
    return (lista ?? []).map(paraRegistro);
}

export async function listarRegistro(signal?: AbortSignal, filtro?: FiltroRegistros): Promise<Registro[]>{
    try{
        return await buscarResumos(filtro, signal);
    }
    catch (error){
        throw falhar(error, 'Não foi possível carregar os registros.');
    }
}

export async function obterRegistro(id: string, signal?: AbortSignal, filtro?: FiltroRegistros): Promise<Registro | null> {
    try {
        try {
            const resumo = await springRequest<ProductionSummary | ProductionSummary[]>(
                `/lots/production-summaries/${encodeURIComponent(id)}`,
                { signal },
                'Não foi possível carregar o registro.',
            );
            if (resumo) {
                if (Array.isArray(resumo)) {
                    const encontrado = resumo.find((r) => String(r.id) === id);
                    if (encontrado) return paraRegistro(encontrado);
                } else if (resumo.id !== undefined && String(resumo.id) === id) {
                    return paraRegistro(resumo);
                }
            }
        } catch {
            // Segue para fallback com busca na lista consolidada
        }

        const todos = await buscarResumos(filtro, signal);
        return todos.find((r) => r.id === id) ?? null;
    }
    catch (error) {
        throw falhar(error, 'Não foi possível carregar o registro.');
    }
}

/**
 * Cria o lote inicial da empresa integradora.
 * A leitura de hidrômetro inicial é opcional; a fazenda alimenta posteriormente no ciclo.
 */
export async function criarRegistro(dados: RegistroNovo, _filtro?: FiltroRegistros): Promise<Registro> {
    try {
        const idFarm = dados.idFarm;
        if (!idFarm) throw new ServiceError("Selecione a granja do lote.");

        const body: Record<string, unknown> = {
            received_chickens: dados.entraram,
            delivered_chickens: dados.sairam ?? 0,
            delivery_date: dados.dataEmissao,
            cost: dados.custo,
            id_farm: idFarm,
        };

        if (dados.hidrometro && dados.hidrometro > 0) {
            body.hydrometer_reading = dados.hidrometro;
        }

        if (_filtro?.idEnterprise && _filtro.idEnterprise > 0) {
            body.id_enterprise = _filtro.idEnterprise;
        }

        const lote = await springRequest<LotResponse>(
            '/lots/aggregated',
            {
                method: 'POST',
                body,
            },
            "Não foi possível criar o registro.",
        );
        return { ...dados, id: String(lote.id), idLote: `L-${lote.id}`, idFarm };
    }
    catch (error) {
        throw falhar(error, "Não foi possível criar o registro.");
    }
}

export async function atualizarRegistro(id: string, dados: RegistroNovo, _filtro?: FiltroRegistros): Promise<Registro>{
    try {
        const atual = await springRequest<{ losts: number }>(`/lots/${encodeURIComponent(id)}`);
        const perdas = Number(atual.losts ?? 0);
        if (dados.sairam < perdas) throw new ServiceError('As saídas não podem ser inferiores às perdas já registradas.');
        await springRequest<LotResponse>(
            `/lots/${encodeURIComponent(id)}`,
            {
                method: 'PATCH',
                body: {
                    received_chickens: dados.entraram,
                    delivered_chickens: dados.sairam - perdas,
                    delivery_date: dados.dataEmissao,
                    cost: dados.custo,
                },
            },
            'Não foi possível atualizar o registro.',
        );
        return { ...dados, id };
    }
    catch (error) {
        throw falhar(error, 'Não foi possível atualizar o registro.');
    }
}

export async function excluirRegistro(id:string): Promise<void>{
    try{
        await springRequest<void>(`/lots/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Não foi possível excluir o registro.');
    }
    catch(error){
        throw falhar(error, 'Não foi possível excluir o registro.');
    }
}

export async function listarRegistrosPaginados(query: PageQuery, signal?: AbortSignal, filtro?: FiltroRegistros): Promise<PageResponse<Registro>> {
    const data = await springRequest<PageResponse<ProductionSummary>>('/lots/production-summaries/paged', { query: { ...query, sort: ({ hidrometro: 'hidrometro', custo: 'custo', entraram: 'entraram', sairam: 'sairam', atuais: 'galinhas_atuais', galinhas_atuais: 'galinhas_atuais', data_emissao: 'data_emissao', id: 'id' }[query.sort ?? ''] ?? 'id'), direction: query.direction ?? 'desc', id_enterprise: filtro?.idEnterprise, id_farm: filtro?.idFarm }, signal });
    return { ...data, content: data.content.map(paraRegistro) };
}
