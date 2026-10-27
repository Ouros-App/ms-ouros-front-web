import { useCallback, useEffect, useState } from 'react';

interface UseOtpCountdownOptions {
  initialCooldown?: number;
  initialExpiresIn?: number;
}

export function useOtpCountdown({
  initialCooldown = 60,
  initialExpiresIn = 300,
}: UseOtpCountdownOptions = {}) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [expiresIn, setExpiresIn] = useState(initialExpiresIn);

  useEffect(() => {
    setCooldown(initialCooldown);
  }, [initialCooldown]);

  useEffect(() => {
    setExpiresIn(initialExpiresIn);
  }, [initialExpiresIn]);

  useEffect(() => {
    if (cooldown <= 0 && expiresIn <= 0) return;

    const interval = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldown, expiresIn]);

  const resetCooldown = useCallback((seconds = 60) => {
    setCooldown(seconds);
  }, []);

  const formatMmSs = useCallback((totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return {
    cooldown,
    expiresIn,
    canResend: cooldown <= 0,
    isExpired: expiresIn <= 0,
    resetCooldown,
    formatMmSs,
  };
}
