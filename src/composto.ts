// Metodo composto (Henssge et al., Int J Legal Med 2000;113:303-331): l'intervallo
// del nomogramma viene ristretto dai criteri non termici. Ogni reperto fornisce un
// limite inferiore (il fenomeno è già comparso/assente da tempo) o superiore.
// Dati: Henssge C, Madea B. Forensic Sci Int 2004;144:167-175.
//   - Ipostasi: Tab. 2 (limiti inferiore e superiore).
//   - Rigidità: Tab. 1, colonne "Variations" (sono i valori usati nella Fig. 7).
//   - Eccitabilità elettrica dell'orbicolare dell'occhio: Fig. 4 (media ± limiti 95%).
//   - Iride: testo p. 172, limitazione a 30 h (tropicamide, Mydriaticum Roche) e 46 h (acetilcolina).
//   - Eccitabilità meccanica: Zirn A et al., Int J Legal Med 2026;140:3367-3378
//     (doi 10.1007/s00414-026-03811-3), Tab. 1: fenomeno di Zsako < 2,5 h;
//     tumore idiomuscolare > 1,5 h e < 13 h (limite superiore confermato da
//     Warther et al., Int J Legal Med 2012;126:399-405, su 270 casi).
//     Come nella Fig. 7 di Henssge e Madea: reazione presente → limite superiore,
//     reazione assente → limite inferiore.
// Nella Fig. 7 compaiono anche orbicolare della bocca, atropina/ciclopentolato e i
// limiti inferiori dell'iride: non sono implementati.

export type Limiti = { min: number | null; max: number | null };

// `breve` è il testo del pulsante; `etichetta` la forma estesa per verbale e riepiloghi.
export type Opzione = { id: string; etichetta: string; breve?: string; limiti: Limiti };
// Cosa serve per rilevarlo: niente (ispezione e manovre), uno stimolatore elettrico
// o un collirio da instillare/iniettare.
export type Requisito = 'nessuno' | 'stimolatore' | 'farmaco';
export type Criterio = {
  id: string;
  titolo: string;
  nota?: string; // come si rileva, sotto il titolo
  fonte: string;
  requisito: Requisito;
  opzioni: Opzione[];
};

const L = (min: number | null, max: number | null): Limiti => ({ min, max });

// Eccitabilità elettrica, gradi I-VI (Fig. 4: a = I ... f = VI): media ± limite al 95%.
const GRADI_OCCHIO: { grado: string; media: number; delta: number }[] = [
  { grado: 'I', media: 13.5, delta: 8.5 },
  { grado: 'II', media: 10.5, delta: 5.5 },
  { grado: 'III', media: 8.25, delta: 4.75 },
  { grado: 'IV', media: 5.5, delta: 2.5 },
  { grado: 'V', media: 4.5, delta: 2.5 },
  { grado: 'VI', media: 3.5, delta: 2.5 },
];

// Grado k osservato: il limite superiore è quello del grado k (positivo),
// il limite inferiore è quello del grado k+1 (negativo); nessuna reazione = grado I negativo.
const opzioniOcchio: Opzione[] = [
  {
    id: 'nessuna',
    etichetta: 'Nessuna reazione',
    breve: 'Nessuna',
    limiti: L(GRADI_OCCHIO[0].media - GRADI_OCCHIO[0].delta, null),
  },
  ...GRADI_OCCHIO.map((g, k) => {
    const succ = GRADI_OCCHIO[k + 1];
    return {
      id: `grado-${g.grado}`,
      etichetta: `Grado ${g.grado}`,
      breve: g.grado,
      limiti: L(succ ? succ.media - succ.delta : null, g.media + g.delta),
    };
  }),
];

