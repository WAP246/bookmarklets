javascript:(function(){
  const passUrl = 'https://example.com'; // your passthrough page
  const scriptUrl = 'https://raw.githubusercontent.com/WAP246/bookmarklets/main/pranks/gpu-glitch.js';

  const w = window.open(passUrl, '_blank');

  const interval = setInterval(() => {
    try {
      if (w.document && w.document.readyState === 'complete') {
        clearInterval(interval);
        const s = w.document.createElement('script');
        s.type = 'text/javascript';
        s.src = scriptUrl;
        w.document.body.appendChild(s);
      }
    } catch (e) {
      console.warn('Could not inject script:', e);
      clearInterval(interval);
    }
  }, 500);
})();
