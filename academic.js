// Section navigation and progress are progressive enhancements; content is visible without JavaScript.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('#about, .content-area > section')];
const sectionLinks = [...document.querySelectorAll('.site-header nav a, .reading-rail nav a')];
let scheduled = false;
function updateReadingPosition() {
  scheduled = false;
  const threshold = Math.max(170, window.innerHeight * 0.3);
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) current = section;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
  // Highlight the heading and existing navigation from the same reading position.
  sections.forEach(section => section.classList.toggle('is-reading', section === current));
  sectionLinks.forEach(link => {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const available = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--reading-progress', String(available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 1));
}
function scheduleReadingUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateReadingPosition);
}
window.addEventListener('scroll', scheduleReadingUpdate, {passive:true});
window.addEventListener('resize', scheduleReadingUpdate);
updateReadingPosition();

// Direct project links open their enclosing disclosure before anchor navigation.
function syncStudyHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}
document.querySelectorAll('a[href="#vr-details"]').forEach(link => {
  link.addEventListener('click', () => { document.getElementById('vr-details').open = true; });
});
syncStudyHash();
window.addEventListener('hashchange', syncStudyHash);
document.querySelectorAll('details').forEach(detail => {
  detail.addEventListener('toggle', scheduleReadingUpdate);
});

// Native dialog supplies keyboard focus containment, Escape dismissal, and focus restoration.
const imageDialog = document.querySelector('.image-dialog');
let imageTrigger;
if (imageDialog && typeof imageDialog.showModal === 'function') {
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      // Modified clicks retain the standard link behavior for opening the original image.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      imageTrigger = link;
      imageDialog.showModal();
      document.body.classList.add('image-open');
    });
  });
  imageDialog.querySelector('.dialog-close').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    const rect = imageDialog.getBoundingClientRect();
    if (event.target === imageDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) imageDialog.close();
  });
  imageDialog.addEventListener('close', () => {
    document.body.classList.remove('image-open');
    imageTrigger?.focus({preventScroll:true});
  });
}

// A single short entrance and gentle section reveals add motion without loops or hidden content.
const runningAnimations = new Set();
function animateOnce(element, frames, options) {
  if (reducedMotion.matches || typeof element.animate !== 'function') return;
  const animation = element.animate(frames, options);
  runningAnimations.add(animation);
  animation.finished.then(() => runningAnimations.delete(animation), () => runningAnimations.delete(animation));
}
const connection = document.querySelector('.connection');
if (connection) {
  const length = connection.getTotalLength();
  animateOnce(connection, [{strokeDasharray:length, strokeDashoffset:length}, {strokeDasharray:length, strokeDashoffset:0}], {duration:1500, easing:'ease-out'});
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateOnce(entry.target, [{opacity:.65, transform:'translateY(8px)'}, {opacity:1, transform:'translateY(0)'}], {duration:430, easing:'ease-out'});
      observer.unobserve(entry.target);
    });
  }, {threshold:.08});
  document.querySelectorAll('.project-row, .publication, .background-grid').forEach(element => observer.observe(element));
}
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) runningAnimations.forEach(animation => animation.cancel());
});