export const CRITERI: Criterio[] = [
  {
    id: 'ipostasi',
    requisito: 'nessuno',
    titolo: 'Ipostasi',
    fonte: 'Tab. 2',
    opzioni: [
      { id: 'assenti', etichetta: 'Non ancora comparse', breve: 'Assenti', limiti: L(null, 3) },
      { id: 'inizio', etichetta: 'Comparse, non confluenti', breve: 'Iniziali', limiti: L(0.25, 4) },
      { id: 'confluenti', etichetta: 'Confluenti, non ancora al massimo', breve: 'Confluenti', limiti: L(1, 16) },
      { id: 'massimo', etichetta: 'Massima estensione', breve: 'Massime', limiti: L(3, null) },
    ],
  },
  {
    id: 'digitopressione',
    requisito: 'nessuno',
    titolo: 'Ipostasi alla digitopressione',
    fonte: 'Tab. 2',
    opzioni: [
      { id: 'scompaiono', etichetta: 'Scompaiono alla pressione del pollice', breve: 'Scompaiono', limiti: L(null, 20) },
      { id: 'non-scompaiono', etichetta: 'Non scompaiono più', breve: 'Fisse', limiti: L(1, null) },
    ],
  },
  {
    id: 'spostamento',
    requisito: 'nessuno',
    titolo: 'Spostamento delle ipostasi',
    nota: 'dopo cambio di posizione',
    fonte: 'Tab. 2',
    opzioni: [
      { id: 'completo', etichetta: 'Si spostano completamente', breve: 'Completo', limiti: L(null, 6) },
      { id: 'incompleto', etichetta: 'Si spostano in parte', breve: 'Parziale', limiti: L(2, 24) },
      { id: 'fisse', etichetta: 'Non si spostano', breve: 'Nessuno', limiti: L(4, null) },
    ],
  },
  {
    id: 'rigidita',
    requisito: 'nessuno',
    titolo: 'Rigidità cadaverica',
    fonte: 'Tab. 1',
    opzioni: [
      { id: 'assente', etichetta: 'Non ancora comparsa', breve: 'Assente', limiti: L(null, 7) },
      { id: 'iniziata', etichetta: 'Comparsa, non completa', breve: 'Parziale', limiti: L(null, 20) },
      { id: 'completa', etichetta: 'Completa', limiti: L(2, null) },
      { id: 'risoluzione', etichetta: 'In risoluzione', limiti: L(24, null) },
    ],
  },
  {
    id: 'ripristino',
    requisito: 'nessuno',
    titolo: 'Ricostituzione della rigidità',
    nota: 'dopo risoluzione manuale',
    fonte: 'Tab. 1',
    opzioni: [
      { id: 'si-ripristina', etichetta: 'Si ricostituisce', breve: 'Sì', limiti: L(null, 8) },
      { id: 'non-si-ripristina', etichetta: 'Non si ricostituisce', breve: 'No', limiti: L(2, null) },
    ],
  },
  {
    id: 'zsako',
    requisito: 'nessuno',
    titolo: 'Fenomeno di Zsako',
    nota: 'percussione: contrazione propagata a tutto il muscolo',
    fonte: 'Zirn 2026, Tab. 1',
    opzioni: [{ id: 'presente', etichetta: 'Presente', limiti: L(null, 2.5) }],
  },
  {
    id: 'idiomuscolare',
    requisito: 'nessuno',
    titolo: 'Tumore idiomuscolare',
    nota: 'percussione del bicipite',
    fonte: 'Zirn 2026, Tab. 1',
    opzioni: [
      { id: 'presente', etichetta: 'Presente', limiti: L(null, 13) },
      { id: 'assente', etichetta: 'Assente', limiti: L(1.5, null) },
    ],
  },
  {
    id: 'occhio',
    requisito: 'stimolatore',
    titolo: 'Eccitabilità elettrica',
    nota: 'orbicolare dell\'occhio, gradi I-VI di Klein',
    fonte: 'Fig. 4',
    opzioni: opzioniOcchio,
  },
  {
    id: 'tropicamide',
    requisito: 'farmaco',
    titolo: 'Iride: tropicamide',
    nota: 'iniezione subcongiuntivale',
    fonte: 'p. 172',
    opzioni: [{ id: 'positiva', etichetta: 'Midriasi (reazione positiva)', breve: 'Midriasi', limiti: L(null, 30) }],
  },
  {
    id: 'acetilcolina',
    requisito: 'farmaco',
    titolo: 'Iride: acetilcolina',
    nota: 'iniezione subcongiuntivale',
    fonte: 'p. 172',
    opzioni: [{ id: 'positiva', etichetta: 'Miosi (reazione positiva)', breve: 'Miosi', limiti: L(null, 46) }],
  },
];

export type Scelte = Record<string, string | undefined>;

export type EsitoComposto = {
  min: number;
  max: number | null;
  contraddizione: boolean;
  // criteri che hanno effettivamente ristretto l'intervallo del nomogramma
  determinanti: { min: string | null; max: string | null };
};

export function combina(nomogramma: Limiti, scelte: Scelte): EsitoComposto {
  let min = nomogramma.min ?? 0;
  let max = nomogramma.max;
  const determinanti: EsitoComposto['determinanti'] = { min: null, max: null };

  for (const c of CRITERI) {
    const o = c.opzioni.find((x) => x.id === scelte[c.id]);
    if (!o) continue;
    if (o.limiti.min !== null && o.limiti.min > min) {
      min = o.limiti.min;
      determinanti.min = `${c.titolo}: ${o.etichetta.toLowerCase()}`;
    }
    if (o.limiti.max !== null && (max === null || o.limiti.max < max)) {
      max = o.limiti.max;
      determinanti.max = `${c.titolo}: ${o.etichetta.toLowerCase()}`;
    }
  }
  return { min, max, contraddizione: max !== null && min > max, determinanti };
}
