// ===== I.A.M. NoteWorthy — Frontend Prototype & Full Features =====

// Screen elements
const screens = {
  welcome: document.getElementById('screen-welcome'),
  record: document.getElementById('screen-record'),
  processing: document.getElementById('screen-processing'),
  notes: document.getElementById('screen-notes'),
  history: document.getElementById('screen-history'),
};

const navItems = {
  welcome: document.getElementById('nav-welcome'),
  record: document.getElementById('nav-record'),
  notes: document.getElementById('nav-notes'),
  history: document.getElementById('nav-history'),
};

function showScreen(name) {
  // Hide all screens
  Object.values(screens).forEach(s => {
    if (s) s.classList.remove('active');
  });

  // Activate requested screen
  if (screens[name]) {
    screens[name].classList.add('active');
  }

  // Update bottom nav active state
  Object.keys(navItems).forEach(key => {
    if (navItems[key]) {
      if (key === name) {
        navItems[key].classList.add('active');
      } else {
        navItems[key].classList.remove('active');
      }
    }
  });

  // Auto scroll wrapper to top
  const wrapper = document.getElementById('screens-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
}


// ==========================================================================
// 1. ONBOARDING / WELCOME SCROLLER (Matching Reference Design)
// ==========================================================================
const welcomeData = [
  {
    title: "Welcome to NoteWorthy",
    subtitle: "Turn any lecture into beautifully structured notes, mindmaps, and instant Notion docs in seconds."
  },
  {
    title: "One-Tap Voice Sync",
    subtitle: "Capture live lecture audio with real-time waveform sync, auto-pause detection, and high-fidelity speech recognition."
  },
  {
    title: "Snap & Sync Visuals",
    subtitle: "Snap blackboard diagrams, presentation slides, or handwritten notes — synced right to spoken lecture timestamps."
  },
  {
    title: "Instant Notes & Notion",
    subtitle: "Generate executive summaries, key concepts, interactive mindmaps, and 1-click sync to your Notion workspace."
  }
];

let currentWelcomeStep = 0;
let isWelcomeAnimating = false;

const welcomeViewport = document.getElementById('welcome-viewport');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeSubtitle = document.getElementById('welcome-subtitle');
const welcomeTextSlot = document.getElementById('welcome-text-slot');
const stepDots = document.querySelectorAll('.step-dot');
const btnWelcomeStart = document.getElementById('btn-welcome-start');
const btnWelcomeSkip = document.getElementById('btn-welcome-skip');

function setWelcomeStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= welcomeData.length) return;
  if (isWelcomeAnimating) return;

  isWelcomeAnimating = true;
  currentWelcomeStep = stepIndex;

  // Animate text slot smoothly while staying in fixed layout
  welcomeTextSlot.classList.add('animating');

  // Switch active background layers
  for (let i = 1; i <= 4; i++) {
    const bg = document.getElementById(`bg-step-${i}`);
    if (bg) {
      if (i === stepIndex + 1) {
        bg.classList.add('active');
      } else {
        bg.classList.remove('active');
      }
    }
  }

  // Update step dots
  stepDots.forEach((dot, idx) => {
    if (idx === stepIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Update button text: 'Get Started' for final slide, 'Next' for earlier slides
  if (btnWelcomeStart) {
    if (stepIndex === welcomeData.length - 1) {
      btnWelcomeStart.textContent = "Get Started";
    } else {
      btnWelcomeStart.textContent = "Next";
    }
  }

  // Crossfade text smoothly
  setTimeout(() => {
    welcomeTitle.textContent = welcomeData[stepIndex].title;
    welcomeSubtitle.textContent = welcomeData[stepIndex].subtitle;
    welcomeTextSlot.classList.remove('animating');
    isWelcomeAnimating = false;
  }, 200);
}

// Scroll / Wheel navigation on welcome screen (smooth bidirectional up/down scrolling)
let wheelCooldown = false;
if (welcomeViewport) {
  welcomeViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelCooldown || isWelcomeAnimating) return;

    if (e.deltaY > 15) {
      // Scroll down -> next step
      if (currentWelcomeStep < welcomeData.length - 1) {
        wheelCooldown = true;
        setWelcomeStep(currentWelcomeStep + 1);
        setTimeout(() => { wheelCooldown = false; }, 280);
      }
    } else if (e.deltaY < -15) {
      // Scroll up -> previous step
      if (currentWelcomeStep > 0) {
        wheelCooldown = true;
        setWelcomeStep(currentWelcomeStep - 1);
        setTimeout(() => { wheelCooldown = false; }, 280);
      }
    }
  }, { passive: false });

  // Touch swipe gestures (smooth bidirectional swipe up/down)
  let touchStartY = 0;
  welcomeViewport.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  welcomeViewport.addEventListener('touchend', (e) => {
    if (isWelcomeAnimating) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (diff > 30) {
      // Swiped up -> next step
      if (currentWelcomeStep < welcomeData.length - 1) {
        setWelcomeStep(currentWelcomeStep + 1);
      }
    } else if (diff < -30) {
      // Swiped down -> previous step
      if (currentWelcomeStep > 0) {
        setWelcomeStep(currentWelcomeStep - 1);
      }
    }
  }, { passive: true });
}

// Keyboard navigation for welcome slides
window.addEventListener('keydown', (e) => {
  const welcomeScreen = document.getElementById('screen-welcome');
  if (!welcomeScreen || !welcomeScreen.classList.contains('active')) return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    if (currentWelcomeStep < welcomeData.length - 1) {
      e.preventDefault();
      setWelcomeStep(currentWelcomeStep + 1);
    }
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
    if (currentWelcomeStep > 0) {
      e.preventDefault();
      setWelcomeStep(currentWelcomeStep - 1);
    }
  }
});

// Dot buttons
stepDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const step = parseInt(dot.getAttribute('data-step'), 10);
    setWelcomeStep(step);
  });
});

// Welcome Action buttons
if (btnWelcomeStart) {
  btnWelcomeStart.addEventListener('click', () => {
    if (currentWelcomeStep < welcomeData.length - 1) {
      setWelcomeStep(currentWelcomeStep + 1);
    } else {
      showScreen('record');
    }
  });
}

