export function initContact() {
  const contactCard = document.querySelector('.contact-card');
  if (!contactCard) return;

  const tabButtons = contactCard.querySelectorAll('.contact-tab-btn');
  const tabPanes = contactCard.querySelectorAll('.contact-tab-pane');
  const tabContent = contactCard.querySelector('.contact-tab-content');
  const contactForm = document.getElementById('contactForm');

  let baseScrollY = window.scrollY;
  let preventScrollClose = false;
  let preventScrollTimeout = null;

  function closeAllTabs() {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    if (tabContent) {
      tabContent.classList.remove('expanded');
    }
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
      setTimeout(() => {
        if (!pane.classList.contains('active')) {
          pane.style.display = 'none';
        }
      }, 350);
    });
  }

  closeAllTabs();

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      const targetPane = document.getElementById(`tab-${targetTab}`);

      if (preventScrollTimeout) clearTimeout(preventScrollTimeout);
      preventScrollClose = true;
      preventScrollTimeout = setTimeout(() => {
        preventScrollClose = false;
        baseScrollY = window.scrollY;
      }, 450);

      const wasActive = button.classList.contains('active');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => {
        if (pane !== targetPane) {
          pane.classList.remove('active');
          pane.style.display = 'none';
        }
      });

      if (!wasActive) {
        button.classList.add('active');
        if (tabContent) {
          tabContent.classList.add('expanded');
        }
        if (targetPane) {
          targetPane.style.display = 'flex';
          requestAnimationFrame(() => {
            targetPane.classList.add('active');
          });
        }
      } else {
        if (tabContent) {
          tabContent.classList.remove('expanded');
        }
        if (targetPane) {
          targetPane.classList.remove('active');
          setTimeout(() => {
            if (!targetPane.classList.contains('active')) {
              targetPane.style.display = 'none';
            }
          }, 350);
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (preventScrollClose) {
      baseScrollY = currentScrollY;
      return;
    }

    if (currentScrollY < baseScrollY) {
      if (baseScrollY - currentScrollY > 120) {
        const hasActiveTab = Array.from(tabButtons).some(btn => btn.classList.contains('active'));
        if (hasActiveTab) {
          closeAllTabs();
        }
      }
    } else {
      baseScrollY = currentScrollY;
    }
  }, { passive: true });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('formSenderEmail')?.value;
      const subject = document.getElementById('formSubject')?.value;
      const message = document.getElementById('formMessage')?.value;

      if (email && subject && message) {
        const mailtoLink = `mailto:pouya.aryani@proton.me?subject=${encodeURIComponent(subject)}&body=From: ${encodeURIComponent(email)}%0A%0A${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
      }
    });
  }
}