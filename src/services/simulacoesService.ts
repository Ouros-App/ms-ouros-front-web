import type { Simulacao, SimulacaoNova } from "@/types/simulacoes.types";
import { isAbortError, wait } from "@/utils/delay";
import { ServiceError } from "./authService";

let banco: Simulacao[] = [
    {id: 's-1', idLote: '4A2C93', consumoAtual: 6.07, consumoAlvo: 5.2, precoAgua: 4.8, precoEnergia: 0.92, quantidadeAves: 12000, gastoAlvoEnergia: 0.38},
    {id: 's-2', idLote: '7B1D40', consumoAtual: 6.07, consumoAlvo: 5.2, precoAgua: 4.8, precoEnergia: 0.92, quantidadeAves: 12000, gastoAlvoEnergia: 0.38},
    {id: 's-3', idLote: '9C3E12', consumoAtual: 6.07, consumoAlvo: 5.2, precoAgua: 4.8, precoEnergia: 0.92, quantidadeAves: 12000, gastoAlvoEnergia: 0.38},
    {id: 's-4', idLote: '2D5F77', consumoAtual: 6.07, consumoAlvo: 5.2, precoAgua: 4.8, precoEnergia: 0.92, quantidadeAves: 12000, gastoAlvoEnergia: 0.38},
    {id: 's-5', idLote: '3E8A05', consumoAtual: 6.07, consumoAlvo: 5.2, precoAgua: 4.8, precoEnergia: 0.92, quantidadeAves: 12000, gastoAlvoEnergia: 0.38},
];

function falhar(error: unknown, mensagem: string): Error {
    if(isAbortError(error) && error instanceof Error) return error;
    if(error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export async function listarSimulacoes(signal?: AbortSignal): Promise<Simulacao[]> {
    try {
        await wait(600, signal);
        return banco.map((s) => ({ ...s }));
    } 
    catch (error) {
        throw falhar(error, 'Não foi possível carregar as simulações.');
    }
}
export async function criarSimulacao(dados: SimulacaoNova): Promise<Simulacao> {
    try {
        await wait(500);
        const nova: Simulacao = { ...dados, id: `s-${Date.now()}` };
        banco = [...banco, nova];
        return { ...nova };
    } 
    catch (error){
        throw falhar(error, 'Não foi possível criar a simulação.');
    }
}

export async function atualizarSimulacao(id: string, dados: SimulacaoNova): Promise<Simulacao>{
    try{
        await wait(500);
        if (!banco.some((s) => s.id === id)) throw new ServiceError('Simulação não encontrada.');
        const atualizada: Simulacao = { ...dados, id };
        banco = banco.map((s) => (s.id === id ? atualizada : s));
        return { ...atualizada };
    } 
    catch (error){
        throw falhar(error, 'Não foi possível atualizar a simulação.');
    }
}

export async function excluirSimulacao(id: string): Promise<void>{
    try{
        await wait(400);
        banco = banco.filter((s) => s.id !== id);
    }
    catch(error){
        throw falhar(error, 'Não foi possível excluir a simulação');
    }
}