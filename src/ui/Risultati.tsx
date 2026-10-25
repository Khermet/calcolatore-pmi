import { Text, View } from 'react-native';
import { avvisoPeso } from '../fattori.ts';
import { formattaOre, virgola } from '../formato.ts';
import type { Esito } from '../henssge.ts';
import type { EsitoIncerto } from '../incertezza.ts';
import { stili } from './stili.ts';

export function RisultatoHenssge(props: { esito: Esito; cf: number; peso: number }) {
  const { esito } = props;
  const avviso = avvisoPeso(props.cf, props.peso);
  if (!esito.ok)
    return (
      <View style={[stili.risultato, stili.risultatoErrore]}>
        <Text style={stili.errore}>{esito.errore}</Text>
      </View>
    );
  return (
    <View style={stili.risultato}>
      <Text style={stili.risultatoValore}>
        {formattaOre(esito.ore)}
        {esito.margine !== null && ` ± ${virgola(esito.margine)} h`}
      </Text>
      {esito.margine !== null ? (
        <Text style={stili.risultatoNota}>
          Limiti al 95%: da {virgola(Math.max(0, esito.ore - esito.margine))} a {virgola(esito.ore + esito.margine)} ore
        </Text>
      ) : (
        <Text style={stili.errore}>
          Q ≤ 0,2 o fascia non coperta dal nomogramma: limiti al 95% non disponibili, stima poco affidabile.
        </Text>
      )}
      <Text style={stili.risultatoNota}>
        Q = {virgola(esito.q, 3)} · B = {virgola(esito.b, 4)}
      </Text>
      {avviso && <Text style={stili.errore}>{avviso}</Text>}
    </View>
  );
}

export function RisultatoIncerto(props: { esito: EsitoIncerto; taMin: number; taMax: number }) {
  const { esito } = props;
  if (!esito.ok)
    return (
      <View style={[stili.risultato, stili.risultatoErrore]}>
        <Text style={stili.errore}>{esito.errore}</Text>
      </View>
    );
  const totale = esito.validi + esito.scartati;
  const haInviluppo = Number.isFinite(esito.inviluppoMin);
  return (
    <View style={stili.risultato}>
      <Text style={stili.risultatoNota}>
        Simulazione: {totale} temperature ambiente estratte tra {virgola(props.taMin)} e {virgola(props.taMax)} °C
      </Text>
      {haInviluppo ? (
        <>
          <Text style={stili.risultatoValore}>
            {virgola(esito.inviluppoMin)} – {virgola(esito.inviluppoMax)} h
          </Text>
          <Text style={stili.risultatoNota}>
            Intervallo esteso: inviluppo dei limiti al 95% di Henssge su tutta la forbice di temperatura
          </Text>
        </>
      ) : (
        <Text style={stili.errore}>Nessuna estrazione con limiti al 95% disponibili (Q ≤ 0,2).</Text>
      )}
      <Text style={stili.risultatoMedio}>
        {formattaOre(esito.mediana)}
      </Text>
      <Text style={stili.risultatoNota}>
        Stima centrale (mediana); il 95% delle stime cade tra {virgola(esito.p025)} e {virgola(esito.p975)} ore
      </Text>
      {esito.scartati > 0 && (
        <Text style={stili.errore}>
          {esito.scartati} estrazioni scartate: temperatura ambiente non compatibile con il modello (≥ rettale).
        </Text>
      )}
      {esito.senzaMargine > 0 && (
        <Text style={stili.errore}>{esito.senzaMargine} estrazioni senza limiti al 95% (Q ≤ 0,2 o fascia non coperta).</Text>
      )}
      <Text style={stili.fonte}>
        Approccio con intervallo plausibile di temperatura ambiente: Heinrich et al., Int J Legal Med 2024.
      </Text>
    </View>
  );
}
