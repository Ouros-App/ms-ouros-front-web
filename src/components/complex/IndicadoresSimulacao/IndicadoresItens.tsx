import { IndicadoresSimulacao } from "@/types/simulacoes.types";
import { formatarNumero } from "@/utils/formato";
import React from "react";

const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
};

interface ItemIndicador{
    chave: keyof IndicadoresSimulacao;
    rotulo: string;
    icone: React.ReactNode;
    formatar: (valor: number) => string;
}

export const ItensIndicadores: ItemIndicador[] = [
    {
        chave: 'consumo',
        rotulo: 'Consumo',
        formatar: formatarNumero,
        icone: (
            <svg {...props}>
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
            </svg>
        ),
    },
    {
        chave: 'kwhPorAve',
        rotulo: 'KWh/Ave',
        formatar: formatarNumero,
        icone: (
            <svg {...props}>
                <circle cx="15" cy="9" r="5" />
                <path d="m11.5 12.5-7 7M7 17l2 2" />
            </svg>
        ),
    },
    {
        chave: 'litrosPorAve',
        rotulo: 'L/Ave',
        formatar: formatarNumero,
        icone: (
            <svg {...props}>
                <circle cx="15" cy="9" r="5" />
                <path d="m11.5 12.5-7 7M7 17l2 2" />
            </svg>
        ),
    },
    {
        chave: 'posicao',
        rotulo: 'Posição',
        formatar: formatarNumero,
        icone: (
            <svg {...props}>
                <path d="M4 21v-6M10 21v-10M16 21v-8" />
                <path d="m18 3 .9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3L18 3Z" />
            </svg>
        ),
    },
];