/* Keep viewport measurements in one animation frame and share the header offset with anchor navigation. */
(() => {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.introduction, .project-hero');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const chapterLinks = [...document.querySelectorAll('.project-grid aside nav a[href^="#"]')];
  const chapters = chapterLinks.map(link => document.getElementById(link.hash.slice(1)));
  let headerHeight = header.offsetHeight;
  let currentChapter = -1;
  let frame;

  function update() {
    frame = undefined;
    const scrollTop = header.getBoundingClientRect().top;
    header.classList.toggle('is-docked', scrollY > 0 && scrollTop <= 1);

    if (hero && !preference.matches) {
      const bounds = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (headerHeight - bounds.top) / bounds.height));
      hero.style.setProperty('--hero-light-x', `${86 - progress * 42}%`);
      hero.style.setProperty('--hero-light-y', `${18 + progress * 42}%`);
    }

    const readingLine = Math.max(headerHeight + 42, innerHeight * .28);
    let nextChapter = -1;
    chapters.forEach((chapter, index) => {
      if (chapter && chapter.getBoundingClientRect().top <= readingLine) nextChapter = index;
    });
    if (currentChapter === nextChapter) return;
    currentChapter = nextChapter;
    chapterLinks.forEach((link, index) => {
      const current = index === currentChapter;
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      chapters[index]?.classList.toggle('is-reading', current);
    });
  }

  function queueUpdate() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }

  function measureHeader() {
    headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--reading-offset', `${headerHeight + 24}px`);
    queueUpdate();
  }

  addEventListener('scroll', queueUpdate, { passive: true });
  addEventListener('resize', measureHeader);
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  preference.addEventListener('change', () => {
    if (preference.matches && hero) {
      hero.style.removeProperty('--hero-light-x');
      hero.style.removeProperty('--hero-light-y');
    }
    queueUpdate();
  });
  measureHeader();

  /* Reveal accents once, while the page remains fully readable before the script runs. */
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!preference.matches) {
        entry.target.animate(
          [{ opacity: .7, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.25,1)' }
        );
      }
      observer.unobserve(entry.target);
    }
  }, { threshold: .16 });
  document.querySelectorAll('.section-heading, #project-content section[id] > h2, #project-content figure').forEach(element => observer.observe(element));
})();
