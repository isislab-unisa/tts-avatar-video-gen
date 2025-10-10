import argparse
import os
from TTS.api import TTS
from torch.serialization import add_safe_globals
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig
import torch

print(torch.__file__)
print(torch.__version__)
add_safe_globals([XttsConfig])
add_safe_globals([XttsAudioConfig])
add_safe_globals([BaseDatasetConfig])
add_safe_globals([XttsArgs])

def get_tts(voice_gender="male", voice_options=1, language="it", text="Ciao!", output_path="output.wav"):
    # Get device
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = "tts_models/multilingual/multi-dataset/xtts_v2"

    # Initialize TTS
    tts = TTS(model).to(device)

    # TTS with list of amplitude values as output, clone the voice from `speaker_wav`
    reference = f"reference/{language}_{voice_gender}_{voice_options}.mp3"
    print(f"Using reference: {reference}")
    print(f"Synthesizing text: {text}")
    tts.tts_to_file(
        text=text,
        speaker_wav=reference,
        language=language,
        file_path="output.wav",
        split_sentences=True,
    )
    print(f"Audio generated and saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="CLI per sintesi vocale con Coqui TTS (XTTS v2).")
    mx = parser.add_mutually_exclusive_group(required=True)
    mx.add_argument("--text", type=str, help="Testo da sintetizzare.")
    mx.add_argument("--text-file", type=str, help="Percorso al file di testo contenente il testo da sintetizzare.")
    parser.add_argument("--voice-gender", type=str, choices=["male", "female"], required=True, help="Genere della voce.")
    parser.add_argument("--voice-options", type=int, choices=[1, 2], default=1, help="Opzioni di voce.")
    parser.add_argument("--language", type=str, choices=["it", "en"], default="it", help="Lingua della sintesi vocale.")
    
    args = parser.parse_args()
    
    if args.text is not None:
        text = args.text
    else:
        with open(args.text_file, 'r', encoding='utf-8') as f:
            text = f.read()
            
    get_tts(
        voice_gender = args.voice_gender,
        voice_options = args.voice_options,
        language = args.language,
        text = text
    )
    
if __name__ == "__main__":
    main()