import { springRequest } from './springClient';

export interface EnterpriseOption {
  id: number;
  name: string;
  documentNumber: string;
  email: string;
  telephone: string;
}

interface EnterpriseBackendDTO {
  id: number;
  name: string;
  document_number?: string;
  documentNumber?: string;
  email?: string;
  telephone?: string;
}

export async function listarEmpresas(signal?: AbortSignal): Promise<EnterpriseOption[]> {
  const lista = await springRequest<EnterpriseBackendDTO[]>(
    '/enterprises',
    { method: 'GET', signal },
    'Não foi possível listar as empresas integradoras.',
  );

  return (lista ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    documentNumber: e.document_number ?? e.documentNumber ?? '',
    email: e.email ?? '',
    telephone: e.telephone ?? '',
  }));
}
