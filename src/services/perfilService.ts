import type { Perfil, PerfilAtualizacao } from '@/types/perfil.types';
import { CHAVE_PERFIS } from '@/utils/chaves';
import { isAbortError, wait } from '@/utils/delay';
import { apenasDigitos } from '@/utils/mascaras';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';
import { atualizarUsuarioCadastrado, ServiceError } from './authService';

const perfisIniciais: Perfil[] = [
{
    id: 'u-1',
    nome: 'Vera Marcelinha',
    email: 'gestor@ouros.com',
    cpf: '123.456.789-10',
    telefone: '(11) 99925-1812',
    avatarUrl: null,
},
];

let banco: Perfil[] = lerArmazenado<Perfil[]>(CHAVE_PERFIS) ?? perfisIniciais;

function falhar(error: unknown, mensagem: string): Error {
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export async function obterPerfil(id: string, signal?: AbortSignal): Promise<Perfil | null> {
    try{
        await wait(500, signal);
        const encontrado = banco.find((p) => p.id === id);
        return encontrado ? { ...encontrado } : null;
    } 
    catch (error){
    throw falhar(error, 'Não foi possível carregar o perfil.');
    }
}

export async function atualizarPerfil(id: string, dados: PerfilAtualizacao): Promise<Perfil>{
    try {
        await wait(700);
        const atual = banco.find((p) => p.id === id);
        
        if (!atual) throw new ServiceError('Perfil não encontrado.');
        const digitos = apenasDigitos(dados.telefone);
    
        if (digitos.length < 10 || digitos.length > 11) {
            throw new ServiceError('Telefone inválido.');
        }
        if (dados.avatarUrl !== null && !dados.avatarUrl.startsWith('data:image/')) {
            throw new ServiceError('Foto inválida.');
    }
    
    const atualizado: Perfil = {
        ...atual,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        avatarUrl: dados.avatarUrl,
    };

    atualizarUsuarioCadastrado(id,{
        name: atualizado.nome,
        email: atualizado.email,
        avatarUrl: atualizado.avatarUrl ?? undefined,
        password: dados.novaSenha || undefined,
    });

    banco = banco.map((p) => (p.id === id ? atualizado : p));
    salvarArmazenado(CHAVE_PERFIS, banco);
    return { ...atualizado };
    } 
    catch (error){
    throw falhar(error, 'Não foi possível salvar o perfil.');
    }
}