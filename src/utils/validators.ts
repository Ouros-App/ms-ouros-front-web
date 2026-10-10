import type { LoginErrors, LoginValues} from "@/types/auth.types";

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