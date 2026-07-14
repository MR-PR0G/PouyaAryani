import { getLanguage } from './i18n.js';
import { loadAchievementsConfig } from './configLoader.js';

const FALLBACK_ACHIEVEMENTS = [
  {
    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80",
    badge: { en: "Certification", fa: "گواهی‌نامه" },
    title: { en: "Rust Systems Architect Certification", fa: "گواهی‌نامه معماری سیستم‌های Rust" },
    desc: { en: "Demonstrated advanced knowledge in memory safety, concurrency patterns, and low-level FFIs.", fa: "اثبات دانش پیشرفته در ایمنی حافظه، الگوهای همزمانی و ارتباطات سطح پایین FFI." },
    date: "2025"
  },
  {
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
    badge: { en: "Open Source", fa: "متن‌باز" },
    title: { en: "Linux Kernel Contributor", fa: "مشارکت‌کننده هسته لینوکس" },
    desc: { en: "Merged upstream patches optimizing memory allocation profiles and eBPF tracing routines.", fa: "ادغام پچ‌های اختصاصی لایه تخصیص حافظه و روتین‌های ردگیری eBPF در لینوکس." },
    date: "2025"
  },
  {
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80",
    badge: { en: "Competition", fa: "رقابت" },
    title: { en: "1st Place Systems Hackathon", fa: "مقام اول هکاتون سیستم‌ها" },
    desc: { en: "Built a sub-millisecond high-throughput consensus engine under 24 hours.", fa: "طراحی و پیاده‌سازی موتور اجماع پرسرعت با توان پردازش بالا در کمتر از ۲۴ ساعت." },
    date: "2024"
  },
  {
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80",
    badge: { en: "Milestone", fa: "دستاورد" },
    title: { en: "3,000+ GitHub Contributions", fa: "بیش از ۳,۰۰۰ مشارکت در گیت‌هاب" },
    desc: { en: "Maintained multiple active Rust libraries and contributed to core ecosystem tools.", fa: "توسعه و نگهداری کتابخانه‌های فعال Rust و مشارکت در ابزارهای اصلی اکوسیستم." },
    date: "2024 - 2026"
  }
];

export async function initAchievements() {
  const deckWrapper = document.getElementById('deckWrapper');
  if (!deckWrapper) return;

  const fetchedAchievements = await loadAchievementsConfig();
  const achievementsData = (fetchedAchievements && fetchedAchievements.length > 0) ? fetchedAchievements : FALLBACK_ACHIEVEMENTS;

  let activeCardIndex = 0;
  let cardElements = [];

  function renderAchievements() {
    const lang = getLanguage();

    deckWrapper.innerHTML = '';
    cardElements = achievementsData.map((item) => {
      const badgeText = item.badge?.[lang] || item.badge?.['en'] || '';
      const titleText = item.title?.[lang] || item.title?.['en'] || '';
      const descText = item.desc?.[lang] || item.desc?.['en'] || '';

      const card = document.createElement('div');
      card.className = 'deck-card glass';
      card.innerHTML = `
        <div>
          <div class="deck-img-wrapper">
            <img src="${item.image}" alt="${titleText}" class="deck-img" loading="lazy" />
          </div>
          <div class="deck-badge">${badgeText}</div>
          <h3>${titleText}</h3>
          <p>${descText}</p>
        </div>
        <div class="deck-footer">
          <span>${lang === 'fa' ? 'پویا آریانی' : 'Pouya Aryani'}</span>
          <span>${item.date}</span>
        </div>
      `;
      deckWrapper.appendChild(card);
      return card;
    });

    updateDeck();
  }

  function updateDeck() {
    const total = achievementsData.length;
    if (total === 0) return;

    cardElements.forEach((card, idx) => {
      card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden');
      const relIndex = (idx - activeCardIndex + total) % total;

      if (relIndex === 0) {
        card.classList.add('pos-center');
      } else if (relIndex === 1 || (relIndex === total - 1 && total === 2)) {
        card.classList.add('pos-right');
      } else if (relIndex === total - 1) {
        card.classList.add('pos-left');
      } else {
        card.classList.add('pos-hidden');
      }
    });
  }

  renderAchievements();

  window.addEventListener('languageChanged', renderAchievements);

  document.getElementById('deckPrevBtn')?.addEventListener('click', () => {
    const total = achievementsData.length;
    if (total === 0) return;
    activeCardIndex = (activeCardIndex - 1 + total) % total;
    updateDeck();
  });

  document.getElementById('deckNextBtn')?.addEventListener('click', () => {
    const total = achievementsData.length;
    if (total === 0) return;
    activeCardIndex = (activeCardIndex + 1) % total;
    updateDeck();
  });
}