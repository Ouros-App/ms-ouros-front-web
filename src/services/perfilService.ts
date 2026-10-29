import type { Perfil, PerfilAtualizacao } from '@/types/perfil.types';
import { isAbortError } from '@/utils/delay';
import { apenasDigitos } from '@/utils/mascaras';
import { ServiceError } from './authService';
import { springRequest } from './springClient';

interface CompanyEmployeeResponse {
    id: number;
    name: string;
    email: string;
    document_number: string | null;
    telephone: string | null;
    photo_url: string | null;
    id_enterprise: number | null;
}

interface CompanyEmployeePatch {
    name?: string;
    telephone?: string;
    password?: string;
    photo_url?: string;
}

const URL_HTTP = /^https?:\/\//i;

function paraPerfil(dto: CompanyEmployeeResponse): Perfil {
    return {
        id: String(dto.id),
        nome: dto.name,
        email: dto.email,
        cpf: dto.document_number ?? '',
        telefone: dto.telephone ?? '',
        avatarUrl: dto.photo_url,
        idEnterprise: dto.id_enterprise,
    };
}

function falhar(error: unknown, mensagem: string): Error {
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

/** Perfil do usuário autenticado (GET /company-employees/me). O id numérico vem do banco, não do Keycloak. */
export async function obterPerfil(signal?: AbortSignal): Promise<Perfil | null> {
    try {
        const dto = await springRequest<CompanyEmployeeResponse>(
            '/company-employees/me',
            { signal },
            'Não foi possível carregar o perfil.',
        );
        return dto ? paraPerfil(dto) : null;
    } catch (error) {
        throw falhar(error, 'Não foi possível carregar o perfil.');
    }
}

export async function atualizarPerfil(id: string, dados: PerfilAtualizacao): Promise<Perfil> {
    try {
        const digitos = apenasDigitos(dados.telefone);
        if (digitos.length < 10 || digitos.length > 11) {
            throw new ServiceError('Telefone inválido.');
        }

        const corpo: CompanyEmployeePatch = { name: dados.nome, telephone: digitos };
        if (dados.novaSenha) corpo.password = dados.novaSenha;
        // photo_url aceita no máximo 500 caracteres: data-URLs (base64) não são enviadas ao backend.
        const fotoPersistivel = dados.avatarUrl !== null && URL_HTTP.test(dados.avatarUrl);
        if (fotoPersistivel && dados.avatarUrl) corpo.photo_url = dados.avatarUrl;

        const dto = await springRequest<CompanyEmployeeResponse>(
            `/company-employees/${encodeURIComponent(id)}`,
            { method: 'PATCH', body: corpo },
            'Não foi possível salvar o perfil.',
        );
        const perfil = paraPerfil(dto);
        // Foto local (data-URL) vale apenas durante a sessão enquanto o backend não suporta upload.
        return fotoPersistivel ? perfil : { ...perfil, avatarUrl: dados.avatarUrl ?? perfil.avatarUrl };
    } catch (error) {
        throw falhar(error, 'Não foi possível salvar o perfil.');
    }
}
