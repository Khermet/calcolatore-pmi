import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simula, generatore } from './incertezza.ts';
import { stimaPMI } from './henssge.ts';

test('intervallo di ampiezza zero coincide con il calcolo puntuale', () => {
  const s = simula({ tRettale: 27, taMin: 15, taMax: 15, peso: 70, cf: 1.3, n: 200 });
  const p = stimaPMI({ tRettale: 27, tAmbiente: 15, peso: 70, cf: 1.3 });
  assert.ok(s.ok && p.ok);
  if (s.ok && p.ok && p.margine !== null) {
    assert.ok(Math.abs(s.mediana - p.ore) < 1e-9);
    assert.ok(Math.abs(s.inviluppoMin - (p.ore - p.margine)) < 1e-9);
    assert.ok(Math.abs(s.inviluppoMax - (p.ore + p.margine)) < 1e-9);
  }
});

test('l\'inviluppo contiene gli intervalli calcolati agli estremi', () => {
  const s = simula({ tRettale: 27, taMin: 10, taMax: 18, peso: 70, cf: 1.3 });
  assert.ok(s.ok);
  for (const tAmbiente of [10, 18]) {
    const p = stimaPMI({ tRettale: 27, tAmbiente, peso: 70, cf: 1.3 });
    assert.ok(p.ok && p.margine !== null);
    if (s.ok && p.ok && p.margine !== null) {
      // tolleranza: le estrazioni casuali non toccano esattamente gli estremi
      assert.ok(s.inviluppoMin <= p.ore - p.margine + 0.05);
      assert.ok(s.inviluppoMax >= p.ore + p.margine - 0.05);
    }
  }
  if (s.ok) assert.ok(s.p025 < s.mediana && s.mediana < s.p975);
});

test('ambiente più caldo, a parità di temperatura rettale, allunga la stima', () => {
  const freddo = stimaPMI({ tRettale: 27, tAmbiente: 10, peso: 70, cf: 1 });
  const caldo = stimaPMI({ tRettale: 27, tAmbiente: 18, peso: 70, cf: 1 });
  assert.ok(freddo.ok && caldo.ok && caldo.ore > freddo.ore);
});

test('estrazioni incompatibili vengono scartate', () => {
  // con Ta fino a 28 °C e rettale 27 °C una parte delle estrazioni è all'equilibrio
  const s = simula({ tRettale: 27, taMin: 20, taMax: 28, peso: 70, cf: 1, n: 1000 });
  assert.ok(s.ok && s.scartati > 0 && s.validi + s.scartati === 1000);
});

test('generatore riproducibile con lo stesso seme', () => {
  const a = generatore(7);
  const b = generatore(7);
  for (let k = 0; k < 5; k++) assert.equal(a(), b());
});
