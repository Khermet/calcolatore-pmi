import { CRITERI, combina, type Limiti, type Scelte } from './composto.ts';
import { virgola } from './formato.ts';

export type RigaIntervallo = { id: string; titolo: string; reperto?: string; limiti: Limiti };

export function descriviLimiti(l: Limiti): string {
  if (l.min === null && l.max === null) return 'Limiti non disponibili';
  if (l.min === null) return `Entro ${virgola(l.max!)} h`;
  if (l.max === null) return `Almeno ${virgola(l.min)} h`;
  return l.min === l.max ? `${virgola(l.min)} h` : `${virgola(l.min)}–${virgola(l.max)} h`;
}

export function confrontaIntervalli(nomogramma: Limiti, scelte: Scelte) {
  const righe: RigaIntervallo[] = [];
  if (nomogramma.min !== null || nomogramma.max !== null) {
    righe.push({ id: 'henssge', titolo: 'Henssge', limiti: nomogramma });
  }
  for (const c of CRITERI) {
    const o = c.opzioni.find((o) => o.id === scelte[c.id]);
    if (o) righe.push({ id: c.id, titolo: c.titolo, reperto: o.etichetta, limiti: o.limiti });
  }
  const e = combina(nomogramma, scelte);
  const comune: Limiti | null = righe.length && !e.contraddizione ? { min: e.min, max: e.max } : null;
  const estremi = righe.flatMap((r) => [r.limiti.min ?? 0, r.limiti.max ?? 0]);
  const scalaMax = Math.max(6, Math.ceil(Math.max(0, ...estremi) * 1.15 / 6) * 6);
  return { righe, comune, incompatibili: e.contraddizione, scalaMax };
}
