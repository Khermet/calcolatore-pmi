import { test } from 'node:test';
import assert from 'node:assert/strict';
import { X0, XR, angolo, intersezione, puntoDiagonale, raggio, tacche, yAmbiente, yRettale, C, suCerchio } from './nomogramma.ts';
import { stimaPMI } from './henssge.ts';

const vicini = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;

test('la retta Tr-Ta taglia la diagonale nel punto di Q, per qualsiasi coppia', () => {
  for (const [tr, ta] of [[27, 15], [30, -5], [34, 26], [20, 12], [36, 0]]) {
    const q = (tr - ta) / (37.2 - ta);
    const p = intersezione(
      { x: X0, y: yRettale(tr) },
      { x: XR, y: yAmbiente(ta) },
      puntoDiagonale(0.999),
      puntoDiagonale(0.001),
    );
    const atteso = puntoDiagonale(q);
    assert.ok(vicini(p.x, atteso.x) && vicini(p.y, atteso.y), `Tr=${tr} Ta=${ta}`);
  }
});

test('i punti di Q stanno su una retta (la diagonale)', () => {
  const a = puntoDiagonale(0.9);
  const b = puntoDiagonale(0.2);
  const m = puntoDiagonale(0.55);
  const area = (b.x - a.x) * (m.y - a.y) - (b.y - a.y) * (m.x - a.x);
  assert.ok(Math.abs(area) < 1e-6);
});

test('la lettura sul nomogramma coincide con il calcolo: esempio della Fig. 2', () => {
  // 27 °C, 15 °C, 70 kg × 1,3 = 91 kg: il raggio di Q incrocia l'arco di 91 kg
  // tra le tacche delle ore che racchiudono la stima calcolata
  const e = stimaPMI({ tRettale: 27, tAmbiente: 15, peso: 70, cf: 1.3 });
  assert.ok(e.ok);
  if (!e.ok) return;
  const a = angolo(e.q);
  const t = tacche(91, 15);
  const prima = t.find((x) => x.ore === Math.floor(e.ore))!;
  const dopo = t.find((x) => x.ore === Math.ceil(e.ore))!;
  const ang = (p: { x: number; y: number }) => Math.atan2(p.y - C.y, p.x - C.x);
  assert.ok(ang(prima.p) <= a && a <= ang(dopo.p), 'il raggio cade tra le due tacche orarie');
  const punto = suCerchio(raggio(91), a);
  assert.ok(Number.isFinite(punto.x));
});

test('archi più esterni per pesi maggiori', () => {
  assert.ok(raggio(10) < raggio(70) && raggio(70) < raggio(91) && raggio(91) < raggio(200));
});
