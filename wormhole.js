(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let traveling = false;

  if (!document.querySelector('link[data-wormhole-long]')) {
    const longStyles = document.createElement('link');
    longStyles.rel = 'stylesheet';
    longStyles.href = '/wormhole-long.css';
    longStyles.dataset.wormholeLong = 'true';
    document.head.appendChild(longStyles);
  }

  if (!document.querySelector('link[data-golden-constellation]')) {
    const constellationStyles = document.createElement('link');
    constellationStyles.rel = 'stylesheet';
    constellationStyles.href = '/constellation.css';
    constellationStyles.dataset.goldenConstellation = 'true';
    document.head.appendChild(constellationStyles);
  }

  const portal = document.querySelector('.time-portal');

  if (portal && !document.querySelector('.golden-star')) {
    const golden = document.createElement('a');
    golden.className = 'golden-star';
    golden.href = '/constellations/golden/';
    golden.setAttribute('aria-label', 'Golden — a constellation in the space between us');
    golden.innerHTML = '<span class="golden-star__meteor" aria-hidden="true"></span><span class="golden-star__label">Golden · a constellation</span>';
    document.body.appendChild(golden);
  }

  function makeTransition(x, y, mode) {
    document.documentElement.style.setProperty('--worm-x', `${x}px`);
    document.documentElement.style.setProperty('--worm-y', `${y}px`);

    const overlay = document.createElement('div');
    overlay.className = `wormhole-transition ${mode}`;
    overlay.innerHTML = `
      <div class="space-veil"></div>
      <div class="warp-stars"></div>
      <div class="wormhole-glow"></div>
      <div class="accretion-halo halo-back"></div>
      <div class="event-horizon"></div>
      <div class="accretion-halo halo-front"></div>
      <div class="accretion-line"></div>
      <div class="tunnel-depth"></div>
      <div class="wormhole-flash"></div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.add('wormhole-traveling'));
    });
  }

  function travel(link, x, y, mode, duration) {
    if (traveling) return;
    traveling = true;
    makeTransition(x, y, mode);
    window.setTimeout(() => { window.location.href = link; }, duration);
  }

  if (portal) {
    portal.addEventListener('click', (event) => {
      if (reduceMotion) return;
      event.preventDefault();
      const rect = portal.querySelector('.portal-orbit')?.getBoundingClientRect() || portal.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      portal.style.animationPlayState = 'paused';
      travel(portal.href, x, y, 'to-past', 2700);
    });
  }

  const back = document.querySelector('.return-present');
  if (back) {
    back.addEventListener('click', (event) => {
      if (reduceMotion) return;
      event.preventDefault();
      const rect = back.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      travel(back.href, x, y, 'to-present', 2250);
    });
  }
})();
