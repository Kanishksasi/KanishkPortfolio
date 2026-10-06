import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root, 'content.json'), 'utf8'));
const icons = JSON.parse(fs.readFileSync(path.join(root, 'assets/icons.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = name => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name].map(([tag, attributes]) => `<${tag} ${Object.entries(attributes).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')}></${tag}>`).join('')}</svg>`;
const external = (link, className = '') => `<a class="${className}" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)}${icon('ArrowUpRight')}</a>`;
const tags = values => `<ul class="tags" aria-label="Technologies">${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const products = (project, expanded = false) => project.products ? `<div class="venture-products" aria-label="Projects under ${escape(project.name)}">${project.products.map((product, index) => `<div class="venture-product"><span class="mono">${String(index + 1).padStart(2, '0')}</span><div><h4>${product.url ? external({label: product.name, url: product.url}) : escape(product.name)}</h4>${expanded && product.description ? `<p>${escape(product.description)}</p>` : ''}${product.status ? `<span class="product-status mono">${escape(product.status)}</span>` : ''}${expanded && product.details ? `<ul class="product-features">${product.details.map(detail => `<li>${escape(detail)}</li>`).join('')}</ul>` : ''}</div></div>`).join('')}</div>` : '';
const detailFields = project => [['contribution', 'What I personally built'], ['challenge', 'The challenge'], ['learning', 'What I learned'], ['results', 'Results & next steps']].filter(([key]) => project[key]?.trim());
const base = 'https://kanishksasi.github.io/KanishkPortfolio/';

if (process.argv.includes('--check-content')) {
  const missing = data.projects.flatMap(project => ['contribution', 'challenge', 'learning', 'results'].filter(key => !project[key]?.trim()).map(key => `${project.name}: ${key}`));
  if (missing.length) {
    console.error('Personal project details still needed before submission:\n' + missing.join('\n'));
    process.exit(1);
  }
  console.log('All projects include contribution, challenge, learning, and results. Review their accuracy before submitting.');
  process.exit(0);
}

function head(title, description, prefix = '', pagePath = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#f7f7f5">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${base}${pagePath}">
  <meta property="og:image" content="${base}assets/social-preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${base}${pagePath}">
  <link rel="icon" type="image/png" href="${prefix}Profilepic.png">
  <link rel="stylesheet" href="${prefix}styles.css">
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')||'light'}catch{}</script>
  <script src="${prefix}site.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="wordmark" href="${prefix}index.html" aria-label="Kanishk Sasikumar, home">ks<span>.</span></a><span class="header-caption mono">Portfolio / 2026</span>
      <nav aria-label="Main navigation">
        <a href="${prefix}work.html">Work</a>
        <a href="${prefix}journey.html">Journey</a>
        <a href="${prefix}contact.html">Contact</a>
      </nav>
      <button class="icon-button theme-toggle" type="button" title="Switch to dark theme" aria-label="Switch to dark theme"><span class="moon">${icon('Moon')}</span><span class="sun">${icon('Sun')}</span></button>
    </div>
    <div class="reading-progress" aria-hidden="true"></div>
  </header>`;
}

function footer(prefix = '') {
  return `<footer class="site-footer"><div class="wrap footer-inner"><a class="wordmark" href="${prefix}index.html" aria-label="Back to Kanishk Sasikumar's portfolio">ks<span>.</span></a><span>Kanishk Sasikumar</span><div>${external({label: 'GitHub', url: data.github})}<a href="mailto:${escape(data.email)}">Email${icon('ArrowUpRight')}</a><a href="${escape(data.phoneHref)}">${escape(data.phone)}${icon('Phone')}</a></div></div></footer>
  <dialog class="image-viewer" aria-label="Project screenshots"><div class="viewer-toolbar"><p class="viewer-counter mono" aria-live="polite"></p><button type="button" class="icon-button viewer-close" aria-label="Close screenshot" title="Close screenshot">${icon('X')}</button></div><div class="viewer-stage"><button type="button" class="icon-button viewer-previous" aria-label="Previous screenshot" title="Previous screenshot">${icon('ArrowLeft')}</button><div class="viewer-image-slot"></div><button type="button" class="icon-button viewer-next" aria-label="Next screenshot" title="Next screenshot">${icon('ArrowRight')}</button></div><p class="viewer-caption"></p></dialog>
  </body></html>`;
}

