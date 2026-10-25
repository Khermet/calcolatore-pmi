// Spiegazione passo per passo del calcolo e testo pronto per il verbale.
import { T_INIZIALE, coefficienteB, stimaPMI } from './henssge.ts';
import { CRITERI, combina, type Limiti, type Scelte } from './composto.ts';
import { virgola, orarioPrecedente } from './formato.ts';
import { simula } from './incertezza.ts';

export type DatiCaso = {
  tRettale: number;
  tAmbiente: number; // valore unico, o valore centrale se è dato l'intervallo
  taMin?: number;
  taMax?: number;
  peso: number;
  cf: number;
  condizioni?: string; // descrizione di indumenti/ambiente
  oraMisura?: string; // "HH:MM"
  scelte?: Scelte;
};

export function passaggi(d: DatiCaso): string[] {
  const e = stimaPMI(d);
  const q = (d.tRettale - d.tAmbiente) / (T_INIZIALE - d.tAmbiente);
  const b = coefficienteB(d.peso, d.cf);
  const formula =
    d.tAmbiente <= 23 ? 'Q = 1,25·e^(B·t) - 0,25·e^(5·B·t)' : 'Q = 1,11·e^(B·t) - 0,11·e^(10·B·t)';
  const righe = [
    `1. Temperatura ridotta: Q = (Tr - Ta) / (37,2 - Ta) = (${virgola(d.tRettale)} - ${virgola(d.tAmbiente)}) / (37,2 - ${virgola(d.tAmbiente)}) = ${virgola(q, 3)}.`,
    `2. Peso corretto: ${virgola(d.cf, 2)} × ${virgola(d.peso, 0)} kg = ${virgola(d.cf * d.peso, 1)} kg (fattore correttivo × peso).`,
    `3. Costante di raffreddamento: B = -1,2815 × (peso corretto)^-0,625 + 0,0284 = ${virgola(b, 4)}.`,
    `4. Con Ta ${d.tAmbiente <= 23 ? '≤' : '>'} 23 °C si risolve ${formula} per t.`,
  ];
  if (!e.ok) {
    righe.push(`5. Il modello non è applicabile: ${e.errore}`);
    return righe;
  }
  righe[3] += ` Risultato: t = ${virgola(e.ore)} ore.`;
  if (e.margine === null) {
    righe.push('5. Q ≤ 0,2 o fascia non coperta dal nomogramma: nessun limite al 95% disponibile.');
  } else {
    const fascia = e.q > 0.5 ? 'Q > 0,5' : e.q > 0.3 ? '0,3 < Q ≤ 0,5' : '0,2 < Q ≤ 0,3';
    const condizione = d.cf === 1 ? 'condizioni standard' : 'fattore correttivo applicato';
    righe.push(
      `5. Limiti al 95%: ${fascia}, ${condizione} → ±${virgola(e.margine)} h, quindi da ${virgola(Math.max(0, e.ore - e.margine))} a ${virgola(e.ore + e.margine)} ore.`,
    );
  }
  const s = intervalloIncerto(d);
  if (s)
    righe.push(
      `6. Temperatura ambiente incerta (${virgola(d.taMin!)}-${virgola(d.taMax!)} °C): i passaggi 1-5 si ripetono per ${s.estrazioni} valori estratti a caso nella forbice; l'intervallo esteso va dal più basso limite inferiore (${virgola(s.min)} h) al più alto limite superiore (${virgola(s.max)} h).`,
    );
  return righe;
}

function intervalloIncerto(d: DatiCaso): { min: number; max: number; estrazioni: number } | null {
  if (d.taMin === undefined || d.taMax === undefined) return null;
  const s = simula({ tRettale: d.tRettale, taMin: d.taMin, taMax: d.taMax, peso: d.peso, cf: d.cf });
  if (!s.ok || !Number.isFinite(s.inviluppoMin)) return null;
  return { min: s.inviluppoMin, max: s.inviluppoMax, estrazioni: s.validi + s.scartati };
}

