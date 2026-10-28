import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import type { Limiti, Scelte } from '../composto.ts';
import { numero, virgola } from '../formato.ts';
import { stimaPMI } from '../henssge.ts';
import { simula } from '../incertezza.ts';
import { collocaIntervallo, istanteRilievo } from '../rilevazione.ts';
import { Campo, Colonne, Interruttore, Pannello, Passaggi, SceltaFattore, TestoVerbale } from '../ui/componenti.tsx';
import { MetodoComposto, riassuntoComposto } from '../ui/MetodoComposto.tsx';
import { Nomogramma } from '../ui/Nomogramma.tsx';
import { RisultatoHenssge, RisultatoIncerto } from '../ui/Risultati.tsx';
import { stili } from '../ui/stili.ts';

const due = (n: number) => String(n).padStart(2, '0');
// data di oggi come GG/MM/AAAA, per precompilare il campo
function oggi(): string {
  const d = new Date();
  return `${due(d.getDate())}/${due(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function Calcolo() {
  const [tRettale, setTRettale] = useState('30');
  const [tAmbiente, setTAmbiente] = useState('15');
  const [incerta, setIncerta] = useState(false);
  const [taMin, setTaMin] = useState('12');
  const [taMax, setTaMax] = useState('18');
  const [peso, setPeso] = useState('70');
  const [cf, setCf] = useState('1,0');
  const [condizioni, setCondizioni] = useState('');
  const [dataMisura, setDataMisura] = useState(oggi);
  const [oraMisura, setOraMisura] = useState('');
  const [scelte, setScelte] = useState<Scelte>({});

  // data e ora servono solo a collocare il decesso nel calendario: il calcolo funziona anche senza
  const rilievoValido = istanteRilievo(dataMisura, oraMisura) !== null;
  const rilievoErrato = oraMisura.trim() !== '' && !rilievoValido;
  const tr = numero(tRettale);
  const min = numero(taMin);
  const max = numero(taMax);
  const ta = incerta ? (min + max) / 2 : numero(tAmbiente);
  const dati = { tRettale: tr, tAmbiente: ta, peso: numero(peso), cf: numero(cf) };
  const esito = stimaPMI(dati);
  const simulazione = incerta ? simula({ tRettale: tr, taMin: min, taMax: max, peso: dati.peso, cf: dati.cf }) : null;

  let nomogramma: Limiti = { min: null, max: null };
  if (simulazione) {
    if (simulazione.ok && Number.isFinite(simulazione.inviluppoMin))
      nomogramma = { min: simulazione.inviluppoMin, max: simulazione.inviluppoMax };
  } else if (esito.ok && esito.margine !== null) {
    nomogramma = { min: Math.max(0, esito.ore - esito.margine), max: esito.ore + esito.margine };
  }

  const collocazioneTermica = rilievoValido ? collocaIntervallo(dataMisura, oraMisura, nomogramma) : null;

  const caso = {
    ...dati,
    ...(incerta ? { taMin: min, taMax: max } : {}),
    condizioni: condizioni || undefined,
    // data passata al verbale solo se forma con l'ora un istante valido
    dataMisura: rilievoValido ? dataMisura.trim() : undefined,
    oraMisura: oraMisura.trim() || undefined,
    scelte,
  };

  return (
    <ScrollView contentContainerStyle={stili.contenuto} keyboardShouldPersistTaps="handled">
      <Text style={stili.titolo}>Epoca della morte</Text>
      <Text style={stili.sottotitolo}>Metodo di Henssge e metodo composto</Text>

      {incerta ? (
        <Colonne>
          <Campo etichetta="Rettale" valore={tRettale} onChange={setTRettale} unita="°C" />
          <Campo etichetta="Ambiente min" valore={taMin} onChange={setTaMin} unita="°C" />
          <Campo etichetta="Ambiente max" valore={taMax} onChange={setTaMax} unita="°C" />
        </Colonne>
      ) : (
        <Colonne>
          <Campo etichetta="Rettale" valore={tRettale} onChange={setTRettale} unita="°C" />
          <Campo etichetta="Ambiente" valore={tAmbiente} onChange={setTAmbiente} unita="°C" />
        </Colonne>
      )}
      <Colonne>
        <Campo etichetta="Peso" valore={peso} onChange={setPeso} unita="kg" />
        <Campo
          etichetta="Fattore correttivo"
          valore={cf}
          onChange={(v) => {
            setCf(v);
            setCondizioni('');
          }}
          unita=""
        />
      </Colonne>
      <Colonne>
        <Campo etichetta="Data rilievo" valore={dataMisura} onChange={setDataMisura} unita="" tastiera="testo" segnaposto="GG/MM/AAAA" />
        <Campo etichetta="Ora rilievo" valore={oraMisura} onChange={setOraMisura} unita="" tastiera="testo" segnaposto="HH:MM" />
      </Colonne>
      {rilievoErrato && (
        <Text style={stili.errore} accessibilityRole="alert">
          Data (GG/MM/AAAA) o ora (HH:MM) non valide: il calcolo resta valido, ma senza date del decesso.
        </Text>
      )}
      <Interruttore
        attivo={incerta}
        onCambia={setIncerta}
        testoSi="Usa un valore unico di temperatura ambiente"
        testoNo="Temperatura ambiente incerta? Inserisci un intervallo"
      />
      <SceltaFattore
        cf={cf}
        onScelta={(v, descrizione) => {
          setCf(v);
          setCondizioni(descrizione);
        }}
      />

      {simulazione ? (
        <RisultatoIncerto esito={simulazione} taMin={min} taMax={max} />
      ) : (
        <RisultatoHenssge esito={esito} cf={dati.cf} peso={dati.peso} />
      )}
      {collocazioneTermica && <Text style={stili.risultatoNota}>Decesso {collocazioneTermica}</Text>}

      <Pannello titolo="Nomogramma" riassunto={esito.ok ? `lettura ${virgola(esito.ore)} h` : 'non applicabile'}>
        <Nomogramma tRettale={tr} tAmbiente={ta} peso={dati.peso} cf={dati.cf} esito={esito} />
        {incerta && (
          <Text style={stili.fonte}>Nel nomogramma la temperatura ambiente è il valore centrale dell&apos;intervallo.</Text>
        )}
      </Pannello>

      <Pannello titolo="Metodo composto" riassunto={riassuntoComposto(nomogramma, scelte)}>
        <MetodoComposto
          nomogramma={nomogramma}
          scelte={scelte}
          onScelte={setScelte}
          dataMisura={rilievoValido ? dataMisura : undefined}
          oraMisura={rilievoValido ? oraMisura : undefined}
        />
      </Pannello>
      <Pannello titolo="Passaggi del calcolo">
        <Passaggi dati={caso} />
      </Pannello>
      <Pannello titolo="Testo per il verbale" riassunto="da copiare">
        <TestoVerbale dati={caso} />
      </Pannello>

      <Text style={stili.avvertenza}>
        Strumento didattico. Non applicabile con irraggiamento, corpo spostato, ipotermia o cambiamenti marcati
        delle condizioni di raffreddamento (l&apos;intervallo di temperatura ambiente copre solo oscillazioni
        plausibili). Non sostituisce la valutazione del medico legale.
      </Text>
    </ScrollView>
  );
}
