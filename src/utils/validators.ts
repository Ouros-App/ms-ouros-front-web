import type { LoginErrors, LoginValues} from "@/types/auth.types";
import type { RegistroErrors, RegistroValores } from "@/types/registros.types";

export const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
export const isRequired = (v: string) => v.trim().length > 0;

export const LIMITES = {
    emailMax: 120,
    senhaMin: 6,
    senhaMax: 67,
} as const;

export function validateLogin(values: LoginValues): LoginErrors{
    const errors: LoginErrors = {};
    const email = values.email.trim();

    if(!isRequired(email)) {
        errors.email = "Informe seu e-mail";
    }
    else if(email.length > LIMITES.emailMax){
        errors.email = `O e-mail pode ter no máximo ${LIMITES.emailMax} caracteres`;
    }
    else if(!isEmail(email)){
        errors.email = "Digite um e-mail válido como nome@empresa.com";
    }

    if(values.password.length === 0){
        errors.password = "Informe sua senha";
    }
    else if(values.password.length < LIMITES.senhaMin){
        errors.password = `A senha pode ter no mínimo ${LIMITES.senhaMin} caracteres`;
    }
    else if(values.password.length > LIMITES.senhaMax){
        errors.password = `A senha pode ter no máximo ${LIMITES.senhaMax} caracteres`;
    }
    return errors;
}

export const LIMITES_REGISTRO = {
    idLoteMax: 20,
} as const;

export function validateRegistro(values: RegistroValores): RegistroErrors{
    const errors: RegistroErrors = {};
    const idLote = values.idLote.trim();
    if(!isRequired(idLote)){
        errors.idLote = 'Informe o id do lote.';
    }
    else if(idLote.length > LIMITES_REGISTRO.idLoteMax){
        errors.idLote = `O id pode ter no máximo ${LIMITES_REGISTRO.idLoteMax} caracteres.`;
    }
    else if(!/^[A-Za-z0-9-]+$/.test(idLote)){
        errors.idLote = 'Use apenas letras, números e hífen.';
    }

    if(!isRequired(values.dataEmissao) || Number.isNaN(Date.parse(values.dataEmissao))){
        errors.dataEmissao = 'Informe uma data de emissão válida';
    }

    const entraram = Number(values.entraram);
        if (!isRequired(values.entraram) || !Number.isInteger(entraram) || entraram < 0){
        errors.entraram = 'Informe um número inteiro de galinhas (0 ou mais).';
    }

    const sairam = Number(values.sairam);
    if (!isRequired(values.sairam) || !Number.isInteger(sairam) || sairam < 0){
        errors.sairam = 'Informa um número inteiro de galinhas (0 ou mais).';
    }
    return errors;
}