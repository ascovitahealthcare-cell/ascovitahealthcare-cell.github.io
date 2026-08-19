// Extracted from index.html (line 9153) by Manus SEO pass — load order preserved

  (function(){
    var BADGES = ['15% off','10% off','20% off','5% off','10% off','5% off'];
    function buildCard(item, badge, deferImage){
      var hasSrc = item && item.src && item.src.trim();
      var page = (item && item.ctaPage) || 'shop';
      var media = hasSrc
        ? (item.type==='video'
            ? '<video class="pm-card-media" src="'+item.src+'"'+(item.poster?' poster="'+item.poster+'"':'')+' muted playsinline loop preload="metadata" autoplay></video>'
            // loading="lazy" is wrong on a marquee. Lazy only fires when an
            // element enters the VIEWPORT; this track is translated
            // horizontally, so the off-screen half never triggers a load and
            // you get blank tiles scrolling past. That is the "10 images but
            // 19 broken cards" report — the track renders `cards + cards`,
            // so 10 images become 20 tiles and the clone half stayed empty.
            // Eager + fixed dimensions (no CLS) + a hard failure path.
            : '<img class="pm-card-media" ' + (deferImage ? 'data-src="'+item.src+'"' : 'src="'+item.src+'"')
              + ' alt="'+((item.alt||'Ozylix promotion').replace(/"/g,'&quot;'))+'"'
              + (deferImage ? ' loading="lazy"' : ' loading="eager"')
              + ' decoding="async" fetchpriority="low" width="185" height="231"'
              + ' onerror="this.closest(\'.pm-card\').style.display=\'none\'">')
        : '<div class="pm-card-ph"><div class="pm-card-ph-inner">+</div></div>';
      return '<div class="pm-card" onclick="showPage(\''+page+'\')">'
        + media
        + '</div>';
    }
    function paintPromoMedia(data){
      var track = document.getElementById('pmTrack');
      if(!track) return;
      data = data && data.length ? data : [];
      // Only ever render as many cards as there is media for (capped at 12).
      // Padding to a minimum of 6 is what produced rows of empty "+" tiles.
      var n = Math.min(data.length, 12);
      var cards = '', clones = '';
      for(var i=0;i<n;i++){
        var item = data[i] || {};
        var badge = (item && item.discount) || BADGES[i%BADGES.length];
        // Only the first four original cards are likely to be above the fold.
        // The rest, and every decorative clone, hydrate just before entering
        // view instead of opening 2xN image connections during first paint.
        cards += buildCard(item, badge, i >= 4);
        clones += buildCard(item, badge, true);
      }
      // Duplicate for seamless infinite loop. The clone is decorative and
      // must be hidden from assistive tech, otherwise a screen reader
      // announces every promo twice.
      track.innerHTML = cards
        + '<div class="pm-clone" aria-hidden="true" role="presentation" style="display:contents">' + clones + '</div>';
      var pending = track.querySelectorAll('img[data-src]');
      function hydrate(img) {
        if (!img || !img.dataset.src) return;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      if (pending.length && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) { hydrate(entry.target); io.unobserve(entry.target); }
          });
        }, { rootMargin: '500px 800px 500px 800px' });
        pending.forEach(function(img) { io.observe(img); });
        // Never leave a marquee tile blank if a browser does not report the
        // translated track as intersecting; finish the remainder after idle.
        setTimeout(function() { pending.forEach(hydrate); }, 5000);
      } else {
        pending.forEach(hydrate);
      }
      track.querySelectorAll('video').forEach(function(v){
        v.muted = true;
        v.setAttribute('playsinline','');
        v.addEventListener('loadstart',function(){ v.play().catch(function(){}); });
        // Hover still pauses so users can stare at a still tile without
        // losing data — it resumes 0.5s after the cursor leaves.
        v.addEventListener('mouseenter',function(){ try{v.pause();}catch(e){} });
        v.addEventListener('mouseleave',function(){ v.currentTime=0; v.play().catch(function(){}); });
        // iOS needs an explicit kick for muted autoplay videos inside a
        // translated container.
        v.play().catch(function(){});
      });
    }
    // A card is only worth showing if it actually carries media. The admin
    // list still holds the blank rows from when every image was cleared,
    // and `remote.length` counted those — so the uploaded images painted,
    // then the backend answered a second later and replaced them all with
    // empty placeholders. That is the "images appear then vanish" report.
    function usable(list){
      return (Array.isArray(list) ? list : []).filter(function(it){
        return it && typeof it.src === 'string' && it.src.trim();
      });
    }
    function renderPromoMedia(){
      // Local PROMO_MEDIA.js paints immediately so the carousel is never empty/late.
      var local = usable(typeof PROMO_MEDIA !== 'undefined' ? PROMO_MEDIA : []);
      paintPromoMedia(local);

      var section = document.getElementById('promo-media-section');
      if (section && !local.length) section.style.display = 'none';

      // Then ask the admin-managed backend. It only takes over if it has
      // real media — never to blank out cards that are already showing.
      var base = (typeof API_BASE !== 'undefined') ? API_BASE : 'https://ascovitahealthcare-cell-github-io.onrender.com';
      // The backend is a free Render instance that can be asleep; without a
      // deadline this request can sit open for 30s holding a connection.
      var ctl = ('AbortController' in window) ? new AbortController() : null;
      var timer = setTimeout(function(){ ctl && ctl.abort(); }, 6000);
      var startRemote = window.requestIdleCallback
        ? function(fn){ window.requestIdleCallback(fn, {timeout: 1400}); }
        : function(fn){ setTimeout(fn, 900); };
      startRemote(function(){ fetch(base + '/api/promo-media', ctl ? { signal: ctl.signal } : undefined)
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
          clearTimeout(timer);
          var cdn = (typeof cdnImg === 'function') ? cdnImg : function(u){ return u; };
          var remote = usable(d && (d.data || d.items || d)).map(function(m){
            if (m && typeof m === 'object') {
              var t = m.type || mediaTypeFromUrl(m.src);
              return Object.assign({}, m, { type: t, src: cdn(m.src), poster: cdn(m.poster) });
            }
            return m;
          });
          if (remote.length) {
            paintPromoMedia(remote);
            if (section) section.style.display = '';
          }
        })
        .catch(function(){ clearTimeout(timer); /* keep local PROMO_MEDIA.js cards */ });
      });
    }
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',renderPromoMedia); }
    else { renderPromoMedia(); }
  })();
  