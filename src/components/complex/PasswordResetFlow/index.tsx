
import { useState, type FormEvent, type ReactNode } from 'react';
import { PasswordVisibilityButton } from '@/components/complex/LoginCard/PasswordVisibilityButton';
import { VerificationCard } from '@/components/complex/VerificationCard';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import '@/components/complex/LoginCard/LoginCard.css';
import './PasswordResetFlow.css';

interface PasswordResetFlowProps{
    readonly onClose: () => void;
    readonly initialEmail?: string;
    readonly onSuccess?: () => void;
}

interface NewPasswordCardProps{
    readonly busy: boolean;
    readonly statusMessage: ReactNode;
    readonly onSave: (password: string) => void;
}

interface EmailRequestCardProps{
    readonly busy: boolean;
    readonly email: string;
    readonly initialEmail?: string;
    readonly statusMessage: ReactNode;
    readonly onEmailChange: (value: string) => void;
    readonly onRequestCode: (email: string) => void;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

function NewPasswordCard({
    busy,
    statusMessage,
    onSave
}: Readonly<NewPasswordCardProps>) {
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [erroLocal, setErroLocal] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const enviar = (evento: FormEvent) => {
        evento.preventDefault();

        if (senha !== confirmacao) {
            setErroLocal('As senhas não conferem.');
            return;
        }

        setErroLocal('');
        onSave(senha);
    };

    return (
        <section
            className="login-card password-reset-card"
            aria-labelledby="reset-title"
        >
            <header className="login-card-header">
                <h1 id="reset-title" className="login-card-title">
                    Nova senha
                </h1>

                <p className="login-card-subtitle">
                    Use de 8 a 20 caracteres, com maiúscula, minúscula,
                    número e caractere especial.
                </p>
            </header>

            <form
                onSubmit={enviar}
                noValidate
                className="login-card__form"
            >
                <div className="login-card-field">
                    <label
                        htmlFor="reset-senha"
                        className="login-card__label_email"
                    >
                        Nova senha
                    </label>

                    <div className="login-card__password">
                        <input
                            id="reset-senha"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            maxLength={20}
                            value={senha}
                            disabled={busy}
                            onChange={(e) => setSenha(e.target.value)}
                            className="login-card__input"
                        />

                        <PasswordVisibilityButton
                            visible={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            disabled={busy}
                        />
                    </div>
                </div>

                <div className="login-card-field">
                    <label
                        htmlFor="reset-confirmacao"
                        className="login-card__label_email"
                    >
                        Confirmar senha
                    </label>

                    <div className="login-card__password">
                        <input
                            id="reset-confirmacao"
                            type={showConfirmation ? 'text' : 'password'}
                            autoComplete="new-password"
                            maxLength={20}
                            value={confirmacao}
                            disabled={busy}
                            onChange={(e) => setConfirmacao(e.target.value)}
                            aria-invalid={Boolean(erroLocal)}
                            aria-describedby={
                                erroLocal ? 'reset-erro' : undefined
                            }
                            className="login-card__input"
                        />

                        <PasswordVisibilityButton
                            visible={showConfirmation}
                            onToggle={() =>
                                setShowConfirmation(!showConfirmation)
                            }
                            disabled={busy}
                        />
                    </div>

                    {erroLocal && (
                        <p
                            id="reset-erro"
                            role="alert"
                            className="login-card-error"
                        >
                            {erroLocal}
                        </p>
                    )}
                </div>

                {statusMessage}

                <button
                    type="submit"
                    disabled={busy}
                    aria-busy={busy}
                    className="login-card-submit"
                >
                    {busy ? 'Salvando...' : 'Salvar nova senha'}
                </button>
            </form>
        </section>
    );
}

function EmailRequestCard({
    busy,
    email,
    initialEmail,
    statusMessage,
    onEmailChange,
    onRequestCode
}: Readonly<EmailRequestCardProps>) {
    const [erroLocal, setErroLocal] = useState('');

    const enviar = (evento: FormEvent) => {
        evento.preventDefault();

        if (!EMAIL_VALIDO.test(email.trim())) {
            setErroLocal('Informe um e-mail válido.');
            return;
        }

        setErroLocal('');
        onRequestCode(email.trim());
    };

    return (
        <section
            className="login-card password-reset-card"
            aria-labelledby="reset-title"
        >
            <header className="login-card-header">
                <h1 id="reset-title" className="login-card-title">
                    {initialEmail ? 'Alterar senha' : 'Esqueceu sua senha?'}
                </h1>

                <p className="login-card-subtitle">
                    {initialEmail
                        ? 'Enviaremos um código de verificação para o seu e-mail cadastrado.'
                        : 'Informe seu e-mail para receber um código de verificação.'}
                </p>
            </header>

            <form
                onSubmit={enviar}
                noValidate
                className="login-card__form"
            >
                <div className="login-card-field">
                    <label
                        htmlFor="reset-email"
                        className="login-card__label_email"
                    >
                        E-mail
                    </label>

                    <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        placeholder="seuemail@email.com"
                        maxLength={120}
                        value={email}
                        disabled={busy}
                        readOnly={Boolean(initialEmail)}
                        onChange={(e) => onEmailChange(e.target.value)}
                        aria-invalid={Boolean(erroLocal)}
                        aria-describedby={
                            erroLocal ? 'reset-erro' : undefined
                        }
                        className="login-card__input"
                    />

                    {erroLocal && (
                        <p
                            id="reset-erro"
                            role="alert"
                            className="login-card-error"
                        >
                            {erroLocal}
                        </p>
                    )}
                </div>

                {statusMessage}

                <button
                    type="submit"
                    disabled={busy}
                    aria-busy={busy}
                    className="login-card-submit"
                >
                    {busy ? 'Enviando...' : 'Enviar código'}
                </button>
            </form>
        </section>
    );
}

/**
 * Fluxo de alteração/redefinição de senha:
 * e-mail → código OTP → nova senha.
 */
export function PasswordResetFlow({
    onClose,
    initialEmail,
    onSuccess
}: Readonly<PasswordResetFlowProps>) {
    const reset = usePasswordReset(onSuccess ?? onClose);

    const [email, setEmail] = useState(initialEmail ?? '');

    const busy =
        reset.status === 'loading' ||
        reset.status === 'success';

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

    const statusMessage = reset.status !== 'idle' && reset.message && (
        <p
            role={reset.status === 'error' ? 'alert' : 'status'}
            className={`login-card__status login-card__status--${reset.status}`}
        >
            {reset.status === 'loading' && (
                <span
                    className="login-card__spinner"
                    aria-hidden="true"
                />
            )}

            {reset.message}
        </p>
    );

    if (reset.step === 'new-password') {
        return (
            <NewPasswordCard
                busy={busy}
                statusMessage={statusMessage}
                onSave={(novaSenha) =>
                    void reset.confirmarSenha(novaSenha)
                }
            />
        );
    }

    return (
        <EmailRequestCard
            busy={busy}
            email={email}
            initialEmail={initialEmail}
            statusMessage={statusMessage}
            onEmailChange={setEmail}
            onRequestCode={(emailInformado) =>
                void reset.solicitarCodigo(emailInformado)
            }
        />
    );
}
