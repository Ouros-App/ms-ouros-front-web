import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { useAuth } from '@/hooks/useAuth';
import './SeletorEmpresaAdm.css';

export function SeletorEmpresaAdm() {
  const { user } = useAuth();
  const { empresas, empresaSelecionada, setEmpresaSelecionada, carregando } = useAdminEnterprise();

  if (user?.role !== 'admin' && user?.accountType !== 'admin') {
    return null;
  }

  return (
    <div className="seletor-empresa-adm">
      <label htmlFor="admin-enterprise-select" className="seletor-empresa-adm__label">
        🏢 Contexto Integradora:
      </label>
      <select
        id="admin-enterprise-select"
        className="seletor-empresa-adm__select"
        value={empresaSelecionada ?? ''}
        disabled={carregando}
        onChange={(e) => {
          const val = e.target.value;
          setEmpresaSelecionada(val ? Number(val) : null);
        }}
      >
        <option value="">🌐 Visão Global (Todas as Empresas)</option>
        {empresas.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name} {emp.documentNumber ? `(${emp.documentNumber})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
