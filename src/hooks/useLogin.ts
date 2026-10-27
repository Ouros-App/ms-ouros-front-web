import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { iniciarLogin, verificarCodigoLogin } from '@/services/authService';
import { claimsToUser, parseJwt } from '@/services/tokenService';
import type {
  LoginStatus,
  LoginStep,
  LoginValues,
  PendingChallenge,
} from '@/types/auth.types';
import { isAbortError } from '@/utils/delay';

export function useLogin() {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [message, setMessage] = useState('');

  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  /**
   * Etapa 1: Inicia o fluxo de login validando credenciais e disparando o OTP
   */
  const submitCredentials = useCallback(
    async (values: LoginValues) => {
      controllerRef.current?.abort();
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus('loading');
      setMessage('Verificando credenciais...');

      try {
        const response = await iniciarLogin(values, controller.signal);
        setPendingChallenge({
          email: values.email,
          password: values.password,
          challengeId: response.challenge_id,
          maskedEmail: response.masked_email,
          expiresIn: response.expires_in,
        });
        setStep('verification');
        setStatus('idle');
        setMessage('');
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) return;
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar o login. Tente novamente.',
        );
      }
    },
    [],
  );

  /**
   * Etapa 2: Valida o código OTP de 6 dígitos e conclui a autenticação
   */
  const submitOtp = useCallback(
    async (code: string) => {
      if (!pendingChallenge) return;

      controllerRef.current?.abort();
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus('loading');
      setMessage('Validando código...');

      try {
        const tokenResponse = await verificarCodigoLogin(
          {
            email: pendingChallenge.email,
            password: pendingChallenge.password,
            challengeId: pendingChallenge.challengeId,
            code,
          },
          controller.signal,
        );

        const claims = parseJwt(tokenResponse.access_token);
        const user = claimsToUser(
          claims || { email: pendingChallenge.email },
          tokenResponse.access_token,
          tokenResponse.refresh_token,
        );

        // Descarte seguro da senha em memória
        setPendingChallenge(null);
        setStatus('success');
        setMessage('Código verificado! Redirecionando...');

        timerRef.current = window.setTimeout(() => {
          login(user);
        }, 600);
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) return;
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Código incorreto ou expirado. Tente novamente.',
        );
      }
    },
    [login, pendingChallenge],
  );

  /**
   * Reenvia um novo código de verificação para o e-mail
   */
  const resendOtp = useCallback(async () => {
    if (!pendingChallenge) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');
    setMessage('Enviando novo código...');

    try {
      const response = await iniciarLogin(
        {
          email: pendingChallenge.email,
          password: pendingChallenge.password,
        },
        controller.signal,
      );

      setPendingChallenge((prev) =>
        prev
          ? {
              ...prev,
              challengeId: response.challenge_id,
              expiresIn: response.expires_in,
              maskedEmail: response.masked_email,
            }
          : null,
      );

      setStatus('idle');
      setMessage('Novo código enviado com sucesso!');
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return;
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível reenviar o código. Aguarde alguns instantes.',
      );
    }
  }, [pendingChallenge]);

  /**
   * Permite que o usuário volte para o formulário de login para corrigir credenciais
   */
  const backToCredentials = useCallback(() => {
    controllerRef.current?.abort();
    setPendingChallenge(null);
    setStep('credentials');
    setStatus('idle');
    setMessage('');
  }, []);

  return {
    step,
    status,
    message,
    pendingChallenge,
    submitCredentials,
    submit: submitCredentials,
    submitOtp,
    resendOtp,
    backToCredentials,
  };
}
