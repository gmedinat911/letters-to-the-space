/* Letters to the Space — a star's distance changes, not its meaning.
 * The Observatory publishes preview/star-lifecycles.json.
 * A null farAwayAfter means the star has no timer and stays active.
 * Use an ISO 8601 date/time with an explicit UTC offset, or Z.
 * Existing distant stars use the initial example cutoffs, not claimed event dates.
 * Positions are percentages of the viewport; reserved slots never shift.
 */
(async () => {
  'use strict';
  let STAR_LIFECYCLES = window.LTTSStarModel.defaults();
  // The Observatory publishes data only. A failed or malformed request never
  // hides a letter: the original known-good configuration remains available.
  try {
    const controller=new AbortController();
    const limit=setTimeout(()=>controller.abort(),3500);
    try {
      const response=await fetch('/preview/star-lifecycles.json',{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error('Schedule unavailable');
      STAR_LIFECYCLES=window.LTTSStarModel.validate(await response.json());
    } finally {clearTimeout(limit);}
  } catch(error) {console.warn('LTTS: using fallback star schedule',error);}
  const layer = document.getElementById('far-away-layer');
  if (!layer || !layer.isConnected) return;
  const validDestinations = new Set(['far-away', 'far-far-away']);
  const explicitZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;
  const special = {
    '75-minutes': { active: 'celestial lifecycle-active-seventy-five', distant: 'celestial far-away-star seventy-five-star' },
    'afterlight': { active: 'celestial afterlight lifecycle-active-lighthouse', distant: 'celestial far-away-star distant-afterlight' }
  };
  const records = [];
  for (const anchor of document.querySelectorAll('a.celestial[data-star-key]')) {
    const key = anchor.dataset.starKey;
    const config = STAR_LIFECYCLES[key];
    if (!config) continue;
    const deadline = config.farAwayAfter === null ? Infinity :
      typeof config.farAwayAfter === 'string' && explicitZone.test(config.farAwayAfter) ? Date.parse(config.farAwayAfter) : NaN;
    if (Number.isNaN(deadline) || !validDestinations.has(config.destination)) {
      console.warn('LTTS: invalid lifecycle configuration for', key);
      continue;
    }
    const custom = special[key];
    if (!custom && (!Array.isArray(config.position) || config.position.length !== 2 ||
      !config.position.every(n => Number.isFinite(n) && n >= 6 && n <= 94))) {
      console.warn('LTTS: invalid distant position for', key);
      continue;
    }
    let home = custom ? document.querySelector('[data-star-home="' + key + '"]') : null;
    if (!home && !custom) {
      home = document.createComment('star-home:' + key);
      anchor.before(home);
    }
    if (!home) continue;
    const activeClasses = custom ? custom.active : anchor.className;
    const distantClasses = custom ? custom.distant : 'celestial far-away-star lifecycle-distant';
    records.push({ anchor, key, config, deadline, home, activeClasses, distantClasses,
      state: anchor.parentElement === layer ? config.destination : 'active', custom });
    // No inline positions are needed for the two existing distant stars.
    if (!custom) {
      const [x,y] = config.position;
      anchor.style.setProperty('--distant-x', x + '%');
      anchor.style.setProperty('--distant-y', y + '%');
      anchor.style.setProperty('--hidden-light', config.light || '#d7dcef');
      anchor.dataset.distantEdge = x <= 15 ? 'left' : x >= 85 ? 'right' : 'center';
      anchor.dataset.distantVertical = y >= 80 ? 'above' : 'below';
    }
  }

  function apply(record, next, animate) {
    const {anchor, home, activeClasses, distantClasses} = record;
    if (record.state === next) {
      anchor.dataset.lifecycleState = next;
      return;
    }
    const focused = document.activeElement === anchor;
    anchor.className = next === 'active' ? activeClasses : distantClasses;
    anchor.dataset.lifecycleState = next;
    if (next === 'active') home.after(anchor);
    else layer.appendChild(anchor);
    record.state = next;
    if (animate && next !== 'active' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      anchor.classList.add('lifecycle-arrival');
      anchor.addEventListener('animationend', () => anchor.classList.remove('lifecycle-arrival'), { once: true });
    }
    if (focused) anchor.focus({preventScroll:true});
  }

  let timeout = 0;
  let stopped = false;
  function refresh(animate = false) {
    clearTimeout(timeout);
    if (stopped) return;
    const now = Date.now();
    let nearest = Infinity;
    for (const record of records) {
      const expired = now >= record.deadline;
      apply(record, expired ? record.config.destination : 'active', animate);
      if (!expired) nearest = Math.min(nearest, record.deadline);
    }
    // One timer for the next deadline. No animation-frame or per-star polling.
    // A one-hour cap also handles long delays and clock changes.
    if (!document.hidden && Number.isFinite(nearest)) {
      timeout = setTimeout(() => refresh(true), Math.max(1, Math.min(nearest - now, 60 * 60 * 1000)));
    }
  }
  const wake = () => refresh(true);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('pageshow', wake);
  window.addEventListener('focus', wake);
  document.addEventListener('ltts:detach', () => {
    stopped = true;
    clearTimeout(timeout);
    document.removeEventListener('visibilitychange', wake);
    window.removeEventListener('pageshow', wake);
    window.removeEventListener('focus', wake);
  }, { once:true });
  refresh(false);
})();
