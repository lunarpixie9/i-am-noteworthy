"""
live_transcribe.py — I.A.M. NoteWorthy (v3: device selection + gain + tunable VAD)

Uses WebRTC VAD to detect actual speech segments and filters out
low-confidence Whisper segments (hallucinations on silence).

New in v3:
  --list-devices   : print available audio input devices and exit
  --device N       : record from a specific input device index
  --gain G         : software amplification before VAD/transcription
  --vad-aggressiveness 0-3 : lower = more permissive (catches quieter speech)

Usage:
    python src/live_transcribe.py --list-devices
    python src/live_transcribe.py --session "lecture_2026_09_24" --device 1 --gain 2.0 --vad-aggressiveness 1
"""

import argparse
import datetime
import os
import sys

import numpy as np
import sounddevice as sd
import webrtcvad
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000
FRAME_MS = 30
FRAME_SAMPLES = int(SAMPLE_RATE * FRAME_MS / 1000)
SILENCE_FRAMES_TO_END = 20
MIN_SPEECH_FRAMES = 8
NO_SPEECH_PROB_THRESHOLD = 0.6

SESSIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sessions")


def transcribe_and_log(model, audio_segment, log_path):
    segments, _ = model.transcribe(audio_segment, language="en")
    text_parts = []
    for seg in segments:
        if seg.no_speech_prob > NO_SPEECH_PROB_THRESHOLD:
            continue
        text_parts.append(seg.text.strip())

    text = " ".join(text_parts).strip()
    if not text:
        return

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    line = f"**[{timestamp}]** {text}"
    print(line)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(line + "\n\n")


def apply_gain(frame_int16, gain):
    """Amplify audio and clip to int16 range to avoid wraparound distortion."""
    if gain == 1.0:
        return frame_int16
    amplified = frame_int16.astype(np.float32) * gain
    return np.clip(amplified, -32768, 32767).astype(np.int16)


def main():
    parser = argparse.ArgumentParser(description="Live lecture transcription with VAD.")
    parser.add_argument("--session", help="Name for this lecture session")
    parser.add_argument("--model", default="small", choices=["tiny", "base", "small", "medium"])
    parser.add_argument("--list-devices", action="store_true", help="List audio input devices and exit")
    parser.add_argument("--device", type=int, default=None, help="Input device index (see --list-devices)")
    parser.add_argument("--gain", type=float, default=1.0, help="Software amplification factor (e.g. 2.0 = 2x louder)")
    parser.add_argument("--vad-aggressiveness", type=int, default=2, choices=[0, 1, 2, 3],
                         help="0=permissive (catches quiet speech, more false positives), 3=strict")
    args = parser.parse_args()

    if args.list_devices:
        print(sd.query_devices())
        sys.exit(0)

    if not args.session:
        parser.error("--session is required (unless using --list-devices)")

    os.makedirs(SESSIONS_DIR, exist_ok=True)
    log_path = os.path.join(SESSIONS_DIR, f"{args.session}.md")

    print(f"Loading Whisper model '{args.model}'...")
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    vad = webrtcvad.Vad(args.vad_aggressiveness)

    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"\n# Session: {args.session}\nStarted: {datetime.datetime.now().isoformat()}\n\n")

    print(f"Recording started for session '{args.session}' (device={args.device}, gain={args.gain}, "
          f"vad_aggressiveness={args.vad_aggressiveness}). Press Ctrl+C to stop.")
    print(f"Transcript is being saved live to: {log_path}\n")

    stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype="int16", device=args.device)
    stream.start()

    speech_buffer = []
    silence_run = 0
    in_speech = False

    try:
        while True:
            frame, _ = stream.read(FRAME_SAMPLES)
            frame = frame[:, 0]
            frame = apply_gain(frame, args.gain)
            is_speech = vad.is_speech(frame.tobytes(), SAMPLE_RATE)

            if is_speech:
                speech_buffer.append(frame)
                silence_run = 0
                in_speech = True
            elif in_speech:
                silence_run += 1
                speech_buffer.append(frame)

                if silence_run >= SILENCE_FRAMES_TO_END:
                    if len(speech_buffer) - silence_run >= MIN_SPEECH_FRAMES:
                        audio_segment = np.concatenate(speech_buffer).astype(np.float32) / 32768.0
                        transcribe_and_log(model, audio_segment, log_path)
                    speech_buffer = []
                    silence_run = 0
                    in_speech = False
    except KeyboardInterrupt:
        stream.stop()
        stream.close()
        print(f"\nStopped. Full transcript saved to {log_path}")
        sys.exit(0)


if __name__ == "__main__":
    main()