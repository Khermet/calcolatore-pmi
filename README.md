# Epoca della morte

Calcolatore didattico dell'intervallo post-mortale (PMI) per specializzandi in medicina legale.

**Apri l'app:** https://khermet.github.io/calcolatore-pmi/

Dal telefono si può aggiungere alla schermata Home e poi funziona anche senza rete.

## Cosa fa

- **Metodo di Henssge** (temperatura rettale): equazioni per temperatura ambiente fino a 23 °C e oltre, limiti al 95% per fasce di Q, tabella dei fattori correttivi.
- **Nomogramma** costruito dalle equazioni, con la lettura del caso inserito e ingrandimento a tutto schermo.
- **Metodo composto**: ipostasi, rigidità, eccitabilità meccanica; facoltativi eccitabilità elettrica e iride.
- **Temperatura ambiente incerta**: simulazione Monte Carlo sull'intervallo plausibile.
- **Didattica**: passaggi del calcolo, testo per il verbale, casi esercitativi con soluzione.

## Fonti

- Henssge C, Madea B. *Estimation of the time since death in the early post-mortem period*. Forensic Sci Int 2004;144:167-175.
- Hubig M, Muggenthaler H, Mall G. *Confidence intervals in temperature-based death time determination*. Leg Med 2014.
- Zirn A et al. *Development of a mobile application to estimate time of death based on the compound method*. Int J Legal Med 2026;140:3367-3378.
- Heinrich et al. *An assessment of the Henssge method for forensic death time estimation in the early post-mortem interval*. Int J Legal Med 2024.
- Pellini E. *Revaluation of the Henssge nomogram*, tesi di dottorato, Università di Verona (tabella dei fattori correttivi).

Il nomogramma dell'app è generato dalle equazioni e non riproduce la figura pubblicata.

## Avvertenza

Strumento didattico. Non sostituisce la valutazione del medico legale e non è un dispositivo medico.

## Sviluppo

```bash
npm install
npm run web        # anteprima su http://localhost:8081/calcolatore-pmi
npm test           # test del motore di calcolo
npm run build:web  # sito statico in dist/ con service worker
```

App Expo (React Native): lo stesso codice può essere compilato per iOS e Android.

## Licenza

MIT, Francesco Carravetta.
