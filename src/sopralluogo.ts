// Checklist di supporto al sopralluogo giudiziario (esame del cadavere sul luogo).
// Fonti:
//  - R99: Consiglio d'Europa, Raccomandazione n. R (99) 3 sull'armonizzazione delle
//    regole dell'autopsia medico-legale (2 febbraio 1999), Principio I "Scene
//    investigation", nella versione SGRM "Swiss Principles and Rules for Medico-Legal
//    Autopsy" (rev. 2019).
//  - Puccini: C. Puccini, Istituzioni di medicina legale, cap. 22 "Sopralluogo
//    giudiziario" (Ispezione della località, Esame del cadavere, Ricerca delle impronte,
//    Ricerca delle macchie, Il sopralluogo negli incidenti del traffico).
// Le voci sono riformulazioni sintetiche, non citazioni.

export type Voce = { id: string; testo: string; fonte: string };
export type Sezione = { id: string; titolo: string; nota?: string; facoltativa?: boolean; voci: Voce[] };

const R = (punto: string) => `R(99)3, ${punto}`;
const P = 'Puccini, cap. 22';

export const SEZIONI: Sezione[] = [
  {
    id: 'arrivo',
    titolo: 'Arrivo e prime operazioni',
    voci: [
      // prima si individua chi c'è delle forze dell'ordine e chi coordina, poi si raccolgono le informazioni
      { id: 'forze-ordine', testo: "Individuare chi è presente delle forze dell'ordine e chi coordina le operazioni", fonte: R('I.a.2') },
      { id: 'circostanze', testo: 'Farsi riferire tutte le circostanze note della morte', fonte: R('I.b.2.a') },
      { id: 'testimoni', testo: "Raccogliere le notizie dei testimoni, in particolare di chi ha visto la persona in vita per l'ultima volta", fonte: R('I.b.1.d') },
      { id: 'persone', testo: 'Annotare chi è presente sul luogo (compito della polizia)', fonte: R('I.b.1.a') },
      { id: 'delimitazione', testo: 'Verificare che il luogo sia delimitato e protetto dagli estranei', fonte: `${P}; ${R('I.b.1.g')}` },
      { id: 'insieme', testo: 'Prima di toccare nulla, osservare la scena nel suo insieme', fonte: P },
      { id: 'foto-iniziali', testo: 'Assicurarsi che il corpo sia fotografato come è stato trovato', fonte: R('I.b.1.b, I.b.2.b') },
    ],
  },
  {
    id: 'luogo',
    titolo: 'Luogo',
    voci: [
      { id: 'accessi', testo: 'Vie di accesso e di uscita; porte, finestre e serrature: chiuse, aperte, segni di effrazione', fonte: P },
      { id: 'clima', testo: 'Temperatura, umidità e ventilazione del luogo (servono alla stima dell\'epoca della morte)', fonte: P },
      { id: 'visibilita', testo: 'Illuminazione e visibilità del luogo', fonte: P },
      { id: 'lotta', testo: 'Segni di lotta, disordine, oggetti rovesciati, tracce di trascinamento', fonte: P },
      { id: 'farmaci', testo: 'Farmaci, siringhe, flaconi, cibo, bevande e liquidi da repertare se si sospetta un avvelenamento', fonte: P },
      { id: 'armi-luogo', testo: 'Armi, strumenti lesivi, proiettili e loro segni su pareti, pavimento e mobili', fonte: P },
      { id: 'annessi', testo: 'Locali annessi: bagno, cucina, ripostigli, impianti a gas ed elettrici, scarichi', fonte: P },
      { id: 'grafici', testo: 'Fotografie, schizzi e planimetrie con le misure', fonte: P },
    ],
  },
  {
    id: 'cadavere',
    titolo: 'Esame del cadavere',
    nota: 'Ispezione esterna sommaria sul posto; l\'esame completo si rimanda all\'autopsia.',
    voci: [
      { id: 'ubicazione', testo: 'Ubicazione e distanza da punti fissi (porte, finestre) e da armi o mezzi lesivi', fonte: P },
      { id: 'posizione', testo: 'Posizione (supino, prono, sul fianco, seduto, sospeso, in acqua)', fonte: `${P}; ${R('I.b.2.c')}` },
      { id: 'atteggiamento', testo: 'Atteggiamento di arti e mani; oggetti impugnati e come', fonte: P },
      { id: 'integrita', testo: 'Integrità del corpo: mutilazioni, lesioni da animali, alterazioni post-mortali', fonte: P },
      { id: 'vesti', testo: 'Vesti: stato, slacciature, strappi, fori, bruciature; contenuto delle tasche; calzature e suole', fonte: `${P}; ${R('I.b.2.c')}` },
      { id: 'contenzione', testo: 'Bavagli e legature: posizione, materiale, giri, nodi; se si taglia, lasciare intatto il nodo', fonte: P },
      { id: 'connotati', testo: 'Se sconosciuto: connotati, dentatura e protesi, cicatrici, tatuaggi', fonte: P },
      { id: 'lesioni', testo: 'Lesioni apparenti, senza spostamenti impropri del corpo', fonte: `${P}; ${R('I.b.2.e')}` },
      { id: 'mani', testo: 'Mani: lesioni da difesa, materiale sotto le unghie, tracce di sparo', fonte: P },
      { id: 'bocca', testo: 'Cavo orale, soprattutto se si sospetta una soffocazione', fonte: P },
      { id: 'sangue-corpo', testo: 'Distribuzione delle macchie di sangue sul corpo e sulla scena', fonte: R('I.b.2.d') },
      { id: 'sacchetti', testo: 'Proteggere mani e capo con sacchetti di carta', fonte: R('I.b.1.f') },
    ],
  },
  {
    id: 'epoca',
    titolo: 'Epoca della morte',
    nota: 'I dati di questa sezione alimentano il calcolatore.',
    voci: [
      { id: 't-rettale', testo: 'Temperatura rettale, con ora della misura', fonte: R('I.b.2.f') },
      { id: 't-ambiente', testo: 'Temperatura ambiente vicino al corpo, con ora della misura', fonte: `${R('I.b.2.f')}; ${P}` },
      { id: 'raffreddamento', testo: 'Condizioni di raffreddamento: vesti e coperte, superficie di appoggio, correnti d\'aria, bagnato', fonte: P },
      { id: 'peso', testo: 'Peso corporeo (misurato o stimato)', fonte: 'Henssge e Madea 2004' },
      { id: 'rigidita', testo: 'Rigidità: distribuzione e intensità', fonte: `${R('I.b.2.c, f')}; ${P}` },
      { id: 'ipostasi', testo: 'Ipostasi: distribuzione, coerenza con la posizione, digitopressione, migrabilità', fonte: `${R('I.b.2.c, f')}; ${P}` },
      { id: 'putrefazione', testo: 'Segni di putrefazione', fonte: R('I.b.2.c, f') },
    ],
  },
  {
    id: 'tracce',
    titolo: 'Tracce e reperti',
    voci: [
      { id: 'impronte', testo: 'Impronte di mani, piedi nudi o calzati, denti, animali; visibili o latenti', fonte: P },
      { id: 'macchie-sangue', testo: 'Macchie di sangue: sede, forma (colature, gocce, spruzzi, pozze), estensione, stato', fonte: P },
      { id: 'altre-macchie', testo: 'Altre macchie: sperma, vomito, urine, feci, saliva', fonte: P },
      { id: 'peli', testo: 'Peli, capelli, fibre, terriccio e detriti su corpo e vesti', fonte: P },
      { id: 'prelievi', testo: 'Prelievi su stoffa con un ritaglio non imbrattato come controllo', fonte: P },
      { id: 'sequestro', testo: 'Armi e reperti rilevanti sequestrati per gli esami successivi (compito della polizia)', fonte: R('I.b.1.c, e') },
    ],
  },
  {
    id: 'stradale',
    titolo: 'Incidente stradale',
    facoltativa: true,
    voci: [
      { id: 'pos-veicolo', testo: 'Posizione delle vittime rispetto ai veicoli; conducente e trasportati', fonte: P },
      { id: 'soccorsi', testo: 'Il corpo è stato spostato dai soccorritori?', fonte: P },
      { id: 'strada', testo: 'Tracce su strada: frenata, rotolamento, sangue e materiale biologico', fonte: P },
      { id: 'veicolo', testo: 'Tracce biologiche sui veicoli e negli abitacoli', fonte: P },
      { id: 'pneumatici', testo: 'Impronte di pneumatici sulle vesti da confrontare con i veicoli', fonte: P },
    ],
  },
  {
    id: 'chiusura',
    titolo: 'Chiusura',
    voci: [
      { id: 'trasporto', testo: 'Trasporto e conservazione in cella frigorifera in posizione supina', fonte: R('I.b.2.g') },
      { id: 'scostamenti', testo: 'Annotare ogni scostamento da questi passaggi e il motivo', fonte: R('I.a.3') },
    ],
  },
];

export type Spunte = Record<string, boolean>;
export const chiave = (s: Sezione, v: Voce) => `${s.id}.${v.id}`;

export function avanzamento(spunte: Spunte, conFacoltative: boolean): { fatte: number; totali: number } {
  let fatte = 0;
  let totali = 0;
  for (const s of SEZIONI) {
    if (s.facoltativa && !conFacoltative) continue;
    for (const v of s.voci) {
      totali++;
      if (spunte[chiave(s, v)]) fatte++;
    }
  }
  return { fatte, totali };
}

// Testo da copiare: per sezione, voci fatte e da fare.
export function testoChecklist(spunte: Spunte, conFacoltative: boolean, intestazione?: string): string {
  const righe: string[] = [];
  if (intestazione) righe.push(intestazione, '');
  for (const s of SEZIONI) {
    if (s.facoltativa && !conFacoltative) continue;
    righe.push(s.titolo.toUpperCase());
    for (const v of s.voci) righe.push(`${spunte[chiave(s, v)] ? '[x]' : '[ ]'} ${v.testo}`);
    righe.push('');
  }
  const { fatte, totali } = avanzamento(spunte, conFacoltative);
  righe.push(`Completate ${fatte} voci su ${totali}.`);
  return righe.join('\n');
}
