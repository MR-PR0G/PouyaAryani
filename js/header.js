import { setLanguage } from './i18n.js';

export function initHeader() {
  const settingsWrapper = document.getElementById('settingsWrapper');
  const settingsBtn = document.getElementById('settingsBtn');
  const themeDots = document.querySelectorAll('.theme-dot');
  const flagIcons = document.querySelectorAll('.flag-icon');

  const modeDefaultBtn = document.getElementById('modeDefaultBtn');
  const modeClassicBtn = document.getElementById('modeClassicBtn');
  const classicStylesheet = document.getElementById('classicStylesheet');

  const navDropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
  const navSectionSelector = document.querySelector('.nav-section-selector');
  const dropdownLinks = document.querySelectorAll('.nav-dropdown-menu a');
  const currentLabel = document.getElementById('currentSectionLabel');

  const logoCircle = document.querySelector('.logo-circle');
  let logoClickCount = 0;
  let logoClickTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const savedMode = localStorage.getItem('site_mode') || 'default';
  if (savedMode === 'classic') {
    modeClassicBtn?.classList.add('active');
    modeDefaultBtn?.classList.remove('active');
    if (classicStylesheet) classicStylesheet.disabled = false;
  }

  logoCircle?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  }, { passive: true });

  logoCircle?.addEventListener('touchmove', (e) => {
    const moveX = Math.abs(e.touches[0].clientX - touchStartX);
    const moveY = Math.abs(e.touches[0].clientY - touchStartY);
    if (moveX > 8 || moveY > 8) {
      touchMoved = true;
    }
  }, { passive: true });

  logoCircle?.addEventListener('click', (e) => {
    if (touchMoved) return;

    logoClickCount++;
    if (logoClickTimer) clearTimeout(logoClickTimer);

    if (logoClickCount === 3) {
      logoClickCount = 0;
      triggerMinigameTransition();
    } else {
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
      }, 400);
    }
  });

  function triggerMinigameTransition() {
    sessionStorage.setItem('minigame_access', 'true');

    const rect = logoCircle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const overlay = document.createElement('div');
    overlay.className = 'minigame-transition-overlay';
    overlay.style.left = `${centerX}px`;
    overlay.style.top = `${centerY}px`;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('expand');
    });

    setTimeout(() => {
      window.location.replace('minigame/index.html');
    }, 750);
  }

  settingsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navDropdownWrapper?.classList.remove('open');
    settingsWrapper?.classList.toggle('active');
  });

  flagIcons.forEach((flag) => {
    flag.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = flag.getAttribute('data-lang');
      if (lang) {
        setLanguage(lang);
      }
    });
  });

  modeDefaultBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    modeDefaultBtn.classList.add('active');
    modeClassicBtn?.classList.remove('active');
    if (classicStylesheet) classicStylesheet.disabled = true;
    localStorage.setItem('site_mode', 'default');
  });

  modeClassicBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    modeClassicBtn.classList.add('active');
    modeDefaultBtn?.classList.remove('active');
    if (classicStylesheet) classicStylesheet.disabled = false;
    localStorage.setItem('site_mode', 'classic');
  });

  themeDots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedTheme = dot.getAttribute('data-theme');
      if (!selectedTheme) return;

      themeDots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');

      document.documentElement.setAttribute('data-theme', selectedTheme);
    });
  });

  navSectionSelector?.addEventListener('click', (e) => {
    if (e.target.closest('.nav-arrow-btn')) return;
    e.stopPropagation();
    settingsWrapper?.classList.remove('active');
    navDropdownWrapper?.classList.toggle('open');
  });

  dropdownLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }

      navDropdownWrapper?.classList.remove('open');

      if (navDropdownWrapper) {
        navDropdownWrapper.style.pointerEvents = 'none';
        setTimeout(() => {
          navDropdownWrapper.style.pointerEvents = '';
        }, 400);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (settingsWrapper && !settingsWrapper.contains(e.target)) {
      settingsWrapper.classList.remove('active');
    }
    if (navDropdownWrapper && !navDropdownWrapper.contains(e.target)) {
      navDropdownWrapper.classList.remove('open');
    }
  });

  const navPrevBtn = document.getElementById('navPrevBtn');
  const navNextBtn = document.getElementById('navNextBtn');
  const sections = ['home', 'about', 'projects', 'skills', 'achievements', 'contact'];

  function getCurrentIndex() {
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      return sections.indexOf('contact');
    }
    const activeLink = document.querySelector('.nav-dropdown-menu a.active');
    if (!activeLink) return 0;
    const id = activeLink.getAttribute('href')?.replace('#', '');
    const idx = sections.indexOf(id);
    return idx !== -1 ? idx : 0;
  }

  navPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentIdx = getCurrentIndex();
    const prevIdx = (currentIdx - 1 + sections.length) % sections.length;
    const targetEl = document.getElementById(sections[prevIdx]);
    targetEl?.scrollIntoView({ behavior: 'smooth' });
  });

  navNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentIdx = getCurrentIndex();
    const nextIdx = (currentIdx + 1) % sections.length;
    const targetEl = document.getElementById(sections[nextIdx]);
    targetEl?.scrollIntoView({ behavior: 'smooth' });
  });

  const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -30% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;

        dropdownLinks.forEach((link) => {
          const href = link.getAttribute('href')?.replace('#', '');
          if (href === activeId) {
            link.classList.add('active');
            if (currentLabel) {
              currentLabel.textContent = link.textContent.trim();
            }
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sectionElements.forEach((sec) => observer.observe(sec));
}