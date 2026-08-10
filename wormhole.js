(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let traveling = false;

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

  const portal = document.querySelector('.time-portal');
  if (portal) {
    portal.addEventListener('click', (event) => {
      if (reduceMotion) return;
      event.preventDefault();
      const rect = portal.querySelector('.portal-orbit')?.getBoundingClientRect() || portal.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      portal.style.animationPlayState = 'paused';
      travel(portal.href, x, y, 'to-past', 1250);
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
      travel(back.href, x, y, 'to-present', 1100);
    });
  }
})();
