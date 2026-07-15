import { getLanguage } from './i18n.js';
import { translations } from './translations.js';

const FALLBACK_PROJECTS = [
  {
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    tag: { en: "Systems", fa: "سیستم‌ها" },
    title: { en: "Async Job Orchestrator", fa: "ارکستریتور غیرهمزمان وظایف" },
    desc: { en: "A Tokio-based distributed job queue with backpressure-aware scheduling and at-least-once delivery guarantees.", fa: "صف توزیع‌شده وظایف مبتنی بر Tokio با زمان‌بندی هوشمند و تضمین تحویل حداقل یک‌باره." },
    stack: ["Rust", "Tokio", "Redis"],
    link: "https://github.com/MR-PR0G"
  },
  {
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    tag: { en: "Backend", fa: "بک‌اند" },
    title: { en: "Actix Microservice Mesh", fa: "مش میکروسرویس Actix" },
    desc: { en: "A set of composable Actix Web services behind a lightweight service mesh, built for sub-millisecond internal latency.", fa: "مجموعه‌ای از سرویس‌های وب Actix در پشت یک مش سرویس سبک با تاخیر زیر میلی‌ثانیه." },
    stack: ["Actix", "gRPC", "PostgreSQL"],
    link: "https://github.com/MR-PR0G"
  }
];

const statsCache = new Map();

function parseGitHubUrl(url) {
  if (!url) return null;
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2].split('?')[0].split('#')[0] };
  }
  return null;
}

