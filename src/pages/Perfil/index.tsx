import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorPage } from '@/components/complex/ErrorPage';
import { PasswordResetFlow } from '@/components/complex/PasswordResetFlow';
import { PerfilForm } from '@/components/complex/PerfilForm';
import { PerfilFoto } from '@/components/complex/PerfilFoto';
import { Sidebar } from '@/components/complex/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { usePerfil } from '@/hooks/usePerfil';
import { usePerfilFoto } from '@/hooks/usePerfilFoto';
import type { PerfilDadosFormulario } from '@/types/perfil.types';
import { asaFundo } from '../Simulacao/simulacaoAssets';
import './Perfil.css';

export default function PerfilPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { perfil, status, mensagemErro, recarregar, salvar } = usePerfil();
    const foto = usePerfilFoto(perfil?.avatarUrl ?? null);
    const [redefinindoSenha, setRedefinindoSenha] = useState(false);
    const [avisoSenha, setAvisoSenha] = useState('');

    useEffect(() => {
        if (!redefinindoSenha) return;
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setRedefinindoSenha(false);
        };
        window.addEventListener('keydown', aoTeclar);
        return () => window.removeEventListener('keydown', aoTeclar);
    }, [redefinindoSenha]);

    const salvarPerfil = useCallback(
        async (dados: PerfilDadosFormulario) => {
            const fotoFinal = await foto.obterFotoFinal();
            await salvar({ ...dados, avatarUrl: fotoFinal });
            foto.reiniciar();
        },
        [salvar, foto],
    );

    const sair = useCallback(() => {
        logout();
        void navigate('/login', { replace: true });
    }, [logout, navigate]);

    if (status === 'erro') {
        return <ErrorPage titulo="Não foi possível carregar o perfil" descricao={mensagemErro} onTentarNovamente={recarregar} />;
    }

    if (status === 'pronto' && !perfil) {
        return <ErrorPage titulo="Perfil não encontrado" descricao="Não encontramos os dados da sua conta. Entre novamente para continuar." />;
    }

    return (
        <div className="perfil-page">
            <a href="#conteudo-principal" className="perfil-page__pular">
                Pular para o conteúdo
            </a>
            <Sidebar />

            <div className="perfil-page__coluna">
                {asaFundo && <img src={asaFundo} alt="" className="perfil-page__fundo" />}

                <header className="perfil-page__topo">
                    <h1 className="perfil-page__titulo">Perfil - Informações pessoais</h1>
                    <p className="perfil-page__subtitulo">Altere suas informações quando necessário</p>
                    {avisoSenha && (
                        <div className="perfil-page__aviso-sucesso" role="status" aria-live="polite">
                            <span>{avisoSenha}</span>
                            <button
                                type="button"
                                className="perfil-page__aviso-fechar"
                                onClick={() => setAvisoSenha('')}
                                aria-label="Fechar aviso"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </header>

                <main id="conteudo-principal" className="perfil-page__conteudo" tabIndex={-1}>
                    {status === 'carregando' || !perfil ? (
                        <p className="perfil-page__estado" role="status">
                            Carregando perfil...
                        </p>
                    ) : (
                        <div className="perfil-page__grade">
                            <PerfilFoto
                                nome={perfil.nome}
                                foto={foto.foto}
                                erro={foto.erro}
                                processando={foto.processando}
                                onEscolher={foto.escolher}
                                onRemover={foto.remover}
                            />
                            <span className="perfil-page__divisor" aria-hidden="true" />
                            <PerfilForm
                                perfil={perfil}
                                onSalvar={salvarPerfil}
                                onSair={sair}
                                onTrocarSenha={() => {
                                    setAvisoSenha('');
                                    setRedefinindoSenha(true);
                                }}
                            />
                        </div>
                    )}
                </main>
            </div>

            {redefinindoSenha && perfil && (
                <div
                    className="perfil-page__modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reset-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setRedefinindoSenha(false);
                    }}
                >
                    <div className="perfil-page__modal-conteudo">
                        <PasswordResetFlow
                            initialEmail={perfil.email}
                            onClose={() => setRedefinindoSenha(false)}
                            onSuccess={() => {
                                setRedefinindoSenha(false);
                                setAvisoSenha('Senha alterada com sucesso.');
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
