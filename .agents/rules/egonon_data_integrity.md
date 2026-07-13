# REGOLA CRITICA — Integrità Dati Finanziari EGONON SA

## RISCHIO LEGALE ALTO — ZERO DEROGHE

### Obbligo assoluto prima di ogni push su GitHub Pages

Ogni volta che aggiungo o modifico dati di performance sul sito egononos.github.io, DEVO:

1. **Verificare la fonte**: i valori DEVONO provenire esclusivamente dal CSV certificato `.agents/egonon_nav_database.csv`
2. **Calcolare manualmente** ogni metrica dalla serie storica e stampare i valori prima di inserirli nel HTML
3. **Cross-check etichette**: verificare che ogni percentuale corrisponda ESATTAMENTE all'etichetta (12 mesi = lug N-1 → giu N, non YTD, non altre finestre)
4. **Grep finale**: dopo ogni modifica, eseguire grep su tutti i numeri di performance nel file HTML e confrontarli con i valori calcolati

### Definizioni fisse delle finestre temporali

| Etichetta sito | Finestra di calcolo | Formula |
|---|---|---|
| Performance 12 mesi | luglio anno-1 → giugno anno corrente | NAV_giu_N / NAV_lug_(N-1) - 1 |
| Performance 3 anni | giugno anno-3 → giugno anno corrente | NAV_giu_N / NAV_giu_(N-3) - 1 |
| Performance 5 anni | giugno anno-5 → giugno anno corrente | NAV_giu_N / NAV_giu_(N-5) - 1 |
| YTD | dicembre anno-1 → ultimo mese disponibile | NAV_last / NAV_dic_(N-1) - 1 |

### Valori certificati al 30.06.2026 (da usare come riferimento)

- NAV: 2.149,01
- Performance 12 mesi (lug25→giu26): +10,86%
- Performance 3 anni (giu23→giu26): +34,95%
- Performance 5 anni (giu21→giu26): +36,83%
- YTD (dic25→giu26): +8,82%
- Sharpe Ratio: +1,41
- Max Drawdown storico: −12,27%
- Inception (2010→2026): +114,90%

### Cosa NON fare mai

- MAI usare etichette copiate dalla pipeline senza ricalcolare manualmente
- MAI pubblicare un valore senza aver stampato in console il calcolo completo
- MAI assumere che i valori precedenti nel HTML siano corretti — ricalcolare sempre
- MAI pubblicare dati di prodotti finanziari regolamentati senza verifica incrociata

### In caso di dubbio

FERMARSI e chiedere conferma a Emanuele prima di pubblicare qualsiasi dato numerico sul sito.

Pubblicare dati di performance errati su un prodotto FINMA è una violazione regolamentare grave con potenziali conseguenze legali.
