import type { SidebarItem } from "@/types/sidebar.types";

const props ={
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

export const ItensPrincipais: SidebarItem[] = [
    {
        rotulo: 'Dashboards',
        caminho: '/dashboards',
        icone: (
            <svg {...props}>
                <path d="M3 3v18h18" />
                <path d="m7 15 4-5 3 3 5-7" />
            </svg>
        ),
    },
    {
        rotulo: 'Ranking',
        caminho: '/ranking',
        icone: (
            <svg {...props}>
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
                <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
            </svg>
        ),
    },
    {
        rotulo: 'Simulação',
        caminho: '/simulacao',
        icone: (
            <svg {...props}>
                <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
            </svg>
        ),
    },
    {
        rotulo: 'Registros',
        caminho: '/registros',
        icone: (
            <svg {...props}>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
            </svg>
        ),
    },
    {
        rotulo: 'Tarefas',
        caminho: '/tarefas',
        icone: (
            <svg {...props}>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 3 3 5-6" />
            </svg>
        ),
    },
];

export const itemConfiguracoes: SidebarItem = {
    rotulo: 'Configurações',
    caminho: '/perfil',
    icone: (
    <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
    ),
};

export const iconeSair = (
    <svg {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
);