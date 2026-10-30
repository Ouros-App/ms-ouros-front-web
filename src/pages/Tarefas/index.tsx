import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/complex/Sidebar';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { listarGranjas } from '@/services/farmService';
import { listarTodasTarefas, type TarefaMeta } from '@/services/tarefasService';
import { isAbortError } from '@/utils/delay';
import './Tarefas.css';

export default function TarefasPage() {
  const { empresaSelecionada } = useAdminEnterprise();
  const [tarefas, setTarefas] = useState<TarefaMeta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'estadual' | 'individual'>('todas');

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);
    setTarefas([]);

    Promise.all([
      listarTodasTarefas(controller.signal),
      empresaSelecionada != null ? listarGranjas(controller.signal) : Promise.resolve([]),
    ])
      .then(([dados, granjas]) => {
        if (controller.signal.aborted) return;
        if (empresaSelecionada != null) {
          const granjasEmpresa = granjas.filter((g) => g.idEnterprise === empresaSelecionada);
          const farmIds = new Set(granjasEmpresa.map((g) => g.id));
          const regioes = new Set(granjasEmpresa.map((g) => g.regiao));
          setTarefas(
            dados.filter((t) => t.tipo === 'estadual'
              ? t.regiao != null && regioes.has(t.regiao)
              : t.idFarm != null && farmIds.has(t.idFarm)),
          );
        } else {
          setTarefas(dados);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        console.warn('Erro ao carregar tarefas:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [empresaSelecionada]);

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtroTipo === 'todas') return true;
    return t.tipo === filtroTipo;
  });

  return (
    <div className="tarefas-page">
      <Sidebar />
      <div className="tarefas-page__coluna">
        <header className="tarefas-page__topo">
          <div>
            <h1 className="tarefas-page__titulo">Metas e Tarefas Operacionais</h1>
            <p className="tarefas-page__subtitulo">
              Metas de sustentabilidade, conversão alimentar e consumo hídrico/elétrico (Figma 5998:4171)
            </p>
          </div>
          <div className="tarefas-page__acoes-topo">
            <SeletorEmpresaAdm />
            <PerfilUsuario />
          </div>
        </header>

        <main className="tarefas-page__conteudo">
          <div className="tarefas-page__filtros">
            <button
              type="button"
              className={`tarefas-page__filtro-btn ${filtroTipo === 'todas' ? 'tarefas-page__filtro-btn--ativo' : ''}`}
              onClick={() => setFiltroTipo('todas')}
            >
              Todas as Metas ({tarefas.length})
            </button>
            <button
              type="button"
              className={`tarefas-page__filtro-btn ${filtroTipo === 'estadual' ? 'tarefas-page__filtro-btn--ativo' : ''}`}
              onClick={() => setFiltroTipo('estadual')}
            >
              Metas Regionais / Estaduais
            </button>
            <button
              type="button"
              className={`tarefas-page__filtro-btn ${filtroTipo === 'individual' ? 'tarefas-page__filtro-btn--ativo' : ''}`}
              onClick={() => setFiltroTipo('individual')}
            >
              Metas por Granja
            </button>
          </div>

          {carregando ? (
            <p className="tarefas-page__info">Carregando metas operacionais...</p>
          ) : tarefasFiltradas.length === 0 ? (
            <p className="tarefas-page__info">Nenhuma meta encontrada.</p>
          ) : (
            <div className="tarefas-page__grid">
              {tarefasFiltradas.map((t) => (
                <div key={`${t.tipo}-${t.id}`} className="tarefa-card">
                  <div className="tarefa-card__header">
                    <span className={`tarefa-card__badge tarefa-card__badge--${t.tipo}`}>
                      {t.tipo === 'estadual' ? `Estadual ${t.regiao ? `(${t.regiao})` : ''}` : `Granja #${t.idFarm ?? ''}`}
                    </span>
                    <span className="tarefa-card__status">{t.status || 'Em Andamento'}</span>
                  </div>
                  <h3 className="tarefa-card__titulo">{t.titulo}</h3>
                  <p className="tarefa-card__descricao">{t.descricao || 'Sem descrição cadastrada.'}</p>
                  <div className="tarefa-card__meta-valor">
                    <span>Métrica: <strong>{t.metrica}</strong></span>
                    <span>Alvo: <strong>{t.valorAlvo}</strong></span>
                  </div>
                  {t.dataFim && (
                    <div className="tarefa-card__prazo">
                      Prazo: {new Date(t.dataFim).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