function frase(oraMisura: string | undefined, limiti: { min: number; max: number | null }): string {
  const base =
    limiti.max === null
      ? `non inferiore a ${virgola(limiti.min)} ore`
      : `compreso tra ${virgola(limiti.min)} e ${virgola(limiti.max)} ore`;
  if (!oraMisura) return base;
  const dopo = orarioPrecedente(oraMisura, limiti.min);
  const prima = limiti.max === null ? null : orarioPrecedente(oraMisura, limiti.max);
  if (!dopo) return base;
  const giorno = (g: number) => (g === 0 ? '' : g === 1 ? ' del giorno precedente' : ` di ${g} giorni prima`);
  if (!prima) return `${base}, cioè decesso avvenuto non oltre le ore ${dopo.orario}${giorno(dopo.giorniPrima)}`;
  return `${base}, cioè decesso collocabile tra le ore ${prima.orario}${giorno(prima.giorniPrima)} e le ore ${dopo.orario}${giorno(dopo.giorniPrima)}`;
}

export function testoVerbale(d: DatiCaso): string {
  const e = stimaPMI(d);
  const quando = d.oraMisura ? `Alle ore ${d.oraMisura}` : 'Al momento del sopralluogo';
  const condizioni = d.condizioni ? `${d.condizioni}, ` : '';
  const incerta = intervalloIncerto(d);
  const ambiente = incerta
    ? `con temperatura ambiente non costante, stimata tra ${virgola(d.taMin!)} e ${virgola(d.taMax!)} °C`
    : `con temperatura ambiente di ${virgola(d.tAmbiente)} °C`;
  const premessa =
    `${quando} la temperatura rettale è risultata di ${virgola(d.tRettale)} °C, ${ambiente}; ` +
    `peso corporeo ${virgola(d.peso, 0)} kg; condizioni di raffreddamento: ${condizioni}fattore correttivo ${virgola(d.cf, 2)}.`;
  if (!e.ok && !incerta) return `${premessa} Il metodo di Henssge non è applicabile al caso: ${e.errore}`;

  let testo: string;
  let nomogramma: Limiti;
  if (incerta) {
    nomogramma = { min: incerta.min, max: incerta.max };
    testo =
      `${premessa} In applicazione del nomogramma di Henssge a tutta la forbice di temperatura ambiente plausibile, ` +
      `l'intervallo post-mortale, inclusi i limiti al 95%, risulta ${frase(d.oraMisura, incerta)}.`;
  } else if (e.ok) {
    testo = `${premessa} In applicazione del nomogramma di Henssge, l'intervallo post-mortale stimato è di ${virgola(e.ore)} ore`;
    nomogramma =
      e.margine === null ? { min: null, max: null } : { min: Math.max(0, e.ore - e.margine), max: e.ore + e.margine };
    if (e.margine === null) testo += ', senza limiti di confidenza applicabili (Q ≤ 0,2): la stima ha valore solo orientativo.';
    else testo += `, con limiti al 95% ${frase(d.oraMisura, { min: nomogramma.min!, max: nomogramma.max })}.`;
  } else return premessa;

  const scelte = d.scelte ?? {};
  const reperti = CRITERI.flatMap((c) => {
    const o = c.opzioni.find((x) => x.id === scelte[c.id]);
    return o ? [`${c.titolo.toLowerCase()}: ${o.etichetta.toLowerCase()}`] : [];
  });
  if (reperti.length > 0) {
    const r = combina(nomogramma, scelte);
    testo += ` Sono stati inoltre rilevati i seguenti reperti: ${reperti.join('; ')}.`;
    testo += r.contraddizione
      ? ' Tali reperti non risultano compatibili con l\'intervallo termico: le condizioni di raffreddamento vanno riconsiderate.'
      : ` Integrando tali reperti secondo il metodo composto, l'intervallo post-mortale risulta ${frase(d.oraMisura, r)}.`;
  }
  return testo;
}
