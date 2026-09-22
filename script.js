(() => {
'use strict';
// ============ SAVE ============
const SAVE_KEY = 'stitch_praia_save_v1';
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { coins: 0, maxLevel: 1, done: [], owned: ['stitch'], selected: 'stitch', boxes: 0 };
}
function save(s) { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }
let S = loadSave();
if (!S.owned.includes('stitch')) S.owned.push('stitch');

// ============ PERSONAGENS ============
const CHARS = [
  { id: 'stitch',   name: 'Stitch',   emoji: '👽', price: 0 },
  { id: 'vaca',     name: 'Vaca',     emoji: '🐄', price: 10 },
  { id: 'macaco',   name: 'Macaco',   emoji: '🐵', price: 10 },
  { id: 'cachorro', name: 'Cachorro', emoji: '🐶', price: 10 },
  { id: 'sapo',     name: 'Sapo',     emoji: '🐸', price: 10 },
  { id: 'pato',     name: 'Pato',     emoji: '🦆', price: 10 },
];
function charEmoji() {
  const c = CHARS.find(c => c.id === S.selected);
  return c ? c.emoji : '👽';
}

// ============ CANVAS ============
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const LANES = [W * 0.22, W * 0.5, W * 0.78];
const GROUND_Y = H - 120;

// estado do jogo
let running = false, level = 1, progress = 0, progressNeed = 100;
let player, obstacles, gifts, coinsFly, particles, clouds, speed, spawnT, giftT, timeT, msg, msgT;

function levelConfig(lv) {
  return {
    speed: 3.6 + lv * 0.35,          // mais rápido a cada nível
    spawn: Math.max(55 - lv * 1.4, 22), // intervalo menor = mais obstáculos
    need: 45 + lv * 4                // quantos pontos para passar
  };
}

function resetLevel(lv) {
  const cfg = levelConfig(lv);
  level = lv; progress = 0; progressNeed = cfg.need;
  speed = cfg.speed; spawnT = 0; giftT = 120; timeT = 0;
  player = { lane: 1, x: LANES[1], y: GROUND_Y, vy: 0, jumping: false, duck: 0, duckT: 0, alive: true, wobble: 0 };
  obstacles = []; gifts = []; coinsFly = []; particles = [];
  clouds = Array.from({ length: 5 }, (_, i) => ({ x: Math.random() * W, y: 20 + Math.random() * 120, s: 0.5 + Math.random() }));
  msg = ''; msgT = 0;
}

// tipos de obstáculo:
// low = PULAR (crab, rock, castle) | high = ABAIXAR (kite, umbrella) | full = DESVIAR (wave, whale, boat)
const LOWS = ['🦀', '🪨', '🏰'];
const HIGHS = ['🪁', '🏖️', '🌴'];
const FULLS = ['🌊', '🐳', '🚤'];

function spawnObstacle() {
  const r = Math.random();
  let type, emoji;
  if (r < 0.35) { type = 'low'; emoji = LOWS[(Math.random() * LOWS.length) | 0]; }
  else if (r < 0.65) { type = 'high'; emoji = HIGHS[(Math.random() * HIGHS.length) | 0]; }
  else { type = 'full'; emoji = FULLS[(Math.random() * FULLS.length) | 0]; }
  // níveis altos: às vezes 2 pistas bloqueadas (tem que desviar!)
  const lanes = [0, 1, 2];
  if (type === 'full' && level >= 5 && Math.random() < 0.4) {
    const free = (Math.random() * 3) | 0;
    lanes.forEach(L => { if (L !== free) obstacles.push({ lane: L, y: -60, type, emoji, hit: false }); });
  } else {
    const lane = (Math.random() * 3) | 0;
    obstacles.push({ lane, y: -60, type, emoji, hit: false });
  }
}

function update() {
  timeT++;
  // jogador física
  if (player.jumping) {
    player.vy += 0.9;
    player.y += player.vy;
    if (player.y >= GROUND_Y) { player.y = GROUND_Y; player.jumping = false; player.vy = 0; dust(player.x, GROUND_Y + 30, 6); }
  }
  player.x += (LANES[player.lane] - player.x) * 0.25;
  if (player.duckT > 0) { player.duckT--; if (player.duckT === 0) player.duck = 0; }
  player.wobble += 0.15;

  // spawn
  const cfg = levelConfig(level);
  spawnT--;
  if (spawnT <= 0) { spawnObstacle(); spawnT = cfg.spawn + Math.random() * 30; }
  giftT--;
  if (giftT <= 0) { gifts.push({ lane: (Math.random() * 3) | 0, y: -50 }); giftT = 300 + Math.random() * 300; }

  // move objetos
  for (const o of obstacles) o.y += speed;
  for (const g of gifts) g.y += speed;
  for (const c of coinsFly) { c.y -= 2; c.t--; }
  coinsFly = coinsFly.filter(c => c.t > 0);
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.t--; }
  particles = particles.filter(p => p.t > 0);
  for (const cl of clouds) { cl.x += 0.3 * cl.s; if (cl.x > W + 60) cl.x = -60; }

  // colisão
  const px = player.x, py = player.y;
  for (const o of obstacles) {
    if (o.hit) continue;
    const oy = o.y;
    if (Math.abs(oy - py) < 46 && Math.abs(LANES[o.lane] - px) < 46) {
      let safe = false;
      if (o.type === 'low' && player.y < GROUND_Y - 55) safe = true;   // pulou!
      if (o.type === 'high' && player.duck === 1) safe = true;         // abaixou!
      if (!safe) { gameOver(o.emoji); return; }
      else if (!o.counted) { o.counted = true; progress += 1; }
    }
    if (!o.counted && o.y > py + 50) { o.counted = true; progress += 1; }
  }
  obstacles = obstacles.filter(o => o.y < H + 80);

  // presentes 🎁 = SALVAR!
  for (const g of gifts) {
    if (!g.hit && Math.abs(g.y - py) < 50 && Math.abs(LANES[g.lane] - px) < 50) {
      g.hit = true;
      S.boxes++;
      save(S);
      coinsFly.push({ x: px, y: py - 50, t: 60, txt: '🎁 SALVOU!' });
      dust(px, py, 10);
      showMsg('🎁 Jogo SALVO! 📦');
      updateHUD();
    }
  }
  gifts = gifts.filter(g => g.y < H + 60 && !g.hit);

  if (msgT > 0) msgT--;

  // passou de nível?
  if (progress >= progressNeed) levelComplete();
  updateHUD();
}

