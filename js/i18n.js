import { translations } from './translations.js';

let currentLang = localStorage.getItem('site_lang') || 'en';

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('site_lang', lang);

  const isRtl = lang === 'fa';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translation = getNestedTranslation(translations[lang], key);
    if (translation) {
      el.textContent = translation;
    }
  });

  document.querySelectorAll('.flag-icon').forEach((flag) => {
    if (flag.getAttribute('data-lang') === lang) {
      flag.classList.add('active');
    } else {
      flag.classList.remove('active');
    }
  });

  const activeLink = document.querySelector('.nav-dropdown-menu a.active');
  const currentLabel = document.getElementById('currentSectionLabel');
  if (activeLink && currentLabel) {
    currentLabel.textContent = activeLink.textContent.trim();
  }

  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, isRtl } }));
}

export function initI18n() {
  setLanguage(currentLang);
}