async function fetchGitHubStats(owner, repo) {
  const cacheKey = `${owner}/${repo}`;
  if (statsCache.has(cacheKey)) {
    return statsCache.get(cacheKey);
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (response.ok) {
      const data = await response.json();
      const stats = {
        stars: data.stargazers_count,
        forks: data.forks_count
      };
      statsCache.set(cacheKey, stats);
      return stats;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function initProjects() {
  const wrapper = document.getElementById('projectsWrapper');
  const track = document.getElementById('projectsTrack');
  const prevBtn = document.getElementById('projectsPrevBtn');
  const nextBtn = document.getElementById('projectsNextBtn');
  const filterRow = document.getElementById('projectsFilterRow');
  if (!track || !wrapper) return;

  let rawProjects = [];

  try {
    const manifestResponse = await fetch('config/projects/mainfest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      if (manifest && manifest.files) {
        const promises = manifest.files.map(async (file) => {
          try {
            const res = await fetch(`config/projects/${file}`);
            if (res.ok) return await res.json();
          } catch (err) {
            return null;
          }
          return null;
        });
        const results = await Promise.all(promises);
        rawProjects = results.filter(item => item !== null);
      }
    }
  } catch (e) {
    rawProjects = [];
  }

  if (!rawProjects || rawProjects.length === 0) {
    rawProjects = FALLBACK_PROJECTS;
  }

  let activeFilterKey = 'all';
  let setWidth = 0;
  let currentX = 0;
  let targetX = 0;
  let isDragging = false;
  let startX = 0;
  let dragStartX = 0;

  function getUniqueTags() {
    const tagsMap = new Map();
    rawProjects.forEach((p) => {
      if (p.tag) {
        const key = typeof p.tag === 'object' ? (p.tag.en || p.tag.fa) : p.tag;
        if (!tagsMap.has(key)) {
          tagsMap.set(key, p.tag);
        }
      }
    });
    return Array.from(tagsMap.entries()).map(([key, tagObj]) => ({ key, tagObj }));
  }

  function renderFilterButtons() {
    if (!filterRow) return;
    const lang = getLanguage();
    filterRow.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `project-filter-btn ${activeFilterKey === 'all' ? 'active' : ''}`;
    allBtn.textContent = translations[lang]?.projects?.all || (lang === 'fa' ? 'همه' : 'All');
    allBtn.addEventListener('click', () => {
      activeFilterKey = 'all';
      updateActiveFilterBtn();
      renderProjects();
    });
    filterRow.appendChild(allBtn);

    const tags = getUniqueTags();
    tags.forEach(({ key, tagObj }) => {
      const btn = document.createElement('button');
      btn.className = `project-filter-btn ${activeFilterKey === key ? 'active' : ''}`;
      btn.textContent = typeof tagObj === 'object' ? (tagObj[lang] || tagObj['en'] || key) : tagObj;
      btn.addEventListener('click', () => {
        activeFilterKey = key;
        updateActiveFilterBtn();
        renderProjects();
      });
      filterRow.appendChild(btn);
    });
  }

  function updateActiveFilterBtn() {
    if (!filterRow) return;
    const buttons = filterRow.querySelectorAll('.project-filter-btn');
    const tags = getUniqueTags();
    
    buttons.forEach((btn, idx) => {
      if (idx === 0) {
        btn.classList.toggle('active', activeFilterKey === 'all');
      } else {
        const tagKey = tags[idx - 1]?.key;
        btn.classList.toggle('active', activeFilterKey === tagKey);
      }
    });
  }

  function getFilteredProjects() {
    if (activeFilterKey === 'all') return rawProjects;
    return rawProjects.filter((p) => {
      const key = typeof p.tag === 'object' ? (p.tag.en || p.tag.fa) : p.tag;
      return key === activeFilterKey;
    });
  }

  function calculateSetWidth(projects) {
    const cardEl = track.querySelector('.project-card');
    if (!cardEl) return;
    const gap = 16;

    let baseCount = projects.length;
    while (baseCount < 6 && baseCount > 0) {
      baseCount += projects.length;
    }
    setWidth = baseCount * (cardEl.offsetWidth + gap);
    
    currentX = -setWidth;
    targetX = -setWidth;
  }

  function renderProjects() {
    const lang = getLanguage();
    track.innerHTML = '';

    const currentProjects = getFilteredProjects();
    if (!currentProjects || currentProjects.length === 0) return;

    let baseItems = [...currentProjects];
    while (baseItems.length < 6) {
      baseItems = baseItems.concat(currentProjects);
    }

    const displayProjects = [...baseItems, ...baseItems, ...baseItems];

    displayProjects.forEach((p, idx) => {
      const tagText = typeof p.tag === 'object' ? (p.tag[lang] || p.tag['en'] || '') : p.tag;
      const titleText = typeof p.title === 'object' ? (p.title[lang] || p.title['en'] || '') : p.title;
      const descText = typeof p.desc === 'object' ? (p.desc[lang] || p.desc['en'] || '') : p.desc;
      const stackList = p.stack || [];
      const ghInfo = parseGitHubUrl(p.link);
      const statsId = `gh-stats-${idx}`;

      const card = document.createElement('div');
      card.className = 'project-card glass reveal in';
      card.innerHTML = `
        <div class="project-glow"></div>
        <div class="project-img-wrapper">
          <img src="${p.image}" alt="${titleText}" class="project-img" loading="lazy" />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span class="project-tag" style="margin-bottom: 0;">${tagText}</span>
          <div id="${statsId}" style="display: flex; gap: 8px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); align-items: center;"></div>
        </div>
        <h4>${titleText}</h4>
        <p>${descText}</p>
        <div class="project-stack">${stackList.map(s => `<span class="chip-mini">${s}</span>`).join('')}</div>
      `;

      if (p.link) {
        card.addEventListener('click', () => {
          window.open(p.link, '_blank', 'noopener,noreferrer');
        });
      }

      track.appendChild(card);

      if (ghInfo) {
        fetchGitHubStats(ghInfo.owner, ghInfo.repo).then(stats => {
          const statsContainer = document.getElementById(statsId);
          if (stats && statsContainer) {
            statsContainer.innerHTML = `
              <span style="display: flex; align-items: center; gap: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${stats.stars}
              </span>
              <span style="display: flex; align-items: center; gap: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                ${stats.forks}
              </span>
            `;
          }
        });
      }

      const glow = card.querySelector('.project-glow');
      let rect = null;

      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (glow) {
          glow.style.left = (px - 110) + 'px';
          glow.style.top = (py - 110) + 'px';
        }
      });
    });

    requestAnimationFrame(() => {
      calculateSetWidth(currentProjects);
    });
  }

  renderFilterButtons();
  renderProjects();

  window.addEventListener('languageChanged', () => {
    renderFilterButtons();
    renderProjects();
  });

  function render() {
    if (!isDragging) {
      currentX += (targetX - currentX) * 0.12;
    }

    if (setWidth > 0) {
      if (currentX < -setWidth * 2) {
        currentX += setWidth;
        targetX += setWidth;
      } else if (currentX > -setWidth * 0.5) {
        currentX -= setWidth;
        targetX -= setWidth;
      }
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const getStep = () => {
    const cardEl = track.querySelector('.project-card');
    return cardEl ? cardEl.offsetWidth + 16 : 300;
  };

  prevBtn?.addEventListener('click', () => { targetX += getStep() * 2; });
  nextBtn?.addEventListener('click', () => { targetX -= getStep() * 2; });

  wrapper.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      const delta = e.shiftKey ? e.deltaY : e.deltaX;
      targetX -= delta * 1.2;
    }
  }, { passive: false });

  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    dragStartX = currentX;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    currentX = dragStartX + diff;
    targetX = currentX;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  let touchStartY = 0;
  let touchDirectionDetermined = false;
  let isHorizontalTouch = false;

  wrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    touchDirectionDetermined = false;
    isHorizontalTouch = false;
    startX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    dragStartX = currentX;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentXTouch = e.touches[0].clientX;
    const currentYTouch = e.touches[0].clientY;
    const diffX = currentXTouch - startX;
    const diffY = currentYTouch - touchStartY;

    if (!touchDirectionDetermined) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalTouch = true;
      }
      touchDirectionDetermined = true;
    }

    if (isHorizontalTouch) {
      currentX = dragStartX + diffX;
      targetX = currentX;
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => { isDragging = false; });

  window.addEventListener('resize', () => {
    calculateSetWidth(getFilteredProjects());
  });
}