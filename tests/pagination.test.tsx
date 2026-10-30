import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { useCallback } from 'react';
import { Pagination } from '@/components/common/Pagination';
import { usePagedList } from '@/hooks/usePagedList';
import type { PageResponse } from '@/types/pagination.types';
afterEach(cleanup);
const page = (number: number, total = 21): PageResponse<string> => ({ content: ['item'], page: number, size: 10, totalElements: total, totalPages: Math.ceil(total / 10) });

it('exibe totais, controles acessíveis e desabilita navegação durante carregamento', () => {
 const onPageChange = vi.fn(), onSizeChange = vi.fn();
 const props = { ...page(0), onPageChange, onSizeChange };
 const view = render(<Pagination {...props} />);
 expect((screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
 expect(onPageChange).toHaveBeenCalledWith(1);
 fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '25' } });
 expect(onSizeChange).toHaveBeenCalledWith(25);
 view.rerender(<Pagination {...props} page={2} disabled />);
 expect((screen.getByRole('button', { name: 'Próxima' }) as HTMLButtonElement).disabled).toBe(true);
 expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(true);
 view.rerender(<Pagination {...props} totalPages={0} totalElements={0} />);
 expect(screen.getByRole('status').textContent).toContain('Página 0 de 0');
});

it('recomeça ao mudar tamanho, filtro ou escopo e corrige a última página após exclusão', async () => {
 const request = vi.fn(async (number: number, size: number, _signal: AbortSignal, _scope: string) => { void _signal; void _scope; return { ...page(number), size }; });
 const { result, rerender } = renderHook(({ scope }) => {
  const load = useCallback((number: number, size: number, signal: AbortSignal) => request(number, size, signal, scope), [scope]);
  return usePagedList(load);
 }, { initialProps: { scope: 'A' } });
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 act(() => result.current.pagination.onPageChange(2));
 await waitFor(() => expect(result.current.pagination.page).toBe(2));
 request.mockImplementation(async (number, size) => ({ ...page(number, 20), size }));
 act(() => result.current.recarregar());
 await waitFor(() => expect(result.current.pagination.page).toBe(1));
 expect(request).toHaveBeenLastCalledWith(1, 10, expect.any(AbortSignal), 'A');
 rerender({ scope: 'B' });
 await waitFor(() => expect(request).toHaveBeenLastCalledWith(0, 10, expect.any(AbortSignal), 'B'));
 act(() => result.current.pagination.onSizeChange(25));
 await waitFor(() => expect(request).toHaveBeenLastCalledWith(0, 25, expect.any(AbortSignal), 'B'));
});

it('cancela a página anterior e ignora respostas atrasadas mesmo se o transporte não abortar', async () => {
 let resolveOld!: (value: PageResponse<string>) => void;
 const request = vi.fn((number: number) => number === 0 ? Promise.resolve(page(0)) : new Promise<PageResponse<string>>((resolve) => { resolveOld = resolve; }));
 const load = (number: number, _size: number, _signal: AbortSignal) => { void _size; void _signal; return request(number); };
 const { result } = renderHook(() => usePagedList(load));
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 act(() => result.current.pagination.onPageChange(1));
 await waitFor(() => expect(request).toHaveBeenCalledWith(1));
 act(() => result.current.pagination.onPageChange(0));
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 await act(async () => resolveOld({ ...page(1), content: ['stale'] }));
 expect(result.current.items).toEqual(['item']);
});
