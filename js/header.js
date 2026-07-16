import { setLanguage } from './i18n.js';

export function initHeader() {
  const settingsWrapper = document.getElementById('settingsWrapper');
  const settingsBtn = document.getElementById('settingsBtn');
  const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
  const mobileContactCallBtn = document.getElementById('mobileContactCallBtn');
  const settingsDropdownMenu = document.getElementById('settingsDropdownMenu');

  const contactModal = document.getElementById('contactModal');
  const closeContactModal = document.getElementById('closeContactModal');

  const desktopToast = document.getElementById('desktopToast');
  const toastSwitchBtn = document.getElementById('toastSwitchBtn');
  const toastCloseBtn = document.getElementById('toastCloseBtn');

  const islandsExpandBtn = document.getElementById('islandsExpandBtn');
  const islandsAboutBox = document.getElementById('islandsAboutBox');
  const islandsSocialsRow = document.getElementById('islandsSocialsRow');

  const themeDots = document.querySelectorAll('.theme-dot');
  const flagIcons = document.querySelectorAll('.flag-icon');

  const modeDefaultBtn = document.getElementById('modeDefaultBtn');
  const modeClassicBtn = document.getElementById('modeClassicBtn');
  const modeIslandsBtn = document.getElementById('modeIslandsBtn') || document.getElementById('modeMobileBtn');

  const classicStylesheet = document.getElementById('classicStylesheet');

  const navDropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
  const navSectionSelector = document.querySelector('.nav-section-selector');
  const dropdownLinks = document.querySelectorAll('.nav-dropdown-menu a');
  const currentLabel = document.getElementById('currentSectionLabel');
  const mobileCurrentLabel = document.getElementById('mobileCurrentSectionLabel');

  const logoCircles = document.querySelectorAll('.logo-circle');
  let logoClickCount = 0;
  let logoClickTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  let currentSectionId = 'home';

  const sections = ['home', 'about', 'projects', 'achievements', 'contact'];
  const islandsSections = ['home', 'projects', 'achievements', 'score'];

  const sectionLabels = {
    fa: { home: 'خانه', projects: 'پروژه‌ها', achievements: 'دستآوردها', score: 'امتیاز', about: 'درباره من', contact: 'تماس' },
    en: { home: 'Home', projects: 'Projects', achievements: 'Achievements', score: 'Score', about: 'About', contact: 'Contact' }
  };

  function updateIslandsScore() {
    const scoreVal = document.getElementById('islandsScoreValue');
    if (scoreVal) {
      const savedScore = localStorage.getItem('minigame_score') || sessionStorage.getItem('minigame_score') || '0';
      scoreVal.textContent = savedScore;
    }
  }

  async function loadIslandsAboutConfig() {
    try {
      const res = await fetch('config/about/about.json');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const currentLang = localStorage.getItem('lang') || 'en';
      const lang = (currentLang === 'fa' || currentLang === 'fa-IR') ? 'fa' : 'en';

      const nameEl = document.querySelector('#islandsAboutBox .islands-about-info h3');
      if (nameEl && data.name) nameEl.textContent = data.name;

      const avatarFrame = document.querySelector('#islandsAboutBox .avatar-frame');
      if (avatarFrame && data.avatar) {
        avatarFrame.innerHTML = `<img src="${data.avatar}" alt="${data.name || 'Profile'}">`;
      }

      const roleEl = document.querySelector('#islandsAboutBox .role-line');
      if (roleEl && data.role) {
        roleEl.textContent = data.role[lang] || data.role['en'] || '';
      }

      const bioEl = document.querySelector('#islandsAboutBox p');
      if (bioEl && data.bio) {
        bioEl.textContent = data.bio[lang] || data.bio['en'] || '';
      }

      const badgesScroll = document.querySelector('#islandsSkillsScroll');
      if (badgesScroll && data.badges) {
        const badgesList = data.badges[lang] || data.badges['en'] || [];
        badgesScroll.innerHTML = badgesList.map(b => `<span>${b}</span>`).join('');
      }

      const desktopBadgesScroll = document.querySelector('#aboutSkillsScroll');
      if (desktopBadgesScroll && data.badges) {
        const badgesList = data.badges[lang] || data.badges['en'] || [];
        desktopBadgesScroll.innerHTML = badgesList.map(b => `<span>${b}</span>`).join('');
      }
    } catch (e) {}
  }

  async function loadIslandsLinks() {
    if (!islandsSocialsRow) return;

    const defaultLinks = [
      { title: "GitHub", icon: "github", url: "https://github.com/MR-PR0G" },
      { title: "Telegram", icon: "telegram", url: "https://t.me/MR_PR0G" },
      { title: "Email", icon: "mailto:pouya.aryani@example.com" }
    ];

    let links = defaultLinks;
    try {
      const res = await fetch('config/about/links.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.links) links = data.links;
      }
    } catch (e) {
      links = defaultLinks;
    }

    islandsSocialsRow.innerHTML = '';
    links.forEach(item => {
      const btn = document.createElement('a');
      btn.className = 'islands-social-btn';
      btn.href = item.url || '#';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';

      let iconSvg = '';
      if (item.icon === 'github') {
        iconSvg = `<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
      } else if (item.icon === 'telegram') {
        iconSvg = `<svg viewBox="0 0 24 24"><path d="M21.5 2L2 11.5l6 2.5L20 4.5l-10 11.5v5l4-3.5 5.5 3L22.5 2z"></path></svg>`;
      } else if (item.icon === 'email') {
        iconSvg = `<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      }

      btn.innerHTML = `${iconSvg} <span>${item.title}</span>`;
      islandsSocialsRow.appendChild(btn);
    });
  }

  loadIslandsAboutConfig();
  loadIslandsLinks();
  updateIslandsScore();

  islandsExpandBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = islandsAboutBox?.classList.toggle('expanded');
    islandsSocialsRow?.classList.toggle('about-expanded', isExpanded);
  });

  function updateIslandsSections(targetIndex) {
    islandsSections.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('islands-active', 'islands-prev');
      if (idx === targetIndex) {
        el.classList.add('islands-active');
      } else if (idx < targetIndex) {
        el.classList.add('islands-prev');
      }
    });
  }

  function checkDesktopRecommendation() {
    const currentMode = localStorage.getItem('site_mode') || 'islands';
    const isDesktop = window.innerWidth >= 768;
    const toastDismissed = sessionStorage.getItem('desktop_toast_dismissed');

    if (isDesktop && currentMode === 'islands' && !toastDismissed) {
      setTimeout(() => {
        desktopToast?.classList.add('show');
      }, 300);
    } else {
      desktopToast?.classList.remove('show');
    }
  }

  toastSwitchBtn?.addEventListener('click', () => {
    applyMode('default');
    desktopToast?.classList.remove('show');
    sessionStorage.setItem('desktop_toast_dismissed', 'true');
  });

  toastCloseBtn?.addEventListener('click', () => {
    desktopToast?.classList.remove('show');
    sessionStorage.setItem('desktop_toast_dismissed', 'true');
  });

  function applyMode(mode) {
    document.documentElement.setAttribute('data-nav-mode', mode);

    if (modeDefaultBtn) modeDefaultBtn.classList.toggle('active', mode === 'default');
    if (modeClassicBtn) modeClassicBtn.classList.toggle('active', mode === 'classic');
    if (modeIslandsBtn) modeIslandsBtn.classList.toggle('active', mode === 'islands');

    const islandRight = document.getElementById('islandRight') || document.querySelector('.island-right');

    if (mode === 'islands') {
      if (islandRight && settingsDropdownMenu && settingsDropdownMenu.parentElement !== islandRight) {
        islandRight.appendChild(settingsDropdownMenu);
      }
      currentSectionId = 'home';
      updateIslandsSections(0);
      updateActiveLabels('home');
    } else {
      if (settingsWrapper && settingsDropdownMenu && settingsDropdownMenu.parentElement !== settingsWrapper) {
        settingsWrapper.appendChild(settingsDropdownMenu);
      }
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('islands-active', 'islands-prev');
      });
      islandsAboutBox?.classList.remove('expanded');
      islandsSocialsRow?.classList.remove('about-expanded');
      currentSectionId = 'home';
      updateActiveLabels('home');
    }

    if (classicStylesheet) classicStylesheet.disabled = (mode !== 'classic');

    if (settingsDropdownMenu) {
      settingsDropdownMenu.classList.remove('active');
    }

    localStorage.setItem('site_mode', mode);
    checkDesktopRecommendation();
  }

  const savedMode = localStorage.getItem('site_mode') || 'islands';
  applyMode(savedMode);

  modeDefaultBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyMode('default');
  });

  modeClassicBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyMode('classic');
  });

  modeIslandsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyMode('islands');
  });

  logoCircles.forEach((circle) => {
    circle.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    }, { passive: true });

    circle.addEventListener('touchmove', (e) => {
      const moveX = Math.abs(e.touches[0].clientX - touchStartX);
      const moveY = Math.abs(e.touches[0].clientY - touchStartY);
      if (moveX > 8 || moveY > 8) {
        touchMoved = true;
      }
    }, { passive: true });

    circle.addEventListener('click', () => {
      if (touchMoved) return;
      if ((localStorage.getItem('site_mode') || 'islands') === 'islands') return;

      logoClickCount++;
      if (logoClickTimer) clearTimeout(logoClickTimer);

      if (logoClickCount === 3) {
        logoClickCount = 0;
        triggerMinigameTransition(circle);
      } else {
        logoClickTimer = setTimeout(() => {
          logoClickCount = 0;
        }, 400);
      }
    });
  });

  function triggerMinigameTransition(targetCircle) {
    sessionStorage.setItem('minigame_access', 'true');

    const rect = targetCircle.getBoundingClientRect();
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

  function toggleSettings(e) {
    e?.stopPropagation();
    navDropdownWrapper?.classList.remove('open');

    const currentMode = localStorage.getItem('site_mode') || 'islands';
    const islandRight = document.getElementById('islandRight') || document.querySelector('.island-right');

    if (currentMode === 'islands') {
      if (islandRight && settingsDropdownMenu && settingsDropdownMenu.parentElement !== islandRight) {
        islandRight.appendChild(settingsDropdownMenu);
      }
    } else {
      if (settingsWrapper && settingsDropdownMenu && settingsDropdownMenu.parentElement !== settingsWrapper) {
        settingsWrapper.appendChild(settingsDropdownMenu);
      }
    }

    if (settingsDropdownMenu) {
      settingsDropdownMenu.classList.toggle('active');
    }
  }

  settingsBtn?.addEventListener('click', toggleSettings);
  mobileSettingsBtn?.addEventListener('click', toggleSettings);

  mobileContactCallBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    contactModal?.classList.add('active');
  });

  closeContactModal?.addEventListener('click', () => {
    contactModal?.classList.remove('active');
  });

  contactModal?.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove('active');
    }
  });

  flagIcons.forEach((flag) => {
    flag.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = flag.getAttribute('data-lang');
      if (lang) {
        setLanguage(lang);
        loadIslandsAboutConfig();
        updateActiveLabels(currentSectionId);
      }
    });
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
    if (settingsDropdownMenu) settingsDropdownMenu.classList.remove('active');
    navDropdownWrapper?.classList.toggle('open');
  });

  dropdownLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (targetId) {
        navigateSectionTo(targetId);
      }
      navDropdownWrapper?.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (settingsDropdownMenu && !settingsDropdownMenu.contains(e.target) && !settingsBtn?.contains(e.target) && !mobileSettingsBtn?.contains(e.target)) {
      settingsDropdownMenu.classList.remove('active');
    }
    if (navDropdownWrapper && !navDropdownWrapper.contains(e.target)) {
      navDropdownWrapper.classList.remove('open');
    }
  });

  function getCurrentIndex() {
    const isIslands = (localStorage.getItem('site_mode') || 'islands') === 'islands';
    const activeSections = isIslands ? islandsSections : sections;
    const idx = activeSections.indexOf(currentSectionId);
    return idx !== -1 ? idx : 0;
  }

  function updateActiveLabels(activeId) {
    const currentLang = localStorage.getItem('lang') || 'en';
    const lang = (currentLang === 'fa' || currentLang === 'fa-IR') ? 'fa' : 'en';

    dropdownLinks.forEach((link) => {
      const href = link.getAttribute('href')?.replace('#', '');
      if (href === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const labelText = sectionLabels[lang][activeId] || sectionLabels['en'][activeId] || activeId;
    if (currentLabel) currentLabel.textContent = labelText;
    if (mobileCurrentLabel) mobileCurrentLabel.textContent = labelText;
  }

  function navigateSectionTo(targetId) {
    const isIslands = (localStorage.getItem('site_mode') || 'islands') === 'islands';

    if (isIslands) {
      if (targetId === 'about') {
        targetId = 'home';
        islandsAboutBox?.classList.add('expanded');
        islandsSocialsRow?.classList.add('about-expanded');
      }
      if (targetId === 'contact') {
        contactModal?.classList.add('active');
        return;
      }
      const targetIdx = islandsSections.indexOf(targetId);
      if (targetIdx !== -1) {
        currentSectionId = targetId;
        updateActiveLabels(targetId);
        updateIslandsSections(targetIdx);
        if (targetId === 'score') updateIslandsScore();
      }
    } else {
      if (targetId === 'score') return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        currentSectionId = targetId;
        updateActiveLabels(targetId);
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function navigateSection(direction) {
    const isIslands = (localStorage.getItem('site_mode') || 'islands') === 'islands';
    const activeSections = isIslands ? islandsSections : sections;
    const currentIdx = getCurrentIndex();
    const targetIdx = (currentIdx + direction + activeSections.length) % activeSections.length;
    navigateSectionTo(activeSections[targetIdx]);
  }

  document.getElementById('navPrevBtn')?.addEventListener('click', (e) => { e.stopPropagation(); navigateSection(-1); });
  document.getElementById('navNextBtn')?.addEventListener('click', (e) => { e.stopPropagation(); navigateSection(1); });
  document.getElementById('mobileNavPrevBtn')?.addEventListener('click', (e) => { e.stopPropagation(); navigateSection(-1); });
  document.getElementById('mobileNavNextBtn')?.addEventListener('click', (e) => { e.stopPropagation(); navigateSection(1); });

  const mobileIslandCenter = document.getElementById('mobileIslandCenter');
  let islandTouchStartX = 0;
  let islandTouchStartY = 0;

  if (mobileIslandCenter) {
    mobileIslandCenter.addEventListener('touchstart', (e) => {
      islandTouchStartX = e.touches[0].clientX;
      islandTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    mobileIslandCenter.addEventListener('touchend', (e) => {
      const diffX = islandTouchStartX - e.changedTouches[0].clientX;
      const diffY = islandTouchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
        navigateSection(diffX > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  const projectsWrapper = document.getElementById('projectsWrapper');
  const projectsPrevBtn = document.getElementById('projectsPrevBtn');
  const projectsNextBtn = document.getElementById('projectsNextBtn');

  function scrollProjectCard(direction) {
    if (!projectsWrapper) return;
    const cards = projectsWrapper.querySelectorAll('.project-card');
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth + 16;
    projectsWrapper.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }

  projectsPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollProjectCard(-1);
  });

  projectsNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollProjectCard(1);
  });

  const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -30% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (localStorage.getItem('site_mode') === 'islands') return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        currentSectionId = activeId;
        updateActiveLabels(activeId);
      }
    });
  }, observerOptions);

  sectionElements.forEach((sec) => observer.observe(sec));

  window.addEventListener('resize', () => {
    checkDesktopRecommendation();
  });

  window.addEventListener('languageChanged', () => {
    loadIslandsAboutConfig();
  });
}