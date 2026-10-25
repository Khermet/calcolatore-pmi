import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stimaPMI, temperaturaAttesa, quoziente, coefficienteB, margine95 } from './henssge.ts';
import { FATTORI } from './fattori.ts';

test('esempio della Fig. 2 di Henssge e Madea 2004: circa 17,2 h ± 2,8 h', () => {
  const e = stimaPMI({ tRettale: 27, tAmbiente: 15, peso: 70, cf: 1.3 });
  assert.ok(e.ok);
  if (e.ok) {
    assert.ok(Math.abs(e.ore - 17.2) < 0.3, `ottenuto ${e.ore}`);
    assert.equal(e.margine, 2.8);
  }
});

test('limiti al 95% per fasce di Q', () => {
  assert.equal(margine95(0.6, 15, 1.3), 2.8);
  assert.equal(margine95(0.4, 15, 1.3), 4.5);
  assert.equal(margine95(0.25, 15, 1.3), 7.0);
  assert.equal(margine95(0.4, 15, 1), 3.2);
  assert.equal(margine95(0.25, 15, 1), 4.5);
  assert.equal(margine95(0.15, 15, 1), null);
  assert.equal(margine95(0.6, 25, 1), 2.8);
  assert.equal(margine95(0.4, 25, 1), null);
});

test('tabella dei fattori: identificativi unici e valori nel campo 0,35-2,4', () => {
  assert.equal(new Set(FATTORI.map((f) => f.id)).size, FATTORI.length);
  for (const f of FATTORI) assert.ok(f.cf >= 0.35 && f.cf <= 2.4);
});

test('Q vale 1 al momento del decesso', () => {
  const b = coefficienteB(70, 1);
  assert.equal(quoziente(0, 15, b), 1);
  assert.equal(quoziente(0, 25, b), 1);
});

test('andata e ritorno: la stima ritrova le ore di partenza', () => {
  for (const tAmbiente of [-5, 10, 18, 23, 24, 30]) {
    for (const peso of [40, 70, 110]) {
      for (const cf of [0.7, 1, 1.4]) {
        for (const ore of [2, 6, 12, 24]) {
          const tRettale = temperaturaAttesa(ore, { tAmbiente, peso, cf });
          const e = stimaPMI({ tRettale, tAmbiente, peso, cf });
          assert.ok(e.ok, `atteso esito valido per Ta=${tAmbiente} M=${peso} cf=${cf} t=${ore}`);
          if (e.ok) assert.ok(Math.abs(e.ore - ore) < 1e-6);
        }
      }
    }
  }
});

test('un corpo più pesante si raffredda più lentamente', () => {
  const leggero = temperaturaAttesa(10, { tAmbiente: 15, peso: 50, cf: 1 });
  const pesante = temperaturaAttesa(10, { tAmbiente: 15, peso: 100, cf: 1 });
  assert.ok(pesante > leggero);
});

test('input fuori dal modello producono un errore', () => {
  assert.equal(stimaPMI({ tRettale: 15, tAmbiente: 15, peso: 70, cf: 1 }).ok, false);
  assert.equal(stimaPMI({ tRettale: 38, tAmbiente: 15, peso: 70, cf: 1 }).ok, false);
  assert.equal(stimaPMI({ tRettale: 30, tAmbiente: 15, peso: 0, cf: 1 }).ok, false);
  assert.equal(stimaPMI({ tRettale: 30, tAmbiente: 40, peso: 70, cf: 1 }).ok, false);
});
