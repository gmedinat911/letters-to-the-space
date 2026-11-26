/* Set the realm before the first paint; no visible travel UI. */
(() => {
  const requested=new URLSearchParams(location.search).get('realm');
  document.documentElement.dataset.realm=['far-away','far-far-away'].includes(requested)?requested:'main';
})();