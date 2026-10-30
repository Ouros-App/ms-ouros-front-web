import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginCard } from '@/components/complex/LoginCard';
import { PasswordResetFlow } from '@/components/complex/PasswordResetFlow';
import { VerificationCard } from '@/components/complex/VerificationCard';
import { useAuth } from '@/hooks/useAuth';
import { useLogin } from '@/hooks/useLogin';
import { efeitoDireito, efeitoEsquerdo, logo, mascote } from './LoginAssets';
import { destaques } from './LoginContent';
import './Login.css';

interface LoginLocationState {
  from?: string;
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [redefinindoSenha, setRedefinindoSenha] = useState(false);
  const {
    step,
    status,
    message,
    pendingChallenge,
    submitCredentials,
    submitOtp,
    resendOtp,
    backToCredentials,
  } = useLogin();

  const redirectTo = (location.state as LoginLocationState | null)?.from ?? '/ranking';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="login-page">
      {efeitoEsquerdo && <img src={efeitoEsquerdo} alt="" className="login-page__effect-left" />}

      <div className="login-page__grid">
        <section className="login-hero" aria-label="Apresentação do OUROS">
          {efeitoDireito && <img src={efeitoDireito} alt="" className="login-hero__effect-right" />}

          {logo ? (
            <img src={logo} alt="OUROS" className="login-hero__logo" />
          ) : (
            <p className="login-hero__logo-text">
              OUROS<span className="login-hero__highlight" aria-hidden="true">.</span>
            </p>
          )}

          <div className="login-hero__divider" />

          <p className="login-hero__tagline">
            Monitoramento inteligente
            <br />
            para granjas mais <span className="login-hero__highlight">eficientes.</span>
          </p>

          <ul className="login-hero__features">
            {destaques.map((destaque) => (
              <li key={destaque.title} className="login-hero__feature">
                <span className="login-hero__feature-icon">{destaque.icon}</span>
                <div>
                  <p className="login-hero__feature-title">{destaque.title}</p>
                  <p className="login-hero__feature-text">{destaque.text}</p>
                </div>
              </li>
            ))}
          </ul>

          {mascote && (
            <img
              src={mascote}
              alt="Mascote do OUROS, um pintinho amarelo de macacão"
              className="login-hero__mascot"
            />
          )}
        </section>

        {redefinindoSenha ? (
          <PasswordResetFlow onClose={() => setRedefinindoSenha(false)} />
        ) : step === 'credentials' || !pendingChallenge ? (
          <LoginCard
            status={status}
            message={message}
            onSubmit={submitCredentials}
            onForgotPassword={() => setRedefinindoSenha(true)}
          />
        ) : (
          <VerificationCard
            maskedEmail={pendingChallenge.maskedEmail}
            status={status}
            message={message}
            onVerify={submitOtp}
            onResend={resendOtp}
            onBack={backToCredentials}
            expiresIn={pendingChallenge.expiresIn}
            isMock={pendingChallenge.isMock}
          />
        )}
      </div>
    </main>
  );
}
