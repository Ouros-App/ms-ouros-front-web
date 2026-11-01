import { describe, expect, it, vi, beforeEach } from 'vitest';
import { uploadParaCloudinary, CloudinaryUploadError } from '@/services/cloudinaryService';

describe('cloudinaryService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('realiza upload de arquivo com sucesso e retorna a secure_url', async () => {
    const fakeResponse = {
      secure_url: 'https://res.cloudinary.com/mpyey2bi/image/upload/v12345/ouros/profiles/user1.jpg',
      public_id: 'ouros/profiles/user1',
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(fakeResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const arquivo = new File(['dummy-content'], 'foto.jpg', { type: 'image/jpeg' });
    const url = await uploadParaCloudinary(arquivo);

    expect(url).toBe('https://res.cloudinary.com/mpyey2bi/image/upload/v12345/ouros/profiles/user1.jpg');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain('https://api.cloudinary.com/v1_1/mpyey2bi/image/upload');
    expect(calledInit.method).toBe('POST');
    expect(calledInit.body).toBeInstanceOf(FormData);
  });

  it('lança CloudinaryUploadError quando o arquivo é vazio ou nulo', async () => {
    const arquivoVazio = new File([], 'vazio.jpg', { type: 'image/jpeg' });
    await expect(uploadParaCloudinary(arquivoVazio)).rejects.toThrow(CloudinaryUploadError);
    await expect(uploadParaCloudinary(null as unknown as File)).rejects.toThrow(CloudinaryUploadError);
  });

  it('trata resposta com erro da API do Cloudinary', async () => {
    const errorBody = {
      error: {
        message: 'Upload preset not found',
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorBody), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const arquivo = new File(['content'], 'foto.png', { type: 'image/png' });
    await expect(uploadParaCloudinary(arquivo)).rejects.toThrow('Upload preset not found');
  });

  it('trata falha de rede ao enviar foto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const arquivo = new File(['content'], 'foto.png', { type: 'image/png' });
    await expect(uploadParaCloudinary(arquivo)).rejects.toThrow('Sem conexão ao enviar foto. Verifique sua internet.');
  });
});
