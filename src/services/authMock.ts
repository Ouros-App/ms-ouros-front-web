import type { LoginValues } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { CHAVE_PERFIS } from '@/utils/chaves';
import { wait } from '@/utils/delay';
import { lerArmazenado } from '@/utils/storage';
import { ServiceError } from './serviceError';

interface UsuarioCadastrado extends User {
    password: string;
}

interface PerfilSalvo {
    id: string;
    nome: string;
    avatarUrl: string | null;
}

function aplicarPerfisSalvos(lista: UsuarioCadastrado[]): UsuarioCadastrado[] {
    const salvos = lerArmazenado<PerfilSalvo[]>(CHAVE_PERFIS);
    if (!salvos) return lista;
    return lista.map((usuario) =>{
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

export async function entrarMock(values: LoginValues, signal?: AbortSignal): Promise<User> {
    await wait(800, signal);
    
    const email = values.email.trim().toLowerCase();
    const encontrado = usuarios.find((u) => u.email === email && u.password === values.password);
    if (!encontrado) throw new ServiceError('E-mail ou senha incorretos.');
    
    return{
        id: encontrado.id,
        name: encontrado.name,
        email: encontrado.email,
        role: encontrado.role,
        avatarUrl: encontrado.avatarUrl,
    };
}