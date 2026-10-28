import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SEZIONI, avanzamento, chiave, testoChecklist, type Spunte } from '../sopralluogo.ts';
import { Interruttore, Pannello } from '../ui/componenti.tsx';
import { colori, stili } from '../ui/stili.ts';

// Le spunte restano sul dispositivo (solo web, localStorage): servono durante un
// sopralluogo, non vanno altrove. Se la memoria non è disponibile si lavora senza.
const MEMORIA = 'sopralluogo-v1';
function leggi(): { spunte: Spunte; stradale: boolean } {
  try {
    const s = globalThis.localStorage?.getItem(MEMORIA);
    if (s) return JSON.parse(s);
  } catch {}
  return { spunte: {}, stradale: false };
}
function scrivi(stato: { spunte: Spunte; stradale: boolean }) {
  try {
    globalThis.localStorage?.setItem(MEMORIA, JSON.stringify(stato));
  } catch {}
}

export function Sopralluogo() {
  const [iniziale] = useState(leggi);
  const [spunte, setSpunte] = useState<Spunte>(iniziale.spunte);
  const [stradale, setStradale] = useState(iniziale.stradale);
  const [copiato, setCopiato] = useState(false);
  const [conferma, setConferma] = useState(false);

  useEffect(() => scrivi({ spunte, stradale }), [spunte, stradale]);

  const { fatte, totali } = avanzamento(spunte, stradale);
  const sezioni = SEZIONI.filter((s) => !s.facoltativa || stradale);

  return (
    <ScrollView contentContainerStyle={stili.contenuto}>
      <Text style={stili.titolo}>Sopralluogo</Text>
      <Text style={stili.sottotitolo}>Checklist per l'esame del cadavere sul luogo</Text>

      <View style={stili.risultato}>
        <Text style={stili.risultatoMedio}>
          {fatte} di {totali} voci
        </Text>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#d6e2ef', marginTop: 6 }}>
          <View style={{ height: 6, borderRadius: 3, width: `${totali ? (fatte / totali) * 100 : 0}%`, backgroundColor: colori.primario }} />
        </View>
      </View>

      <Interruttore
        attivo={stradale}
        onCambia={setStradale}
        testoSi="Togli la sezione per incidente stradale"
        testoNo="Incidente stradale? Aggiungi la sezione dedicata"
      />

      {sezioni.map((s, k) => {
        const n = s.voci.filter((v) => spunte[chiave(s, v)]).length;
        return (
          <Pannello key={s.id} titolo={s.titolo} riassunto={`${n}/${s.voci.length}`} aperto={k === 0}>
            {s.nota && <Text style={stili.fonte}>{s.nota}</Text>}
            {s.voci.map((v) => {
              const id = chiave(s, v);
              const fatta = !!spunte[id];
              return (
                <Pressable
                  key={id}
                  onPress={() => setSpunte({ ...spunte, [id]: !fatta })}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: fatta }}
                  style={[stili.voce, { alignItems: 'flex-start' }]}
                >
                  <Text style={{ fontSize: 18, width: 28, color: fatta ? colori.primario : '#999' }}>{fatta ? '☑' : '☐'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[stili.voceTitolo, fatta && { color: '#666' }]}>{v.testo}</Text>
                    <Text style={stili.fonte}>{v.fonte}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Pannello>
        );
      })}

      <Pressable
        style={stili.pulsante}
        onPress={async () => {
          await Clipboard.setStringAsync(testoChecklist(spunte, stradale, 'Checklist del sopralluogo'));
          setCopiato(true);
          setTimeout(() => setCopiato(false), 2000);
        }}
      >
        <Text style={stili.pulsanteTesto}>{copiato ? 'Copiato' : 'Copia l\'elenco'}</Text>
      </Pressable>
      <Pressable
        style={[stili.pulsante, { backgroundColor: conferma ? colori.errore : colori.chip }]}
        onPress={() => {
          if (!conferma) {
            setConferma(true);
            setTimeout(() => setConferma(false), 4000);
            return;
          }
          setSpunte({});
          setConferma(false);
        }}
      >
        <Text style={[stili.pulsanteTesto, !conferma && { color: '#333' }]}>
          {conferma ? 'Tocca di nuovo per azzerare' : 'Azzera la checklist'}
        </Text>
      </Pressable>

      <Text style={stili.avvertenza}>
        Fonti: Raccomandazione n. R (99) 3 del Consiglio d'Europa (1999), Principio I, nella versione SGRM 2019;
        C. Puccini, Istituzioni di medicina legale, cap. 22. Le spunte restano solo su questo dispositivo.
      </Text>
    </ScrollView>
  );
}
