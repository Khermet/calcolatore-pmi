// Casi esercitativi. Il primo è l'esempio pubblicato nella Fig. 2 di Henssge e
// Madea 2004; gli altri sono scenari didattici immaginari. Le soluzioni non sono
// scritte qui: le calcola l'app con lo stesso motore del calcolatore.
import type { Scelte } from './composto.ts';

export type Caso = {
  id: string;
  titolo: string;
  scenario: string;
  tRettale: number;
  tAmbiente: number;
  taMin?: number; // se presente, la temperatura ambiente è incerta
  taMax?: number;
  peso: number;
  cf: number;
  condizioni: string;
  oraMisura: string;
  scelte: Scelte;
  domanda: string;
  nota?: string;
};

export const CASI: Caso[] = [
  {
    id: 'fig2',
    titolo: 'L\'esempio del nomogramma',
    scenario:
      'Cadavere vestito con 3-4 strati sottili, aria ferma. Temperatura rettale 27 °C, ambiente 15 °C, peso 70 kg.',
    tRettale: 27,
    tAmbiente: 15,
    peso: 70,
    cf: 1.3,
    condizioni: '3-4 strati sottili, aria ferma',
    oraMisura: '10:00',
    scelte: {},
    domanda: 'Qual è l\'intervallo post-mortale con i suoi limiti al 95%?',
    nota: 'Esempio pubblicato: Henssge e Madea, Forensic Sci Int 2004, Fig. 2 (circa 17,2 h ± 2,8 h).',
  },
  {
    id: 'letto',
    titolo: 'A letto sotto il piumone',
    scenario:
      'Donna di 60 kg trovata a letto, in pigiama sotto un piumone spesso. Stanza a 20 °C, finestre chiuse. ' +
      'Alle 08:30 temperatura rettale 33 °C. Ipostasi confluenti che scompaiono alla digitopressione; rigidità comparsa ma non ancora completa.',
    tRettale: 33,
    tAmbiente: 20,
    peso: 60,
    cf: 2.4,
    condizioni: 'coperta spessa con indumenti',
    oraMisura: '08:30',
    scelte: { ipostasi: 'confluenti', digitopressione: 'scompaiono', rigidita: 'iniziata' },
    domanda: 'Quale fattore correttivo scegli? Quale intervallo ottieni, e i reperti non termici lo restringono?',
    nota: 'Con forte isolamento e peso lontano da 70 kg il fattore tabellare va adattato al peso (Henssge 1992): discutine il limite.',
  },
  {
    id: 'notte',
    titolo: 'All\'aperto di notte',
    scenario:
      'Uomo di 80 kg, nudo, rinvenuto alle 07:00 su un prato con vento. Temperatura rettale 24 °C. ' +
      'La stazione meteo indica una minima notturna di 6 °C e 11 °C al rinvenimento. Rigidità completa; ipostasi che si spostano in parte.',
    tRettale: 24,
    tAmbiente: 8,
    taMin: 6,
    taMax: 11,
    peso: 80,
    cf: 0.75,
    condizioni: 'nudo, aria in movimento',
    oraMisura: '07:00',
    scelte: { rigidita: 'completa', spostamento: 'incompleto' },
    domanda: 'Quanto cambia l\'intervallo se consideri tutta la forbice di temperatura notturna invece di un valore unico?',
  },
  {
    id: 'estate',
    titolo: 'Appartamento d\'estate',
    scenario:
      'Uomo di 75 kg, nudo sul pavimento in legno, aria ferma. Appartamento a 26 °C. ' +
      'Alle 15:00 temperatura rettale 34 °C. Ipostasi confluenti, non ancora alla massima estensione; rigidità non ancora comparsa.',
    tRettale: 34,
    tAmbiente: 26,
    peso: 75,
    cf: 1,
    condizioni: 'nudo, aria ferma',
    oraMisura: '15:00',
    scelte: { ipostasi: 'confluenti', rigidita: 'assente' },
    domanda: 'Quale equazione si applica sopra i 23 °C, e quale reperto fissa il limite superiore?',
  },
  {
    id: 'acqua',
    titolo: 'In acqua ferma',
    scenario:
      'Corpo nudo di 70 kg recuperato da un laghetto (acqua ferma a 12 °C) alle 11:00. Temperatura rettale 22 °C. ' +
      'Rigidità completa; alla percussione del bicipite si forma un tumore idiomuscolare.',
    tRettale: 22,
    tAmbiente: 12,
    peso: 70,
    cf: 0.5,
    condizioni: 'nudo in acqua ferma',
    oraMisura: '11:00',
    scelte: { rigidita: 'completa', idiomuscolare: 'presente' },
    domanda: 'Perché in acqua il fattore correttivo è inferiore a 1, e che effetto ha sulla stima?',
  },
];
