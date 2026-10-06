"""
record_session.py — I.A.M. NoteWorthy: laptop-only audio recorder

No phone, no camera needed. Control everything from the laptop that's
already open for your notes:

    s  - start / resume recording
    p  - pause recording
    q  - stop, save, and quit

Uses *elapsed recording time* (seconds of audio actually captured,
excluding paused stretches) so pauses don't desync anything downstream.
Feed the saved .wav into process_lecture.py afterward with
--start-time "00:00:00".

Usage:
    python src/record_session.py --session "lecture_2026_09_24"
    python src/record_session.py --session "lecture_2026_09_24" --device 0
"""

import argparse
import os
import threading
import wave

import numpy as np
import sounddevice as sd

SAMPLE_RATE = 16000
CHANNELS = 1

RECORDINGS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "recordings")


class Recorder:
    """Wraps a background audio stream that only writes frames while
    is_recording is True, so paused stretches leave no gap in elapsed time."""

    def __init__(self, device=None):
        self.frames = []
        self.is_recording = False
        self.lock = threading.Lock()
        self.stream = sd.InputStream(
            samplerate=SAMPLE_RATE, channels=CHANNELS, dtype="int16",
            device=device, callback=self._callback,
        )

    def _callback(self, indata, frame_count, time_info, status):
        if self.is_recording:
            with self.lock:
                self.frames.append(indata.copy())

    def start(self):
        if not self.stream.active:
            self.stream.start()
        self.is_recording = True

    def pause(self):
        self.is_recording = False

    def elapsed_seconds(self):
        with self.lock:
            total_samples = sum(f.shape[0] for f in self.frames)
        return total_samples / SAMPLE_RATE

    def save(self, path):
        with self.lock:
            audio = np.concatenate(self.frames) if self.frames else np.zeros((0, CHANNELS), dtype="int16")
        with wave.open(path, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)  # int16 = 2 bytes
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(audio.tobytes())


def main():
    parser = argparse.ArgumentParser(description="Laptop-controlled lecture audio recorder.")
    parser.add_argument("--session", required=True)
    parser.add_argument("--device", type=int, default=None,
                         help="Input device index (see live_transcribe.py --list-devices)")
    args = parser.parse_args()

    os.makedirs(RECORDINGS_DIR, exist_ok=True)
    recorder = Recorder(device=args.device)

    print("Controls: s = start/resume, p = pause, q = stop & save")
    print("(type the letter, then press Enter)\n")

    try:
        while True:
            cmd = input("> ").strip().lower()
            if cmd == "s":
                recorder.start()
                print(f"Recording... (elapsed: {recorder.elapsed_seconds():.0f}s)")
            elif cmd == "p":
                recorder.pause()
                print(f"Paused. (elapsed: {recorder.elapsed_seconds():.0f}s)")
            elif cmd == "q":
                recorder.pause()
                break
            else:
                print("Unknown command. Use s / p / q.")
    except KeyboardInterrupt:
        pass
    finally:
        audio_path = os.path.join(RECORDINGS_DIR, f"{args.session}.wav")
        recorder.save(audio_path)
        recorder.stream.stop()
        recorder.stream.close()
        print(f"\nSaved recording: {audio_path}")
        print(f"\nNext step:")
        print(f'  python src/process_lecture.py --session "{args.session}" --audio "{audio_path}" --start-time "00:00:00"')
        print(f'  (add --photos <folder> and/or --slides <file1> <file2> ... if you have them)')


if __name__ == "__main__":
    main()