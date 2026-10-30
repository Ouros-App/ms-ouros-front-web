import type { MetaEdicao, MetaEstadual, ResumoMetas } from '@/types/metas.types';
import { caminhoResumoMetas } from '@/utils/metasApi';
import { estadosBrasil } from '@/utils/metas';
import { isAbortError, wait } from '@/utils/delay';
import { apiClient } from './apiClient';
import { ServiceError } from './authService';
import { listarMetasEstaduais } from './tarefasService';

let banco: MetaEstadual[] = [
    { id: 'm-1', estado: 'MG', meta: 'Vacinação', totalGranjas: 300, concluidos: 300 },
    { id: 'm-2', estado: 'SP', meta: 'Vacinação', totalGranjas: 450, concluidos: 450 },
    { id: 'm-3', estado: 'PR', meta: 'Vacinação', totalGranjas: 280, concluidos: 280 },
    { id: 'm-4', estado: 'RS', meta: 'Vacinação', totalGranjas: 260, concluidos: 156 },
    { id: 'm-5', estado: 'SC', meta: 'Vacinação', totalGranjas: 220, concluidos: 132 },
    { id: 'm-6', estado: 'GO', meta: 'Vacinação', totalGranjas: 180, concluidos: 108 },
];

function falhar(error: unknown, mensagem: string): Error {
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    
    return new ServiceError(mensagem);
}

function resumoValido(dados: unknown): dados is ResumoMetas {
    if (typeof dados !== 'object' || dados === null) return false;
    const { percentual, concluidas, total } = dados as Partial<ResumoMetas>;
    
    return typeof percentual === 'number' && typeof concluidas === 'number' && typeof total === 'number';
}

export async function listarMetas(signal?: AbortSignal): Promise<MetaEstadual[]> {
    try {
        try {
            const apiMetas = await listarMetasEstaduais(signal);
            if (apiMetas && apiMetas.length > 0) {
                return apiMetas.map((m) => ({
                    id: String(m.id),
                    estado: m.regiao || 'SP',
                    meta: m.titulo,
                    totalGranjas: m.valorAlvo > 0 ? m.valorAlvo : 100,
                    concluidos: m.status === 'CONCLUIDA' ? (m.valorAlvo || 100) : Math.round((m.valorAlvo || 100) * 0.7),
                }));
            }
        } catch {
            // Em caso de falha de conexão, utiliza os dados de fallback
        }

        await wait(200, signal);
        return banco.map((m) => ({ ...m }));
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível carregar as metas.');
    }
}

export async function lancarMetaEstadual(titulo: string): Promise<MetaEstadual[]> {
    try {
        await wait(300);
        const existe = banco.some((m) => m.meta.toLowerCase() === titulo.toLowerCase());
        if (existe) throw new ServiceError('Essa meta já foi lançada para os estados.');
        
        const agora = Date.now();
        const criadas: MetaEstadual[] = estadosBrasil.map((estado) => ({
            id: `m-${agora}-${estado.uf}`,
            estado: estado.uf,
            meta: titulo,
            totalGranjas: estado.granjas,
            concluidos: 0,
        }));
        
        banco = [...banco, ...criadas];
        return criadas.map((m) => ({ ...m }));
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível lançar a meta.');
    }
}

export async function atualizarMeta(id: string, dados: MetaEdicao): Promise<MetaEstadual> {
    try {
        await wait(200);
        const atual = banco.find((m) => m.id === id);
        if (!atual) throw new ServiceError('Meta não encontrada.');
            
        const atualizada: MetaEstadual = { ...atual, ...dados };
        banco = banco.map((m) => (m.id === id ? atualizada : m));
        return { ...atualizada };
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível atualizar a meta.');
    }
}
    
export async function excluirMeta(id: string): Promise<void> {
    try {
        await wait(200);
        banco = banco.filter((m) => m.id !== id);
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível excluir a meta.');
    }
}

export async function obterResumoMetas(signal?: AbortSignal): Promise<ResumoMetas> {
    try {
        const resposta = await apiClient<unknown>(caminhoResumoMetas, { signal });
        if (!resumoValido(resposta.data)) {
            throw new ServiceError('Resposta inválida do servidor.');
        }
            
        return resposta.data;
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível carregar o resumo das metas.');
    }
}
