import { createContext, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { listarEmpresas, type EnterpriseOption } from '@/services/enterpriseService';

interface AdminEnterpriseContextValue {
  empresas: EnterpriseOption[];
  empresaSelecionada: number | null; // null = Visão Global
  setEmpresaSelecionada: (id: number | null) => void;
  carregando: boolean;
}

const AdminEnterpriseContext = createContext<AdminEnterpriseContextValue>({
  empresas: [],
  empresaSelecionada: null,
  setEmpresaSelecionada: () => {},
  carregando: false,
});

export function AdminEnterpriseProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<EnterpriseOption[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.accountType !== 'admin') {
      setEmpresas([]);
      setEmpresaSelecionada(null);
      return;
    }

    const controller = new AbortController();
    setCarregando(true);

    listarEmpresas(controller.signal)
      .then((lista) => {
        setEmpresas(lista);
      })
      .catch((err) => {
        console.warn('Não foi possível carregar empresas para ADM:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [user]);

  return (
    <AdminEnterpriseContext.Provider
      value={{ empresas, empresaSelecionada, setEmpresaSelecionada, carregando }}
    >
      {children}
    </AdminEnterpriseContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminEnterprise() {
  return useContext(AdminEnterpriseContext);
}
