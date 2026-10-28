import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CRITERI, combina, type Limiti, type Scelte } from '../composto.ts';
import { virgola } from '../formato.ts';
import { stili } from './stili.ts';
import { descriviLimiti } from '../intervalli.ts';
import { collocaIntervallo } from '../rilevazione.ts';
import { GraficoIntervalli } from './GraficoIntervalli.tsx';

// riga di riepilogo per l'intestazione del pannello
export function riassuntoComposto(nomogramma: Limiti, scelte: Scelte): string {
  const n = Object.values(scelte).filter(Boolean).length;
  if (n === 0) return 'nessun reperto';
  const reperti = `${n} ${n === 1 ? 'reperto' : 'reperti'}`;
  const e = combina(nomogramma, scelte);
  if (e.contraddizione) return `${reperti} · incompatibili`;
  return `${reperti} · ${virgola(e.min)}-${e.max === null ? '…' : virgola(e.max)} h`;
}

export function MetodoComposto(props: { nomogramma: Limiti; scelte: Scelte; onScelte: (s: Scelte) => void; dataMisura?: string; oraMisura?: string }) {
  const { scelte, onScelte } = props;
  // i criteri strumentali partono visibili se il caso ne contiene già uno
  const [strumentali, setStrumentali] = useState(() =>
    CRITERI.some((c) => c.requisito !== 'nessuno' && scelte[c.id]),
  );
  const usati = Object.values(scelte).some(Boolean);
  const e = combina(props.nomogramma, scelte);
  const visibili = CRITERI.filter((c) => strumentali || c.requisito === 'nessuno');
  const testoMax = e.max === null ? 'non definito' : `${virgola(e.max)} h`;

  return (
    <View>
      <Text style={stili.fonte}>
        Segna solo i reperti rilevati. Ogni reperto può alzare il limite inferiore o abbassare quello superiore.
      </Text>
      {visibili.map((c) => (
        <View key={c.id} style={stili.criterio}>
          <Text style={stili.voceTitolo}>
            {c.titolo} <Text style={stili.fonte}>({c.fonte})</Text>
          </Text>
          {(c.nota || c.requisito !== 'nessuno') && (
            <Text style={stili.voceSotto}>
              {[
                c.nota,
                c.requisito === 'stimolatore' ? 'richiede uno stimolatore' : c.requisito === 'farmaco' ? 'richiede il farmaco' : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
          <View style={stili.chips}>
            {c.opzioni.map((o) => {
              const attivo = scelte[c.id] === o.id;
              return (
                <Pressable
                  key={o.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.titolo}: ${o.breve ?? o.etichetta}`}
                  accessibilityState={{ selected: attivo }}
                  onPress={() => onScelte({ ...scelte, [c.id]: attivo ? undefined : o.id })}
                  style={[stili.chip, attivo && stili.schedaAttiva]}
                >
                  <Text style={attivo ? stili.schedaTestoAttivo : stili.schedaTesto}>{o.breve ?? o.etichetta}</Text>
                </Pressable>
              );
            })}
          </View>
          {c.opzioni.filter((o) => o.id === scelte[c.id]).map((o) => {
            const quando = props.dataMisura && props.oraMisura ? collocaIntervallo(props.dataMisura, props.oraMisura, o.limiti) : null;
            return <View key={o.id}>
              <Text style={stili.risultatoNota}>{descriviLimiti(o.limiti)}</Text>
              {quando && <Text style={stili.risultatoNota}>{quando}</Text>}
            </View>;
          })}
        </View>
      ))}

      <Pressable
        style={stili.criterio}
        onPress={() => {
          if (strumentali) {
            // nascondendo i criteri strumentali si azzerano anche le loro scelte
            const restanti: Scelte = {};
            for (const c of CRITERI) if (c.requisito === 'nessuno') restanti[c.id] = scelte[c.id];
            onScelte(restanti);
          }
          setStrumentali(!strumentali);
        }}
      >
        <Text style={stili.link}>
          {strumentali
            ? 'Nascondi i criteri che richiedono strumenti o farmaci'
            : 'Mostra i criteri che richiedono strumenti o farmaci (stimolazione elettrica, iride)'}
        </Text>
      </Pressable>

      {usati && (
        <View style={[stili.risultato, e.contraddizione && stili.risultatoErrore]}>
          {e.contraddizione ? (
            <Text style={stili.errore}>
              Reperti incompatibili: limite inferiore {virgola(e.min)} h superiore al limite superiore {testoMax}.
              Ricontrollare i rilievi o le condizioni di raffreddamento.
            </Text>
          ) : (
            <>
              <Text style={stili.risultatoValore}>
                {virgola(e.min)} – {testoMax}
              </Text>
              <Text style={stili.risultatoNota}>Intervallo combinato (ore dal decesso)</Text>
              {e.determinanti.min && <Text style={stili.risultatoNota}>Limite inferiore da: {e.determinanti.min}</Text>}
              {e.determinanti.max && <Text style={stili.risultatoNota}>Limite superiore da: {e.determinanti.max}</Text>}
            </>
          )}
        </View>
      )}
      <GraficoIntervalli nomogramma={props.nomogramma} scelte={scelte} dataMisura={props.dataMisura} oraMisura={props.oraMisura} />
      <Text style={stili.fonte}>
        Henssge e Madea, Forensic Sci Int 2004 (Tab. 1, Tab. 2, Fig. 4); eccitabilità meccanica: Zirn et al., Int J
        Legal Med 2026 (Tab. 1). Non inclusi: orbicolare della bocca, atropina, limiti inferiori dell&apos;iride.
      </Text>
    </View>
  );
}
