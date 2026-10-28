import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as TestoSvg } from 'react-native-svg';
import type { Limiti, Scelte } from '../composto.ts';
import { virgola } from '../formato.ts';
import { confrontaIntervalli, descriviLimiti } from '../intervalli.ts';
import { collocaIntervallo } from '../rilevazione.ts';
import { colori, stili } from './stili.ts';

const VERDE = '#18704a';

export function GraficoIntervalli(props: { nomogramma: Limiti; scelte: Scelte; dataMisura?: string; oraMisura?: string }) {
  const [larghezza, setLarghezza] = useState(300);
  const { righe, comune, incompatibili, scalaMax } = confrontaIntervalli(props.nomogramma, props.scelte);
  const x = (ore: number) => 10 + ore / scalaMax * (larghezza - 20);
  const calendario = (l: Limiti) => props.dataMisura && props.oraMisura
    ? collocaIntervallo(props.dataMisura, props.oraMisura, l) : null;
  const quandoComune = comune && calendario(comune);
  const verdeDa = comune ? x(comune.min ?? 0) : 0;
  const verdeA = comune ? x(comune.max ?? scalaMax) : 0;

  return (
    <View style={stili.blocco} onLayout={(e) => setLarghezza(Math.max(40, e.nativeEvent.layout.width))}>
      <Text style={stili.sezione}>Confronto degli intervalli</Text>
      <Text style={stili.risultatoNota}>Ore dal decesso al rilievo · stessa scala per tutti i fenomeni</Text>
      {!righe.some((r) => r.id === 'henssge') && (
        <Text style={stili.errore}>Limiti termici non disponibili: confronto dei soli reperti selezionati.</Text>
      )}
      {righe.length === 0 ? (
        <Text style={stili.paragrafo}>Seleziona i reperti rilevati per confrontare i loro intervalli.</Text>
      ) : (
        <>
          <Svg width="100%" height={28} viewBox={`0 0 ${larghezza} 28`} style={{ marginTop: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const valore = scalaMax * i / 4;
              return <TestoSvg key={i} x={x(valore)} y={20} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} fontSize={12} fill="#444">{virgola(valore, valore % 1 ? 1 : 0)} h</TestoSvg>;
            })}
          </Svg>
          {righe.map((r) => {
            const da = x(r.limiti.min ?? 0);
            const a = x(r.limiti.max ?? scalaMax);
            const quando = calendario(r.limiti);
            return (
              <View key={r.id} style={{ marginTop: 12 }}>
                <Text style={stili.voceTitolo}>{r.titolo}: {descriviLimiti(r.limiti)}</Text>
                {r.reperto && <Text style={stili.voceSotto}>{r.reperto}</Text>}
                <Svg width="100%" height={32} viewBox={`0 0 ${larghezza} 32`} accessibilityLabel={`${r.titolo}: ${descriviLimiti(r.limiti)}`}>
                  {comune && <Rect x={verdeDa} y={0} width={Math.max(verdeA - verdeDa, 1)} height={32} fill="#dcefe4" />}
                  {[0, 1, 2, 3, 4].map((i) => <Line key={i} x1={x(scalaMax * i / 4)} x2={x(scalaMax * i / 4)} y1={0} y2={32} stroke="#e3e6ea" />)}
                  <Line x1={10} x2={x(scalaMax)} y1={16} y2={16} stroke="#ccd3da" />
                  {a === da ? <Circle cx={da} cy={16} r={5} fill={colori.primario} /> : <Rect x={da} y={10} width={a - da} height={12} rx={3} fill={colori.primario} />}
                  {comune && <Rect x={verdeDa} y={10} width={Math.max(verdeA - verdeDa, 2)} height={12} fill={VERDE} />}
                  {r.limiti.max === null && <Polyline points={`${x(scalaMax) - 8},7 ${x(scalaMax) + 2},16 ${x(scalaMax) - 8},25`} stroke={colori.primario} strokeWidth={3} fill="none" />}
                </Svg>
                {quando && <Text style={stili.risultatoNota}>{quando}</Text>}
              </View>
            );
          })}
          <View style={[stili.risultato, incompatibili && stili.risultatoErrore, { marginTop: 12 }]}>
            {incompatibili ? <Text style={stili.errore}>Nessuna sovrapposizione comune</Text> : comune && (
              <>
                <Text style={[stili.paragrafo, { color: VERDE, fontWeight: '700' }]}>Sovrapposizione comune: {descriviLimiti(comune)}</Text>
                {quandoComune && <Text style={stili.risultatoNota}>{quandoComune}</Text>}
              </>
            )}
          </View>
          <Text style={stili.fonte}>
            Verde: sovrapposizione di tutti gli intervalli mostrati. Freccia a destra: limite superiore non noto, non coincidente con la fine della scala. Un intervallo «entro» parte da 0 per convenzione grafica.
          </Text>
          <Text style={stili.fonte}>I limiti dei fenomeni non termici sono quelli delle fonti citate: la sovrapposizione non costituisce un nuovo intervallo di confidenza al 95%.</Text>
        </>
      )}
    </View>
  );
}
