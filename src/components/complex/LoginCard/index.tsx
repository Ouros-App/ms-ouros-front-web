import type { LoginCardProps, LoginHelp } from '@/types/auth.types';
import { useLoginForm } from './useLoginForm';
import './LoginCard.css';

const AJUDA: Record<LoginHelp, string> = {
    senha: 'Para redefinir sua senha, peça ao gestor da sua granja. Ele consegue gerar um novo acesso para você.',
    conta: 'As contas são criadas pelo gestor da sua granja. Peça a ele para cadastrar o seu e-mail no OUROS.',
};

export function LoginCard({ status, message, onSubmit, onForgotPassword }: LoginCardProps) {
    const {
        values,
        errors,
        help,
        setHelp,
        formRef,
        handleChange,
        handleSubmit,
    } = useLoginForm(onSubmit);

    const busy = status === 'loading' || status === 'success';

    return (
        <section className="login-card" aria-labelledby="login-title">
            <header className="login-card-header">
                <h1 id="login-title" className="login-card-title">
                    Bem-vindo de volta!
                </h1>

                <p className="login-card-subtitle">
                    Faça login para acessar sua conta
                </p>
            </header>

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="login-card__form"
            >
                <div className="login-card-field">
                    <label htmlFor="email" className="login-card__label_email">
                        E-mail
                    </label>

                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seuemail@email.com"
                        maxLength={120}
                        value={values.email}
                        disabled={busy}
                        onChange={handleChange('email')}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                            errors.email ? 'email-error' : undefined
                        }
                        className={`login-card__input ${
                            errors.email ? 'login-card__input--error' : ''
                        }`.trim()}
                    />

                    {errors.email && (
                        <p
                            id="email-error"
                            role="alert"
                            className="login-card-error"
                        >
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="login-card-field">
                    <label
                        htmlFor="password"
                        className={`login-card__label_senha ${
                            errors.password ? 'login-card__label--error' : ''
                        }`.trim()}
                    >
                        Senha
                    </label>

                    <div className="login-card-forgot">
                        <button
                            type="button"
                            className="login-card__link"
                            onClick={() => (onForgotPassword ? onForgotPassword() : setHelp('senha'))}
                        >
                            Esqueceu sua senha?
                        </button>
                    </div>

                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="********"
                        maxLength={67}
                        value={values.password}
                        disabled={busy}
                        onChange={handleChange('password')}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                            errors.password ? 'password-error' : undefined
                        }
                        className={`login-card__input ${
                            errors.password ? 'login-card__input--error' : ''
                        }`.trim()}
                    />

                    {errors.password && (
                        <p
                            id="password-error"
                            role="alert"
                            className="login-card-error"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>

                {status !== 'idle' && (
                    <p
                        role={status === 'error' ? 'alert' : 'status'}
                        className={`login-card__status login-card__status--${status}`}
                    >
                        {status === 'loading' && (
                            <span
                                className="login-card__spinner"
                                aria-hidden="true"
                            />
                        )}
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={busy}
                    aria-busy={status === 'loading'}
                    className="login-card-submit"
                >
                    {status === 'loading' ? 'Entrando...' : 'Continuar'}
                </button>
            </form>

            <div className="login-card-divider" aria-hidden="true">
                <span className="login-card-divider-line" />
                ou
                <span className="login-card-divider-line" />
            </div>

            <p className="login-card-footer">
                Não tem uma conta?{' '}
                <button type="button" className="login-card__link" onClick={() => setHelp('conta')}>
                    Fale com seu gestor
                </button>
            </p>

            {help && (
                <p role="status" className="login-card__help">
                    {AJUDA[help]}
                </p>
            )}
        </section>

        
    );
}
