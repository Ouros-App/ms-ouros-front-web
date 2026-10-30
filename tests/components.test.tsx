import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OtpInputs } from '@/components/complex/VerificationCard/OtpInputs';
import { MetasTabela } from '@/components/complex/MetasCard/MetasTabela';

afterEach(cleanup);

describe('verificação OTP', () => {
  it('expõe seis campos acessíveis e encaminha mudanças e teclas', () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    const onPaste = vi.fn();
    render(<OtpInputs digits={['1', '', '', '', '', '']} registerRef={vi.fn()} onChange={onChange} onKeyDown={onKeyDown} onPaste={onPaste} hasError />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    expect(inputs[0].getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(1, '2');
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(onKeyDown).toHaveBeenCalledWith(1, expect.anything());
    fireEvent.paste(inputs[1]);
    expect(onPaste).toHaveBeenCalled();
  });
});

describe('tabela de metas', () => {
  it('exibe estado vazio', () => {
    render(<MetasTabela metas={[]} onEditar={vi.fn()} onExcluir={vi.fn()} />);
    expect(screen.getByText('Nenhuma meta encontrada.')).toBeTruthy();
  });
  it('exibe progresso e envia a meta às ações', () => {
    const meta = { id: '1', estado: 'SP', meta: 'Economia', totalGranjas: 10, concluidos: 4 };
    const editar = vi.fn();
    const excluir = vi.fn();
    render(<MetasTabela metas={[meta]} onEditar={editar} onExcluir={excluir} />);
    expect(screen.getByText('40%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Editar meta Economia de SP' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir meta Economia de SP' }));
    expect(editar).toHaveBeenCalledWith(meta);
    expect(excluir).toHaveBeenCalledWith(meta);
  });
});