if (btnWelcomeSkip) {
  btnWelcomeSkip.addEventListener('click', () => {
    showScreen('record');
  });
}


// ==========================================================================
// 2. REAL AUDIO RECORDING & Web Audio Engine (Cross-Platform Mobile + Laptop)
// ==========================================================================
let timerInterval = null;
let elapsedSeconds = 0;
let isRecording = false;
let isPaused = false;
let uploadedFiles = []; // {dataUrl, name, time, isImage}

// Real Audio Recording instances
let mediaStream = null;
let mediaRecorder = null;
let recordedAudioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let activeAudioElement = null;
let audioContext = null;
let analyserNode = null;
let animFrameId = null;
let liveAudioVisualizerRunning = false;

const btnRecord = document.getElementById('btn-record');
const idleControls = document.getElementById('idle-controls');
const activeControls = document.getElementById('active-controls');
const reviewControls = document.getElementById('review-controls');
const timerEl = document.getElementById('timer');
const timerPulse = document.getElementById('timer-pulse');
const recordHeading = document.getElementById('record-heading');
const recordSubtext = document.getElementById('record-subtext');
const liveDot = document.getElementById('live-dot');
const btnPause = document.getElementById('btn-pause');
const btnPauseText = document.getElementById('btn-pause-text');
const btnRestart = document.getElementById('btn-restart');
const btnStop = document.getElementById('btn-stop');
const btnGenerate = document.getElementById('btn-generate');
const btnResumeAfterStop = document.getElementById('btn-resume-after-stop');
const btnAdd = document.getElementById('btn-add');
const fileInput = document.getElementById('file-input');
const uploadsStrip = document.getElementById('uploads-strip');
const mascotEl = document.getElementById('mascot');
const mascotMood = document.getElementById('mascot-mood');

// Detect supported audio mime types across iOS Safari, Android Chrome, and Desktop
function getSupportedAudioMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
    ''
  ];
  for (const type of types) {
    if (!type || (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type))) {
      return type;
    }
  }
  return '';
}

// Start Actual Microphone Capture
async function startActualAudioRecording() {
  recordedAudioChunks = [];
  recordedAudioBlob = null;
  if (recordedAudioUrl) {
    URL.revokeObjectURL(recordedAudioUrl);
    recordedAudioUrl = null;
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia not supported in this browser; session running in simulation fallback.');
      return;
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 48000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Set up Web Audio API Analyser for real-time visualizer & mascot reactions
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(mediaStream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 64;
        source.connect(analyserNode);
        startLiveVolumeTracker();
      }
    } catch (err) {
      console.warn('Web Audio context setup error:', err);
    }

    const mimeType = getSupportedAudioMimeType();
    const options = mimeType ? { mimeType } : {};
    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedAudioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (recordedAudioChunks.length > 0) {
        const type = mimeType || 'audio/webm';
        recordedAudioBlob = new Blob(recordedAudioChunks, { type });
        recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);
        setupAudioPlayerPlayback(recordedAudioUrl);
      }
    };

    mediaRecorder.start(250);
    console.log('Real audio recording active with MIME:', mimeType || 'default');
  } catch (err) {
    console.warn('Microphone permission info:', err);
    showToast('Session active 🎙️');
  }
}

function pauseActualAudioRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
  }
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

function resumeActualAudioRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function stopActualAudioRecording() {
  stopLiveVolumeTracker();
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
}

// Live volume tracker to pulse ambient glow to professor's voice
function startLiveVolumeTracker() {
  if (!analyserNode) return;
  liveAudioVisualizerRunning = true;
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  const mascotGlow = document.getElementById('mascot-glow');

  function tick() {
    if (!liveAudioVisualizerRunning || !analyserNode) return;
    analyserNode.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const volumeNormalized = Math.min(avg / 100, 1.4);

    if (mascotGlow && volumeNormalized > 0.05) {
      mascotGlow.style.transform = `scale(${1 + volumeNormalized * 0.18})`;
      mascotGlow.style.opacity = `${0.35 + volumeNormalized * 0.45}`;
    } else if (mascotGlow) {
      mascotGlow.style.transform = 'scale(1)';
      mascotGlow.style.opacity = '0.35';
    }

    animFrameId = requestAnimationFrame(tick);
  }
  tick();
}

function stopLiveVolumeTracker() {
  liveAudioVisualizerRunning = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  const mascotGlow = document.getElementById('mascot-glow');
  if (mascotGlow) {
    mascotGlow.style.transform = 'scale(1)';
    mascotGlow.style.opacity = '0.35';
  }
}

