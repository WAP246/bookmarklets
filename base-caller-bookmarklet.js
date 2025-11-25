javascript:(function(){
  const passUrl = 'https://example.com'; // Replace with your site
  const scriptUrl = 'https://yourdomain.com/gpu-glitch.js'; // Must be CORS-accessible or same origin

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