function media(project, prefix = '', openImages = false, eager = false) {
  if (!project.images.length) return '';
  return `<div class="project-media ${project.images.length > 1 ? 'phone-screens' : 'web-screen'} media-${project.id}" style="view-transition-name: media-${project.id}">${project.images.map(image => {
    const img = `<img src="${prefix}${escape(image.src)}" alt="${escape(image.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${project.images.length > 1 ? 'width="620" height="1342"' : 'width="1280" height="800"'}>`;
    const framed = project.images.length > 1 ? `<span class="phone-device"><span class="phone-controls" aria-hidden="true"></span>${img}</span>` : img;
    return openImages ? `<a class="image-open" href="${prefix}${escape(image.src)}" target="_blank" rel="noopener noreferrer" aria-label="Open screenshot: ${escape(image.alt)}" title="Open full-size screenshot">${framed}</a>` : framed;
  }).join('')}</div>`;
}

function featured(project, index) {
  return `<article class="project-card project-${project.id} ${index % 2 ? 'project-reverse' : ''}" data-category="${escape(project.category)}" id="project-${project.id}">
    <a class="media-link" href="projects/${project.id}.html" aria-label="View ${escape(project.name)} project">${media(project, '', false, index < 2)}</a>
    <div class="project-card-body">
      <div class="project-meta"><span class="mono">0${index + 1} / ${escape(project.category)}</span><span class="status">${escape(project.status)}</span></div>
      <h3><a href="projects/${project.id}.html"><span style="view-transition-name: title-${project.id}">${escape(project.name)}</span>${icon('ArrowUpRight')}</a></h3>
      <p class="project-subtitle">${escape(project.subtitle)}</p>
      <p>${escape(project.description)}</p>${products(project)}${project.contribution ? `
      <p class="project-evidence"><span>My role</span>${escape(project.contribution)}</p>` : ''}
      ${tags(project.tags)}
      <div class="project-actions"><a class="detail-link" href="projects/${project.id}.html">Project details${icon('ArrowRight')}</a>${external(project.links[0])}</div>
      <div class="source-links">${project.links.slice(1).map(link => external(link)).join('')}</div>
    </div>
  </article>`;
}

const filters = ['All', 'Software', 'AI', 'Research', 'Community'];
const sections = [['work', 'Work'], ['about', 'About'], ['journey', 'Journey'], ['online', 'Elsewhere'], ['connect', 'Contact']];
const sectionNavigation = items => `<nav class="section-nav" aria-label="Portfolio sections"><div class="wrap section-nav-inner">${items.map(([id, label], index) => `<a href="#${id}"><span class="mono">${String(index + 1).padStart(2, '0')}</span>${label}</a>`).join('')}</div></nav>`;
const projectRows = () => `<div class="project-list">${data.projects.filter(p => !p.featured).map((project, index) => `<article class="project-row" data-category="${escape(project.category)}"><span class="row-number mono">${String(index + 5).padStart(2, '0')}</span><div><span class="eyebrow">${escape(project.category)}</span><h3><a href="projects/${project.id}.html">${escape(project.name)}</a></h3><p>${escape(project.description)}</p>${tags(project.tags)}</div><a class="icon-button row-arrow" href="projects/${project.id}.html" aria-label="View ${escape(project.name)} project" title="View project">${icon('ArrowUpRight')}</a></article>`).join('\n')}</div>`;
const experienceSection = () => `<section class="wrap resume-section" id="experience" aria-labelledby="experience-title"><div class="section-heading"><div><span class="eyebrow">01 / Experience</span><h2 id="experience-title">Where I've worked & contributed<span class="accent">.</span></h2></div></div><div class="experience-list">${data.experience.map(experience => `<article class="experience-row"><div class="experience-heading"><h3>${escape(experience.name)}</h3><p class="role">${escape(experience.role)}</p><p class="dates mono">${escape(experience.dates)}</p></div>${experience.description ? `<p>${escape(experience.description)}</p>` : ''}</article>`).join('\n')}</div></section>`;
const educationSection = () => `<section class="education-band" id="education" aria-labelledby="education-title"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">02 / Education</span><h2 id="education-title">What I'm learning<span class="accent">.</span></h2></div></div><div class="education-grid">${data.education.map(education => `<article><span class="eyebrow">${escape(education.type)}</span><h3>${escape(education.title)}</h3><p class="school">${escape(education.school)}</p><p>${escape(education.description)}</p></article>`).join('\n')}</div><div class="skill-list">${data.skills.map(group => `<div><h3>${escape(group.title)}</h3>${tags(group.items)}</div>`).join('\n')}</div></div></section>`;
const awardsSection = () => `<section class="recognition-band" id="awards" aria-labelledby="awards-title"><div class="wrap resume-section"><div class="section-heading"><div><span class="eyebrow">03 / Recognition</span><h2 id="awards-title">Milestones along the way<span class="accent">.</span></h2></div></div><div class="awards-list">${data.awards.filter(award => award.featured).map((award, index) => `<article><span class="award-index mono">${String(index + 1).padStart(2, '0')}</span><h3>${escape(award.name)}</h3><p>${escape(award.description)}</p></article>`).join('\n')}</div></div></section>`;
const home = `${head(data.name + ' | Portfolio', 'iOS products, AI prototypes, research, and community projects by Kanishk Sasikumar.')}
  <main id="main">
    <section class="identity personal-hero" aria-labelledby="name">
      <div class="hero-scene"><img class="hero-fallback" src="Profilepic.png" width="370" height="986" alt="Kanishk Sasikumar" fetchpriority="high"><canvas id="studio-scene" tabindex="0" aria-label="Interactive personal studio with Kanishk's portrait and Investo and Prepxa app screens"></canvas></div>
      <div class="wrap hero-inner">
        <div class="identity-top"><span class="eyebrow">${escape(data.tagline)}</span><span class="location">${icon('MapPin')}${escape(data.location)}</span></div>
        <div class="hero-content"><div class="identity-name"><h1 id="name"><span class="name-first">Kanishk</span><span class="name-last">Sasikumar<span class="name-period">.</span></span></h1></div><div class="identity-bottom"><p class="muted">${escape(data.introduction)}</p><p class="hero-focus">Filling the gaps from education to health care.</p><div class="identity-links"><a href="#work" class="hero-work-link">Explore my work${icon('ArrowRight')}</a>${external({label: 'GitHub', url: data.github})}<a href="mailto:${escape(data.email)}">${icon('Mail')}Email</a></div></div></div>
        <div class="hero-footer"><a href="#work" class="scroll-link"><span class="mono">01 / Selected work</span>${icon('ChevronDown')}</a><div class="studio-controls" hidden><button class="icon-button studio-left" type="button" aria-label="Rotate studio left" title="Rotate studio left">${icon('ArrowLeft')}</button><button class="icon-button studio-motion" type="button" aria-label="Pause studio motion" title="Pause studio motion" aria-pressed="false"><span class="scene-pause">${icon('Pause')}</span><span class="scene-play" hidden>${icon('Play')}</span></button><button class="icon-button studio-right" type="button" aria-label="Rotate studio right" title="Rotate studio right">${icon('ArrowRight')}</button></div></div>
      </div>
      <script src="assets/studio-scene.js" defer></script>
    </section>
    ${sectionNavigation(sections)}
    <section class="work-section wrap" id="work" aria-labelledby="work-title">
      <div class="section-heading"><div><span class="eyebrow">01 / Selected work</span><h2 id="work-title">Ideas, made real<span class="accent">.</span></h2></div><span class="project-count mono">${data.projects.filter(p => p.featured).length} selected projects</span></div>
      <div class="project-grid">${data.projects.filter(p => p.featured).map(featured).join('\n')}</div>
      <a class="archive-portal" href="work.html"><span><span class="eyebrow">${data.projects.length} projects / Complete collection</span><strong>Research, experiments & community</strong></span>${icon('ArrowUpRight')}</a>
    </section>
    <section class="about-band" id="about" aria-labelledby="about-title"><div class="wrap about-grid"><div><span class="eyebrow">02 / About</span><h2 id="about-title">A little about me<span class="accent">.</span></h2></div><p>${escape(data.about)}</p></div></section>
    <section class="wrap journey-preview resume-section" id="journey" aria-labelledby="journey-title"><div class="section-heading"><div><span class="eyebrow">03 / My journey</span><h2 id="journey-title">Learning by doing<span class="accent">.</span></h2></div><a class="detail-link" href="journey.html">Full journey${icon('ArrowRight')}</a></div><div class="journey-preview-grid">${data.experience.filter(experience => ['Ignite Professional Studies', 'Bruxel Academy LLC', 'Walton Arts Center & Walmart AMP', 'Bentonville High School DECA'].includes(experience.name) && experience.role !== 'Competition Representative').map(experience => `<article><span class="eyebrow">${escape(experience.dates)}</span><h3>${escape(experience.name)}</h3><p>${escape(experience.role)}</p></article>`).join('')}</div><a class="journey-more" href="journey.html">Experience, education & recognition${icon('ArrowUpRight')}</a></section>
    <section class="online-band" id="online" aria-labelledby="online-title"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">04 / Elsewhere</span><h2 id="online-title">More of my work<span class="accent">.</span></h2></div></div><div class="online-list">${data.online.map(link => `<a href="${escape(link.url)}" target="_blank" rel="noopener noreferrer"><span><strong>${escape(link.label)}</strong><span>${escape(link.detail)}</span></span>${icon('ArrowUpRight')}</a>`).join('\n')}</div></div></section>
    <section class="wrap contact-strip" id="connect" aria-labelledby="contact-title"><div><span class="eyebrow">05 / Contact</span><h2 id="contact-title">Get in touch<span class="accent">.</span></h2></div><div class="contact-methods"><a class="contact-email" href="mailto:${escape(data.email)}">${escape(data.email)}${icon('ArrowUpRight')}</a><a class="contact-phone" href="${escape(data.phoneHref)}">${icon('Phone')}${escape(data.phone)}</a></div></section>
  </main>
${footer()}`;
fs.writeFileSync(path.join(root, 'index.html'), home);