// Time format strictly as hour:minute:second -> 00:00:00
function formatTimeHHMMSS(totalSec) {
  const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSec % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Mascot Sprite States
const MASCOT_STATE_CLASS = {
  idle: 'state-blink',
  paused: 'state-curl',
  listening: 'state-yawn',
  happy: 'state-tailwag'
};

function setMascotState(state) {
  if (!mascotEl) return;
  if (state === 'listening') {
    mascotEl.className = 'mascot-sprite once state-yawn';
    return;
  }
  mascotEl.className = 'mascot-sprite ' + (MASCOT_STATE_CLASS[state] || 'state-blink');
}

if (mascotEl) {
  mascotEl.addEventListener('animationend', () => {
    if (!mascotEl.classList.contains('once')) return;
    const next = mascotEl.classList.contains('state-yawn') ? 'state-curl' : 'state-yawn';
    mascotEl.className = 'mascot-sprite once ' + next;
  });
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    if (timerEl) timerEl.textContent = formatTimeHHMMSS(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Initial START RECORDING button under mascot circle
if (btnRecord) {
  btnRecord.addEventListener('click', async () => {
    isRecording = true;
    isPaused = false;
    elapsedSeconds = 0;
    if (timerEl) timerEl.textContent = formatTimeHHMMSS(elapsedSeconds);

    // Switch UI states
    if (idleControls) idleControls.classList.add('hidden');
    if (activeControls) activeControls.classList.remove('hidden');
    if (reviewControls) reviewControls.classList.add('hidden');

    if (timerPulse) timerPulse.classList.add('active');
    if (liveDot) liveDot.classList.add('active');

    if (recordHeading) recordHeading.textContent = 'Recording Lecture';
    if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos or slides anytime during class.';
    setMascotState('listening');

    startTimer();
    try {
      await startActualAudioRecording();
    } catch (e) {
      console.warn('Audio recording init error:', e);
    }
    showToast('Live microphone recording started! 🎙️');
  });
}

// PAUSE / RESUME Button (Emphasis)
if (btnPause) {
  btnPause.addEventListener('click', () => {
    if (!isPaused) {
      // Pause
      isPaused = true;
      stopTimer();
      pauseActualAudioRecording();
      btnPause.classList.add('is-paused');
      if (btnPauseText) btnPauseText.textContent = 'Resume';
      const iconPause = btnPause.querySelector('.icon-pause');
      const iconResume = btnPause.querySelector('.icon-resume');
      if (iconPause) iconPause.classList.add('hidden');
      if (iconResume) iconResume.classList.remove('hidden');

      if (timerPulse) timerPulse.classList.remove('active');
      if (liveDot) liveDot.classList.remove('active');
      if (recordSubtext) recordSubtext.textContent = 'Recording paused. Tap Resume when professor continues.';
      setMascotState('paused');
      showToast('Recording paused ⏸️');
    } else {
      // Resume
      isPaused = false;
      resumeActualAudioRecording();
      btnPause.classList.remove('is-paused');
      if (btnPauseText) btnPauseText.textContent = 'Pause';
      const iconPause = btnPause.querySelector('.icon-pause');
      const iconResume = btnPause.querySelector('.icon-resume');
      if (iconPause) iconPause.classList.remove('hidden');
      if (iconResume) iconResume.classList.add('hidden');

      if (timerPulse) timerPulse.classList.add('active');
      if (liveDot) liveDot.classList.add('active');
      if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos or slides anytime during class.';
      setMascotState('listening');
      startTimer();
      showToast('Recording resumed ▶️');
    }
  });
}

// RESTART Button (Resets timer to 00:00:00 and restarts)
if (btnRestart) {
  btnRestart.addEventListener('click', async () => {
    if (confirm('Restart recording from 00:00:00?')) {
      elapsedSeconds = 0;
      if (timerEl) timerEl.textContent = formatTimeHHMMSS(elapsedSeconds);
      isPaused = false;
      if (btnPause) {
        btnPause.classList.remove('is-paused');
        const iconPause = btnPause.querySelector('.icon-pause');
        const iconResume = btnPause.querySelector('.icon-resume');
        if (iconPause) iconPause.classList.remove('hidden');
        if (iconResume) iconResume.classList.add('hidden');
      }
      if (btnPauseText) btnPauseText.textContent = 'Pause';

      if (timerPulse) timerPulse.classList.add('active');
      if (liveDot) liveDot.classList.add('active');
      setMascotState('listening');
      startTimer();
      stopActualAudioRecording();
      try {
        await startActualAudioRecording();
      } catch (e) {
        console.warn('Audio restart error:', e);
      }
      showToast('Recording restarted at 00:00:00 🔄');
    }
  });
}

// STOP / FINISH Button (End)
if (btnStop) {
  btnStop.addEventListener('click', () => {
    stopTimer();
    stopActualAudioRecording();
    isRecording = false;
    isPaused = false;

    if (activeControls) activeControls.classList.add('hidden');
    if (reviewControls) reviewControls.classList.remove('hidden');

    if (timerPulse) timerPulse.classList.remove('active');
    if (liveDot) liveDot.classList.remove('active');

    if (recordHeading) recordHeading.textContent = 'Lecture Completed!';
    if (recordSubtext) recordSubtext.textContent = `Recorded ${formatTimeHHMMSS(elapsedSeconds)}. Ready to generate your smart notes and Notion summary?`;
    setMascotState('idle');
    showToast('Recording captured successfully! 🎉');
  });
}

// Resume after stop link
if (btnResumeAfterStop) {
  btnResumeAfterStop.addEventListener('click', () => {
    isRecording = true;
    isPaused = false;
    if (reviewControls) reviewControls.classList.add('hidden');
    if (activeControls) activeControls.classList.remove('hidden');

    if (btnPause) {
      btnPause.classList.remove('is-paused');
      const iconPause = btnPause.querySelector('.icon-pause');
      const iconResume = btnPause.querySelector('.icon-resume');
      if (iconPause) iconPause.classList.remove('hidden');
      if (iconResume) iconResume.classList.add('hidden');
    }
    if (btnPauseText) btnPauseText.textContent = 'Pause';

    if (timerPulse) timerPulse.classList.add('active');
    if (liveDot) liveDot.classList.add('active');

    if (recordHeading) recordHeading.textContent = 'Recording Lecture';
    if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos or slides anytime during class.';
    setMascotState('listening');
    startTimer();
  });
}

// File / Slide upload
if (btnAdd && fileInput) {
  btnAdd.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const chip = document.createElement('div');
      chip.className = 'upload-chip';
      const timeLabel = isRecording ? formatTimeHHMMSS(elapsedSeconds) : '00:04:12';

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          chip.innerHTML = `<img src="${ev.target.result}" alt="Slide"><span class="chip-time">${timeLabel}</span>`;
          uploadedFiles.push({ dataUrl: ev.target.result, name: file.name, time: timeLabel, isImage: true });
        };
        reader.readAsDataURL(file);
      } else {
        chip.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.75rem;font-weight:700;color:var(--ink-body);">${file.name.split('.').pop().toUpperCase()}</div><span class="chip-time">${timeLabel}</span>`;
        uploadedFiles.push({ dataUrl: null, name: file.name, time: timeLabel, isImage: false });
      }
      uploadsStrip.appendChild(chip);
    });
    uploadsStrip.classList.remove('hidden');
    showToast(`Added ${files.length} slide attachment(s) 📸`);
  });
}

