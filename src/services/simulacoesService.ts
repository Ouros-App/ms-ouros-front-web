import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { Simulacao, SimulacaoNova } from "@/types/simulacoes.types";
import { isAbortError } from "@/utils/delay";
import { ServiceError } from "./authService";
import { paraPrevisao, type SimulacaoRankingDto } from "./rankingService";
import { springRequest } from "./springClient";

interface FarmSimulationDto {
    id: number;
    id_farm: number;
    id_lot: string;
    current_cgi: number;
    target_cgi: number;
    water_price: number;
    energy_price: number;
    poultry_quantity: number;
    target_energy_kwh: number;
    simulated_ranking?: SimulacaoRankingDto | null;
}

function paraSimulacao(dto: FarmSimulationDto): Simulacao {
    return {
        id: String(dto.id),
        idLote: dto.id_lot,
        consumoAtual: dto.current_cgi,
        consumoAlvo: dto.target_cgi,
        precoAgua: dto.water_price,
        precoEnergia: dto.energy_price,
        quantidadeAves: dto.poultry_quantity,
        gastoAlvoEnergia: dto.target_energy_kwh,
        idFarm: dto.id_farm,
        previsao: paraPrevisao(dto.simulated_ranking),
    };
}

function paraCorpo(dados: SimulacaoNova) {
    return {
        id_lot: dados.idLote,
        current_cgi: dados.consumoAtual,
        target_cgi: dados.consumoAlvo,
        water_price: dados.precoAgua,
        energy_price: dados.precoEnergia,
        poultry_quantity: dados.quantidadeAves,
        target_energy_kwh: dados.gastoAlvoEnergia,
    };
}

function falhar(error: unknown, mensagem: string): Error {
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export interface FiltroSimulacoes {
    idEnterprise?: number | null;
    idFarm?: number | null;
}

export async function listarSimulacoes(signal?: AbortSignal, filtro?: FiltroSimulacoes): Promise<Simulacao[]> {
    try {
        const lista = await springRequest<FarmSimulationDto[]>(
            '/farms/simulations',
            { query: { id_farm: filtro?.idFarm, id_enterprise: filtro?.idEnterprise }, signal },
            'Não foi possível carregar as simulações.',
        );
        return (lista ?? []).map(paraSimulacao);
    } catch (error) {
        throw falhar(error, 'Não foi possível carregar as simulações.');
    }
}

export async function criarSimulacao(dados: SimulacaoNova, _filtro?: FiltroSimulacoes): Promise<Simulacao> {
    try {
        const idFarm = dados.idFarm;
        if (!idFarm) throw new ServiceError('Selecione a granja da simulação.');
        const dto = await springRequest<FarmSimulationDto>(
            '/farms/simulations',
            { method: 'POST', body: { ...paraCorpo(dados), id_farm: idFarm } },
            'Não foi possível criar a simulação.',
        );
        return paraSimulacao(dto);
    } catch (error) {
        throw falhar(error, 'Não foi possível criar a simulação.');
    }
}

export async function atualizarSimulacao(id: string, dados: SimulacaoNova): Promise<Simulacao> {
    try {
        const dto = await springRequest<FarmSimulationDto>(
            `/farms/simulations/${encodeURIComponent(id)}`,
            { method: 'PATCH', body: paraCorpo(dados) },
            'Não foi possível atualizar a simulação.',
        );
        return paraSimulacao(dto);
    } catch (error) {
        throw falhar(error, 'Não foi possível atualizar a simulação.');
    }
}

export async function excluirSimulacao(id: string): Promise<void> {
    try {
        await springRequest<void>(
            `/farms/simulations/${encodeURIComponent(id)}`,
            { method: 'DELETE' },
            'Não foi possível excluir a simulação.',
        );
    } catch (error) {
        throw falhar(error, 'Não foi possível excluir a simulação.');
    }
}

export async function listarSimulacoesPaginadas(query: PageQuery, signal?: AbortSignal, filtro?: FiltroSimulacoes): Promise<PageResponse<Simulacao>> {
    const data = await springRequest<PageResponse<FarmSimulationDto>>('/farms/simulations/paged', { query: { ...query, sort: ({ consumoAtual: 'current_cgi', current_cgi: 'current_cgi', consumoAlvo: 'target_cgi', target_cgi: 'target_cgi', precoAgua: 'water_price', water_price: 'water_price', precoEnergia: 'energy_price', energy_price: 'energy_price', quantidadeAves: 'poultry_quantity', poultry_quantity: 'poultry_quantity', gastoAlvoEnergia: 'target_energy_kwh', target_energy_kwh: 'target_energy_kwh', id_lot: 'id_lot', created_at: 'created_at', id: 'id' }[query.sort ?? ''] ?? 'id'), direction: query.direction ?? 'desc', id_enterprise: filtro?.idEnterprise, id_farm: filtro?.idFarm }, signal });
    return { ...data, content: data.content.map(paraSimulacao) };
}
