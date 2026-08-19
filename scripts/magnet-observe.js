// Extracted from index.html (line 22579) by Manus SEO pass — load order preserved

(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Ripple — fires on pointerdown, not click, so feedback is instant
  //    (Apple's "respond on pointer-down, not on release") ──
  document.addEventListener('pointerdown', function(e){
    var btn = e.target.closest('.btn-primary, .btn-outline, .btn-gold');
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 1.4;
    var span = document.createElement('span');
    span.className = 'btn-ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size/2) + 'px';
    span.style.top  = (e.clientY - r.top  - size/2) + 'px';
    btn.appendChild(span);
    span.addEventListener('animationend', function(){ span.remove(); });
  });

  // ── Magnetic hover — buttons drift a few px toward the cursor ──
  if (!reduceMotion && window.matchMedia && !window.matchMedia('(hover: none)').matches) {
    function attachMagnet(el) {
      if (el.__magnetBound) return;
      el.__magnetBound = true;
      var pressed = false;
      function apply(mx, my) {
        el.style.transform = 'translate(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px) scale(' + (pressed ? 0.96 : 1) + ')';
      }
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        apply((e.clientX - r.left - r.width/2) * 0.18, (e.clientY - r.top - r.height/2) * 0.28);
      });
      el.addEventListener('mousedown', function(){ pressed = true; el.style.transition = 'transform .12s ease-out'; });
      el.addEventListener('mouseup',   function(){ pressed = false; el.style.transition = ''; });
      el.addEventListener('mouseleave', function(){ pressed = false; el.style.transform = ''; el.style.transition = ''; });
    }
    function scanMagnet() {
      document.querySelectorAll('.btn-primary, .btn-gold, .nav-cta').forEach(attachMagnet);
    }
    scanMagnet();
    new MutationObserver(scanMagnet).observe(document.body, { childList:true, subtree:true });
  }

  // ── Scroll reveal — tag headings/sections/cards, then fade+rise them in ──
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    function tagAndObserve() {
      document.querySelectorAll('.section-title, .section-sub, .footer-col').forEach(function(el){
        if (el.__revealBound) return;
        el.__revealBound = true;
        el.classList.add('reveal-up');
        io.observe(el);
      });
      // Product cards already animate via .tilt-3d's `transform` — use the
      // fade-only variant so the two don't fight over the same CSS property.
      // Same treatment for every other card grid across About/B2B/FAQ/Reviews/
      // account pages — opacity-only keeps this safe next to each card's own
      // hover transform.
      document.querySelectorAll(
        '.product-card, .value-card, .testi-card, .cert-card, .blog-card, ' +
        '.cat-card, .cat-card-sm, .faq-item, .access-card, .rt-card, .pkg-card, ' +
        '.sub-card, .sub-prod-card, .earn-card, .refer-card, .b2b-svc-card, ' +
        '.b2b-mini-card, .ig-card, .inf-card, .rv-card, .ck-reco-card, ' +
        '.order-card, .brochure-card'
      ).forEach(function(el){
        if (el.__revealBound) return;
        el.__revealBound = true;
        el.classList.add('reveal-fade');
        io.observe(el);
      });
    }
    tagAndObserve();
    new MutationObserver(tagAndObserve).observe(document.body, { childList:true, subtree:true });
  }
})();
