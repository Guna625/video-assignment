// ---------- Mobile menu ----------
const menu = document.getElementById('menu');
document.getElementById('menuBtn').addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// ---------- Scroll reveal animation ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('img');
document.querySelectorAll('.gallery img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src.replace('/600/400', '/1200/800');
    lbImg.alt = img.alt;
    lightbox.classList.add('open');
  });
});
lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

// ---------- Video controls ----------
const vid = document.getElementById('vid');
const playBtn = document.getElementById('playBtn');
const speedBtn = document.getElementById('speedBtn');
playBtn.addEventListener('click', () => (vid.paused ? vid.play() : vid.pause()));
vid.addEventListener('play', () => playBtn.textContent = '⏸ Pause');
vid.addEventListener('pause', () => playBtn.textContent = '▶ Play');
const speeds = [1, 1.5, 2, 0.5];
let si = 0;
speedBtn.addEventListener('click', () => {
  si = (si + 1) % speeds.length;
  vid.playbackRate = speeds[si];
  speedBtn.textContent = `Speed ${speeds[si]}×`;
});

// ---------- Audio: animated bars sync with <audio> ----------
const audio = document.querySelector('audio');
const bars = document.getElementById('bars');
audio.addEventListener('play', () => bars.classList.add('playing'));
audio.addEventListener('pause', () => bars.classList.remove('playing'));
audio.addEventListener('ended', () => bars.classList.remove('playing'));

// ---------- Mini piano (Web Audio API) ----------
const notes = [
  { n: 'C', f: 261.63, k: 'a' }, { n: 'D', f: 293.66, k: 's' }, { n: 'E', f: 329.63, k: 'd' },
  { n: 'F', f: 349.23, k: 'f' }, { n: 'G', f: 392.00, k: 'g' }, { n: 'A', f: 440.00, k: 'h' },
  { n: 'B', f: 493.88, k: 'j' }
];
let actx;
function playNote(freq) {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.4, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 1.2);
  osc.connect(gain).connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + 1.2);
}
const piano = document.getElementById('piano');
const keyEls = {};
notes.forEach(note => {
  const el = document.createElement('div');
  el.className = 'key';
  el.textContent = note.n;
  const press = () => {
    playNote(note.f);
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 150);
  };
  el.addEventListener('pointerdown', press);
  piano.appendChild(el);
  keyEls[note.k] = press;
});
document.addEventListener('keydown', e => {
  if (!e.repeat && keyEls[e.key.toLowerCase()]) keyEls[e.key.toLowerCase()]();
});

// ---------- Interactive canvas particles ----------
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const colorPick = document.getElementById('colorPick');
let particles = [];

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const r = cv.getBoundingClientRect();
  cv.width = r.width * dpr;
  cv.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function spawn(x, y, count, speed) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 1, size: Math.random() * 4 + 2,
      color: Math.random() < 0.5 ? colorPick.value : '#00d4ff'
    });
  }
}
function pos(e) {
  const r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
cv.addEventListener('pointermove', e => { const p = pos(e); spawn(p.x, p.y, 2, 1.5); });
cv.addEventListener('pointerdown', e => { const p = pos(e); spawn(p.x, p.y, 60, 6); });
document.getElementById('clearBtn').addEventListener('click', () => particles = []);

function loop() {
  const w = cv.getBoundingClientRect().width;
  const h = cv.getBoundingClientRect().height;
  ctx.fillStyle = 'rgba(10,11,24,0.25)';
  ctx.fillRect(0, 0, w, h);
  particles = particles.filter(p => p.life > 0.02);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.04;
    p.life *= 0.97;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
loop();
