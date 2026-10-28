import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confrontaIntervalli, descriviLimiti } from './intervalli.ts';

test('senza reperti conserva solo Henssge; senza dati non inventa un intervallo', () => {
  const termico = confrontaIntervalli({ min: 6, max: 12 }, {});
  assert.equal(termico.righe.length, 1);
  assert.deepEqual(termico.comune, { min: 6, max: 12 });
  const vuoto = confrontaIntervalli({ min: null, max: null }, { sconosciuto: 'presente' });
  assert.equal(vuoto.righe.length, 0);
  assert.equal(vuoto.comune, null);
  assert.equal(vuoto.incompatibili, false);
});

test('confronta ciascun reperto sulla stessa scala e restringe alla sovrapposizione', () => {
  const c = confrontaIntervalli({ min: 6, max: 12 }, { rigidita: 'assente', spostamento: 'incompleto' });
  assert.equal(c.righe.length, 3);
  assert.deepEqual(c.righe.find((r) => r.id === 'rigidita')!.limiti, { min: null, max: 7 });
  assert.deepEqual(c.comune, { min: 6, max: 7 });
  assert.ok(c.scalaMax > 24);
});

test('reperti incompatibili non producono una falsa sovrapposizione', () => {
  const c = confrontaIntervalli({ min: 6, max: 12 }, { zsako: 'presente' });
  assert.equal(c.incompatibili, true);
  assert.equal(c.comune, null);
  assert.equal(c.righe.length, 2);
});

test('intersezione puntuale è compatibile e i limiti aperti restano aperti', () => {
  assert.deepEqual(confrontaIntervalli({ min: 7, max: 12 }, { rigidita: 'assente' }).comune, { min: 7, max: 7 });
  const c = confrontaIntervalli({ min: null, max: null }, { rigidita: 'risoluzione' });
  assert.deepEqual(c.comune, { min: 24, max: null });
  assert.ok(c.scalaMax > 24);
  assert.equal(c.righe.length, 1);
});

test('descrive limiti unilaterali senza spacciare il limite del grafico per una stima', () => {
  assert.equal(descriviLimiti({ min: null, max: 3 }), 'Entro 3,0 h');
  assert.equal(descriviLimiti({ min: 24, max: null }), 'Almeno 24,0 h');
  assert.equal(descriviLimiti({ min: 2, max: 24 }), '2,0–24,0 h');
  assert.equal(descriviLimiti({ min: 7, max: 7 }), '7,0 h');
  assert.equal(descriviLimiti({ min: null, max: null }), 'Limiti non disponibili');
});
