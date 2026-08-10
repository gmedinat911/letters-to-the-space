(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeTransition(x, y, mode) {
    const overlay = document.createElement('div');
    overlay.className = `wormhole-transition ${mode}`;
    overlay.style.setProperty('--worm-x', `${x}px`);
    overlay.style.setProperty('--worm-y', `${y}px`);
    overlay.innerHTML = `
      <div class="wormhole-core"></div>
      <div class="wormhole-ring ring-a"></div>
      <div class="wormhole-ring ring-b"></div>
      <div class="wormhole-ring ring-c"></div>
      <div class="wormhole-streaks"></div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => document.body.classList.add('wormhole-traveling'));
    return overlay;
  }

  const portal = document.querySelector('.time-portal');
  if (portal) {
    portal.addEventListener('click', (event) => {
      if (reduceMotion) return;
      event.preventDefault();
      const href = portal.href;
      const rect = portal.querySelector('.portal-orbit')?.getBoundingClientRect() || portal.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      portal.style.animationPlayState = 'paused';
      makeTransition(x, y, 'to-past');
      window.setTimeout(() => { window.location.href = href; }, 980);
    });
  }

  const back = document.querySelector('.return-present');
  if (back) {
    back.addEventListener('click', (event) => {
      if (reduceMotion) return;
      event.preventDefault();
      const href = back.href;
      const rect = back.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      makeTransition(x, y, 'to-present');
      window.setTimeout(() => { window.location.href = href; }, 900);
    });
  }
})();
