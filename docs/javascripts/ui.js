(function() {
    // 1. INJECT PROGRESS BAR (Attached to the BOTTOM of the Header)
    var bar = document.createElement('div');
    bar.id = 'mkdocs-progress-bar';
    
    var header = document.querySelector('.md-header');
    if (header) {
        bar.style.cssText = 'position:absolute;bottom:0;left:0;height:4px;width:0%;background:#ff0055;z-index:100;transition:width 0.1s linear;pointer-events:none;box-shadow:0 2px 8px rgba(255,0,85,0.6);';
        header.appendChild(bar);
    } else {
        bar.style.cssText = 'position:fixed;top:0;left:0;height:4px;width:0%;background:#ff0055;z-index:9999999;transition:width 0.1s linear;pointer-events:none;box-shadow:0 0 10px #ff0055;';
        document.body.appendChild(bar);
    }

    // 2. UNIFIED SCROLL LOGIC (Updates Progress + Saves Bookmark)
    var scrollTimeout;
    function onScroll() {
        var h = document.documentElement;
        var scrollTop = window.pageYOffset || h.scrollTop;
        var scrollHeight = h.scrollHeight - h.clientHeight;
        var percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        // Update Progress Bar
        bar.style.width = percent + '%';

        // Save Bookmark (Debounced to prevent performance hits)
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            var path = window.location.pathname;
            localStorage.setItem('mkdocs-scroll-' + path, scrollTop);
        }, 200);
    }

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});

    // Save immediately if user switches tabs or closes window
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            var path = window.location.pathname;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            localStorage.setItem('mkdocs-scroll-' + path, scrollTop);
        }
    });

    // 3. THE OFFICIAL INSTANT NAV HOOK (Pure ES5 to survive the minifier)
    var waitForMkDocs = setInterval(function() {
        if (typeof document$ !== 'undefined') {
            clearInterval(waitForMkDocs);
            
            // document$ fires AFTER MkDocs has finished its internal DOM swap and scroll-to-top
            document$.subscribe(function() {
                bar.style.width = '0%';
                
                // Wait 200ms for MathJax SVGs to render and expand the page height
                setTimeout(function() {
                    if (!window.location.hash) {
                        var path = window.location.pathname;
                        var savedPos = localStorage.getItem('mkdocs-scroll-' + path);
                        if (savedPos !== null) {
                            // Restore the bookmark
                            window.scrollTo(0, parseInt(savedPos, 10));
                            // Manually trigger the scroll logic to update the progress bar
                            onScroll(); 
                        }
                    }
                }, 200); 
            });
        }
    }, 100);
    
    // Initial run on first page load
    onScroll();
})();