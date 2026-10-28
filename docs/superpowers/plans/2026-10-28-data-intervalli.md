# Data e intervalli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Rilievo con data/ora obbligatorie e confronto visivo degli intervalli dei fenomeni.
**Architecture:** Funzioni pure per validazione/calendario e confronto; componenti React Native per input, grafico e testi. Riutilizzare i limiti scientifici esistenti.
**Tech Stack:** Expo 58, React Native, TypeScript, react-native-svg, node:test.
**Spec:** docs/superpowers/specs/2026-10-28-data-intervalli-design.md

## Global Constraints
- Data e ora obbligatorie nel calcolatore, campi inizialmente vuoti.
- Nessuna nuova dipendenza o modifica dei limiti delle fonti.
- Scala in ore e date/orari degli estremi; distinguere limiti aperti e assenza di sovrapposizione.
- Usare il checkout cloud esistente, già isolato; niente worktree.

## Review Focus
- Date impossibili, anni bisestili e passaggio mese/anno.
- Orari vuoti o invalidi e rimozione di un dato dopo il calcolo.
- Un solo limite disponibile, intersezione puntuale e intersezione vuota.
- Henssge non applicabile o privo di limiti; simulazione incerta.
- Grafico su telefono, valori persistenti cambiando scheda e verbale copiabile.

### Task 1: Calendario e verbale
Files: src/rilevazione.ts, src/rilevazione.test.ts, src/verbale.ts.
Interfaces: istanteRilievo(data, ora): number|null; dataOraPrecedente(data, ora, ore): string|null; collocaIntervallo(data, ora, limiti): string|null.
- [x] Test RED: data obbligatoria, bisestili, mezzanotte, mese/anno e verbale datato.
- [x] Implementare validazione stretta e sottrazione dei minuti su calendario civile, indipendente dal fuso del server.
- [x] GREEN: npm test e typecheck.

### Task 2: Modello di confronto
Files: src/intervalli.ts, src/intervalli.test.ts.
Interfaces: confrontaIntervalli(nomogramma, scelte) ritorna righe, comune, scalaMax; descriviLimiti(limiti): string.
- [x] Test RED: nessun reperto, limiti aperti, incompatibilità, intersezione puntuale, criterio sconosciuto e scala che contiene tutti i limiti.
- [x] Implementare modello usando CRITERI e combina, senza modificare le fonti.
- [x] GREEN: npm test.

### Task 3: Input e grafico
Files: src/schermate/Calcolo.tsx, src/ui/componenti.tsx, src/ui/MetodoComposto.tsx, src/ui/GraficoIntervalli.tsx, src/schermate/Esercizi.tsx.
Interfaces: grafico consuma confrontaIntervalli; date facoltative per esercizi e obbligatorie per Calcolo.
- [x] Test browser RED: input obbligatori, risultato nascosto prima di data/ora valide.
- [x] Integrare input accessibili, intervalli per reperto, grafico SVG responsive e calendario nei risultati/verbale.
- [x] GREEN: test browser per calcolo, sovrapposizione, incompatibilità, cancellazione data, cambio scheda; suite, typecheck e build.
- [x] Lint e revisione finale del diff; distinguere gli errori preesistenti.

## Esito
43 test unitari passati; typecheck e build web passati. Controllo browser mobile/desktop passato. Revisione indipendente: individuato e corretto il ripiego del verbale sulla temperatura media quando la simulazione incerta non era valida, con due test RED→GREEN. Lint: 5 errori preesistenti in Esercizi.tsx e Nomogramma.tsx. Nessuna modifica ai limiti scientifici o alle dipendenze.

Scelte applicative: i campi si applicano al calcolatore; gli esercizi conservano gli scenari didattici originali e ricevono il grafico tramite il componente condiviso. Il calendario civile non inferisce un fuso né variazioni di ora legale. Le costanti mediche e le build native non sono state rivalidate: i limiti non sono stati modificati e sono stati verificati rendering e interazioni web.