const work = `${head('Work | ' + data.name, 'The complete collection of projects by Kanishk Sasikumar.', '', 'work.html')}<main id="main"><header class="wrap collection-header"><a class="back-link" href="index.html">${icon('ArrowLeft')}Back to portfolio</a><span class="eyebrow">The complete collection</span><h1>Work<span class="accent">.</span></h1></header><section class="wrap work-section" id="work" aria-label="All projects"><div class="section-heading"><h2>Projects & experiments</h2><span class="project-count mono" aria-live="polite">${data.projects.length} projects</span></div><fieldset class="filters" hidden><legend class="sr-only">Filter projects by category</legend>${filters.map((filter, index) => `<label><input type="radio" name="project-filter" value="${filter}" ${index === 0 ? 'checked' : ''}><span>${filter === 'All' ? 'All work' : filter}</span></label>`).join('')}</fieldset><div class="project-grid">${data.projects.filter(p => p.featured).map(featured).join('\n')}</div><div class="archive-heading"><h3>More projects & experiments</h3><span class="mono">Software / Research / Community</span></div>${projectRows()}</section></main>${footer()}`;
fs.writeFileSync(path.join(root, 'work.html'), work);
const journey = `${head('Journey | ' + data.name, 'Experience, education, training, and recognition of Kanishk Sasikumar.', '', 'journey.html')}<main id="main"><header class="wrap collection-header"><a class="back-link" href="index.html">${icon('ArrowLeft')}Back to portfolio</a><span class="eyebrow">Experience / Education / Recognition</span><h1>My journey<span class="accent">.</span></h1><p>${escape(data.about)}</p></header>${sectionNavigation([['experience', 'Experience'], ['education', 'Education'], ['awards', 'Recognition']])}${experienceSection()}${educationSection()}${awardsSection()}<div class="wrap journey-footer"><a class="detail-link" href="work.html">Explore my work${icon('ArrowRight')}</a><a class="detail-link" href="contact.html">Get in touch${icon('ArrowUpRight')}</a></div></main>${footer()}`;
fs.writeFileSync(path.join(root, 'journey.html'), journey);

