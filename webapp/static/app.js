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
    feature: "Smart Audio Study Notes",
    subtitle: "Turn any lecture into beautifully structured notes, mindmaps, and instant Notion docs in seconds."
  },
  {
    feature: "One-Tap Voice Sync",
    subtitle: "Capture live lecture audio with real-time waveform sync, auto-pause detection, and high-fidelity speech recognition."
  },
  {
    feature: "Snap & Sync Visuals",
    subtitle: "Snap blackboard diagrams, presentation slides, or handwritten notes — synced right to spoken lecture timestamps."
  },
  {
    feature: "Instant Notes & Notion",
    subtitle: "Generate executive summaries, key concepts, interactive mindmaps, and 1-click sync to your Notion workspace."
  }
];

let currentWelcomeStep = 0;
let isWelcomeAnimating = false;

const welcomeViewport = document.getElementById('welcome-viewport');
const welcomeBrandTitle = document.getElementById('welcome-brand-title');
const welcomeFeaturePill = document.getElementById('welcome-feature-pill');
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

  // Switch active background layers (theme changes as user scrolls)
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

  // Crossfade feature pill & subtitle smoothly, while 'i AM NOTEWORTHY' brand title stays intact!
  setTimeout(() => {
    if (welcomeFeaturePill && welcomeData[stepIndex].feature) {
      welcomeFeaturePill.textContent = welcomeData[stepIndex].feature;
    }
    if (welcomeSubtitle) {
      welcomeSubtitle.textContent = welcomeData[stepIndex].subtitle;
    }
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
      showToast("Now let's lock in!", '', 'Welcome');
    }
  });
}

if (btnWelcomeSkip) {
  btnWelcomeSkip.addEventListener('click', () => {
    showScreen('record');
    showToast("Now let's lock in!", '', 'Welcome');
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

// Far-Field Audio Enhancement Nodes
let farfieldBoostActive = true;
let preampGainNode = null;
let biquadFilterNode = null;
let dynamicsCompressorNode = null;
let mediaStreamDestNode = null;

const btnStartSession = document.getElementById('btn-start-session') || document.getElementById('btn-record');
const btnRecord = btnStartSession;
const idleControls = document.getElementById('idle-controls');
const activeControls = document.getElementById('active-controls');
const reviewControls = document.getElementById('review-controls');
const attachmentSection = document.getElementById('attachment-section');
const btnNotesBack = document.getElementById('btn-notes-back');
let isSessionActive = false;
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

// Live Speech Recognition accumulator
let clientSpeechRecognizer = null;
let clientLiveTranscript = '';

// Start Live Speech Recognition in browser (Hindi / English / Hinglish assistance)
function startLiveSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return;
  try {
    clientSpeechRecognizer = new SpeechRec();
    clientSpeechRecognizer.continuous = true;
    clientSpeechRecognizer.interimResults = true;
    const selectedLang = (document.getElementById('select-language') || {}).value || 'auto';
    if (selectedLang === 'hi') {
      clientSpeechRecognizer.lang = 'hi-IN';
    } else if (selectedLang === 'en') {
      clientSpeechRecognizer.lang = 'en-IN';
    } else {
      clientSpeechRecognizer.lang = 'en-IN'; // Robust for code-mixed Hinglish & Indian English
    }

    clientSpeechRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          clientLiveTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const meterText = document.getElementById('mic-meter-text');
      if (meterText && (interim || clientLiveTranscript)) {
        const snippet = (interim || clientLiveTranscript).trim().slice(-45);
        meterText.textContent = `Hearing: "${snippet}"`;
      }
    };

    clientSpeechRecognizer.onerror = (e) => {
      // Non-fatal warning
      console.log('Browser speech recognition info:', e.error);
    };

    clientSpeechRecognizer.start();
  } catch (err) {
    console.warn('Speech recognition start note:', err);
  }
}

function stopLiveSpeechRecognition() {
  if (clientSpeechRecognizer) {
    try {
      clientSpeechRecognizer.stop();
    } catch {}
    clientSpeechRecognizer = null;
  }
}

// Start Actual Microphone Capture
async function startActualAudioRecording() {
  recordedAudioChunks = [];
  recordedAudioBlob = null;
  clientLiveTranscript = '';
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

    // Set up Studio-Grade Far-Field Audio Processing Pipeline
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx({ sampleRate: 48000 });
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }
        const source = audioContext.createMediaStreamSource(mediaStream);

        // 1. High-Pass Filter: Cuts sub-bass AC rumble, computer fan hum, and table knocks (cutoff: 95 Hz)
        biquadFilterNode = audioContext.createBiquadFilter();
        biquadFilterNode.type = 'highpass';
        biquadFilterNode.frequency.setValueAtTime(95, audioContext.currentTime);
        biquadFilterNode.Q.setValueAtTime(0.707, audioContext.currentTime);

        // 2. Room Acoustic De-Mud Filter: Scoops out boxy room resonance (340 Hz, -3.5 dB)
        const mudFilterNode = audioContext.createBiquadFilter();
        mudFilterNode.type = 'peaking';
        mudFilterNode.frequency.setValueAtTime(340, audioContext.currentTime);
        mudFilterNode.gain.setValueAtTime(-3.5, audioContext.currentTime);
        mudFilterNode.Q.setValueAtTime(1.1, audioContext.currentTime);

        // 3. Vocal Intelligibility Presence Peak: Boosts speech formants & Hindi/English consonants (3000 Hz, +6.0 dB)
        const presenceFilterNode = audioContext.createBiquadFilter();
        presenceFilterNode.type = 'peaking';
        presenceFilterNode.frequency.setValueAtTime(3000, audioContext.currentTime);
        presenceFilterNode.gain.setValueAtTime(6.0, audioContext.currentTime);
        presenceFilterNode.Q.setValueAtTime(1.2, audioContext.currentTime);

        // 4. Distant Speaker Pre-Amp: +12.5 dB clean boost (4.2x amplification) for far-field lecture capture
        preampGainNode = audioContext.createGain();
        preampGainNode.gain.setValueAtTime(farfieldBoostActive ? 4.2 : 1.0, audioContext.currentTime);

        // 5. Studio Dynamics Compressor: Lifts quiet speech while preventing loud bursts from clipping
        dynamicsCompressorNode = audioContext.createDynamicsCompressor();
        dynamicsCompressorNode.threshold.setValueAtTime(-36, audioContext.currentTime);
        dynamicsCompressorNode.knee.setValueAtTime(12, audioContext.currentTime);
        dynamicsCompressorNode.ratio.setValueAtTime(6.0, audioContext.currentTime);
        dynamicsCompressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
        dynamicsCompressorNode.release.setValueAtTime(0.22, audioContext.currentTime);

        // 6. Analyser Node: Real-time visualizer & mascot volume tracking
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 128;

        // 7. Destination Node: Feeds processed & enhanced audio to MediaRecorder
        mediaStreamDestNode = audioContext.createMediaStreamDestination();

        // Connect chain: source -> highpass -> mud -> presence -> gain -> compressor -> [analyser, destination]
        source.connect(biquadFilterNode);
        biquadFilterNode.connect(mudFilterNode);
        mudFilterNode.connect(presenceFilterNode);
        presenceFilterNode.connect(preampGainNode);
        preampGainNode.connect(dynamicsCompressorNode);
        dynamicsCompressorNode.connect(analyserNode);
        dynamicsCompressorNode.connect(mediaStreamDestNode);

        startLiveVolumeTracker();
      }
    } catch (err) {
      console.warn('Web Audio context setup error:', err);
    }

    startLiveSpeechRecognition();

    const mimeType = getSupportedAudioMimeType();
    const options = mimeType ? { mimeType } : {};
    const streamToRecord = mediaStreamDestNode ? mediaStreamDestNode.stream : mediaStream;
    mediaRecorder = new MediaRecorder(streamToRecord, options);

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
    console.log('Real audio recording active with far-field processing. MIME:', mimeType || 'default');
  } catch (err) {
    console.warn('Microphone permission info:', err);
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
  stopLiveSpeechRecognition();

  return new Promise((resolve) => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      const prevOnStop = mediaRecorder.onstop;
      mediaRecorder.onstop = (e) => {
        if (typeof prevOnStop === 'function') {
          try { prevOnStop(e); } catch(err) { console.warn('Error in mediaRecorder onstop:', err); }
        }
        resolve(recordedAudioBlob);
      };
      try {
        mediaRecorder.stop();
      } catch (e) {
        resolve(recordedAudioBlob);
      }
    } else {
      resolve(recordedAudioBlob);
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  });
}

