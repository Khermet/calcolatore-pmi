// Temperatura ambiente incerta: simulazione Monte Carlo.
// La temperatura ambiente viene estratta uniformemente tra minimo e massimo
// plausibili; per ogni estrazione si applica Henssge con il suo intervallo al 95%.
// Restituisce la distribuzione della stima puntuale (percentili) e l'inviluppo
// degli intervalli al 95% (dal più basso limite inferiore al più alto superiore).
// Razionale: Heinrich et al., Int J Legal Med 2024 (doi 10.1007/s00414-024-03338-5)
// hanno ottenuto una concordanza migliore nei corpi refrigerati considerando un
// intervallo plausibile di temperatura ambiente invece di un valore unico.
// Non si aggiunge un errore di modello: le ampiezze di Henssge lo contengono già
// (comprese fluttuazioni del fattore correttivo di ±0,1, cfr. Hubig et al. 2014).

import { stimaPMI } from './henssge.ts';

export type InputIncerto = {
  tRettale: number;
  taMin: number;
  taMax: number;
  peso: number;
  cf: number;
  n?: number;
  seme?: number;
};

export type EsitoIncerto =
  | {
      ok: true;
      validi: number;
      scartati: number;
      mediana: number;
      p025: number;
      p975: number;
      inviluppoMin: number;
      inviluppoMax: number;
      senzaMargine: number; // estrazioni con Q ≤ 0,2 o fascia senza limiti
    }
  | { ok: false; errore: string };

// Generatore pseudo-casuale con seme (mulberry32): risultati riproducibili.
export function generatore(seme: number): () => number {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function percentile(ordinati: number[], p: number): number {
  const pos = (ordinati.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return ordinati[lo] + (ordinati[hi] - ordinati[lo]) * (pos - lo);
}

export function simula(i: InputIncerto): EsitoIncerto {
  if (!(i.taMax >= i.taMin)) return { ok: false, errore: 'Il massimo della temperatura ambiente deve essere ≥ al minimo.' };
  const n = i.n ?? 4000;
  const caso = generatore(i.seme ?? 1);
  const stime: number[] = [];
  let scartati = 0;
  let senzaMargine = 0;
  let inviluppoMin = Infinity;
  let inviluppoMax = -Infinity;

  for (let k = 0; k < n; k++) {
    const tAmbiente = i.taMin + (i.taMax - i.taMin) * caso();
    const e = stimaPMI({ tRettale: i.tRettale, tAmbiente, peso: i.peso, cf: i.cf });
    if (!e.ok) {
      scartati++;
      continue;
    }
    stime.push(e.ore);
    if (e.margine === null) {
      senzaMargine++;
      continue;
    }
    inviluppoMin = Math.min(inviluppoMin, Math.max(0, e.ore - e.margine));
    inviluppoMax = Math.max(inviluppoMax, e.ore + e.margine);
  }

  if (stime.length === 0)
    return { ok: false, errore: 'Nessuna temperatura dell\'intervallo è compatibile con il modello.' };
  stime.sort((a, b) => a - b);
  return {
    ok: true,
    validi: stime.length,
    scartati,
    mediana: percentile(stime, 0.5),
    p025: percentile(stime, 0.025),
    p975: percentile(stime, 0.975),
    inviluppoMin: Number.isFinite(inviluppoMin) ? inviluppoMin : NaN,
    inviluppoMax: Number.isFinite(inviluppoMax) ? inviluppoMax : NaN,
    senzaMargine,
  };
}
