import React, { useCallback } from 'react';
import type { VerificationCardProps } from '@/types/auth.types';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import emailIcon from '@/assets/email-verify.svg';
import { OtpInputs } from './OtpInputs';
import { useVerificationForm } from './useVerificationForm';
import './VerificationCard.css';

export function VerificationCard({
  maskedEmail,
  status,
  message,
  onVerify,
  onResend,
  onBack,
  expiresIn = 300,
  cooldownSeconds = 60,
  isMock = false,
}: VerificationCardProps) {
  const busy = status === 'loading' || status === 'success';

  const handleComplete = useCallback(
    (code: string) => {
      if (!busy) {
        onVerify(code);
      }
    },
    [busy, onVerify],
  );

  const {
    digits,
    code,
    isComplete,
    registerInputRef,
    handleChange,
    handleKeyDown,
    handlePaste,
  } = useVerificationForm({
    onComplete: handleComplete,
  });

  const { cooldown, canResend, resetCooldown } = useOtpCountdown({
    initialCooldown: cooldownSeconds,
    initialExpiresIn: expiresIn,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isComplete && !busy) {
      onVerify(code);
    }
  };

  const handleResend = async () => {
    if (!canResend || busy) return;
    resetCooldown(60);
    await onResend();
  };

  return (
    <section className="verification-card" aria-labelledby="verification-title">
      <div className="verification-card__badge" aria-hidden="true">
        <img
          src={emailIcon}
          alt=""
          className="verification-card__badge-icon"
        />
      </div>

      <header className="verification-card__header">
        <h1 id="verification-title" className="verification-card__title">
          Verifique seu e-mail
        </h1>

        <p className="verification-card__subtitle">
          Enviamos um código de 6 dígitos para{' '}
          <strong className="verification-card__email-highlight">
            {maskedEmail}
          </strong>
        </p>

        {isMock ? (
          <div className="verification-card__mock-badge" role="status">
            <span>ℹ️ <strong>Modo Simulado:</strong> Nenhum e-mail real foi enviado. Use o código de teste <strong className="verification-card__mock-code">123456</strong>.</span>
          </div>
        ) : (
          <p className="verification-card__spam-hint">
            Não encontrou? Verifique a pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
          </p>
        )}
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="verification-card__form"
      >
        <OtpInputs
          digits={digits}
          disabled={busy}
          hasError={status === 'error'}
          registerRef={registerInputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        {status !== 'idle' && message && (
          <p
            role={status === 'error' ? 'alert' : 'status'}
            className={`verification-card__status verification-card__status--${status}`}
          >
            {status === 'loading' && (
              <span className="verification-card__spinner" aria-hidden="true" />
            )}
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!isComplete || busy}
          aria-busy={status === 'loading'}
          className="verification-card__submit"
        >
          {status === 'loading' ? (
            <>
              <span className="verification-card__spinner" aria-hidden="true" />
              <span>Verificando...</span>
            </>
          ) : (
            'Verificar código'
          )}
        </button>
      </form>

      <footer className="verification-card__footer">
        <p className="verification-card__resend-text">
          Não recebeu o código?
          {canResend ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleResend}
              className="verification-card__resend-button"
            >
              Reenviar código
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="verification-card__resend-button"
            >
              Reenviar em {cooldown}s
            </button>
          )}
        </p>

        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="verification-card__back-button"
        >
          ← Voltar e alterar e-mail
        </button>
      </footer>
    </section>
  );
}
export default VerificationCard;
