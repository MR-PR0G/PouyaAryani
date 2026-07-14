import { getLanguage } from './i18n.js';
import { loadAboutConfig } from './configLoader.js';

const DEFAULT_ABOUT = {
  avatar: "",
  name: "Pouya Aryani",
  role: {
    en: "// Backend & Systems Engineer, Rust-first",
    fa: "// مهندس سیستم و بک‌اند، تمرکز بر روی Rust"
  },
  bio: {
    en: "I build fast, dependable backend systems — mostly in Rust, occasionally in Go — and I keep a foot firmly in Linux internals. I care about correctness, low-level performance, and software that stays out of the user's way. When I'm not shipping services, I'm contributing to open source or tinkering with Wayland compositors.",
    fa: "من سیستم‌های بک‌اند سریع و قابل اعتمادی می‌سازم — عمدتاً با Rust و گاهی با Go — و همواره ارتباط نزدیکی با لایه‌های داخلی و مفاهیم لینوکس دارم. به درستی برنامه‌نویسی، کارایی سطح پایین و نرم‌افزاری که بدون مزاحمت کار کند اهمیت می‌دهم."
  },
  badges: {
    en: ["Rust", "Linux", "Distributed Systems", "Open Source"],
    fa: ["Rust", "Linux", "Distributed Systems", "Open Source"]
  },
  stats: [
    { target: 42, label: { en: "Projects Shipped", fa: "پروژه تحویل‌شده" } },
    { target: 6, label: { en: "Years Experience", fa: "سال تجربه" } },
    { target: 3200, label: { en: "GitHub Contributions", fa: "مشارکت گیت‌هاب" } },
    { target: 18, label: { en: "Technologies", fa: "تکنولوژی" } }
  ]
};

export async function initAbout() {
  const aboutCard = document.querySelector('.about-card');
  const statsRow = document.getElementById('statsRow');
  if (!aboutCard || !statsRow) return;

  const fetchedConfig = await loadAboutConfig();
  const aboutData = fetchedConfig || DEFAULT_ABOUT;

  function renderAbout() {
    const lang = getLanguage();

    const roleText = aboutData.role?.[lang] || aboutData.role?.['en'] || '';
    const bioText = aboutData.bio?.[lang] || aboutData.bio?.['en'] || '';
    const badgesList = aboutData.badges?.[lang] || aboutData.badges?.['en'] || [];

    const avatarFrameInner = aboutCard.querySelector('.avatar-frame .inner');
    const roleEl = aboutCard.querySelector('.role-line');
    const bioEl = aboutCard.querySelector('p');
    const badgesEl = aboutCard.querySelector('.about-badges');

    if (avatarFrameInner) {
      if (aboutData.avatar) {
        avatarFrameInner.innerHTML = `<img src="${aboutData.avatar}" alt="${aboutData.name || 'Avatar'}" class="avatar-img" />`;
      } else {
        avatarFrameInner.textContent = 'PA';
      }
    }

    if (roleEl) roleEl.textContent = roleText;
    if (bioEl) bioEl.textContent = bioText;
    if (badgesEl) {
      badgesEl.innerHTML = badgesList.map(b => `<span>${b}</span>`).join('');
    }

    const statCards = statsRow.querySelectorAll('.stat-card');
    const statsData = aboutData.stats || [];

    statCards.forEach((card, idx) => {
      if (statsData[idx]) {
        const numEl = card.querySelector('.num');
        const labelEl = card.querySelector('.label');
        if (numEl) numEl.setAttribute('data-target', statsData[idx].target);
        if (labelEl) labelEl.textContent = statsData[idx].label?.[lang] || statsData[idx].label?.['en'] || '';
      }
    });
  }

  renderAbout();
  window.addEventListener('languageChanged', renderAbout);

  function animateStats() {
    const statCards = statsRow.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      const numEl = card.querySelector('.num');
      if (!numEl) return;
      const target = +numEl.getAttribute('data-target') || 0;
      let count = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          numEl.textContent = target;
          clearInterval(timer);
        } else {
          numEl.textContent = count;
        }
      }, 30);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsRow);
}