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

// Come i reperti compaiono nel testo. Le frasi dello stesso gruppo (ipostasi, rigidità)
// si fondono: "ipostasi confluenti, non ancora fisse alla digitopressione".
const FRASI: Record<string, string> = {
  'ipostasi.assenti': 'ipostasi non ancora comparse',
  'ipostasi.inizio': 'ipostasi iniziali, non ancora confluenti',
  'ipostasi.confluenti': 'ipostasi confluenti, non ancora alla massima estensione',
  'ipostasi.massimo': 'ipostasi alla massima estensione',
  'digitopressione.scompaiono': 'ipostasi non ancora fisse alla digitopressione',
  'digitopressione.non-scompaiono': 'ipostasi fisse alla digitopressione',
  'spostamento.completo': 'ipostasi completamente trasferibili con il cambio di posizione',
  'spostamento.incompleto': 'ipostasi solo in parte trasferibili con il cambio di posizione',
  'spostamento.fisse': 'ipostasi non più trasferibili con il cambio di posizione',
  'rigidita.assente': 'rigidità cadaverica non ancora comparsa',
  'rigidita.iniziata': 'rigidità cadaverica non ancora completa',
  'rigidita.completa': 'rigidità cadaverica completa',
  'rigidita.risoluzione': 'rigidità cadaverica in fase di risoluzione',
  'ripristino.si-ripristina': 'rigidità cadaverica che si ricostituisce dopo risoluzione manuale',
  'ripristino.non-si-ripristina': 'rigidità cadaverica che non si ricostituisce dopo risoluzione manuale',
  'zsako.presente': 'fenomeno di Zsako presente',
  'idiomuscolare.presente': 'tumore idiomuscolare evocabile alla percussione del bicipite',
  'idiomuscolare.assente': 'tumore idiomuscolare non evocabile',
  'occhio.nessuna': "nessuna reazione alla stimolazione elettrica dell'orbicolare dell'occhio",
  'tropicamide.positiva': 'midriasi dopo tropicamide subcongiuntivale',
  'acetilcolina.positiva': 'miosi dopo acetilcolina subcongiuntivale',
};
const GRUPPI = ['ipostasi ', 'rigidità cadaverica '];

export function frasiReperti(scelte: Scelte): string {
  const frasi = CRITERI.flatMap((c) => {
    const id = scelte[c.id];
    const o = c.opzioni.find((x) => x.id === id);
    if (!o) return [];
    const grado = /^grado-(.+)$/.exec(o.id);
    if (grado) return [`reazione di grado ${grado[1]} alla stimolazione elettrica dell'orbicolare dell'occhio`];
    return [FRASI[`${c.id}.${o.id}`] ?? `${c.titolo.toLowerCase()}: ${o.etichetta.toLowerCase()}`];
  });
  // fusione per gruppo: dalla seconda frase in poi si toglie il sostantivo ripetuto
  const parti: string[] = [];
  let gruppoPrecedente: string | null = null;
  for (const f of frasi) {
    const gruppo = GRUPPI.find((g) => f.startsWith(g)) ?? null;
    if (gruppo && gruppo === gruppoPrecedente) parti[parti.length - 1] += `, ${f.slice(gruppo.length)}`;
    else parti.push(f);
    gruppoPrecedente = gruppo;
  }
  return parti.join('; ');
}

const intervallo = (l: { min: number; max: number | null }) =>
  l.max === null ? `non inferiore a ${virgola(l.min)} ore` : `di ${virgola(l.min)}-${virgola(l.max)} ore`;

// "il giorno precedente, tra le ore 16:30 e le ore 19:00" o, a cavallo di due giorni,
// "tra le ore 22:15 del giorno precedente e le ore 01:30"
function collocazione(oraMisura: string | undefined, l: { min: number; max: number | null }): string | null {
  if (!oraMisura) return null;
  const piuRecente = orarioPrecedente(oraMisura, l.min);
  if (!piuRecente) return null;
  const giorno = (g: number) => (g === 0 ? '' : g === 1 ? ' del giorno precedente' : ` di ${g} giorni prima`);
  if (l.max === null) return `non oltre le ore ${piuRecente.orario}${giorno(piuRecente.giorniPrima)}`;
  const menoRecente = orarioPrecedente(oraMisura, l.max)!;
  if (menoRecente.giorniPrima === piuRecente.giorniPrima) {
    const g = piuRecente.giorniPrima;
    const quando = g === 0 ? '' : g === 1 ? 'il giorno precedente, ' : `${g} giorni prima, `;
    return `${quando}tra le ore ${menoRecente.orario} e le ore ${piuRecente.orario}`;
  }
  return `tra le ore ${menoRecente.orario}${giorno(menoRecente.giorniPrima)} e le ore ${piuRecente.orario}${giorno(piuRecente.giorniPrima)}`;
}