// ==========================================================================
// 2B. TOP DATE/TIME & INSTAGRAM-STYLE SUBJECT SWITCHER SHEET
// ==========================================================================
const topDatetimeBadge = document.getElementById('top-datetime-badge');
function updateTopDateTime() {
  if (!topDatetimeBadge) return;
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;
  topDatetimeBadge.textContent = `${day} ${month} ${year} | ${timeStr}`;
}
updateTopDateTime();
setInterval(updateTopDateTime, 10000);

// Subjects State
let subjectsList = [
  { id: 'data-eng', name: 'Data Engineering', color: '#DE7B63', count: 2 },
  { id: 'ml', name: 'Machine Learning', color: '#6A8D73', count: 1 },
  { id: 'dist-sys', name: 'Distributed Systems', color: '#5B7FA8', count: 1 },
  { id: 'db-norm', name: 'Database Normalization', color: '#D48C46', count: 1 }
];
let activeSubjectId = 'data-eng';

const btnSubjectPicker = document.getElementById('btn-subject-picker') || document.getElementById('btn-course-picker');
const activeCourseName = document.getElementById('active-course-name');
const activeSubjectDot = document.getElementById('active-subject-dot');
const subjectSheetModal = document.getElementById('subject-sheet-modal');
const btnCloseSubjectSheet = document.getElementById('btn-close-subject-sheet');
const subjectListContainer = document.getElementById('subject-list-container');
const subjectSheetMain = document.getElementById('subject-sheet-main');
const addSubjectFormPanel = document.getElementById('add-subject-form-panel');
const btnOpenAddSubject = document.getElementById('btn-open-add-subject');
const btnCancelAddSubject = document.getElementById('btn-cancel-add-subject');
const btnSaveNewSubject = document.getElementById('btn-save-new-subject');
const newSubjectNameInput = document.getElementById('new-subject-name-input');
const colorPalette = document.getElementById('color-palette');
let selectedNewSubjectColor = '#DE7B63';

function getActiveSubject() {
  return subjectsList.find(s => s.id === activeSubjectId) || subjectsList[0];
}

function updateActiveSubjectUI() {
  const current = getActiveSubject();
  if (activeCourseName) activeCourseName.textContent = current.name;
  if (activeSubjectDot) activeSubjectDot.style.background = current.color;
  const notesTitle = document.getElementById('notes-lecture-title');
  if (notesTitle) notesTitle.textContent = current.name;
}

function renderSubjectSheetList() {
  if (!subjectListContainer) return;
  subjectListContainer.innerHTML = subjectsList.map(subj => {
    const isActive = subj.id === activeSubjectId;
    return `
      <div class="subject-item ${isActive ? 'active' : ''}" data-id="${subj.id}">
        <div class="subject-item-left">
          <div class="subject-avatar-dot" style="background:${subj.color};">
            ${subj.name.charAt(0).toUpperCase()}
          </div>
          <div class="subject-info-col">
            <span class="subject-name-text">${subj.name}</span>
            <span class="subject-count-text">${subj.count} session${subj.count !== 1 ? 's' : ''} saved</span>
          </div>
        </div>
        ${isActive ? `
          <div class="subject-check-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Item click to select
  subjectListContainer.querySelectorAll('.subject-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      activeSubjectId = id;
      updateActiveSubjectUI();
      closeSubjectSheet();
      showToast(`Switched to ${getActiveSubject().name} 📚`);
    });
  });
}

function openSubjectSheet() {
  if (!subjectSheetModal) return;
  if (subjectSheetMain) subjectSheetMain.classList.remove('hidden');
  if (addSubjectFormPanel) addSubjectFormPanel.classList.add('hidden');
  renderSubjectSheetList();
  subjectSheetModal.classList.remove('hidden');
}

function closeSubjectSheet() {
  if (subjectSheetModal) subjectSheetModal.classList.add('hidden');
}

if (btnSubjectPicker) {
  btnSubjectPicker.addEventListener('click', openSubjectSheet);
}

if (btnCloseSubjectSheet) {
  btnCloseSubjectSheet.addEventListener('click', closeSubjectSheet);
}

if (subjectSheetModal) {
  subjectSheetModal.addEventListener('click', (e) => {
    if (e.target === subjectSheetModal) closeSubjectSheet();
  });
}

// Switch to Add Subject Form inside the sheet
if (btnOpenAddSubject) {
  btnOpenAddSubject.addEventListener('click', () => {
    if (subjectSheetMain) subjectSheetMain.classList.add('hidden');
    if (addSubjectFormPanel) addSubjectFormPanel.classList.remove('hidden');
    if (newSubjectNameInput) {
      newSubjectNameInput.value = '';
      setTimeout(() => newSubjectNameInput.focus(), 150);
    }
  });
}

if (btnCancelAddSubject) {
  btnCancelAddSubject.addEventListener('click', () => {
    if (addSubjectFormPanel) addSubjectFormPanel.classList.add('hidden');
    if (subjectSheetMain) subjectSheetMain.classList.remove('hidden');
  });
}

// Color palette picker
if (colorPalette) {
  colorPalette.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      colorPalette.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedNewSubjectColor = dot.getAttribute('data-color');
    });
  });
}

// Create New Subject
if (btnSaveNewSubject) {
  btnSaveNewSubject.addEventListener('click', () => {
    const name = newSubjectNameInput ? newSubjectNameInput.value.trim() : '';
    if (!name) {
      alert('Please enter a subject name');
      return;
    }

    const id = 'subj-' + Date.now();
    const newSubj = {
      id,
      name,
      color: selectedNewSubjectColor,
      count: 0
    };

    subjectsList.push(newSubj);
    activeSubjectId = id;
    updateActiveSubjectUI();
    closeSubjectSheet();
    showToast(`Created "${name}"! Ready to record notes 🎓`);
  });
}

updateActiveSubjectUI();


// ==========================================================================
// 3. PROCESSING SCREEN
// ==========================================================================
const WALK_TOTAL_MS = 7700;
const statusMessages = [
  'Listening back to the lecture stream...',
  'Aligning speech timestamps with slide photos...',
  'Extracting core concepts & executive summary...',
  'Generating Notion cards and mindmap...'
];

const processingStatus = document.getElementById('processing-status');
const progressFill = document.getElementById('progress-fill');
const walkCat = document.getElementById('walk-cat');
const walkGround = document.getElementById('walk-ground');

