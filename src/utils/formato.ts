const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR');
const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarNumero = (valor: number) => numero.format(valor);
export const formatarDecimal = (valor: number) => decimal.format(valor);

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string): string {
  const [data, hora = '00:00'] = iso.split('T');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} | ${hora.slice(0, 5)}`;
}

export function formatarValorAbreviado(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(0)}k`;
  }
  return `R$ ${valor.toFixed(0)}`;
}

export const MESES_ABREV = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export function formatarMes(isoOuMes: string): string {
  if (!isoOuMes) return '';
  const partes = isoOuMes.split('-');
  if (partes.length >= 2) {
    const mesIdx = Number.parseInt(partes[1], 10) - 1;
    if (mesIdx >= 0 && mesIdx < 12) {
      return MESES_ABREV[mesIdx];
    }
  }
  return isoOuMes;
}

export function formatarDataHora(iso: string): string{
    const [data, hora = '00:00'] = iso.split('T');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} | ${hora.slice(0, 5)}`;
}
