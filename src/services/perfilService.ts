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

function validarTelefone(telefone?: string): string {
    const digitos = apenasDigitos(telefone ?? "");
    if (digitos.length > 0 && (digitos.length < 10 || digitos.length > 13)) {
        throw new ServiceError("Telefone inválido.");
    }
    return digitos;
}

function resolverPhotoUrlPatch(avatarUrl?: string | null): string | undefined {
    if (avatarUrl === null) return "";
    if (avatarUrl && URL_HTTP.test(avatarUrl)) return avatarUrl;
    return undefined;
}

function montarPayloadPerfil(dados: PerfilAtualizacao): CompanyEmployeePatch {
    if (dados.novaSenha) {
        throw new ServiceError("Use a recuperação de senha para alterar a senha de acesso.");
    }

    const digitos = validarTelefone(dados.telefone);
    const corpo: CompanyEmployeePatch = {};

    const nome = dados.nome?.trim();
    if (nome) {
        corpo.name = nome;
    }

    if (digitos.length >= 10 && digitos.length <= 13) {
        corpo.telephone = digitos;
    }

    if (dados.avatarUrl !== undefined) {
        const photoUrl = resolverPhotoUrlPatch(dados.avatarUrl);
        if (photoUrl !== undefined) {
            corpo.photo_url = photoUrl;
        }
    }

    return corpo;
}

function mesclarPerfilComAvatar(perfil: Perfil, avatarUrl?: string | null, persistivel = false): Perfil {
    if (persistivel) return perfil;
    if (avatarUrl === null) return { ...perfil, avatarUrl: null };
    return { ...perfil, avatarUrl: avatarUrl ?? perfil.avatarUrl };
}

export async function atualizarPerfil(_id: string, dados: PerfilAtualizacao): Promise<Perfil> {
    try {
        const corpo = montarPayloadPerfil(dados);
        const fotoPersistivel = Boolean(dados.avatarUrl && URL_HTTP.test(dados.avatarUrl));

        const dto = await springRequest<CompanyEmployeeResponse>(
            "/company-employees/me",
            { method: "PATCH", body: corpo },
            "Não foi possível salvar o perfil.",
        );
        const perfil = paraPerfil(dto);
        // Foto local (data-URL) vale apenas durante a sessão enquanto o backend não suporta upload.
        return mesclarPerfilComAvatar(perfil, dados.avatarUrl, fotoPersistivel);
    } catch (error) {
        throw falhar(error, "Não foi possível salvar o perfil.");
    }
}
