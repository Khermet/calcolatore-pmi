import { test } from 'node:test';
import assert from 'node:assert/strict';
import { istanteRilievo, dataOraPrecedente, collocaIntervallo } from './rilevazione.ts';
import { testoVerbale } from './verbale.ts';

test('data e ora obbligatorie: rifiuta date impossibili e orari fuori campo', () => {
  for (const [data, ora] of [['', '07:00'], ['28/10/2026', ''], ['31/04/2026', '07:00'], ['29/02/2026', '07:00'], ['28/10/2026', '24:00'], ['28/10/2026', '07:60']]) {
    assert.equal(istanteRilievo(data, ora), null, `${data} ${ora}`);
  }
  assert.notEqual(istanteRilievo('29/02/2024', '00:00'), null);
});

test('sottrae le ore dal rilievo di prima mattina passando al giorno precedente', () => {
  assert.equal(dataOraPrecedente('28/10/2026', '06:00', 8.5), '27/10/2026 alle 21:30');
  assert.equal(dataOraPrecedente('01/01/2026', '01:00', 2), '31/12/2025 alle 23:00');
  assert.equal(dataOraPrecedente('01/03/2024', '01:00', 26), '28/02/2024 alle 23:00');
  assert.equal(dataOraPrecedente('01/03/2026', '01:00', 2), '28/02/2026 alle 23:00');
  assert.equal(dataOraPrecedente('28/10/2026', '06:00', Infinity), null);
  assert.equal(dataOraPrecedente('28/10/2026', '06:00', -1), null);
});

test('colloca estremi cronologicamente e mantiene i limiti aperti', () => {
  assert.equal(collocaIntervallo('28/10/2026', '06:00', { min: 2, max: 8.5 }), 'tra il 27/10/2026 alle 21:30 e il 28/10/2026 alle 04:00');
  assert.equal(collocaIntervallo('28/10/2026', '06:00', { min: 24, max: null }), 'non oltre il 27/10/2026 alle 06:00');
  assert.equal(collocaIntervallo('28/10/2026', '06:00', { min: null, max: 3 }), 'tra il 28/10/2026 alle 03:00 e il 28/10/2026 alle 06:00');
  assert.equal(collocaIntervallo('28/10/2026', '06:00', { min: 7, max: 3 }), null);
  assert.equal(collocaIntervallo('28/10/2026', '06:00', { min: null, max: null }), null);
});

test('verbale riporta data del rilievo e date del decesso oltre la mezzanotte', () => {
  const t = testoVerbale({ tRettale: 30, tAmbiente: 15, peso: 70, cf: 1, dataMisura: '28/10/2026', oraMisura: '06:00' });
  assert.match(t, /28\/10\/2026.*06:00/);
  assert.match(t, /27\/10\/2026 alle 17:31/);
  assert.match(t, /27\/10\/2026 alle 23:07/);
});

test('verbale conserva i reperti anche quando Henssge non è applicabile', () => {
  const t = testoVerbale({ tRettale: 15, tAmbiente: 15, peso: 70, cf: 1, dataMisura: '28/10/2026', oraMisura: '06:00', scelte: { rigidita: 'risoluzione' } });
  assert.match(t, /non è applicabile/);
  assert.match(t, /rigidità cadaverica in fase di risoluzione/);
  assert.match(t, /non oltre il 27\/10\/2026 alle 06:00/);
  assert.doesNotMatch(t, /si restringe|con tale intervallo/);
});

test('verbale distingue incompatibilità tra reperti da incompatibilità con Henssge assente', () => {
  const t = testoVerbale({ tRettale: 15, tAmbiente: 15, peso: 70, cf: 1, dataMisura: '28/10/2026', oraMisura: '06:00', scelte: { rigidita: 'risoluzione', zsako: 'presente' } });
  assert.match(t, /non sono reciprocamente compatibili/);
  assert.doesNotMatch(t, /non risultano compatibili con l'intervallo termico/);
});

test('verbale non sostituisce una simulazione non valida con la temperatura centrale', () => {
  const t = testoVerbale({ tRettale: 30, tAmbiente: 15, taMin: 18, taMax: 12, peso: 70, cf: 1, dataMisura: '28/10/2026', oraMisura: '06:00' });
  assert.match(t, /temperatura ambiente incerta/i);
  assert.match(t, /non.*applicabile|non.*disponibil/i);
  assert.doesNotMatch(t, /6,9-12,5|decesso è pertanto collocabile/);
});

test('verbale senza limiti della simulazione usa solo i reperti disponibili', () => {
  const t = testoVerbale({ tRettale: 30, tAmbiente: 15, taMin: 18, taMax: 12, peso: 70, cf: 1, dataMisura: '28/10/2026', oraMisura: '06:00', scelte: { rigidita: 'risoluzione' } });
  assert.match(t, /non inferiore a 24,0 ore/);
  assert.match(t, /non oltre il 27\/10\/2026 alle 06:00/);
  assert.doesNotMatch(t, /si restringe|6,9-12,5/);
});
