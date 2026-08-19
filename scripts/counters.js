// Extracted from index.html (line 22480) by Manus SEO pass — load order preserved

(function(){
  var els = document.querySelectorAll('.fc-num');
  if (!els.length) return;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatNum(v, decimals) {
    if (decimals) return v.toFixed(decimals);
    return Math.round(v).toLocaleString('en-IN');
  }

  function runCount(el) {
    // The average-rating stat is fed by a live Supabase query. Until that
    // resolves there is no honest number to count to, so leave the em-dash
    // placeholder alone; setLiveRating() paints it when the data lands.
    if (el.dataset.liveRating === '1' && el.dataset.ready !== '1') return;
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    // FIX (audit item P1-15): counting a star-rating stat up from 0 means
    // visitors briefly see nonsense intermediate values like "1.6★"/"2.0★"
    // before it settles — reads as a rating that's climbing, which is
    // misleading. Rating-style stats (has decimals / a star suffix) fade in
    // at their final value instead; only integer stats (orders, pin codes,
    // dispatch hours) animate.
    var isRatingStat = decimals > 0 || suffix.indexOf('★') !== -1;
    if (reduceMotion || isRatingStat) {
      el.textContent = formatNum(target, decimals) + suffix;
      el.style.transition = 'opacity .5s ease';
      el.style.opacity = '0';
      requestAnimationFrame(function(){ el.style.opacity = '1'; });
      return;
    }
    var start = performance.now();
    var duration = 1400;
    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic, no overshoot
      el.textContent = formatNum(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { runCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(runCount);
  }
})();
