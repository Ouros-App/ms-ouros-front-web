import { useCallback, useRef, useState } from 'react';

interface UseVerificationFormOptions {
  onComplete?: (code: string) => void;
}

export function useVerificationForm({ onComplete }: UseVerificationFormOptions = {}) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const registerInputRef = useCallback((el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el;
  }, []);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < 6) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  }, []);

  const handleChange = useCallback(
    (index: number, rawValue: string) => {
      const sanitized = rawValue.replace(/\D/g, '');

      if (!sanitized) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
        return;
      }

      if (sanitized.length === 1) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = sanitized;

          if (index < 5) {
            window.requestAnimationFrame(() => {
              inputRefs.current[index + 1]?.focus();
            });
          }

          if (next.every((d) => d.length === 1)) {
            onComplete?.(next.join(''));
          }

          return next;
        });
        return;
      }

      // Colar múltiplos dígitos direto no input
      setDigits((prev) => {
        const next = [...prev];
        const chars = sanitized.slice(0, 6);
        for (let i = 0; i < chars.length && index + i < 6; i++) {
          next[index + i] = chars[i];
        }

        const nextFocus = Math.min(5, index + chars.length);
        window.requestAnimationFrame(() => {
          inputRefs.current[nextFocus]?.focus();
        });

        if (next.every((d) => d.length === 1)) {
          onComplete?.(next.join(''));
        }

        return next;
      });
    },
    [onComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          event.preventDefault();
          setDigits((prev) => {
            const next = [...prev];
            next[index - 1] = '';
            return next;
          });
          focusInput(index - 1);
        }
        return;
      }

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (event.key === 'ArrowRight' && index < 5) {
        event.preventDefault();
        focusInput(index + 1);
        return;
      }
    },
    [digits, focusInput],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = event.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;

      setDigits(() => {
        const next = ['', '', '', '', '', ''];
        for (let i = 0; i < pasted.length; i++) {
          next[i] = pasted[i];
        }

        const nextFocus = Math.min(5, pasted.length);
        window.requestAnimationFrame(() => {
          inputRefs.current[nextFocus]?.focus();
        });

        if (next.every((d) => d.length === 1)) {
          onComplete?.(next.join(''));
        }

        return next;
      });
    },
    [onComplete],
  );

  const reset = useCallback(() => {
    setDigits(['', '', '', '', '', '']);
    focusInput(0);
  }, [focusInput]);

  const code = digits.join('');
  const isComplete = digits.every((d) => d.length === 1) && digits.length === 6;

  return {
    digits,
    code,
    isComplete,
    registerInputRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    focusInput,
    reset,
  };
}
