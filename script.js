// ══════════════════════════════════
//  STARS CANVAS
// ══════════════════════════════════
function initStars(id) {
  const c = document.getElementById(id);
  if (!c) return;
  const ctx = c.getContext('2d');
  let stars = [];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < Math.floor((c.width * c.height) / 4500); i++) {
      stars.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * 0.5 + 0.15,
        s: Math.random() * 0.004 + 0.001,
        p: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const s of stars) {
      const tw = Math.sin(t * s.s + s.p) * 0.35 + 0.65;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
  window.addEventListener('resize', resize);
}

// ══════════════════════════════════
//  PARTICLE FIELD (start screen)
// ══════════════════════════════════
function initParticles() {
  const c = document.getElementById('particleCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let particles = [];
  const colors = ['#b44dff', '#ff2d95', '#00d4ff', '#ffb800', '#00ff88'];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(t) {
    if (!document.getElementById('startOverlay') || document.getElementById('startOverlay').classList.contains('dissolve')) return;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = c.width;
      if (p.x > c.width) p.x = 0;
      if (p.y < 0) p.y = c.height;
      if (p.y > c.height) p.y = 0;

      const glow = Math.sin(t * 0.002 + p.pulse) * 0.2 + 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.a * glow;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
  window.addEventListener('resize', resize);
}

initParticles();

// ══════════════════════════════════
//  HAPPY BIRTHDAY MELODY
// ══════════════════════════════════
let audioCtx = null;
let masterGain = null;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(audioCtx.destination);
}

let melodyTimer = null;

function playHappyBirthday() {
  if (!audioCtx) return;
  scheduleMelody();
}

function scheduleMelody() {
  if (!audioCtx || !masterGain) return;

  const tempo = 380; // ms per beat — slightly slower, more musical
  const noteMap = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25
  };

  // Happy Birthday melody
  const melody = [
    ['C4',0.75],['C4',0.25],['D4',1],['C4',1],['F4',1],['E4',2],
    ['C4',0.75],['C4',0.25],['D4',1],['C4',1],['G4',1],['F4',2],
    ['C4',0.75],['C4',0.25],['C5',1],['A4',1],['F4',1],['E4',1],['D4',2],
    ['Bb4',0.75],['Bb4',0.25],['A4',1],['F4',1],['G4',1],['F4',2],
  ];

  let t = audioCtx.currentTime + 0.2;

  for (const [note, beats] of melody) {
    const dur = beats * (tempo / 1000);
    const freq = noteMap[note];

    // Main voice (sine)
    const osc1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.3, t + 0.04);
    g1.gain.setValueAtTime(0.3, t + dur - 0.06);
    g1.gain.linearRampToValueAtTime(0, t + dur);
    osc1.connect(g1);
    g1.connect(masterGain);
    osc1.start(t);
    osc1.stop(t + dur + 0.01);

    // Warm layer (triangle, octave down)
    const osc2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 0.5;
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.12, t + 0.04);
    g2.gain.linearRampToValueAtTime(0, t + dur);
    osc2.connect(g2);
    g2.connect(masterGain);
    osc2.start(t);
    osc2.stop(t + dur + 0.01);

    // Shimmer layer (sine, octave up, quiet)
    const osc3 = audioCtx.createOscillator();
    const g3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2;
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.05, t + 0.04);
    g3.gain.linearRampToValueAtTime(0, t + dur);
    osc3.connect(g3);
    g3.connect(masterGain);
    osc3.start(t);
    osc3.stop(t + dur + 0.01);

    t += dur;
  }

  // Calculate total duration and schedule a repeat with a small gap
  const totalBeats = melody.reduce((sum, [, b]) => sum + b, 0);
  const totalMs = totalBeats * tempo + 800; // 800ms pause between loops
  melodyTimer = setTimeout(() => scheduleMelody(), totalMs);
}

function fadeOutMusic() {
  if (melodyTimer) { clearTimeout(melodyTimer); melodyTimer = null; }
  if (!masterGain || !audioCtx) return;
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
}

// ══════════════════════════════════
//  NEON BALLOONS
// ══════════════════════════════════
const balloonContainer = document.getElementById('balloonContainer');
const neonColors = ['#ff2d95', '#b44dff', '#00d4ff', '#ffb800', '#00ff88', '#ff6b35', '#e879f9', '#00fff7'];

function launchBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];
  b.style.color = color;
  b.style.left = (Math.random() * 85 + 5) + '%';

  const size = Math.random() * 16 + 38;
  const body = document.createElement('div');
  body.className = 'balloon-body';
  body.style.width = size + 'px';
  body.style.height = (size * 1.28) + 'px';

  const string = document.createElement('div');
  string.className = 'balloon-string';

  b.appendChild(body);
  b.appendChild(string);
  balloonContainer.appendChild(b);

  const dur = Math.random() * 4000 + 5000;
  b.style.animation = `floatUp ${dur}ms ease-in-out forwards`;
  b.style.animationDelay = (Math.random() * 300) + 'ms';

  setTimeout(() => b.remove(), dur + 500);
}

function launchWave(count, interval) {
  for (let i = 0; i < count; i++) setTimeout(launchBalloon, i * interval);
}

// ══════════════════════════════════
//  CAKE BUILD SEQUENCE
// ══════════════════════════════════
const hbTitle = document.getElementById('hbTitle');
const hbName = document.getElementById('hbName');
const plate = document.getElementById('plate');
const layer1 = document.getElementById('layer1');
const layer2 = document.getElementById('layer2');
const layer3 = document.getElementById('layer3');
const candleEls = document.querySelectorAll('.candle');
const flame1 = document.getElementById('flame1');
const flame2 = document.getElementById('flame2');
const flame3 = document.getElementById('flame3');
const nextBtn = document.getElementById('nextBtn');

function flashLayer(el) {
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 200);
}

function runCakeSequence() {
  const seq = [
    // Title
    [0, () => { hbTitle.classList.add('visible'); }],
    [500, () => { hbName.classList.add('visible'); }],

    // Plate
    [1400, () => { plate.classList.add('visible'); }],

    // Layer 1 — bottom, pink
    [2200, () => {
      layer1.classList.add('visible');
      setTimeout(() => flashLayer(layer1), 700);
      launchWave(3, 250);
    }],
    // Layer 1 drips
    [3200, () => layer1.querySelectorAll('.neon-drip').forEach(d => d.classList.add('visible'))],

    // Layer 2 — middle, purple
    [3600, () => {
      layer2.classList.add('visible');
      setTimeout(() => flashLayer(layer2), 700);
      launchWave(3, 250);
    }],
    // Layer 2 drips
    [4500, () => layer2.querySelectorAll('.neon-drip').forEach(d => d.classList.add('visible'))],

    // Layer 3 — top, gold
    [4900, () => {
      layer3.classList.add('visible');
      setTimeout(() => flashLayer(layer3), 700);
      launchWave(4, 200);
    }],
    // Layer 3 drips
    [5700, () => layer3.querySelectorAll('.neon-drip').forEach(d => d.classList.add('visible'))],

    // Candles appear one by one
    [6200, () => { candleEls[0].classList.add('visible'); }],
    [6500, () => { candleEls[1].classList.add('visible'); }],
    [6800, () => { candleEls[2].classList.add('visible'); }],

    // Flames light one by one
    [7300, () => { flame1.classList.add('lit'); }],
    [7600, () => { flame2.classList.add('lit'); }],
    [7900, () => {
      flame3.classList.add('lit');
      // Big balloon wave when all candles lit
      launchWave(10, 150);
    }],

    // Music starts
    [8500, () => { playHappyBirthday(); }],

    // Button appears ~3s after music
    [11500, () => { nextBtn.classList.add('visible'); }],
  ];

  seq.forEach(([ms, fn]) => setTimeout(fn, ms));

  // Ongoing balloons
  const iv = setInterval(() => {
    if (document.getElementById('pageCake').style.display === 'none') { clearInterval(iv); return; }
    launchBalloon();
  }, 1800);
}

// ══════════════════════════════════
//  START OVERLAY
// ══════════════════════════════════
document.getElementById('startBtn').addEventListener('click', () => {
  initAudio();
  const overlay = document.getElementById('startOverlay');
  overlay.classList.add('dissolve');
  setTimeout(() => {
    overlay.style.display = 'none';
    initStars('starsCanvas');
    runCakeSequence();
  }, 800);
});

// ══════════════════════════════════
//  PAGE TRANSITION — CAKE → MEMORIES
// ══════════════════════════════════
nextBtn.addEventListener('click', () => {
  fadeOutMusic();
  const pageCake = document.getElementById('pageCake');
  const pageMem = document.getElementById('pageMemories');

  pageCake.style.transition = 'opacity 0.8s ease';
  pageCake.style.opacity = '0';

  setTimeout(() => {
    pageCake.style.display = 'none';
    pageMem.classList.add('active');
    initStars('starsCanvas2');
    initSlideshow();
  }, 800);
});

