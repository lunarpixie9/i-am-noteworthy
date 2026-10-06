// ===== I.A.M. NoteWorthy — frontend prototype =====
// NOTE: recording/processing here are MOCKED so the whole flow is clickable
// and demoable without a backend yet. Swap the marked sections for real
// fetch() calls once the FastAPI backend exists.

const screens = {
  record: document.getElementById('screen-record'),
  processing: document.getElementById('screen-processing'),
  notes: document.getElementById('screen-notes'),
};
const historyScreen = document.getElementById('screen-history');

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ---------- Recording state ----------
let timerInterval = null;
let elapsed = 0;
let isRecording = false;
let uploadCount = 0;
let uploadedFiles = []; // {dataUrl, name, time, isImage}

const btnRecord = document.getElementById('btn-record');
const idleControls = document.getElementById('idle-controls');
const activeControls = document.getElementById('active-controls');
const timerEl = document.getElementById('timer');
const recordHeading = document.getElementById('record-heading');
const recordSubtext = document.getElementById('record-subtext');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const reviewControls = document.getElementById('review-controls');
const btnGenerate = document.getElementById('btn-generate');
const btnResumeAfterStop = document.getElementById('btn-resume-after-stop');
const btnAdd = document.getElementById('btn-add');
const fileInput = document.getElementById('file-input');
const uploadsStrip = document.getElementById('uploads-strip');
const mascotEl = document.getElementById('mascot');

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// idle and paused are simple infinite CSS loops. "listening" (actively recording)
// is a chained sequence instead: yawn plays once, fully, then curl plays once,
// fully, then back to yawn - looped by JS via the animationend event rather than
// two independent CSS loops, so there's never a jump-cut mid-animation.
const MASCOT_STATE_CLASS = {
  idle: 'state-blink',
  paused: 'state-curl',
};

function setMascotState(state) {
  if (state === 'listening') {
    startListeningCombo();
    return;
  }
  mascotEl.className = 'mascot-sprite ' + (MASCOT_STATE_CLASS[state] || 'state-blink');
}

function startListeningCombo() {
  mascotEl.className = 'mascot-sprite once state-yawn';
}

mascotEl.addEventListener('animationend', () => {
  if (!mascotEl.classList.contains('once')) return; // not in the chained combo right now
  const next = mascotEl.classList.contains('state-yawn') ? 'state-curl' : 'state-yawn';
  mascotEl.className = 'mascot-sprite once ' + next;
});

btnRecord.addEventListener('click', () => {
  isRecording = true;
  btnRecord.classList.add('recording');
  idleControls.classList.add('hidden');
  activeControls.classList.remove('hidden');
  timerEl.classList.add('visible');
  recordHeading.textContent = 'Recording your lecture';
  recordSubtext.textContent = 'Add a photo anytime — during class or after.';
  setMascotState('listening');

  timerInterval = setInterval(() => {
    elapsed++;
    timerEl.textContent = formatTime(elapsed);
  }, 1000);
});

btnPause.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btnPause.textContent = 'Resume';
    recordSubtext.textContent = 'Paused — hit resume when class continues.';
    setMascotState('paused');
  } else {
    timerInterval = setInterval(() => {
      elapsed++;
      timerEl.textContent = formatTime(elapsed);
    }, 1000);
    btnPause.textContent = 'Pause';
    recordSubtext.textContent = 'Add a photo anytime — during class or after.';
    setMascotState('listening');
  }
});

btnStop.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isRecording = false;
  btnPause.textContent = 'Pause';
  activeControls.classList.add('hidden');
  reviewControls.classList.remove('hidden');
  recordHeading.textContent = 'Lecture recorded!';
  recordSubtext.textContent = 'Add any last photos or slides, then generate your notes whenever you\'re ready.';
  setMascotState('idle');
});

btnResumeAfterStop.addEventListener('click', () => {
  isRecording = true;
  reviewControls.classList.add('hidden');
  activeControls.classList.remove('hidden');
  recordHeading.textContent = 'Recording your lecture';
  recordSubtext.textContent = 'Add a photo anytime — during class or after.';
  setMascotState('listening');
  timerInterval = setInterval(() => {
    elapsed++;
    timerEl.textContent = formatTime(elapsed);
  }, 1000);
});

btnGenerate.addEventListener('click', () => {
  startProcessing();
});

btnAdd.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    uploadCount++;
    const chip = document.createElement('div');
    chip.className = 'upload-chip';
    const timeLabel = isRecording ? formatTime(elapsed) : 'after class';

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        chip.innerHTML = `<img src="${ev.target.result}" alt=""><span class="chip-time">${timeLabel}</span>`;
        uploadedFiles.push({ dataUrl: ev.target.result, name: file.name, time: timeLabel, isImage: true });
      };
      reader.readAsDataURL(file);
    } else {
      chip.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.7rem;color:var(--ink-soft);padding:4px;text-align:center;">${file.name.split('.').pop().toUpperCase()}</div><span class="chip-time">${timeLabel}</span>`;
      uploadedFiles.push({ dataUrl: null, name: file.name, time: timeLabel, isImage: false });
    }
    uploadsStrip.appendChild(chip);
  });
  uploadsStrip.classList.remove('hidden');
});

