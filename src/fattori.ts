// Fattori correttivi del peso corporeo secondo Henssge (riferimento: 70 kg).
// Fonte: Pellini E., "Revaluation of the Henssge nomogram", tesi di dottorato,
// Università di Verona, Tab. 1 "Corrective factors proposed by Henssge" (p. 18).
// Henssge (Forensic Sci Int 1992;54:51-56) ha mostrato che con isolamento termico
// marcato i fattori vanno aumentati per pesi inferiori: vedi `avvisoPeso`.

export type Fattore = {
  id: string;
  cf: number;
  indumenti: string;
  ambiente: string;
  bagnato: boolean;
};

export const FATTORI: Fattore[] = [
  { id: 'bagnato-nudo-acqua-corrente', cf: 0.35, indumenti: 'Nudo', ambiente: 'In acqua corrente', bagnato: true },
  { id: 'bagnato-nudo-acqua-ferma', cf: 0.5, indumenti: 'Nudo', ambiente: 'In acqua ferma', bagnato: true },
  { id: 'bagnato-nudo-aria-mossa', cf: 0.7, indumenti: 'Nudo, superficie bagnata', ambiente: 'Aria in movimento', bagnato: true },
  { id: 'bagnato-1-2-sottili-aria-mossa', cf: 0.7, indumenti: '1-2 strati sottili bagnati', ambiente: 'Aria in movimento', bagnato: true },
  { id: 'asciutto-nudo-aria-mossa', cf: 0.75, indumenti: 'Nudo', ambiente: 'Aria in movimento', bagnato: false },
  { id: 'asciutto-1-2-sottili-aria-mossa', cf: 0.9, indumenti: '1-2 strati sottili', ambiente: 'Aria in movimento', bagnato: false },
  { id: 'bagnato-2-spessi-aria-mossa', cf: 0.9, indumenti: '2 o più strati spessi bagnati', ambiente: 'Aria in movimento', bagnato: true },
  { id: 'asciutto-nudo-aria-ferma', cf: 1.0, indumenti: 'Nudo', ambiente: 'Aria ferma (standard)', bagnato: false },
  { id: 'asciutto-1-2-sottili-aria-ferma', cf: 1.1, indumenti: '1-2 strati sottili', ambiente: 'Aria ferma', bagnato: false },
  { id: 'bagnato-2-spessi-aria-ferma', cf: 1.1, indumenti: '2 strati spessi bagnati', ambiente: 'Aria ferma', bagnato: true },
  { id: 'asciutto-2-3-sottili', cf: 1.2, indumenti: '2-3 strati sottili', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
  { id: 'asciutto-1-2-spessi', cf: 1.2, indumenti: '1-2 strati spessi', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
  { id: 'bagnato-oltre-2-spessi-aria-ferma', cf: 1.2, indumenti: 'Più di 2 strati spessi bagnati', ambiente: 'Aria ferma', bagnato: true },
  { id: 'asciutto-3-4-sottili', cf: 1.3, indumenti: '3-4 strati sottili', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
  { id: 'asciutto-piu-strati', cf: 1.4, indumenti: 'Più strati sottili/spessi', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
  { id: 'asciutto-coperta-spessa', cf: 1.8, indumenti: 'Coperta spessa', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
  { id: 'asciutto-coperta-indumenti', cf: 2.4, indumenti: 'Coperta spessa + indumenti', ambiente: 'Aria ferma o mossa, indifferente', bagnato: false },
];

// Soglia di prudenza per segnalare la dipendenza del fattore dal peso:
// non è un valore tabellare di Henssge, solo il punto oltre cui mostrare l'avviso.
export function avvisoPeso(cf: number, peso: number): string | null {
  if (cf > 1.4 && Math.abs(peso - 70) >= 20)
    return 'Con forte isolamento termico il fattore correttivo dipende dal peso (Henssge 1992): i valori tabellari valgono per 70 kg e vanno adattati.';
  return null;
}
