import { test } from 'vitest';
import assert from 'node:assert/strict';
import { validateLogin, validateRegistro } from '../src/utils/validators.ts';
import { formatarData, formatarDataHora, formatarMes, formatarValorAbreviado } from '../src/utils/formato.ts';

test('valida os limites e dados de login', () => {
  assert.deepEqual(validateLogin({ email: ' pessoa@empresa.com ', password: '123456' }), {});
  assert.equal(validateLogin({ email: '', password: '' }).email, 'Informe seu e-mail');
  assert.ok(validateLogin({ email: 'invalido', password: '123' }).password);
  assert.ok(validateLogin({ email: `${'a'.repeat(120)}@a.com`, password: 'a'.repeat(68) }).email);
});

test('valida lote, data e quantidades de aves', () => {
  const valido = { idLote: 'LOTE-1', dataEmissao: '2026-01-01', hidrometro: '0', custo: '0', entraram: '10', sairam: '0' };
  assert.deepEqual(validateRegistro(valido), {});
  const erros = validateRegistro({ ...valido, idLote: 'inválido!', dataEmissao: '', entraram: '-1', sairam: '1.5' });
  assert.ok(erros.idLote && erros.dataEmissao && erros.entraram && erros.sairam);
  assert.ok(validateRegistro({ ...valido, idLote: 'a'.repeat(21) }).idLote);
});

test('formata datas e valores de exibição', () => {
  assert.equal(formatarData('2026-10-29'), '29/10/2026');
  assert.equal(formatarDataHora('2026-10-29T13:25:00'), '29/10/2026 | 13:25');
  assert.equal(formatarMes('2026-02'), 'Fev');
  assert.equal(formatarMes(''), '');
  assert.equal(formatarValorAbreviado(1500000), 'R$ 1,5M');
  assert.equal(formatarValorAbreviado(2000), 'R$ 2k');
  assert.equal(formatarValorAbreviado(20), 'R$ 20');
});