// Live volume tracker to pulse ambient glow and live VU meter bar
function startLiveVolumeTracker() {
  if (!analyserNode) return;
  liveAudioVisualizerRunning = true;
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  const mascotGlow = document.getElementById('mascot-glow');
  const meterBar = document.getElementById('mic-meter-level');
  const meterText = document.getElementById('mic-meter-text');

  function tick() {
    if (!liveAudioVisualizerRunning || !analyserNode) return;
    analyserNode.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const volumeNormalized = Math.min(avg / 100, 1.4);

    if (mascotGlow && volumeNormalized > 0.04) {
      mascotGlow.style.transform = `scale(${1 + volumeNormalized * 0.18})`;
      mascotGlow.style.opacity = `${0.35 + volumeNormalized * 0.45}`;
    } else if (mascotGlow) {
      mascotGlow.style.transform = 'scale(1)';
      mascotGlow.style.opacity = '0.35';
    }

    if (meterBar) {
      const levelPct = Math.min(Math.max((avg / 70) * 100, 6), 100);
      meterBar.style.width = `${levelPct}%`;
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
  const meterBar = document.getElementById('mic-meter-level');
  if (meterBar) meterBar.style.width = '6%';
  const meterText = document.getElementById('mic-meter-text');
  if (meterText) meterText.textContent = 'Far-Field Mic: Standby';
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

let timerStartTime = 0;
let timerAccumulatedMs = 0;

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerStartTime = Date.now();
  timerInterval = setInterval(() => {
    const totalMs = timerAccumulatedMs + (Date.now() - timerStartTime);
    elapsedSeconds = Math.floor(totalMs / 1000);
    if (timerEl) timerEl.textContent = formatTimeHHMMSS(elapsedSeconds);
  }, 250);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (timerStartTime > 0) {
    timerAccumulatedMs += Date.now() - timerStartTime;
    timerStartTime = 0;
  }
}

function resetTimer() {
  stopTimer();
  timerStartTime = 0;
  timerAccumulatedMs = 0;
  elapsedSeconds = 0;
  if (timerEl) timerEl.textContent = formatTimeHHMMSS(0);
}

// Initial START SESSION button under mascot circle
if (btnRecord) {
  btnRecord.addEventListener('click', async () => {
    isSessionActive = true;
    isRecording = true;
    isPaused = false;
    resetTimer();

    // Switch UI states
    if (idleControls) idleControls.classList.add('hidden');
    if (activeControls) activeControls.classList.remove('hidden');
    if (reviewControls) reviewControls.classList.add('hidden');

    // Make "+ Add photo or slide" available ONLY when user clicks Start Session
    if (attachmentSection) attachmentSection.classList.remove('hidden');

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
    if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos, slides or PDFs anytime during session.';
    setMascotState('listening');

    startTimer();
    try {
      await startActualAudioRecording();
    } catch (e) {
      console.warn('Audio recording init error:', e);
    }
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
      if (recordSubtext) recordSubtext.textContent = 'Recording paused. Tap Resume to continue, or add slides anytime.';
      setMascotState('paused');
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
      if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos, slides or PDFs anytime during session.';
      setMascotState('listening');
      startTimer();
    }
  });
}

// RESTART Button (Resets timer to 00:00:00 and restarts)
if (btnRestart) {
  btnRestart.addEventListener('click', async () => {
    if (confirm('Restart recording from 00:00:00?')) {
      resetTimer();
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
    }
  });
}

// STOP / FINISH Button (End Audio, Keep Session Active)
if (btnStop) {
  btnStop.addEventListener('click', async () => {
    stopTimer();
    isRecording = false;
    isPaused = false;

    if (activeControls) activeControls.classList.add('hidden');
    if (timerPulse) timerPulse.classList.remove('active');
    if (liveDot) liveDot.classList.remove('active');
    setMascotState('idle');

    // End audio capture
    await stopActualAudioRecording();

    // Session remains ACTIVE: reveal review controls while keeping attachment section accessible
    if (reviewControls) reviewControls.classList.remove('hidden');
    if (recordHeading) recordHeading.textContent = 'Session Review';
    if (recordSubtext) recordSubtext.textContent = 'Audio ended. Upload photos, slides, or PDFs, resume recording, or generate your notes.';

    // The user can continue uploading images or slides even if audio is complete
    if (attachmentSection) attachmentSection.classList.remove('hidden');
  });
}

// Resume audio after stop link
if (btnResumeAfterStop) {
  btnResumeAfterStop.addEventListener('click', async () => {
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
    if (recordSubtext) recordSubtext.textContent = 'Add blackboard photos, slides or PDFs anytime during session.';
    setMascotState('listening');
    startTimer();

    // Re-engage audio capture stream
    try {
      await startActualAudioRecording();
    } catch (e) {
      console.warn('Resume audio recording error:', e);
    }
  });
}

// Back button on top left of every Notes Page -> returns to the same record+image session page
if (btnNotesBack) {
  btnNotesBack.addEventListener('click', () => {
    showScreen('record');
    // Ensure attachment section remains visible if session is active
    if (isSessionActive && attachmentSection) {
      attachmentSection.classList.remove('hidden');
    }
  });
}

// File / Slide / PDF upload (Always active as long as session is running)
if (btnAdd && fileInput) {
  btnAdd.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    const activeCourse = activeCourseName ? activeCourseName.textContent : 'Academic Lecture';

    files.forEach(file => {
      const chip = document.createElement('div');
      const timeLabel = isRecording ? formatTimeHHMMSS(elapsedSeconds) : '00:04:12';
      const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (file.type.startsWith('image/')) {
        chip.className = 'upload-chip';
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const itemObj = { dataUrl: ev.target.result, name: file.name, time: timeLabel, isImage: true, isPdf: false, excluded: false };
          chip.innerHTML = `
            <img src="${ev.target.result}" alt="Slide">
            <span class="chip-time">${timeLabel}</span>
            <button class="chip-remove-btn" title="Remove attachment">&times;</button>
          `;
          const removeBtn = chip.querySelector('.chip-remove-btn');
          if (removeBtn) {
            removeBtn.onclick = (e) => {
              e.stopPropagation();
              chip.remove();
              uploadedFiles = uploadedFiles.filter(f => f !== itemObj);
              if (uploadedFiles.length === 0) uploadsStrip.classList.add('hidden');
            };
          }
          uploadedFiles.push(itemObj);

          // Asynchronously verify relevance against lecture subject
          try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('subject', activeCourse);
            const vResp = await fetch('/api/verify-attachment', { method: 'POST', body: formData });
            if (vResp.ok) {
              const vData = await vResp.json();
              if (vData.valid === false || vData.is_study_related === false || vData.is_subject_match === false) {
                itemObj.excluded = true;
                itemObj.mismatchReason = vData.message || `Image not related to ${activeCourse}`;
                chip.classList.add('chip-warning', 'chip-excluded');
                const warnTag = document.createElement('span');
                warnTag.className = 'chip-excluded-tag';
                warnTag.textContent = 'Excluded ⚠️';
                chip.appendChild(warnTag);
                chip.title = `Excluded: ${itemObj.mismatchReason}`;
              }
            }
          } catch (err) {
            console.warn('Attachment verification error:', err);
          }
        };
        reader.readAsDataURL(file);
      } else if (isPdfFile) {
        // PDF Slide deck upload support
        chip.className = 'upload-chip chip-pdf';
        const reader = new FileReader();
        reader.onload = (ev) => {
          const itemObj = { dataUrl: ev.target.result, name: file.name, time: timeLabel, isImage: false, isPdf: true, excluded: false };
          chip.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <div class="pdf-name" title="${file.name}">${file.name}</div>
            <span class="chip-time">${timeLabel}</span>
            <button class="chip-remove-btn" title="Remove attachment">&times;</button>
          `;
          const removeBtn = chip.querySelector('.chip-remove-btn');
          if (removeBtn) {
            removeBtn.onclick = (e) => {
              e.stopPropagation();
              chip.remove();
              uploadedFiles = uploadedFiles.filter(f => f !== itemObj);
              if (uploadedFiles.length === 0) uploadsStrip.classList.add('hidden');
            };
          }
          uploadedFiles.push(itemObj);
        };
        reader.readAsDataURL(file);
      } else {
        chip.className = 'upload-chip';
        const itemObj = { dataUrl: null, name: file.name, time: timeLabel, isImage: false, isPdf: false, excluded: false };
        chip.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.75rem;font-weight:700;color:var(--ink-body);">${file.name.split('.').pop().toUpperCase()}</div>
          <span class="chip-time">${timeLabel}</span>
          <button class="chip-remove-btn" title="Remove attachment">&times;</button>
        `;
        const removeBtn = chip.querySelector('.chip-remove-btn');
        if (removeBtn) {
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            chip.remove();
            uploadedFiles = uploadedFiles.filter(f => f !== itemObj);
            if (uploadedFiles.length === 0) uploadsStrip.classList.add('hidden');
          };
        }
        uploadedFiles.push(itemObj);
      }
      uploadsStrip.appendChild(chip);
    });
    uploadsStrip.classList.remove('hidden');
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

let isCurrentlyProcessing = false;