export function testoVerbale(d: DatiCaso): string {
  const e = stimaPMI(d);
  const incerta = intervalloIncerto(d);
  const quando = d.oraMisura ? `Alle ore ${d.oraMisura}` : 'Al momento del sopralluogo';
  const ambiente = incerta
    ? `con temperatura ambiente non costante, stimata tra ${virgola(d.taMin!)} e ${virgola(d.taMax!)} °C`
    : `con temperatura ambiente di ${virgola(d.tAmbiente)} °C`;
  const condizioni = d.condizioni
    ? `condizioni di raffreddamento: ${d.condizioni} (fattore correttivo ${virgola(d.cf, 2)})`
    : `fattore correttivo ${virgola(d.cf, 2)}`;
  let primo =
    `${quando} è stata rilevata una temperatura rettale di ${virgola(d.tRettale)} °C, ${ambiente}; ` +
    `peso corporeo ${virgola(d.peso, 0)} kg; ${condizioni}.`;
  if (!e.ok && !incerta) return `${primo} Il metodo di Henssge non è applicabile al caso: ${e.errore}`;

  let nomogramma: Limiti = { min: null, max: null };
  if (incerta) {
    nomogramma = { min: incerta.min, max: incerta.max };
    primo +=
      ' In applicazione del nomogramma di Henssge all\'intera forbice di temperatura ambiente plausibile, ' +
      `l'intervallo post-mortale, comprensivo dei limiti al 95%, risulta ${intervallo(incerta)}.`;
  } else if (e.ok) {
    primo += ` In applicazione del nomogramma di Henssge l'intervallo post-mortale risulta di ${virgola(e.ore)} ore`;
    if (e.margine === null) {
      primo += '; con Q ≤ 0,2 non sono disponibili limiti al 95% e la stima ha valore solo orientativo.';
    } else {
      nomogramma = { min: Math.max(0, e.ore - e.margine), max: e.ore + e.margine };
      primo += ` (limiti al 95%: ${virgola(nomogramma.min!)}-${virgola(nomogramma.max!)} ore).`;
    }
  }

  const scelte = d.scelte ?? {};
  const reperti = frasiReperti(scelte);
  const termico = nomogramma.min !== null ? { min: nomogramma.min, max: nomogramma.max } : null;
  if (!reperti) {
    const dove = termico && collocazione(d.oraMisura, termico);
    return dove ? `${primo} Il decesso è pertanto collocabile ${dove}.` : primo;
  }

  const r = combina(nomogramma, scelte);
  let secondo: string;
  if (r.contraddizione) {
    secondo =
      `I fenomeni cadaverici rilevati (${reperti}) non risultano compatibili con l'intervallo termico: ` +
      'le condizioni di raffreddamento vanno riconsiderate.';
  } else {
    const ristretto = !termico || r.min > termico.min + 1e-9 || (r.max !== null && (termico.max === null || r.max < termico.max - 1e-9));
    const dove = collocazione(d.oraMisura, r);
    if (ristretto) {
      const quanto =
        r.max === null
          ? `risulta ${intervallo(r)}`
          : termico
            ? `si restringe a ${virgola(r.min)}-${virgola(r.max)} ore`
            : `risulta ${intervallo(r)}`;
      secondo = `Tenuto conto dei fenomeni cadaverici rilevati (${reperti}), l'intervallo ${quanto}`;
      secondo += dove ? `, compatibile con un decesso avvenuto ${dove}.` : '.';
    } else {
      secondo = `I fenomeni cadaverici rilevati (${reperti}) sono compatibili con tale intervallo e non consentono di restringerlo`;
      secondo += dove ? `; il decesso è pertanto collocabile ${dove}.` : '.';
    }
  }
  return `${primo}\n\n${secondo}`;
}