function restartWalkAnimation() {
  if (!walkCat || !walkGround) return;
  [walkCat, walkGround].forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

if (btnGenerate) {
  btnGenerate.addEventListener('click', () => {
    startProcessing();
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

  setTimeout(renderNotes, WALK_TOTAL_MS);
}


// ==========================================================================
// 4. GENERATED NOTES RESULT (Save, Export, Notion)
// ==========================================================================
let currentNoteData = null;
let isFavorited = false;

const MINDMAP_PLACEHOLDER_SVG = `
<svg class="mindmap-placeholder" viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="170" fill="#FFFDF9" rx="12"/>
  <line x1="160" y1="85" x2="70" y2="35" stroke="#DE7B63" stroke-width="2.5" stroke-dasharray="4 4"/>
  <line x1="160" y1="85" x2="250" y2="35" stroke="#DE7B63" stroke-width="2.5" stroke-dasharray="4 4"/>
  <line x1="160" y1="85" x2="70" y2="135" stroke="#A4CBB2" stroke-width="2.5"/>
  <line x1="160" y1="85" x2="250" y2="135" stroke="#A4CBB2" stroke-width="2.5"/>
  <circle cx="160" cy="85" r="28" fill="#DE7B63"/>
  <text x="160" y="89" text-anchor="middle" font-size="11" font-family="Outfit, sans-serif" fill="#FFFFFF" font-weight="700">Data Lifecycle</text>
  <circle cx="70" cy="35" r="22" fill="#FDEEE9" stroke="#DE7B63" stroke-width="2"/>
  <text x="70" y="39" text-anchor="middle" font-size="9" font-family="Plus Jakarta Sans, sans-serif" fill="#2E1E1A" font-weight="700">Collection</text>
  <circle cx="250" cy="35" r="22" fill="#FDEEE9" stroke="#DE7B63" stroke-width="2"/>
  <text x="250" y="39" text-anchor="middle" font-size="9" font-family="Plus Jakarta Sans, sans-serif" fill="#2E1E1A" font-weight="700">Ingestion</text>
  <circle cx="70" cy="135" r="22" fill="#EBF5EE" stroke="#A4CBB2" stroke-width="2"/>
  <text x="70" y="139" text-anchor="middle" font-size="9" font-family="Plus Jakarta Sans, sans-serif" fill="#2E1E1A" font-weight="700">Storage</text>
  <circle cx="250" cy="135" r="22" fill="#EBF5EE" stroke="#A4CBB2" stroke-width="2"/>
  <text x="250" y="139" text-anchor="middle" font-size="9" font-family="Plus Jakarta Sans, sans-serif" fill="#2E1E1A" font-weight="700">Processing</text>
</svg>`;

function renderNotes() {
  const activeCourse = activeCourseName ? activeCourseName.textContent : 'Data Engineering';
  const durationText = elapsedSeconds > 0 ? formatTimeHHMMSS(elapsedSeconds) : '42:15';

  currentNoteData = {
    title: activeCourse,
    date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: durationText,
    concepts: ['Data Pipelines', 'Batch vs Streaming Ingestion', 'Warehouse vs Lake', 'ETL / ELT', 'Fault Tolerance'],
    summary: 'Today\'s lecture explored the end-to-end data engineering lifecycle: from multi-source collection to batch/streaming ingestion pipelines, scalable warehouse/lake storage architectures, and downstream transformation layers.',
    timeline: [
      {
        type: 'text', time: '00:00:45', tag: 'Spoken', confidence: true,
        text: 'The data engineering lifecycle consists of four interconnected stages: collection, ingestion, storage, and processing. Any upstream fault propagates downstream exponentially.'
      },
      {
        type: 'text', time: '00:04:12', tag: 'Spoken', confidence: true,
        text: 'Collection sources include transactional databases, IoT telemetry, and webhooks. Ingestion routes data via Kafka or scheduled batch pipelines into raw staging.'
      },
      {
        type: 'photo', time: '00:08:30', tag: 'Blackboard Sync', confidence: false,
        caption: 'Board Diagram: Architectural flow from raw event sources into Lakehouse tables with schema validation.'
      },
      {
        type: 'text', time: '00:15:20', tag: 'Spoken', confidence: true,
        text: 'For storage, data warehouses excel at structured SQL analytics, while object lakes accommodate semi-structured JSON and parquet files for machine learning pipelines.'
      }
    ]
  };

  const realImage = uploadedFiles.find(f => f.isImage);
  if (realImage) {
    const photoItem = currentNoteData.timeline.find(item => item.type === 'photo');
    if (photoItem) {
      photoItem.dataUrl = realImage.dataUrl;
      photoItem.time = realImage.time;
    }
  }

  // Populate Key Concepts
  const chipRow = document.getElementById('chip-row');
  chipRow.innerHTML = '';
  currentNoteData.concepts.forEach(concept => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = concept;
    chip.addEventListener('click', () => {
      showToast(`Concept filtered: "${concept}" 🔍`);
    });
    chipRow.appendChild(chip);
  });

  // Populate Summary
  document.getElementById('summary-card').textContent = currentNoteData.summary;

  // Populate Timeline
  const timelineEl = document.getElementById('timeline');
  timelineEl.innerHTML = '';
  currentNoteData.timeline.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = `timeline-item open ${item.type === 'photo' ? 'photo' : ''}`;

    const visual = item.type === 'photo'
      ? (item.dataUrl ? `<img class="ti-image" src="${item.dataUrl}" alt="Board slide">` : MINDMAP_PLACEHOLDER_SVG)
      : '';
    const bodyText = item.type === 'photo' ? item.caption : item.text;

    itemEl.innerHTML = `
      <div class="ti-head">
        <span class="ti-time">${item.time}</span>
        <span class="ti-head-right">
          <span class="ti-tag">${item.tag}</span>
        </span>
      </div>
      <div class="ti-body">${visual}${bodyText}</div>
    `;

    itemEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') return;
      itemEl.classList.toggle('open');
    });

    timelineEl.appendChild(itemEl);
  });

  // Reset audio player state
  isAudioPlaying = false;
  if (audioPlayerCard) audioPlayerCard.classList.remove('playing');
  if (btnAudioPlay) {
    const playIcon = btnAudioPlay.querySelector('.audio-play-icon');
    const pauseIcon = btnAudioPlay.querySelector('.audio-pause-icon');
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
  }

  // Reset tool buttons
  isFavorited = false;
  updateHeartUI();

  // Save to history & increment subject count if recorded
  const activeSubj = getActiveSubject();
  if (activeSubj) {
    activeSubj.count++;
  }
  const newHistItem = {
    id: Date.now(),
    title: activeCourse,
    date: 'Today &middot; ' + durationText,
    preview: currentNoteData.summary,
    favorite: false
  };
  mockHistoryData.unshift(newHistItem);

  showScreen('notes');
  showToast('Notes generated successfully! ✨');
}