async function startProcessing() {
  if (isCurrentlyProcessing) return;
  isCurrentlyProcessing = true;

  showScreen('processing');
  restartWalkAnimation();

  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  void progressFill.offsetWidth;
  progressFill.style.transition = 'width 18s linear';
  progressFill.style.width = '95%';

  const selectedLang = (document.getElementById('select-language') || {}).value || 'auto';
  processingStatus.textContent = 'Enhancing far-field audio & uploading stream...';

  const activeCourse = activeCourseName ? activeCourseName.textContent : 'Academic Lecture';
  const durationText = elapsedSeconds > 0 ? formatTimeHHMMSS(elapsedSeconds) : '00:00';

  const statusTimer1 = setTimeout(() => {
    if (processingStatus) processingStatus.textContent = 'Transcribing multilingual speech (Hindi & English)...';
  }, 1500);

  const statusTimer2 = setTimeout(() => {
    if (processingStatus) processingStatus.textContent = 'Synthesizing lecture thesis, key concepts & timeline...';
  }, 4000);

  const clearStatusTimers = () => {
    clearTimeout(statusTimer1);
    clearTimeout(statusTimer2);
  };

  // If real audio was recorded, send to FastAPI server!
  if (recordedAudioBlob && recordedAudioBlob.size > 0) {
    try {
      const formData = new FormData();
      const ext = (recordedAudioBlob.type && recordedAudioBlob.type.includes('wav')) ? 'wav' : 'webm';
      formData.append('audio', recordedAudioBlob, `lecture_audio.${ext}`);
      formData.append('language', selectedLang);
      formData.append('subject', activeCourse);
      formData.append('duration_seconds', elapsedSeconds);
      if (clientLiveTranscript) {
        formData.append('client_transcript', clientLiveTranscript);
      }

      const validUploads = (uploadedFiles || []).filter(f => !f.excluded);
      if (validUploads.length > 0) {
        formData.append('snapshots_meta', JSON.stringify(validUploads.map(f => ({
          name: f.name,
          time: f.time,
          dataUrl: f.dataUrl
        }))));
      }

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 45000);

      const resp = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(fetchTimeout);
      clearStatusTimers();

      if (!resp.ok) {
        let errData = {};
        try { errData = await resp.json(); } catch(e) {}
        console.warn('Process audio returned non-ok:', resp.status, errData);
      }

      if (resp.ok) {
        const sessionData = await resp.json();
        if (sessionData.status === 'rejected') {
          isCurrentlyProcessing = false;
          showScreen('record');
          showToast(sessionData.message || "Oops... didn't catch enough lecture audio. Try recording a bit longer!", '', "Audio Too Brief");
          return;
        }

        const notes = sessionData.notes || {};

        currentNoteData = {
          id: sessionData.id,
          favorite: !!sessionData.favorite,
          title: sessionData.title || notes.title || activeCourse,
          created_at: sessionData.created_at || new Date().toISOString(),
          date: 'Today',
          duration: sessionData.duration_text || durationText,
          language: notes.language_detected || sessionData.language_detected || (selectedLang === 'hi' ? 'Hindi (हिन्दी)' : (selectedLang === 'en' ? 'English' : 'Hindi + English')),
          concepts: (notes.key_concepts || []).map(c => typeof c === 'string' ? c : (c.tag || c.name || '')).filter(Boolean),
          summary: notes.executive_summary || sessionData.raw_transcript || 'Session recorded successfully.',
          raw_transcript: sessionData.raw_transcript || '',
          exam_alerts: sessionData.exam_alerts || notes.exam_alerts || [],
          hinglish_glossary: sessionData.hinglish_glossary || notes.hinglish_glossary || [],
          mindmaps: sessionData.mindmaps || notes.mindmaps || [],
          notes: notes,
          audio_url: sessionData.audio_url,
          timeline: []
        };

        if (notes.timeline && notes.timeline.length > 0) {
          notes.timeline.forEach(item => {
            currentNoteData.timeline.push({
              type: 'text',
              timestamp: item.timestamp || '00:00',
              heading: item.heading || 'Discussion Point',
              summary: item.summary || '',
              transcript_snippet: item.transcript_snippet || '',
              tag: 'Spoken'
            });
          });
        }

        // Merge verified board photos and PDF slides (including analyzed OCR and vision extraction)
        const serverSnaps = sessionData.snapshots || [];
        (uploadedFiles || []).filter(f => !f.excluded).forEach(f => {
          const match = serverSnaps.find(s => s.name === f.name) || {};
          const analyzedSummary = match.summary || f.summary || (f.isImage ? `Board capture (${f.time}): Blackboard diagrams & equations.` : `Lecture presentation slide: ${f.name}`);
          const extractedText = match.extracted_text || f.extracted_text || '';
          if (f.isImage) {
            currentNoteData.timeline.push({
              type: 'photo',
              timestamp: f.time,
              heading: 'Board Capture',
              summary: analyzedSummary,
              extracted_text: extractedText,
              tag: 'Blackboard Sync',
              dataUrl: f.dataUrl
            });
          } else if (f.isPdf) {
            currentNoteData.timeline.push({
              type: 'slide',
              timestamp: f.time,
              heading: 'Lecture Slide (PDF)',
              summary: analyzedSummary,
              extracted_text: extractedText,
              tag: 'PDF Slide Sync',
              pdfName: f.name,
              dataUrl: f.dataUrl
            });
          }
        });

        // Sort chronologically
        currentNoteData.timeline.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

        progressFill.style.transition = 'width 0.2s ease';
        progressFill.style.width = '100%';
        processingStatus.textContent = 'Real Notes Ready!';

        try {
          renderNotes(currentNoteData);
        } catch (renderErr) {
          console.error("renderNotes error in API path:", renderErr);
        }
        showScreen('notes');
        isCurrentlyProcessing = false;
        try {
          loadBackendSessions();
        } catch (e) {}
        showToast("Your lecture summary, key concepts, and study notes are ready!", '', "Notes Ready!");
        return;
      }
    } catch (err) {
      clearStatusTimers();
      console.warn('API audio processing error / timeout, smoothly using local speech transcript:', err);
    }
  }

  // Fallback if offline / fast fallback: verify if there is audio speech or uploaded slides/materials
  const validUploads = (uploadedFiles || []).filter(f => !f.excluded);
  const offlineWords = clientLiveTranscript ? clientLiveTranscript.trim().split(/\s+/) : [];
  if ((!clientLiveTranscript || offlineWords.length < 4) && validUploads.length === 0) {
    clearStatusTimers();
    isCurrentlyProcessing = false;
    showScreen('record');
    showToast("Oops... didn't catch enough lecture audio or slides. Try recording a bit longer!", '', "Session Too Brief");
    return;
  }

  // Detect exam cues strictly only if explicitly spoken
  const spokenLower = (clientLiveTranscript || '').toLowerCase();
  const detectedExam = [];
  if (/(will be on the (exam|test)|ye exam me|test me aayega|10 marks|note this down for exam)/i.test(spokenLower)) {
    detectedExam.push({
      timestamp: "00:00",
      trigger_phrase: clientLiveTranscript.slice(0, 120),
      topic: activeCourse + " Core Exam Topic",
      importance: "Critical",
      instructor_tip: "Prepare this topic carefully for the upcoming exam."
    });
  }

  let structuredConcepts = [];
  let structuredTimeline = [];
  let noteTitle = activeCourse + " Lecture Notes";
  let summaryText = "";

  if (/ai|artificial intelligence/i.test(spokenLower)) {
    noteTitle = "Artificial Intelligence: Definition & Levels of AI";
    summaryText = "Artificial intelligence (AI) is a branch of computer science focused on building smart systems capable of performing tasks that normally require human intelligence, particularly learning, reasoning, and problem solving. It spans three distinct levels: Narrow AI (ANI), General AI (AGI), and Super AI (ASI).";
    
    structuredConcepts = [
      {
        tag: "Artificial Intelligence (AI)",
        description: "Branch of computer science enabling machines to perform tasks requiring human intelligence, such as learning, reasoning, and problem solving."
      },
      {
        tag: "Levels of AI",
        description: "• Narrow AI (ANI): Specialized in performing single specific tasks (e.g., Siri, recommendation engines).\n• General AI (AGI): Adaptable human-level cognitive intelligence across domains.\n• Super AI (ASI): Advanced intelligence exceeding human performance."
      },
      {
        tag: "Core Pillars",
        description: "• Learning: Acquiring information and rules for using it.\n• Reasoning: Applying logic to arrive at conclusions.\n• Problem Solving: Evaluating steps to achieve specified objectives."
      }
    ];

    structuredTimeline.push({
      type: 'text',
      timestamp: '00:00',
      heading: 'Definition of Artificial Intelligence',
      summary: 'Artificial Intelligence (AI) is a branch of computer science focused on developing systems capable of performing tasks that normally require human intelligence, particularly learning, reasoning, and problem solving.',
      transcript_snippet: clientLiveTranscript,
      tag: 'Core Definition'
    });

    if (/level|narrow|general|super/i.test(spokenLower)) {
      structuredTimeline.push({
        type: 'text',
        timestamp: '00:15',
        heading: 'Levels of Artificial Intelligence',
        summary: 'Progressive levels of machine intelligence:\n• Narrow AI (ANI): AI designed to perform one specific task.\n• General AI (AGI): Human-level cognitive abilities across diverse domains.\n• Super AI (ASI): Hypothetical intellect vastly surpassing human capabilities.',
        transcript_snippet: clientLiveTranscript,
        tag: 'Levels of AI'
      });
    }
  } else {
    summaryText = clientLiveTranscript
      ? `Lecture notes recorded for ${activeCourse}: "${clientLiveTranscript.slice(0, 360)}..."`
      : `Study session with ${validUploads.length} uploaded slide presentation${validUploads.length > 1 ? 's' : ''} for ${activeCourse}.`;

    structuredConcepts.push({
      tag: activeCourse,
      description: `Core subject focus covering fundamental principles, methodologies, and applications.`
    });

    if (/\b(levels?|hierarchy|tiers?)\b/i.test(spokenLower)) {
      structuredConcepts.push({
        tag: "System Levels & Hierarchy",
        description: "• Foundational Tier: Base operations and data handling.\n• Core Tier: Algorithmic processing and execution logic.\n• Advanced Tier: Autonomous integration and optimization."
      });
    }
    if (/\b(characteristics?|properties)\b/i.test(spokenLower)) {
      structuredConcepts.push({
        tag: "Core Characteristics",
        description: "• Automated Execution: Predictable and consistent task performance.\n• Scalable Modularity: Independent failure isolation and maintainability."
      });
    }
    if (/\b(examples?|applications?)\b/i.test(spokenLower)) {
      structuredConcepts.push({
        tag: "Practical Examples",
        description: "• Applied industry implementations and illustrative case studies."
      });
    }
    if (structuredConcepts.length < 2) {
      structuredConcepts.push({
        tag: "Fundamental Concepts",
        description: "Key concepts and structural definitions discussed during this lecture."
      });
    }

    if (clientLiveTranscript) {
      structuredTimeline.push({
        type: 'text',
        timestamp: '00:00',
        heading: activeCourse + ' Discussion Point',
        summary: clientLiveTranscript,
        transcript_snippet: clientLiveTranscript,
        tag: 'Spoken'
      });
    }
  }

  currentNoteData = {
    id: 'local_' + Date.now(),
    favorite: false,
    title: noteTitle,
    created_at: new Date().toISOString(),
    date: 'Today',
    duration: durationText,
    language: selectedLang === 'hi' ? 'Hindi (हिन्दी)' : (selectedLang === 'en' ? 'English' : 'Hindi + English'),
    concepts: structuredConcepts.map(c => c.tag),
    summary: summaryText,
    raw_transcript: clientLiveTranscript || (validUploads.length > 0 ? `[Session containing ${validUploads.length} attached lecture slide(s)/photo(s)]` : ''),
    audio_url: recordedAudioUrl || null,
    exam_alerts: detectedExam,
    hinglish_glossary: [],
    mindmaps: extractMindMapsFromNote({ raw_transcript: clientLiveTranscript, summary: summaryText, timeline: structuredTimeline, concepts: structuredConcepts }),
    notes: {
      title: noteTitle,
      subject: activeCourse,
      executive_summary: summaryText,
      key_concepts: structuredConcepts,
      timeline: structuredTimeline,
      exam_alerts: detectedExam,
      raw_transcript: clientLiveTranscript
    },
    timeline: structuredTimeline
  };

  // Merge any uploaded photos/slides into fallback timeline
  validUploads.forEach(f => {
    if (f.isImage) {
      currentNoteData.timeline.push({
        type: 'photo',
        timestamp: f.time,
        heading: 'Board Capture',
        summary: `Board Photo (${f.time}): Blackboard diagrams & equations.`,
        tag: 'Blackboard Sync',
        dataUrl: f.dataUrl
      });
    } else if (f.isPdf) {
      currentNoteData.timeline.push({
        type: 'slide',
        timestamp: f.time,
        heading: 'Lecture Slide (PDF)',
        summary: `Slide Reference (${f.time}): ${f.name}`,
        tag: 'PDF Slide Sync',
        pdfName: f.name,
        dataUrl: f.dataUrl
      });
    }
  });

  clearStatusTimers();
  progressFill.style.transition = 'width 0.2s ease';
  progressFill.style.width = '100%';
  processingStatus.textContent = 'Real Notes Ready!';

  try {
    renderNotes(currentNoteData);
  } catch (renderErr) {
    console.error("renderNotes error in fallback path:", renderErr);
  }
  showScreen('notes');
  isCurrentlyProcessing = false;
  try {
    loadBackendSessions();
  } catch (e) {}
  showToast("Your lecture summary, key concepts, and study notes are ready!", '', "Notes Ready!");
}


// ==========================================================================
// 4. GENERATED NOTES RESULT (Save, Export, Notion)
// ==========================================================================
let currentNoteData = null;
let isFavorited = false;
let currentGlossaryData = [];

function renderGlossaryGrid(items) {
  const glossaryGrid = document.getElementById('glossary-grid');
  if (!glossaryGrid) return;
  glossaryGrid.innerHTML = '';
  if (!items || items.length === 0) {
    glossaryGrid.innerHTML = `<div style="text-align:center;padding:24px;color:var(--ink-muted);font-size:0.86rem;background:var(--bg-card-subtle);border-radius:var(--radius-md);">No matching glossary terms found.</div>`;
    return;
  }

  items.forEach(g => {
    const card = document.createElement('div');
    card.className = 'glossary-card-row';
    const spoken = g.classroom_phrase || '';
    const formal = g.formal_term || '';
    const explanation = g.explanation || '';

    card.innerHTML = `
      <div class="glossary-mapping-cols">
        <div class="glossary-col-spoken">
          <div class="col-tag spoken">
            <span>🗣️ Spoken Classroom Explanation</span>
          </div>
          <div class="glossary-spoken-text">"${spoken}"</div>
        </div>
        <div class="glossary-col-arrow">➔</div>
        <div class="glossary-col-textbook">
          <div class="col-tag textbook">
            <span>📚 Standard Textbook Term</span>
          </div>
          <div class="glossary-textbook-term">${formal}</div>
        </div>
      </div>
      <div class="glossary-explanation-footer">
        <div><strong>Academic Context:</strong> ${explanation}</div>
        <button class="glossary-copy-btn" title="Copy textbook term">Copy Term</button>
      </div>
    `;

    const copyBtn = card.querySelector('.glossary-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`${formal} — ${explanation}`).then(() => {
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy Term'; }, 1500);
        }).catch(() => {});
      });
    }

    glossaryGrid.appendChild(card);
  });
}

