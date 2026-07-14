import { translations } from './translations.js';
import { getLanguage } from './i18n.js';

export function initSecret() {
  const secretSection = document.getElementById('secretSection');
  const scoreEl = secretSection?.querySelector('.secret-score');
  const hintEl = document.getElementById('secretHint');
  if (!secretSection) return;

  function updateScoreDisplay() {
    const savedScore = parseInt(localStorage.getItem('minigame_highscore') || '0', 10);
    if (scoreEl) {
      scoreEl.textContent = savedScore;
    }
    if (hintEl) {
      const lang = getLanguage();
      if (savedScore === 0) {
        hintEl.textContent = translations[lang]?.secret?.hint || '';
        hintEl.style.display = 'block';
      } else {
        hintEl.style.display = 'none';
      }
    }
  }

  let pullAttempts = 0;
  let peekTimer = null;
  let isOpen = false;
  let lastPullTime = 0;

  function isAtBottom() {
    return (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 10);
  }

  function closeSecret() {
    isOpen = false;
    pullAttempts = 0;
    secretSection.classList.remove('open', 'peek');
    if (peekTimer) clearTimeout(peekTimer);
  }

  function handlePullAttempt() {
    if (isOpen) return;

    pullAttempts++;
    secretSection.classList.add('peek');

    if (peekTimer) clearTimeout(peekTimer);

    if (pullAttempts >= 3) {
      isOpen = true;
      updateScoreDisplay();
      secretSection.classList.remove('peek');
      secretSection.classList.add('open');
    } else {
      peekTimer = setTimeout(() => {
        secretSection.classList.remove('peek');
        pullAttempts = 0;
      }, 600);
    }
  }

  window.addEventListener('wheel', (e) => {
    if (isAtBottom()) {
      if (e.deltaY > 0) {
        const now = Date.now();
        if (now - lastPullTime > 220) {
          lastPullTime = now;
          handlePullAttempt();
        }
      } else if (e.deltaY < 0) {
        closeSecret();
      }
    } else {
      closeSecret();
    }
  }, { passive: true });

  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isAtBottom()) {
      closeSecret();
      return;
    }

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (deltaY > 40) {
      handlePullAttempt();
    } else if (deltaY < -15) {
      closeSecret();
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (!isAtBottom() && isOpen) {
      closeSecret();
    }
  }, { passive: true });

  window.addEventListener('languageChanged', updateScoreDisplay);

  updateScoreDisplay();
}