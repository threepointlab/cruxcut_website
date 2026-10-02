(() => {
  const links = [...document.querySelectorAll('[data-play-cta]')];
  const dialog = document.querySelector('.play-dialog');
  const ko = document.documentElement.lang === 'ko';
  let opener;
  let checking = false;
  async function status() {
    try {
      const response = await fetch(`/api/play-availability?lang=${ko ? 'ko' : 'en'}`, {cache: 'no-store', signal: AbortSignal.timeout(6500)});
      if (!response.ok) return false;
      const data = await response.json();
      return data.available === true && data.url === 'https://play.google.com/store/apps/details?id=com.threepointlab.cruxcut';
    } catch { return false; }
  }
  function setLiveLabels() {
    links.forEach(link => {
      link.querySelector('[data-play-label]').hidden = true;
      link.setAttribute('aria-label', ko ? 'Google Play에서 CruxCut 다운로드' : 'Get CruxCut on Google Play');
    });
  }
  // Keep real fallback anchors: unsupported dialog/JS still reaches the server gate.
  if (!dialog || typeof dialog.showModal !== 'function') return;
  dialog.querySelector('[data-play-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = dialog.querySelector('[data-play-close]');
    const last = dialog.querySelector('a');
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  links.forEach(link => link.addEventListener('click', async event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (checking) return;
    checking = true;
    opener = link;
    link.setAttribute('aria-busy', 'true');
    const live = await status();
    checking = false;
    link.removeAttribute('aria-busy');
    if (live) {
      setLiveLabels();
      window.location.assign('https://play.google.com/store/apps/details?id=com.threepointlab.cruxcut');
    } else { dialog.showModal(); }
  }));
  status().then(live => { if (live) setLiveLabels(); });
})();
