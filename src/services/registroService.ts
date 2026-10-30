import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { Registro, RegistroNovo } from "@/types/registros.types";
import { isAbortError } from "@/utils/delay";
import { ServiceError } from "./authService";
import { listarGranjas } from "./farmService";
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

export async function obterRegistro(id:string, signal?: AbortSignal, filtro?: FiltroRegistros): Promise<Registro | null>{
    try{
        const todos = await buscarResumos(filtro, signal);
        return todos.find((r) => r.id === id) ?? null;
    }
    catch(error){
        throw falhar(error, 'Não foi possível carregar o registro.')
    }
}

/**
 * O backend persiste: aves recebidas (entraram), entregues (sairam), data de entrega, custo e granja.
 * O código do lote é gerado pelo servidor e o hidrômetro vem de leituras próprias (não editável via /lots).
 */
export async function criarRegistro(dados: RegistroNovo, filtro?: FiltroRegistros): Promise<Registro>{
    try{
        let idFarm = dados.idFarm;
        if(!idFarm){
            const granjas = await listarGranjas();
            const doContexto = filtro?.idEnterprise ? granjas.filter((g) => g.idEnterprise === filtro.idEnterprise) : granjas;
            idFarm = doContexto[0]?.id;
        }
        if(!idFarm) throw new ServiceError('Nenhuma granja disponível para vincular o lote.');

        const lote = await springRequest<LotResponse>(
            '/lots',
            {
                method: 'POST',
                body: {
                    received_chickens: dados.entraram,
                    delivered_chickens: dados.sairam,
                    delivery_date: dados.dataEmissao,
                    cost: dados.custo,
                    id_farm: idFarm,
                    id_enterprise: filtro?.idEnterprise ?? undefined,
                },
            },
            'Não foi possível criar o registro.',
        );
        const criado = (await buscarResumos(filtro)).find((r) => r.id === String(lote.id));
        return criado ?? { ...dados, id: String(lote.id), idFarm };
    }
    catch(error){
        throw falhar(error, 'Não foi possível criar o registro.');
    }
}

export async function atualizarRegistro(id: string, dados: RegistroNovo, filtro?: FiltroRegistros): Promise<Registro>{
    try {
        await springRequest<LotResponse>(
            `/lots/${encodeURIComponent(id)}`,
            {
                method: 'PATCH',
                body: {
                    received_chickens: dados.entraram,
                    delivered_chickens: dados.sairam,
                    delivery_date: dados.dataEmissao,
                    cost: dados.custo,
                },
            },
            'Não foi possível atualizar o registro.',
        );
        const atualizado = (await buscarResumos(filtro)).find((r) => r.id === id);
        return atualizado ?? { ...dados, id };
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
    const data = await springRequest<PageResponse<ProductionSummary>>('/lots/production-summaries/paged', { query: { ...query, sort: ({ hidrometro: 'hidrometro', custo: 'custo', entraram: 'entraram', sairam: 'sairam', atuais: 'galinhas_atuais' }[query.sort ?? ''] ?? 'id'), direction: query.direction ?? 'desc', id_enterprise: filtro?.idEnterprise, id_farm: filtro?.idFarm }, signal });
    return { ...data, content: data.content.map(paraRegistro) };
}
