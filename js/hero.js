import { getLanguage } from './i18n.js';
import { loadHeroConfig } from './configLoader.js';

const MATRIX_CHARS = "アイウエオカキクケコサシスセソ0123456789!@#$%^&*<>/\\|=+~ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function randChar() {
  return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
}

function matrixDecode(el, text, { duration = 1600, stagger = 45 } = {}) {
  return new Promise(resolve => {
    if (reduceMotion) {
      el.innerHTML = '';
      [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'glyph' + (ch === ' ' ? ' space' : '');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
      resolve();
      return;
    }
    const chars = [...text];
    el.innerHTML = '';
    const spans = chars.map(ch => {
      const span = document.createElement('span');
      span.className = 'glyph' + (ch === ' ' ? ' space' : '');
      span.textContent = ch === ' ' ? '\u00A0' : randChar();
      el.appendChild(span);
      return span;
    });

    let resolved = 0;
    spans.forEach((span, i) => {
      if (chars[i] === ' ') {
        resolved++;
        if (resolved === spans.length) resolve();
        return;
      }
      const revealAt = i * stagger + Math.random() * 120;
      const scrambleInterval = setInterval(() => {
        span.textContent = randChar();
      }, 38);
      setTimeout(() => {
        clearInterval(scrambleInterval);
        span.textContent = chars[i];
        span.style.textShadow = '0 0 12px currentColor';
        setTimeout(() => span.style.textShadow = '', 220);
        resolved++;
        if (resolved === spans.length) resolve();
      }, revealAt + duration * 0.35);
    });
  });
}

function fadeTransition(el, text) {
  return new Promise(resolve => {
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = text;
      el.style.opacity = '1';
      setTimeout(resolve, 400);
    }, 400);
  });
}

export async function initHero() {
  const heroNameEl = document.getElementById('heroName');
  const subtitleEl = document.getElementById('heroSubtitle');
  const heroTagEl = document.querySelector('.hero-tag');
  if (!heroNameEl) return;

  const heroConfig = await loadHeroConfig();

  let nameIndex = 0;
  let subIndex = 0;
  let nameInterval = null;
  let subInterval = null;

  function getHeroNames() {
    const lang = getLanguage();
    if (heroConfig && heroConfig.names && heroConfig.names[lang]) {
      return heroConfig.names[lang];
    }
    return lang === 'fa' ? ["پویا آریانی", "مستر پروگ"] : ["POUYA ARYANI", "MR PROG"];
  }

  function getSubtitles() {
    const lang = getLanguage();
    if (heroConfig && heroConfig.subtitles && heroConfig.subtitles[lang]) {
      return heroConfig.subtitles[lang];
    }
    return lang === 'fa'
      ? ["توسعه‌دهنده Rust", "علاقه‌مند به لینوکس", "مهندس بک‌اند", "توسعه‌دهنده متن‌باز"]
      : ["Rust Developer", "Linux Enthusiast", "Backend Engineer", "Open Source Developer"];
  }

  function updateTag() {
    if (!heroTagEl) return;
    const lang = getLanguage();
    if (heroConfig && heroConfig.tag && heroConfig.tag[lang]) {
      heroTagEl.textContent = heroConfig.tag[lang];
    }
  }

  function lockHeroWidth() {
    const names = getHeroNames();
    const probe = document.createElement('span');
    probe.style.cssText = getComputedStyle(heroNameEl).cssText;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    probe.style.fontFamily = getComputedStyle(heroNameEl).fontFamily;
    probe.style.fontSize = getComputedStyle(heroNameEl).fontSize;
    probe.style.fontWeight = getComputedStyle(heroNameEl).fontWeight;
    document.body.appendChild(probe);

    let max = 0;
    names.forEach(n => {
      probe.textContent = n;
      max = Math.max(max, probe.offsetWidth);
    });
    document.body.removeChild(probe);
    heroNameEl.style.display = 'inline-block';
    heroNameEl.style.minWidth = (max + 10) + 'px';
  }

  function startNameRotation() {
    if (nameInterval) clearInterval(nameInterval);
    const names = getHeroNames();
    const lang = getLanguage();
    nameIndex = 0;
    lockHeroWidth();
    updateTag();

    if (lang === 'fa') {
      heroNameEl.textContent = names[0];
      heroNameEl.style.opacity = '1';
    } else {
      matrixDecode(heroNameEl, names[0], { duration: 1500, stagger: 40 });
    }

    nameInterval = setInterval(async () => {
      const currentNames = getHeroNames();
      const currentLang = getLanguage();
      nameIndex = (nameIndex + 1) % currentNames.length;

      if (currentLang === 'fa') {
        await fadeTransition(heroNameEl, currentNames[nameIndex]);
      } else {
        await matrixDecode(heroNameEl, currentNames[nameIndex], { duration: 1100, stagger: 35 });
      }
    }, 5000);
  }

  function startSubtitleRotation() {
    if (!subtitleEl) return;
    if (subInterval) clearInterval(subInterval);
    const subs = getSubtitles();
    subIndex = 0;
    subtitleEl.textContent = subs[0];

    subInterval = setInterval(() => {
      const currentSubs = getSubtitles();
      subtitleEl.style.transition = 'opacity .5s ease';
      subtitleEl.style.opacity = '0';
      setTimeout(() => {
        subIndex = (subIndex + 1) % currentSubs.length;
        subtitleEl.textContent = currentSubs[subIndex];
        subtitleEl.style.opacity = '1';
      }, 500);
    }, 3400);
  }

  startNameRotation();
  startSubtitleRotation();

  window.addEventListener('languageChanged', () => {
    startNameRotation();
    startSubtitleRotation();
  });

  initBgCanvas();
}