// Heart Button (Favorite / Save)
const btnHeart = document.getElementById('btn-heart');
const heartLabel = document.getElementById('heart-label');

function updateHeartUI() {
  if (!btnHeart) return;
  if (isFavorited) {
    btnHeart.classList.add('active');
    if (heartLabel) heartLabel.textContent = 'Saved';
  } else {
    btnHeart.classList.remove('active');
    if (heartLabel) heartLabel.textContent = 'Save';
  }
}

if (btnHeart) {
  btnHeart.addEventListener('click', () => {
    isFavorited = !isFavorited;
    updateHeartUI();
    if (isFavorited) {
      showToast('Added note to Saved Favorites! ❤️');
    } else {
      showToast('Removed note from Favorites 🤍');
    }
  });
}

// Export Modal & Options
const btnExportMenu = document.getElementById('btn-export-menu');
const exportModal = document.getElementById('export-modal');
const btnCloseExport = document.getElementById('btn-close-export');
const exportOptions = document.querySelectorAll('.export-option-card');

if (btnExportMenu && exportModal) {
  btnExportMenu.addEventListener('click', () => {
    exportModal.classList.remove('hidden');
  });
}

if (btnCloseExport && exportModal) {
  btnCloseExport.addEventListener('click', () => {
    exportModal.classList.add('hidden');
  });
}

if (exportModal) {
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      exportModal.classList.add('hidden');
    }
  });
}

exportOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const format = opt.getAttribute('data-format');
    exportModal.classList.add('hidden');

    if (format === 'markdown') {
      downloadMarkdown();
    } else if (format === 'pdf') {
      showToast('Generated PDF Summary report! 📑');
    } else if (format === 'clipboard') {
      copyNotesToClipboard();
    }
  });
});

function downloadMarkdown() {
  if (!currentNoteData) return;
  let md = `# ${currentNoteData.title} — Lecture Notes\n\n`;
  md += `**Date:** ${currentNoteData.date} | **Duration:** ${currentNoteData.duration}\n\n`;
  md += `## Key Concepts\n${currentNoteData.concepts.map(c => `- ${c}`).join('\n')}\n\n`;
  md += `## Executive Summary\n${currentNoteData.summary}\n\n`;
  md += `## Full Synced Timeline\n`;
  currentNoteData.timeline.forEach(t => {
    md += `### [${t.time}] ${t.tag}\n${t.text || t.caption}\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentNoteData.title.toLowerCase().replace(/\s+/g, '_')}_notes.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded Markdown (.md) note! 📝');
}

function copyNotesToClipboard() {
  if (!currentNoteData) return;
  const text = `${currentNoteData.title} Notes\nSummary: ${currentNoteData.summary}\nKey Concepts: ${currentNoteData.concepts.join(', ')}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied formatted notes to clipboard! 📋');
  }).catch(() => {
    showToast('Notes copied! 📋');
  });
}

// Export to Notion Button
const btnNotion = document.getElementById('btn-notion');
if (btnNotion) {
  btnNotion.addEventListener('click', () => {
    btnNotion.disabled = true;
    btnNotion.innerHTML = `
      <svg class="spin-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Syncing to Notion...</span>
    `;

    setTimeout(() => {
      btnNotion.disabled = false;
      btnNotion.innerHTML = `
        <svg class="notion-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L18.423 2.3c-.56-.42-1.306-.7-2.333-.607L3.992 2.808c-.466.046-.56.28-.373.466l.84 1.026v-.092zm.98 3.593v13.064c0 .84.42 1.12 1.306 1.026l14.195-.84c.886-.046 1.073-.653 1.073-1.306V6.68c0-.653-.28-.933-.933-.886L5.859 6.755c-.28.046-.42.373-.42 1.046zm12.98.746c.093.42 0 .84-.42.887l-.746.14v9.845c-.466.28-.98.42-1.446.42-.746 0-1.12-.28-1.586-.887l-4.713-7.373v7.373l1.4.28c.093.42 0 .84-.42.887l-3.36.186c-.093-.42 0-.84.42-.887l.84-.187V9.08L9.293 8.94c-.093-.42 0-.84.42-.887l3.547-.233 4.807 7.42V9.08l-.84-.14c-.093-.42 0-.84.42-.887l3.78-.28z" fill="currentColor"/>
        </svg>
        <span>Exported to Notion ✓</span>
      `;
      showToast('Exported seamlessly to your Notion Workspace! 🚀');
    }, 1200);
  });
}

// Setup real audio player playback
function setupAudioPlayerPlayback(url) {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.src = '';
    activeAudioElement = null;
  }
  if (!url) return;

  activeAudioElement = new Audio(url);
  activeAudioElement.addEventListener('ended', () => {
    isAudioPlaying = false;
    if (audioPlayerCard) audioPlayerCard.classList.remove('playing');
    if (btnAudioPlay) {
      btnAudioPlay.querySelector('.audio-play-icon').classList.remove('hidden');
      btnAudioPlay.querySelector('.audio-pause-icon').classList.add('hidden');
    }
  });

  activeAudioElement.addEventListener('pause', () => {
    isAudioPlaying = false;
    if (audioPlayerCard) audioPlayerCard.classList.remove('playing');
    if (btnAudioPlay) {
      btnAudioPlay.querySelector('.audio-play-icon').classList.remove('hidden');
      btnAudioPlay.querySelector('.audio-pause-icon').classList.add('hidden');
    }
  });

  activeAudioElement.addEventListener('play', () => {
    isAudioPlaying = true;
    if (audioPlayerCard) audioPlayerCard.classList.add('playing');
    if (btnAudioPlay) {
      btnAudioPlay.querySelector('.audio-play-icon').classList.add('hidden');
      btnAudioPlay.querySelector('.audio-pause-icon').classList.remove('hidden');
    }
  });
}

