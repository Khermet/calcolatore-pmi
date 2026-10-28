import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEZIONI, avanzamento, chiave, testoChecklist } from './sopralluogo.ts';

test('ogni voce ha un identificativo unico e una fonte', () => {
  const chiavi = SEZIONI.flatMap((s) => s.voci.map((v) => chiave(s, v)));
  assert.equal(new Set(chiavi).size, chiavi.length);
  for (const s of SEZIONI) for (const v of s.voci) assert.ok(v.fonte.length > 0, chiave(s, v));
});

test('avanzamento esclude le sezioni facoltative se non attive', () => {
  const tutte = avanzamento({}, true).totali;
  const base = avanzamento({}, false).totali;
  const stradale = SEZIONI.find((s) => s.id === 'stradale')!.voci.length;
  assert.equal(tutte - base, stradale);
  assert.deepEqual(avanzamento({ 'epoca.t-rettale': true, 'stradale.strada': true }, false), { fatte: 1, totali: base });
});

test('testo da copiare con voci fatte e da fare, senza lineette lunghe', () => {
  const t = testoChecklist({ 'epoca.t-rettale': true }, false, 'Sopralluogo del 28/10/2026');
  assert.match(t, /^Sopralluogo del 28\/10\/2026\n/);
  assert.match(t, /\[x\] Temperatura rettale, con ora della misura/);
  assert.match(t, /\[ \] Temperatura ambiente vicino al corpo/);
  assert.doesNotMatch(t, /INCIDENTE STRADALE/);
  assert.match(t, /Completate 1 voci su \d+\.$/);
  assert.doesNotMatch(t, /—/);
});