// ---------- Processing: plays the sit -> stand -> walk (x4) -> sit sequence once, then reveals notes ----------
const WALK_TOTAL_MS = 7700; // must match the cat-walkseq / ground-walkseq animation-duration in style.css

const statusMessages = [
  'Listening back to the lecture...',
  'Reading your slides...',
  'Finding the key ideas...',
  'Almost there...',
];
const processingStatus = document.getElementById('processing-status');
const progressFill = document.getElementById('progress-fill');
const walkCat = document.getElementById('walk-cat');
const walkGround = document.getElementById('walk-ground');

function restartWalkAnimation() {
  // CSS one-shot animations (fill-mode: forwards) don't replay just by re-entering
  // the screen, so force a reflow to restart them from frame one each time.
  [walkCat, walkGround].forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

function startProcessing() {
  showScreen('processing');
  restartWalkAnimation();

  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  void progressFill.offsetWidth;
  progressFill.style.transition = `width ${WALK_TOTAL_MS}ms linear`;
  progressFill.style.width = '100%';

  let step = 0;
  processingStatus.textContent = statusMessages[0];
  const stepMs = WALK_TOTAL_MS / statusMessages.length;
  const stepInterval = setInterval(() => {
    step++;
    if (step < statusMessages.length) {
      processingStatus.textContent = statusMessages[step];
    } else {
      clearInterval(stepInterval);
    }
  }, stepMs);

  // The output screen is deliberately held back to match the full walk sequence,
  // so the cat finishes sitting back down before the notes are revealed.
  setTimeout(renderNotes, WALK_TOTAL_MS);

  // TODO: replace the setTimeout above with the real completion signal, e.g.
  // const res = await fetch('/api/process', { method: 'POST', body: formData });
  // const data = await res.json();
  // then call renderNotes(data) once the real response arrives (keep a minimum
  // delay of WALK_TOTAL_MS if you still want the full animation to play out).
}

// ---------- Notes result (mocked content, but structured the way real output will be) ----------
function renderNotes() {
  const mockData = {
    concepts: ['Collection', 'Ingestion', 'Storage', 'Processing', 'Data lifecycle'],
    summary: 'Today\'s lecture walked through the data engineering lifecycle end to end: how raw data is collected, ingested into a pipeline, stored, and then processed into something usable. The board mindmap ties the four stages together with their definitions, included below alongside what was said out loud.',
    timeline: [
      {
        type: 'text', time: '00:32', tag: 'Spoken', confidence: true,
        text: 'The data engineering lifecycle consists of multiple steps: collection, ingestion, storage, and processing. Each stage feeds into the next, and a problem early in the pipeline tends to cascade downstream.',
      },
      {
        type: 'text', time: '02:10', tag: 'Spoken', confidence: true,
        text: 'Collection is where raw data first enters the system — from APIs, application logs, sensors, or manual entry. Ingestion is the step that actually moves that raw data into a pipeline, either in scheduled batches or as a continuous stream.',
      },
      {
        type: 'photo', time: '05:44', tag: 'Board notes', confidence: false,
        caption: 'Mindmap: the four lifecycle stages, each with its own definition and how they connect to the next.',
      },
      {
        type: 'text', time: '08:15', tag: 'Spoken', confidence: true,
        text: 'Storage choices depend on how the data gets used later — a data warehouse for structured analytics, or a data lake for flexible, less structured storage. Processing is where raw data is actually transformed into something usable: cleaned, joined, and aggregated.',
      },
    ],
  };

  // If a real photo was uploaded during this session, use it in place of the placeholder.
  const realImage = uploadedFiles.find(f => f.isImage);
  if (realImage) {
    const photoItem = mockData.timeline.find(item => item.type === 'photo');
    photoItem.dataUrl = realImage.dataUrl;
    photoItem.time = realImage.time;
  }

  renderNotesFromData(mockData);
  showScreen('notes');
}

// A simple placeholder mindmap graphic, used only when no real photo was uploaded —
// demonstrates the "keep the visual structure" approach even in the mock.
const MINDMAP_PLACEHOLDER_SVG = `
<svg class="mindmap-placeholder" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="180" fill="#FFFBF7"/>
  <line x1="160" y1="90" x2="70" y2="35" stroke="#F4A896" stroke-width="2"/>
  <line x1="160" y1="90" x2="250" y2="35" stroke="#F4A896" stroke-width="2"/>
  <line x1="160" y1="90" x2="70" y2="145" stroke="#BEE3F0" stroke-width="2"/>
  <line x1="160" y1="90" x2="250" y2="145" stroke="#BEE3F0" stroke-width="2"/>
  <circle cx="160" cy="90" r="30" fill="#F4A896"/>
  <text x="160" y="94" text-anchor="middle" font-size="10" font-family="Nunito Sans" fill="#2B2320" font-weight="700">Lifecycle</text>
  <circle cx="70" cy="35" r="22" fill="#FDEDE4" stroke="#F4A896" stroke-width="2"/>
  <text x="70" y="39" text-anchor="middle" font-size="9" font-family="Nunito Sans" fill="#2B2320">Collection</text>
  <circle cx="250" cy="35" r="22" fill="#FDEDE4" stroke="#F4A896" stroke-width="2"/>
  <text x="250" y="39" text-anchor="middle" font-size="9" font-family="Nunito Sans" fill="#2B2320">Ingestion</text>
  <circle cx="70" cy="145" r="22" fill="#FDEDE4" stroke="#BEE3F0" stroke-width="2"/>
  <text x="70" y="149" text-anchor="middle" font-size="9" font-family="Nunito Sans" fill="#2B2320">Storage</text>
  <circle cx="250" cy="145" r="22" fill="#FDEDE4" stroke="#BEE3F0" stroke-width="2"/>
  <text x="250" y="149" text-anchor="middle" font-size="9" font-family="Nunito Sans" fill="#2B2320">Processing</text>
</svg>`;

function renderNotesFromData(data) {
  const chipRow = document.getElementById('chip-row');
  chipRow.innerHTML = '';
  data.concepts.forEach(c => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = c;
    chipRow.appendChild(chip);
  });

  document.getElementById('summary-card').textContent = data.summary;

  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = '';
  data.timeline.forEach(item => {
    const el = document.createElement('div');
    // Expanded ("open") by default — the whole point is to read the content
    // without an extra tap. Still toggleable for anyone who wants to skim.
    el.className = `timeline-item open ${item.type === 'photo' ? 'photo' : ''}`;

    const visual = item.type === 'photo'
      ? (item.dataUrl ? `<img class="ti-image" src="${item.dataUrl}" alt="Board photo">` : MINDMAP_PLACEHOLDER_SVG)
      : '';
    const bodyText = item.type === 'photo' ? item.caption : item.text;

    el.innerHTML = `
      <div class="ti-head">
        <span class="ti-time">${item.time}</span>
        <span class="ti-head-right">
          ${item.confidence ? '<span class="confidence-dot" title="High confidence"></span>' : ''}
          <span class="ti-tag">${item.tag}</span>
        </span>
      </div>
      <div class="ti-body">${visual}${bodyText}</div>
    `;
    el.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') return; // don't collapse when tapping the photo itself
      el.classList.toggle('open');
    });
    timelineEl.appendChild(el);
  });
}

