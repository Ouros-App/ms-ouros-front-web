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
    <div className="seletor-empresa-adm" aria-label="Seletor de contexto de empresa para administradores">
      <label htmlFor="admin-enterprise-select" className="seletor-empresa-adm__rotulo">
        <span className="seletor-empresa-adm__texto">Empresa:</span>
      </label>

      <div className="seletor-empresa-adm__select-wrapper">
        <select
          id="admin-enterprise-select"
          className="seletor-empresa-adm__select"
          value={empresaSelecionada ?? ''}
          disabled={carregando}
          onChange={(e) => {
            const val = e.target.value;
            setEmpresaSelecionada(val ? Number(val) : null);
          }}
          aria-label="Selecionar integradora ou visão global"
        >
          <option value="">Visão Global (Todas as Empresas)</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        <svg
          className="seletor-empresa-adm__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
