"""
process_lecture.py — I.A.M. NoteWorthy (batch mode)

Record the whole lecture on your laptop with record_session.py (or your
phone's voice memo app), and separately gather any slides the professor
shares (PDF/PPTX) and any board photos you manage to get. After class,
run this once to get one merged note — audio transcript on a timeline,
board photos folded into that same timeline, and slide text extracted
directly (not OCR'd — it's read straight from the file) as a separate
reference section, since slides don't have a natural moment in time the
way audio does.

Usage:
    python src/process_lecture.py \
        --session "lecture_2026_09_24" \
        --audio recordings/lecture1.wav \
        --start-time "00:00:00" \
        --photos photos/lecture1/ \
        --slides slides/lecture1.pdf slides/lecture1_extra.pptx
"""

import argparse
import datetime
import glob
import os
import re

import pdfplumber
import pillow_heif
import pytesseract
from faster_whisper import WhisperModel
from PIL import ExifTags, Image
from pptx import Presentation

pillow_heif.register_heif_opener()  # lets Pillow open iPhone .HEIC photos

SESSIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sessions")
NO_SPEECH_PROB_THRESHOLD = 0.6


def parse_start_time(start_time_str, audio_path):
    if start_time_str:
        today = datetime.date.today()
        hh, mm, ss = [int(x) for x in start_time_str.split(":")]
        return datetime.datetime.combine(today, datetime.time(hh, mm, ss))
    mtime = os.path.getmtime(audio_path)
    return datetime.datetime.fromtimestamp(mtime)


def get_photo_timestamp(image_path, start_time=None):
    """Prefer our own recorder's elapsed-time filename (board_00125.jpg ->
    125s into the recording). Falls back to phone EXIF capture time, then
    file modification time — for photos taken on a phone instead of the
    laptop webcam recorder."""
    filename = os.path.basename(image_path)
    match = re.match(r"board_(\d+)", filename)
    if match and start_time is not None:
        elapsed_seconds = int(match.group(1))
        return start_time + datetime.timedelta(seconds=elapsed_seconds)

    try:
        image = Image.open(image_path)
        exif = image.getexif()
        for tag_id, value in exif.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            if tag == "DateTime":
                return datetime.datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return datetime.datetime.fromtimestamp(os.path.getmtime(image_path))


def transcribe_audio(model, audio_path, start_time):
    entries = []
    segments, _ = model.transcribe(audio_path, language="en")
    for seg in segments:
        if seg.no_speech_prob > NO_SPEECH_PROB_THRESHOLD:
            continue
        text = seg.text.strip()
        if not text:
            continue
        timestamp = start_time + datetime.timedelta(seconds=seg.start)
        entries.append((timestamp, "text", text))
    return entries


def ocr_photos(photos_dir, start_time=None):
    entries = []
    for path in sorted(glob.glob(os.path.join(photos_dir, "*"))):
        if not path.lower().endswith((".jpg", ".jpeg", ".png", ".heic")):
            continue
        text = pytesseract.image_to_string(Image.open(path)).strip()
        if not text:
            continue
        timestamp = get_photo_timestamp(path, start_time)
        entries.append((timestamp, "photo", text))
    return entries


def extract_slide_text(path):
    """Read text directly from a PDF or PPTX — no OCR needed since it's
    already digital text. Returns a list of (page_or_slide_number, text)."""
    ext = os.path.splitext(path)[1].lower()

    if ext == ".pdf":
        pages = []
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = (page.extract_text() or "").strip()
                if text:
                    pages.append((i, text))
        return pages

    elif ext == ".pptx":
        prs = Presentation(path)
        slides = []
        for i, slide in enumerate(prs.slides, start=1):
            lines = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        line = "".join(run.text for run in para.runs).strip()
                        if line:
                            lines.append(line)
            if lines:
                slides.append((i, "\n".join(lines)))
        return slides

    else:
        print(f"  Skipping unsupported slide format: {path}")
        return []


def write_session(session_name, entries, slide_files=None):
    log_path = os.path.join(SESSIONS_DIR, f"{session_name}.md")
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    entries.sort(key=lambda e: e[0])

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"# Session: {session_name}\nProcessed: {datetime.datetime.now().isoformat()}\n\n")
        for timestamp, kind, text in entries:
            ts = timestamp.strftime("%H:%M:%S")
            if kind == "photo":
                f.write(f"**[{ts}] \U0001F4F7 Board capture:**\n```\n{text}\n```\n\n")
            else:
                f.write(f"**[{ts}]** {text}\n\n")

        if slide_files:
            f.write("\n---\n\n## Reference Material (Slides)\n\n")
            for slide_path, pages in slide_files:
                f.write(f"### {os.path.basename(slide_path)}\n\n")
                for number, text in pages:
                    f.write(f"**Slide/Page {number}:**\n```\n{text}\n```\n\n")
    return log_path


def main():
    parser = argparse.ArgumentParser(description="Batch-process a recorded lecture into one merged note.")
    parser.add_argument("--session", required=True)
    parser.add_argument("--audio", required=True, help="Path to the full lecture audio recording")
    parser.add_argument("--start-time", default=None,
                         help="Recording start time as HH:MM:SS (24h). Defaults to the audio file's own timestamp.")
    parser.add_argument("--photos", default=None, help="Folder of board photos taken during the lecture")
    parser.add_argument("--slides", nargs="+", default=None,
                         help="One or more slide files (PDF/PPTX) the professor shared")
    parser.add_argument("--model", default="small", choices=["tiny", "base", "small", "medium"])
    args = parser.parse_args()

    print(f"Loading Whisper model '{args.model}'...")
    model = WhisperModel(args.model, device="cpu", compute_type="int8")

    start_time = parse_start_time(args.start_time, args.audio)
    print(f"Assuming recording started at: {start_time}")

    print("Transcribing audio (this can take a bit for a full lecture)...")
    entries = transcribe_audio(model, args.audio, start_time)
    print(f"  -> {len(entries)} speech segments kept after filtering hallucinations.")

    if args.photos:
        print("Running OCR on board photos...")
        photo_entries = ocr_photos(args.photos, start_time)
        print(f"  -> {len(photo_entries)} photos with extracted text.")
        entries.extend(photo_entries)

    slide_files = None
    if args.slides:
        print("Extracting text from slides...")
        slide_files = []
        for slide_path in args.slides:
            pages = extract_slide_text(slide_path)
            print(f"  -> {os.path.basename(slide_path)}: {len(pages)} pages/slides with text.")
            if pages:
                slide_files.append((slide_path, pages))

    log_path = write_session(args.session, entries, slide_files)
    print(f"\nDone. Merged note saved to: {log_path}")


if __name__ == "__main__":
    main()