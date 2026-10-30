import { describe, expect, it } from 'vitest';
import { validateMeta, validateTituloMeta } from '@/utils/metasValidators';
import { validateRanking } from '@/utils/rankingValidators';
import { validatePerfil } from '@/utils/perfilValidators';
import { validateSimulacao } from '@/utils/simulacaoValidators';

describe('validações de formulários', () => {
  it('valida metas e impede concluídos acima do total', () => {
    expect(validateTituloMeta('  ')).toBeTruthy();
    expect(validateTituloMeta('ab')).toBeTruthy();
    expect(validateTituloMeta('a'.repeat(81))).toBeTruthy();
    expect(validateMeta({ meta: 'Água', totalGranjas: '10', concluidos: '5' })).toEqual({});
    expect(validateMeta({ meta: 'x', totalGranjas: '1', concluidos: '2' })).toEqual(expect.objectContaining({ meta: expect.any(String), concluidos: expect.any(String) }));
    expect(validateMeta({ meta: 'Água', totalGranjas: '0', concluidos: '-1' })).toEqual(expect.objectContaining({ totalGranjas: expect.any(String), concluidos: expect.any(String) }));
  });
  it('valida nome e pontuação do ranking', () => {
    expect(validateRanking({ nome: 'Ana', pontuacao: '0' })).toEqual({});
    expect(validateRanking({ nome: '', pontuacao: '-1' })).toEqual(expect.objectContaining({ nome: expect.any(String), pontuacao: expect.any(String) }));
    expect(validateRanking({ nome: 'a'.repeat(41), pontuacao: 'x' }).nome).toBeTruthy();
  });
  it('valida perfil, telefone e senha', () => {
    expect(validatePerfil({ nome: 'Ana Silva', email: 'ana@example.com', telefone: '11999999999', senha: '' })).toEqual({});
    expect(validatePerfil({ nome: '', email: 'errado', telefone: '1', senha: '12' })).toEqual(expect.objectContaining({ nome: expect.any(String), email: expect.any(String), telefone: expect.any(String), senha: expect.any(String) }));
    expect(validatePerfil({ nome: 'Ana1', email: '', telefone: '', senha: 'a'.repeat(68) }).nome).toBeTruthy();
  });
  it('valida parâmetros numéricos da simulação', () => {
    const valid = { idLote: 'L-1', consumoAtual: '1', consumoAlvo: '2', precoAgua: '3', precoEnergia: '4', quantidadeAves: '5', gastoAlvoEnergia: '6' };
    expect(validateSimulacao(valid)).toEqual({});
    const errors = validateSimulacao({ idLote: '', consumoAtual: '-1', consumoAlvo: '', precoAgua: 'x', precoEnergia: '-1', quantidadeAves: '0', gastoAlvoEnergia: '' });
    expect(Object.keys(errors)).toHaveLength(7);
    expect(validateSimulacao({ ...valid, idLote: 'a'.repeat(21) }).idLote).toBeTruthy();
    expect(validateSimulacao({ ...valid, idLote: 'inválido!' }).idLote).toBeTruthy();
  });
});