function dust(x, y, n) {
  for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - .5) * 4, vy: -Math.random() * 3, t: 30 + Math.random() * 20 });
}

function showMsg(t) { msg = t; msgT = 90; }

function gameOver(emoji) {
  running = false;
  dust(player.x, player.y, 20);
  showOverlay('💥 Oh não! ' + emoji, 'Você bateu no nível ' + level + '!<br>Progresso: ' + Math.min(100, Math.round(progress / progressNeed * 100)) + '%<br><br>💡 Dica: 🦀 pule ⬆️ • 🪁 abaixe ⬇️ • 🌊 desvie ⬅️➡️<br>🎁 Pegue a caixa para salvar!', '🔄 Tentar de novo (Nível ' + level + ')', () => startLevel(level));
}

function levelComplete() {
  running = false;
  S.coins += 15;
  if (!S.done.includes(level)) S.done.push(level);
  if (level < 30) S.maxLevel = Math.max(S.maxLevel, level + 1);
  save(S); updateHUD(); renderShop(); renderLevels();
  coinsFly = [];
  if (level >= 30) {
    showOverlay('🏆 VOCÊ VENCEU! 🏆', 'Você completou os <b>30 níveis</b> da praia!<br>🪙 Moedas: <b>' + S.coins + '</b><br>📦 Caixas: <b>' + S.boxes + '</b><br>Você é o Defensor da Praia! 🌊💙', '🔁 Jogar de novo', () => startLevel(1));
  } else {
    showOverlay('🎉 Nível ' + level + ' completo!', '+15 moedas! 🪙 Total: <b>' + S.coins + '</b><br>🎁 Caixas que salvam: <b>' + S.boxes + '</b><br>Pronto para o nível ' + (level + 1) + '? Fica mais rápido! 😎', '➡️ Ir para Nível ' + (level + 1), () => startLevel(level + 1));
  }
}

