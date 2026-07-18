const WORKER_URL = "https://leaderboard-worker.ppouyaaaryani.workers.dev";

let siteMode = "modern";
let highScore = 0;
let userCode = "PL-" + Math.floor(1000 + Math.random() * 9000);
let isMuted = false;

try {
  siteMode = localStorage.getItem('site_mode') || 'modern';
  highScore = parseInt(localStorage.getItem('minigame_highscore') || '0', 10);
  
  let storedCode = localStorage.getItem('minigame_user_code');
  if (!storedCode) {
    localStorage.setItem('minigame_user_code', userCode);
  } else {
    userCode = storedCode;
  }
} catch (storageError) {
  if (window.name && window.name.startsWith("PL-")) {
    userCode = window.name;
  } else {
    window.name = userCode;
  }
}

const identityField = document.getElementById('identityField');
if (identityField) identityField.textContent = userCode;

const identityFooter = document.getElementById('identityFooter');
if (identityFooter) {
  identityFooter.style.zIndex = "9999";
  identityFooter.style.pointerEvents = "none";
}

const isClassicMode = siteMode === 'classic';
if (isClassicMode) {
  document.body.classList.add('classic-mode');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const scoreVal = document.getElementById('scoreVal');
const highScoreVal = document.getElementById('highScoreVal');
const finalScoreVal = document.getElementById('finalScoreVal');
const finalHighScoreVal = document.getElementById('finalHighScoreVal');
const livesContainer = document.getElementById('livesContainer');
const gameOverScreen = document.getElementById('gameOverScreen');
const celebrationMessage = document.getElementById('celebrationMessage');
const leaderboardRows = document.getElementById('leaderboardRows');
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');
const soundBtn = document.getElementById('soundBtn');

let W = window.innerWidth || 360;
let H = window.innerHeight || 640;
let isPlaying = false;
let animationFrameId = null;

let score = 0;
let lives = 3;
let invulnerableTimer = 0;
let shieldTimer = 0;
let magnetTimer = 0;
let coinRainTimer = 0;

let lastShieldScore = 0;
let lastRainScore = 0;
let nextHomingScore = 70;
let screenShake = 0;
let countdownInterval = null;
let autoExitTime = 5;

if (highScoreVal) highScoreVal.textContent = highScore;

const SoundEngine = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playCoin() {
    if (isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  },
  playHit() {
    if (isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  },
  playPowerup() {
    if (isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
};

if (soundBtn) {
  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    soundBtn.textContent = isMuted ? "🔇" : "🔊";
    if (!isMuted) {
      SoundEngine.init();
    }
  });
}

function unlockAudio() {
  if (!isMuted) SoundEngine.init();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('touchstart', unlockAudio);
}
window.addEventListener('click', unlockAudio);
window.addEventListener('touchstart', unlockAudio);

function resize() {
  W = window.innerWidth || 360;
  H = window.innerHeight || 640;
  if (canvas && ctx) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }
}
window.addEventListener('resize', resize);
resize();

const logoImg = new Image();
let isLogoLoaded = false;
logoImg.onload = () => { isLogoLoaded = true; };
logoImg.src = '../logo.png';

function renderLives() {
  if (!livesContainer) return;
  livesContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', `heart-icon ${i >= lives ? 'lost' : ''}`);
    svg.innerHTML = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
    livesContainer.appendChild(svg);
  }
}

