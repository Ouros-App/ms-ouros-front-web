import type{ CampoOrdenacaoRanking, LigaId, LigaInfo, Participante, ParticipanteRanking} from '@/types/ranking.types';

export const ligas: LigaInfo[] = [
    { id: 'ouro', nome: 'Ouro', descricao: 'Os 15% de integrados com o menor consumo e maior EGI.', cor: '#deab55' },
    { id: 'prata', nome: 'Prata', descricao: 'Os 20% seguintes, que também apresentam ótimo desempenho.', cor: '#b8bcc6' },
    { id: 'bronze', nome: 'Bronze', descricao: 'Os 30% com consumo equilibrado e dentro da média geral.', cor: '#c9835a' },
    { id: 'cobre', nome: 'Cobre', descricao: 'Os 20% seguintes, abaixo da média, mas com potencial de melhora.', cor: '#e8844a' },
    { id: 'ferro', nome: 'Ferro', descricao: 'Os 15% com maior consumo, nossa principal prioridade.', cor: '#8e86c9' },
];

export const opcoesOrdenacaoRanking: { valor: CampoOrdenacaoRanking; rotulo: string }[] = [
    { valor: 'padrao', rotulo: 'Ordenar por' },
    { valor: 'nome', rotulo: 'Participante (A a Z)' },
    { valor: 'pontuacao', rotulo: 'Pontuação (menor para maior)' },
];

export function ligaPorId(id: LigaId): LigaInfo{
    return ligas.find((liga) => liga.id === id) ?? ligas[ligas.length - 1];
}

export function ligaDaPosicao(indice: number, total: number): LigaId{
    const fracao = indice / total;
    if (fracao < 0.15) return 'ouro';
    if (fracao < 0.35) return 'prata';
    if (fracao < 0.65) return 'bronze';
    if (fracao < 0.85) return 'cobre';
    return 'ferro';
}

export function classificar(participantes: Participante[]): ParticipanteRanking[]{
    const ordenados = [...participantes].sort((a, b) => b.pontuacao - a.pontuacao);
    const total = ordenados.length;
    let posicaoAnterior = 0;
    
    return ordenados.map((participante, indice) =>{
        const empatado = indice > 0 && ordenados[indice - 1].pontuacao === participante.pontuacao;
        const posicao = empatado ? posicaoAnterior : indice + 1;
        posicaoAnterior = posicao;
        return { ...participante, posicao, liga: ligaDaPosicao(posicao - 1, total) };
    });
}

export function filtrarEOrdenarRanking(
    participantes: ParticipanteRanking[],
    busca: string,
    ordenacao: CampoOrdenacaoRanking,
): ParticipanteRanking[]{
    const termo = busca.trim().toLowerCase();
    const filtrados = termo ? participantes.filter((p) => p.nome.toLowerCase().includes(termo)) : participantes;
    
    if (ordenacao === 'nome') return [...filtrados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (ordenacao === 'pontuacao') return [...filtrados].sort((a, b) => a.pontuacao - b.pontuacao);
    return filtrados;
}