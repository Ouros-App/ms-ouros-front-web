import type { CampoOrdenacaoSimulacao, Simulacao } from "@/types/simulacoes.types";


export function filtrarEOrdenarSimulacoes(
    simulacoes: Simulacao[],
    busca: string,
    ordenacao: CampoOrdenacaoSimulacao,
): Simulacao[]{
    const termo = busca.trim().toLowerCase();
    const filtradas = termo ? simulacoes.filter((s) => s.idLote.toLowerCase().includes(termo)):simulacoes;

    if (ordenacao === 'padrao') return filtradas;

    return [...filtradas].sort((a,b) => b[ordenacao] - a[ordenacao])
}

export const opcoesOrdenacaoSimulacao: {valor: CampoOrdenacaoSimulacao; rotulo: string}[] = [
    {valor: 'padrao', rotulo: 'Ordenar por'},
    {valor: 'consumoAtual', rotulo: 'Consumo atual (maior para menor)'},
    {valor: 'consumoAlvo', rotulo: 'Consumo alvo (maior para menor)'},
    {valor: 'precoAgua', rotulo: 'Preço por m³ da água (maior para menor)'},
    {valor: 'precoEnergia', rotulo: 'Preço da energia (maior para menor)'},
    {valor: 'quantidadeAves', rotulo: 'Quantidade de aves (maior para menor)'},
    {valor: 'gastoAlvoEnergia', rotulo: 'Gasto alvo de energia por ave (maior para menor)'},
];