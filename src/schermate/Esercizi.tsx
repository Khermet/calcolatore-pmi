import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CASI, type Caso } from '../casi.ts';
import { combina, type Limiti, type Scelte } from '../composto.ts';
import { numero, virgola } from '../formato.ts';
import { stimaPMI } from '../henssge.ts';
import { simula } from '../incertezza.ts';
import { Campo, Colonne, Pannello, Passaggi, TestoVerbale } from '../ui/componenti.tsx';
import { MetodoComposto, riassuntoComposto } from '../ui/MetodoComposto.tsx';
import { Nomogramma } from '../ui/Nomogramma.tsx';
import { RisultatoHenssge, RisultatoIncerto } from '../ui/Risultati.tsx';
import { stili } from '../ui/stili.ts';

function limitiNomogramma(c: Caso): Limiti {
  if (c.taMin !== undefined && c.taMax !== undefined) {
    const s = simula({ tRettale: c.tRettale, taMin: c.taMin, taMax: c.taMax, peso: c.peso, cf: c.cf });
    return s.ok && Number.isFinite(s.inviluppoMin) ? { min: s.inviluppoMin, max: s.inviluppoMax } : { min: null, max: null };
  }
  const e = stimaPMI(c);
  return e.ok && e.margine !== null ? { min: Math.max(0, e.ore - e.margine), max: e.ore + e.margine } : { min: null, max: null };
}

function Esercizio(props: { caso: Caso; onIndietro: () => void }) {
  const c = props.caso;
  const [da, setDa] = useState('');
  const [a, setA] = useState('');
  const [soluzione, setSoluzione] = useState(false);
  const [scelte, setScelte] = useState<Scelte>(c.scelte);

  const nomogramma = limitiNomogramma(c);
  const finale = combina(nomogramma, c.scelte);
  const tuoDa = numero(da);
  const tuoA = numero(a);
  const hoRisposto = da.trim() !== '' && a.trim() !== '' && Number.isFinite(tuoDa) && Number.isFinite(tuoA);
  const incerto = c.taMin !== undefined && c.taMax !== undefined;

  return (
    <ScrollView contentContainerStyle={stili.contenuto} keyboardShouldPersistTaps="handled">
      <Pressable onPress={props.onIndietro}>
        <Text style={stili.link}>‹ Tutti i casi</Text>
      </Pressable>
      <Text style={[stili.titolo, { marginTop: 8 }]}>{c.titolo}</Text>
      <Text style={stili.paragrafo}>{c.scenario}</Text>
      <Text style={[stili.paragrafo, { fontWeight: '600' }]}>{c.domanda}</Text>

      <View style={stili.blocco}>
        <Text style={stili.sezione}>La tua risposta</Text>
        <Colonne>
          <Campo etichetta="Da" valore={da} onChange={setDa} unita="h" />
          <Campo etichetta="A" valore={a} onChange={setA} unita="h" />
        </Colonne>
        <Pressable style={stili.pulsante} onPress={() => setSoluzione(true)}>
          <Text style={stili.pulsanteTesto}>Mostra la soluzione</Text>
        </Pressable>
      </View>

      {soluzione && (
        <>
          <View style={stili.blocco}>
            <Text style={stili.sezione}>Soluzione</Text>
            <Text style={stili.paragrafo}>
              Fattore correttivo {virgola(c.cf, 2)} ({c.condizioni}).
            </Text>
            {incerto ? (
              <RisultatoIncerto
                esito={simula({ tRettale: c.tRettale, taMin: c.taMin!, taMax: c.taMax!, peso: c.peso, cf: c.cf })}
                taMin={c.taMin!}
                taMax={c.taMax!}
              />
            ) : (
              <RisultatoHenssge esito={stimaPMI(c)} cf={c.cf} peso={c.peso} />
            )}
            {!finale.contraddizione && (
              <Text style={stili.paragrafo}>
                Intervallo finale, con i reperti non termici: da {virgola(finale.min)} a{' '}
                {finale.max === null ? 'non definito' : `${virgola(finale.max)} ore`}.
              </Text>
            )}
            {hoRisposto && finale.max !== null && (
              <Text style={stili.paragrafo}>
                La tua risposta: da {virgola(tuoDa)} a {virgola(tuoA)} ore. Scarto: {virgola(Math.abs(tuoDa - finale.min))} h sul
                limite inferiore, {virgola(Math.abs(tuoA - finale.max))} h sul limite superiore.
              </Text>
            )}
            {c.nota && <Text style={stili.fonte}>{c.nota}</Text>}
          </View>
          {incerto && (
            <Text style={stili.paragrafo}>
              Confronto con un valore unico di {virgola(c.tAmbiente)} °C:
            </Text>
          )}
          {incerto && <RisultatoHenssge esito={stimaPMI(c)} cf={c.cf} peso={c.peso} />}
          <Pannello titolo="Nomogramma" aperto>
            <Nomogramma tRettale={c.tRettale} tAmbiente={c.tAmbiente} peso={c.peso} cf={c.cf} esito={stimaPMI(c)} />
          </Pannello>
          <Pannello titolo="Metodo composto" riassunto={riassuntoComposto(nomogramma, scelte)}>
            <MetodoComposto nomogramma={nomogramma} scelte={scelte} onScelte={setScelte} />
          </Pannello>
          <Pannello titolo="Passaggi del calcolo" aperto>
            <Passaggi dati={c} />
          </Pannello>
          <Pannello titolo="Testo per il verbale" riassunto="da copiare">
            <TestoVerbale dati={{ ...c, scelte }} />
          </Pannello>
        </>
      )}
    </ScrollView>
  );
}

export function Esercizi() {
  const [aperto, setAperto] = useState<Caso | null>(null);
  if (aperto) return <Esercizio key={aperto.id} caso={aperto} onIndietro={() => setAperto(null)} />;
  return (
    <ScrollView contentContainerStyle={stili.contenuto}>
      <Text style={stili.titolo}>Esercizi</Text>
      <Text style={stili.sottotitolo}>
        Casi didattici: prova a stimare l'intervallo, poi confronta con la soluzione passo per passo. Il primo è l'esempio
        pubblicato da Henssge e Madea, gli altri sono immaginari.
      </Text>
      {CASI.map((c, k) => (
        <Pressable key={c.id} style={stili.tabella} onPress={() => setAperto(c)}>
          <Text style={stili.voceTitolo}>
            {k + 1}. {c.titolo}
          </Text>
          <Text style={stili.voceSotto} numberOfLines={2}>
            {c.scenario}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
