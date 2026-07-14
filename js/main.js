import { initI18n } from './i18n.js';
import { initHeader } from './header.js';
import { initHero } from './hero.js';
import { initAbout } from './about.js';
import { initProjects } from './projects.js';
import { initSkills } from './skills.js';
import { initAchievements } from './achievements.js';
import { initContact } from './contact.js';
import { initReveal } from './ui.js';
import { initSecret } from './secret.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initHeader();
  initHero();
  initAbout();
  initProjects();
  initSkills();
  initAchievements();
  initContact();
  initReveal();
  initSecret();
});