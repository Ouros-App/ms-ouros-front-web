interface PasswordVisibilityButtonProps {
    visible: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export function PasswordVisibilityButton({ visible, onToggle, disabled }: PasswordVisibilityButtonProps) {
    return (
        <button type="button" className="login-card__visibility" onClick={onToggle} disabled={disabled}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {visible && <path d="M4 4l16 16" />}
            </svg>
        </button>
    );
}
