import * as Clipboard from 'expo-clipboard';
import { Children, useState, type ReactNode } from 'react';
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
  segnaposto?: string;
  obbligatorio?: boolean;
}) {
  return (
    <View style={stili.campo}>
      <Text style={stili.etichetta} numberOfLines={1}>
        {props.etichetta}{props.obbligatorio ? ' *' : ''}
        {props.unita ? ` (${props.unita})` : ''}
      </Text>
      <TextInput
        style={stili.input}
        accessibilityLabel={`${props.etichetta}${props.obbligatorio ? ' *' : ''}`}
        accessibilityHint={props.obbligatorio ? 'Campo obbligatorio' : undefined}
        value={props.valore}
        onChangeText={props.onChange}
        placeholder={props.segnaposto}
        placeholderTextColor="#b0b5bb"
        keyboardType="numbers-and-punctuation"
        inputMode={props.tastiera === 'testo' ? 'text' : 'decimal'}
      />
    </View>
  );
}

export function Colonne(props: { children: ReactNode }) {
  return (
    <View style={stili.colonne}>
      {Children.map(props.children, (c) => (
        <View style={stili.colonna}>{c}</View>
      ))}
    </View>
  );
}

// Sezione richiudibile: intestazione con riassunto sempre visibile, corpo a richiesta.
export function Pannello(props: { titolo: string; riassunto?: string; aperto?: boolean; children: ReactNode }) {
  const [aperto, setAperto] = useState(props.aperto ?? false);
  return (
    <View style={stili.pannello}>
      <Pressable style={stili.pannelloTesta} onPress={() => setAperto(!aperto)} accessibilityRole="button">
        <Text style={stili.pannelloTitolo}>{props.titolo}</Text>
        <Text style={stili.pannelloRiassunto} numberOfLines={1}>
          {props.riassunto ?? ''}
        </Text>
        <Text style={stili.pannelloFreccia}>{aperto ? '▾' : '▸'}</Text>
      </Pressable>
      {aperto && <View style={stili.pannelloCorpo}>{props.children}</View>}
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
    <View>
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
    <View>
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
