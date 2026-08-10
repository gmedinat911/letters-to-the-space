(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let traveling = false;

  function makeTransition(x, y, mode) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const farthest = Math.max(
      Math.hypot(x, y),
      Math.hypot(vw - x, y),
      Math.hypot(x, vh - y),
      Math.hypot(vw - x, vh - y)
    );
    const scale = Math.max(18, farthest / 28 + 4);

    document.documentElement.style.setProperty('--worm-x', `${x}px`);
    document.documentElement.style.setProperty('--worm-y', `${y}px`);
    document.documentElement.style.setProperty('--worm-scale', scale.toFixed(2));

    const overlay = document.createElement('div');
    overlay.className = `wormhole-transition ${mode}`;
    overlay.innerHTML = `
      <div class="gravity-field"></div>
      <div class="light-streaks"></div>
      <div class="accretion-disc disc-outer"></div>
      <div class="accretion-disc disc-inner"></div>
      <div class="event-horizon"></div>
      <div class="lens-flare"></div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.add('wormhole-traveling'));
    });
    return overlay;
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
      travel(portal.href, x, y, 'to-past', 1180);
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
      travel(back.href, x, y, 'to-present', 1050);
    });
  }
})();
