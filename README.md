# I.A.M. NoteWorthy 
**Intelligent Audio-Mapper NoteWorthy**

*A self-writing lecture notebook: that listens, watches the board, and hands the user one clean, organized note when class ends.*

---

## The Problem

In a lecture, you can either focus on listening or focus on writing notes; rarely on both. Audio recordings are unsearchable and painful to review later (especially for procrastinators like me). Photos of the board are static and lose all context of *when* and *why* something was written. Nobody has time after class to manually merge both into something usable before the next lecture.

**I.A.M. NoteWorthy automates that merge, in real time, with zero manual formatting afterward.**

---

## How It Works

1. Hit **start** at the beginning of class — it begins transcribing audio continuously in the background.
2. Whenever something worth capturing goes up on the board, **snap a photo**.
3. Each photo is **OCR'd** and **timestamped**, then slotted into the transcript at the exact moment it was taken.
4. When class ends, hit **stop** — within a minute you get one clean, structured document: transcript + board content merged, with headings auto-inserted wherever the topic actually shifted.
5. The finished note is **auto-pushed** to Notion / Google Docs / a local Markdown file.

Nothing needs to be manually reconciled or formatted after class — that's the entire point.

---

## Features

**Built (MVP):**
- [x] Real-time speech-to-text during a live session, running fully locally (no internet dependency mid-class)
- [x] Board-photo capture → OCR → inserted into the session timeline at the correct timestamp

**In progress:**
- [ ] Automatic topic-segmentation → auto-inserted section headings, no manual editing
- [ ] One-click export to a clean, readable note file (Markdown/PDF)
- [ ] Auto-sync of the finished note to Notion or Google Docs

**Stretch goals:**
- [ ] Auto-trigger photo capture when the professor stands still at the board (frame-diff detection)
- [ ] Keyword-based flashcard generation from finished notes
- [ ] Full-text search across all past lecture sessions
- [ ] Speaker diarization (professor vs. student questions)

---

## Tech Stack

| Component | Tool | Why |
|---|---|---|
| Speech-to-text | [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) | Runs on CPU, no API cost, handles continuous audio well |
| Audio capture | `sounddevice` | Streams mic input in real time |
| OCR | `pytesseract` (Tesseract) | Fast, reliable text extraction from board photos |
| Topic segmentation | `sentence-transformers` | Embed transcript chunks, detect topic shifts via similarity drop |
| Note generation | Custom Python + Markdown templating | Merges transcript + OCR blocks into one structured document |
| Auto-export | Notion API / Google Docs API | Push final note automatically |
| Storage | Plain Markdown files (SQLite planned for search feature) | Simple, human-readable, portable |

---

## Project Structure

```
iam-noteworthy/
├── README.md
├── requirements.txt
├── .gitignore
├── sessions/              # transcripts land here, one file per lecture (gitignored)
└── src/
    ├── live_transcribe.py # continuous mic → timestamped text
    └── capture_board.py   # photo → OCR → inserted into the session log
```

---

## Setup

### 1. System dependencies

**Tesseract OCR:**
```bash
brew install tesseract          # macOS
sudo apt-get install tesseract-ocr   # Ubuntu/Debian
```

**PortAudio** (for microphone access):
```bash
brew install portaudio          # macOS
sudo apt-get install portaudio19-dev  # Ubuntu/Debian
```

### 2. Python environment

```bash
git clone https://github.com/<your-username>/iam-noteworthy.git
cd iam-noteworthy
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run it

**Start a live transcription session:**
```bash
python src/live_transcribe.py --session "lecture_2026_09_24"
```

**Capture and OCR a board photo into the same session:**
```bash
python src/capture_board.py --session "lecture_2026_09_24" --image board1.jpg
```

Both write into `sessions/lecture_2026_09_24.md`, in timestamp order.

> **Note (macOS):** the first run will prompt for microphone permission — grant it to your terminal app in System Settings → Privacy & Security → Microphone.

---

## Roadmap

- **Week 1** — Live transcription MVP ✅
- **Week 2** — Board photo capture + OCR ✅
- **Week 3** — Topic-segmentation + auto-headings, clean note generation
- **Week 4** — Auto-export to Notion/Google Docs, interface polish

---

## Why This Project

Most "lecture note" tools either just transcribe audio (unsearchable wall of text) or just photograph the board (no context). The genuinely hard part here isn't calling a speech-to-text API — it's designing the merge logic that reconstructs a coherent, navigable document from two independent, asynchronous input streams, and doing it without any manual step afterward.

---

## License

MIT — feel free to fork and adapt.
