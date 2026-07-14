/* ============================= GAME INITIALIZATION & ACCESS CONTROL ============================= */
if (sessionStorage.getItem('minigame_access') !== 'true') {
  window.location.replace('../index.html');
} else {
  sessionStorage.removeItem('minigame_access');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const isClassicMode = localStorage.getItem('site_mode') === 'classic';
if (isClassicMode) {
  document.body.classList.add('classic-mode');
}

const scoreVal = document.getElementById('scoreVal');
const highScoreVal = document.getElementById('highScoreVal');
const livesContainer = document.getElementById('livesContainer');
const gameOverScreen = document.getElementById('gameOverScreen');

let W = window.innerWidth;
let H = window.innerHeight;
let isPlaying = false;
let animationFrameId = null;

let score = 0;
let lives = 3;
let invulnerableTimer = 0;
let shieldTimer = 0;
let magnetTimer = 0;

let lastShieldScore = 0;
let nextHomingScore = 70;

let highScore = parseInt(localStorage.getItem('minigame_highscore') || '0', 10);
if (highScoreVal) highScoreVal.textContent = highScore;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
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

/* ============================= GAME CLASSES ============================= */
class Player {
  constructor() {
    const isMobile = W < 600;
    this.width = isMobile ? 22 : 28;
    this.height = isMobile ? 28 : 34;
    this.x = W / 2;
    this.y = H - 120;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 0.22;
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
    if (magnetTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (isClassicMode) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.height, -this.height, this.height * 2, this.height * 2);
      } else {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 1.05, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.fill();
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
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#5b8cff';
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 0.95, 0, Math.PI * 2);
        ctx.strokeStyle = '#5b8cff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, this.height * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(91, 140, 255, 0.15)';
        ctx.fill();
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
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#4fd8e8';

      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.lineTo(0, this.height / 3);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();

      ctx.fillStyle = '#4fd8e8';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, this.height / 3 + 3, 3 + Math.random() * 3, 0, Math.PI * 2);
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
    this.radius = (isHoming ? 15 : 12 + Math.random() * 10) * scale;
    this.x = Math.random() * (W - 60) + 30;
    this.y = -this.radius - 20;
    this.speedMultiplier = speedMultiplier;
    this.isHoming = isHoming;

    this.vy = (2.2 + Math.random() * 2) * speedMultiplier;
    this.vx = (Math.random() - 0.5) * (speedMultiplier > 1.4 ? 2.5 : 0.8);
    this.retargetTimer = 0;
  }

  update() {
    if (this.isHoming && typeof player !== 'undefined') {
      this.retargetTimer++;
      if (this.retargetTimer % 60 === 1) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = (2.5 + Math.random() * 1.2) * this.speedMultiplier;
        this.vx = (dx / dist) * speed;
        this.vy = Math.max(1.8, (dy / dist) * speed);
      }
    }

    this.y += this.vy;
    this.x += this.vx;

    if (this.x < this.radius || this.x > W - this.radius) {
      this.vx *= -1;
    }
  }

  draw() {
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
      const grad = ctx.createRadialGradient(
        -this.radius * 0.3,
        -this.radius * 0.3,
        this.radius * 0.1,
        0,
        0,
        this.radius
      );

      if (this.isHoming) {
        grad.addColorStop(0, '#ff99dd');
        grad.addColorStop(0.3, '#ff0055');
        grad.addColorStop(0.85, '#990033');
        grad.addColorStop(1, '#4a0011');
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(255, 0, 85, 0.8)';
      } else {
        grad.addColorStop(0, '#ff8888');
        grad.addColorStop(0.3, '#ff2222');
        grad.addColorStop(0.85, '#990000');
        grad.addColorStop(1, '#4a0000');
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 34, 34, 0.5)';
      }

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.restore();
  }
}

