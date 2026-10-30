import type { CampoOrdenacao, Registro } from '@/types/registros.types';

export const galinhasAtuais = (registro: Pick<Registro, 'entraram' | 'sairam'>) =>
    registro.entraram - registro.sairam;

function valorDoCampo(registro: Registro, campo: Exclude<CampoOrdenacao, 'padrao'>): number{
    return campo === 'atuais' ? galinhasAtuais(registro) : registro[campo];
}

export function filtrarEOrdenar(registros: Registro[], busca: string, ordenacao: CampoOrdenacao): Registro[]{
    const termo = busca.trim().toLowerCase();
    const filtrados = termo ? registros.filter((r) => r.idLote.toLowerCase().includes(termo)) :registros;
    if (ordenacao === 'padrao') return filtrados;
    return [...filtrados].sort((a, b) => valorDoCampo(b, ordenacao) - valorDoCampo(a, ordenacao));
}

export const opcoesOrdenacao: { valor: CampoOrdenacao; rotulo: string }[] =[
    {valor: 'padrao', rotulo: 'Ordenar por'},
    {valor: 'hidrometro', rotulo: 'Hidrômetro (maior para menor)'},
    {valor: 'custo', rotulo: 'Custo do lote (maior para menor)'},
    {valor: 'entraram', rotulo: 'Galinhas que entraram (maior para menor)'},
    {valor: 'sairam', rotulo: 'Galinhas que saíram (maior para menor)'},
    {valor: 'atuais', rotulo: 'Galinhas atuais (maior para menor)'},
];