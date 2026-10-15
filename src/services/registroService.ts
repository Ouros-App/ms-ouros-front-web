import type { Registro, RegistroNovo } from "@/types/registros.types";
import { isAbortError, wait } from "@/utils/delay";
import { ServiceError } from "./authService";

let banco: Registro[] = [
    {id: 'r-1', idLote: '4A2C93', dataEmissao: '2026-08-01',hidrometro: 7000, custo: 6000, entraram: 6500, sairam: 500},
    {id: 'r-2', idLote: '7B1D40', dataEmissao: '2026-08-05', hidrometro: 5400, custo: 4800, entraram: 5000, sairam: 200},
    {id: 'r-3', idLote: '9C3E12', dataEmissao: '2026-08-12', hidrometro: 8200, custo: 7300, entraram: 7800, sairam: 650},
    {id: 'r-4', idLote: '2D5F77', dataEmissao: '2026-08-19', hidrometro: 6100, custo: 5500, entraram: 6000, sairam: 300},
    {id: 'r-5', idLote: '3E8A05', dataEmissao: '2026-08-26', hidrometro: 4700, custo: 4100, entraram: 4500, sairam: 100},
];

function falhar(error: unknown, mensagem: string): Error{
    if(isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export async function listarRegistro(signal?: AbortSignal): Promise<Registro[]>{
    try{
        await wait(600, signal);
        return banco.map((r)=> ({...r}));
    }
    catch (error){
        throw falhar(error, 'Não foi possível carregar ao registros.');
    }
}

export async function obterRegistro(id:string, signal?: AbortSignal): Promise<Registro | null>{
    try{
        await wait(400, signal);
        const encontrado = banco.find((r) => r.id === id);
        return encontrado ? {...encontrado}:null;
    }
    catch(error){
        throw falhar(error, 'Não foi possível carregar o registro.')
    }
}

export async function criarRegistro(dados: RegistroNovo): Promise<Registro>{
    try{
        await wait(500);
        const existe = banco.some((r) => r.idLote.toLowerCase() === dados.idLote.toLowerCase());
        if(existe) throw new ServiceError('Ja existe um registro com esse id de lote.');
        const novo: Registro={...dados, id:`r-${Date.now()}`};
        banco = [...banco, novo];
        return {...novo};
    }
    catch(error){
        throw falhar(error, 'Não foi possívelo criar o registro.');
    }
}

export async function atualizarRegistro(id: string, dados: RegistroNovo): Promise<Registro>{
    try {
        await wait(500);
        const duplicado = banco.some((r) => r.id !== id && r.idLote.toLowerCase() === dados.idLote.toLowerCase());
        if (duplicado) throw new ServiceError('Já existe um registro com esse id de lote.');
        if (!banco.some((r) => r.id === id)) throw new ServiceError('Registro não encontrado.');
        const atualizado: Registro = { ...dados, id };
        banco = banco.map((r) => (r.id === id ? atualizado : r));
        return { ...atualizado };
    }
    catch (error) {
        throw falhar(error, 'Não foi possível atualizar o registro.');
    }
}

export async function excluirRegistro(id:string): Promise<void>{
    try{
        await wait(400);
        banco = banco.filter((r)=> r.id !==id);
    }
    catch(error){
        throw falhar(error, 'Não foi possível excluir o registro.');
    }
}