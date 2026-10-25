import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as T } from 'react-native-svg';
import { virgola } from '../formato.ts';
import type { Esito } from '../henssge.ts';
import {
  ALTEZZA,
  C,
  LARGHEZZA,
  PESI,
  R_ESTERNO,
  X0,
  XR,
  angolo,
  arco,
  puntoDiagonale,
  raggio,
  suCerchio,
  tacche,
  yAmbiente,
  yRettale,
  type Punto,
} from '../nomogramma.ts';
import { colori, stili } from './stili.ts';

const punti = (ps: Punto[]) => ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const GRIGIO = '#9aa3ad';
const ROSSO = '#c0392b';
const PESI_ETICHETTATI = new Set([20, 50, 80, 120, 200]);

// sull'arco evidenziato si etichettano le ore solo se distano abbastanza dalla precedente
function etichetteDistanziate(t: { ore: number; p: Punto }[], minimo = 22) {
  let ultima: Punto | null = null;
  return t.map((x) => {
    const lontana = !ultima || Math.hypot(x.p.x - ultima.x, x.p.y - ultima.y) >= minimo;
    if (lontana) ultima = x.p;
    return { ...x, etichetta: lontana };
  });
}

type Props = { tRettale: number; tAmbiente: number; peso: number; cf: number; esito: Esito };

export function Nomogramma(props: Props) {
  const [aperto, setAperto] = useState(false);
  const caldo = props.tAmbiente > 23;
  return (
    <View>
      <Text style={stili.fonte}>
        Costruito dalle equazioni di Henssge per {caldo ? 'Ta > 23 °C' : 'Ta ≤ 23 °C'}, non è la riproduzione della figura
        pubblicata. Si unisce la temperatura rettale (sinistra) con l'ambiente (destra); dal centro si traccia il raggio per
        il punto sulla diagonale e si legge l'ora sull'arco del peso corretto ({virgola(props.peso * props.cf, 0)} kg).
      </Text>
      <Pressable onPress={() => setAperto(true)} accessibilityLabel="Apri il nomogramma a tutto schermo">
        <View style={{ width: '100%', aspectRatio: LARGHEZZA / ALTEZZA, marginTop: 8 }}>
          <Disegno {...props} />
        </View>
      </Pressable>
      <Pressable style={stili.criterio} onPress={() => setAperto(true)}>
        <Text style={stili.link}>Apri a tutto schermo e ingrandisci</Text>
      </Pressable>
      {!props.esito.ok && <Text style={stili.errore}>Valori fuori dal modello: nessuna lettura sul nomogramma.</Text>}
      <SchermoIntero {...props} visibile={aperto} onChiudi={() => setAperto(false)} />
    </View>
  );
}

const ZOOM = [1, 1.5, 2, 3, 4];

function SchermoIntero(props: Props & { visibile: boolean; onChiudi: () => void }) {
  const { width: larghezzaSchermo } = useWindowDimensions();
  const [livello, setLivello] = useState(1);
  const zoom = ZOOM[livello];
  const larghezza = Math.min(larghezzaSchermo, 700) * zoom;
  const disegno = (
    <View style={{ width: larghezza, height: (larghezza * ALTEZZA) / LARGHEZZA }}>
      <Disegno {...props} />
    </View>
  );
  return (
    <Modal visible={props.visibile} animationType="slide" onRequestClose={props.onChiudi} supportedOrientations={['portrait', 'landscape']}>
      <View style={[stili.barraSchede, { alignItems: 'center' }]}>
        <Pressable onPress={props.onChiudi} style={stili.scheda2}>
          <Text style={stili.schedaTesto}>Chiudi</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setLivello(Math.max(0, livello - 1))} style={stili.scheda2} accessibilityLabel="Riduci">
          <Text style={stili.schedaTesto}> − </Text>
        </Pressable>
        <Text style={[stili.schedaTesto, { width: 56, textAlign: 'center' }]}>{Math.round(zoom * 100)}%</Text>
        <Pressable onPress={() => setLivello(Math.min(ZOOM.length - 1, livello + 1))} style={stili.scheda2} accessibilityLabel="Ingrandisci">
          <Text style={stili.schedaTesto}> + </Text>
        </Pressable>
      </View>
      {/* scorrimento in entrambe le direzioni; su iOS funziona anche il pizzico */}
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} maximumZoomScale={3} minimumZoomScale={1} centerContent>
        <ScrollView horizontal maximumZoomScale={3} minimumZoomScale={1}>
          {disegno}
        </ScrollView>
      </ScrollView>
    </Modal>
  );
}