fs.mkdirSync(path.join(root, 'projects'), { recursive: true });
for (const [projectIndex, project] of data.projects.entries()) {
  if (!/^[a-z0-9-]+$/.test(project.id)) throw new Error('Invalid project ID');
  const fields = detailFields(project);
  const nextProject = data.projects[(projectIndex + 1) % data.projects.length];
  const projectPage = `${head(project.name + ' | ' + data.name, project.description, '../', 'projects/' + project.id + '.html')}
    <main id="main" class="wrap case-study">
      <a class="back-link" href="../work.html">${icon('ArrowLeft')}All projects</a>
      <header class="case-header"><span class="eyebrow">Project ${String(projectIndex + 1).padStart(2, '0')} / ${escape(project.category)}${project.status ? ' / ' + escape(project.status) : ''}</span><h1><span style="view-transition-name: title-${project.id}">${escape(project.name)}</span><span class="accent">.</span></h1>${project.subtitle ? `<p class="case-subtitle">${escape(project.subtitle)}</p>` : ''}${tags(project.tags)}<div class="case-links">${project.links.map(link => external(link)).join('')}</div></header>
      ${media(project, '../', true, true)}
      ${project.products ? `<section class="venture-detail" aria-label="Bruxel Academy products">${products(project, true)}</section>` : ''}
      <div class="case-layout"><aside class="case-index"><span class="eyebrow">Inside the project</span><nav aria-label="Project sections"><a href="#overview">Overview</a>${fields.map(([key, title]) => `<a href="#${key}">${title}</a>`).join('')}${project.links.length ? '<a href="#artifacts">Links & artifacts</a>' : ''}</nav></aside><div class="case-body"><section id="overview"><span class="eyebrow">01 / The project</span><h2>Project overview</h2><p>${escape(project.description)}</p>${project.note ? `<p class="project-note">${escape(project.note)}</p>` : ''}</section>${fields.map(([key, title], index) => `<section id="${key}"><span class="eyebrow">${String(index + 2).padStart(2, '0')} / Build notes</span><h2>${title}</h2><p>${escape(project[key])}</p></section>`).join('\n')}${project.links.length ? `<section id="artifacts"><h2>Links & artifacts</h2><div class="artifact-links">${project.links.map(link => external(link)).join('')}</div></section>` : ''}</div></div>
      <nav class="case-navigation" aria-label="Project navigation"><a href="../work.html">${icon('ArrowLeft')}All projects</a><a class="next-project" href="${nextProject.id}.html"><span><span class="eyebrow">Next project</span>${escape(nextProject.name)}</span>${icon('ArrowRight')}</a></nav>
    </main>${footer('../')}`;
  fs.writeFileSync(path.join(root, 'projects', project.id + '.html'), projectPage);
}

