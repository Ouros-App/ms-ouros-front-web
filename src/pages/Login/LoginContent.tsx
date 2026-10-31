import type {ReactNode} from 'react';

interface Destaque{
    icon: ReactNode;
    title: string;
    text: string;
}

const svgProps= {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#e0a82e',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
} as const;

export const destaques: Destaque[] = [
    {
        icon: (
            <svg {...svgProps}>
                <path d="M12 3c3.5 4.2 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 8.5 7.2 12 3Z" />
                <path d="M9.5 14.5a2.5 2.5 0 0 0 2.2 2" />
            </svg>
        ),
        title: 'Registros',
        text: 'Acompanhe o histórico de água e energia.',
    },
    {
        icon: (
            <svg {...svgProps}>
            <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
            <path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3" />
            <path d="M12 13v4M9 20h6M10 17h4" />
            </svg>
        ),
        title: 'Ranking',
        text: 'Compare o desempenho da sua granja com outras.',
    },
    {
        icon: (
            <svg {...svgProps}>
            <path d="M4 4v16h16" />
            <path d="M8 15l3-4 3 2 4-6" />
            </svg>
        ),
        title: 'Dashboards',
        text: 'Visualize indicadores de consumo e desempenho.',
    },
];
