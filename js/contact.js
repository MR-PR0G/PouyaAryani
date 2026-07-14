import { getLanguage } from './i18n.js';
import { loadContactConfig } from './configLoader.js';

const FALLBACK_CONTACT = {
  title: {
    en: "Let's build something reliable.",
    fa: "بیایید با هم سیستمی قابل اعتماد بسازیم."
  },
  desc: {
    en: "Open to backend and systems engineering roles, Rust consulting, and interesting open source collaborations.",
    fa: "آماده همکاری در پروژه‌های مهندسی بک‌اند و سیستم، مشاوره Rust و پروژه‌های متن‌باز."
  },
  email: "hello@pouya.dev",
  githubUsername: "MR-PR0G",
  telegramChannelUrl: "https://t.me/MR_PR0G",
  telegramChatUrl: "https://t.me/MR_PR0G"
};

export async function initContact() {
  const contactSection = document.getElementById('contact');
  const contactCard = contactSection?.querySelector('.contact-card');
  if (!contactSection || !contactCard) return;

  const fetchedConfig = await loadContactConfig();
  const contactData = fetchedConfig || FALLBACK_CONTACT;

  const titleEl = contactCard.querySelector('.contact-title');
  const descEl = contactCard.querySelector('.contact-desc');
  const githubGraphImg = document.getElementById('githubGraphImg');
  const githubFollowBtn = document.getElementById('githubFollowBtn');
  const githubReposBtn = document.getElementById('githubReposBtn');
  const telegramChannelBtn = document.getElementById('telegramChannelBtn');
  const telegramChatBtn = document.getElementById('telegramChatBtn');
  const contactForm = document.getElementById('contactForm');

  function renderContactContent() {
    const lang = getLanguage();
    if (titleEl) titleEl.textContent = contactData.title?.[lang] || contactData.title?.['en'] || '';
    if (descEl) descEl.textContent = contactData.desc?.[lang] || contactData.desc?.['en'] || '';

    const ghUser = contactData.githubUsername || 'MR-PR0G';
    if (githubGraphImg) {
      githubGraphImg.src = `https://ghchart.rshah.org/4fd8e8/${ghUser}`;
    }
    if (githubFollowBtn) {
      githubFollowBtn.href = `https://github.com/${ghUser}`;
    }
    if (githubReposBtn) {
      githubReposBtn.href = `https://github.com/${ghUser}?tab=repositories`;
    }
    if (telegramChannelBtn) {
      telegramChannelBtn.href = contactData.telegramChannelUrl || contactData.telegramUrl || 'https://t.me/MR_PR0G';
    }
    if (telegramChatBtn) {
      telegramChatBtn.href = contactData.telegramChatUrl || contactData.telegramDirectUrl || 'https://t.me/MR_PR0G';
    }

    const emailInput = document.getElementById('formSenderEmail');
    const subjectInput = document.getElementById('formSubject');
    const messageInput = document.getElementById('formMessage');

    if (emailInput) {
      emailInput.placeholder = lang === 'fa' ? 'ایمیل شما' : 'Your Email';
    }
    if (subjectInput) {
      subjectInput.placeholder = lang === 'fa' ? 'موضوع' : 'Subject';
    }
    if (messageInput) {
      messageInput.placeholder = lang === 'fa' ? 'پیام شما...' : 'Your Message...';
    }
  }

  renderContactContent();
  window.addEventListener('languageChanged', renderContactContent);

  const tabBtns = contactCard.querySelectorAll('.contact-tab-btn');
  const tabPanes = contactCard.querySelectorAll('.contact-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = document.getElementById('formSenderEmail')?.value || '';
      const subjectVal = document.getElementById('formSubject')?.value || '';
      const messageVal = document.getElementById('formMessage')?.value || '';

      const targetEmail = contactData.email || 'hello@pouya.dev';
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(`From: ${emailVal}\n\n${messageVal}`)}`;
      
      window.location.href = mailtoUrl;
    });
  }

  window.addEventListener('scroll', () => {
    const rect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight * 0.65)));
      const paddingTopBottom = 24 + progress * 40;
      const scale = 0.94 + progress * 0.06;
      
      contactCard.style.paddingTop = `${paddingTopBottom}px`;
      contactCard.style.paddingBottom = `${paddingTopBottom}px`;
      contactCard.style.transform = `scale(${scale})`;
    }
  }, { passive: true });
}