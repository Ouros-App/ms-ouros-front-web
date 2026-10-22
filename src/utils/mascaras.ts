export const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

export function mascaraTelefone(valor: string): string{
    const digitos = apenasDigitos(valor).slice(0,11);
    if(digitos.length === 0) return '';
    if(digitos.length <= 2) return `(${digitos}`;
    if(digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if(digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function mascaraCpf(valor: string): string{
    const digitos = apenasDigitos(valor).slice(0,11);
    if(digitos.length <= 3) return digitos;
    if(digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    if(digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}