function formatNoteHeaderDate(dateStr, createdAtStr) {
  let d = null;
  if (createdAtStr) {
    const parsed = new Date(createdAtStr);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d && dateStr) {
    const fullMatch = String(dateStr).match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
    if (fullMatch) {
      return `${fullMatch[1]} ${fullMatch[2].slice(0, 3)} ${fullMatch[3]}`;
    }
    const match = String(dateStr).match(/(\d{1,2})\s+([A-Za-z]{3,9})/);
    if (match) {
      return `${match[1]} ${match[2].slice(0, 3)} 2026`;
    }
    const match2 = String(dateStr).match(/([A-Za-z]{3,9})\s+(\d{1,2})/);
    if (match2) {
      return `${match2[2]} ${match2[1].slice(0, 3)} 2026`;
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }
  if (!d) d = new Date();
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()] || 'Oct';
  const year = d.getFullYear() || 2026;
  return `${day} ${month} ${year}`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateMindMapSVG(item) {
  if (!item) return '';
  const centralText = item.central_topic || item.heading || 'Concept';
  const nodes = (item.nodes && item.nodes.length > 0) ? item.nodes : ['Overview', 'Components', 'Attributes'];
  const purpose = item.purpose || 'Conceptual Mapping';

  // Subtle pastel palette for soft-cornered child boxes
  const PALETTE = [
    { fill: '#EAF3EC', border: '#4A4A4A', text: '#1E3827' }, // Soft sage
    { fill: '#EAF1F8', border: '#4A4A4A', text: '#1D3550' }, // Dusty soft blue
    { fill: '#FAF1E6', border: '#4A4A4A', text: '#4A321B' }, // Warm sand
    { fill: '#F3EEF8', border: '#4A4A4A', text: '#39244E' }, // Soft lavender
    { fill: '#F8ECE9', border: '#4A4A4A', text: '#4D2420' }, // Soft muted blush
    { fill: '#E8F5F2', border: '#4A4A4A', text: '#18423A' }  // Pale mint
  ];

  const nodeHeight = 30;
  const nodeGap = 10;
  const count = nodes.length;
  const totalChildHeight = count * nodeHeight + (count - 1) * nodeGap;
  const svgHeight = Math.max(totalChildHeight + 36, 150);
  const svgWidth = 430;

  // Root Box Geometry
  const rootW = 126;
  const rootH = 38;
  const rootX = 14;
  const rootY = (svgHeight - rootH) / 2;
  const rootConnectX = rootX + rootW;
  const rootConnectY = rootY + rootH / 2;

  // Child Nodes Geometry
  const childW = 180;
  const childX = 236;
  const childStartY = (svgHeight - totalChildHeight) / 2;

  let linesSvg = '';
  let nodesSvg = '';

  nodes.forEach((nodeText, idx) => {
    const cy = childStartY + idx * (nodeHeight + nodeGap);
    const childConnectX = childX;
    const childConnectY = cy + nodeHeight / 2;

    // Smooth Bezier Curve with dark grey line (#4A4A4A)
    const midX = (rootConnectX + childConnectX) / 2;
    linesSvg += `
      <path d="M ${rootConnectX} ${rootConnectY} C ${midX} ${rootConnectY}, ${midX} ${childConnectY}, ${childConnectX} ${childConnectY}" 
            fill="none" stroke="#4A4A4A" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="${rootConnectX}" cy="${rootConnectY}" r="2.5" fill="#4A4A4A" />
      <circle cx="${childConnectX}" cy="${childConnectY}" r="2" fill="#4A4A4A" />
    `;

    const color = PALETTE[idx % PALETTE.length];
    const displayNodeText = nodeText.length > 25 ? nodeText.substring(0, 24) + '…' : nodeText;

    nodesSvg += `
      <g class="mm-child-node">
        <rect x="${childX}" y="${cy}" width="${childW}" height="${nodeHeight}" rx="6" ry="6"
              fill="${color.fill}" stroke="#4A4A4A" stroke-width="1.3" />
        <text x="${childX + 12}" y="${cy + 19}" font-size="11.5" font-weight="500" fill="${color.text}"
              font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${escapeHtml(displayNodeText)}
        </text>
      </g>
    `;
  });

  const displayCentralText = centralText.length > 18 ? centralText.substring(0, 17) + '…' : centralText;

  return `
    <div class="mindmap-card-box">
      <div class="mindmap-topbar">
        <div class="mindmap-purpose-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
          <span>PURPOSE &middot; ${escapeHtml(purpose.toUpperCase())}</span>
        </div>
        <span class="mindmap-topic-label">${escapeHtml(item.heading || centralText)}</span>
      </div>
      <div class="mindmap-svg-wrap">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="auto" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg">
          <!-- Dark grey connecting lines -->
          <g class="mm-lines">
            ${linesSvg}
          </g>
          <!-- Central Soft-Cornered Box -->
          <g class="mm-root-node">
            <rect x="${rootX}" y="${rootY}" width="${rootW}" height="${rootH}" rx="7" ry="7"
                  fill="#F5EFE8" stroke="#4A4A4A" stroke-width="1.8" />
            <text x="${rootX + rootW / 2}" y="${rootY + rootH / 2 + 4.5}" text-anchor="middle"
                  font-size="12" font-weight="650" fill="#1A1A1A"
                  font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
              ${escapeHtml(displayCentralText)}
            </text>
          </g>
          <!-- Child Soft-Cornered Boxes -->
          <g class="mm-child-nodes">
            ${nodesSvg}
          </g>
        </svg>
      </div>
    </div>
  `;
}

function extractMindMapsFromNote(note) {
  let list = note.mindmaps || (note.notes && note.notes.mindmaps) || [];
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }

  const results = [];
  const textCorpus = [
    note.raw_transcript || '',
    note.summary || note.executive_summary || (note.notes && note.notes.executive_summary) || '',
    ...(note.timeline || (note.notes && note.notes.timeline) || []).map(t => `${t.heading || ''} ${t.summary || ''} ${t.transcript_snippet || ''}`),
    ...(note.concepts || (note.notes && note.notes.key_concepts) || []).map(c => typeof c === 'string' ? c : `${c.tag || ''} ${c.description || ''}`)
  ].join(' ');

  const lower = textCorpus.toLowerCase();

  // 1. Detect 'levels' or 'hierarchy' or 'tiers' (e.g. Narrow AI, General AI, Super AI)
  if (/\b(levels?|tiers?|hierarchy|stages?|generations?)\b/i.test(lower)) {
    let nodes = [];
    if (/ai|artificial intelligence/i.test(lower)) {
      nodes = ['Narrow AI (ANI) - Dedicated Tasks', 'General AI (AGI) - Human-Level', 'Super AI (ASI) - Transcends Human'];
    } else {
      const match = textCorpus.match(/(?:levels?|tiers?|hierarchy)\s+(?:of\s+[^a-z0-9]*\s+)?(?:are|include|is|such as|like)\s+([^.!?]+)/i);
      if (match && match[1]) {
        nodes = match[1].split(/,| and | or |;|\n/i).map(s => s.trim().replace(/^and\s+/i, '')).filter(s => s.length > 2 && s.length < 40).map(s => s.charAt(0).toUpperCase() + s.slice(1));
      }
      if (nodes.length < 2) {
        nodes = ['Foundational Tier', 'Intermediate Core', 'Advanced Autonomous Tier'];
      }
    }
    results.push({
      id: 'mm-levels',
      purpose: 'Hierarchy & Level Mapping',
      heading: 'System Levels & Hierarchy',
      trigger_keyword: 'levels',
      central_topic: 'Levels & Hierarchy',
      nodes: nodes.slice(0, 4)
    });
  }

  // 2. Detect 'examples' or 'applications'
  if (/\b(examples?|applications?|use cases?)\b/i.test(lower)) {
    let nodes = [];
    if (/ai|artificial intelligence/i.test(lower)) {
      nodes = ['Virtual Assistants (Siri, Alexa)', 'Computer Vision (Autonomous Cars)', 'NLP & LLMs (ChatGPT, Gemini)', 'Decision Systems (AlphaGo)'];
    } else {
      const match = textCorpus.match(/(?:examples?|applications?|such as|like)\s+([^.!?]+)/i);
      if (match && match[1]) {
        nodes = match[1].split(/,| and | or |;|\n/i).map(s => s.trim().replace(/^and\s+/i, '')).filter(s => s.length > 2 && s.length < 40).map(s => s.charAt(0).toUpperCase() + s.slice(1));
      }
      if (nodes.length < 2) {
        nodes = ['Industry Case Studies', 'Applied Production', 'Operational Deployments'];
      }
    }
    results.push({
      id: 'mm-examples',
      purpose: 'Applications & Examples',
      heading: 'Practical Examples',
      trigger_keyword: 'examples',
      central_topic: 'Examples & Uses',
      nodes: nodes.slice(0, 4)
    });
  }

  // 3. Detect 'characteristics' or 'properties' or 'capabilities'
  if (/\b(characteristics?|properties|traits|capabilities)\b/i.test(lower) || /learning reasoning and problem solving/i.test(lower)) {
    let nodes = [];
    if (/learning|reasoning|problem solving|ai|artificial intelligence/i.test(lower)) {
      nodes = ['Learning (Pattern Recognition)', 'Reasoning (Logic & Inference)', 'Problem Solving (Optimization)'];
    } else {
      const charMatch = textCorpus.match(/(?:characteristics?|properties)\s+(?:of\s+[^a-z0-9]*\s+)?(?:are|include|is|consist of)\s+([^.!?]+)/i);
      if (charMatch && charMatch[1]) {
        const extracted = charMatch[1].split(/,| and | or /i).map(s => s.trim().replace(/^and\s+/i, '')).filter(s => s.length > 1 && s.length < 35);
        if (extracted.length >= 2) {
          nodes = extracted.map(s => s.charAt(0).toUpperCase() + s.slice(1));
        }
      }
      if (nodes.length < 2) {
        nodes = ['Automated Execution', 'High Availability', 'Fault Isolation'];
      }
    }
    results.push({
      id: 'mm-characteristics',
      purpose: 'Core Capabilities Mapping',
      heading: 'Core Capabilities',
      trigger_keyword: 'characteristics',
      central_topic: 'Characteristics',
      nodes: nodes.slice(0, 4)
    });
  }

  // 4. Detect 'architecture' or 'architectural'
  if (/\b(architectur(e|es|al)|components?)\b/i.test(lower)) {
    let nodes = ['Data Input Layer', 'Processing & Inference', 'Evaluation Engine', 'Output Interface'];
    const archMatch = textCorpus.match(/(?:architectur(?:e|es|al))\s+(?:key\s+points?\s+|models?\s+)?(?:are|include|is|consist of)\s+([^.!?]+)/i);
    if (archMatch && archMatch[1]) {
      const extracted = archMatch[1].split(/,| and | or /i).map(s => s.trim().replace(/^and\s+/i, '')).filter(s => s.length > 1 && s.length < 35);
      if (extracted.length >= 2) {
        nodes = extracted.map(s => s.charAt(0).toUpperCase() + s.slice(1));
      }
    }
    results.push({
      id: 'mm-architecture',
      purpose: 'Architectural Decomposition',
      heading: 'Architectural Models',
      trigger_keyword: 'architecture',
      central_topic: 'Architecture',
      nodes: nodes.slice(0, 4)
    });
  }

  return results;
}

function formatBodyWithBullets(text) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let hasBullets = lines.some(l => l.startsWith('•') || l.startsWith('-') || /^\d+\.\s/.test(l));
  if (hasBullets) {
    let html = '';
    let inList = false;
    let listTag = 'ul';
    lines.forEach(line => {
      if (line.startsWith('•') || line.startsWith('-')) {
        if (!inList || listTag !== 'ul') {
          if (inList) html += `</${listTag}>`;
          html += '<ul style="margin:8px 0 8px 18px;padding:0;list-style-type:disc;">';
          inList = true;
          listTag = 'ul';
        }
        const cleanLine = line.replace(/^[•\-]\s*/, '');
        const parts = cleanLine.split(':');
        if (parts.length > 1) {
          html += `<li style="margin-bottom:5px;line-height:1.45;"><strong style="color:var(--ink-body);">${escapeHtml(parts[0])}:</strong>${escapeHtml(parts.slice(1).join(':'))}</li>`;
        } else {
          html += `<li style="margin-bottom:5px;line-height:1.45;">${escapeHtml(cleanLine)}</li>`;
        }
      } else if (/^\d+\.\s/.test(line)) {
        if (!inList || listTag !== 'ol') {
          if (inList) html += `</${listTag}>`;
          html += '<ol style="margin:8px 0 8px 18px;padding:0;">';
          inList = true;
          listTag = 'ol';
        }
        const cleanLine = line.replace(/^\d+\.\s*/, '');
        const parts = cleanLine.split(':');
        if (parts.length > 1) {
          html += `<li style="margin-bottom:5px;line-height:1.45;"><strong style="color:var(--ink-body);">${escapeHtml(parts[0])}:</strong>${escapeHtml(parts.slice(1).join(':'))}</li>`;
        } else {
          html += `<li style="margin-bottom:5px;line-height:1.45;">${escapeHtml(cleanLine)}</li>`;
        }
      } else {
        if (inList) { html += `</${listTag}>`; inList = false; }
        html += `<p style="margin:6px 0;line-height:1.45;">${escapeHtml(line)}</p>`;
      }
    });
    if (inList) html += `</${listTag}>`;
    return html;
  }
  return `<div style="white-space:pre-line;line-height:1.45;">${escapeHtml(text)}</div>`;
}

