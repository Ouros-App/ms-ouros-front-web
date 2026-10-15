const moeda = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const numero = new Intl.NumberFormat('pt-BR');

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarNumero = (valor: number) => numero.format(valor);

export function formatarData(iso: string): string{
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}