import { useCallback, useEffect, useRef, useState } from 'react';
import {
  confirmarRedefinicaoSenha,
  iniciarRedefinicaoSenha,
  REGRA_SENHA,
  verificarCodigoRedefinicao,
} from '@/services/passwordResetService';
import type { LoginStatus } from '@/types/auth.types';
import { isAbortError } from '@/utils/delay';

export type PasswordResetStep = 'email' | 'verification' | 'new-password';

interface Desafio {
  email: string;
  challengeId: string;
  maskedEmail: string;
  expiresIn: number;
}

/** Fluxo de redefinição de senha: e-mail → OTP → nova senha (ms-auth-service). */
export function usePasswordReset(onFinish: () => void) {
  const [step, setStep] = useState<PasswordResetStep>('email');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [message, setMessage] = useState('');
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [resetToken, setResetToken] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const novoController = () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  const falha = (error: unknown, fallback: string) => {
    if (isAbortError(error)) return;
    setStatus('error');
    setMessage(error instanceof Error ? error.message : fallback);
  };

  const solicitarCodigo = useCallback(async (email: string) => {
    const controller = novoController();
    setStatus('loading');
    setMessage('Enviando código...');
    try {
      const resposta = await iniciarRedefinicaoSenha(email, controller.signal);
      setDesafio({
        email,
        challengeId: resposta.challenge_id,
        maskedEmail: resposta.masked_email,
        expiresIn: resposta.expires_in,
      });
      setStep('verification');
      setStatus('idle');
      setMessage('');
    } catch (error) {
      falha(error, 'Não foi possível enviar o código.');
    }
  }, []);

  const verificarCodigo = useCallback(
    async (code: string) => {
      if (!desafio) return;
      const controller = novoController();
      setStatus('loading');
      setMessage('Validando código...');
      try {
        const resposta = await verificarCodigoRedefinicao(
          { challengeId: desafio.challengeId, email: desafio.email, code },
          controller.signal,
        );
        setResetToken(resposta.reset_token);
        setStep('new-password');
        setStatus('idle');
        setMessage('');
      } catch (error) {
        falha(error, 'Código incorreto ou expirado.');
      }
    },
    [desafio],
  );

  const reenviarCodigo = useCallback(async () => {
    if (!desafio) return;
    const controller = novoController();
    setStatus('loading');
    setMessage('Enviando novo código...');
    try {
      const resposta = await iniciarRedefinicaoSenha(desafio.email, controller.signal);
      setDesafio({
        email: desafio.email,
        challengeId: resposta.challenge_id,
        maskedEmail: resposta.masked_email,
        expiresIn: resposta.expires_in,
      });
      setStatus('idle');
      setMessage('Novo código enviado com sucesso!');
    } catch (error) {
      falha(error, 'Não foi possível reenviar o código.');
    }
  }, [desafio]);

  const confirmarSenha = useCallback(
    async (novaSenha: string) => {
      if (!REGRA_SENHA.test(novaSenha)) {
        setStatus('error');
        setMessage(
          'A senha deve ter de 8 a 20 caracteres, com maiúscula, minúscula, número e caractere especial.',
        );
        return;
      }
      const controller = novoController();
      setStatus('loading');
      setMessage('Atualizando senha...');
      try {
        await confirmarRedefinicaoSenha({ resetToken, novaSenha }, controller.signal);
        setResetToken('');
        onFinish();
      } catch (error) {
        falha(error, 'Não foi possível redefinir a senha.');
      }
    },
    [onFinish, resetToken],
  );

  const voltar = useCallback(() => {
    controllerRef.current?.abort();
    setStatus('idle');
    setMessage('');
    if (step === 'verification') {
      setDesafio(null);
      setStep('email');
      return;
    }
    onFinish();
  }, [onFinish, step]);

  return { step, status, message, desafio, solicitarCodigo, verificarCodigo, reenviarCodigo, confirmarSenha, voltar };
}
