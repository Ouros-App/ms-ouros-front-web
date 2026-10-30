import { useState } from 'react';
import type { Perfil, PerfilDadosFormulario, PerfilErros, PerfilValores } from '@/types/perfil.types';
import { mascaraTelefone } from '@/utils/mascaras';
import { validatePerfil } from '@/utils/perfilValidators';
import { sanitizeText } from '@/utils/sanitizers';

function iniciais(perfil: Perfil): PerfilValores {
    return {
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone,
        senha: '',
    };
}

export function usePerfilForm(perfil: Perfil){
    const [values, setValues] = useState<PerfilValores>(() => iniciais(perfil));
    const [errors, setErrors] = useState<PerfilErros>({});
    const change = (campo: keyof PerfilValores, valor: string) => {
    const tratado = campo === 'telefone' ? mascaraTelefone(valor) : valor;
    setValues((atual) => ({ ...atual, [campo]: tratado }));
    setErrors((atual) => ({ ...atual, [campo]: undefined }));
};

const validar = (): PerfilDadosFormulario | null => {
    const encontrados = validatePerfil(values);
    setErrors(encontrados);
    
    const primeiro = (Object.keys(encontrados) as (keyof PerfilValores)[])[0];
    if (primeiro){
        document.getElementById(`perfil-${primeiro}`)?.focus();
        return null;
    }
    
    return{
        nome: sanitizeText(values.nome.trim()),
        email: values.email.trim().toLowerCase(),
        telefone: mascaraTelefone(values.telefone),
        novaSenha: values.senha,
    };
};

const limparSenha = () => setValues((atual) => ({ ...atual, senha: '' }));
return { values, errors, change, validar, limparSenha };
}