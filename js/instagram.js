// ══════════════════════════════════════════════════════════
// INSTAGRAM FEED — Live from Render backend
// Backend fetches from Instagram Graph API using your token
// Setup: add INSTAGRAM_TOKEN to Render env vars
// ══════════════════════════════════════════════════════════

(function() {

  var IG_API = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/instagram';
  var CARDS_VISIBLE = window.innerWidth < 600 ? 2 : window.innerWidth < 900 ? 3 : 5;
  var igPosts = [];
  var igIndex = 0;
  var igTotal = 0;
  var igAutoTimer = null;

  // ── FETCH POSTS ──
  async function loadInstagram() {
    try {
      var r = await fetch(IG_API, { signal: makeSignal(10000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var data = await r.json();
      igPosts = (data.data || data).filter(function(p) {
        return p.media_type !== 'VIDEO' || p.thumbnail_url;
      }).slice(0, 12);
      if (!igPosts.length) throw new Error('No posts');
      renderIgSlider();
    } catch(e) {
      // Show fallback / error state
      document.getElementById('igError').style.display = 'block';
      document.getElementById('igTrack').style.display = 'none';
      document.getElementById('igDots').style.display = 'none';
      document.querySelector('.ig-prev').style.display = 'none';
      document.querySelector('.ig-next').style.display = 'none';
    }
  }

  // ── RENDER CARDS ──
  function renderIgSlider() {
    var track = document.getElementById('igTrack');
    if (!track) return;
    igTotal = igPosts.length;

    track.innerHTML = igPosts.map(function(p, i) {
      var imgSrc = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
      var caption = (p.caption || '').replace(/[#@]\S+/g, '').trim().slice(0, 120);
      var typeLabel = p.media_type === 'VIDEO' ? '▶ Reel' : p.media_type === 'CAROUSEL_ALBUM' ? '⊞ Album' : '';
      return '<a class="ig-card" href="' + p.permalink + '" target="_blank" rel="noopener" data-reveal="scale" data-delay="' + Math.min(i % 5 + 1, 5) + '">' +
        '<img src="' + imgSrc + '" alt="Ascovita Instagram post" loading="lazy" onerror="this.closest(\'.ig-card\').style.display=\'none\'">' +
        (typeLabel ? '<div class="ig-type-badge">' + typeLabel + '</div>' : '') +
        '<div class="ig-overlay">' +
          (caption ? '<div class="ig-caption">' + escHtml(caption) + '</div>' : '') +
          '<div class="ig-meta">' +
            '<span>❤️ ' + fmtNum(p.like_count || 0) + '</span>' +
            '<span>💬 ' + fmtNum(p.comments_count || 0) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    buildDots();
    updateSlider();
    startAutoPlay();

    // Re-trigger scroll reveal for new cards
    if (typeof tagSections === 'function') setTimeout(tagSections, 100);
  }

  // ── DOTS ──
  function buildDots() {
    var el = document.getElementById('igDots');
    if (!el) return;
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    el.innerHTML = Array.from({length: pages}, function(_, i) {
      return '<button class="ig-dot' + (i === 0 ? ' active' : '') + '" onclick="igGoTo(' + i + ')"></button>';
    }).join('');
  }

  // ── SLIDE ──
  window.igSlide = function(dir) {
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    igIndex = (igIndex + dir + pages) % pages;
    updateSlider();
    resetAutoPlay();
  };

  window.igGoTo = function(page) {
    igIndex = page;
    updateSlider();
    resetAutoPlay();
  };

  function updateSlider() {
    var track = document.getElementById('igTrack');
    if (!track) return;
    var cardW = track.querySelector('.ig-card');
    if (!cardW) return;
    var gap = 14;
    var cardWidth = cardW.getBoundingClientRect().width + gap;
    track.style.transform = 'translateX(-' + (igIndex * CARDS_VISIBLE * cardWidth) + 'px)';

    // Update dots
    document.querySelectorAll('.ig-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === igIndex);
    });

    // Update nav buttons
    var pages = Math.ceil(igTotal / CARDS_VISIBLE);
    var prev = document.querySelector('.ig-prev');
    var next = document.querySelector('.ig-next');
    if (prev) prev.disabled = igTotal <= CARDS_VISIBLE;
    if (next) next.disabled = igTotal <= CARDS_VISIBLE;
  }

  function startAutoPlay() {
    igAutoTimer = setInterval(function() { igSlide(1); }, 4000);
  }
  function resetAutoPlay() {
    clearInterval(igAutoTimer);
    startAutoPlay();
  }

  // ── HELPERS ──
  function fmtNum(n) { return n > 999 ? (n/1000).toFixed(1) + 'k' : n; }
  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', function() {
    // Only load when section scrolls into view (saves bandwidth)
    var section = document.getElementById('igSection');
    if (!section) return;
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        loadInstagram();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(section);
  });

})();

(function(){
  var IG_BACKEND = 'https://ascovitahealthcare-cell-github-io.onrender.com/api/instagram';

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtN(n){ return n > 999 ? (n/1000).toFixed(1)+'k' : (n||0); }

  async function loadUGC(){
    var grid = document.getElementById('ugcGrid');
    if(!grid) return;
    try {
      var r = await fetch(IG_BACKEND, { signal: makeSignal(10000) });
      if(!r.ok) throw new Error('HTTP '+r.status);
      var data = await r.json();
      var posts = (data.data || data)
        .filter(function(p){ return p.media_url || p.thumbnail_url; })
        .slice(0, 5);   // always latest 5
      if(!posts.length) throw new Error('empty');

      grid.innerHTML = posts.map(function(p){
        var img  = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
        var cap  = (p.caption||'').replace(/[#@]\S+/g,'').trim().slice(0,100);
        var isVid = p.media_type === 'VIDEO';
        var isAlb = p.media_type === 'CAROUSEL_ALBUM';
        return '<a class="ugc-tile" href="'+p.permalink+'" target="_blank" rel="noopener" title="View on Instagram">'
          + '<img src="'+img+'" alt="Ascovita Instagram" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease" onerror="this.closest(\'.ugc-tile\').style.display=\'none\'">'
          + (isVid  ? '<div class="ugc-vid-badge">▶ Reel</div>' : '')
          + (isAlb  ? '<div class="ugc-vid-badge">⊞</div>'      : '')
          + '<div class="ugc-tile-ov">'
          +   '<div class="ugc-tile-ov-ico">📸</div>'
          +   (cap ? '<div class="ugc-tile-caption">'+esc(cap)+'</div>' : '')
          +   '<div class="ugc-tile-likes"><span>❤️ '+fmtN(p.like_count)+'</span><span>💬 '+fmtN(p.comments_count)+'</span></div>'
          + '</div>'
          + '</a>';
      }).join('');

      /* zoom-on-hover for real images */
      grid.querySelectorAll('.ugc-tile img').forEach(function(img){
        img.closest('.ugc-tile').addEventListener('mouseenter',function(){ img.style.transform='scale(1.07)'; });
        img.closest('.ugc-tile').addEventListener('mouseleave',function(){ img.style.transform='scale(1)'; });
      });

    } catch(e){
      /* fallback — keep the emoji placeholders but make them clickable */
      grid.innerHTML = [
        {bg:'linear-gradient(135deg,#EAF2E0,#D4E8C0)', ico:'💚'},
        {bg:'linear-gradient(135deg,#FDF6E3,#EAF2E0)', ico:'🌿'},
        {bg:'linear-gradient(135deg,#EAF2E0,#F4F8EF)', ico:'✨'},
        {bg:'linear-gradient(135deg,#F4F8EF,#EAF2E0)', ico:'🌱'},
        {bg:'linear-gradient(135deg,#D4E8C0,#EAF2E0)', ico:'💊'}
      ].map(function(t){
        return '<a class="ugc-tile" href="https://instagram.com/ascovita_healthcare" target="_blank" style="background:'+t.bg+';font-size:2.5rem;display:flex;align-items:center;justify-content:center;text-decoration:none">'
          + t.ico
          + '<div class="ugc-tile-ov"><div class="ugc-tile-ov-ico">📸</div><div class="ugc-tile-ov-txt">View on Instagram</div></div>'
          + '</a>';
      }).join('');
    }
  }

  /* lazy-load: fire only when section scrolls into view */
  document.addEventListener('DOMContentLoaded', function(){
    var sec = document.getElementById('ugcSection');
    if(!sec) return;
    new IntersectionObserver(function(entries, obs){
      if(entries[0].isIntersecting){ loadUGC(); obs.disconnect(); }
    }, {threshold:0.1}).observe(sec);
  });
})();
