(() => {
  'use strict';

  // ============ DADOS ============
  const HAIR_STYLES = {
    liso:  { label: 'Liso', emoji: '👩' },
    crespo: { label: 'Crespo', emoji: '🦱' },
    ondulado: { label: 'Ondulado', emoji: '👩‍🦱' },
    coque: { label: 'Coque', emoji: '🎀' },
    trança: { label: 'Trança', emoji: '👱‍♀️' },
    rabo: { label: 'Rabinho', emoji: '🐰' }
  };

  const BASES = {
    nenhuma: { label: 'Sem base', emoji: '🚫', tone: null },
    natural: { label: 'Natural', emoji: '🤎', tone: '#ffe4c4' },
    porcelana: { label: 'Porcelana', emoji: '🤍', tone: '#fff0e0' },
    rosa: { label: 'Rosa', emoji: '🌸', tone: '#ffd9e6' },
    roxa: { label: 'Roxa', emoji: '💜', tone: '#e6d9ff' }
  };

  const SHADOWS = {
    nenhuma: { label: 'Nenhuma', emoji: '🚫', tone: null },
    rosa: { label: 'Rosa', emoji: '🌸', tone: '#ec4899' },
    roxo: { label: 'Roxo', emoji: '💜', tone: '#8b5cf6' },
    rosaclaro: { label: 'Rosa claro', emoji: '🩷', tone: '#f9a8d4' },
    roxoclaro: { label: 'Roxo claro', emoji: '🔮', tone: '#a78bfa' },
    degradê: { label: 'Degradê', emoji: '🌈', tone: null }
  };

  const LIPS = {
    nenhuma: { label: 'Nenhum', emoji: '🚫', tone: null },
    rosa: { label: 'Rosa', emoji: '💄', tone: '#ec4899' },
    roxo: { label: 'Roxo', emoji: '💋', tone: '#8b5cf6' },
    gloss: { label: 'Gloss', emoji: '💧', tone: '#fb7185' },
    framboesa: { label: 'Framboesa', emoji: '🍓', tone: '#e11d48' }
  };

  const OUTFITS = {
    sem: { label: 'Escolher', emoji: '👚' },
    uniforme: { label: 'Uniforme', emoji: '🏫' },
    blusarosa: { label: 'Blusa rosa', emoji: '👕' },
    vestidocor: { label: 'Vestido', emoji: '👗' },
    jaleco: { label: 'Jaleco', emoji: '🥼' },
    cardiga: { label: 'Cardigã', emoji: '🧥' },
    saiaplaid: { label: 'Saia xadrez', emoji: '🎒' },
    moletom: { label: 'Moletom', emoji: '🧶' }
  };

  const GIRLS = [
    'Alice', 'Lívia', 'Beatriz', 'Camila', 'Duda', 'Eduarda',
    'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Júlia', 'Larissa',
    'Manuela', 'Natália', 'Rafaela', 'Sofia', 'Valentina'
  ].slice(0, 15);

  // ============ ESTADO ============
  const state = {};
  GIRLS.forEach((name, i) => {
    state[name] = {
      base: 'nenhuma',
      shadow: 'nenhuma',
      lip: 'nenhuma',
      outfit: 'sem',
      hair: i === 0 ? 'liso' : 'liso'
    };
  });

  // ============ DOM ============
  const $ = (id) => document.getElementById(id);
  const grid = $('grid');

  // ============ PALETA DE CORES ============
  const PALETTE = [
    ['#ffb3d9', '#e6b3ff', '#f9a8d4', '#c4b5fd'],
    ['#fbcfe8', '#ddd6fe', '#f9d5e5', '#d8b4fe'],
    ['#f9c5d8', '#e9d5ff', '#ffc1e3', '#cfb5ff'],
    ['#ffd1e8', '#dec4ff', '#f3b8d4', '#c9a8ff'],
    ['#fec7e0', '#e2c4ff', '#fbafd6', '#c2a0ff']
  ];

  const AVATAR_COLORS = {
    Alice: '#ffb3d9', 'Lívia': '#c4b5fd', Beatriz: '#f9a8d4', Camila: '#ddd6fe',
    Duda: '#f9c5d8', Eduarda: '#e9d5ff', Fernanda: '#ffd1e8', Gabriela: '#dec4ff',
    Helena: '#fbcfe8', Isabela: '#d8b4fe', 'Júlia': '#fec7e0', Larissa: '#cfb5ff',
    Manuela: '#f3b8d4', 'Natália': '#c2a0ff', Rafaela: '#ffc1e3'
  };

  function skinColor(base) {
    return BASES[base] ? (BASES[base].tone || '#ffe4c4') : '#ffe4c4';
  }

  function hairColorFor(name) {
    const base = Math.floor(Math.random() * 3);
    return ['#8b5a2b', '#2f1b0e', '#d9a066'][base];
  }

  // ============ DESENHO DO AVATAR ============
  function drawGirl(canvas, name, opts) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const skin = skinColor(opts.base);
    const cx = w / 2;

    // cabelo (fundo)
    drawHairStyle(ctx, cx, opts.hair, opts, name);

    // cabeça / face
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(cx, 120, 62, 72, 0, 0, Math.PI * 2);
    ctx.fill();

    // bochechas rosadas
    ctx.fillStyle = 'rgba(244,114,182,0.35)';
    ctx.beginPath(); ctx.ellipse(cx - 34, 138, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 34, 138, 12, 8, 0, 0, Math.PI * 2); ctx.fill();

    // olhos
    const eyeY = 118;
    [cx - 22, cx + 22].forEach((x) => {
      ctx.fillStyle = '#2b1b3d';
      ctx.beginPath(); ctx.ellipse(x, eyeY, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(x - 2, eyeY - 3, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // sombra
    if (opts.shadow && opts.shadow !== 'nenhuma') {
      const tone = SHADOWS[opts.shadow].tone || '#8b5cf6';
      if (opts.shadow === 'degradê') {
        const grad = ctx.createLinearGradient(cx - 30, 100, cx + 30, 120);
        grad.addColorStop(0, '#f9a8d4');
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = tone;
        ctx.globalAlpha = 0.55;
      }
      [cx - 28, cx + 6].forEach((x) => {
        ctx.beginPath(); ctx.ellipse(x, 106, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#8b5cf6';
      [cx - 28, cx + 6].forEach((x) => {
        ctx.beginPath(); ctx.ellipse(x, 106, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // cílios
    ctx.strokeStyle = '#2b1b3d'; ctx.lineWidth = 2;
    [cx - 22, cx + 22].forEach((x) => {
      ctx.beginPath(); ctx.moveTo(x - 6, eyeY - 7); ctx.lineTo(x - 10, eyeY - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 6, eyeY - 7); ctx.lineTo(x + 10, eyeY - 10); ctx.stroke();
    });

    // nariz
    ctx.strokeStyle = 'rgba(180,120,80,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, 128, 4, 0.15, Math.PI - 0.15); ctx.stroke();

    // boca
    drawLips(ctx, cx, opts.lip);

    // pescoço
    ctx.fillStyle = skin;
    ctx.fillRect(cx - 10, 185, 20, 22);

    // olhos grandes no cabelo pra fronte

    // corpo / roupa
    drawOutfit(ctx, cx, opts.outfit, opts);

    drawHairFront(ctx, cx, opts.hair, opts, name);
  }

  function drawLips(ctx, cx, lip) {
    const tone = LIPS[lip] ? LIPS[lip].tone : null;
    ctx.fillStyle = tone || '#e4929d';
    ctx.beginPath();
    ctx.moveTo(cx - 12, 150);
    ctx.quadraticCurveTo(cx, 142, cx + 12, 150);
    ctx.quadraticCurveTo(cx, 162, cx - 12, 150);
    ctx.fill();
    if (lip === 'gloss') {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(cx - 4, 148, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawOutfit(ctx, cx, outfit) {
    const topY = 205;
    const bodyColor = '#ffe4c4';
    const shirt = OUTFITS[outfit];
    let color = '#f9a8d4';

    switch (outfit) {
      case 'uniforme': color = '#8b5cf6'; break;
      case 'blusarosa': color = '#ec4899'; break;
      case 'vestidocor': color = '#a78bfa'; break;
      case 'jaleco': color = '#f0f4ff'; break;
      case 'cardiga': color = '#c084fc'; break;
      case 'saiaplaid': color = '#d946ef'; break;
      case 'moletom': color = '#a855f7'; break;
      default: color = 'transparent';
    }

    if (outfit === 'sem') {
      // regata simples
      ctx.fillStyle = '#f9a8d4';
      ctx.fillRect(cx - 30, topY, 60, 60);
      ctx.fillRect(cx - 42, topY - 8, 16, 30);
      ctx.fillRect(cx + 26, topY - 8, 16, 30);
      return;
    }

    // blusa / corpo central
    ctx.fillStyle = color;
    ctx.fillRect(cx - 32, topY, 64, 55);
    // mangas
    ctx.fillRect(cx - 46, topY - 10, 20, 30);
    ctx.fillRect(cx + 26, topY - 10, 20, 30);
    // decote
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx - 14, topY);
    ctx.quadraticCurveTo(cx, topY + 16, cx + 14, topY);
    ctx.lineTo(cx - 14, topY);
    ctx.fill();

    if (outfit === 'uniforme') {
      // gravata
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(cx - 3, topY + 12);
      ctx.lineTo(cx + 3, topY + 12);
      ctx.lineTo(cx + 5, topY + 28);
      ctx.lineTo(cx, topY + 34);
      ctx.lineTo(cx - 5, topY + 28);
      ctx.closePath();
      ctx.fill();
    }
    if (outfit === 'jaqueta' || outfit === 'cardiga') {
      // botões
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx, topY + 16 + i * 10, 2, 0, Math.PI * 2); ctx.fill(); }
    }
    if (outfit === 'moletom') {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, topY - 14); ctx.lineTo(cx, topY + 30); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, topY - 14, 6, 0, Math.PI * 2); ctx.stroke();
    }
    if (outfit === 'saiaplaid') {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(cx - 34, topY + 52);
      ctx.lineTo(cx + 34, topY + 52);
      ctx.lineTo(cx + 22, topY + 95);
      ctx.lineTo(cx - 22, topY + 95);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(cx - 34, topY + 52, 9, 43);
      ctx.fillRect(cx - 9, topY + 52, 9, 43);
    }
  }

  function drawHairStyle(ctx, cx, style, opts, name) {
    const hairColor = opts.hairColor || hairColorFor(name);
    const skin = skinColor(opts.base);
    let w = 130, h = 150;

    ctx.fillStyle = hairColor;
    if (style === 'liso') {
      ctx.beginPath();
      ctx.ellipse(cx, 110, 68, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 68, 100, 20, 120);
      ctx.fillRect(cx + 48, 100, 20, 120);
    } else if (style === 'crespo') {
      for (let a = 0; a < 2 * Math.PI; a += 0.09) {
        const bx = cx + Math.cos(a) * 40;
        const by = 110 + Math.sin(a) * 46;
        ctx.beginPath(); ctx.arc(bx, by - 12, 20, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.arc(cx - 65 + i * 18, 118, 22, 0, Math.PI * 2); ctx.fill();
      }
    } else if (style === 'ondulado') {
      ctx.beginPath(); ctx.ellipse(cx, 110, 66, 78, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const y = 120 + i * 24;
        ctx.beginPath(); ctx.arc(cx - 58, y, 16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 58, y, 16, 0, Math.PI * 2); ctx.fill();
      }
    } else if (style === 'coque') {
      ctx.beginPath(); ctx.arc(cx, 70, 26, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, 100, 60, 58, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath(); ctx.arc(cx, 66, 6, 0, Math.PI * 2); ctx.fill();
    } else if (style === 'trança') {
      ctx.beginPath(); ctx.ellipse(cx, 105, 60, 70, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hairColor; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(cx + 48, 130); ctx.quadraticCurveTo(cx + 62, 210, cx + 44, 240); ctx.stroke();
    } else if (style === 'rabo') {
      ctx.beginPath(); ctx.ellipse(cx, 105, 62, 70, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hairColor; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(cx - 40, 130); ctx.quadraticCurveTo(cx - 60, 180, cx - 44, 220); ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath(); ctx.arc(cx - 40, 118, 7, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawHairFront(ctx, cx, style, opts, name) {
    const hairColor = opts.hairColor || hairColorFor(name);
    ctx.fillStyle = hairColor;
    // franja
    ctx.beginPath(); ctx.arc(cx, 98, 40, Math.PI, 2 * Math.PI); ctx.fill();
    // topo
    ctx.beginPath(); ctx.arc(cx, 78, 46, 0, Math.PI); ctx.fill();
  }

  // ============ SIMPLES DESENHO DO ZONE PHOTO ============
  function drawZone(id, name, opts) {
    const el = document.querySelector(id);
    if (!el) return;
    const canvas = document.createElement('canvas');
    canvas.width = 42; canvas.height = 42;
    drawGirl(canvas, name, opts);
    el.appendChild(canvas);
    canvas.style.borderRadius = '50%';
  }

  // ============ AVATAR SVG SIMPLES ============
  function avatarSvg(name, opts) {
    const skin = skinColor(opts.base);
    const hair = opts.hairColor || AVATAR_COLORS[name] || '#8b5a2b';
    return `<svg viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="${AVATAR_COLORS[name] || '#f9a8d4'}"/>
      <circle cx="40" cy="34" r="26" fill="${skin}"/>
      <ellipse cx="40" cy="30" rx="28" ry="14" fill="${hair}"/>
      <circle cx="32" cy="36" r="2.5" fill="#2b1b3d"/>
      <circle cx="48" cy="36" r="2.5" fill="#2b1b3d"/>
      <path d="M32 48 Q40 55 48 48" stroke="${LIPS[opts.lip].tone || '#e4929d'}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="18" y="52" width="44" height="22" rx="6" fill="${outfitColor(opts.outfit)}"/>
    </svg>`;
  }

  function outfitColor(outfit) {
    return {
      uniforme: '#8b5cf6', blusarosa: '#ec4899', vestidocor: '#a78bfa',
      jaleco: '#e0e7ff', cardiga: '#c084fc', saiaplaid: '#d946ef',
      moletom: '#a855f7'
    }[outfit] || '#f9a8d4';
  }

  // ============ CAPTURAR CANVAS PARA CARD ============
  function updateCard(card, name) {
    const opts = state[name];
    const img = card.querySelector('.avatar');
    img.innerHTML = avatarSvg(name, opts);
    const outfitDesc = card.querySelector('.outfit-desc');
    outfitDesc.textContent = OUTFITS[opts.outfit].emoji + ' ' + OUTFITS[opts.outfit].label;
    card.classList.toggle('ready', opts.outfit !== 'sem' && opts.shadow !== 'nenhuma' && opts.lip !== 'nenhuma');
  }

  // ============ GERAR TOOLS ============
  function makeOptions(containerId, data, girl, key) {
    const container = $(containerId);
    container.innerHTML = '';
    Object.keys(data).forEach((val) => {
      const b = document.createElement('button');
      b.className = 'option';
      b.dataset.val = val;
      b.innerHTML = `<span class="emoji">${data[val].emoji}</span>${data[val].label}`;
      b.addEventListener('click', () => {
        state[girl][key] = val;
        refreshOptions(containerId, state[girl][key]);
        applyTools(girl);
      });
      container.appendChild(b);
    });
    refreshOptions(containerId, state[girl][key]);
  }

  function makeHairOptions(containerId, name) {
    const container = $(containerId);
    container.innerHTML = '';
    Object.keys(HAIR_STYLES).forEach((val) => {
      const b = document.createElement('button');
      b.className = 'option';
      b.dataset.val = val;
      b.innerHTML = `<span class="emoji">${HAIR_STYLES[val].emoji}</span>${HAIR_STYLES[val].label}`;
      b.addEventListener('click', () => {
        state[name].hair = val;
        refreshOptions(containerId, state[name].hair);
        applyHair(name);
      });
      container.appendChild(b);
    });
    refreshOptions(containerId, state[name].hair);
  }

  function refreshOptions(containerId, selected) {
    const container = $(containerId);
    container.querySelectorAll('.option').forEach((b) => {
      b.classList.toggle('active', b.dataset.val === selected);
    });
  }

  // ============ APLICAR ============
  // desenha os zone photos das duas meninas
  function drawZones() {
    drawZone('#alice .zone-photo-alice', 'Alice', state.Alice);
    drawZone('#livia .zone-photo-livia', 'Lívia', state['Lívia']);
  }

  function applyHair(name) {
    if (name === 'Alice') drawCanvasHair('aliceCanv', name);
    if (name === 'Lívia') drawCanvasHair('liviaCanv', name);
  }

  function drawCanvasHair(canvasId, name) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const opts = Object.assign({}, state[name], { base: 'natural', shadow: 'nenhuma', lip: 'nenhuma', outfit: 'uniforme' });
      drawGirl(canvas, name, opts);
    }
  }

  // decora o estado com cor de cabelo
  function assignHairColors() {
    GIRLS.forEach((name) => {
      if (!state[name].hairColor) state[name].hairColor = hairColorFor(name);
    });
  }

  // ============ PROGRESSO ============
  function countReady() {
    return GIRLS.filter((n) => state[n].outfit !== 'sem' && state[n].shadow !== 'nenhuma' && state[n].lip !== 'nenhuma').length;
  }

  function updateProgress() {
    const done = countReady();
    $('progressText').textContent = `${done}/${GIRLS.length}`;
    $('progressFill').style.width = (done / GIRLS.length * 100) + '%';
    if (done === GIRLS.length) celebrate();
  }

  function celebrate() {
    const el = $('celebrate');
    el.innerHTML = `<div class="celebrate-card">
      <h2>🎉 Parabéns! 🎉</h2>
      <p>Todas as ${GIRLS.length} meninas estão lindas e prontas para a escola! 🏫💖</p>
      <button id="closeCelebrate" class="btn">Continuar 📚</button>
    </div>`;
    el.classList.remove('hidden');
    $('closeCelebrate').addEventListener('click', () => el.classList.add('hidden'));
  }

  function drawOK() {
    updateProgress();
    drawZones();
  }

  // ============ RANDOM / RESET ============
  function randomize() {
    const lipKeys = Object.keys(LIPS).filter((k) => k !== 'nenhuma');
    const shadowKeys = Object.keys(SHADOWS).filter((k) => k !== 'nenhuma' && k !== 'degradê');
    const shadowAll = Object.keys(SHADOWS).filter((k) => k !== 'nenhuma');
    const outfitKeys = Object.keys(OUTFITS).filter((k) => k !== 'sem');
    GIRLS.forEach((name) => {
      state[name].lip = lipKeys[Math.floor(Math.random() * lipKeys.length)];
      state[name].shadow = shadowAll[Math.floor(Math.random() * shadowAll.length)];
      state[name].outfit = outfitKeys[Math.floor(Math.random() * outfitKeys.length)];
      state[name].base = ['natural', 'porcelana', 'rosa', 'roxa'][Math.floor(Math.random() * 4)];
    });
    refreshOptions('lipTools', state.Alice.lip);
    refreshOptions('shadowTools', state.Alice.shadow);
    refreshOptions('outfitTools', state.Alice.outfit);
    refreshOptions('baseTools', state.Alice.base);
    grid.innerHTML = '';
    renderGrid();
  }

  function resetAll() {
    GIRLS.forEach((name) => {
      state[name].base = 'nenhuma';
      state[name].shadow = 'nenhuma';
      state[name].lip = 'nenhuma';
      state[name].outfit = 'sem';
    });
    refreshOptions('lipTools', 'nenhuma');
    refreshOptions('shadowTools', 'nenhuma');
    refreshOptions('outfitTools', 'sem');
    refreshOptions('baseTools', 'nenhuma');
    grid.innerHTML = '';
    renderGrid();
  }

  // ============ RENDER GRID ============
  function renderGrid() {
    grid.innerHTML = '';
    GIRLS.forEach((name) => {
      const card = document.createElement('div');
      card.className = 'girl-card';
      card.innerHTML = `
        <div class="avatar"></div>
        <div class="name">${name}</div>
        <div class="outfit-desc"></div>
        <span class="badge">✅ pronta</span>
      `;
      // zona de maquiagem: clique no card abre a ferramenta
      card.addEventListener('click', () => {
        const baseOpts = ['natural', 'porcelana', 'rosa', 'roxa'];
        state[name].base = baseOpts[Math.floor(Math.random() * baseOpts.length)];
        updateCard(card, name);
      });
      grid.appendChild(card);
      updateCard(card, name);
    });
  }

  // ============ INIT ============
  function init() {
    assignHairColors();

    // tools de maquiagem - aplicam a todas as meninas do grid
    makeOptions('baseTools', BASES, 'Alice', 'base');
    makeOptions('shadowTools', SHADOWS, 'Alice', 'shadow');
    makeOptions('lipTools', LIPS, 'Alice', 'lip');
    makeOptions('outfitTools', OUTFITS, 'Alice', 'outfit');

    // reconfigura os listeners de maquiagem para aplicar a TODAS as meninas
    ['baseTools', 'shadowTools', 'lipTools', 'outfitTools'].forEach((id) => {
      const container = $(id);
      container.querySelectorAll('.option').forEach((b) => {
        b.removeEventListener('click', null);
        const key = { baseTools: 'base', shadowTools: 'shadow', lipTools: 'lip', outfitTools: 'outfit' }[id];
        b.addEventListener('click', () => {
          GIRLS.forEach((name) => { state[name][key] = b.dataset.val; });
          refreshOptions(id, b.dataset.val);
          renderGrid();
        });
      });
    });

    // hair
    makeHairOptions('aliceHair', 'Alice');
    makeHairOptions('liviaHair', 'Lívia');

    // desenha os cabelos
    drawCanvasHair('aliceCanv', 'Alice');
    drawCanvasHair('liviaCanv', 'Lívia');

    // grid
    renderGrid();
    drawZones();

    // random/reset
    $('randomBtn').addEventListener('click', randomize);
    $('resetBtn').addEventListener('click', resetAll);

    updateProgress();
  }

  init();
})();
