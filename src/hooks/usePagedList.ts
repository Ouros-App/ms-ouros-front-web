import { useCallback, useEffect, useState } from 'react';
import type { PageResponse, PaginationProps } from '@/types/pagination.types';
import { isAbortError } from '@/utils/delay';

/** The loader identity represents the complete server query (search, sort and scope). */
export function usePagedList<R extends PageResponse<unknown>>(load: (page: number, size: number, signal: AbortSignal) => Promise<R>) {
  const [query, setQuery] = useState(() => ({ load, page: 0, size: 10 }));
  const [response, setResponse] = useState<R | null>(null);
  const [status, setStatus] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [mensagemErro, setMensagemErro] = useState('');
  const [revision, setRevision] = useState(0);
  // Reset before effects run, avoiding a request for the old page with new filters.
  if (query.load !== load) setQuery({ ...query, load, page: 0 });

  useEffect(() => {
    const controller = new AbortController();
    setStatus('carregando');
    setMensagemErro('');
    load(query.page, query.size, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      const lastPage = Math.max(0, data.totalPages - 1);
      if (query.page > lastPage) {
        setQuery((current) => ({ ...current, page: lastPage }));
        return;
      }
      setResponse(data);
      setStatus('pronto');
    }).catch((error: unknown) => {
      if (controller.signal.aborted || isAbortError(error)) return;
      setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar a tabela.');
      setStatus('erro');
    });
    return () => controller.abort();
  }, [load, query.page, query.size, revision]);

  const recarregar = useCallback(() => setRevision((value) => value + 1), []);
  const pagination: PaginationProps = {
    page: response?.page ?? query.page,
    size: query.size,
    totalElements: response?.totalElements ?? 0,
    totalPages: response?.totalPages ?? 0,
    disabled: status !== 'pronto',
    onPageChange: (page) => setQuery((current) => ({ ...current, page })),
    onSizeChange: (size) => setQuery((current) => ({ ...current, page: 0, size })),
  };
  return { items: (response?.content ?? []) as R["content"], response, status, mensagemErro, recarregar, pagination };
}