class Collectible {
  constructor(speedMultiplier) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 16;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (2.0 + Math.random() * 2.5) * (1 + score * 0.005);
    this.pulse = Math.random() * Math.PI;
  }

  update() {
    if (magnetTimer > 0 && typeof player !== 'undefined') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.x += (dx / dist) * 10;
      this.y += (dy / dist) * 10;
    } else {
      this.y += this.vy;
    }
    this.pulse += 0.06;
  }

  draw() {
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
      const scale = 1 + Math.sin(this.pulse) * 0.08;
      ctx.scale(scale, scale);

      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffd700';

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e1a';
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffd700';
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
        ctx.font = '700 11px Sora';
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
    this.radius = isMobile ? 12 : 15;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (1.8 + Math.random() * 1.2) * speedMultiplier;
    this.pulse = 0;
  }

  update() {
    this.y += this.vy;
    this.pulse += 0.08;
  }

  draw() {
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
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#5b8cff';

      ctx.beginPath();
      ctx.arc(0, 0, this.radius + Math.sin(this.pulse) * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(91, 140, 255, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#5b8cff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-3, -3, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }
}

class MagnetPowerup {
  constructor(speedMultiplier) {
    const isMobile = W < 600;
    this.radius = isMobile ? 12 : 15;
    this.x = Math.random() * (W - 80) + 40;
    this.y = -this.radius - 20;
    this.vy = (2.0 + Math.random() * 1.5) * speedMultiplier;
    this.pulse = 0;
  }

  update() {
    this.y += this.vy;
    this.pulse += 0.1;
  }

  draw() {
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
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffd700';

      ctx.beginPath();
      ctx.arc(0, 0, this.radius + Math.sin(this.pulse) * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();

      ctx.fillStyle = '#040408';
      ctx.font = '800 12px Sora';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 0);
    }

    ctx.restore();
  }
}

/* ============================= GAME STATE & LOOP ============================= */
let player = new Player();
let obstacles = [];
let collectibles = [];
let shieldPowerups = [];
let magnetPowerups = [];
let spawnCounter = 0;

function getDifficulty() {
  if (score < 15) return { speed: 1.0, spawnRate: 40 };
  if (score < 30) return { speed: 1.6, spawnRate: 26 };
  if (score < 60) return { speed: 2.4, spawnRate: 18 };
  
  const extra = score - 60;
  return {
    speed: 2.4 + extra * 0.045,
    spawnRate: Math.max(5, 18 - extra * 0.18)
  };
}

function handleInput(e) {
  if (!isPlaying) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  player.targetX = clientX;
  player.targetY = clientY;
}

window.addEventListener('mousemove', handleInput);
window.addEventListener('touchmove', handleInput, { passive: true });

window.addEventListener('keydown', (e) => {
  if (!isPlaying) return;
  const step = 28;
  if (e.key === 'ArrowLeft' || e.key === 'a') player.targetX -= step;
  if (e.key === 'ArrowRight' || e.key === 'd') player.targetX += step;
  if (e.key === 'ArrowUp' || e.key === 'w') player.targetY -= step;
  if (e.key === 'ArrowDown' || e.key === 's') player.targetY += step;
});

function gameLoop() {
  if (!isPlaying) return;

  ctx.clearRect(0, 0, W, H);

  const diff = getDifficulty();
  spawnCounter++;

  if (spawnCounter % Math.max(4, Math.floor(diff.spawnRate)) === 0) {
    let isHoming = false;
    if (score >= 70 && score >= nextHomingScore) {
      isHoming = true;
      const interval = score >= 150 
        ? Math.floor(Math.random() * 3) + 2 
        : Math.floor(Math.random() * 8) + 3;
      nextHomingScore = score + interval;
    }
    obstacles.push(new Obstacle(diff.speed, isHoming));
  }

  if (spawnCounter % 48 === 0) {
    collectibles.push(new Collectible(diff.speed));
  }

  if (score > 0 && score % 20 === 0 && score !== lastShieldScore) {
    lastShieldScore = score;
    shieldPowerups.push(new ShieldPowerup(diff.speed));
    if (Math.random() > 0.3) {
      magnetPowerups.push(new MagnetPowerup(diff.speed));
    }
  }

  player.update();
  player.draw();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();
    obs.draw();

    const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
    if (dist < obs.radius + player.width / 2.2) {
      if (shieldTimer > 0) {
        obstacles.splice(i, 1);
        continue;
      }

      if (invulnerableTimer === 0) {
        lives--;
        renderLives();
        invulnerableTimer = 60;
        obstacles.splice(i, 1);

        if (lives <= 0) {
          endGame();
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
      magnetTimer = 300;
      magnetPowerups.splice(i, 1);
      continue;
    }

    if (m.y > H + 50) magnetPowerups.splice(i, 1);
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  lives = 3;
  invulnerableTimer = 0;
  shieldTimer = 0;
  magnetTimer = 0;
  lastShieldScore = 0;
  nextHomingScore = 70;

  if (scoreVal) scoreVal.textContent = '0';
  renderLives();

  obstacles = [];
  collectibles = [];
  shieldPowerups = [];
  magnetPowerups = [];
  spawnCounter = 0;
  player = new Player();

  if (gameOverScreen) gameOverScreen.classList.remove('active');
  isPlaying = true;

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  gameLoop();
}

function endGame() {
  isPlaying = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('minigame_highscore', highScore.toString());
    if (highScoreVal) highScoreVal.textContent = highScore;
  }

  if (gameOverScreen) gameOverScreen.classList.add('active');

  setTimeout(() => {
    window.location.replace('../index.html');
  }, 1500);
}

startGame();