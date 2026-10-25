// Geometria di un nomogramma "alla Henssge" costruito dalle equazioni del modello
// (non è la riproduzione della figura pubblicata).
// - Scala sinistra: temperatura rettale, verso l'alto (y = Y0 - Tr·S).
// - Scala destra: temperatura ambiente, invertita (y = Y0 + K·Ta·S).
// - La retta che unisce Tr e Ta taglia la "diagonale" in un punto che dipende solo da
//   Q = (Tr - Ta)/(37,2 - Ta): da Tr = 37,2·Q + (1 - Q)·Ta segue che il luogo è la retta
//   (K+1)·x/W + y/37,2 = 1 (x dalla scala sinistra, y in °C sopra lo zero).
// - Dal centro C parte il raggio verso quel punto; la lettura in ore è dove il raggio
//   incrocia l'arco del peso corretto (fattore correttivo × peso).
// - Arco esterno: settori dei limiti al 95% per fasce di Q (0,5 / 0,3 / 0,2).
import { T_INIZIALE, coefficienteB, quoziente } from './henssge.ts';

export const S = 8; // px per °C
export const W = 560; // distanza tra le due scale
export const X0 = 80; // ascissa della scala rettale (margine per le etichette dei pesi)
export const K = 1; // rapporto tra la scala ambiente e quella rettale
export const Y0 = 560; // ordinata dello 0 °C sulla scala rettale
export const XR = X0 + W;
export const C = { x: X0 + 0.06 * W, y: Y0 - 4 * S };
export const PESI = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200];
export const R_MIN = 150;
export const PASSO_R = 20;
export const R_ESTERNO = R_MIN + PASSO_R * (PESI.length - 1) + 30;
export const LARGHEZZA = 700;
// oltre Q = 0,2 il nomogramma non fornisce limiti: archi e tacche si fermano lì
export const Q_MIN = 0.2;
export const ALTEZZA = 870;

export type Punto = { x: number; y: number };

export const yRettale = (t: number) => Y0 - t * S;
export const yAmbiente = (t: number) => Y0 + K * t * S;

export function puntoDiagonale(q: number): Punto {
  const d = K + 1 - q;
  return { x: X0 + (W * (1 - q)) / d, y: Y0 - (T_INIZIALE * S * q * K) / d };
}

export function angolo(q: number): number {
  const p = puntoDiagonale(q);
  return Math.atan2(p.y - C.y, p.x - C.x);
}

export const suCerchio = (r: number, a: number): Punto => ({ x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) });

// raggio dell'arco per un peso qualsiasi: interpolazione lineare tra gli archi tabulati
export function raggio(peso: number): number {
  const m = Math.min(Math.max(peso, PESI[0]), PESI[PESI.length - 1]);
  for (let k = 0; k < PESI.length - 1; k++) {
    if (m <= PESI[k + 1]) return R_MIN + PASSO_R * (k + (m - PESI[k]) / (PESI[k + 1] - PESI[k]));
  }
  return R_MIN + PASSO_R * (PESI.length - 1);
}

// tacche orarie sull'arco di un peso (corretto): dove cade ogni ora intera
export function tacche(pesoCorretto: number, tAmbiente: number, oreMax = 80): { ore: number; p: Punto }[] {
  const b = coefficienteB(pesoCorretto, 1);
  const r = raggio(pesoCorretto);
  const out: { ore: number; p: Punto }[] = [];
  for (let t = 1; t <= oreMax; t++) {
    const q = quoziente(t, tAmbiente, b);
    if (q < Q_MIN) break;
    out.push({ ore: t, p: suCerchio(r, angolo(q)) });
  }
  return out;
}

// arco come polilinea tra due valori di Q
export function arco(r: number, qDa = 1, qA = Q_MIN, passi = 60): Punto[] {
  const a0 = angolo(qDa);
  const a1 = angolo(qA);
  return Array.from({ length: passi + 1 }, (_, k) => suCerchio(r, a0 + ((a1 - a0) * k) / passi));
}

// intersezione delle rette per (a, b) e (c, d)
export function intersezione(a: Punto, b: Punto, c: Punto, d: Punto): Punto {
  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  const u = a.x * b.y - a.y * b.x;
  const v = c.x * d.y - c.y * d.x;
  return { x: (u * (c.x - d.x) - (a.x - b.x) * v) / den, y: (u * (c.y - d.y) - (a.y - b.y) * v) / den };
}
