import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PerfilForm } from '@/components/complex/PerfilForm';
import { PerfilFoto } from '@/components/complex/PerfilFoto';
import { PasswordResetFlow } from '@/components/complex/PasswordResetFlow';
import { usePerfilFoto } from '@/hooks/usePerfilFoto';
import PerfilPage from '@/pages/Perfil';
import * as authHook from '@/hooks/useAuth';
import * as perfilHook from '@/hooks/usePerfil';
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
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
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

    const inputSenha = screen.queryByLabelText(/senha/i, { selector: 'input' });
    expect(inputSenha).toBeNull();

    const botaoTrocarSenha = screen.getByRole('button', { name: /alterar senha/i });
    expect(botaoTrocarSenha).toBeTruthy();

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

  it('PerfilFoto renderiza componentes, ações de remoção e seleção de arquivo', () => {
    const onEscolher = vi.fn();
    const onRemover = vi.fn();

    const { rerender } = render(
      <PerfilFoto
        nome="Lucas"
        foto={null}
        erro="Foto inválida"
        processando={false}
        onEscolher={onEscolher}
        onRemover={onRemover}
      />,
    );

    expect(screen.getByText('Foto inválida')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /remover foto/i })).toBeNull();

    const inputArquivo = screen.getByLabelText(/escolher uma foto/i);
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(inputArquivo, { target: { files: [file] } });
    expect(onEscolher).toHaveBeenCalledWith(file);

    // Quando tem foto
    rerender(
      <PerfilFoto
        nome="Lucas"
        foto="https://res.cloudinary.com/foto.jpg"
        erro=""
        processando={false}
        onEscolher={onEscolher}
        onRemover={onRemover}
      />,
    );

    const botaoRemover = screen.getByRole('button', { name: /remover foto/i });
    fireEvent.click(botaoRemover);
    expect(onRemover).toHaveBeenCalledTimes(1);
  });

  it('PerfilPage gerencia abertura de modal para troca de senha, aviso de sucesso e fluxo de erro', async () => {
    const recarregar = vi.fn();
    const salvar = vi.fn().mockResolvedValue(undefined);
    const logout = vi.fn();

    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: { id: '1', name: 'Lucas', email: 'lucas@empresa.com.br', role: 'user' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout,
      updateUser: vi.fn(),
    });

    // 1. Estado de erro
    vi.spyOn(perfilHook, 'usePerfil').mockReturnValue({
      perfil: null,
      status: 'erro',
      mensagemErro: 'Falha de rede ao carregar',
      recarregar,
      salvar,
    });

    const { rerender } = render(
      <MemoryRouter>
        <PerfilPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Não foi possível carregar o perfil')).toBeTruthy();
    expect(screen.getByText('Falha de rede ao carregar')).toBeTruthy();

    // 2. Estado de perfil não encontrado
    vi.spyOn(perfilHook, 'usePerfil').mockReturnValue({
      perfil: null,
      status: 'pronto',
      mensagemErro: '',
      recarregar,
      salvar,
    });
    rerender(
      <MemoryRouter>
        <PerfilPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Perfil não encontrado')).toBeTruthy();

    // 3. Estado pronto
    vi.spyOn(perfilHook, 'usePerfil').mockReturnValue({
      perfil: mockPerfil,
      status: 'pronto',
      mensagemErro: '',
      recarregar,
      salvar,
    });
    rerender(
      <MemoryRouter>
        <PerfilPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Perfil - Informações pessoais')).toBeTruthy();

    // Clicar em Alterar senha abre a modal
    const botaoAlterarSenha = screen.getByRole('button', { name: /alterar senha/i });
    fireEvent.click(botaoAlterarSenha);

    const dialog = document.querySelector('dialog');
    expect(dialog).toBeTruthy();

    // Clicar no botão Fechar (✕) fecha a modal
    const botaoFechar = screen.getByRole('button', { name: /fechar alteração de senha/i });
    fireEvent.click(botaoFechar);

    // Reabrir e fechar com o botão Cancelar
    fireEvent.click(botaoAlterarSenha);
    const botaoCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(botaoCancelar);

    // Salvar o perfil na PerfilPage
    const botaoSalvar = screen.getByRole('button', { name: /^salvar$/i });
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(salvar).toHaveBeenCalled();
    });

    // Clicar em Sair da conta
    const botaoSair = screen.getByRole('button', { name: /sair da conta/i });
    fireEvent.click(botaoSair);
    expect(logout).toHaveBeenCalled();
  });
});
