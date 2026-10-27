import React from 'react';

interface OtpInputsProps {
  digits: string[];
  disabled?: boolean;
  hasError?: boolean;
  registerRef: (el: HTMLInputElement | null, index: number) => void;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
}

export function OtpInputs({
  digits,
  disabled = false,
  hasError = false,
  registerRef,
  onChange,
  onKeyDown,
  onPaste,
}: OtpInputsProps) {
  return (
    <div
      className="verification-card__otp-group"
      role="group"
      aria-label="Código de verificação de 6 dígitos"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => registerRef(el, index)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de 6`}
          aria-invalid={hasError}
          className={`verification-card__otp-box ${digit ? 'verification-card__otp-box--filled' : ''} ${
            hasError ? 'verification-card__otp-box--error' : ''
          }`.trim()}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
}
