# TTS (Text-to-Speech)

Questo modulo fornisce strumenti da riga di comando e un notebook per sintetizzare parlato a partire da testo. L’uscita predefinita è un file WAV.

## Installazione

1) Creare ed attivare un ambiente virtuale:

Installare le dipendenze:
```sh
pip install -r requirements.txt
```

## Utilizzo da riga di comando

Visualizzare l’help e le opzioni disponibili:
```sh
python tts_cli.py -h
```

Esecuzione tipica:
```sh
# Schema generale (i nomi delle opzioni possono variare: consultare -h)
python tts_cli.py --text "Ciao, questo è un test." --out output.wav
```

Note:
- Alcuni script TTS permettono di selezionare la voce o la lingua. Se supportato, le voci di esempio sono in [tts/reference/](reference/):
  - [reference/it_female_1.mp3](reference/it_female_1.mp3)
  - [reference/it_female_2.mp3](reference/it_female_2.mp3)
  - [reference/it_male_1.mp3](reference/it_male_1.mp3)
  - [reference/it_male_2.mp3](reference/it_male_2.mp3)
  - [reference/en_female_1.mp3](reference/en_female_1.mp3)
  - [reference/en_male_1.mp3](reference/en_male_1.mp3)
- Il file di uscita predefinito è spesso [output.wav](output.wav) nella cartella corrente (o come indicato dall’opzione di output).

## Utilizzo dal notebook

È disponibile un notebook di prova: [test.ipynb](test.ipynb)

- Aprire il notebook in Visual Studio Code con il kernel dell’ambiente virtuale appena creato.
- Eseguire le celle per vedere esempi interattivi di sintesi.

## Struttura

```text
tts/
├─ tts_cli.py           # Script CLI per generare audio da testo
├─ requirements.txt     # Dipendenze Python
├─ test.ipynb           # Notebook di esempio
├─ reference/           # Clip audio di riferimento (voci di esempio)
└─ output.wav           # Esempio di output generato
```