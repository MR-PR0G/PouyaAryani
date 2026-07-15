import { getLanguage } from './i18n.js';

const FALLBACK_ACHIEVEMENTS = [
  {
    image: "config/achievements/advancerobotic.jpg",
    badge: { en: "Certification", fa: "گواهی‌نامه" },
    title: { en: "Advanced Robotics", fa: "رباتیک پیشرفته" },
    desc: { en: "Successfully completed a comprehensive 72-hour course on Advanced Robotics architecture, kinematics, and control systems from IUST.", fa: "دوره تخصصی و جامع ۷۲ ساعته رباتیک پیشرفته، مباحث سینماتیک و سیستم‌های کنترل در دانشگاه علم و صنعت ایران." },
    date: "2022"
  },
  {
    image: "config/achievements/machinlearning.jpg",
    badge: { en: "Certification", fa: "گواهی‌نامه" },
    title: { en: "Machine Learning", fa: "یادگیری ماشین" },
    desc: { en: "Successfully completed a 24-hour training on Machine Learning fundamentals, algorithm training, and predictive modeling.", fa: "دوره تخصصی ۲۴ ساعته یادگیری ماشین، مفاهیم پایه، آموزش الگوریتم‌ها و مدل‌سازی پیش‌بینی." },
    date: "2022"
  },
  {
    image: "config/achievements/solidworks.jpg",
    badge: { en: "Certification", fa: "گواهی‌نامه" },
    title: { en: "Advanced SolidWorks", fa: "سالیدورکس پیشرفته" },
    desc: { en: "Completed a 24-hour advanced CAD modeling and parametric design course in SolidWorks.", fa: "دوره تخصصی ۲۴ ساعته طراحی پارامتریک و مدل‌سازی سه بعدی پیشرفته با سالیدورکس." },
    date: "2022"
  }
];

export async function initAchievements() {
  const deckWrapper = document.getElementById('deckWrapper');
  if (!deckWrapper) return;

  let achievementsData = [];

  try {
    const manifestResponse = await fetch('config/achievements/mainfest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      if (manifest && manifest.files) {
        const promises = manifest.files.map(async (file) => {
          try {
            const res = await fetch(`config/achievements/${file}`);
            if (res.ok) return await res.json();
          } catch (err) {
            return null;
          }
          return null;
        });
        const results = await Promise.all(promises);
        achievementsData = results.filter(item => item !== null);
      }
    }
  } catch (e) {
    achievementsData = [];
  }

  if (!achievementsData || achievementsData.length === 0) {
    achievementsData = FALLBACK_ACHIEVEMENTS;
  }

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