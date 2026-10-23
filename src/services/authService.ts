import type { LoginValues } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { CHAVE_PERFIS } from '@/utils/chaves';
import { isAbortError, wait } from '@/utils/delay';
import { lerArmazenado } from '@/utils/storage';

export class ServiceError extends Error{
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }
}

interface UsuarioCadastrado extends User{
    password: string;
}

interface PerfilSalvo{
    id: string;
    nome: string;
    avatarUrl: string | null;
}

function aplicarPerfisSalvos(lista: UsuarioCadastrado[]): UsuarioCadastrado[]{
    const salvos = lerArmazenado<PerfilSalvo[]>(CHAVE_PERFIS);
    if (!salvos) return lista;
    return lista.map((usuario) => {
        const salvo = salvos.find((perfil) => perfil.id === usuario.id);
        return salvo ? { ...usuario, name: salvo.nome, avatarUrl: salvo.avatarUrl ?? undefined } : usuario;
    });
}

const usuarios: UsuarioCadastrado[] = aplicarPerfisSalvos([
    { id: 'u-1', name: 'Vera Marcelinha', email: 'gestor@ouros.com', password: 'ouros123', role: 'admin' },
]);

export function atualizarUsuarioCadastrado(
    id: string,
    dados: { name: string; avatarUrl?: string; password?: string },
): void{
    const usuario = usuarios.find((u) => u.id === id);

    if (!usuario) throw new ServiceError('Usuário não encontrado.');
    usuario.name = dados.name;
    usuario.avatarUrl = dados.avatarUrl;
    if (dados.password) usuario.password = dados.password;
}

function toServiceError(error: unknown, fallback: string): Error{
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(fallback);
}

export async function entrar(values: LoginValues, signal?: AbortSignal): Promise<User>{
    try {
        await wait(800, signal);

        const email = values.email.trim().toLowerCase();
        const encontrado = usuarios.find((u) => u.email === email && u.password === values.password);

        if (!encontrado){
            throw new ServiceError('E-mail ou senha incorretos.');
        }
    
        return{
            id: encontrado.id,
            name: encontrado.name,
            email: encontrado.email,
            role: encontrado.role,
            avatarUrl: encontrado.avatarUrl,
        };
    } 
    catch (error){
        throw toServiceError(error, 'Não foi possível entrar. Tente novamente.');
    }
}

export async function entrarComGoogle(signal?: AbortSignal): Promise<User>{
    try{
        await wait(500, signal);
        throw new ServiceError('O login com Google ainda não está disponível. Use seu e-mail e senha.');
    } 
    catch (error){
        throw toServiceError(error, 'Não foi possível entrar com o Google.');
    }
}