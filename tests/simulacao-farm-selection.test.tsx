import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AdminEnterpriseProvider } from '@/context/AdminEnterpriseContext';
import { CHAVE_GRANJA_SIMULACAO, CHAVE_SESSAO } from '@/utils/chaves';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';
import SimulacaoPage from '@/pages/Simulacao';
import { SimulacaoModal } from '@/components/complex/SimulacaoCard/SimulacaoModal';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

vi.mock('@/utils/delay', () => ({
  wait: async () => {},
  isAbortError: (e: Error) => e?.name === 'AbortError',
}));

const mockGranjas = [
  { id: 101, name: 'Granja Ouro Verde', region: 'SP', id_enterprise: 1 },
  { id: 102, name: 'Granja Bela Vista', region: 'MG', id_enterprise: 1 },
];

function mockApiPayload(url: string): unknown {
  if (url.includes('/farms/simulations/paged')) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
    };
  }
  if (url.includes('/farms/simulations')) {
    return [];
  }
  if (url.includes('/water-consumption')) {
    return { water_consumption: 150 };
  }
  if (url.includes('/ranking')) {
    return { rank_position: 3, score: 9.2 };
  }
  if (url.includes('/farms')) {
    return mockGranjas;
  }
  return [];
}

describe('Seleção automática de fazenda na tela de Simulação', () => {
  beforeEach(() => {
    localStorage.clear();
    salvarArmazenado(CHAVE_SESSAO, {
      id: '1',
      name: 'Produtor Teste',
      email: 'produtor@teste.com',
      role: 'user',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input) => new Response(JSON.stringify(mockApiPayload(String(input))), { status: 200 })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('ao abrir a tela de simulação, já possui a primeira fazenda selecionada automaticamente', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminEnterpriseProvider>
            <SimulacaoPage />
          </AdminEnterpriseProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const select = (await screen.findByLabelText(/Granja dos indicadores/i)) as HTMLSelectElement;

    // Aguarda carregar e selecionar automaticamente a primeira granja
    await waitFor(() => {
      expect(select.value).toBe('101');
    });

    expect(screen.getByRole('option', { name: 'Granja Ouro Verde' })).toBeTruthy();
    expect(lerArmazenado<string>(CHAVE_GRANJA_SIMULACAO)).toBe('101');
  });

  it('ao abrir a tela de simulação com fazenda salva em localStorage, restaura a seleção', async () => {
    salvarArmazenado(CHAVE_GRANJA_SIMULACAO, '102');

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminEnterpriseProvider>
            <SimulacaoPage />
          </AdminEnterpriseProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const select = (await screen.findByLabelText(/Granja dos indicadores/i)) as HTMLSelectElement;

    await waitFor(() => {
      expect(select.value).toBe('102');
    });

    expect(select.value).toBe('102');
  });

  it('permite trocar a fazenda selecionada e persiste a escolha no localStorage', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminEnterpriseProvider>
            <SimulacaoPage />
          </AdminEnterpriseProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const select = (await screen.findByLabelText(/Granja dos indicadores/i)) as HTMLSelectElement;

    await waitFor(() => {
      expect(select.value).toBe('101');
    });

    fireEvent.change(select, { target: { value: '102' } });

    expect(select.value).toBe('102');
    expect(lerArmazenado<string>(CHAVE_GRANJA_SIMULACAO)).toBe('102');
  });

  it('no modal de nova simulação, também já possui uma fazenda selecionada', async () => {
    salvarArmazenado(CHAVE_GRANJA_SIMULACAO, '102');

    render(
      <SimulacaoModal
        simulacao={null}
        onFechar={vi.fn()}
        onSalvar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const selectGranjaModal = (await screen.findByLabelText(/^Granja$/i)) as HTMLSelectElement;

    await waitFor(() => {
      expect(selectGranjaModal.value).toBe('102');
    });
  });
});
