import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '@/components/complex/Sidebar';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { obterRankingGeral, obterPodioRanking, sincronizarRanking, type RankingItem } from '@/services/rankingService';
import { isAbortError } from '@/utils/delay';
import './Ranking.css';

export default function RankingPage() {
  const { empresaSelecionada } = useAdminEnterprise();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [podio, setPodio] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregarDados = useCallback(() => {
    const controller = new AbortController();
    setCarregando(true);

    Promise.all([
      obterRankingGeral(empresaSelecionada ?? undefined, controller.signal),
      obterPodioRanking(1, controller.signal),
    ])
      .then(([itensRanking, itensPodio]) => {
        setRanking(itensRanking);
        setPodio(itensPodio);
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        console.warn('Erro ao carregar ranking:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [empresaSelecionada]);

  useEffect(() => {
    return carregarDados();
  }, [carregarDados]);

  const handleSincronizar = async () => {
    setSincronizando(true);
    setMensagem('');
    try {
      await sincronizarRanking(empresaSelecionada ?? undefined);
      setMensagem('Ranking sincronizado com sucesso no Redis!');
      carregarDados();
    } catch (err) {
      setMensagem(err instanceof Error ? err.message : 'Falha na sincronização.');
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="ranking-page">
      <Sidebar />
      <div className="ranking-page__coluna">
        <header className="ranking-page__topo">
          <div>
            <h1 className="ranking-page__titulo">Ranking de Eficiência das Granjas</h1>
            <p className="ranking-page__subtitulo">
              Classificação geral calculada pelo Índice de Eficiência Operacional (CGI)
            </p>
          </div>
          <div className="ranking-page__acoes-topo">
            <SeletorEmpresaAdm />
            <PerfilUsuario />
          </div>
        </header>

        <main className="ranking-page__conteudo">
          <div className="ranking-page__barra-acoes">
            <button
              type="button"
              className="ranking-page__btn-sync"
              disabled={sincronizando || carregando}
              onClick={handleSincronizar}
            >
              {sincronizando ? 'Sincronizando...' : '🔄 Sincronizar Rankings (Redis)'}
            </button>
            {mensagem && <span className="ranking-page__mensagem">{mensagem}</span>}
          </div>

          {podio.length > 0 && (
            <section className="ranking-podio" aria-label="Pódio de Granjas">
              <h2 className="ranking-podio__titulo">🏆 Melhores Granjas</h2>
              <div className="ranking-podio__grid">
                {podio.map((item, idx) => (
                  <div key={item.idFarm} className={`ranking-podio__card ranking-podio__card--${idx + 1}`}>
                    <div className="ranking-podio__posicao">
                      {idx === 0 ? '🥇 1º Lugar' : idx === 1 ? '🥈 2º Lugar' : '🥉 3º Lugar'}
                    </div>
                    <strong className="ranking-podio__nome">{item.farmName}</strong>
                    <div className="ranking-podio__cgi">Score CGI: {item.score.toFixed(2)}</div>
                    <span className="ranking-podio__liga">{item.league || 'Liga Ouro'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="ranking-tabela-section" aria-label="Tabela de Classificação">
            <h2 className="ranking-tabela-section__titulo">Classificação Completa</h2>
            {carregando ? (
              <p className="ranking-page__info">Carregando posições...</p>
            ) : ranking.length === 0 ? (
              <p className="ranking-page__info">Nenhuma granja ranqueada no momento.</p>
            ) : (
              <div className="ranking-tabela-wrapper">
                <table className="ranking-tabela">
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Granja</th>
                      <th>Score (CGI)</th>
                      <th>Liga</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item) => (
                      <tr key={item.idFarm}>
                        <td className="ranking-tabela__pos">#{item.rankPosition}</td>
                        <td className="ranking-tabela__nome">{item.farmName}</td>
                        <td>{item.score.toFixed(4)}</td>
                        <td><span className="ranking-tabela__liga">{item.league || 'Geral'}</span></td>
                        <td><span className="ranking-tabela__status">Ativo</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
