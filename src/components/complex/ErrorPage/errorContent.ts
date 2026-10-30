import type { ErrorContent } from "@/types/error.types";

export const conteudoRede: ErrorContent ={
    titulo: 'Verifique seu sinal de rede',
    descricao: 'Parece que sua conexão com a internet caiu. Verifique se o Wi-Fi ou a rede móvel estão funcionando.',
};

export const conteudoNaoEncontrada: ErrorContent ={
    titulo: 'Página Não encontrada',
    descricao: 'O endereço que você tentou acessar não existe ou foi movido. Volte para início e tente novamente',
};

export const conteudoGenerico: ErrorContent={
    titulo: 'Algo deu errado',
    descricao: 'Tivemos um problema inesperado ao carregar esta tela. Tente novamente em alguns instantes',
};