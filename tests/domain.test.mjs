import { test } from 'vitest';
import assert from 'node:assert/strict';
import { calcularProgresso, metCompleta, resumirMetas, filtrarMetas } from '../src/utils/metas.ts';
import { classificar, filtrarEOrdenarRanking, ligaPorId } from '../src/utils/ranking.ts';
import { galinhasAtuais, filtrarEOrdenar } from '../src/utils/registros.ts';
import { filtrosValidos } from '../src/utils/dashboard.ts';
import { authReducer, authInitialState } from '../src/reducers/authReducer.ts';

test('calcula, resume e pesquisa metas estaduais', () => {
  const metas = [{ estado: 'SP', meta: 'Água', totalGranjas: 10, concluidos: 5 }, { estado: 'PR', meta: 'Energia', totalGranjas: 2, concluidos: 2 }];
  assert.equal(calcularProgresso(metas[0]), 50);
  assert.equal(calcularProgresso({ ...metas[0], totalGranjas: 0 }), 0);
  assert.equal(metCompleta(metas[1]), true);
  assert.deepEqual(resumirMetas(metas), { total: 2, concluidas: 1, percentual: 50 });
  assert.deepEqual(resumirMetas([]), { total: 0, concluidas: 0, percentual: 0 });
  assert.equal(filtrarMetas(metas, ' são paulo ')[0].estado, 'SP');
  assert.equal(filtrarMetas(metas, 'energia')[0].estado, 'PR');
  assert.equal(filtrarMetas(metas, '').length, 2);
});

test('classifica empates e ordena participantes sem alterar a entrada', () => {
  const pessoas = [ { id: '1', nome: 'Zeca', pontuacao: 5, atualizadoEm: '2026-01-01' }, { id: '2', nome: 'Ana', pontuacao: 9, atualizadoEm: '2026-02-01' }, { id: '3', nome: 'Bia', pontuacao: 9, atualizadoEm: '2026-03-01' } ];
  const resultado = classificar(pessoas);
  assert.deepEqual(resultado.map(p => p.posicao), [1, 1, 3]);
  assert.equal(pessoas[0].nome, 'Zeca');
  assert.equal(filtrarEOrdenarRanking(resultado, 'an', 'padrao')[0].nome, 'Ana');
  assert.equal(filtrarEOrdenarRanking(resultado, '', 'nome')[0].nome, 'Ana');
  assert.equal(filtrarEOrdenarRanking(resultado, '', 'pontuacao')[0].nome, 'Zeca');
  assert.equal(filtrarEOrdenarRanking(resultado, '', 'atualizacao')[0].nome, 'Bia');
  assert.equal(ligaPorId('ouro').nome, 'Ouro');
});

test('filtra e ordena registros e calcula aves atuais', () => {
  const registros = [{ idLote: 'A', entraram: 10, sairam: 2, custo: 5 }, { idLote: 'B', entraram: 20, sairam: 3, custo: 2 }];
  assert.equal(galinhasAtuais(registros[0]), 8);
  assert.equal(filtrarEOrdenar(registros, 'b', 'padrao')[0].idLote, 'B');
  assert.equal(filtrarEOrdenar(registros, '', 'atuais')[0].idLote, 'B');
  assert.equal(filtrarEOrdenar(registros, '', 'custo')[0].idLote, 'A');
});

test('normaliza filtros e atualiza sessão', () => {
  assert.deepEqual(filtrosValidos(null), { periodo: 'atual', estado: 'todos' });
  assert.deepEqual(filtrosValidos({ periodo: ' ', estado: ' SP ', gerencia: ' Norte ' }), { periodo: 'atual', estado: 'SP', gerencia: 'Norte' });
  const user = { id: '1', name: 'Ana' };
  const logado = authReducer(authInitialState, { type: 'LOGIN', payload: user });
  assert.equal(logado.isAuthenticated, true);
  assert.equal(authReducer(logado, { type: 'UPDATE_USER', playload: { name: 'Bia' } }).user.name, 'Bia');
  assert.deepEqual(authReducer(logado, { type: 'LOGOUT' }), authInitialState);
});