// Audio Player toggle
const btnAudioPlay = document.getElementById('btn-audio-play');
const audioPlayerCard = document.getElementById('audio-player-card');
let isAudioPlaying = false;

function simulateAudioToggle() {
  isAudioPlaying = !isAudioPlaying;
  if (isAudioPlaying) {
    if (audioPlayerCard) audioPlayerCard.classList.add('playing');
    if (btnAudioPlay) {
      btnAudioPlay.querySelector('.audio-play-icon').classList.add('hidden');
      btnAudioPlay.querySelector('.audio-pause-icon').classList.remove('hidden');
    }
    showToast('Playing synchronized lecture audio 🎧');
  } else {
    if (audioPlayerCard) audioPlayerCard.classList.remove('playing');
    if (btnAudioPlay) {
      btnAudioPlay.querySelector('.audio-play-icon').classList.remove('hidden');
      btnAudioPlay.querySelector('.audio-pause-icon').classList.add('hidden');
    }
  }
}

if (btnAudioPlay && audioPlayerCard) {
  btnAudioPlay.addEventListener('click', () => {
    if (activeAudioElement) {
      if (activeAudioElement.paused) {
        activeAudioElement.play().catch(e => {
          console.warn('Audio play error:', e);
          simulateAudioToggle();
        });
      } else {
        activeAudioElement.pause();
      }
    } else {
      simulateAudioToggle();
    }
  });
}

// Start a New Session button
const btnNewSession = document.getElementById('btn-new-session');
if (btnNewSession) {
  btnNewSession.addEventListener('click', () => {
    elapsedSeconds = 0;
    isRecording = false;
    isPaused = false;
    uploadedFiles = [];
    if (timerEl) timerEl.textContent = '00:00:00';
    if (timerPulse) timerPulse.classList.remove('active');
    if (liveDot) liveDot.classList.remove('active');

    if (idleControls) idleControls.classList.remove('hidden');
    if (activeControls) activeControls.classList.add('hidden');
    if (reviewControls) reviewControls.classList.add('hidden');

    if (recordHeading) recordHeading.textContent = 'Ready for class?';
    if (recordSubtext) recordSubtext.textContent = 'Tap Start when your professor begins speaking.';

    if (uploadsStrip) {
      uploadsStrip.innerHTML = '';
      uploadsStrip.classList.add('hidden');
    }

    setMascotState('idle');
    showScreen('record');
    showToast('Ready for new lecture! 📝');
  });
}


// ==========================================================================
// 5. HISTORY & SAVED SESSIONS SCREEN
// ==========================================================================
const mockHistoryData = [
  {
    id: 1,
    title: 'Data Engineering',
    date: 'Wed, Oct 06 &middot; 42 min',
    preview: 'Lifecycle overview: collection, ingestion, storage layers, and batch vs streaming transformations.',
    favorite: true
  },
  {
    id: 2,
    title: 'Deep Learning & Transformers',
    date: 'Mon, Oct 04 &middot; 58 min',
    preview: 'Self-attention mechanism, multi-head projections, positional encoding, and KV-cache optimizations.',
    favorite: true
  },
  {
    id: 3,
    title: 'Distributed Systems',
    date: 'Fri, Oct 01 &middot; 35 min',
    preview: 'Consensus algorithms: Raft leader election, log replication, and Byzantine fault tolerances.',
    favorite: false
  },
  {
    id: 4,
    title: 'Database Normalization',
    date: 'Wed, Sep 29 &middot; 50 min',
    preview: 'Relational algebra: 1NF through BCNF, functional dependencies, lossless-join decomposition.',
    favorite: false
  }
];

let activeHistoryFilter = 'all';
const historyList = document.getElementById('history-list');
const filterTabs = document.querySelectorAll('.filter-tab');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const deleteCountBadge = document.getElementById('delete-count-badge');
const trashBadgeCount = document.getElementById('trash-badge-count');
const deleteModal = document.getElementById('delete-modal');
const deleteModalDesc = document.getElementById('delete-modal-desc');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
// State tracking for selection and trash bin
let selectedNotesSet = new Set();
let deletedNotesList = [
  {
    id: 99,
    title: 'Operating Systems & Concurrency',
    date: 'Mon, Sep 20 &middot; 42 min',
    preview: 'Semaphores, mutex locks, deadlock avoidance (Banker’s algorithm), and virtual memory paging.',
    favorite: false
  }
];

function updateDeleteToolbar() {
  if (!btnDeleteSelected || !deleteCountBadge) return;
  const count = selectedNotesSet.size;
  if (count > 0 && activeHistoryFilter !== 'trash') {
    btnDeleteSelected.classList.remove('hidden');
    deleteCountBadge.textContent = count;
  } else {
    btnDeleteSelected.classList.add('hidden');
  }

  // Update trash count badge
  if (trashBadgeCount) {
    if (deletedNotesList.length > 0) {
      trashBadgeCount.textContent = deletedNotesList.length;
      trashBadgeCount.classList.remove('hidden');
    } else {
      trashBadgeCount.classList.add('hidden');
    }
  }
}