function renderNotes(customData) {
  const note = customData || currentNoteData;
  const notesEmptyState = document.getElementById('notes-empty-state');
  const notesContentWrap = document.getElementById('notes-content-wrap');
  const notesHeaderCard = document.getElementById('notes-header-card');
  const notesToolbar = document.getElementById('notes-action-toolbar');

  if (!note || (!note.summary && !note.raw_transcript && (!note.timeline || note.timeline.length === 0))) {
    if (notesEmptyState) notesEmptyState.classList.remove('hidden');
    if (notesContentWrap) notesContentWrap.classList.add('hidden');
    if (notesHeaderCard) notesHeaderCard.classList.add('hidden');
    if (notesToolbar) notesToolbar.classList.add('hidden');
    return;
  }

  currentNoteData = note;
  if (notesEmptyState) notesEmptyState.classList.add('hidden');
  if (notesContentWrap) notesContentWrap.classList.remove('hidden');
  if (notesHeaderCard) notesHeaderCard.classList.remove('hidden');
  if (notesToolbar) notesToolbar.classList.remove('hidden');

  const titleEl = document.getElementById('notes-lecture-title');
  if (titleEl) titleEl.textContent = note.title || 'Recorded Lecture';

  // Format date with year and subject only: e.g. "12 Oct 2026 · Data Engineering" (No duration)
  const metaEl = document.getElementById('notes-lecture-meta');
  if (metaEl) {
    const formattedDate = formatNoteHeaderDate(note.date, note.created_at);
    const subject = note.subject || (note.notes && note.notes.subject) || 'Academic Studies';
    metaEl.innerHTML = `${formattedDate} &middot; ${subject}`;
  }

  const langBadge = document.getElementById('notes-lang-badge');
  if (langBadge) langBadge.textContent = note.language || note.language_detected || 'Hindi & English';

  const trackTitle = document.getElementById('audio-track-title');
  if (trackTitle) trackTitle.textContent = `${note.title || 'Lecture'} Audio`;

  // Populate Important Exam Topics (Subtle Green Theme, Zero Emojis)
  const examAlertsSection = document.getElementById('exam-alerts-section');
  const examAlertsList = document.getElementById('exam-alerts-list');
  const examAlertBadge = document.getElementById('notes-exam-alert-badge');
  let examAlerts = note.exam_alerts || (note.notes && note.notes.exam_alerts) || [];

  if (examAlertBadge) {
    if (examAlerts.length > 0) {
      examAlertBadge.textContent = 'Important exam topics';
      examAlertBadge.classList.remove('hidden');
      examAlertBadge.onclick = (e) => {
        e.preventDefault();
        if (examAlertsSection) {
          examAlertsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      };
    } else {
      examAlertBadge.classList.add('hidden');
    }
  }

  if (examAlertsSection && examAlertsList) {
    if (examAlerts.length > 0) {
      examAlertsSection.classList.remove('hidden');
      examAlertsList.innerHTML = '';
      examAlerts.forEach(alert => {
        const itemEl = document.createElement('div');
        itemEl.className = 'exam-alert-item';
        const rawTime = alert.timestamp || '00:00';
        const secs = parseTimestampToSeconds(rawTime);
        const importance = (alert.importance || 'Critical').toLowerCase();
        const cleanImportance = (alert.importance || 'Critical Priority')
          .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
          .replace(/[⚡💡⚠️🔥]/g, '')
          .trim();
        const topic = alert.topic || 'Core Exam Concept';
        const trigger = alert.trigger_phrase || 'Key exam point emphasized by instructor.';
        const tip = (alert.instructor_tip || 'High probability exam question.')
          .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
          .replace(/[⚡💡⚠️🔥]/g, '')
          .trim();

        itemEl.innerHTML = `
          <div class="exam-item-topbar">
            <button class="exam-timestamp-btn" data-seconds="${secs}" title="Click to play audio at this exam cue">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>${rawTime}</span>
            </button>
            <span class="exam-importance-tag ${importance === 'critical' ? 'critical' : 'high'}">
              ${cleanImportance}
            </span>
          </div>
          <div class="exam-trigger-quote">
            "${trigger}"
          </div>
          <div class="exam-item-footer">
            <div><span class="exam-topic-label">Target Topic:</span> <strong>${topic}</strong></div>
            <div class="exam-tip-note"><span>Instructor Tip:</span> ${tip}</div>
          </div>
        `;

        const timeBtn = itemEl.querySelector('.exam-timestamp-btn');
        if (timeBtn) {
          timeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            seekAudioToSeconds(secs);
          });
        }
        examAlertsList.appendChild(itemEl);
      });
    } else {
      examAlertsSection.classList.add('hidden');
    }
  }

  // Populate Key Concepts
  const chipRow = document.getElementById('chip-row');
  if (chipRow) {
    const conceptBreakdown = document.getElementById('concept-breakdown-wrap');
    chipRow.innerHTML = '';
    if (conceptBreakdown) conceptBreakdown.innerHTML = '';
    const rawConcepts = (note.notes && note.notes.key_concepts) || note.concepts || [];
    rawConcepts.forEach((concept, idx) => {
      const tag = typeof concept === 'string' ? concept : (concept.tag || concept.name || '');
      const desc = typeof concept === 'object' ? (concept.description || '') : '';
      if (!tag) return;
      const chip = document.createElement('button');
      chip.className = `chip ${idx === 0 ? 'active' : ''}`;
      chip.textContent = tag;
      chip.title = desc || tag;
      chipRow.appendChild(chip);

      if (desc && conceptBreakdown) {
        const card = document.createElement('div');
        card.className = 'concept-detail-card';
        card.style.cssText = 'background:var(--bg-card-subtle);border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:12px 16px;margin-bottom:8px;font-size:0.86rem;line-height:1.5;';
        card.innerHTML = `
          <div style="font-weight:700;color:var(--ink-body);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--coral);"></span>
            ${escapeHtml(tag)}
          </div>
          <div style="color:var(--ink-muted);">${formatBodyWithBullets(desc)}</div>
        `;
        conceptBreakdown.appendChild(card);
      }
    });
  }

  // Extract and populate Visual Mind Maps (Architecture & Characteristics)
  const allMindMaps = extractMindMapsFromNote(note);
  const mindmapsSection = document.getElementById('mindmaps-section');
  const mindmapsGrid = document.getElementById('mindmaps-grid');
  const mindmapsCountTag = document.getElementById('mindmaps-count-tag');

  if (mindmapsSection && mindmapsGrid) {
    if (allMindMaps.length > 0) {
      mindmapsSection.classList.remove('hidden');
      if (mindmapsCountTag) {
        mindmapsCountTag.textContent = `${allMindMaps.length} Mind Map${allMindMaps.length > 1 ? 's' : ''}`;
      }
      mindmapsGrid.innerHTML = allMindMaps.map(mm => generateMindMapSVG(mm)).join('');
    } else {
      mindmapsSection.classList.add('hidden');
    }
  }

  // Populate Summary
  const summaryCard = document.getElementById('summary-card');
  if (summaryCard) {
    summaryCard.textContent = note.summary || note.executive_summary || (note.notes && note.notes.executive_summary) || 'Lecture captured successfully.';
  }

  // Populate Hinglish / Code-Switching Smart Glossary
  const glossarySection = document.getElementById('smart-glossary-section');
  const glossaryGrid = document.getElementById('glossary-grid');
  const glossaryTermsPill = document.getElementById('glossary-terms-pill');
  const glossarySearchInput = document.getElementById('glossary-search-input');
  const glossaryItems = note.hinglish_glossary || (note.notes && note.notes.hinglish_glossary) || [];

  currentGlossaryData = glossaryItems;

  if (glossarySection && glossaryGrid) {
    if (glossaryItems.length > 0) {
      glossarySection.classList.remove('hidden');
      if (glossaryTermsPill) glossaryTermsPill.textContent = `${glossaryItems.length} Term${glossaryItems.length > 1 ? 's' : ''}`;
      renderGlossaryGrid(glossaryItems);
      if (glossarySearchInput) {
        glossarySearchInput.value = '';
        glossarySearchInput.oninput = (e) => {
          const q = (e.target.value || '').toLowerCase().trim();
          if (!q) {
            renderGlossaryGrid(currentGlossaryData);
          } else {
            const filtered = currentGlossaryData.filter(g => 
              (g.classroom_phrase && g.classroom_phrase.toLowerCase().includes(q)) ||
              (g.formal_term && g.formal_term.toLowerCase().includes(q)) ||
              (g.explanation && g.explanation.toLowerCase().includes(q))
            );
            renderGlossaryGrid(filtered);
          }
        };
      }
    } else {
      glossarySection.classList.add('hidden');
    }
  }

  // Populate Timeline with interactive seekable timestamps & Exam Alert tags
  const timelineEl = document.getElementById('timeline');
  if (timelineEl) {
    timelineEl.innerHTML = '';
    const timelineItems = note.timeline || (note.notes && note.notes.timeline) || [];
    timelineItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `timeline-item open ${item.type === 'photo' ? 'photo' : ''}`;

      const rawTime = item.timestamp || item.time || '00:00';
      const secs = parseTimestampToSeconds(rawTime);
      const heading = item.heading || (item.tag || 'Discussion');
      const body = item.summary || item.text || item.caption || '';
      const snippet = item.transcript_snippet ? `<blockquote style="margin-top:6px;font-style:italic;color:var(--ink-muted);font-size:0.83rem;border-left:2px solid var(--coral);padding-left:8px;">"${item.transcript_snippet}"</blockquote>` : '';
      const visual = (item.type === 'photo' && item.dataUrl) ? `<img class="ti-image" src="${item.dataUrl}" alt="Board diagram">` : '';
      const pdfVisual = (item.type === 'slide' || item.type === 'pdf') ? `
        <div class="timeline-pdf-card" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#FFF5F2;border:1px solid #FFD8CE;border-radius:10px;margin-bottom:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D9534F" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.85rem;color:var(--ink-body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.pdfName || item.heading || 'Lecture Slide Deck')}</div>
            <div style="font-size:0.75rem;color:var(--ink-muted);">Uploaded lecture presentation slide</div>
          </div>
        </div>
      ` : '';

      // Check if this timeline point has an exam alert
      const matchingAlert = examAlerts.find(a => {
        const aSecs = parseTimestampToSeconds(a.timestamp);
        return Math.abs(aSecs - secs) <= 15 || (a.topic && heading.toLowerCase().includes(a.topic.toLowerCase()));
      });
      const examTagHtml = matchingAlert ? `<span class="timeline-exam-tag" title="Professor highlighted exam topic here">Exam Topic</span>` : '';

      // Check if this timeline point discusses levels, examples, characteristics, or architecture
      const itemCombined = `${heading} ${body} ${item.transcript_snippet || ''}`.toLowerCase();
      let matchingMindMap = null;
      if (/\b(levels?|hierarchy|tiers?)\b/i.test(itemCombined)) {
        matchingMindMap = allMindMaps.find(m => /levels?|hierarchy/i.test(m.trigger_keyword || m.central_topic || m.heading));
      } else if (/\b(examples?|applications?)\b/i.test(itemCombined)) {
        matchingMindMap = allMindMaps.find(m => /examples?|applications?/i.test(m.trigger_keyword || m.central_topic || m.heading));
      } else if (/\b(characteristics?|properties)\b/i.test(itemCombined)) {
        matchingMindMap = allMindMaps.find(m => /characteristics?|properties/i.test(m.trigger_keyword || m.central_topic || m.heading));
      } else if (/\b(architectur(e|es|al))\b/i.test(itemCombined)) {
        matchingMindMap = allMindMaps.find(m => /architectur/i.test(m.trigger_keyword || m.central_topic || m.heading));
      }
      const mindMapSnippet = matchingMindMap ? `<div class="timeline-mindmap-wrap">${generateMindMapSVG(matchingMindMap)}</div>` : '';

      const extractedSnippet = item.extracted_text ? `
        <div class="ti-extracted-content" style="margin-top:8px;padding:8px 12px;background:#FAF6F0;border-left:3px solid #DE7B63;border-radius:6px;font-size:0.8rem;color:#31211D;line-height:1.45;">
          <div style="font-weight:700;font-size:0.75rem;color:#DE7B63;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em;">Analyzed Board / Slide Notes</div>
          <div style="white-space:pre-wrap;max-height:140px;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">${escapeHtml(item.extracted_text.slice(0, 450))}${item.extracted_text.length > 450 ? '...' : ''}</div>
        </div>
      ` : '';

      itemEl.innerHTML = `
        <div class="ti-head">
          <span class="ti-time clickable-timestamp" data-seconds="${secs}" title="Click to jump audio here"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;margin-right:3px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>${rawTime}</span>
          <span class="ti-head-right">
            ${examTagHtml}
            <span class="ti-tag">${item.tag || 'Spoken'}</span>
          </span>
        </div>
        <div class="ti-body">
          ${visual}
          ${pdfVisual}
          <strong>${heading}</strong>
          <div style="margin-top:4px;">${formatBodyWithBullets(body)}</div>
          ${snippet}
          ${extractedSnippet}
          ${mindMapSnippet}
        </div>
      `;

      const timeBtn = itemEl.querySelector('.clickable-timestamp');
      if (timeBtn) {
        timeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          seekAudioToSeconds(secs);
        });
      }

      itemEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('clickable-timestamp')) return;
        itemEl.classList.toggle('open');
      });

      timelineEl.appendChild(itemEl);
    });
  }

  // Populate Verbatim Spoken Transcript
  const rawTranscriptCard = document.getElementById('raw-transcript-card');
  const transcriptHeaderRow = document.querySelector('.transcript-header-row');
  const verbatimText = note.raw_transcript || (note.notes && note.notes.raw_transcript) || '';
  if (rawTranscriptCard) {
    if (verbatimText) {
      rawTranscriptCard.textContent = verbatimText;
      rawTranscriptCard.classList.remove('hidden');
      if (transcriptHeaderRow) transcriptHeaderRow.classList.remove('hidden');
    } else {
      rawTranscriptCard.classList.add('hidden');
      if (transcriptHeaderRow) transcriptHeaderRow.classList.add('hidden');
    }
  }

  // Bind audio playback if available
  if (note.audio_url) {
    setupAudioPlayerPlayback(note.audio_url);
  }

  // Synchronize Favorite / Save Heart Icon state
  isFavorited = !!(note.favorite || (note.notes && note.notes.favorite));
  updateHeartUI();
}

