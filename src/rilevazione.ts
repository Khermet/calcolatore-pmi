import type { Limiti } from './composto.ts';

// Calendario civile del rilievo: non dipende dal fuso orario della macchina.
// Non si inferiscono fuso o cambi d'ora legale da una data priva di tali informazioni.
export function istanteRilievo(data: string, ora: string): number | null {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  const h = /^(\d{2}):(\d{2})$/.exec(ora.trim());
  if (!d || !h) return null;
  const [, giorno, mese, anno] = d.map(Number);
  const [, ore, minuti] = h.map(Number);
  if (anno < 1000 || mese < 1 || mese > 12 || giorno < 1 || ore > 23 || minuti > 59) return null;
  const t = Date.UTC(anno, mese - 1, giorno, ore, minuti);
  const controllo = new Date(t);
  return controllo.getUTCDate() === giorno && controllo.getUTCMonth() === mese - 1 ? t : null;
}

export function dataOraPrecedente(data: string, ora: string, ore: number): string | null {
  const t = istanteRilievo(data, ora);
  if (t === null || !Number.isFinite(ore) || ore < 0) return null;
  const precedente = new Date(t - Math.round(ore * 60) * 60000);
  if (!Number.isFinite(precedente.getTime())) return null;
  const due = (n: number) => String(n).padStart(2, '0');
  return `${due(precedente.getUTCDate())}/${due(precedente.getUTCMonth() + 1)}/${precedente.getUTCFullYear()} alle ${due(precedente.getUTCHours())}:${due(precedente.getUTCMinutes())}`;
}

export function collocaIntervallo(data: string, ora: string, l: Limiti): string | null {
  if (l.min === null && l.max === null) return null;
  const min = l.min ?? 0;
  if (l.max !== null && l.max < min) return null;
  const recente = dataOraPrecedente(data, ora, min);
  if (!recente) return null;
  if (l.max === null) return `non oltre il ${recente}`;
  const remoto = dataOraPrecedente(data, ora, l.max);
  if (!remoto) return null;
  return l.max === min ? `il ${recente}` : `tra il ${remoto} e il ${recente}`;
}
