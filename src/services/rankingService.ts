import type { Participante, ParticipanteEdicao } from "@/types/ranking.types";
import { isAbortError, wait } from "@/utils/delay";
import { ServiceError } from "./serviceError";

let banco: Participante[] =[
    { id: 'p-1', nome: 'Marcelona', pontuacao: 8.65, atualizadoEm: '2026-08-25T14:32:00' },
    { id: 'p-2', nome: 'Rafael Souza', pontuacao: 8.41, atualizadoEm: '2026-08-25T14:32:00' },
    { id: 'p-3', nome: 'Camila Duarte', pontuacao: 8.1, atualizadoEm: '2026-08-24T09:15:00' },
    { id: 'p-4', nome: 'João Pedro', pontuacao: 7.88, atualizadoEm: '2026-08-24T09:15:00' },
    { id: 'p-5', nome: 'Larissa Gomes', pontuacao: 7.52, atualizadoEm: '2026-08-23T17:40:00' },
    { id: 'p-6', nome: 'Bruno Alves', pontuacao: 7.1, atualizadoEm: '2026-08-23T17:40:00' },
    { id: 'p-7', nome: 'Fernanda Lima', pontuacao: 6.74, atualizadoEm: '2026-08-22T11:05:00' },
    { id: 'p-8', nome: 'Diego Martins', pontuacao: 6.3, atualizadoEm: '2026-08-22T11:05:00' },
    { id: 'p-9', nome: 'Patrícia Rocha', pontuacao: 5.96, atualizadoEm: '2026-08-21T16:20:00' },
    { id: 'p-10', nome: 'Thiago Barros', pontuacao: 5.4, atualizadoEm: '2026-08-21T16:20:00' },
];

function agoraLocal(): string{
    const agora = new Date();
    const dois = (n: number) => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}T${dois(agora.getHours())}:${dois(agora.getMinutes())}:00`;
}

function falhar(error: unknown, mensagem: string): Error{
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export async function listarParticipantes(signal?: AbortSignal): Promise<Participante[]>{
    try{
        await wait(600, signal);
        return banco.map((p) => ({ ...p }));
    } 
    catch (error){
        throw falhar(error, 'Não foi possível carregar o ranking.');
    }
}

export async function atualizarParticipante(id: string, dados: ParticipanteEdicao): Promise<Participante> {
    try {
        await wait(500);
        if (!banco.some((p) => p.id === id)) throw new ServiceError('Participante não encontrado.');
        const atualizado: Participante = { id, ...dados, atualizadoEm: agoraLocal() };
        banco = banco.map((p) => (p.id === id ? atualizado : p));
        return { ...atualizado };
    } 
    catch (error){
        throw falhar(error, 'Não foi possível atualizar o participante.');
    }
}

export async function excluirParticipante(id: string): Promise<void>{
    try {
        await wait(400);
        banco = banco.filter((p) => p.id !== id);
    } 
    catch (error){
        throw falhar(error, 'Não foi possível excluir o participante.');
    }
}