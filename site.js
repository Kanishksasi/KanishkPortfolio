const themeButton = document.querySelector('.theme-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const label = `Switch to ${dark ? 'light' : 'dark'} theme`;
  themeButton?.setAttribute('aria-label', label);
  themeButton?.setAttribute('title', label);
}
updateThemeButton();
document.querySelectorAll('.header-inner nav a').forEach(link => {
  if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current', 'page');
});
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('portfolio-theme', theme); } catch {}
  updateThemeButton();
});

const filters = document.querySelector('.filters');
if (filters) {
  const projects = [...document.querySelectorAll('[data-category]')];
  filters.hidden = false;
  function filterProjects(category) {
    projects.forEach(project => {
      project.hidden = category !== 'All' && project.dataset.category !== category;
    });
    const count = projects.filter(project => !project.hidden).length;
    document.querySelector('.project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    document.querySelector('.project-grid').hidden = !projects.some(project => !project.hidden && project.classList.contains('project-card'));
    document.querySelector('.archive-heading').hidden = !projects.some(project => !project.hidden && project.classList.contains('project-row'));
  }
  try {
    const category = sessionStorage.getItem('portfolio-category');
    const input = [...filters.querySelectorAll('input')].find(input => input.value === category);
    if (input) { input.checked = true; filterProjects(category); }
  } catch {}
  filters.addEventListener('change', event => {
    const category = event.target.value;
    filterProjects(category);
    updateProgress();
    if (!reducedMotion.matches && typeof Element.prototype.animate === 'function') {
      projects.filter(project => !project.hidden).forEach(project => {
        project.getAnimations().forEach(animation => animation.cancel());
        project.animate([{ opacity: .5, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }
    try { sessionStorage.setItem('portfolio-category', event.target.value); } catch {}
  });
}

const progress = document.querySelector('.reading-progress');
const sectionLinks = [...document.querySelectorAll('.header-inner nav a, .section-nav a')].filter(link => link.hash && document.querySelector(link.hash));
const trackedSections = [...new Set(sectionLinks.map(link => document.querySelector(link.hash)))];
let activeSectionId;
let progressPending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
  const activeSection = distance > 0 && scrollY >= distance - 2 ? trackedSections.at(-1) : trackedSections.reduce((active, section) => section.getBoundingClientRect().top <= 165 ? section : active, trackedSections[0]);
  if (activeSection && activeSection.id !== activeSectionId) {
    activeSectionId = activeSection.id;
    sectionLinks.forEach(link => {
      if (link.hash === `#${activeSectionId}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const navigation = document.querySelector('.section-nav-inner');
    const activeLink = navigation?.querySelector('[aria-current="location"]');
    if (activeLink && navigation.scrollWidth > navigation.clientWidth) navigation.scrollTo({ left: activeLink.offsetLeft - (navigation.clientWidth - activeLink.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  progressPending = false;
}
addEventListener('scroll', () => {
  if (!progressPending) { progressPending = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// Content stays visible if observers, animations, or JavaScript are unavailable.
if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
  let revealObserver;
  function setupReveals() {
    revealObserver?.disconnect();
    if (reducedMotion.matches) {
      document.getAnimations().forEach(animation => animation.cancel());
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        entry.target.animate([
          { opacity: .35, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 650, delay: Math.min(index, 3) * 60, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.project-card, .project-row, .section-heading, .about-grid, .experience-row, .education-grid article, .awards-list article, .online-list > a, .case-body section, .contact-strip').forEach(element => revealObserver.observe(element));
  }
  setupReveals();
  reducedMotion.addEventListener('change', setupReveals);
}

const viewer = document.querySelector('.image-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  const image = document.createElement('img');
  image.className = 'viewer-image';
  let gallery = [];
  let selected = 0;
  let opener;
  function showImage(index) {
    selected = (index + gallery.length) % gallery.length;
    const link = gallery[selected];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    viewer.querySelector('.viewer-image-slot').append(image);
    viewer.querySelector('.viewer-caption').textContent = image.alt;
    viewer.querySelector('.viewer-counter').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    viewer.querySelector('.viewer-previous').disabled = gallery.length < 2;
    viewer.querySelector('.viewer-next').disabled = gallery.length < 2;
  }
  document.querySelectorAll('.image-open').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    gallery = [...link.closest('.project-media').querySelectorAll('.image-open')];
    showImage(gallery.indexOf(link));
    viewer.showModal();
  }));
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.viewer-previous').addEventListener('click', () => showImage(selected - 1));
  viewer.querySelector('.viewer-next').addEventListener('click', () => showImage(selected + 1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(selected + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}

const contactForm = document.querySelector('#contact-form');
contactForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = contactForm.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  button.disabled = true;
  status.dataset.state = 'pending';
  status.textContent = 'Sending your message...';
  try {
    const response = await fetch(contactForm.action, {
      method: 'POST', body: new FormData(contactForm),
      headers: { Accept: 'application/json' }, signal: controller.signal
    });
    if (!response.ok) throw new Error('Unable to send');
    status.dataset.state = 'success';
    status.textContent = 'Message sent. Thanks for reaching out!';
    contactForm.reset();
  } catch {
    status.dataset.state = 'error';
    status.textContent = 'Could not send your message. Please try again or use the email link above.';
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
  }
});