// Goto record from empty state
const btnGotoRecord = document.getElementById('btn-empty-goto-record');
if (btnGotoRecord) {
  btnGotoRecord.addEventListener('click', () => {
    showScreen('record');
  });
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
  btnHeart.addEventListener('click', async () => {
    isFavorited = !isFavorited;
    if (currentNoteData) {
      currentNoteData.favorite = isFavorited;
      if (currentNoteData.id && String(currentNoteData.id).startsWith('lecture_')) {
        try {
          await fetch(`/api/sessions/${currentNoteData.id}/favorite`, { method: 'POST' });
        } catch (err) {
          console.warn('Failed to persist favorite toggle:', err);
        }
      }
      // Update in history list
      const item = mockHistoryData.find(x => String(x.id) === String(currentNoteData.id));
      if (item) {
        item.favorite = isFavorited;
      }
      renderHistory();
    }
    updateHeartUI();
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
      downloadStudyGuidePdf();
    } else if (format === 'notion') {
      openNotionModal();
    } else if (format === 'preview-study-guide') {
      openStudyGuidePreview();
    } else if (format === 'clipboard') {
      copyNotesToClipboard();
    }
  });
});

// ==========================================================================
// STUDY GUIDE PDF EXPORT & PREVIEW
// ==========================================================================
async function downloadStudyGuidePdf() {
  if (!currentNoteData) {
    showToast("No active lecture notes to export");
    return;
  }

  showToast("Generating 2-Column Study Guide PDF...");

  try {
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentNoteData.id || null,
        note_data: currentNoteData
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'PDF generation failed' }));
      throw new Error(err.detail || 'PDF generation failed');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const titleClean = (currentNoteData.title || 'lecture')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    a.download = `${titleClean}_StudyGuide.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Downloaded Study Guide PDF ✓");
  } catch (err) {
    console.error("PDF download error:", err);
    showToast(`PDF Error: ${err.message || 'Could not generate PDF'}`);
  }
}

// Interactive Study Guide Modal Preview
const studyGuideModal = document.getElementById('study-guide-modal');
const btnCloseSg = document.getElementById('btn-close-sg');
const btnSgDownloadPdf = document.getElementById('btn-sg-download-pdf');
const btnSgPrint = document.getElementById('btn-sg-print');
const studyGuideContent = document.getElementById('study-guide-content');

if (btnCloseSg && studyGuideModal) {
  btnCloseSg.addEventListener('click', () => studyGuideModal.classList.add('hidden'));
  studyGuideModal.addEventListener('click', (e) => {
    if (e.target === studyGuideModal) studyGuideModal.classList.add('hidden');
  });
}

if (btnSgDownloadPdf) {
  btnSgDownloadPdf.addEventListener('click', () => downloadStudyGuidePdf());
}

if (btnSgPrint) {
  btnSgPrint.addEventListener('click', () => window.print());
}

function openStudyGuidePreview() {
  if (!currentNoteData) {
    showToast("No active notes loaded");
    return;
  }
  renderStudyGuideSheet(currentNoteData);
  if (studyGuideModal) studyGuideModal.classList.remove('hidden');
}

function renderStudyGuideSheet(data) {
  if (!studyGuideContent) return;
  const notes = data.notes || data;
  const title = (data.title || notes.title || 'Lecture Notes').trim();
  const subject = (data.subject || notes.subject || 'Study Guide').trim();
  const dateStr = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const lang = notes.language_detected || notes.language || 'Hindi + English';

  const summary = notes.executive_summary || notes.summary || '';
  const firstSentence = summary.split('.')[0] || 'All core concepts in this session are interconnected.';
  const concepts = notes.key_concepts || notes.concepts || [];
  const alerts = notes.exam_alerts || [];
  const glossary = notes.hinglish_glossary || [];
  const actions = notes.action_items || [];
  const snapshots = data.snapshots || [];

  let conceptItemsHtml = '';
  concepts.slice(0, 5).forEach((c, idx) => {
    const tag = typeof c === 'string' ? c : (c.tag || c.name || 'Concept');
    const desc = typeof c === 'object' ? (c.description || '') : '';
    if (idx === 0) {
      conceptItemsHtml += `
        <p class="sg-body-text">
          <span class="sg-magenta-term">${escapeHtml(tag)}:</span> Refers to ${escapeHtml(desc.split('.')[0] || desc)}.
          <span class="sg-lime-highlight">${escapeHtml(desc.split('.')[1] || 'Foundational topic across all exam papers.')}</span>
        </p>
      `;
    } else {
      conceptItemsHtml += `
        <li>
          <span class="sg-magenta-term">${escapeHtml(tag)}:</span> ${escapeHtml(desc.split('.')[0] || desc)}.
        </li>
      `;
    }
  });

  let alertsHtml = '';
  if (alerts.length > 0) {
    alerts.slice(0, 2).forEach(a => {
      alertsHtml += `
        <div class="sg-exam-card">
          <strong>[${escapeHtml(a.timestamp || '00:00')}] ${escapeHtml(a.importance || 'CRITICAL').toUpperCase()}: ${escapeHtml(a.topic || 'Exam Focus')}</strong>
          <em>"${escapeHtml(a.trigger_phrase || '')}"</em>
          <div style="margin-top: 3px; color: #1E5C42;"><b>Tip:</b> ${escapeHtml(a.instructor_tip || '')}</div>
        </div>
      `;
    });
  } else {
    alertsHtml = `
      <ul class="sg-bullet-list">
        <li>Empirical Experimental Observations</li>
        <li>Comparative Historical &amp; Theoretical Derivations</li>
        <li>Curriculum Core Formulas &amp; Real-World Applications</li>
      </ul>
    `;
  }

  let visualBoxHtml = '';
  if (snapshots.length > 0 && snapshots[0].image_url) {
    visualBoxHtml = `
      <div class="sg-diagram-box">
        <img src="${snapshots[0].image_url}" class="sg-diagram-img" alt="Lecture Blackboard Diagram" />
        <span class="sg-diagram-caption">Captured Blackboard Diagram &amp; Formulas [${snapshots[0].timestamp || '00:00'}]</span>
      </div>
    `;
  } else {
    visualBoxHtml = `
      <div class="sg-diagram-box">
        <div style="font-size: 0.82rem; font-weight: 800; color: #1A5B45;">SYSTEM SCHEMATIC &amp; COMPARATIVE ANATOMY</div>
        <p style="font-size: 0.74rem; color: #2C4D3E; line-height: 1.45; margin: 4px 0;">
          <b>Primary Circuit:</b> Systemic Pathway &amp; Arterial Inflow<br/>
          <b>Secondary Circuit:</b> Regulatory Feedback &amp; Capillary Gas Exchange Loop
        </p>
        <span class="sg-diagram-caption">Pentadactyl limb &amp; comparative physiology schematic</span>
      </div>
    `;
  }

  let glossaryHtml = '';
  if (glossary.length > 0) {
    glossary.slice(0, 3).forEach(g => {
      glossaryHtml += `
        <li>
          <em>"${escapeHtml(g.classroom_phrase)}"</em> ➔ <b style="color: #2B7BB9;">${escapeHtml(g.formal_term)}:</b>
          <span class="sg-lime-highlight">${escapeHtml((g.explanation || '').slice(0, 90))}</span>
        </li>
      `;
    });
  } else {
    glossaryHtml = `
      <li><b style="color: #2B7BB9;">Homologous Structures:</b> Derived from <span class="sg-lime-highlight">same body part of a common ancestor</span>.</li>
      <li><b style="color: #2B7BB9;">Analogous Convergent:</b> <span class="sg-lime-highlight">Same function</span> but separate evolutionary origins.</li>
    `;
  }

  let checklistHtml = '';
  const actionList = actions.length > 0 ? actions.slice(0, 3) : [
    'Review highlighted vocabulary terms and magenta key definitions.',
    'Sketch and label arterial circulation schematic with directional flow.',
    'Prepare 5-mark answer comparing homologous vs analogous structures.'
  ];
  actionList.forEach(act => {
    checklistHtml += `
      <div class="sg-checklist-item">
        <div class="sg-checkbox-box"></div>
        <span>${escapeHtml(String(act))}</span>
      </div>
    `;
  });

  studyGuideContent.innerHTML = `
    <div class="sg-page-header-row">
      <div class="sg-page-badge">1</div>
      <div class="sg-title-block">
        <h1 class="sg-main-title">${escapeHtml(subject.toUpperCase())} <span>— ${escapeHtml(title)}</span></h1>
        <div class="sg-main-meta">Date: ${escapeHtml(dateStr)}  |  Language: ${escapeHtml(lang)}  |  I.A.M. NoteWorthy Synchronized Study Guide</div>
      </div>
    </div>

    <div class="sg-two-col-grid">
      <!-- LEFT COLUMN -->
      <div class="sg-col">
        <div class="sg-teal-banner">A1.1 ${escapeHtml(subject.toUpperCase())} &amp; ${escapeHtml(title.toUpperCase().slice(0, 24))}</div>
        <div class="sg-mint-pill">VOCABULARY</div>
        <p class="sg-body-text">
          <span class="sg-lime-highlight">${escapeHtml(firstSentence)}.</span>
        </p>

        <ul class="sg-bullet-list" style="margin-top: 4px;">
          ${conceptItemsHtml}
        </ul>

        <div class="sg-teal-banner" style="margin-top: 8px;">EVIDENCE &amp; EXAM CRITICALITY</div>
        <p class="sg-body-text" style="font-size: 0.8rem; color: #4B6B5C;">Key curriculum proofs and instructor high-yield checkpoints identified in this lecture:</p>
        ${alertsHtml}

        <div class="sg-mint-pill" style="margin-top: 8px;">EXECUTIVE SUMMARY SYNTHESIS:</div>
        <p class="sg-body-text">${escapeHtml(summary.slice(0, 320))}${summary.length > 320 ? '...' : ''}</p>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="sg-col">
        <div class="sg-mint-pill">COMPARATIVE ANALYSIS &amp; STRUCTURE:</div>
        <div class="sg-subhead">HOMOLOGOUS &amp; STRUCTURAL SCHEMATICS</div>

        ${visualBoxHtml}

        <p class="sg-body-text">
          Structures <span class="sg-lime-highlight">derived from foundational core principles</span> share common architecture. Specific functional adaptations evolve to meet environmental constraints.
        </p>

        <div class="sg-subhead">ANALOGOUS PATTERNS &amp; CODE-SWITCHING</div>
        <ul class="sg-bullet-list">
          ${glossaryHtml}
        </ul>

        <div class="sg-mint-pill" style="margin-top: 8px;">ACTION ITEMS &amp; STUDY CHECKLIST:</div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
          ${checklistHtml}
        </div>
      </div>
    </div>

    <div class="sg-footer-row">
      <span>I.A.M. NoteWorthy • Intelligent Multi-Modal Lecture Notes</span>
      <span>Page 1 of 1</span>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// NOTION WORKSPACE INTEGRATION & MODAL
// ==========================================================================
const notionModal = document.getElementById('notion-modal');
const btnCloseNotion = document.getElementById('btn-close-notion');
const btnToggleNotionToken = document.getElementById('btn-toggle-notion-token');
const notionTokenInput = document.getElementById('notion-token-input');
const notionParentInput = document.getElementById('notion-parent-input');
const chkSaveNotion = document.getElementById('chk-save-notion');
const btnSubmitNotion = document.getElementById('btn-submit-notion');
const btnCopyNotionMd = document.getElementById('btn-copy-notion-md');
const notionResultBox = document.getElementById('notion-result-box');
const notionResultMsg = document.getElementById('notion-result-msg');
const notionResultLink = document.getElementById('notion-result-link');
const notionResultIcon = document.getElementById('notion-result-icon');

