import type { LoginValues } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { isAbortError, wait } from '@/utils/delay';

export class ServiceError extends Error {
    constructor(message:string){
        super(message);
        this.name = 'ServiceError';
    }
}

interface UsuarioCdastrado extends User{
    password: string;
}

const usuarios: UsuarioCdastrado[] = [
    { id: 'u-1', name: 'Vera Marcelina', email: 'gestor@ouros.com', password: 'ouros123', role: 'admin' },
];

function toServiceError(error: unknown, fallback:string): Error{
    if(isAbortError(error) && error instanceof Error) return error;

    if(error instanceof ServiceError) return error;
    
    return new ServiceError(fallback);
}

export async function entrar(values: LoginValues, signal?: AbortSignal): Promise<User> {
    try {
        await wait(800, signal);
        
        const email = values.email.trim().toLowerCase();
        const encontrado = usuarios.find((u) => u.email === email && u.password === values.password);

        if(!encontrado){
            throw new ServiceError('E-mail ou senha inválidos');
        }

        return{
            id: encontrado.id,
            name: encontrado.name,
            email: encontrado.email,
            role: encontrado.role,
        };
    }
    catch(error){
        throw toServiceError(error, 'N~~ao foi possível entrar. Tente novamente!');
    }
}
