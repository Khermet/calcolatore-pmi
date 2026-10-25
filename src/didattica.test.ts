import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frasiReperti, passaggi, testoVerbale } from './verbale.ts';
import { orarioPrecedente } from './formato.ts';
import { CASI } from './casi.ts';
import { stimaPMI } from './henssge.ts';
import { combina } from './composto.ts';
import { simula } from './incertezza.ts';

test('orario del decesso a ritroso, anche oltre la mezzanotte', () => {
  assert.deepEqual(orarioPrecedente('10:00', 2.5), { orario: '07:30', giorniPrima: 0 });
  assert.deepEqual(orarioPrecedente('07:00', 17.25), { orario: '13:45', giorniPrima: 1 });
  assert.equal(orarioPrecedente('25:00', 1), null);
});

test('passaggi dell\'esempio della Fig. 2', () => {
  const p = passaggi({ tRettale: 27, tAmbiente: 15, peso: 70, cf: 1.3 });
  assert.equal(p.length, 5);
  assert.match(p[0], /0,541/);
  assert.match(p[1], /91,0 kg/);
  assert.match(p[3], /t = 17,3 ore/);
  assert.match(p[4], /±2,8 h/);
});

test('testo del verbale con orari e metodo composto', () => {
  const t = testoVerbale({
    tRettale: 30,
    tAmbiente: 15,
    peso: 70,
    cf: 1,
    oraMisura: '12:00',
    scelte: { rigidita: 'assente' },
  });
  assert.match(t, /^Alle ore 12:00 è stata rilevata una temperatura rettale di 30,0 °C/);
  assert.match(t, /\(limiti al 95%: 6,9-12,5 ore\)\.\n\n/); // dato termico e reperti in due capoversi
  assert.match(t, /l'intervallo si restringe a 6,9-7,0 ore, compatibile con un decesso avvenuto tra le ore 05:00 e le ore 05:07\./);
  assert.doesNotMatch(t, /—/); // niente lineette lunghe nei testi per documenti
});

test('verbale: reperti dello stesso gruppo fusi in una frase', () => {
  assert.equal(
    frasiReperti({ ipostasi: 'confluenti', digitopressione: 'scompaiono', rigidita: 'completa', ripristino: 'non-si-ripristina' }),
    'ipostasi confluenti, non ancora alla massima estensione, non ancora fisse alla digitopressione; ' +
      'rigidità cadaverica completa, che non si ricostituisce dopo risoluzione manuale',
  );
  assert.match(frasiReperti({ occhio: 'grado-III' }), /grado III/); // numerale romano non abbassato
});

test('verbale: reperti che non restringono e reperti incompatibili', () => {
  const base = { tRettale: 30, tAmbiente: 15, peso: 70, cf: 1, oraMisura: '12:00' };
  assert.match(testoVerbale({ ...base, scelte: { rigidita: 'completa' } }), /compatibili con tale intervallo e non consentono di restringerlo; il decesso è pertanto collocabile tra le ore 23:31 del giorno precedente e le ore 05:07\./);
  assert.match(testoVerbale({ ...base, scelte: { zsako: 'presente' } }), /non risultano compatibili con l'intervallo termico/);
  assert.match(testoVerbale({ ...base, scelte: {} }), /Il decesso è pertanto collocabile tra le ore 23:31 del giorno precedente e le ore 05:07\.$/);
});

test('verbale e passaggi con temperatura ambiente incerta', () => {
  const d = { tRettale: 24, tAmbiente: 8, taMin: 6, taMax: 11, peso: 80, cf: 0.75 };
  assert.match(testoVerbale(d), /stimata tra 6,0 e 11,0 °C/);
  assert.match(passaggi(d)[5], /^6\. Temperatura ambiente incerta/);
});

test('ogni caso esercitativo ha una soluzione coerente', () => {
  for (const c of CASI) {
    const e = stimaPMI(c);
    assert.ok(e.ok, `caso ${c.id}: ${!e.ok && e.errore}`);
    if (!e.ok) continue;
    const nomogramma =
      e.margine === null ? { min: null, max: null } : { min: Math.max(0, e.ore - e.margine), max: e.ore + e.margine };
    assert.equal(combina(nomogramma, c.scelte).contraddizione, false, `caso ${c.id} contraddittorio`);
    if (c.taMin !== undefined && c.taMax !== undefined) {
      const s = simula({ tRettale: c.tRettale, taMin: c.taMin, taMax: c.taMax, peso: c.peso, cf: c.cf });
      assert.ok(s.ok, `caso ${c.id}: simulazione non valida`);
    }
  }
});
