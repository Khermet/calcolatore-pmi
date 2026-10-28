# Data del rilievo e confronto degli intervalli

Progetto approvato in chat il 28 ottobre 2026.

Data e ora del rilievo sono obbligatorie nel calcolatore; prima del loro inserimento valido non si mostrano stime, grafici o verbali. Si usano campi italiani espliciti GG/MM/AAAA e HH:MM, inizialmente vuoti, senza inventare il momento del rilievo. Gli esercizi conservano i dati dei casi didattici.

Ogni reperto selezionato mostra i limiti già codificati dalle fonti, senza introdurre nuovi valori medici. Un grafico mobile mostra Henssge e i singoli reperti sulla medesima scala delle ore dal decesso; date e ore corrispondenti sono riportate in testo. La sovrapposizione comune è evidenziata; intervalli incompatibili rimangono visibili e non generano un intervallo finale fittizio. I limiti aperti restano espliciti e sono rappresentati con frecce. Nessun reperto selezionato equivale a nessuna informazione non termica.

## Approcci
La scala in ore è stata raccomandata e approvata, con date e orari degli estremi accanto. Una scala esclusivamente di calendario rende meno immediato confrontare i limiti delle fonti; una tabella senza grafico non soddisfa il confronto visivo richiesto. Si riusano React Native e react-native-svg già presenti, senza nuove dipendenze.

## Coerenza
Il verbale usa data e ora del rilievo e del decesso, anche attraversando mezzanotte, mese o anno. La compatibilità finale resta disponibile. La simulazione con temperatura incerta usa il proprio inviluppo nel grafico. Se il modello termico non è disponibile, il grafico lo dichiara e confronta soltanto i reperti effettivamente selezionati.