// ============ DESENHO PRAIA ============
function draw() {
  // céu
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#38bdf8'); sky.addColorStop(0.45, '#bae6fd'); sky.addColorStop(0.55, '#38bdf8'); sky.addColorStop(0.62, '#fde68a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // sol
  ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(W - 70, 70, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(253,224,71,.35)'; ctx.beginPath(); ctx.arc(W - 70, 70, 55, 0, Math.PI * 2); ctx.fill();
  // nuvens
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  for (const c of clouds) { ctx.beginPath(); ctx.ellipse(c.x, c.y, 34 * c.s, 14 * c.s, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(c.x + 22 * c.s, c.y + 4, 22 * c.s, 10 * c.s, 0, 0, Math.PI * 2); ctx.fill(); }
  // mar
  ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 200, W, 90);
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  const wv = Date.now() / 400;
  for (let i = 0; i < 6; i++) {
    const y = 215 + i * 13;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x / 40 + wv + i) * 4);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
  }
  // areia
  const sand = ctx.createLinearGradient(0, 290, 0, H);
  sand.addColorStop(0, '#fde68a'); sand.addColorStop(1, '#f59e0b');
  ctx.fillStyle = sand; ctx.fillRect(0, 290, W, H - 290);
  // pistas
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  LANES.forEach(x => { ctx.fillRect(x - 52, 295, 104, H - 295); });
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
  LANES.forEach(x => { ctx.beginPath(); ctx.moveTo(x - 52, 295); ctx.lineTo(x - 52, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 52, 295); ctx.lineTo(x + 52, H); ctx.stroke(); });
  ctx.setLineDash([]);
  // palmeiras laterais
  ctx.font = '54px serif';
  ctx.fillText('🌴', 2, 350); ctx.fillText('🌴', W - 58, 420);
  ctx.font = '30px serif';
  ctx.fillText('🐚', 20, 500 + Math.sin(wv) * 3); ctx.fillText('⭐', W - 45, 540);

  // linha de chegada? mostra progresso
  // presentes
  ctx.font = '40px serif'; ctx.textAlign = 'center';
  for (const g of gifts) {
    ctx.fillText('🎁', LANES[g.lane], g.y);
    ctx.font = '12px sans-serif'; ctx.fillStyle = '#92400e';
    ctx.fillText('SALVA!', LANES[g.lane], g.y + 24);
    ctx.font = '40px serif';
  }
  // obstáculos
  for (const o of obstacles) {
    const x = LANES[o.lane];
    let size = 46;
    if (o.type === 'full') size = 54;
    // sombra + etiqueta do que fazer
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(x, o.y + 26, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = size + 'px serif';
    if (o.type === 'low') ctx.fillText(o.emoji, x, o.y);
    else if (o.type === 'high') ctx.fillText(o.emoji, x, o.y - 20);
    else ctx.fillText(o.emoji, x, o.y);
    // dica
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = o.type === 'low' ? '#166534' : o.type === 'high' ? '#9a3412' : '#b91c1c';
    const tip = o.type === 'low' ? '⬆️ PULE' : o.type === 'high' ? '⬇️ ABAIXE' : '⬅️ DESVIE ➡️';
    ctx.fillText(tip, x, o.y + 42);
  }
  // jogador
  const bounce = player.jumping ? 0 : Math.sin(player.wobble) * 3;
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  const shScale = player.y < GROUND_Y ? 0.6 : 1;
  ctx.beginPath(); ctx.ellipse(player.x, GROUND_Y + 34, 28 * shScale, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.font = (player.duck ? 38 : 56) + 'px serif';
  ctx.fillText(charEmoji(), player.x, player.y + bounce + (player.duck ? 12 : 0));
  if (player.duck) { ctx.font = '18px sans-serif'; ctx.fillStyle = '#0c4a6e'; ctx.fillText('⬇️', player.x, player.y - 30); }

  // moedas voando
  ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#92400e';
  for (const c of coinsFly) ctx.fillText(c.txt, c.x, c.y);
  // partículas
  for (const p of particles) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(p.x, p.y, 4, 4); }
  // msg
  if (msgT > 0) {
    ctx.font = 'bold 24px sans-serif'; ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 5;
    ctx.strokeText(msg, W / 2, 340); ctx.fillText(msg, W / 2, 340);
  }
  // nível no topo do canvas
  ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#0c4a6e'; ctx.textAlign = 'left';
  ctx.fillText('🏝️ Nível ' + level, 12, 28);
  ctx.textAlign = 'right'; ctx.fillText('🎯 ' + Math.min(progress, progressNeed) + '/' + progressNeed, W - 12, 28);
  ctx.textAlign = 'center';
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

// ============ CONTROLES ============
function doLeft() { if (running && player.lane > 0) player.lane--; }
function doRight() { if (running && player.lane < 2) player.lane++; }
function doJump() {
  if (!running) return;
  if (!player.jumping) { player.jumping = true; player.vy = -15; player.duck = 0; player.duckT = 0; }
}
function doDuck() {
  if (!running) return;
  if (player.jumping) { player.vy = 12; } // desce rápido
  player.duck = 1; player.duckT = 40;
}
document.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) { doLeft(); e.preventDefault(); }
  else if (['ArrowRight', 'd', 'D'].includes(e.key)) { doRight(); e.preventDefault(); }
  else if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) { doJump(); e.preventDefault(); }
  else if (['ArrowDown', 's', 'S'].includes(e.key)) { doDuck(); e.preventDefault(); }
});
document.getElementById('btnLeft').onclick = doLeft;
document.getElementById('btnRight').onclick = doRight;
document.getElementById('btnJump').onclick = doJump;
document.getElementById('btnDuck').onclick = doDuck;
// swipe
let tx = 0, ty = 0;
canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
canvas.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - tx, dy = t.clientY - ty;
  if (Math.abs(dx) < 15 && Math.abs(dy) < 15) { doJump(); return; }
  if (Math.abs(dx) > Math.abs(dy)) { dx > 0 ? doRight() : doLeft(); }
  else { dy < 0 ? doJump() : doDuck(); }
}, { passive: true });