document.getElementById('btn-notion').addEventListener('click', () => {
  // TODO: replace with a real call, e.g. fetch('/api/save-to-notion', {method:'POST'})
  document.getElementById('notion-status').classList.remove('hidden');
});

document.getElementById('btn-new-session').addEventListener('click', () => {
  elapsed = 0;
  isRecording = false;
  uploadCount = 0;
  uploadedFiles = [];
  timerEl.textContent = '00:00';
  timerEl.classList.remove('visible');
  btnRecord.classList.remove('recording');
  idleControls.classList.remove('hidden');
  activeControls.classList.add('hidden');
  reviewControls.classList.add('hidden');
  btnPause.textContent = 'Pause';
  recordHeading.textContent = 'Ready for class?';
  recordSubtext.textContent = 'Hit record when your professor starts talking.';
  uploadsStrip.innerHTML = '';
  uploadsStrip.classList.add('hidden');
  document.getElementById('notion-status').classList.add('hidden');
  setMascotState('idle');
  showScreen('record');
});

// ---------- Bottom nav / history ----------
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    if (item.dataset.nav === 'history') {
      renderHistory();
      historyScreen.classList.add('active');
    } else {
      historyScreen.classList.remove('active');
    }
  });
});

function renderHistory() {
  const list = document.getElementById('history-list');
  const mockHistory = [
    { date: 'Mon, Sep 22', preview: 'Intro to Neural Networks — backpropagation, activation functions...' },
    { date: 'Fri, Sep 19', preview: 'Database Normalization — 1NF through BCNF, functional dependencies...' },
    { date: 'Wed, Sep 17', preview: 'Data ecosystem overview — ingestion, transformation, storage layers...' },
  ];
  list.innerHTML = mockHistory.map(h => `
    <div class="history-card">
      <div class="hc-date">${h.date}</div>
      <div class="hc-preview">${h.preview}</div>
    </div>
  `).join('');
}