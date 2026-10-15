import { STORAGE_VERSION } from './constants';

interface Envelope<T> {
    _versao: string;
    dados: T;
}
export function lerArmazenado<T>(chave: string): T | null{
    try {
        const bruto = localStorage.getItem(chave);
        if (!bruto) return null;
        const envelope = JSON.parse(bruto) as Envelope<T>;
        if (envelope._versao !== STORAGE_VERSION) {
            localStorage.removeItem(chave);
            return null;
        }
        return envelope.dados;
    } 
    catch{
        return null;
    }
}

export function salvarArmazenado<T>(chave: string, dados: T): void{
    try {
        const envelope: Envelope<T> = { _versao: STORAGE_VERSION, dados };
        localStorage.setItem(chave, JSON.stringify(envelope));
    } 
    catch {
        return;
    }
}

export function removerArmazenado(chave: string): void{
    try{
        localStorage.removeItem(chave);
    } 
    catch{
        return;
    }
}