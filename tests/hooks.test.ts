import { afterEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useVerificationForm } from '@/components/complex/VerificationCard/useVerificationForm';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import { useMetas } from '@/hooks/useMetas';
vi.mock('@/services/metas.Service', () => ({ listarMetas: vi.fn(), lancarMetaEstadual: vi.fn(), atualizarMeta: vi.fn(), excluirMeta: vi.fn() }));
import { listarMetas, lancarMetaEstadual, atualizarMeta, excluirMeta } from '@/services/metas.Service';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); });
describe('código OTP', () => {
  it('aceita apenas dígitos, completa e reinicia', () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useVerificationForm({ onComplete: complete }));
    act(() => result.current.handleChange(0, 'a123456'));
    expect(result.current.code).toBe('123456');
    expect(result.current.isComplete).toBe(true);
    expect(complete).toHaveBeenCalledWith('123456');
    act(() => result.current.reset());
    expect(result.current.code).toBe('');
    act(() => result.current.handleChange(0, 'x'));
    expect(result.current.isComplete).toBe(false);
  });
  it('cola código e movimenta cursor pelo teclado', () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useVerificationForm({ onComplete: complete }));
    const input = document.createElement('input');
    act(() => result.current.registerInputRef(input, 0));
    act(() => result.current.handlePaste({ preventDefault: vi.fn(), clipboardData: { getData: () => '12-34 56' } } as never));
    expect(complete).toHaveBeenCalledWith('123456');
    act(() => result.current.handleKeyDown(1, { key: 'ArrowLeft', preventDefault: vi.fn() } as never));
    act(() => result.current.handleChange(1, ''));
    act(() => result.current.handleKeyDown(1, { key: 'Backspace', preventDefault: vi.fn() } as never));
    expect(result.current.code).toBe('3456');
  });
  it('mantém digitação em lote e completa uma vez em StrictMode', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useVerificationForm({ onComplete }), { wrapper: StrictMode });
    act(() => {
      for (let i = 0; i < 6; i++) result.current.handleChange(i, String(i + 1));
    });
    expect(result.current.code).toBe('123456');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');
  });
  it('sincroniza colagem, exclusão e reset antes do próximo render', () => {
    const { result } = renderHook(() => useVerificationForm());
    act(() => {
      result.current.handlePaste({ preventDefault: vi.fn(), clipboardData: { getData: () => '123456' } } as never);
      result.current.handleChange(5, '');
      result.current.handleKeyDown(5, { key: 'Backspace', preventDefault: vi.fn() } as never);
    });
    expect(result.current.digits).toEqual(['1', '2', '3', '4', '', '']);
    act(() => {
      result.current.reset();
      result.current.handleChange(2, '9');
    });
    expect(result.current.digits).toEqual(['', '', '9', '', '', '']);
  });
  it('conta o tempo e permite reiniciar o envio', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOtpCountdown({ initialCooldown: 1, initialExpiresIn: 1 }));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.canResend).toBe(true);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formatMmSs(65)).toBe('01:05');
    act(() => result.current.resetCooldown(30));
    expect(result.current.cooldown).toBe(30);
  });
});
describe('gestão de metas', () => {
  it('carrega, filtra, adiciona, atualiza e exclui metas', async () => {
    const meta = { id: '1', estado: 'SP', meta: 'Água', totalGranjas: 10, concluidos: 2 };
    vi.mocked(listarMetas).mockResolvedValue([meta]);
    vi.mocked(lancarMetaEstadual).mockResolvedValue([{ ...meta, id: '2', meta: 'Energia' }]);
    vi.mocked(atualizarMeta).mockResolvedValue({ ...meta, concluidos: 5 });
    vi.mocked(excluirMeta).mockResolvedValue(undefined);
    const { result } = renderHook(() => useMetas());
    await waitFor(() => expect(result.current.status).toBe('pronto'));
    await act(async () => { await result.current.lancar('Energia'); });
    expect(result.current.todas).toHaveLength(2);
    await act(async () => { await result.current.salvar('1', { meta: 'Água', totalGranjas: 10, concluidos: 5 }); });
    expect(result.current.todas[0].concluidos).toBe(5);
    act(() => result.current.setBusca('energia'));
    expect(result.current.metas).toHaveLength(1);
    await act(async () => { await result.current.excluir('2'); });
    expect(result.current.metas).toHaveLength(0);
  });
  it('exibe erro e permite recarregar', async () => {
    vi.mocked(listarMetas).mockRejectedValueOnce(new Error('Falha')).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useMetas());
    await waitFor(() => expect(result.current.status).toBe('erro'));
    expect(result.current.mensagemErro).toBe('Falha');
    act(() => result.current.recarregar());
    await waitFor(() => expect(result.current.status).toBe('pronto'));
  });
});
