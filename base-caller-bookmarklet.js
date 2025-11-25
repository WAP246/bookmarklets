javascript:(function(){
  const passUrl = 'https://example.com';      // ← Replace with your passthrough website
  const scriptUrl = 'https://yourdomain.com/your-script.js';  // ← Replace with your JS file URL

  const w = window.open(passUrl, '_blank');

  // Poll until new window is loaded, then inject
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
      // Cross-origin? Might not be able to access w.document
      console.warn('Could not inject script:', e);
      clearInterval(interval);
    }
  }, 500);
})();