// ============ UI ============
const $ = (id) => document.getElementById(id);
function updateHUD() {
  $('hudLevel').textContent = level;
  $('hudCoins').textContent = S.coins;
  $('hudBox').textContent = S.boxes;
  $('hudLives').textContent = running ? '1' : '—';
  $('shopCoins').textContent = S.coins;
  const pct = Math.min(100, Math.round(progress / progressNeed * 100));
  $('levelFill').style.width = pct + '%';
  $('levelText').textContent = pct + '%';
}
function showOverlay(title, html, btnLabel, onPlay) {
  $('overlay').classList.remove('hidden');
  $('ovTitle').innerHTML = title;
  $('ovText').innerHTML = html;
  const b = $('playBtn');
  b.textContent = btnLabel;
  b.onclick = onPlay;
}
function hideOverlay() { $('overlay').classList.add('hidden'); }
function startLevel(lv) {
  level = Math.min(Math.max(lv, 1), 30);
  resetLevel(level);
  hideOverlay(); closeAll();
  running = true;
  updateHUD();
  requestAnimationFrame(loop);
  showMsg('🏝️ Nível ' + level + '!');
}

function renderShop() {
  const g = $('shopGrid'); g.innerHTML = '';
  CHARS.forEach(c => {
    const owned = S.owned.includes(c.id);
    const sel = S.selected === c.id;
    const d = document.createElement('div');
    d.className = 'shop-item' + (sel ? ' selected' : '');
    d.innerHTML = '<div class="emo">' + c.emoji + '</div><div class="nm">' + c.name + '</div><div class="pr">' + (c.price === 0 ? 'GRÁTIS 💙' : '🪙 ' + c.price) + '</div>';
    const b = document.createElement('button');
    if (!owned) { b.textContent = 'Comprar 🪙' + c.price; b.onclick = () => {
      if (S.coins >= c.price) { S.coins -= c.price; S.owned.push(c.id); S.selected = c.id; save(S); updateHUD(); renderShop(); }
      else alert('Você precisa de ' + c.price + ' moedas! Jogue níveis para ganhar 15 moedas cada. 🪙');
    }; }
    else if (!sel) { b.textContent = 'Usar ✅'; b.className = 'owned'; b.onclick = () => { S.selected = c.id; save(S); renderShop(); }; }
    else { b.textContent = 'Usando 💙'; b.className = 'owned'; }
    d.appendChild(b);
    g.appendChild(d);
  });
  $('shopCoins').textContent = S.coins;
}
function renderLevels() {
  const g = $('levelsGrid'); g.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    if (S.done.includes(i)) b.className = 'done';
    if (i > S.maxLevel) { b.classList.add('locked'); b.textContent = '🔒'; }
    else b.onclick = () => startLevel(i);
    g.appendChild(b);
  }
}
function closeAll() { $('shop').classList.add('hidden'); $('levelsModal').classList.add('hidden'); $('helpModal').classList.add('hidden'); }

$('shopBtn').onclick = () => { renderShop(); closeAll(); $('shop').classList.remove('hidden'); };
$('closeShop').onclick = () => $('shop').classList.add('hidden');
$('levelsBtn').onclick = () => { renderLevels(); closeAll(); $('levelsModal').classList.remove('hidden'); };
$('closeLevels').onclick = () => $('levelsModal').classList.add('hidden');
$('helpBtn').onclick = () => { closeAll(); $('helpModal').classList.remove('hidden'); };
$('closeHelp').onclick = () => $('helpModal').classList.add('hidden');
$('startBtn').onclick = () => startLevel(Math.min(S.maxLevel, 30));

// init
resetLevel(Math.min(S.maxLevel, 30));
level = Math.min(S.maxLevel, 30);
draw();
updateHUD(); renderShop(); renderLevels();
showOverlay('🌊 Stitch Defensor da Praia! 🏖️',
  'Desvie na praia!<br>⬅️➡️ trocar de pista • ⬆️ pular 🦀 • ⬇️ abaixar 🪁<br><br>🏆 30 níveis • +15 🪙 por nível<br>🛍️ Compre: Vaca 🐄 Macaco 🐵 Cachorro 🐶 Sapo 🐸 Pato 🦆 (10 🪙)<br>🎁 Pegue a <b>CAIXA</b> para <b>SALVAR</b>!',
  '▶️ Começar Nível ' + level, () => startLevel(level));
})();
