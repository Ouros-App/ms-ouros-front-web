import { useState } from 'react';
import type { Registro, RegistroErrors, RegistroNovo, RegistroValores } from '@/types/registros.types';
import { galinhasAtuais } from '@/utils/registros';
import { sanitizeText } from '@/utils/sanitizers';
import { validateRegistro } from '@/utils/validators';

const vazio: RegistroValores = {
    idLote: '',
    dataEmissao: '',
    hidrometro: '',
    custo: '',
    entraram: '',
    sairam: '',
};

function iniciais(registro: Registro | null): RegistroValores {
    if (!registro) return vazio;
    return {
        idLote: registro.idLote,
        dataEmissao: registro.dataEmissao,
        hidrometro: String(registro.hidrometro),
        custo: String(registro.custo),
        entraram: String(registro.entraram),
        sairam: String(registro.sairam),
    };
}
export function useRegistroForm(registro: Registro | null) {
    const [values, setValues] = useState<RegistroValores>(() => iniciais(registro));
    const [errors, setErrors] = useState<RegistroErrors>({});
    
    const change = (campo: keyof RegistroValores, valor: string) => {
        setValues((atual) => ({ ...atual, [campo]: valor }));
        setErrors((atual) => ({ ...atual, [campo]: undefined }));
    };
    
    const validar = (): RegistroNovo | null => {
        const encontrados = validateRegistro(values);
        setErrors(encontrados);
        
        const primeiro = (Object.keys(encontrados) as (keyof RegistroValores)[])[0];
        if (primeiro) {
            document.getElementById(`registro-${primeiro}`)?.focus();
            return null;
        }
        
        return {
            idLote: sanitizeText(values.idLote.trim()).toUpperCase(),
            dataEmissao: values.dataEmissao,
            hidrometro: Number(values.hidrometro),
            custo: Number(values.custo),
            entraram: Number(values.entraram),
            sairam: Number(values.sairam),
        };
    };
    
    const entraram = Number(values.entraram);
    const sairam = Number(values.sairam);
    const atuais = values.entraram !== '' && values.sairam !== '' && !Number.isNaN(entraram) && !Number.isNaN(sairam) ? galinhasAtuais({ entraram, sairam }): null;
    
    return { values, errors, change, validar, atuais };
}