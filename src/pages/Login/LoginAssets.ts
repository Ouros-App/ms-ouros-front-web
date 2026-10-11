const arquivos = import.meta.glob('src/assets/*',{
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, string>;

function buscarImagem(nome: string) : string | undefined{
    const padrao = new RegExp(`/${nome}\\.(png|jpe?g|webp|svg)$`, 'i');
    return Object.entries(arquivos).find(([caminho]) => padrao.test(caminho))?.[1]
}

export const efeitoEsquerdo = buscarImagem('efeito-dourado-esquerdo');
export const efeitoDireito = buscarImagem('efeito-dourado-direito');
export const mascote = buscarImagem('midas-pintinho-login');
export const logo = buscarImagem('logo-ouros');