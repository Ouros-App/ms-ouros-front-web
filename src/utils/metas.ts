import type { MetaEstadual, ResumoMetas } from "@/types/metas.types";

export const estadosBrasil: {uf: string, nome: string, granjas: number}[] =[
    { uf: 'AC', nome: 'Acre', granjas: 12 },
    { uf: 'AL', nome: 'Alagoas', granjas: 40 },
    { uf: 'AP', nome: 'Amapá', granjas: 8 },
    { uf: 'AM', nome: 'Amazonas', granjas: 25 },
    { uf: 'BA', nome: 'Bahia', granjas: 120 },
    { uf: 'CE', nome: 'Ceará', granjas: 90 },
    { uf: 'DF', nome: 'Distrito Federal', granjas: 30 },
    { uf: 'ES', nome: 'Espírito Santo', granjas: 110 },
    { uf: 'GO', nome: 'Goiás', granjas: 180 },
    { uf: 'MA', nome: 'Maranhão', granjas: 60 },
    { uf: 'MT', nome: 'Mato Grosso', granjas: 200 },
    { uf: 'MS', nome: 'Mato Grosso do Sul', granjas: 150 },
    { uf: 'MG', nome: 'Minas Gerais', granjas: 300 },
    { uf: 'PA', nome: 'Pará', granjas: 70 },
    { uf: 'PB', nome: 'Paraíba', granjas: 45 },
    { uf: 'PR', nome: 'Paraná', granjas: 280 },
    { uf: 'PE', nome: 'Pernambuco', granjas: 85 },
    { uf: 'PI', nome: 'Piauí', granjas: 35 },
    { uf: 'RJ', nome: 'Rio de Janeiro', granjas: 95 },
    { uf: 'RN', nome: 'Rio Grande do Norte', granjas: 38 },
    { uf: 'RS', nome: 'Rio Grande do Sul', granjas: 260 },
    { uf: 'RO', nome: 'Rondônia', granjas: 50 },
    { uf: 'RR', nome: 'Roraima', granjas: 10 },
    { uf: 'SC', nome: 'Santa Catarina', granjas: 220 },
    { uf: 'SP', nome: 'São Paulo', granjas: 450 },
    { uf: 'SE', nome: 'Sergipe', granjas: 28 },
    { uf: 'TO', nome: 'Tocantins', granjas: 42 },
];

export function calcularProgresso(meta: MetaEstadual): number{
    if(meta.totalGranjas <= 0) return 0;
    return Math.round((meta.concluidos / meta.totalGranjas) * 100);
}

export function metCompleta(meta: MetaEstadual): boolean{
    return meta.totalGranjas > 0 && meta.concluidos >= meta.totalGranjas;
}

export function resumirMetas(metas: MetaEstadual[]): ResumoMetas{
    const total = metas.length;
    const concluidas = metas.filter(metCompleta).length;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);
    return {percentual, concluidas, total};
}

export function filtrarMetas(metas: MetaEstadual[], busca: string): MetaEstadual[]{
    const termo = busca.trim().toLowerCase();
    if (!termo) return metas;

    return metas.filter((meta) =>{
        const nomeEstado = estadosBrasil.find((e) => e.uf === meta.estado)?.nome ?? '';
        return(
        meta.meta.toLowerCase().includes(termo) || meta.estado.toLowerCase().includes(termo) || nomeEstado.toLowerCase().includes(termo));
    });
}