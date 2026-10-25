import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRITERI, combina } from './composto.ts';

const limiti = (criterio: string, opzione: string) =>
  CRITERI.find((c) => c.id === criterio)!.opzioni.find((o) => o.id === opzione)!.limiti;

test('gradi dell\'orbicolare: valori della Fig. 4', () => {
  assert.deepEqual(limiti('occhio', 'nessuna'), { min: 5, max: null });
  assert.deepEqual(limiti('occhio', 'grado-I'), { min: 5, max: 22 });
  assert.deepEqual(limiti('occhio', 'grado-III'), { min: 3, max: 13 });
  assert.deepEqual(limiti('occhio', 'grado-VI'), { min: null, max: 6 });
});

test('senza criteri resta l\'intervallo del nomogramma', () => {
  const e = combina({ min: 10.2, max: 15.8 }, {});
  assert.deepEqual([e.min, e.max, e.contraddizione], [10.2, 15.8, false]);
});

test('i criteri restringono solo se migliorano i limiti', () => {
  // Ipostasi che si spostano completamente: limite superiore 6 h.
  const e = combina({ min: 2, max: 9 }, { spostamento: 'completo', rigidita: 'completa' });
  assert.equal(e.min, 2);
  assert.equal(e.max, 6);
  assert.match(e.determinanti.max!, /cambio di posizione/);
  assert.equal(e.determinanti.min, null);
});

test('limite inferiore da criterio non termico', () => {
  const e = combina({ min: 0, max: 12 }, { occhio: 'nessuna' });
  assert.equal(e.min, 5);
  assert.equal(e.max, 12);
});

test('reperti incompatibili segnalano una contraddizione', () => {
  const e = combina({ min: 14, max: 20 }, { occhio: 'grado-VI' });
  assert.equal(e.contraddizione, true);
});

test('eccitabilità meccanica: valori di Zirn 2026, Tab. 1', () => {
  assert.deepEqual(limiti('zsako', 'presente'), { min: null, max: 2.5 });
  assert.deepEqual(limiti('idiomuscolare', 'presente'), { min: null, max: 13 });
  assert.deepEqual(limiti('idiomuscolare', 'assente'), { min: 1.5, max: null });
  const e = combina({ min: 9, max: 15 }, { idiomuscolare: 'presente' });
  assert.deepEqual([e.min, e.max], [9, 13]);
});

test('identificativi unici per criterio', () => {
  for (const c of CRITERI) assert.equal(new Set(c.opzioni.map((o) => o.id)).size, c.opzioni.length);
});
