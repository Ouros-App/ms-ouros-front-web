const arquivos = import.meta.glob('/src/assets/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function buscarImagem(nome: string): string | undefined {
    const padrao = new RegExp(`/${nome}\\.(png|jpe?g|webp|svg)$`, 'i');
    return Object.entries(arquivos).find(([caminho]) => padrao.test(caminho))?.[1];
}

export const asaFundo = buscarImagem('asa-fundo');