async function sendTelemetryData(finalScore) {
  if (!WORKER_URL || WORKER_URL.includes("YOUR-WORKER-NAME")) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const telemetry = {
      score: finalScore,
      userCode: userCode,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };

    await fetch(`${WORKER_URL}/api/save-score`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (error) {}
}

async function fetchAndRenderLeaderboard() {
  if (!leaderboardRows) return;
  leaderboardRows.innerHTML = '<div class="loading-text">FETCHING DATA...</div>';
  
  if (!WORKER_URL || WORKER_URL.includes("YOUR-WORKER-NAME")) {
    leaderboardRows.innerHTML = '<div class="loading-text" style="color:#ff5252!important;">OFFLINE</div>';
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${WORKER_URL}/api/top-scores`, { 
      method: 'GET',
      mode: 'cors',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error();
    const topThree = await response.json();
    
    leaderboardRows.innerHTML = '';
    
    if (topThree.length === 0) {
      leaderboardRows.innerHTML = '<div class="loading-text">NO SCORES YET</div>';
      return;
    }

    let qualifiesTopThree = false;
    if (topThree.length < 3 && score > 0) {
      qualifiesTopThree = true;
    } else if (topThree.length >= 3 && score >= topThree[2].score) {
      qualifiesTopThree = true;
    }

    if (celebrationMessage) {
      if (qualifiesTopThree) {
        celebrationMessage.textContent = "🏆 NEW TOP 3 PILOT RANKED!";
        celebrationMessage.style.display = "block";
      } else {
        celebrationMessage.style.display = "none";
      }
    }

    topThree.forEach((pilot, index) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      row.innerHTML = `
        <div>
          <span class="rank-tag">#${index + 1}</span>
          <span class="pilot-platform">${pilot.userCode || 'ANON'}</span>
        </div>
        <span class="pilot-score">${pilot.score}</span>
      `;
      leaderboardRows.appendChild(row);
    });
  } catch (err) {
    leaderboardRows.innerHTML = '<div class="loading-text" style="color:#ff5252!important;">OFFLINE</div>';
  }
}

class VisualParticles {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = 1;
    this.alpha = 1;
    this.color = color;
  }
  update() {
    this.radius += 3.5;
    this.alpha -= 0.03;
  }
  draw() {
    if (this.alpha <= 0 || !ctx) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    if (isClassicMode) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }
}

class Player {
  constructor() {
    const isMobile = W < 600;
    this.width = isMobile ? 22 : 28;
    this.height = isMobile ? 28 : 34;
    this.x = W / 2;
    this.y = H - 120;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 0.25;
  }

  update() {
    this.x += (this.targetX - this.x) * this.speed;
    this.y += (this.targetY - this.y) * this.speed;

    this.x = Math.max(20, Math.min(W - 20, this.x));
    this.y = Math.max(20, Math.min(H - 20, this.y));

    if (invulnerableTimer > 0) invulnerableTimer--;
    if (shieldTimer > 0) shieldTimer--;
    if (magnetTimer > 0) magnetTimer--;
  }

  draw() {
    if (!ctx) return;
    if (magnetTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (isClassicMode) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.height, -this.height, this.height * 2, this.height * 2);
      } else {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (shieldTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (isClassicMode) {
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.height * 0.9, -this.height * 0.9, this.height * 1.8, this.height * 1.8);
      } else {
        ctx.fillStyle = 'rgba(91, 140, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5b8cff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (invulnerableTimer % 6 >= 3) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (isClassicMode) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-12, -16, 24, 32);
      ctx.fillStyle = '#000080';
      ctx.fillRect(-6, -10, 12, 16);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-4, 16, 8, 6);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.lineTo(0, this.height / 3);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fillStyle = '#4fd8e8';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, this.height / 3 + 3, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff7a52';
      ctx.fill();
    }
    ctx.restore();
  }
}

class Obstacle {
  constructor(speedMultiplier, isHoming = false) {
    const isMobile = W < 600;
    const scale = isMobile ? 0.65 : 1.0;
    this.radius = (isHoming ? 15 : 11 + Math.random() * 9) * scale;
    this.x = Math.random() * (W - 60) + 30;
    this.y = -this.radius - 20;
    this.speedMultiplier = speedMultiplier;
    this.isHoming = isHoming;

    this.vy = (2.4 + Math.random() * 1.5) * speedMultiplier;
    this.vx = (Math.random() - 0.5) * (speedMultiplier > 1.4 ? 2.0 : 0.6);
  }

  update() {
    if (this.isHoming && typeof player !== 'undefined') {
      const targetDx = player.x - this.x;
      const targetDy = player.y - this.y;
      const targetDist = Math.hypot(targetDx, targetDy) || 1;
      
      const targetSpeed = (2.6 + Math.random() * 0.8) * this.speedMultiplier;
      const idealVx = (targetDx / targetDist) * targetSpeed;
      const idealVy = Math.max(2.0, (targetDy / targetDist) * targetSpeed);

      this.vx += (idealVx - this.vx) * 0.05;
      this.vy += (idealVy - this.vy) * 0.05;
    }

    this.y += this.vy;
    this.x += this.vx;

    if (this.x < this.radius || this.x > W - this.radius) {
      this.vx *= -1;
    }
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (isClassicMode) {
      const size = this.radius * 2;
      ctx.fillStyle = this.isHoming ? '#ff00ff' : '#ff0000';
      ctx.fillRect(-this.radius, -this.radius, size, size);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(-this.radius, -this.radius, size, size);
    } else {
      if (this.isHoming) {
        ctx.fillStyle = 'rgba(255, 0, 102, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(238, 34, 34, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ee2222';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.2, this.radius * 0.2, this.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class Collectible {
  constructor(speedMultiplier, forcedX = null) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 15;
    this.x = forcedX !== null ? forcedX : Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (2.2 + Math.random() * 2.0) * (1 + score * 0.003);
    this.pulse = Math.random() * Math.PI;
  }

  update() {
    if (magnetTimer > 0 && typeof player !== 'undefined') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.x += (dx / dist) * 11.0;
      this.y += (dy / dist) * 11.0;
    } else {
      this.y += this.vy;
    }
    this.pulse += 0.06;
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (isClassicMode) {
      const size = this.radius * 1.75;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      if (isLogoLoaded) {
        ctx.drawImage(logoImg, -size / 2 + 2, -size / 2 + 2, size - 4, size - 4);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px Tahoma';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PA', 0, 0);
      }
    } else {
      const scale = 1 + Math.sin(this.pulse) * 0.06;
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e1a';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isLogoLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, -this.radius + 2, -this.radius + 2, (this.radius - 2) * 2, (this.radius - 2) * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = '700 10px Sora';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PA', 0, 0);
      }
    }
    ctx.restore();
  }
}

class ShieldPowerup {
  constructor(speedMultiplier) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 14;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (1.8 + Math.random() * 1.0) * speedMultiplier;
  }
  update() { this.y += this.vy; }
  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (isClassicMode) {
      const size = this.radius * 1.6;
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Tahoma';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, 0);
    } else {
      ctx.fillStyle = '#5b8cff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class MagnetPowerup {
  constructor(speedMultiplier) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 14;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (2.0 + Math.random() * 1.2) * speedMultiplier;
  }
  update() { this.y += this.vy; }
  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (isClassicMode) {
      const size = this.radius * 1.6;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Tahoma';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 0);
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#040408';
      ctx.font = '800 11px Sora';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 0);
    }
    ctx.restore();
  }
}

class RainPowerup {
  constructor(speedMultiplier) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 15;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (1.9 + Math.random() * 1.2) * speedMultiplier;
    this.rotation = 0;
  }
  update() {
    this.y += this.vy;
    this.rotation += 0.04;
  }
  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (isClassicMode) {
      const size = this.radius * 1.6;
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Tahoma';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', 0, 0);
    } else {
      ctx.fillStyle = '#d946ef';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.radius, Math.sin((18 + i * 72) * Math.PI / 180) * this.radius);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.radius / 2), Math.sin((54 + i * 72) * Math.PI / 180) * (this.radius / 2));
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

let player = new Player();
let obstacles = [];
let collectibles = [];
let shieldPowerups = [];
let magnetPowerups = [];
let rainPowerups = [];
let effectParticles = [];
let spawnCounter = 0;

function handleInput(e) {
  if (!isPlaying || typeof player === 'undefined' || !player) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  player.targetX = clientX;
  player.targetY = clientY;
}

window.addEventListener('mousemove', handleInput);
window.addEventListener('touchstart', handleInput);
window.addEventListener('touchmove', handleInput);

window.addEventListener('keydown', (e) => {
  if (!isPlaying || typeof player === 'undefined' || !player) return;
  const step = 28;
  if (e.key === 'ArrowLeft' || e.key === 'a') player.targetX -= step;
  if (e.key === 'ArrowRight' || e.key === 'd') player.targetX += step;
  if (e.key === 'ArrowUp' || e.key === 'w') player.targetY -= step;
  if (e.key === 'ArrowDown' || e.key === 's') player.targetY += step;
});

function getDifficulty() {
  if (score < 20) return { speed: 1.0, spawnRate: 46 };
  if (score < 50) return { speed: 1.3, spawnRate: 34 };
  if (score < 100) return { speed: 1.6, spawnRate: 26 };
  if (score < 200) return { speed: 1.9, spawnRate: 20 };
  return { speed: 2.2, spawnRate: 16 };
}

function gameLoop() {
  if (!isPlaying || !ctx) return;

  ctx.save();
  if (screenShake > 0) {
    const dx = (Math.random() - 0.5) * screenShake;
    const dy = (Math.random() - 0.5) * screenShake;
    ctx.translate(dx, dy);
    screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;
  }

  ctx.clearRect(0, 0, W, H);

  const diff = getDifficulty();
  spawnCounter++;

  if (spawnCounter % Math.max(4, Math.floor(diff.spawnRate)) === 0) {
    let isHoming = false;
    if (score >= 70 && score >= nextHomingScore) {
      isHoming = true;
      const interval = score >= 150 
        ? Math.floor(Math.random() * 4) + 3 
        : Math.floor(Math.random() * 8) + 4;
      nextHomingScore = score + interval;
    }
    obstacles.push(new Obstacle(diff.speed, isHoming));
  }

  if (coinRainTimer > 0) {
    coinRainTimer--;
    if (spawnCounter % 6 === 0) {
      collectibles.push(new Collectible(diff.speed));
    }
  } else {
    if (spawnCounter % 48 === 0) {
      collectibles.push(new Collectible(diff.speed));
    }
  }

  if (score > 0 && score % 20 === 0 && score !== lastShieldScore) {
    lastShieldScore = score;
    shieldPowerups.push(new ShieldPowerup(diff.speed));
    if (Math.random() > 0.3) {
      magnetPowerups.push(new MagnetPowerup(diff.speed));
    }
  }

  if (score > 0 && score % 50 === 0 && score !== lastRainScore) {
    lastRainScore = score;
    rainPowerups.push(new RainPowerup(diff.speed));
  }

  player.update();
  player.draw();

  for (let i = effectParticles.length - 1; i >= 0; i--) {
    effectParticles[i].update();
    effectParticles[i].draw();
    if (effectParticles[i].alpha <= 0) effectParticles.splice(i, 1);
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();
    obs.draw();

    const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
    if (dist < obs.radius + player.width / 2.2) {
      if (shieldTimer > 0) {
        SoundEngine.playHit();
        screenShake = 10;
        effectParticles.push(new VisualParticles(obs.x, obs.y, 'rgba(91, 140, 255, 0.4)'));
        obstacles.splice(i, 1);
        continue;
      }

      if (invulnerableTimer === 0) {
        lives--;
        renderLives();
        SoundEngine.playHit();
        screenShake = 18;
        effectParticles.push(new VisualParticles(player.x, player.y, 'rgba(255, 82, 82, 0.5)'));
        invulnerableTimer = 60;
        obstacles.splice(i, 1);

        if (lives <= 0) {
          endGame();
          ctx.restore();
          return;
        }
        continue;
      }
    }

    if (obs.y > H + 50) obstacles.splice(i, 1);
  }

  for (let i = collectibles.length - 1; i >= 0; i--) {
    const item = collectibles[i];
    item.update();
    item.draw();

    const dist = Math.hypot(player.x - item.x, player.y - item.y);
    if (dist < item.radius + player.width / 2) {
      score++;
      SoundEngine.playCoin();
      if (scoreVal) scoreVal.textContent = score;
      collectibles.splice(i, 1);
      continue;
    }

    if (item.y > H + 50) collectibles.splice(i, 1);
  }

  for (let i = shieldPowerups.length - 1; i >= 0; i--) {
    const p = shieldPowerups[i];
    p.update();
    p.draw();

    const dist = Math.hypot(player.x - p.x, player.y - p.y);
    if (dist < p.radius + player.width / 2) {
      SoundEngine.playPowerup();
      shieldTimer = 600;
      shieldPowerups.splice(i, 1);
      continue;
    }

    if (p.y > H + 50) shieldPowerups.splice(i, 1);
  }

  for (let i = magnetPowerups.length - 1; i >= 0; i--) {
    const m = magnetPowerups[i];
    m.update();
    m.draw();

    const dist = Math.hypot(player.x - m.x, player.y - m.y);
    if (dist < m.radius + player.width / 2) {
      SoundEngine.playPowerup();
      magnetTimer = 300;
      magnetPowerups.splice(i, 1);
      continue;
    }

    if (m.y > H + 50) magnetPowerups.splice(i, 1);
  }

  for (let i = rainPowerups.length - 1; i >= 0; i--) {
    const r = rainPowerups[i];
    r.update();
    r.draw();

    const dist = Math.hypot(player.x - r.x, player.y - r.y);
    if (dist < r.radius + player.width / 2) {
      SoundEngine.playPowerup();
      coinRainTimer = 180;
      rainPowerups.splice(i, 1);
      continue;
    }

    if (r.y > H + 50) rainPowerups.splice(i, 1);
  }

  ctx.restore();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  lives = 3;
  invulnerableTimer = 0;
  shieldTimer = 0;
  magnetTimer = 0;
  coinRainTimer = 0;
  lastShieldScore = 0;
  lastRainScore = 0;
  nextHomingScore = 70;
  screenShake = 0;

  if (scoreVal) scoreVal.textContent = '0';
  renderLives();

  obstacles = [];
  collectibles = [];
  shieldPowerups = [];
  magnetPowerups = [];
  rainPowerups = [];
  effectParticles = [];
  spawnCounter = 0;
  
  W = window.innerWidth || 360;
  H = window.innerHeight || 640;
  player = new Player();

  if (countdownInterval) clearInterval(countdownInterval);
  if (gameOverScreen) gameOverScreen.classList.remove('active');
  isPlaying = true;

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  gameLoop();
}

function endGame() {
  isPlaying = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  let isNewHighScore = score > highScore;
  if (isNewHighScore) {
    highScore = score;
    try {
      localStorage.setItem('minigame_highscore', highScore.toString());
    } catch (e) {}
    if (highScoreVal) highScoreVal.textContent = highScore;
  }

  sendTelemetryData(score);
  fetchAndRenderLeaderboard();

  if (finalScoreVal) finalScoreVal.textContent = score;
  if (finalHighScoreVal) finalHighScoreVal.textContent = highScore;

  if (gameOverScreen) gameOverScreen.classList.add('active');

  autoExitTime = 5;
  if (exitBtn) exitBtn.textContent = `EXIT TO SITE (${autoExitTime}s)`;

  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    autoExitTime--;
    if (exitBtn) exitBtn.textContent = `EXIT TO SITE (${autoExitTime}s)`;
    if (autoExitTime <= 0) {
      clearInterval(countdownInterval);
      window.location.replace('../index.html');
    }
  }, 1000);
}

if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    startGame();
  });
}

if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    window.location.replace('../index.html');
  });
}

startGame();