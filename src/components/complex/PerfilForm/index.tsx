import { useState } from 'react';
import type { FormEvent } from 'react';
import { CampoPerfil } from '@/components/complex/CampoPerfil';
import type { PerfilFormProps } from '@/types/perfil.types';
import { isAbortError } from '@/utils/delay';
import { mascaraCpf } from '@/utils/mascaras';
import { LIMITES } from '@/utils/validators';
import { usePerfilForm } from './usePerfilForm';
import './PerfilForm.css';

export function PerfilForm({ perfil, onSalvar, onSair }: PerfilFormProps) {
    const { values, errors, change, validar, limparSenha } = usePerfilForm(perfil);
    const [enviando, setEnviando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [falha, setFalha] = useState('');
    const [sucesso, setSucesso] = useState('');

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setSucesso('');
        
        const dados = validar();
        if (!dados) return;
        setEnviando(true);
        setFalha('');
        
        try{
            await onSalvar(dados);
            limparSenha();
            setMostrarSenha(false);
            setSucesso('Perfil atualizado com sucesso.');
        } 
        catch (error){
            if (isAbortError(error)) return;
            setFalha(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
        } 
        finally{
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
            <CampoPerfil id="perfil-nome" rotulo="Nome" value={values.nome} onChange={(valor) => change('nome', valor)} erro={errors.nome} autoComplete="name" maxLength={80} desabilitado={enviando}/>
            <CampoPerfil id="perfil-email" rotulo="Email" tipo="email" value={perfil.email} somenteLeitura />
            
            <div className="perfil-form__dupla">
                <CampoPerfil id="perfil-cpf" rotulo="CPF" value={mascaraCpf(perfil.cpf)} somenteLeitura />
                <CampoPerfil id="perfil-telefone" rotulo="Telefone" tipo="tel" value={values.telefone} onChange={(valor) => change('telefone', valor)} erro={errors.telefone} autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" maxLength={15} desabilitado={enviando} />
            </div>
            
            <CampoPerfil
            id="perfil-senha"
            rotulo="Senha"
            tipo={mostrarSenha ? 'text' : 'password'}
            value={values.senha}
            onChange={(valor) => change('senha', valor)}
            erro={errors.senha}
            ajuda="Deixe em branco para manter a senha atual."
            placeholder="••••••••••"
            autoComplete="new-password"
            maxLength={LIMITES.senhaMax}
            desabilitado={enviando}
            acao={
                <button type="button" className="perfil-form__olho" onClick={() => setMostrarSenha((atual) => !atual)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        {mostrarSenha ? (
                            <>
                            <path d="M3 3l18 18" />
                            <path d="M10.6 6.1A10.5 10.5 0 0 1 12 6c5.5 0 9 6 9 6a16 16 0 0 1-3.2 3.9M6.6 7.6A15.7 15.7 0 0 0 3 12s3.5 6 9 6a9.6 9.6 0 0 0 4.1-.9" />
                            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                            </>
                        ) : (
                        <>
                        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                        <circle cx="12" cy="12" r="3" />
                        </>
                        )}
                    </svg>
                </button>
            }
            />
            
            {falha && (
                <p className="perfil-form__falha" role="alert">
                    {falha}
                </p>
            )}
            
            <p className="perfil-form__sucesso" role="status" aria-live="polite">
                {sucesso}
            </p>
            
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