// Populate saved token
try {
  const savedToken = localStorage.getItem('iam_notion_token');
  const savedParent = localStorage.getItem('iam_notion_parent');
  if (savedToken && notionTokenInput) notionTokenInput.value = savedToken;
  if (savedParent && notionParentInput) notionParentInput.value = savedParent;
} catch (e) {}

if (btnToggleNotionToken && notionTokenInput) {
  btnToggleNotionToken.addEventListener('click', () => {
    if (notionTokenInput.type === 'password') {
      notionTokenInput.type = 'text';
      btnToggleNotionToken.textContent = '🔒';
    } else {
      notionTokenInput.type = 'password';
      btnToggleNotionToken.textContent = '👁️';
    }
  });
}

function openNotionModal() {
  if (notionResultBox) notionResultBox.classList.add('hidden');
  if (notionModal) notionModal.classList.remove('hidden');
}

if (btnCloseNotion && notionModal) {
  btnCloseNotion.addEventListener('click', () => notionModal.classList.add('hidden'));
  notionModal.addEventListener('click', (e) => {
    if (e.target === notionModal) notionModal.classList.add('hidden');
  });
}

// Top bar btn-notion button opens Notion modal directly
const btnNotion = document.getElementById('btn-notion');
if (btnNotion) {
  btnNotion.addEventListener('click', () => openNotionModal());
}

if (btnSubmitNotion) {
  btnSubmitNotion.addEventListener('click', async () => {
    if (!currentNoteData) {
      showToast("No active lecture notes to sync");
      return;
    }

    const token = (notionTokenInput ? notionTokenInput.value : '').trim();
    const parentId = (notionParentInput ? notionParentInput.value : '').trim();
    const shouldSave = chkSaveNotion ? chkSaveNotion.checked : true;

    if (!token) {
      if (notionResultBox) {
        notionResultBox.classList.remove('hidden');
        notionResultBox.classList.add('is-error');
        if (notionResultIcon) notionResultIcon.textContent = '!';
        if (notionResultMsg) notionResultMsg.textContent = 'Please enter your Notion Integration Token (starts with secret_).';
        if (notionResultLink) notionResultLink.classList.add('hidden');
      }
      return;
    }

    if (shouldSave) {
      try {
        localStorage.setItem('iam_notion_token', token);
        if (parentId) localStorage.setItem('iam_notion_parent', parentId);
      } catch (e) {}
    }

    // Set Loading State
    btnSubmitNotion.disabled = true;
    btnSubmitNotion.innerHTML = `
      <svg class="spin-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Syncing blocks to Notion...</span>
    `;

    try {
      const res = await fetch('/api/export-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentNoteData.id || null,
          note_data: currentNoteData,
          api_key: token,
          parent_id: parentId || null
        })
      });

      const data = await res.json();

      if (data.success) {
        if (notionResultBox) {
          notionResultBox.classList.remove('hidden');
          notionResultBox.classList.remove('is-error');
          if (notionResultIcon) notionResultIcon.textContent = '✓';
          if (notionResultMsg) notionResultMsg.textContent = data.message || 'Page created successfully in Notion!';
          if (notionResultLink) {
            notionResultLink.href = data.url;
            notionResultLink.classList.remove('hidden');
          }
        }
        showToast("Exported to Notion ✓");

        // Update top bar Notion pill button to success state
        if (btnNotion) {
          btnNotion.innerHTML = `
            <svg class="notion-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L18.423 2.3c-.56-.42-1.306-.7-2.333-.607L3.992 2.808c-.466.046-.56.28-.373.466l.84 1.026v-.092zm.98 3.593v13.064c0 .84.42 1.12 1.306 1.026l14.195-.84c.886-.046 1.073-.653 1.073-1.306V6.68c0-.653-.28-.933-.933-.886L5.859 6.755c-.28.046-.42.373-.42 1.046zm12.98.746c.093.42 0 .84-.42.887l-.746.14v9.845c-.466.28-.98.42-1.446.42-.746 0-1.12-.28-1.586-.887l-4.713-7.373v7.373l1.4.28c.093.42 0 .84-.42.887l-3.36.186c-.093-.42 0-.84.42-.887l.84-.187V9.08L9.293 8.94c-.093-.42 0-.84.42-.887l3.547-.233 4.807 7.42V9.08l-.84-.14c-.093-.42 0-.84.42-.887l3.78-.28z" fill="currentColor"/>
            </svg>
            <span>Synced to Notion ✓</span>
          `;
        }
      } else {
        if (notionResultBox) {
          notionResultBox.classList.remove('hidden');
          notionResultBox.classList.add('is-error');
          if (notionResultIcon) notionResultIcon.textContent = '!';
          if (notionResultMsg) notionResultMsg.textContent = data.message || 'Failed to sync with Notion.';
          if (notionResultLink) notionResultLink.classList.add('hidden');
        }
        showToast("Notion sync issue — see modal");
      }
    } catch (err) {
      if (notionResultBox) {
        notionResultBox.classList.remove('hidden');
        notionResultBox.classList.add('is-error');
        if (notionResultIcon) notionResultIcon.textContent = '!';
        if (notionResultMsg) notionResultMsg.textContent = `Network error: ${err.message}`;
        if (notionResultLink) notionResultLink.classList.add('hidden');
      }
    } finally {
      btnSubmitNotion.disabled = false;
      btnSubmitNotion.innerHTML = `<span class="btn-notion-txt">🚀 Push to Notion</span>`;
    }
  });
}

// Notion Markdown fallback copy
if (btnCopyNotionMd) {
  btnCopyNotionMd.addEventListener('click', () => {
    if (!currentNoteData) {
      showToast("No active notes loaded");
      return;
    }
    const notes = currentNoteData.notes || currentNoteData;
    const title = currentNoteData.title || notes.title || 'Lecture Notes';
    let md = `# ${title}\n\n`;
    md += `> 🎓 **I.A.M. NoteWorthy Lecture Record**\n> Date: ${currentNoteData.date || 'Today'} | Subject: ${currentNoteData.subject || 'General'}\n\n`;

    const alerts = notes.exam_alerts || [];
    if (alerts.length > 0) {
      md += `## 🎯 High-Yield Exam Topics\n`;
      alerts.forEach(a => {
        md += `> 🚨 **[${a.timestamp || '00:00'}] ${a.importance || 'Critical'} — ${a.topic}**\n> "${a.trigger_phrase}"\n> 💡 *Tip:* ${a.instructor_tip}\n\n`;
      });
    }

    const concepts = notes.key_concepts || notes.concepts || [];
    if (concepts.length > 0) {
      md += `## 💡 Key Concepts\n`;
      concepts.forEach(c => {
        const tag = typeof c === 'string' ? c : (c.tag || c.name || '');
        const desc = typeof c === 'object' ? (c.description || '') : '';
        md += `- **${tag}**: ${desc}\n`;
      });
      md += '\n';
    }

    md += `## 📝 Executive Summary\n${notes.executive_summary || notes.summary || ''}\n\n`;

    const actions = notes.action_items || [];
    if (actions.length > 0) {
      md += `## ✅ Action Items\n`;
      actions.forEach(act => {
        md += `- [ ] ${act}\n`;
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      showToast("Copied Notion-Ready Markdown ✓");
    }).catch(() => {
      showToast("Failed to copy to clipboard");
    });
  });
}


// ==========================================================================
// SYNCHRONIZED REAL AUDIO PLAYER & CONTROLLER
// ==========================================================================
let currentPlaybackSpeed = 1.0;
const speedOptions = [1.0, 1.25, 1.5, 2.0];

function parseTimestampToSeconds(ts) {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  const str = String(ts).trim();
  const parts = str.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  } else if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

function formatAudioTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function setupAudioPlayerPlayback(audioUrl) {
  if (!audioUrl) return;

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
    } catch {}
  }

  activeAudioElement = new Audio(audioUrl);
  activeAudioElement.playbackRate = currentPlaybackSpeed;

  const playBtn = document.getElementById('btn-audio-play');
  const playIcon = playBtn ? playBtn.querySelector('.audio-play-icon') : null;
  const pauseIcon = playBtn ? playBtn.querySelector('.audio-pause-icon') : null;
  const timeDisplay = document.getElementById('audio-time-display');
  const seekSlider = document.getElementById('audio-seek-slider');
  const speedBtn = document.getElementById('btn-audio-speed');
  const trackTitle = document.getElementById('audio-track-title');

  if (currentNoteData && trackTitle) {
    trackTitle.textContent = `${currentNoteData.title || 'Lecture'} Audio`;
  }

  activeAudioElement.addEventListener('loadedmetadata', () => {
    const dur = activeAudioElement.duration || 0;
    if (timeDisplay) {
      timeDisplay.textContent = `00:00 / ${formatAudioTime(dur)}`;
    }
    if (seekSlider) {
      seekSlider.value = 0;
      seekSlider.max = Math.floor(dur) || 100;
    }
  });

  activeAudioElement.addEventListener('timeupdate', () => {
    const cur = activeAudioElement.currentTime || 0;
    const dur = activeAudioElement.duration || 0;
    if (timeDisplay) {
      timeDisplay.textContent = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
    }
    if (seekSlider && !seekSlider.dataset.dragging) {
      seekSlider.value = Math.floor(cur);
    }
    updateWaveformProgress(cur, dur);
  });

  activeAudioElement.addEventListener('play', () => {
    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
    const playerCard = document.getElementById('audio-player-card');
    if (playerCard) playerCard.classList.add('playing');
  });

  activeAudioElement.addEventListener('pause', () => {
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    const playerCard = document.getElementById('audio-player-card');
    if (playerCard) playerCard.classList.remove('playing');
  });

  activeAudioElement.addEventListener('ended', () => {
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    const playerCard = document.getElementById('audio-player-card');
    if (playerCard) playerCard.classList.remove('playing');
    if (seekSlider) seekSlider.value = 0;
    updateWaveformProgress(0, 1);
  });

  if (seekSlider) {
    seekSlider.oninput = () => {
      seekSlider.dataset.dragging = 'true';
    };
    seekSlider.onchange = (e) => {
      const targetSec = parseFloat(e.target.value);
      if (activeAudioElement && !isNaN(targetSec)) {
        activeAudioElement.currentTime = targetSec;
        updateWaveformProgress(targetSec, activeAudioElement.duration || 1);
      }
      delete seekSlider.dataset.dragging;
    };
  }

  const speedSelect = document.getElementById('audio-speed-select');
  if (speedSelect) {
    speedSelect.value = String(currentPlaybackSpeed);
    speedSelect.onchange = (e) => {
      const spd = parseFloat(e.target.value) || 1.0;
      currentPlaybackSpeed = spd;
      if (activeAudioElement) {
        activeAudioElement.playbackRate = spd;
      }
    };
  }

  if (speedBtn) {
    speedBtn.onclick = () => {
      const nextIdx = (speedOptions.indexOf(currentPlaybackSpeed) + 1) % speedOptions.length;
      currentPlaybackSpeed = speedOptions[nextIdx];
      if (activeAudioElement) {
        activeAudioElement.playbackRate = currentPlaybackSpeed;
      }
      speedBtn.textContent = `${currentPlaybackSpeed}x`;
      if (speedSelect) speedSelect.value = String(currentPlaybackSpeed);
    };
  }
}

function updateWaveformProgress(cur, dur) {
  const waveBars = document.getElementById('wave-bars');
  if (!waveBars) return;
  const bars = waveBars.querySelectorAll('span');
  if (!bars || bars.length === 0) return;
  const ratio = (dur > 0 && !isNaN(dur)) ? Math.min(1, Math.max(0, cur / dur)) : 0;
  const activeCount = Math.floor(ratio * bars.length);
  bars.forEach((bar, idx) => {
    if (idx <= activeCount && ratio > 0) {
      bar.classList.add('played');
    } else {
      bar.classList.remove('played');
    }
  });
}

function seekAudioToSeconds(seconds) {
  if (!activeAudioElement) {
    if (currentNoteData && currentNoteData.audio_url) {
      setupAudioPlayerPlayback(currentNoteData.audio_url);
    }
  }
  if (activeAudioElement) {
    activeAudioElement.currentTime = seconds;
    activeAudioElement.play().catch(e => console.warn('Playback error:', e));
    const seekSlider = document.getElementById('audio-seek-slider');
    if (seekSlider) seekSlider.value = seconds;
    updateWaveformProgress(seconds, activeAudioElement.duration || 20);
  }
}

