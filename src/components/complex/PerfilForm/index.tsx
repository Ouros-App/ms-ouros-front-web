import { useState } from 'react';
import type { FormEvent } from 'react';
import { CampoPerfil } from '@/components/complex/CampoPerfil';
import type { PerfilFormProps } from '@/types/perfil.types';
import { isAbortError } from '@/utils/delay';
import { mascaraCpf } from '@/utils/mascaras';
import { usePerfilForm } from './usePerfilForm';
import './PerfilForm.css';

export function PerfilForm({ perfil, onSalvar, onSair, onTrocarSenha }: Readonly<PerfilFormProps>) {
    const { values, errors, change, validar } = usePerfilForm(perfil);
    const [enviando, setEnviando] = useState(false);
    const [falha, setFalha] = useState('');
    const [sucesso, setSucesso] = useState('');

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setSucesso('');

        const dados = validar();
        if (!dados) return;
        setEnviando(true);
        setFalha('');

        try {
            await onSalvar(dados);
            setSucesso('Perfil atualizado com sucesso.');
        } catch (error) {
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="perfil-form" aria-labelledby="perfil-form-titulo">
            <h2 id="perfil-form-titulo" className="perfil-form__titulo">
                <span>Dados Pessoais</span>
                <span className="perfil-form__linha" aria-hidden="true" />
            </h2>

            <form className="perfil-form__corpo" onSubmit={enviar} noValidate>
                <CampoPerfil
                    id="perfil-nome"
                    rotulo="Nome"
                    value={values.nome}
                    onChange={(valor) => change('nome', valor)}
                    erro={errors.nome}
                    autoComplete="name"
                    maxLength={80}
                    desabilitado={enviando}
                />
                <CampoPerfil
                    id="perfil-email"
                    somenteLeitura
                    rotulo="Email"
                    tipo="email"
                    value={values.email}
                    onChange={(valor) => change('email', valor)}
                    erro={errors.email}
                    autoComplete="email"
                    maxLength={120}
                    desabilitado={enviando}
                />

                <div className="perfil-form__dupla">
                    <CampoPerfil id="perfil-cpf" rotulo="CPF" value={mascaraCpf(perfil.cpf)} somenteLeitura />
                    <CampoPerfil
                        id="perfil-telefone"
                        rotulo="Telefone"
                        tipo="tel"
                        value={values.telefone}
                        onChange={(valor) => change('telefone', valor)}
                        erro={errors.telefone}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        desabilitado={enviando}
                    />
                </div>

                <fieldset className="perfil-form__senha-box">
                    <legend>Senha</legend>
                    
                    <div className="perfil-form__senha-conteudo">
                        <span className="perfil-form__senha-mascara" aria-label="Senha oculta" >
                            ••••••••••••
                        </span>
                        
                        {onTrocarSenha && (
                            <button
                            type="button"
                            className="perfil-form__trocar-senha"
                            onClick={onTrocarSenha}
                            disabled={enviando}
                            >
                                Alterar senha
                            </button>
                        )}
                    </div>
                </fieldset>

                {falha && (
                    <p className="perfil-form__falha" role="alert">
                        {falha}
                    </p>
                )}

                {sucesso && (
                    <p className="perfil-form__sucesso" role="status" aria-live="polite">
                        {sucesso}
                    </p>
                )}

                <button type="submit" className="perfil-form__salvar" disabled={enviando}>
                    {enviando ? 'Salvando...' : 'Salvar'}
                </button>
            </form>

            <p className="perfil-form__sair">
                Cansou do Midas?{' '}
                <button type="button" className="perfil-form__sair-link" onClick={onSair}>
                    Sair da conta
                </button>
            </p>
        </section>
    );
}