const contact = `${head('Contact | ' + data.name, 'Contact Kanishk Sasikumar about projects and collaboration.', '', 'contact.html')}
  <main id="main" class="wrap contact-page"><a class="back-link" href="index.html">${icon('ArrowLeft')}Back to portfolio</a><span class="eyebrow">Contact</span><h1>Get in touch<span class="accent">.</span></h1><p class="contact-intro">Interested in collaborating or just want to connect? I'd love to hear from you.</p><div class="contact-methods"><a class="contact-email" href="mailto:${escape(data.email)}">${escape(data.email)}${icon('ArrowUpRight')}</a><a class="contact-phone" href="${escape(data.phoneHref)}">${icon('Phone')}${escape(data.phone)}</a></div>
    <form id="contact-form" action="https://formspree.io/f/mykeaywr" method="post"><div class="form-two"><label>Your name<input name="name" autocomplete="name" required maxlength="150"></label><label>Your email<input type="email" name="email" autocomplete="email" required maxlength="254"></label></div><label>Message<textarea name="message" rows="7" required maxlength="10000"></textarea></label><div class="form-bottom"><button class="primary-button" type="submit">Send message${icon('ArrowRight')}</button><p id="form-status" role="status" aria-live="polite"></p></div></form>
  </main>${footer()}`;
fs.writeFileSync(path.join(root, 'contact.html'), contact);
console.log(`Built home, work, journey, contact, and ${data.projects.length} project pages.`);