function Disegno(props: Props) {
  const { tRettale, tAmbiente, peso, cf, esito } = props;
  const caldo = tAmbiente > 23;
  const pesoCorretto = peso * cf;
  const standard = cf === 1;
  // settori dell'arco esterno: confini a Q = 0,5 / 0,3 / 0,2
  const settori = caldo
    ? [{ da: 1, a: 0.5, testo: '±2,8' }]
    : [
        { da: 1, a: 0.5, testo: '±2,8' },
        { da: 0.5, a: 0.3, testo: standard ? '±3,2' : '±4,5' },
        { da: 0.3, a: 0.2, testo: standard ? '±4,5' : '±7,0' },
      ];

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${LARGHEZZA} ${ALTEZZA}`}>
      {/* scala rettale */}
      <Line x1={X0} y1={yRettale(0)} x2={X0} y2={yRettale(37.2)} stroke="#333" strokeWidth={1.5} />
      {Array.from({ length: 38 }, (_, t) => (
        <G key={`r${t}`}>
          <Line x1={X0 - (t % 5 ? 4 : 9)} y1={yRettale(t)} x2={X0} y2={yRettale(t)} stroke="#333" strokeWidth={1} />
          {t % 5 === 0 && (
            <T x={X0 - 12} y={yRettale(t) + 5} fontSize={14} textAnchor="end" fill="#333">
              {t}
            </T>
          )}
        </G>
      ))}
      <T x={X0} y={yRettale(0) + 26} fontSize={15} textAnchor="middle" fill="#333">
        °C retto
      </T>

      {/* scala ambiente, invertita */}
      <Line x1={XR} y1={yAmbiente(-10)} x2={XR} y2={yAmbiente(35)} stroke="#333" strokeWidth={1.5} />
      {Array.from({ length: 46 }, (_, k) => k - 10).map((t) => (
        <G key={`a${t}`}>
          <Line x1={XR} y1={yAmbiente(t)} x2={XR + (t % 5 ? 4 : 9)} y2={yAmbiente(t)} stroke="#333" strokeWidth={1} />
          {t % 5 === 0 && (
            <T x={XR + 12} y={yAmbiente(t) + 5} fontSize={14} fill="#333">
              {t}
            </T>
          )}
        </G>
      ))}
      <T x={XR - 20} y={yAmbiente(-10) - 12} fontSize={14} fill="#333">
        °C ambiente
      </T>

      {/* diagonale */}
      <Line x1={puntoDiagonale(1).x} y1={puntoDiagonale(1).y} x2={puntoDiagonale(0).x} y2={puntoDiagonale(0).y} stroke="#555" strokeWidth={1.2} />

      {/* archi dei pesi con tacche orarie */}
      {PESI.map((m) => {
        const r = raggio(m);
        const inizio = suCerchio(r, angolo(1));
        return (
          <G key={`p${m}`}>
            <Polyline points={punti(arco(r))} fill="none" stroke={GRIGIO} strokeWidth={1} />
            <T x={inizio.x - 4} y={inizio.y - 4} fontSize={12} textAnchor="end" fill="#555">
              {m}
            </T>
            {tacche(m, tAmbiente).map(({ ore, p }) =>
              ore % 2 ? null : (
                <G key={ore}>
                  <Circle cx={p.x} cy={p.y} r={1.6} fill={GRIGIO} />
                  {PESI_ETICHETTATI.has(m) && ore % 4 === 0 && (
                    <T x={p.x + 3} y={p.y - 3} fontSize={11} fill="#777">
                      {ore}
                    </T>
                  )}
                </G>
              ),
            )}
          </G>
        );
      })}
      <T x={C.x + raggio(200) * 0.62} y={C.y + 40} fontSize={14} fill="#555">
        kg (peso corretto)
      </T>

      {/* arco esterno dei limiti al 95% */}
      {settori.map((s, k) => {
        const meta = suCerchio(R_ESTERNO + 18, (angolo(s.da) + angolo(s.a)) / 2);
        return (
          <G key={s.testo + k}>
            <Polyline points={punti(arco(R_ESTERNO, s.da, s.a, 30))} fill="none" stroke="#333" strokeWidth={2.5} />
            {[s.da, s.a].map((q) => {
              const a = suCerchio(R_ESTERNO - 8, angolo(q));
              const b = suCerchio(R_ESTERNO + 8, angolo(q));
              return <Line key={q} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#333" strokeWidth={2} />;
            })}
            <T x={meta.x} y={meta.y} fontSize={15} fontWeight="bold" fill="#333" textAnchor="middle">
              {s.testo} h
            </T>
          </G>
        );
      })}
      <T x={C.x + 40} y={C.y - R_ESTERNO - 30} fontSize={14} fill="#333">
        Limiti al 95% ({caldo ? 'Ta > 23 °C' : standard ? 'condizioni standard' : 'con fattore correttivo'})
      </T>

      {/* centro */}
      <Circle cx={C.x} cy={C.y} r={9} fill="none" stroke="#111" strokeWidth={4} />

      {/* il caso inserito */}
      {esito.ok && <Lettura esito={esito} tRettale={tRettale} tAmbiente={tAmbiente} pesoCorretto={pesoCorretto} />}
    </Svg>
  );
}

function Lettura(props: { esito: Extract<Esito, { ok: true }>; tRettale: number; tAmbiente: number; pesoCorretto: number }) {
  const { esito, tRettale, tAmbiente, pesoCorretto } = props;
  const sx = { x: X0, y: yRettale(tRettale) };
  const dx = { x: XR, y: yAmbiente(Math.min(35, Math.max(-10, tAmbiente))) };
  const pq = puntoDiagonale(esito.q);
  const a = angolo(esito.q);
  const fine = suCerchio(R_ESTERNO, a);
  const r = raggio(pesoCorretto);
  const lettura = suCerchio(r, a);
  const posRisultato = suCerchio(r - 26, a);
  return (
    <G>
      <Line x1={sx.x} y1={sx.y} x2={dx.x} y2={dx.y} stroke={ROSSO} strokeWidth={2} />
      <Circle cx={sx.x} cy={sx.y} r={5} fill={ROSSO} />
      <Circle cx={dx.x} cy={dx.y} r={5} fill={ROSSO} />
      <Circle cx={pq.x} cy={pq.y} r={5} fill={ROSSO} />
      <Line x1={C.x} y1={C.y} x2={fine.x} y2={fine.y} stroke={colori.primario} strokeWidth={2} />
      <Polyline points={punti(arco(r))} fill="none" stroke={colori.primario} strokeWidth={3} />
      {etichetteDistanziate(tacche(pesoCorretto, tAmbiente)).map(({ ore, p, etichetta }) => (
        <G key={ore}>
          <Circle cx={p.x} cy={p.y} r={2.4} fill={colori.primario} />
          {/* niente etichetta oraria accanto al punto di lettura, che ha la sua */}
          {etichetta && Math.hypot(p.x - lettura.x, p.y - lettura.y) > 40 && (
            <T x={p.x + 4} y={p.y - 5} fontSize={13} fill={colori.primario} fontWeight="bold">
              {ore}
            </T>
          )}
        </G>
      ))}
      <Circle cx={lettura.x} cy={lettura.y} r={7} fill="#fff" stroke={colori.primario} strokeWidth={3} />
      {/* risultato all'interno dell'arco, lungo il raggio, su fondo bianco */}
      <Rect x={posRisultato.x - 62} y={posRisultato.y - 16} width={64} height={22} rx={4} fill="#fff" stroke={colori.primario} strokeWidth={1} />
      <T x={posRisultato.x - 30} y={posRisultato.y} fontSize={16} fontWeight="bold" fill={colori.primario} textAnchor="middle">
        {virgola(esito.ore)} h
      </T>
    </G>
  );
}