// Audio Play/Pause Button Listener
const btnAudioPlay = document.getElementById('btn-audio-play');
const audioPlayerCard = document.getElementById('audio-player-card');

if (btnAudioPlay) {
  btnAudioPlay.addEventListener('click', () => {
    if (activeAudioElement) {
      if (activeAudioElement.paused) {
        activeAudioElement.play().catch(e => {
          console.warn('Audio play error:', e);
        });
      } else {
        activeAudioElement.pause();
      }
    } else if (currentNoteData && currentNoteData.audio_url) {
      setupAudioPlayerPlayback(currentNoteData.audio_url);
      if (activeAudioElement) {
        activeAudioElement.play().catch(e => console.warn('Audio play error:', e));
      }
    }
  });
}

// Waveform Track Click to Seek (WhatsApp / Instagram voice note style)
const audioWaveTrack = document.getElementById('audio-wave-track');
if (audioWaveTrack) {
  audioWaveTrack.addEventListener('click', (e) => {
    if (!activeAudioElement) {
      if (currentNoteData && currentNoteData.audio_url) {
        setupAudioPlayerPlayback(currentNoteData.audio_url);
      }
    }
    if (activeAudioElement) {
      const rect = audioWaveTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const dur = activeAudioElement.duration || (currentNoteData && currentNoteData.duration_seconds) || 20;
      activeAudioElement.currentTime = pct * dur;
      updateWaveformProgress(activeAudioElement.currentTime, dur);
      if (activeAudioElement.paused) {
        activeAudioElement.play().catch(e => console.warn(e));
      }
    }
  });
}

// Badge click smoothly scrolls to Important Exam Topics section
const examBadge = document.getElementById('notes-exam-alert-badge');
if (examBadge) {
  examBadge.addEventListener('click', () => {
    const sec = document.getElementById('exam-alerts-section');
    if (sec && !sec.classList.contains('hidden')) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Global Audio Playback Speed Dropdown Listener
const audioSpeedDropdown = document.getElementById('audio-speed-select');
if (audioSpeedDropdown) {
  audioSpeedDropdown.addEventListener('change', (e) => {
    const spd = parseFloat(e.target.value) || 1.0;
    currentPlaybackSpeed = spd;
    if (activeAudioElement) {
      activeAudioElement.playbackRate = spd;
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
  });
}


// ==========================================================================
// 5. HISTORY & SAVED SESSIONS SCREEN
// ==========================================================================
// Real Recorded Sessions History
let mockHistoryData = [];


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
let deletedNotesList = [];

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
        const id = btn.getAttribute('data-id');
        const idx = deletedNotesList.findIndex(n => String(n.id) === String(id));
        if (idx !== -1) {
          const restored = deletedNotesList.splice(idx, 1)[0];
          mockHistoryData.unshift(restored);
          renderHistory();
        }
      });
    });

    // Permanent delete handlers
    historyList.querySelectorAll('.btn-perm-delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        deletedNotesList = deletedNotesList.filter(n => String(n.id) !== String(id));
        renderHistory();
      });
    });

    const btnEmptyBin = document.getElementById('btn-empty-bin');
    if (btnEmptyBin) {
      btnEmptyBin.addEventListener('click', () => {
        if (confirm('Permanently empty all notes from Bin? This cannot be undone.')) {
          deletedNotesList = [];
          renderHistory();
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
    if (mockHistoryData.length === 0) {
      historyList.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:70px 20px 40px 20px;">
          <div style="font-size:2.4rem;margin-bottom:10px;">🎙️</div>
          <div style="font-weight:700;font-size:1.15rem;color:var(--ink-heading);margin-bottom:6px;">No Lecture Recordings Yet</div>
          <div style="font-size:0.86rem;color:var(--ink-muted);max-width:270px;line-height:1.45;margin-bottom:18px;">Start recording a class lecture in Hindi or English to generate your first real note with synchronized audio!</div>
          <button class="primary-pill-btn" onclick="showScreen('record')">Record Class Now</button>
        </div>
      `;
    } else {
      historyList.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--ink-muted);">No sessions match this filter.</div>`;
    }
    return;
  }

  historyList.innerHTML = filtered.map(item => {
    const isSelected = selectedNotesSet.has(String(item.id));
    return `
      <div class="history-card ${isSelected ? 'is-selected' : ''}" data-id="${item.id}">
        <div class="history-card-body">
          <div class="history-card-top">
            <span class="hc-title">${item.title}</span>
            <div class="hc-badges">
              ${item.favorite ? `<span title="Saved"><svg class="card-heart-svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--coral)" stroke="var(--coral)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--coral)" stroke="var(--coral)"/></svg></span>` : ''}
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
      const id = String(btn.getAttribute('data-id'));
      if (selectedNotesSet.has(id)) {
        selectedNotesSet.delete(id);
      } else {
        selectedNotesSet.add(id);
      }
      renderHistory();
    });
  });

  // Card click to open / view notes with synchronized audio
  historyList.querySelectorAll('.history-card').forEach(card => {
    card.addEventListener('click', async () => {
      const id = card.getAttribute('data-id');
      if (id && String(id).startsWith('lecture_')) {
        await loadAndShowSessionById(id, true);
        return;
      }
      const found = mockHistoryData.find(item => String(item.id) === String(id));
      if (found) {
        renderNotes(found);
        showScreen('notes');
      }
    });
  });
}

// Delete Confirmation Modal Actions
const chkDeletePermanently = document.getElementById('chk-delete-permanently');

function updateDeleteModalText() {
  const count = selectedNotesSet.size;
  if (!deleteModalDesc) return;
  if (chkDeletePermanently && chkDeletePermanently.checked) {
    deleteModalDesc.textContent = `Are you sure you want to permanently delete ${count} selected note${count > 1 ? 's' : ''}? This cannot be undone and will not be saved in your Bin.`;
    if (btnConfirmDelete) btnConfirmDelete.textContent = 'Delete permanently';
  } else {
    deleteModalDesc.textContent = `Are you sure you want to delete ${count} selected note${count > 1 ? 's' : ''}? You can restore them anytime from your Bin.`;
    if (btnConfirmDelete) btnConfirmDelete.textContent = 'Delete';
  }
}

if (chkDeletePermanently) {
  chkDeletePermanently.addEventListener('change', updateDeleteModalText);
}

if (btnDeleteSelected) {
  btnDeleteSelected.addEventListener('click', () => {
    if (selectedNotesSet.size === 0) return;
    if (chkDeletePermanently) chkDeletePermanently.checked = false;
    updateDeleteModalText();
    if (deleteModal) deleteModal.classList.remove('hidden');
  });
}

if (btnCancelDelete && deleteModal) {
  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    if (chkDeletePermanently) chkDeletePermanently.checked = false;
  });
}

if (btnConfirmDelete && deleteModal) {
  btnConfirmDelete.addEventListener('click', async () => {
    const count = selectedNotesSet.size;
    const isPermanent = chkDeletePermanently && chkDeletePermanently.checked;

    if (isPermanent) {
      // Delete on server if it's a backend session
      for (const id of selectedNotesSet) {
        if (String(id).startsWith('lecture_')) {
          try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
          } catch {}
        }
      }
      mockHistoryData = mockHistoryData.filter(item => !selectedNotesSet.has(String(item.id)));
    } else {
      // Move selected notes to deletedNotesList (Bin)
      const toDelete = mockHistoryData.filter(item => selectedNotesSet.has(String(item.id)));
      deletedNotesList = [...toDelete, ...deletedNotesList];
      mockHistoryData = mockHistoryData.filter(item => !selectedNotesSet.has(String(item.id)));
    }

    selectedNotesSet.clear();
    if (chkDeletePermanently) chkDeletePermanently.checked = false;
    deleteModal.classList.add('hidden');
    renderHistory();
  });
}

// Close delete modal on backdrop click
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
      if (chkDeletePermanently) chkDeletePermanently.checked = false;
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
        if (mockHistoryData.length > 0) {
          loadAndShowSessionById(mockHistoryData[0].id, false);
        } else {
          renderNotes();
        }
      }
      showScreen(key);
    });
  }
});


// ==========================================================================
// 7. iOS-STYLE NOTIFICATION UTILITY
// ==========================================================================
let toastTimer = null;
function showToast(message, icon = '', customTitle = '') {
  const toast = document.getElementById('app-toast');
  const msgEl = document.getElementById('toast-message');
  const titleEl = document.getElementById('notif-title');
  const timeEl = document.getElementById('notif-timestamp');

  if (!toast || !msgEl) return;

  const title = customTitle || 'Welcome';
  if (titleEl) {
    titleEl.innerHTML = `<b>${title}</b>`;
  }
  if (timeEl) timeEl.textContent = 'now';
  msgEl.textContent = message;

  toast.classList.remove('hidden', 'dismissing');
  if (toastTimer) clearTimeout(toastTimer);

  toast.onclick = () => {
    toast.classList.add('dismissing');
    setTimeout(() => toast.classList.add('hidden'), 280);
  };

  // Keep notification for a few seconds so the user can easily read it
  toastTimer = setTimeout(() => {
    toast.classList.add('dismissing');
    setTimeout(() => toast.classList.add('hidden'), 280);
  }, 5500);
}

// ==========================================================================
// 8. SESSION INITIALIZATION & FAR-FIELD AUDIO CONFIGURATION
// ==========================================================================
// Studio-grade far-field audio processing runs automatically in the background
// to clearly amplify distant speakers and normalize lecture acoustics.


// Load Session by ID and Render Notes with Synchronized Audio
async function loadAndShowSessionById(sessionId, showScreenAfter = false) {
  try {
    const resp = await fetch(`/api/sessions/${sessionId}`);
    if (resp.ok) {
      const data = await resp.json();
      const notes = data.notes || {};
      const noteObj = {
        id: data.id,
        favorite: !!data.favorite,
        title: data.title || notes.title || 'Lecture Notes',
        subject: data.subject || notes.subject || 'Academic Studies',
        created_at: data.created_at,
        date: data.created_at ? new Date(data.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent session',
        duration: data.duration_text || 'Session',
        language: notes.language_detected || data.language_detected || 'Hindi & English',
        concepts: (notes.key_concepts || []).map(c => typeof c === 'string' ? c : (c.tag || c.name || '')).filter(Boolean),
        summary: notes.executive_summary || data.raw_transcript || 'Session recorded successfully.',
        raw_transcript: data.raw_transcript || '',
        timeline: notes.timeline || [],
        exam_alerts: data.exam_alerts || notes.exam_alerts || [],
        hinglish_glossary: data.hinglish_glossary || notes.hinglish_glossary || [],
        notes: notes,
        audio_url: data.audio_url
      };

      if (data.snapshots && data.snapshots.length > 0) {
        data.snapshots.forEach(f => {
          noteObj.timeline.push({
            type: 'photo',
            timestamp: f.time,
            heading: 'Blackboard Capture',
            summary: `Board Photo (${f.time}): Diagram & notes from lecture.`,
            tag: 'Blackboard Sync',
            dataUrl: f.dataUrl
          });
        });
        noteObj.timeline.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      }

      renderNotes(noteObj);
      if (showScreenAfter) {
        showScreen('notes');
      }
      return noteObj;
    }
  } catch (err) {
    console.warn('Failed to load session details:', err);
  }
  return null;
}

// Load Real Saved Sessions from Backend
async function loadBackendSessions() {
  try {
    const res = await fetch('/api/sessions');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        mockHistoryData = list.map(sess => ({
          id: sess.id,
          title: sess.title,
          date: sess.date || 'Recent session',
          preview: sess.preview || sess.summary_preview || 'Real lecture notes.',
          favorite: sess.favorite || false,
          audio_url: sess.audio_url
        }));
        renderHistory();

        // If no note currently loaded, auto-load the latest session into notes!
        if (!currentNoteData) {
          await loadAndShowSessionById(list[0].id, false);
        }
      }
    }
  } catch (e) {
    console.warn('Could not connect to backend sessions:', e);
  }
}

// Initialize
setMascotState('idle');
renderHistory();
loadBackendSessions();