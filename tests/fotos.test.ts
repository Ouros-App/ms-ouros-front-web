import { describe, expect, it, vi } from 'vitest';
import { FotoInvalidaError, prepararFoto, validarFoto } from '@/utils/fotos';

describe('fotos utils', () => {
  it('validaFoto aceita imagens válidas (jpeg, png, webp)', () => {
    const jpeg = new File(['123'], 'avatar.jpg', { type: 'image/jpeg' });
    const png = new File(['123'], 'avatar.png', { type: 'image/png' });
    const webp = new File(['123'], 'avatar.webp', { type: 'image/webp' });

    expect(() => validarFoto(jpeg)).not.toThrow();
    expect(() => validarFoto(png)).not.toThrow();
    expect(() => validarFoto(webp)).not.toThrow();
  });

  it('validaFoto rejeita arquivos inválidos ou sem tipo', () => {
    expect(() => validarFoto(null)).toThrow(FotoInvalidaError);
    expect(() => validarFoto(undefined)).toThrow(FotoInvalidaError);

    const txt = new File(['123'], 'doc.txt', { type: 'text/plain' });
    expect(() => validarFoto(txt)).toThrow('Use uma imagem JPG, PNG ou WebP.');
  });

  it('validaFoto rejeita imagens maiores que 5 MB', () => {
    const grande = new File(['a'], 'grande.jpg', { type: 'image/jpeg' });
    Object.defineProperty(grande, 'size', { value: 6 * 1024 * 1024 });

    expect(() => validarFoto(grande)).toThrow('A imagem pode ter no máximo 5 MB.');
  });

  it('prepararFoto prepara preview seguro quando createObjectURL não está disponível', async () => {
    const arquivo = new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' });
    const preview = await prepararFoto(arquivo);
    expect(preview).toBeTruthy();
  });

  it('prepararFoto redimensiona e gera dataURL com canvas quando ambiente suporta', async () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test');
    URL.revokeObjectURL = vi.fn();

    const mockContext = { drawImage: vi.fn() };
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,canvasMock');

    const originalImage = globalThis.Image;
    class MockImage {
      naturalWidth = 800;
      naturalHeight = 600;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error mock image for canvas test
    globalThis.Image = MockImage;

    try {
      const arquivo = new File(['teste'], 'foto.jpg', { type: 'image/jpeg' });
      const resultado = await prepararFoto(arquivo);
      expect(resultado).toBe('data:image/jpeg;base64,canvasMock');
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
      globalThis.Image = originalImage;
    }
  });
});
