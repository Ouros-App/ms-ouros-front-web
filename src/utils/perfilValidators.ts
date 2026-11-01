import type { PerfilErros, PerfilValores } from '@/types/perfil.types';
import { apenasDigitos } from './mascaras';
import { isRequired } from './validators';

export const LIMITES_PERFIL = {
    nomeMin: 3,
    nomeMax: 80,
} as const;

export function validatePerfil(values: PerfilValores): PerfilErros {
    const errors: PerfilErros = {};
    const nome = values.nome.trim();
    
    if (!isRequired(nome)) {
        errors.nome = 'Informe seu nome.';
    } else if (nome.length < LIMITES_PERFIL.nomeMin) {
        errors.nome = `O nome deve ter pelo menos ${LIMITES_PERFIL.nomeMin} caracteres.`;
    } else if (nome.length > LIMITES_PERFIL.nomeMax) {
        errors.nome = `O nome pode ter no máximo ${LIMITES_PERFIL.nomeMax} caracteres.`;
    } else if (!/^\p{L}[\p{L} '.-]*$/u.test(nome)) {
        errors.nome = 'Use apenas letras, espaços, apóstrofo, ponto e hífen.';
    }

    const email = values.email.trim();
    if (!email) {
        errors.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Informe um e-mail válido.';
    }
    
    const digitosTelefone = apenasDigitos(values.telefone);
    if (isRequired(values.telefone) && (digitosTelefone.length < 10 || digitosTelefone.length > 13)) {
        errors.telefone = 'Digite um telefone com DDD, como (11) 99925-1812.';
    }

    if (values.senha && values.senha.length > 0) {
        if (values.senha.length < 8) {
            errors.senha = 'A senha deve ter pelo menos 8 caracteres.';
        } else if (values.senha.length > 20) {
            errors.senha = 'A senha pode ter no máximo 20 caracteres.';
        }
    }
    
    return errors;
}
