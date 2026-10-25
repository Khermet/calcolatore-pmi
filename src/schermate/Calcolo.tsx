import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import type { Limiti, Scelte } from '../composto.ts';
import { numero, virgola } from '../formato.ts';
import { stimaPMI } from '../henssge.ts';
import { simula } from '../incertezza.ts';
import { Campo, Colonne, Interruttore, Pannello, Passaggi, SceltaFattore, TestoVerbale } from '../ui/componenti.tsx';
import { MetodoComposto, riassuntoComposto } from '../ui/MetodoComposto.tsx';
import { Nomogramma } from '../ui/Nomogramma.tsx';
import { RisultatoHenssge, RisultatoIncerto } from '../ui/Risultati.tsx';
import { stili } from '../ui/stili.ts';

export function Calcolo() {
  const [tRettale, setTRettale] = useState('30');
  const [tAmbiente, setTAmbiente] = useState('15');
  const [incerta, setIncerta] = useState(false);
  const [taMin, setTaMin] = useState('12');
  const [taMax, setTaMax] = useState('18');
  const [peso, setPeso] = useState('70');
  const [cf, setCf] = useState('1,0');
  const [condizioni, setCondizioni] = useState('');
  const [oraMisura, setOraMisura] = useState('');
  const [scelte, setScelte] = useState<Scelte>({});

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

  const caso = {
    ...dati,
    ...(incerta ? { taMin: min, taMax: max } : {}),
    condizioni: condizioni || undefined,
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
        <Campo etichetta="Ora misura" valore={oraMisura} onChange={setOraMisura} unita="" tastiera="testo" segnaposto="10:30" />
      </Colonne>
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

      <Pannello titolo="Nomogramma" riassunto={esito.ok ? `lettura ${virgola(esito.ore)} h` : 'non applicabile'}>
        <Nomogramma tRettale={tr} tAmbiente={ta} peso={dati.peso} cf={dati.cf} esito={esito} />
        {incerta && (
          <Text style={stili.fonte}>Nel nomogramma la temperatura ambiente è il valore centrale dell'intervallo.</Text>
        )}
      </Pannello>

      <Pannello titolo="Metodo composto" riassunto={riassuntoComposto(nomogramma, scelte)}>
        <MetodoComposto nomogramma={nomogramma} scelte={scelte} onScelte={setScelte} />
      </Pannello>
      <Pannello titolo="Passaggi del calcolo">
        <Passaggi dati={caso} />
      </Pannello>
      <Pannello titolo="Testo per il verbale" riassunto="da copiare">
        <TestoVerbale dati={caso} />
      </Pannello>

      <Text style={stili.avvertenza}>
        Strumento didattico. Non applicabile con irraggiamento, corpo spostato, ipotermia o cambiamenti marcati
        delle condizioni di raffreddamento (l'intervallo di temperatura ambiente copre solo oscillazioni
        plausibili). Non sostituisce la valutazione del medico legale.
      </Text>
    </ScrollView>
  );
}
