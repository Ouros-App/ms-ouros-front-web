import { useState } from 'react';
import type { Registro, RegistroErrors, RegistroNovo, RegistroValores } from '@/types/registros.types';
import { galinhasAtuais } from '@/utils/registros';
import { sanitizeText } from '@/utils/sanitizers';
import { validateRegistro } from '@/utils/validators';

const vazio: RegistroValores = {
    idLote: 'AUTO',
    dataEmissao: '',
    hidrometro: '0',
    custo: '0',
    entraram: '',
    sairam: '0',
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
    const isEdicao = Boolean(registro);
    const [values, setValues] = useState<RegistroValores>(() => iniciais(registro));
    const [errors, setErrors] = useState<RegistroErrors>({});
    
    const change = (campo: keyof RegistroValores, valor: string) => {
        setValues((atual) => ({ ...atual, [campo]: valor }));
        setErrors((atual) => ({ ...atual, [campo]: undefined }));
    };
    
    const validar = (): RegistroNovo | null => {
        const encontrados = validateRegistro(values, isEdicao);
        setErrors(encontrados);
        
        const primeiro = (Object.keys(encontrados) as (keyof RegistroValores)[])[0];
        if (primeiro) {
            document.getElementById(`registro-${primeiro}`)?.focus();
            return null;
        }

        const sairamCalculado = isEdicao ? Number(values.sairam) : 0;
        const hidrometroCalculado = isEdicao ? Number(values.hidrometro) : 0;
        
        return {
            idLote: sanitizeText(values.idLote.trim()).toUpperCase(),
            dataEmissao: values.dataEmissao,
            hidrometro: Number.isNaN(hidrometroCalculado) ? 0 : hidrometroCalculado,
            custo: Number(values.custo) || 0,
            entraram: Number(values.entraram),
            sairam: Number.isNaN(sairamCalculado) ? 0 : sairamCalculado,
        };
    };
    
    const entraram = Number(values.entraram);
    const sairam = isEdicao ? Number(values.sairam) : 0;
    const atuais = values.entraram !== '' && !Number.isNaN(entraram) && entraram >= 0
        ? galinhasAtuais({ entraram, sairam: Number.isNaN(sairam) ? 0 : sairam })
        : null;
    
    return { values, errors, change, validar, atuais };
}
