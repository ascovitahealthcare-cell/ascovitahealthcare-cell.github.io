// Extracted from index.html (line 22540) by Manus SEO pass — load order preserved

(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (reduceMotion || isTouch) return;

  function attachTilt(el, maxDeg) {
    if (!el || el.__tiltBound) return;
    el.__tiltBound = true;
    el.classList.add('tilt-3d');
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;   // 0..1
      var rx = (px - 0.5) * (maxDeg * 2);
      var ry = (0.5 - py) * (maxDeg * 2);
      el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', function(){
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  function scan() {
    document.querySelectorAll('.product-card').forEach(function(el){ attachTilt(el, 5); });
    document.querySelectorAll('.slide-visual').forEach(function(el){ attachTilt(el, 4); });
  }

  scan();
  // Re-scan when the SPA renders new product grids / hero slides.
  var mo = new MutationObserver(function(){ scan(); });
  mo.observe(document.body, { childList:true, subtree:true });
})();
