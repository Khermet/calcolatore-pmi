export const virgola = (n: number, cifre = 1) => n.toFixed(cifre).replace('.', ',');

export const numero = (s: string) => Number(s.trim().replace(',', '.'));

export function formattaOre(ore: number): string {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  return m === 60 ? `${h + 1} h 0 min` : `${h} h ${m} min`;
}

// "HH:MM" della misurazione meno `ore` → orario del decesso e giorni da sottrarre.
export function orarioPrecedente(oraMisura: string, ore: number): { orario: string; giorniPrima: number } | null {
  const m = /^(\d{1,2})[:.](\d{2})$/.exec(oraMisura.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) return null;
  let minuti = hh * 60 + mm - Math.round(ore * 60);
  let giorniPrima = 0;
  while (minuti < 0) {
    minuti += 24 * 60;
    giorniPrima++;
  }
  const h = Math.floor(minuti / 60);
  const min = minuti % 60;
  return { orario: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, giorniPrima };
}
