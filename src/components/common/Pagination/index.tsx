import { useId } from 'react';
import type { PaginationProps } from '@/types/pagination.types';
import './Pagination.css';

export function Pagination({ page, size, totalElements, totalPages, disabled, onPageChange, onSizeChange }: PaginationProps) {
  const id = useId();
  return (
    <nav className="pagination" aria-label="Paginação da tabela" aria-busy={disabled}>
      <label htmlFor={id}>Itens por página</label>
      <select id={id} value={size} disabled={disabled} onChange={(e) => onSizeChange(Number(e.target.value))}>
        {[10, 25, 50].map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <span role="status" aria-live="polite">Página {totalPages ? page + 1 : 0} de {totalPages} · {totalElements} resultados</span>
      <button type="button" disabled={disabled || page <= 0} onClick={() => onPageChange(page - 1)}>Anterior</button>
      <button type="button" disabled={disabled || page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>Próxima</button>
    </nav>
  );
}
