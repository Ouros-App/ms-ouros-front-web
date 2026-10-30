const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITES_BYTES = 5 * 1024 * 1024;
const LADO_MAXIMO = 480;

export class FotoInvalidaError extends Error{
    constructor(message: string){
        super(message);
        this.name = 'FotoInvalidaError';
    }
}

function carregarImagem(url: string): Promise<HTMLImageElement>{
    return new Promise((resolve, reject) => {
        const imagem = new Image();
        imagem.onload = () => resolve(imagem);
        imagem.onerror = () => reject(new FotoInvalidaError('Não foi possível ler essa imagem'));
        imagem.src = url;
    });
}

export async function prepararFoto(arquivo: File): Promise<string>{
    if(TIPOS_ACEITOS.includes(arquivo.type)){
        throw new FotoInvalidaError('Use uma imagem JPG, PNG ou WebP.');
    }
    if(arquivo.size > LIMITES_BYTES){
        throw new FotoInvalidaError('A imagem pode ter no máximo 5 MB.');
    }

    const url = URL.createObjectURL(arquivo);

    try{
        const imagem = await carregarImagem(url);
        const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.naturalWidth, imagem.naturalHeight));
        const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
        const altura = Math.max(1, Math.round(imagem.naturalWidth * escala));

        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext('2d');
        if(!contexto) throw new FotoInvalidaError('Não foi possível processar essa iamgem.');
        contexto.drawImage(imagem, 0, 0, largura, altura);
        return canvas.toDataURL('image/jpeg', 0.85);
    }
    finally{
        URL.revokeObjectURL(url);
    }
}