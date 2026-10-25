import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { FATTORI } from '../fattori.ts';
import { numero, virgola } from '../formato.ts';
import { passaggi, testoVerbale, type DatiCaso } from '../verbale.ts';
import { stili } from './stili.ts';

export function Campo(props: {
  etichetta: string;
  valore: string;
  onChange: (v: string) => void;
  unita: string;
  tastiera?: 'decimale' | 'testo';
}) {
  return (
    <View style={stili.campo}>
      <Text style={stili.etichetta}>{props.etichetta}</Text>
      <View style={stili.riga}>
        <TextInput
          style={stili.input}
          value={props.valore}
          onChangeText={props.onChange}
          keyboardType="numbers-and-punctuation"
          inputMode={props.tastiera === 'testo' ? 'text' : 'decimal'}
        />
        <Text style={stili.unita}>{props.unita}</Text>
      </View>
    </View>
  );
}

export function Interruttore(props: { attivo: boolean; onCambia: (v: boolean) => void; testoSi: string; testoNo: string }) {
  return (
    <Pressable style={stili.campo} onPress={() => props.onCambia(!props.attivo)}>
      <Text style={stili.link}>{props.attivo ? props.testoSi : props.testoNo}</Text>
    </Pressable>
  );
}

export function SceltaFattore(props: { cf: string; onScelta: (cf: string, descrizione: string) => void }) {
  const [aperto, setAperto] = useState(false);
  const [bagnato, setBagnato] = useState(false);
  const attuale = numero(props.cf);
  return (
    <View style={stili.campo}>
      <Pressable onPress={() => setAperto(!aperto)}>
        <Text style={stili.link}>{aperto ? 'Chiudi tabella dei fattori' : 'Scegli il fattore dalla tabella di Henssge'}</Text>
      </Pressable>
      {aperto && (
        <View style={stili.tabella}>
          <View style={stili.riga}>
            {[false, true].map((b) => (
              <Pressable key={String(b)} onPress={() => setBagnato(b)} style={[stili.scheda, bagnato === b && stili.schedaAttiva]}>
                <Text style={bagnato === b ? stili.schedaTestoAttivo : stili.schedaTesto}>
                  {b ? 'Bagnato / in acqua' : 'Asciutto'}
                </Text>
              </Pressable>
            ))}
          </View>
          {FATTORI.filter((f) => f.bagnato === bagnato).map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                props.onScelta(virgola(f.cf, 2), `${f.indumenti.toLowerCase()}, ${f.ambiente.toLowerCase()}`);
                setAperto(false);
              }}
              style={[stili.voce, f.cf === attuale && stili.voceAttiva]}
            >
              <Text style={stili.voceCf}>{virgola(f.cf, 2)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={stili.voceTitolo}>{f.indumenti}</Text>
                <Text style={stili.voceSotto}>{f.ambiente}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={stili.fonte}>Valori riferiti a 70 kg. Fonte: Henssge, ripresa in Pellini, tesi di dottorato, Univ. di Verona.</Text>
        </View>
      )}
    </View>
  );
}

export function Passaggi(props: { dati: DatiCaso }) {
  return (
    <View style={stili.blocco}>
      <Text style={stili.sezione}>Come si arriva al risultato</Text>
      {passaggi(props.dati).map((p) => (
        <Text key={p} style={stili.passaggio}>
          {p}
        </Text>
      ))}
    </View>
  );
}

export function TestoVerbale(props: { dati: DatiCaso }) {
  const [copiato, setCopiato] = useState(false);
  const testo = testoVerbale(props.dati);
  return (
    <View style={stili.blocco}>
      <Text style={stili.sezione}>Testo per il verbale</Text>
      <Text style={stili.paragrafo} selectable>
        {testo}
      </Text>
      <Pressable
        style={stili.pulsante}
        onPress={async () => {
          await Clipboard.setStringAsync(testo);
          setCopiato(true);
          setTimeout(() => setCopiato(false), 2000);
        }}
      >
        <Text style={stili.pulsanteTesto}>{copiato ? 'Copiato' : 'Copia testo'}</Text>
      </Pressable>
    </View>
  );
}
