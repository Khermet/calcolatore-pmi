import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CRITERI, combina, type Limiti, type Scelte } from '../composto.ts';
import { virgola } from '../formato.ts';
import { stili } from './stili.ts';

export function MetodoComposto(props: { nomogramma: Limiti; scelte: Scelte; onScelte: (s: Scelte) => void }) {
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
    <View style={stili.blocco}>
      <Text style={stili.sezione}>Metodo composto</Text>
      <Text style={stili.fonte}>
        Segna solo i reperti rilevati. Ogni reperto può alzare il limite inferiore o abbassare quello superiore.
      </Text>
      {visibili.map((c) => (
        <View key={c.id} style={stili.criterio}>
          <Text style={stili.voceTitolo}>
            {c.titolo} <Text style={stili.fonte}>({c.fonte})</Text>
          </Text>
          {c.requisito !== 'nessuno' && (
            <Text style={stili.voceSotto}>
              {c.requisito === 'stimolatore' ? 'Richiede uno stimolatore elettrico' : 'Richiede il collirio/farmaco'}
            </Text>
          )}
          <View style={stili.chips}>
            {c.opzioni.map((o) => {
              const attivo = scelte[c.id] === o.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => onScelte({ ...scelte, [c.id]: attivo ? undefined : o.id })}
                  style={[stili.chip, attivo && stili.schedaAttiva]}
                >
                  <Text style={attivo ? stili.schedaTestoAttivo : stili.schedaTesto}>{o.etichetta}</Text>
                </Pressable>
              );
            })}
          </View>
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
      <Text style={stili.fonte}>
        Henssge e Madea, Forensic Sci Int 2004 (Tab. 1, Tab. 2, Fig. 4); eccitabilità meccanica: Zirn et al., Int J
        Legal Med 2026 (Tab. 1). Non inclusi: orbicolare della bocca, atropina, limiti inferiori dell'iride.
      </Text>
    </View>
  );
}
