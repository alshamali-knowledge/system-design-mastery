window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process|arithmatex",
    enableMenu: false // Kept for accessibility
  },
  svg: {
    fontCache: 'global'
  }
};

// The Instant Navigation Hook
document$.subscribe(() => { 
  if (window.MathJax && MathJax.typesetPromise) {
    // 1. THE FIX: Wipe MathJax's memory of the old page's DOM nodes
    // This detaches the broken menu listeners from the previous page
    if (MathJax.typesetClear) {
      MathJax.typesetClear();
    }
    
    // 2. Re-render the new page and re-attach fresh menu listeners
    MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
  }
});