function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SNIPPETS = [
    "let mut v: Vec<i32> = Vec::new();",
    "impl Iterator for Stream<T> {",
    "fn main() -> Result<(), Error> {",
    "match res { Ok(v) => v, Err(e) => panic!() }",
    "pub struct Config { pub port: u16 }",
    "cargo build --release",
    "async fn handle(req: Request) -> Response {",
    "go func() { defer wg.Done() }()",
    "func main() { fmt.Println(\"ok\") }",
    "select { case <-ctx.Done(): return }",
    "ch := make(chan int, 10)",
    "#include <iostream>",
    "systemctl restart nginx.service",
    "docker run -d -p 8080:8080 app:latest",
    "kubectl apply -f deployment.yaml",
    "SELECT id, name FROM users WHERE active = true;",
    "git commit -m \"fix: race condition in pool\"",
    "wl_display_dispatch(display);"
  ];

  let W, H, dpr;
  const isSmallScreen = () => window.innerWidth < 720;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen() ? 1.2 : 1.5);
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getAccentColors() {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    return [
      cs.getPropertyValue('--cyan').trim() || '#4fd8e8',
      cs.getPropertyValue('--blue').trim() || '#5b8cff',
      cs.getPropertyValue('--violet').trim() || '#b366ff'
    ];
  }

  const MONO_FONT = getComputedStyle(document.body).getPropertyValue('--font-mono').trim() || "'JetBrains Mono', monospace";

  class FloatCode {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.text = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
      this.depth = 0.35 + Math.random() * 0.9;
      this.size = (10 + Math.random() * 6) * this.depth * dpr;
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + this.size;
      this.vy = -(0.15 + Math.random() * 0.25) * this.depth * dpr;
      this.vx = (Math.random() - 0.5) * 0.05 * dpr;
      this.opacity = 0.08 + Math.random() * 0.16 * this.depth;
      this.colorIndex = Math.floor(Math.random() * 3);
      const firstSpace = this.text.indexOf(' ');
      this.head = firstSpace === -1 ? this.text : this.text.slice(0, firstSpace);
      this.tail = firstSpace === -1 ? '' : this.text.slice(firstSpace);
      ctx.font = `${this.size}px ${MONO_FONT}`;
      this.w = ctx.measureText(this.text).width;
      this.headW = ctx.measureText(this.head).width;
    }
  }

  let codeLines = [];
  function initWords() {
    const count = isSmallScreen() ? 14 : 28;
    codeLines = Array.from({ length: count }, () => new FloatCode());
  }
  initWords();

  let bgPaused = false;
  document.addEventListener('visibilitychange', () => {
    bgPaused = document.hidden;
  });

  function drawWords() {
    if (!bgPaused) {
      ctx.clearRect(0, 0, W, H);
      const currentColors = getAccentColors();
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const alphaMultiplier = isLight ? 3.5 : 1.8;

      codeLines.forEach(w => {
        w.y += w.vy;
        w.x += w.vx;
        if (w.y < -30) w.reset(false);
        if (w.x < -w.w - 40) w.x = W + 40;
        if (w.x > W + 40) w.x = -w.w - 40;

        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.font = `${w.size}px ${MONO_FONT}`;
        ctx.globalAlpha = Math.min(1, w.opacity * alphaMultiplier);
        ctx.fillStyle = currentColors[w.colorIndex] || currentColors[0];
        ctx.fillText(w.head, 0, 0);
        ctx.globalAlpha = Math.min(1, w.opacity * (alphaMultiplier * 0.7));
        ctx.fillText(w.tail, w.headW, 0);
        ctx.restore();
      });
    }
    requestAnimationFrame(drawWords);
  }

  if (!reduceMotion) requestAnimationFrame(drawWords);
}