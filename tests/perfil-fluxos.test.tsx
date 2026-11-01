import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { PerfilForm } from '@/components/complex/PerfilForm';
import { PasswordResetFlow } from '@/components/complex/PasswordResetFlow';
import { usePerfilFoto } from '@/hooks/usePerfilFoto';
import * as cloudinary from '@/services/cloudinaryService';
import type { Perfil } from '@/types/perfil.types';

const mockPerfil: Perfil = {
  id: '1',
  nome: 'Lucas Porto',
  email: 'lucas@empresa.com.br',
  cpf: '12345678900',
  telefone: '11999998888',
  avatarUrl: 'https://res.cloudinary.com/mpyey2bi/image/upload/v1/foto.jpg',
};

describe('Perfil - Fluxo de Senha e Cloudinary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('não deve renderizar campo de entrada para senha e deve exibir botão para alterar senha', () => {
    const onSalvar = vi.fn();
    const onSair = vi.fn();
    const onTrocarSenha = vi.fn();

    render(
      <PerfilForm
        perfil={mockPerfil}
        onSalvar={onSalvar}
        onSair={onSair}
        onTrocarSenha={onTrocarSenha}
      />,
    );

    // Garante que não existe input de senha na tela
    const inputSenha = screen.queryByLabelText(/senha/i, { selector: 'input' });
    expect(inputSenha).toBeNull();

    // Deve exibir o botão Alterar senha
    const botaoTrocarSenha = screen.getByRole('button', { name: /alterar senha/i });
    expect(botaoTrocarSenha).toBeTruthy();

    // Clicar no botão aciona o fluxo de troca de senha
    fireEvent.click(botaoTrocarSenha);
    expect(onTrocarSenha).toHaveBeenCalledTimes(1);
  });

  it('PasswordResetFlow deve inicializar com e-mail preenchido e permitir cancelar no Perfil', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <PasswordResetFlow
        initialEmail="lucas@empresa.com.br"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByRole('heading', { name: /alterar senha/i })).toBeTruthy();
    const inputEmail = screen.getByLabelText(/e-mail/i) as HTMLInputElement;
    expect(inputEmail.value).toBe('lucas@empresa.com.br');
    expect(inputEmail.readOnly).toBe(true);

    const botaoCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(botaoCancelar);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('usePerfilFoto deve gerenciar foto salva, remoção e upload no Cloudinary', async () => {
    vi.spyOn(cloudinary, 'uploadParaCloudinary').mockResolvedValue(
      'https://res.cloudinary.com/mpyey2bi/image/upload/v2/nova_foto.jpg',
    );

    const { result } = renderHook(() => usePerfilFoto(mockPerfil.avatarUrl));

    expect(result.current.foto).toBe(mockPerfil.avatarUrl);

    // Remove foto
    act(() => {
      result.current.remover();
    });
    expect(result.current.foto).toBeNull();
    expect(result.current.removido).toBe(true);

    const finalRemovida = await result.current.obterFotoFinal();
    expect(finalRemovida).toBeNull();

    // Escolhe nova foto
    const arquivo = new File(['teste-imagem'], 'avatar.png', { type: 'image/png' });
    await act(async () => {
      await result.current.escolher(arquivo);
    });

    expect(result.current.arquivoPendente).toBe(arquivo);
    expect(result.current.removido).toBe(false);

    // Obter foto final deve enviar para o Cloudinary
    let urlFinal: string | null = null;
    await act(async () => {
      urlFinal = await result.current.obterFotoFinal();
    });

    expect(cloudinary.uploadParaCloudinary).toHaveBeenCalledWith(arquivo);
    expect(urlFinal).toBe('https://res.cloudinary.com/mpyey2bi/image/upload/v2/nova_foto.jpg');
  });

  it('salva alterações de dados pessoais no PerfilForm', async () => {
    const onSalvar = vi.fn().mockResolvedValue(undefined);

    render(
      <PerfilForm
        perfil={mockPerfil}
        onSalvar={onSalvar}
        onSair={vi.fn()}
        onTrocarSenha={vi.fn()}
      />,
    );

    const inputNome = screen.getByLabelText(/nome/i);
    fireEvent.change(inputNome, { target: { value: 'Lucas Porto Modificado' } });

    const botaoSalvar = screen.getByRole('button', { name: /^salvar$/i });
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(onSalvar).toHaveBeenCalledWith({
        nome: 'Lucas Porto Modificado',
        email: 'lucas@empresa.com.br',
        telefone: '(11) 99999-8888',
      });
    });

    expect(await screen.findByText('Perfil atualizado com sucesso.')).toBeTruthy();
  });
});
