import { useState, type FormEvent } from 'react';
import { VerificationCard } from '@/components/complex/VerificationCard';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import '@/components/complex/LoginCard/LoginCard.css';

interface PasswordResetFlowProps {
  onClose: () => void;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fluxo "Esqueceu sua senha?": e-mail → código OTP → nova senha. Reaproveita o estilo do LoginCard. */
export function PasswordResetFlow({ onClose }: PasswordResetFlowProps) {
  const reset = usePasswordReset(onClose);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erroLocal, setErroLocal] = useState('');

  const busy = reset.status === 'loading' || reset.status === 'success';

  if (reset.step === 'verification' && reset.desafio) {
    return (
      <VerificationCard
        maskedEmail={reset.desafio.maskedEmail}
        status={reset.status}
        message={reset.message}
        onVerify={reset.verificarCodigo}
        onResend={reset.reenviarCodigo}
        onBack={reset.voltar}
        expiresIn={reset.desafio.expiresIn}
      />
    );
  }

  const enviarEmail = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_VALIDO.test(email.trim())) {
      setErroLocal('Informe um e-mail válido.');
      return;
    }
    setErroLocal('');
    void reset.solicitarCodigo(email.trim());
  };

  const enviarSenha = (event: FormEvent) => {
    event.preventDefault();
    if (senha !== confirmacao) {
      setErroLocal('As senhas não conferem.');
      return;
    }
    setErroLocal('');
    void reset.confirmarSenha(senha);
  };

  const statusMessage = reset.status !== 'idle' && reset.message && (
    <p
      role={reset.status === 'error' ? 'alert' : 'status'}
      className={`login-card__status login-card__status--${reset.status}`}
    >
      {reset.status === 'loading' && <span className="login-card__spinner" aria-hidden="true" />}
      {reset.message}
    </p>
  );

  if (reset.step === 'done') {
    return (
      <section className="login-card" aria-labelledby="reset-title">
        <header className="login-card-header">
          <h1 id="reset-title" className="login-card-title">Senha redefinida</h1>
          <p className="login-card-subtitle">Agora você já pode entrar com a nova senha.</p>
        </header>
        {statusMessage}
        <button type="button" className="login-card-submit" onClick={onClose}>
          Voltar ao login
        </button>
      </section>
    );
  }

  if (reset.step === 'new-password') {
    return (
      <section className="login-card" aria-labelledby="reset-title">
        <header className="login-card-header">
          <h1 id="reset-title" className="login-card-title">Nova senha</h1>
          <p className="login-card-subtitle">
            Use de 8 a 20 caracteres, com maiúscula, minúscula, número e caractere especial.
          </p>
        </header>
        <form onSubmit={enviarSenha} noValidate className="login-card__form">
          <div className="login-card-field">
            <label htmlFor="reset-senha" className="login-card__label_email">Nova senha</label>
            <input
              id="reset-senha"
              type="password"
              autoComplete="new-password"
              maxLength={20}
              value={senha}
              disabled={busy}
              onChange={(e) => setSenha(e.target.value)}
              className="login-card__input"
            />
          </div>
          <div className="login-card-field">
            <label htmlFor="reset-confirmacao" className="login-card__label_email">Confirmar senha</label>
            <input
              id="reset-confirmacao"
              type="password"
              autoComplete="new-password"
              maxLength={20}
              value={confirmacao}
              disabled={busy}
              onChange={(e) => setConfirmacao(e.target.value)}
              aria-invalid={Boolean(erroLocal)}
              aria-describedby={erroLocal ? 'reset-erro' : undefined}
              className="login-card__input"
            />
            {erroLocal && <p id="reset-erro" role="alert" className="login-card-error">{erroLocal}</p>}
          </div>
          {statusMessage}
          <button type="submit" disabled={busy} aria-busy={reset.status === 'loading'} className="login-card-submit">
            {reset.status === 'loading' ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="login-card" aria-labelledby="reset-title">
      <header className="login-card-header">
        <h1 id="reset-title" className="login-card-title">Esqueceu sua senha?</h1>
        <p className="login-card-subtitle">Informe seu e-mail para receber um código de verificação.</p>
      </header>
      <form onSubmit={enviarEmail} noValidate className="login-card__form">
        <div className="login-card-field">
          <label htmlFor="reset-email" className="login-card__label_email">E-mail</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="seuemail@email.com"
            maxLength={120}
            value={email}
            disabled={busy}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(erroLocal)}
            aria-describedby={erroLocal ? 'reset-erro' : undefined}
            className="login-card__input"
          />
          {erroLocal && <p id="reset-erro" role="alert" className="login-card-error">{erroLocal}</p>}
        </div>
        {statusMessage}
        <button type="submit" disabled={busy} aria-busy={reset.status === 'loading'} className="login-card-submit">
          {reset.status === 'loading' ? 'Enviando...' : 'Enviar código'}
        </button>
      </form>
      <p className="login-card-footer">
        <button type="button" className="login-card__link" onClick={onClose}>
          Voltar ao login
        </button>
      </p>
    </section>
  );
}
