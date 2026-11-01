import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_FOLDER, CLOUDINARY_UPLOAD_PRESET } from '@/utils/constants';

export interface CloudinaryUploadResponse {
  secure_url?: string;
  url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
}

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

/**
 * Realiza o upload direto de imagem para o Cloudinary utilizando preset não assinado (unsigned upload).
 * Segue o padrão de credenciais e pasta do app mobile ('ouros/profiles').
 */
export async function uploadParaCloudinary(
  arquivo: File | Blob,
  signal?: AbortSignal,
): Promise<string> {
  if (!arquivo || (arquivo instanceof File && arquivo.size === 0)) {
    throw new CloudinaryUploadError('Arquivo de imagem não encontrado ou vazio.');
  }

  const cloudName = CLOUDINARY_CLOUD_NAME;
  const uploadPreset = CLOUDINARY_UPLOAD_PRESET;
  const folder = CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new CloudinaryUploadError('Configurações do Cloudinary ausentes.');
  }

  const formData = new FormData();
  formData.append('file', arquivo);
  formData.append('upload_preset', uploadPreset);
  if (folder?.trim()) {
    formData.append('folder', folder.trim());
  }

  let resposta: Response;
  try {
    resposta = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
      signal,
    });
  } catch (error_) {
    if (error_ instanceof DOMException && error_.name === 'AbortError') {
      throw error_;
    }
    throw new CloudinaryUploadError('Sem conexão ao enviar foto. Verifique sua internet.');
  }

  const dados = (await resposta.json().catch(() => null)) as CloudinaryUploadResponse | null;

  if (!resposta.ok || !dados?.secure_url) {
    const mensagem = dados?.error?.message || `Falha no upload da foto (código ${resposta.status}).`;
    throw new CloudinaryUploadError(mensagem);
  }

  return dados.secure_url;
}
