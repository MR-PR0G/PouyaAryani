import { getLanguage } from './i18n.js';
import { loadSkillsConfig } from './configLoader.js';

const FALLBACK_SKILLS = [
  {
    groupTitle: { en: "Systems & Low-Level", fa: "سیستم و سطح پایین" },
    skills: [
      { name: "Rust", level: 95 },
      { name: "C / C++", level: 85 },
      { name: "Linux Internals", level: 90 },
      { name: "Wayland Compositors", level: 80 }
    ]
  },
  {
    groupTitle: { en: "Backend & Distributed", fa: "بک‌اند و سیستم‌های توزیع‌شده" },
    skills: [
      { name: "Tokio / Async", level: 92 },
      { name: "Actix Web / Rocket", level: 88 },
      { name: "gRPC & Protocol Buffers", level: 85 },
      { name: "PostgreSQL & Redis", level: 88 }
    ]
  },
  {
    groupTitle: { en: "DevOps & Tooling", fa: "دوآپس و ابزارها" },
    skills: [
      { name: "Docker & Containers", level: 85 },
      { name: "eBPF Tracing", level: 78 },
      { name: "Git & Version Control", level: 92 },
      { name: "CI / CD Pipelines", level: 82 }
    ]
  }
];

export async function initSkills() {
  const container = document.getElementById('skillsContainer');
  const wrapper = document.getElementById('skillsWrapper');
  if (!container) return;

  const fetchedSkills = await loadSkillsConfig();
  const skillsData = (fetchedSkills && fetchedSkills.length > 0) ? fetchedSkills : FALLBACK_SKILLS;

  function renderSkills() {
    const lang = getLanguage();

    container.innerHTML = skillsData.map((group) => {
      const title = group.groupTitle?.[lang] || group.groupTitle?.['en'] || '';
      const list = group.skills || [];

      return `
        <div class="skills-group glass reveal in">
          <div class="skill-group-title">${title}</div>
          <div class="skills-grid-bars">
            ${list.map(skill => `
              <div class="skill-bar-card">
                <div class="skill-bar-header">
                  <span class="skill-bar-name">${skill.name}</span>
                  <span class="skill-bar-percent">${skill.level}%</span>
                </div>
                <div class="skill-progress-bg">
                  <div class="skill-progress-fill" style="width: ${skill.level}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderSkills();

  window.addEventListener('languageChanged', renderSkills);

  if (!wrapper) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  wrapper.addEventListener('mousedown', (e) => {
    if (window.innerWidth > 920) return;
    isDragging = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || window.innerWidth > 920) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrapper.scrollLeft = scrollLeft - walk;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
  wrapper.addEventListener('mouseleave', () => { isDragging = false; });
}