// ══════════════════════════════════
//  CINEMATIC SLIDESHOW
// ══════════════════════════════════
let slideIndex = 0;
let slideTimer = null;
let slideImgs = [];

function initSlideshow() {
  const viewport = document.getElementById('slideViewport');
  const dotsEl = document.getElementById('slideDots');
  if (!viewport || !dotsEl) { console.error('Slideshow elements not found'); return; }
  viewport.innerHTML = '';
  dotsEl.innerHTML = '';
  slideImgs = [];

  console.log('PHOTOS available:', window.PHOTOS ? PHOTOS.length : 'NO');
  if (!window.PHOTOS || PHOTOS.length === 0) { console.error('No photos!'); return; }

  PHOTOS.forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'slide-img';
    img.src = src;
    img.alt = 'Memory ' + (i + 1);
    viewport.appendChild(img);
    slideImgs.push(img);

    const dot = document.createElement('button');
    dot.className = 'slide-dot';
    dot.onclick = () => goSlide(i);
    dotsEl.appendChild(dot);
  });

  slideIndex = 0;
  showSlide(0);
  startAutoAdvance();

  document.getElementById('slidePrev').onclick = () => { goSlide((slideIndex - 1 + PHOTOS.length) % PHOTOS.length); resetAutoAdvance(); };
  document.getElementById('slideNext').onclick = () => { goSlide((slideIndex + 1) % PHOTOS.length); resetAutoAdvance(); };

  // Touch swipe
  let tx = 0;
  const ss = document.getElementById('slideshow');
  ss.addEventListener('touchstart', e => { tx = e.touches[0].clientX; });
  ss.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goSlide((slideIndex + 1) % PHOTOS.length) : goSlide((slideIndex - 1 + PHOTOS.length) % PHOTOS.length);
      resetAutoAdvance();
    }
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!document.getElementById('pageMemories').classList.contains('active')) return;
    if (e.key === 'ArrowLeft') { goSlide((slideIndex - 1 + PHOTOS.length) % PHOTOS.length); resetAutoAdvance(); }
    if (e.key === 'ArrowRight') { goSlide((slideIndex + 1) % PHOTOS.length); resetAutoAdvance(); }
  });
}

function showSlide(i) {
  // First remove active from all
  slideImgs.forEach(img => img.classList.remove('active'));

  // Then activate the target
  const target = slideImgs[i];
  if (target) {
    // Force animation restart
    void target.offsetWidth;
    target.classList.add('active');
  }

  document.querySelectorAll('.slide-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  document.getElementById('slideCounter').textContent = (i + 1) + ' / ' + PHOTOS.length;
}

function goSlide(i) {
  slideIndex = i;
  showSlide(i);
}

function startAutoAdvance() {
  slideTimer = setInterval(() => {
    slideIndex = (slideIndex + 1) % PHOTOS.length;
    showSlide(slideIndex);
  }, 5000);
}

function resetAutoAdvance() {
  clearInterval(slideTimer);
  startAutoAdvance();
}

// ══════════════════════════════════
//  EXPERIENCE AGAIN
// ══════════════════════════════════
document.getElementById('againBtn').addEventListener('click', () => {
  clearInterval(slideTimer);
  const pageCake = document.getElementById('pageCake');
  const pageMem = document.getElementById('pageMemories');

  pageMem.style.transition = 'opacity 0.8s ease';
  pageMem.style.opacity = '0';

  setTimeout(() => {
    pageMem.classList.remove('active');
    pageMem.style.opacity = '';
    pageMem.style.transition = '';

    // Reset cake
    pageCake.style.display = '';
    pageCake.style.opacity = '';
    pageCake.style.transition = '';
    hbTitle.classList.remove('visible');
    hbName.classList.remove('visible');
    plate.classList.remove('visible');
    layer1.classList.remove('visible');
    layer2.classList.remove('visible');
    layer3.classList.remove('visible');
    document.querySelectorAll('.neon-drip').forEach(d => d.classList.remove('visible'));
    candleEls.forEach(c => c.classList.remove('visible'));
    flame1.classList.remove('lit');
    flame2.classList.remove('lit');
    flame3.classList.remove('lit');
    nextBtn.classList.remove('visible');

    // Reset audio
    if (melodyTimer) { clearTimeout(melodyTimer); melodyTimer = null; }
    if (masterGain && audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.value = 0.35;
    }

    setTimeout(runCakeSequence, 400);
  }, 800);
});
