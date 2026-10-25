// Modello di raffreddamento di Henssge (temperatura rettale), doppio esponenziale.
// Fonte: Henssge C, Madea B. Estimation of the time since death in the early
// post-mortem period. Forensic Sci Int 2004;144:167-175.
//   Ta <= 23 °C: Q = 1,25·exp(B·t) - 0,25·exp(5·B·t)
//   Ta >  23 °C: Q = 1,11·exp(B·t) - 0,11·exp(10·B·t)
//   Q = (Tr - Ta) / (37,2 - Ta)
//   B = -1,2815·(cf·M)^-0,625 + 0,0284

export const T_INIZIALE = 37.2;
const T_MAX_ORE = 120;

export type Input = {
  tRettale: number; // °C
  tAmbiente: number; // °C
  peso: number; // kg
  cf: number; // fattore correttivo (1 = corpo nudo, aria ferma)
};

export type Esito =
  | { ok: true; ore: number; q: number; b: number; margine: number | null }
  | { ok: false; errore: string };

// Limiti al 95% (± ore) in funzione di Q, nomogramma per Ta <= 23 °C.
// Con fattori correttivi: Hubig, Muggenthaler, Mall, Leg Med 2014
// (doi 10.1016/j.legalmed.2014.08.002): Q > 0,5 → 2,8; 0,5 ≥ Q > 0,3 → 4,5;
// 0,3 ≥ Q > 0,2 → 7,0. Condizioni standard (nudo, aria ferma): 2,8 / 3,2 / 4,5,
// letti sull'arco interno della Fig. 2 di Henssge e Madea 2004, che condivide
// le stesse divisioni dell'arco esterno.
// Per Ta > 23 °C il nomogramma riporta solo ±2,8 h nel primo settore (Q > 0,5).
export function margine95(q: number, tAmbiente: number, cf: number): number | null {
  if (q <= 0.2) return null;
  if (tAmbiente > 23) return q > 0.5 ? 2.8 : null;
  const standard = cf === 1;
  if (q > 0.5) return 2.8;
  if (q > 0.3) return standard ? 3.2 : 4.5;
  return standard ? 4.5 : 7.0;
}

export function coefficienteB(peso: number, cf: number): number {
  return -1.2815 * Math.pow(cf * peso, -0.625) + 0.0284;
}

export function quoziente(t: number, tAmbiente: number, b: number): number {
  return tAmbiente <= 23
    ? 1.25 * Math.exp(b * t) - 0.25 * Math.exp(5 * b * t)
    : 1.11 * Math.exp(b * t) - 0.11 * Math.exp(10 * b * t);
}

export function temperaturaAttesa(t: number, i: Omit<Input, 'tRettale'>): number {
  const q = quoziente(t, i.tAmbiente, coefficienteB(i.peso, i.cf));
  return i.tAmbiente + q * (T_INIZIALE - i.tAmbiente);
}

export function stimaPMI(i: Input): Esito {
  if (!(i.peso > 0)) return { ok: false, errore: 'Peso non valido.' };
  if (!(i.cf > 0)) return { ok: false, errore: 'Fattore correttivo non valido.' };
  if (i.tAmbiente >= T_INIZIALE)
    return { ok: false, errore: 'La temperatura ambiente deve essere inferiore a 37,2 °C.' };
  if (i.tRettale <= i.tAmbiente)
    return { ok: false, errore: 'La temperatura rettale deve superare quella ambiente: equilibrio termico raggiunto, metodo non applicabile.' };
  if (i.tRettale > T_INIZIALE)
    return { ok: false, errore: 'Temperatura rettale superiore a 37,2 °C: il modello assume normotermia al decesso.' };

  const q = (i.tRettale - i.tAmbiente) / (T_INIZIALE - i.tAmbiente);
  const b = coefficienteB(i.peso, i.cf);
  if (!(b < 0)) return { ok: false, errore: 'Combinazione peso/fattore correttivo fuori dal modello.' };
  if (quoziente(T_MAX_ORE, i.tAmbiente, b) > q)
    return { ok: false, errore: `Intervallo stimato oltre ${T_MAX_ORE} ore: fuori dal campo di applicazione.` };

  // Q(t) è monotona decrescente: bisezione.
  let lo = 0;
  let hi = T_MAX_ORE;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (quoziente(mid, i.tAmbiente, b) > q) lo = mid;
    else hi = mid;
  }
  return { ok: true, ore: (lo + hi) / 2, q, b, margine: margine95(q, i.tAmbiente, i.cf) };
}
