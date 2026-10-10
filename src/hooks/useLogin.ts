import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { entrar} from '@/services/authService';
import type { LoginStatus, LoginValues } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { isAbortError } from '@/utils/delay';

export function useLogin() {
    const { login } = useAuth();
    const [status, setStatus] = useState<LoginStatus>('idle');
    const [message, setMessage] = useState('');
    const controllerRef = useRef<AbortController | null>(null);
    const timerRef = useRef<number | undefined>(undefined);

    useEffect(
        () => () => {
        controllerRef.current?.abort();
        window.clearTimeout(timerRef.current);
    },
    [],
);

const run = useCallback(
    async (request: (signal: AbortSignal) => Promise<User>) => {
        controllerRef.current?.abort();
        window.clearTimeout(timerRef.current);
        
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus('loading');
        setMessage('Entrando...');
        
        try {
            const user = await request(controller.signal);
            setStatus('success');
            setMessage('Login realizado. Redirecionando...');
            timerRef.current = window.setTimeout(() => login(user), 700);
        } 
        catch (error) {
            if (controller.signal.aborted || isAbortError(error)) return;
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
        }
    },
    [login],
);

const submit = useCallback((values: LoginValues) => run((signal) => entrar(values, signal)), [run]);

return { status, message, submit };
}