function renderHistory() {
  if (!historyList) return;
  updateDeleteToolbar();

  // If viewing the Bin / Trash tab
  if (activeHistoryFilter === 'trash') {
    if (deletedNotesList.length === 0) {
      historyList.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:110px 20px 60px 20px;min-height:300px;">
          <div style="font-weight:700;font-size:1.15rem;color:var(--ink-heading);margin-bottom:6px;">Bin is empty</div>
          <div style="font-size:0.86rem;color:var(--ink-muted);max-width:240px;line-height:1.45;">Deleted notes will appear here to restore anytime.</div>
        </div>
      `;
      return;
    }

    historyList.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:0 4px;">
        <span style="font-size:0.82rem;font-weight:700;color:var(--ink-muted);">${deletedNotesList.length} deleted note(s) in Bin</span>
        <button id="btn-empty-bin" style="background:none;border:none;color:#E5484D;font-size:0.8rem;font-weight:700;cursor:pointer;padding:4px 8px;">Empty Bin</button>
      </div>
    ` + deletedNotesList.map(item => `
      <div class="history-card in-bin" data-id="${item.id}">
        <div class="history-card-body">
          <div class="history-card-top">
            <span class="hc-title">${item.title}</span>
            <span class="bin-item-tag">Deleted</span>
          </div>
          <div class="hc-meta">${item.date}</div>
          <div class="hc-preview">${item.preview}</div>
        </div>
        <div class="bin-actions">
          <button class="btn-restore-note" data-id="${item.id}" title="Restore this note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Restore</span>
          </button>
          <button class="btn-perm-delete-note" data-id="${item.id}" title="Delete permanently">&times;</button>
        </div>
      </div>
    `).join('');

    // Restore button handlers
    historyList.querySelectorAll('.btn-restore-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const idx = deletedNotesList.findIndex(n => n.id === id);
        if (idx !== -1) {
          const restored = deletedNotesList.splice(idx, 1)[0];
          mockHistoryData.unshift(restored);
          renderHistory();
          showToast(`Restored "${restored.title}" 🔄`);
        }
      });
    });

    // Permanent delete handlers
    historyList.querySelectorAll('.btn-perm-delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        deletedNotesList = deletedNotesList.filter(n => n.id !== id);
        renderHistory();
        showToast('Permanently deleted note 🗑️');
      });
    });

    const btnEmptyBin = document.getElementById('btn-empty-bin');
    if (btnEmptyBin) {
      btnEmptyBin.addEventListener('click', () => {
        if (confirm('Permanently empty all notes from Bin? This cannot be undone.')) {
          deletedNotesList = [];
          renderHistory();
          showToast('Bin emptied permanently 🗑️');
        }
      });
    }
    return;
  }

  // Active notes view (All / Favorites)
  let filtered = [...mockHistoryData];
  if (activeHistoryFilter === 'favorites') {
    filtered = filtered.filter(item => item.favorite);
  }

  if (filtered.length === 0) {
    historyList.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--ink-muted);">No sessions match this filter.</div>`;
    return;
  }

  historyList.innerHTML = filtered.map(item => {
    const isSelected = selectedNotesSet.has(item.id);
    return `
      <div class="history-card ${isSelected ? 'is-selected' : ''}" data-id="${item.id}">
        <div class="history-card-body">
          <div class="history-card-top">
            <span class="hc-title">${item.title}</span>
            <div class="hc-badges">
              ${item.favorite ? `<span title="Saved"><svg class="card-heart-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>` : ''}
            </div>
          </div>
          <div class="hc-meta">${item.date}</div>
          <div class="hc-preview">${item.preview}</div>
        </div>
        <button class="select-note-btn ${isSelected ? 'checked' : ''}" data-id="${item.id}" aria-label="Select note" title="Select note">
          <span class="select-circle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </button>
      </div>
    `;
  }).join('');

  // Selection toggle handlers
  historyList.querySelectorAll('.select-note-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (selectedNotesSet.has(id)) {
        selectedNotesSet.delete(id);
      } else {
        selectedNotesSet.add(id);
      }
      renderHistory();
    });
  });

  // Card click to open / view notes
  historyList.querySelectorAll('.history-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.getAttribute('data-id'), 10);
      const title = card.querySelector('.hc-title').textContent;
      if (activeCourseName) activeCourseName.textContent = title;
      const notesTitle = document.getElementById('notes-lecture-title');
      if (notesTitle) notesTitle.textContent = title;
      renderNotes();
      showScreen('notes');
      showToast(`Loaded notes for ${title} 📖`);
    });
  });
}

// Delete Confirmation Modal Actions
if (btnDeleteSelected) {
  btnDeleteSelected.addEventListener('click', () => {
    if (selectedNotesSet.size === 0) return;
    const count = selectedNotesSet.size;
    if (deleteModalDesc) {
      deleteModalDesc.textContent = `Are you sure you want to delete ${count} selected note${count > 1 ? 's' : ''}? You can restore them anytime from your Bin.`;
    }
    if (deleteModal) deleteModal.classList.remove('hidden');
  });
}

if (btnCancelDelete && deleteModal) {
  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
}

if (btnConfirmDelete && deleteModal) {
  btnConfirmDelete.addEventListener('click', () => {
    const count = selectedNotesSet.size;
    // Move selected notes to deletedNotesList
    const toDelete = mockHistoryData.filter(item => selectedNotesSet.has(item.id));
    deletedNotesList = [...toDelete, ...deletedNotesList];
    mockHistoryData = mockHistoryData.filter(item => !selectedNotesSet.has(item.id));

    selectedNotesSet.clear();
    deleteModal.classList.add('hidden');
    renderHistory();
    showToast(`Deleted ${count} note${count > 1 ? 's' : ''} &middot; Moved to Bin 🗑️`);
  });
}

// Close delete modal on backdrop click
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
    }
  });
}

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeHistoryFilter = tab.getAttribute('data-filter');
    renderHistory();
  });
});


// ==========================================================================
// 6. BOTTOM NAVIGATION ROUTING
// ==========================================================================
Object.keys(navItems).forEach(key => {
  const item = navItems[key];
  if (item) {
    item.addEventListener('click', () => {
      if (key === 'history') {
        renderHistory();
      }
      if (key === 'notes' && !currentNoteData) {
        renderNotes();
      }
      showScreen(key);
    });
  }
});


// ==========================================================================
// 7. TOAST NOTIFICATION UTILITY
// ==========================================================================
let toastTimer = null;
function showToast(message, icon = '✨') {
  const toast = document.getElementById('app-toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2400);
}

// Initialize
setMascotState('idle');
renderHistory();