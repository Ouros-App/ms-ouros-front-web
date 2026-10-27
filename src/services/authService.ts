import type { LoginValues, RespostaLogin } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { isAbortError, wait } from '@/utils/delay';
import { ApiRequestError, apiClient } from './apiClient';
import { entrarMock } from './authMock';
import { ServiceError } from './serviceError';

export { atualizarUsuarioCadastrado } from './authMock';
export { ServiceError } from './serviceError';

const MOCK_ATIVO = import.meta.env.DEV && import.meta.env.VITE_AUTH_MOCK === 'true';

function respostaValida(dados: unknown): dados is RespostaLogin{
    if (typeof dados !== 'object' || dados === null) return false;
    const { token, user } = dados as Partial<RespostaLogin>;
    return(
        typeof token === 'string' &&
        token.length > 0 &&
        typeof user === 'object' &&
        user !== null &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        (user.role === 'admin' || user.role === 'user')
    );
}

function traduzirErro(error: unknown): Error{
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    
    if (error instanceof ApiRequestError){
        if (error.status === 429) return new ServiceError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
        if (error.status >= 500) return new ServiceError('O servidor está indisponível. Tente novamente em instantes.');
        if (error.status >= 400) return new ServiceError('E-mail ou senha incorretos.');
    }
    
    if (error instanceof TypeError) {
        return new ServiceError('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    
    return new ServiceError('Não foi possível entrar. Tente novamente.');
}

export async function entrar(values: LoginValues, signal?: AbortSignal): Promise<User> {
    try{
        if (MOCK_ATIVO) return await entrarMock(values, signal);
        
        const resposta = await apiClient<unknown>('/auth/login',{
            method: 'POST',
            body: JSON.stringify({ email: values.email.trim().toLowerCase(), password: values.password }),
            signal,
        });
        
        if (!respostaValida(resposta.data)) {
            throw new ServiceError('Resposta inválida do servidor. Tente novamente.');
        }
        
        const { token, user } = resposta.data;
        return { ...user, token };
    } 
    catch (error){
        throw traduzirErro(error);
    }
}

export async function entrarComGoogle(signal?: AbortSignal): Promise<User> {
    try{
        await wait(500, signal);
        throw new ServiceError('O login com Google ainda não está disponível. Use seu e-mail e senha.');
    } 
    catch (error){
        throw traduzirErro(error);
    }
}