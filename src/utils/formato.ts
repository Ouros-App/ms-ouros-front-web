const moeda = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const numero = new Intl.NumberFormat('pt-BR');
const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarNumero = (valor: number) => numero.format(valor);
export const formatarDecimal = (valor: number) => decimal.format(valor);

export function formatarData(iso: string): string{
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string): string{
    const [data, hora = '00:00'] = iso.split('T');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} | ${hora.slice(0, 5)}`;
}