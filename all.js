// ═══════════════════════════════════════════════════════════
// ASCOVITA ANIMATION ENGINE v2
// Scroll-reveal · Cursor glow · Click waves · Parallax
// Particle system · Scroll progress · Nav shrink
// ═══════════════════════════════════════════════════════════
(function() {

  // ── SCROLL PROGRESS BAR ──
  const bar = document.getElementById('scrollBar');
  window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (scrolled / max * 100) + '%';
  }, { passive: true });

  // ── NAVBAR SHRINK ON SCROLL ──
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── CLICK WAVE ──
  document.addEventListener('click', function(e) {
    const wave = document.createElement('div');
    wave.className = 'click-wave';
    wave.style.left = e.clientX + 'px';
    wave.style.top  = e.clientY + 'px';
    document.body.appendChild(wave);
    setTimeout(function() { wave.remove(); }, 700);

    // Ripple on buttons
    const btn = e.target.closest('.btn-primary, .btn-gold, .btn-outline, .add-cart-btn');
    if (btn) {
      const r = document.createElement('span');
      r.className = 'ripple-effect';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
      btn.appendChild(r);
      setTimeout(function(){ r.remove(); }, 700);
    }
  });

  // ── CART BADGE BUMP ──
  const _origUpdateCartUI = null;
  document.addEventListener('DOMContentLoaded', function() {
    const badges = document.querySelectorAll('.cart-badge');
    // Observe cart badge changes
    const cartObs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.target.classList.contains('cart-badge')) {
          m.target.classList.remove('bump');
          void m.target.offsetWidth;
          m.target.classList.add('bump');
        }
      });
    });
    badges.forEach(function(b) { cartObs.observe(b, { childList:true, characterData:true, subtree:true }); });
  });

  // ── SCROLL REVEAL ENGINE ──
  function initScrollReveal() {
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function(el) {
      obs.observe(el);
    });
  }

  // ── ADD data-reveal ATTRIBUTES DYNAMICALLY ──
  function tagSections() {
    // Section labels
    document.querySelectorAll('.section-label:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', '1');
    });
    // Section titles
    document.querySelectorAll('.section-title:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', '2');
    });
    // Section subs
    document.querySelectorAll('.section-sub:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', '3');
    });
    // Product cards — staggered
    document.querySelectorAll('#featuredGrid .product-card:not([data-reveal]), #newArrivalsGrid .product-card:not([data-reveal]), #shopGrid .product-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'scale');
      el.setAttribute('data-delay', String(Math.min(i % 4 + 1, 6)));
    });
    // Category cards
    document.querySelectorAll('.cat-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', String(Math.min(i + 1, 6)));
    });
    // Cert/trust cards
    document.querySelectorAll('.cert-card:not([data-reveal]), .value-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'flip');
      el.setAttribute('data-delay', String(Math.min(i % 4 + 1, 5)));
    });
    // Blog cards
    document.querySelectorAll('.blog-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', String(Math.min(i + 1, 4)));
    });
    // Testimonials
    document.querySelectorAll('.testi-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'scale');
      el.setAttribute('data-delay', String(Math.min(i + 1, 4)));
    });
    // AT items (about timeline)
    document.querySelectorAll('.at-item:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', i % 2 === 0 ? 'left' : 'right');
      el.setAttribute('data-delay', '1');
    });
    // Stat cards
    document.querySelectorAll('.stat-card:not([data-reveal]), .stat-num:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', String(Math.min(i + 1, 4)));
    });
    // Hero floats
    document.querySelectorAll('.hero-float:not([data-reveal])').forEach(function(el) {
      el.setAttribute('data-reveal', 'scale');
    });
    // Cert badges
    document.querySelectorAll('.cert-badge:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', String(Math.min(i + 1, 4)));
    });
    // B2B cards
    document.querySelectorAll('.b2b-card:not([data-reveal]), .b2b-step:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'up');
      el.setAttribute('data-delay', String(Math.min(i % 3 + 1, 4)));
    });
    // FAQ items
    document.querySelectorAll('.faq-item:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'left');
      el.setAttribute('data-delay', String(Math.min(i % 3 + 1, 4)));
    });
    // Integration cards
    document.querySelectorAll('.intg-card:not([data-reveal])').forEach(function(el, i) {
      el.setAttribute('data-reveal', 'scale');
      el.setAttribute('data-delay', String(Math.min(i + 1, 5)));
    });

    initScrollReveal();
  }

  // ── RE-TAG after dynamic renders ──
  var _origRenderProductCard = null;
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(tagSections, 300);

    // Re-init reveal after shop/product grids re-render
    var renderObserver = new MutationObserver(function(mutations) {
      var shouldRetag = mutations.some(function(m) {
        return m.target.id === 'shopGrid' || m.target.id === 'featuredGrid' ||
               m.target.id === 'newArrivalsGrid' || m.target.id === 'relatedGrid';
      });
      if (shouldRetag) setTimeout(tagSections, 100);
    });
    ['shopGrid','featuredGrid','newArrivalsGrid','relatedGrid','homeFaqWrap'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) renderObserver.observe(el, { childList:true });
    });
  });

  // ── FLOATING PARTICLES ──
  function spawnParticles() {
    var colors = ['rgba(78,138,40,0.3)', 'rgba(184,134,11,0.25)', 'rgba(78,138,40,0.2)', 'rgba(232,160,32,0.2)'];
    var sizes  = [4, 6, 8, 10, 5, 7];
    for (var i = 0; i < 8; i++) {
      (function(i) {
        setTimeout(function() {
          var p = document.createElement('div');
          p.className = 'particle';
          var size = sizes[i % sizes.length];
          p.style.cssText = [
            'width:' + size + 'px',
            'height:' + size + 'px',
            'left:' + (Math.random() * 100) + '%',
            'background:' + colors[i % colors.length],
            'animation-duration:' + (12 + Math.random() * 16) + 's',
            'animation-delay:' + (Math.random() * 8) + 's',
          ].join(';');
          document.body.appendChild(p);
        }, i * 1200);
      })(i);
    }
  }
  spawnParticles();

  // ── PARALLAX on HERO images ──
  var heroVisual = document.querySelector('.hero-visual');
  window.addEventListener('scroll', function() {
    if (!heroVisual) return;
    var scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroVisual.style.transform = 'translateY(' + (scrollY * 0.12) + 'px)';
    }
  }, { passive: true });

  // ── COUNTER ANIMATION for hero stats ──
  function animateCounter(el, target, prefix, suffix) {
    var start = 0;
    var duration = 1800;
    var step = target / (duration / 16);
    var current = 0;
    var timer = setInterval(function() {
      current = Math.min(current + step, target);
      el.textContent = prefix + Math.floor(current).toLocaleString('en-IN') + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Animate hero stat numbers when visible
    var heroObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var counters = entry.target.querySelectorAll('[data-count]');
          counters.forEach(function(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var prefix = el.getAttribute('data-prefix') || '';
            var suffix = el.getAttribute('data-suffix') || '';
            animateCounter(el, target, prefix, suffix);
          });
          heroObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    var heroTrust = document.querySelector('.hero-trust');
    if (heroTrust) heroObs.observe(heroTrust);

    // Animate all [data-count] elements when visible
    var counterObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count'));
          var prefix = el.getAttribute('data-prefix') || '';
          var suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, prefix, suffix);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function(el) {
      counterObs.observe(el);
    });

    // Wrap showPage AFTER main app defines it (poll until available)
    var _spWrapTimer = setInterval(function() {
      if (typeof window.showPage === 'function' && !window._animSPWrapped) {
        window._animSPWrapped = true;
        var _origSP = window.showPage;
        window.showPage = function(pg) { _origSP(pg); setTimeout(tagSections, 200); };
        clearInterval(_spWrapTimer);
      }
    }, 150);
  });

})();


// ══════════════════════════════════════════════════════════
// INSTAGRAM FEED — Live from Render backend
// Backend fetches from Instagram Graph API using your token
// Setup: add INSTAGRAM_TOKEN to Render env vars
// ══════════════════════════════════════════════════════════

(function() {

  var IG_API = 'https://ascovita-backend.onrender.com/api/instagram';
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
  var IG_BACKEND = 'https://ascovita-backend.onrender.com/api/instagram';

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


// ═══════════════════════════════════════════════════════
// WHATSAPP INTEGRATION — +91 98985 82650
// ═══════════════════════════════════════════════════════
const WA_NUMBER = '919898582650';

function openWhatsApp(msg) {
  const encoded = encodeURIComponent(msg || 'Hello! I have a question about Ascovita.');
  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encoded, '_blank');
}

function toggleWAPopup() {
  const popup = document.getElementById('waChatPopup');
  if (popup) popup.classList.toggle('open');
}

// Auto-show WA popup after 45 seconds on first visit
setTimeout(() => {
  if (!sessionStorage.getItem('wa_shown')) {
    const popup = document.getElementById('waChatPopup');
    if (popup) popup.classList.add('open');
    sessionStorage.setItem('wa_shown', '1');
  }
}, 45000);

// B2B Enquiry form → opens WhatsApp with pre-filled message
function submitB2BEnquiry() {
  const company = document.getElementById('b2bCompany')?.value.trim() || '';
  const name    = document.getElementById('b2bName')?.value.trim() || '';
  const phone   = document.getElementById('b2bPhone')?.value.trim() || '';
  const email   = document.getElementById('b2bEmail')?.value.trim() || '';
  const type    = document.getElementById('b2bType')?.value || '';
  const msg     = document.getElementById('b2bMsg')?.value.trim() || '';

  if (!name || !phone) {
    showToast('Please enter your name and phone number.'); return;
  }

  const waMsg = `Hello Ascovita! 🌿 B2B Enquiry\n\n` +
    `Company: ${company || 'N/A'}\n` +
    `Contact: ${name}\n` +
    `Phone: ${phone}\n` +
    `Email: ${email || 'N/A'}\n` +
    `Partnership Type: ${type || 'General'}\n\n` +
    `Requirements:\n${msg || 'Please share details about your B2B programme.'}`;

  openWhatsApp(waMsg);
  showToast('Opening WhatsApp with your enquiry! ');
}

// ═══════════════════════════════════════════════════════
// ASCOVITA STORE — PRODUCT DATA & ENGINE
// ═══════════════════════════════════════════════════════
// ========== ASCOVITA PRODUCT DATA ==========
// ══════════════════════════════════════════════════════════════

function makeSignal(ms) {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(new DOMException('Timeout','TimeoutError')); }, ms);
  ctrl.signal.addEventListener('abort', function() { clearTimeout(tid); }, {once:true});
  return ctrl.signal;
}
// BACKEND CONNECTION — Supabase via Render API
// Admin changes (products, stock, coupons) reflect here live
// ══════════════════════════════════════════════════════════════
const API_BASE = 'https://ascovita-backend.onrender.com';

// Merge backend product data over static product array — ALL fields synced
function mergeBackendProducts(backendProducts) {
  if (!backendProducts || !backendProducts.length) return;

  const parseArr = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') { try { return JSON.parse(val); } catch(e) { return val.split(',').map(s=>s.trim()).filter(Boolean); } }
    return [];
  };

  backendProducts.forEach(bp => {
    bp.id = parseInt(bp.id);
    const idx = PRODUCTS.findIndex(p => p.id === bp.id);

    if (idx >= 0) {
      const p = PRODUCTS[idx];
      // Price & sale
      if (bp.price      != null) p.price     = parseFloat(bp.price);
      p.salePrice = bp.sale_price ? parseFloat(bp.sale_price) : null;
      // Stock & visibility
      if (bp.stock      != null) p.stock     = parseInt(bp.stock);
      if (bp.active     != null) p.active    = bp.active;
      if (bp.active === false)   p._hidden   = true; else p._hidden = false;
      // Text fields
      if (bp.name)        p.name        = bp.name;
      if (bp.brand)       p.brand       = bp.brand;
      if (bp.description) p.description = bp.description;
      if (bp.badge)       p.badge       = bp.badge;
      if (bp.offer_text !== undefined) p.offer = bp.offer_text || null;  // ✅ FIX 4: allow clearing offer
      else if (bp.offer !== undefined)  p.offer = bp.offer || null;
      if (bp.category)    p.category    = bp.category;
      if (bp.how_to_use)  p.howToUse    = bp.how_to_use;
      // Rating
      if (bp.rating != null) p.rating   = parseFloat(bp.rating);
      if (bp.reviews != null) p.reviews = parseInt(bp.reviews);
      // Tags
      if (bp.tags) p.tags = parseArr(bp.tags);
      // Media — support media[] JSON array (up to 10 images/videos) OR individual fields
      const mediaArr = parseArr(bp.media || bp.images);
      if (mediaArr.length) {
        p.media = mediaArr.slice(0, 10); // [{url, type:"image"|"video", thumb}]
        // Back-compat flat fields
        p.image  = (mediaArr[0] && mediaArr[0].url) || mediaArr[0] || p.image;
        p.image2 = (mediaArr[1] && mediaArr[1].url) || mediaArr[1] || '';
        p.allImages = mediaArr.map(m => m.url || m).filter(Boolean);
      } else {
        if (bp.image)  p.image  = bp.image;
        if (bp.image2) p.image2 = bp.image2;
        // Build media array from individual fields for back-compat
        const legacyUrls = [bp.image,bp.image2,bp.image3,bp.image4,bp.image5].filter(Boolean);
        if (legacyUrls.length) p.media = legacyUrls.map(u=>({url:u,type:'image',thumb:u}));
      }
      // Key Ingredients
      const ki = parseArr(bp.key_ingredients);
      if (ki.length) p.keyIngredients = ki;
      // SEO
      if (bp.seo_keywords) p.seoKeywords = parseArr(bp.seo_keywords);
      if (bp.meta_description) p.metaDescription = bp.meta_description;
      // Tiers flag
      if (bp.has_tiers != null) p.hasTiers = bp.has_tiers;
      if (bp.tiers) {
        try {
          // Handle both: already-parsed array OR JSON string from Supabase
          const parsed = Array.isArray(bp.tiers) ? bp.tiers : JSON.parse(bp.tiers);
          // Validate it's a proper tiers array with expected fields
          if (Array.isArray(parsed) && parsed.length && parsed[0].rate != null) {
            p._backendTiers = parsed;
          }
        } catch(e) { console.warn('Tiers parse error for product', bp.id, e); }
      }
    } else if (bp.active !== false) {
      // New product from admin — add to store
      const imgs = parseArr(bp.images);
      const ki   = parseArr(bp.key_ingredients);
      PRODUCTS.push({
        id:          parseInt(bp.id),
        name:        bp.name,
        brand:       bp.brand || 'Ascovita',
        category:    bp.category || 'effervescent',
        // ✅ FIX 3: Use actual tags from backend, NOT auto-tagged featured/new
        tags:        parseArr(bp.tags).length ? parseArr(bp.tags) : [],
        price:       bp.price != null ? parseFloat(bp.price) : null,
        salePrice:   bp.sale_price ? parseFloat(bp.sale_price) : null,
        offer:       bp.offer_text || bp.offer || null,
        media:       (()=>{ const m=parseArr(bp.media||bp.images); return m.length?m.slice(0,10).map(x=>typeof x==='string'?{url:x,type:'image',thumb:x}:x):[]; })(),
        image:       imgs[0] || bp.image || '',
        image2:      imgs[1] || bp.image2 || '',
        allImages:   imgs,
        rating:      parseFloat(bp.rating) || 4.5,
        reviews:     parseInt(bp.reviews) || 0,
        stock:       parseInt(bp.stock) || 100,
        badge:       bp.badge || '',
        description: bp.description || '',
        keyIngredients: ki,
        howToUse:    bp.how_to_use || '',
        hasTiers:    bp.has_tiers || false,
        _backendTiers: (() => { try { const t = Array.isArray(bp.tiers) ? bp.tiers : JSON.parse(bp.tiers||'null'); return (Array.isArray(t) && t.length && t[0].rate != null) ? t : null; } catch(e) { return null; } })(),
        seoKeywords: parseArr(bp.seo_keywords),
        active:      true,
        _hidden:     false,
      });
    }
  });
}

// Live coupon validation against backend (used in applyPromoCode below)
async function validateCouponWithBackend(code, subtotal) {
  try {
    const r = await fetch(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({code, subtotal}),
      signal: makeSignal(5000)
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.valid ? d : null;
  } catch(e) { return null; }
}

// Fetch live products from backend on page load (non-blocking)
// Handles Render free tier cold-starts gracefully with retry logic
async function syncProductsFromBackend() {
  const MAX_ATTEMPTS = 3; // 3 attempts × escalating timeouts = up to 2min total
  const TIMEOUTS     = [20000, 40000, 60000]; // escalating timeouts for Render cold start (up to 50s)
  const RETRY_DELAY  = 3000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }

      // ✅ Cache-bust so browser never serves stale product data
      const r = await fetch(`${API_BASE}/api/products?_t=${Date.now()}`, {
        signal: makeSignal(TIMEOUTS[attempt]),
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      if (!r.ok) {
        if (attempt < MAX_ATTEMPTS - 1) continue;
        return;
      }

      const data = await r.json();
      const products = data.data || data;
      if (Array.isArray(products) && products.length) {
        mergeBackendProducts(products);
        // Re-render all grids with updated data (including new backend products)
        try { renderFeatured(); } catch(e){}
        try { renderNewArrivals(); } catch(e){}
        try {
          const sg = document.getElementById('shopGrid');
          if(sg) renderShopGrid();
        } catch(e){}
        // Update prices, images, offers on all visible product cards
        try { updateAllProductCards(); } catch(e){}
        // Re-render product detail page if currently open (so price/tiers update instantly)
        try {
          const prodPage = document.getElementById('page-product');
          if (prodPage && prodPage.style.display !== 'none' && window._currentProductId) {
            const cp = PRODUCTS.find(p => p.id === window._currentProductId);
            if (cp) buildProductPage(cp);
          }
        } catch(e) {}

        // Push local QTY_TIERS to backend for any product missing tiers in DB
        // This ensures admin sees tier data even before it's been set manually
        try { pushLocalTiersToBackend(products); } catch(e) {}

        console.log('[Ascovita] ✅ Backend sync OK — ' + products.length + ' products');
        return; // success — stop retrying
      }
    } catch(e) {
      console.warn('[Ascovita] ⚠️ Sync attempt ' + (attempt+1) + ' failed:', e.name, e.message);
      const isTimeout = e.name === 'TimeoutError' || e.name === 'AbortError';
      if (isTimeout && attempt < MAX_ATTEMPTS - 1) {
        continue;
      }
      return;
    }
  }
}

// Push local QTY_TIERS to backend for products that have no tiers set in DB
// Runs once after first successful sync — skips products that already have tiers
async function pushLocalTiersToBackend(backendProducts) {
  const productsWithoutTiers = backendProducts.filter(bp => {
    if (!bp.has_tiers && !bp.tiers) {
      const lt = QTY_TIERS[parseInt(bp.id)];
      return lt && lt.length > 0 && lt[0].rate != null;
    }
    return false;
  });
  if (!productsWithoutTiers.length) return;
  for (const bp of productsWithoutTiers) {
    try {
      const lt = QTY_TIERS[parseInt(bp.id)];
      await fetch(`${API_BASE}/api/products/${bp.id}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({has_tiers:true, tiers:JSON.stringify(lt)})
      });
    } catch(e) {}
  }
}

// ✅ FIX 2 & 5: Standalone render functions used after backend sync
function renderFeatured() {
  const visible = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const feat = visible.filter(p => p.tags.includes('featured')).slice(0,8);
  const fg = document.getElementById('featuredGrid');
  if (fg) fg.innerHTML = feat.map(p => renderProductCard(p)).join('');
}
function renderNewArrivals() {
  const visible = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const newP = visible.filter(p => p.tags.includes('new')).slice(0,4);
  const nag = document.getElementById('newArrivalsGrid');
  if (nag) nag.innerHTML = newP.map(p => renderProductCard(p)).join('');
}
function renderShopGrid() { applyFilters(); }

// Re-render all visible product cards after backend sync — full replacement
function updateAllProductCards() {
  document.querySelectorAll('[data-product-id]').forEach(card => {
    const id = parseInt(card.dataset.productId);
    const p = PRODUCTS.find(x => x.id === id);
    if (!p || !card.parentNode) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderProductCard(p);
    const nc = tmp.firstElementChild;
    if (nc) card.parentNode.replaceChild(nc, card);
  });
}

// Updated: New products, Cashfree payment, Shiprocket integration

const ASCOVITA_LOGO = "https://static.wixstatic.com/media/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png/v1/fill/w_346,h_166,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f0adaf_05a2b4385ab84453aa9c2e9a1cec4b97~mv2.png";

// Cashfree config is handled via backend environment variables

const SHIPROCKET_CONFIG = {
  trackingUrl: 'https://shiprocket.co/tracking/',
  pickup_location: 'Primary',   // Must match warehouse name in Shiprocket panel
  apiBase: API_BASE,
  // NOTE: credentials are stored securely in backend environment variables only
};

// ── QTY_TIERS: fallback static tiers (overridden by backend tiers if set in admin) ──
// Keys must match product IDs in the PRODUCTS array below.
const QTY_TIERS = {
  // ── L-Glutathione Effervescent Orange (id:1) ──
  1:  [{tabs:15,mrp:899, rate:584, discountPct:35},{tabs:30,mrp:1798,rate:1078,discountPct:40},{tabs:45,mrp:2697,rate:1483,discountPct:45},{tabs:60,mrp:3596,rate:1798,discountPct:50}],
  // ── ACV + Moringa Green Apple (id:2) ──
  2:  [{tabs:15,mrp:349, rate:299, discountPct:14},{tabs:30,mrp:698, rate:565, discountPct:19},{tabs:45,mrp:1047,rate:796, discountPct:24},{tabs:60,mrp:1396,rate:977, discountPct:30}],
  // ── L-Carnitine Orange (id:3) ──
  3:  [{tabs:15,mrp:469, rate:399, discountPct:15},{tabs:30,mrp:938, rate:750, discountPct:20},{tabs:45,mrp:1407,rate:1055,discountPct:25},{tabs:60,mrp:1876,rate:1219,discountPct:35}],
  // ── B12 + Biotin Guava (id:4) ──
  4:  [{tabs:15,mrp:599, rate:449, discountPct:25},{tabs:30,mrp:1198,rate:862, discountPct:28},{tabs:45,mrp:1797,rate:1221,discountPct:32},{tabs:60,mrp:2396,rate:1557,discountPct:35}],
  // ── Vitamin C Orange (id:5) ──
  5:  [{tabs:15,mrp:349, rate:249, discountPct:28},{tabs:30,mrp:698, rate:488, discountPct:30},{tabs:45,mrp:1047,rate:711, discountPct:32},{tabs:60,mrp:1396,rate:921, discountPct:34}],
  // ── Multidiata Box Pack (id:8) ──
  8:  [{tabs:30,mrp:150, rate:120, discountPct:20},{tabs:60,mrp:289, rate:231, discountPct:20}],
  // ── VitaPlus B12+D3 Vegan (id:10) ──
  10: [{tabs:60,mrp:499, rate:399, discountPct:20}],
  // ── MG+++ Magnesium (id:11) ──
  11: [{tabs:60,mrp:459, rate:367, discountPct:20}],
  // ── CS++ + Iron++ (id:12) ──
  12: [{tabs:60,mrp:479, rate:383, discountPct:20}],
  // ── Moringa Tablets (id:20) ──
  20: [{tabs:60,mrp:249, rate:249, discountPct:0}],
  // ── Power Pro Tablets (id:22) ──
  22: [{tabs:60,mrp:null, rate:null, discountPct:0}],
};

const PRODUCTS = [

  // ─── CATEGORY: PREMIUM MULTIVITAMIN ───
  {id:8, name:"Multidiata – Ascovita Premium Multivitamin", brand:"Ascovita Premium", category:"premium", tags:["featured","bestseller","immunity","premium"],
   price:120, salePrice:null, offer:"Box Pack 30 Tabs ₹120 | Bottle Pack 60 Tabs ₹231",
   image:"", image2:"",
   rating:4.8, reviews:567, stock:200, badge:"🏆 Premium",
   hasTiers:true,
   seoKeywords:["multivitamin India","best multivitamin India","daily multivitamin"],
   description:"Complete daily multivitamin for immunity, energy, and overall health. Multidiata is Ascovita's flagship precision-crafted multivitamin — a comprehensive formula delivering essential vitamins and minerals in one daily tablet. Formulated to address India's most common nutritional gaps with Vitamin D3, B12, Iron, and Zinc.",
   keyIngredients:["Vitamin C 80mg","Vitamin B3 (Niacin) 18mg","Zinc 10mg","Vitamin E 10mg","Magnesium 3.6mg","Vitamin B2 (Riboflavin) 3.5mg","Vitamin B6 2.4mg","Vitamin B1 (Thiamine) 1.8mg","Folic Acid 150mcg","Biotin 30mcg","Vitamin D3 5mcg","Vitamin A 1000IU"],
   howToUse:"Take 1 tablet daily with breakfast or as directed by healthcare professional."},

  // ─── CATEGORY: EFFERVESCENT TABLETS ───
  {id:1, name:"L-Glutathione Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","premium","skin","bestseller","new"],
   price:584, salePrice:null, offer:"Up to 50% OFF on larger packs",
   image:"", image2:"",
   rating:4.9, reviews:312, stock:45, badge:"🔥 Best Seller",
   hasTiers:true,
   seoKeywords:["glutathione tablets India","effervescent tablets India","skin whitening glutathione","L-Glutathione effervescent"],
   description:"The master antioxidant supplement for radiant skin. Fights free radical damage, brightens complexion, detoxifies the liver, and boosts immunity. Each tablet contains 650mg Glutathione with L-Cysteine, Vitamin C, and Astaxanthin for maximum glow, detox, and defense. Vegan. No Added Colour. Sugar Free.",
   keyIngredients:["L-Glutathione (Reduced) 650mg","L-Cysteine 250mg","Vitamin C (Ascorbic Acid) 40mg","Astaxanthin 4mg","Iron (from Ferrous Fumarate) 4.6mg","Zinc (from Zinc Sulphate) 2.3mg","Magnesium (Magnesium Gluconate) 14mg","Vitamin B12 1.5mcg","Biotin 30mcg","Folic Acid 200mcg"],
   howToUse:"Dissolve 1 tablet in 200ml water. Consume before lunch or before dinner. Do not consume the tablet directly. Enjoy it before the fizz ends."},

  {id:2, name:"Apple Cider Vinegar + Moringa – Green Apple Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","new","weight","effervescent"],
   price:299, salePrice:null, offer:"Up to 30% OFF on larger packs",
   image:"", image2:"",
   rating:4.7, reviews:198, stock:80, badge:"New",
   hasTiers:true,
   seoKeywords:["apple cider vinegar tablets India","ACV moringa effervescent","weight management supplement India"],
   description:"ACV + Moringa Effervescent combines Apple Cider Vinegar (750mg), Moringa Leaf Extract (500mg), and Garcinia Cambogia for weight management, metabolic wellness, and energy support. Green Apple flavour. Vegan. Sugar Free.",
   keyIngredients:["Apple Cider Vinegar Powder 750mg (6% Acetic Acid)","Moringa Leaf Extract 500mg","Garcinia Extract 200mg","Vitamin C 40mg","Vitamin B12 1mcg","Vitamin B6 1mg","Zinc 10mg","Potassium 440mg"],
   howToUse:"Dissolve 1 tablet in 200ml water. Take 1 tablet before lunch or before dinner. Do not consume the tablet directly."},

  {id:3, name:"L-Carnitine Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","weight","energy","effervescent"],
   price:399, salePrice:null, offer:"Up to 35% OFF on larger packs",
   image:"", image2:"",
   rating:4.6, reviews:154, stock:70, badge:"On Sale",
   hasTiers:true,
   seoKeywords:["L-Carnitine effervescent India","L-Carnitine supplement India","weight management effervescent"],
   description:"L-Carnitine Effervescent in refreshing Orange flavour. Supports fat metabolism, energy production, and physical performance. With Moringa superfood, multivitamins, and multiminerals for overall health & energy. Vegan. Sugar Free. Fast Absorption.",
   keyIngredients:["L-Carnitine (Orange)","Moringa (Superfood)","Multivitamins","Zinc (Zn)","Magnesium (Mg)","Beet Root Extract 25mg","Vitamin B12 1mcg","Vitamin B6 1.3mg"],
   howToUse:"Dissolve 1 tablet in 150–200ml water. Consume once daily before a meal. Allow the tablet to fully fizz and dissolve before drinking."},

  {id:4, name:"B12 + Biotin Effervescent – Guava Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","skin","energy","effervescent"],
   price:449, salePrice:null, offer:"Up to 35% OFF on larger packs",
   image:"", image2:"",
   rating:4.9, reviews:389, stock:95, badge:"Bestseller",
   hasTiers:true,
   seoKeywords:["biotin effervescent India","B12 biotin tablet India","biotin for hair growth India"],
   description:"B12 + Biotin Effervescent in delicious Guava flavour — hair, skin, and nail powerhouse. Vitamin B12 supports energy & vitality and helps boost metabolism. Biotin promotes healthy hair, skin & nails and supports stronger & thicker hair growth. Sugar Free. Fast Absorption. Vegan.",
   keyIngredients:["Vitamin B12 (Cyanocobalamin)","Biotin (D-Biotin)","L-Glutathione (Reduced) 650mg","L-Cysteine 500mg","Astaxanthin 4mg","Vitamin C","Vitamin E","Niacinamide","Riboflavin","Vitamin B6","Beet Root Extract"],
   howToUse:"Dissolve 1 tablet in 200ml water. Take 1 tablet before lunch and 1 tablet before dinner. Do not chew or swallow whole."},

  {id:5, name:"Vitamin C Effervescent – Orange Flavour", brand:"Ascovita", category:"effervescent", tags:["featured","sale","bestseller","immunity","effervescent"],
   price:249, salePrice:null, offer:"Up to 34% OFF on larger packs",
   image:"", image2:"",
   rating:4.8, reviews:334, stock:180, badge:"Bestseller",
   hasTiers:true,
   seoKeywords:["vitamin C effervescent India","immunity booster supplement India","Vitamin C tablet India"],
   description:"Vitamin C Effervescent with Moringa, multivitamins and multiminerals. Delivers Vitamin C power in a refreshing orange fizzy drink. Moringa superfood provides rich antioxidants, vitamins & minerals. Ensures optimal body functions with Zinc and Magnesium. Sugar Free. Vegan. Fast Absorption.",
   keyIngredients:["Vitamin C (Ascorbic Acid) 40mg","Moringa Leaf Extract","Zinc (Zn)","Magnesium (Mg)","L-Glutathione (Reduced) 650mg","L-Cysteine 500mg","Vitamin B12 1mcg","Vitamin B6 1.3mg","Beet Root Extract 25mg","Astaxanthin 4mg"],
   howToUse:"Dissolve 1 tablet in 150–200ml water. Consume once daily before lunch or dinner. Allow full fizz before drinking."},

  // ─── CATEGORY: SPIRULINA VITAMINS ───
  {id:10, name:"VitaPlus B12 + D3 Vegan – with Certified Organic Spirulina", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","immunity","energy","spirulina"],
   price:399, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"",
   rating:4.7, reviews:89, stock:120, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina B12 D3 tablet India","spirulina vegan vitamin","spirulina capsules India"],
   description:"VitaPlus B12 + D3 Vegan combines the extraordinary power of Certified Organic Spirulina with essential Vitamin B12 and Vitamin D3 (Plant Based). Spirulina is a nutrient-dense superfood with high-quality protein, essential amino acids, and important minerals including iron. Vitamin D3 aids calcium absorption for bone density and prevents osteoporosis. Vitamin B12 is vital for energy production, red blood cell formation, and nerve health. FSSAI Approved. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis","Vitamin B12 (Plant Based)","Vitamin D3 (Plant Based)","Multivitamins","Microcrystalline Minerals","Magnesium Stearate"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet twice per day. Take in the morning with water or milk. Best before 18 months from packaging."},

  {id:11, name:"MG+++ Magnesium – B12 + D3 with Magnesium", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","energy","spirulina"],
   price:367, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"",
   rating:4.5, reviews:56, stock:85, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina magnesium supplement India","magnesium B12 tablet India","spirulina muscle support"],
   description:"MG+++ combines Certified Organic Spirulina with MG Citrate, MG Gluconate, MG Oxide, Vitamin D3 and Vitamin B12. Magnesium contributes to muscle and nerve function, works with calcium and Vitamin D to maintain bone density, and plays a key role in converting food into energy. Combined with Spirulina, it supports overall wellness and effective nutrient absorption. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis Powder","MG Citrate","MG Gluconate","MG Oxide","Vitamin D3 (Plant Based)","Vitamin B12","Microcrystalline Minerals"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet twice per day. Take in the morning with water or milk."},

  {id:12, name:"CS++ + Iron++ – Calcium + Iron with B12+D3", brand:"Ascovita Spirulina", category:"spirulina", tags:["featured","new","immunity","spirulina"],
   price:383, salePrice:null, offer:"20% OFF – Introductory Price",
   image:"", image2:"",
   rating:4.6, reviews:44, stock:100, badge:"New",
   hasTiers:true,
   seoKeywords:["spirulina calcium iron tablet India","spirulina bone health","iron supplement spirulina India"],
   description:"CA++ & Iron++ combines Certified Organic Spirulina with Calcium Citrate Malate, Vitamin K, Zinc, Iron, Magnesium, Vitamin D3 and B12 for complete bone and blood health. Calcium is key for maintaining strong bones and teeth, especially for women during pregnancy and lactation. Vitamin B12 is crucial for energy production and reduces fatigue. Vitamin D supports immune function, guards against infections, and supports mood regulation. In-house grown India Certified Spirulina.",
   keyIngredients:["Organic Spirulina platensis Powder","Calcium Citrate Malate","Vitamin K","Zinc","Iron","Magnesium","Vitamin D3 (Plant Based)","Vitamin B12"],
   howToUse:"Adults: Take 2 tablets per day. Children (8–12 years): 1 tablet per day. Take in the morning with water or milk."},

  // ─── CATEGORY: AYURVEDIC ───
  {id:20, name:"Moringa Tablets", brand:"Ascovita Ayurvedic", category:"ayurvedic", tags:["featured","new","immunity","energy","ayurvedic"],
   price:249, salePrice:null, offer:"Price to be updated",
   image:"", image2:"",
   rating:4.7, reviews:156, stock:100, badge:"Ayurvedic",
   hasTiers:false,
   seoKeywords:["moringa tablets India","moringa oleifera supplement India","moringa veggie tablets"],
   description:"Pure Organic Moringa Tablets — the miracle tree in its most potent form. Boosts energy levels, improves digestive system, increases metabolism, and builds up stamina. Each 750mg tablet provides Moringa's full spectrum of nutrients. FSSAI Approved. Vegan. Dietary Supplement.",
   keyIngredients:["Organic Moringa (Moringa oleifera) 750mg per tablet","Acaciaegum (binder)"],
   howToUse:"Take 2 moringa tablets in the morning and 2 tablets in the evening to boost your body. Children (8–12 years): 1 moringa tablet twice per day as prescribed by nutritionist. Store in a cool & dry place."},

  // ─── CATEGORY: IMMUNITY ───
  {id:22, name:"Power Pro Tablets", brand:"Ascovita Immunity", category:"immunity", tags:["featured","new","immunity","energy"],
   price:null, salePrice:null, offer:"Price coming soon",
   image:"", image2:"",
   rating:4.7, reviews:34, stock:60, badge:"Coming Soon",
   hasTiers:false,
   seoKeywords:["immunity booster India","power pro tablet India","stamina supplement India","ashwagandha immunity"],
   description:"Energy Pro+ for Vigour, Vitality & Stamina. Enhances Stamina & Physical Performance. Inhibits Fatigue & Stress. Promotes a Healthy Immune Response. Power | Strength | Stamina. Contains a synergistic blend of Withania somnifera (Ashwagandha), Emblica officinalis, Rauvolfia serpentina, Asparagus racemosus, Withania coagulans, Mucuna pruriens, Tribulus terrestris, Abelmoschus moschatus, Chlorophytum borivilianum, Purified Shilajit, Myristica fragrans, and Astaxanthin.",
   keyIngredients:["Withania somnifera (Ashwagandha) 250mg","Emblica officinalis 75mg","Mucuna pruriens 50mg","Tribulus terrestris 50mg","Purified Shilajit Extract 50mg","Astaxanthin 4mg","Asparagus racemosus 59mg","Chlorophytum borivilianum 59mg"],
   howToUse:"Adults: Take 1 tablet per day after a meal or as directed by healthcare professional. Keep container tightly closed. Keep out of reach of children."},
];

const REVIEWS = {
  1:[{user:"Sneha Joshi",rating:5,text:"Noticed brighter skin in 4 weeks. The orange flavour is so refreshing to drink every day!",date:"Feb 2025",verified:true},{user:"Meera Sharma",rating:4,text:"Premium Glutathione product, quality is evident. Genuine L-Glutathione 650mg.",date:"Jan 2025",verified:true}],
  2:[{user:"Pooja Jain",rating:5,text:"ACV + Moringa Green Apple is amazing! Feel the difference in energy and digestion in 2 weeks.",date:"Mar 2025",verified:true},{user:"Vikram Singh",rating:5,text:"Love this product. Cravings have reduced a lot. Great for weight management.",date:"Feb 2025",verified:true}],
  3:[{user:"Sanya Mishra",rating:5,text:"L-Carnitine Orange is so refreshing! My energy during workouts has visibly improved.",date:"Mar 2025",verified:true},{user:"Rohan Gupta",rating:4,text:"Great for fat burning support. Can feel the sustained energy throughout the day.",date:"Feb 2025",verified:true}],
  4:[{user:"Deepa Menon",rating:5,text:"Hair fall reduced significantly in 6 weeks! The guava taste is absolutely delicious.",date:"Feb 2025",verified:true},{user:"Priya Nair",rating:5,text:"B12 + Biotin combo is incredible. Nails stopped breaking and skin is glowing!",date:"Jan 2025",verified:true}],
  5:[{user:"Kavya Patel",rating:5,text:"Vitamin C fizz is so good! My immunity is definitely stronger this season.",date:"Feb 2025",verified:true},{user:"Ritika Desai",rating:5,text:"Best Vitamin C supplement I've tried. Love the moringa addition.",date:"Jan 2025",verified:true}],
  8:[{user:"Ramesh Kumar",rating:5,text:"Best multivitamin at this price. Complete nutrition in one tablet!",date:"Feb 2025",verified:true},{user:"Anjali Mehta",rating:5,text:"Doctor recommended and I'm glad. B12 deficiency improved in 2 months.",date:"Feb 2025",verified:true}],
  10:[{user:"Sunita Rao",rating:5,text:"VitaPlus B12+D3 is fantastic. No fishy smell, easy to swallow, great energy.",date:"Feb 2025",verified:true},{user:"Geeta Iyer",rating:5,text:"Spirulina quality is excellent. Certified organic and made in India!",date:"Jan 2025",verified:true}],
  20:[{user:"Arjun Sharma",rating:5,text:"Moringa tablets are incredible! Energy levels have gone up noticeably.",date:"Mar 2025",verified:true},{user:"Nikhil Patel",rating:4,text:"Pure moringa, no filler. Good stamina and digestion improvement.",date:"Feb 2025",verified:true}],
};
PRODUCTS.forEach(p => {
  if (!REVIEWS[p.id]) REVIEWS[p.id] = [{user:"Verified Buyer",rating:Math.round(p.rating),text:`${p.name} is exactly as described. Great quality from Ascovita.`,date:"Jan 2025",verified:true},{user:"Happy Customer",rating:5,text:"Ascovita products are genuine and effective.",date:"Feb 2025",verified:true}];
});

const STORE = {
  cart:[], wishlist:[],
  init(){try{this.cart=JSON.parse(localStorage.getItem('asc_cart')||'[]');}catch(e){this.cart=[];}try{this.wishlist=JSON.parse(localStorage.getItem('asc_wish')||'[]');}catch(e){this.wishlist=[];}this.updateCartUI();},
  save(){try{localStorage.setItem('asc_cart',JSON.stringify(this.cart));localStorage.setItem('asc_wish',JSON.stringify(this.wishlist));}catch(e){}this.updateCartUI();},
  addToCart(id,qty=1){const p=PRODUCTS.find(p=>p.id===id);if(!p)return;const ex=this.cart.find(i=>i.id===id);if(ex)ex.qty+=qty;else this.cart.push({id,qty});this.save();window._trackAddToCart&&window._trackAddToCart(p,qty);showToast(`${p.name} added to cart! 🌿`);},
  removeFromCart(id){this.cart=this.cart.filter(i=>i.id!==id);this.save();},
  updateQty(id,qty){const item=this.cart.find(i=>i.id===id);if(item){item.qty=Math.max(1,qty);this.save();}},
  getSubtotal(){return this.cart.reduce((s,i)=>{const p=PRODUCTS.find(p=>p.id===i.id);return s+(p?((p.salePrice||p.price)||0)*i.qty:0);},0);},
  applyCode(code){return null;}, // All codes validated via backend — see applyCode()
  updateCartUI(){const count=this.cart.reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.cart-badge').forEach(el=>{el.textContent=count;el.style.display=count>0?'flex':'none';});},
  toggleWishlist(id){const idx=this.wishlist.indexOf(id);if(idx>-1){this.wishlist.splice(idx,1);showToast('Removed from wishlist');}else{this.wishlist.push(id);showToast('Added to wishlist! 💚');}this.save();}
};

function fmt(p){return '₹'+p.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});}
function stars(r){const f=Math.floor(r),h=r%1>=0.5;return '<span class="stars">'+'★'.repeat(f)+(h?'☆':'')+'</span><span class="rating-n">'+r+'</span>';}
function showToast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3200);}
function renderProductCard(p){
  const disc=p.salePrice&&p.price?Math.round((1-p.salePrice/p.price)*100):0;
  const rawTiers=p._backendTiers||QTY_TIERS[p.id];
  const tiers=rawTiers&&rawTiers.filter(t=>t.rate!=null&&t.mrp!=null).length?rawTiers.filter(t=>t.rate!=null&&t.mrp!=null):null;
  const maxDisc=tiers?Math.max(...tiers.map(t=>t.discountPct||0)):disc;
  const baseRate=tiers?tiers[0].rate:(p.salePrice||p.price);
  const baseMRP=tiers?tiers[0].mrp:p.price;
  const priceDisplay=(baseRate==null)?'<em style="font-size:0.8rem;color:#b8860b">Price Coming Soon</em>':'\u20B9'+baseRate.toLocaleString('en-IN');
  return `<div class="product-card" data-product-id="${p.id}" onclick="openProduct(${p.id})"><div class="p-img-wrap"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/EAF2E0/2D5016?text=Ascovita'">${p.badge?`<span class="p-badge">${p.badge}</span>`:''} ${maxDisc>0?`<span class="p-disc-badge">${tiers?'Up to ':'-'}${maxDisc}%</span>`:''}<div class="p-actions"><button class="btn-wishlist" onclick="event.stopPropagation();STORE.toggleWishlist(${p.id})" title="Wishlist">♡</button><button class="btn-qadd" onclick="event.stopPropagation();${tiers?`openProduct(${p.id})`:`STORE.addToCart(${p.id})`}">${tiers?'Choose Pack':'Add to Cart'}</button></div></div><div class="p-info"><div class="p-brand">${p.brand}</div><div class="p-name">${p.name}</div><div class="p-rating">${stars(p.rating)} <span class="review-ct">(${p.reviews})</span></div><div class="p-price"><span class="sale-price">${priceDisplay}</span>${(baseMRP&&baseMRP!==baseRate)?`<span class="orig-price">₹${baseMRP.toLocaleString('en-IN')}</span>`:''}</div>${tiers?`<div class="tier-offer-tag">⚡ Up to ${maxDisc}% OFF on larger packs</div>`:(p.offer?`<span class="offer-tag" style="margin-top:4px;display:inline-block">${p.offer}</span>`:'')}</div></div>`;
}


// ═══════════════════════════════════════════════════════
// ASCOVITA STORE — APP LOGIC
// ═══════════════════════════════════════════════════════
// Ascovita – Main Application

// ── BLOG DATA ──
const BLOGS = [
  { id:1, tag:"Moringa Benefits", title:"Why Moringa is Called the Miracle Tree – And Why You Need It Daily", excerpt:"Moringa Oleifera has 92 nutrients, 46 antioxidants and all 9 essential amino acids. Here's why every Indian should add it to their routine.", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80", date:"Feb 18, 2025", readTime:"5 min read", author:"Dr. Sanjay Mehta" },
  { id:2, tag:"Spirulina Guide", title:"Spirulina: The Superfood That Could Replace Your Entire Supplement Stack", excerpt:"One gram of spirulina provides more nutrition than 1000 grams of most vegetables. We break down the science.", img:"https://images.unsplash.com/photo-1622203714616-9c1e3b7d7f3c?w=500&q=80", date:"Feb 10, 2025", readTime:"7 min read", author:"Nutritionist Priya Rao" },
  { id:3, tag:"Skin & Hair", title:"Biotin at 10,000mcg: Does Higher Dose Really Mean Better Hair Growth?", excerpt:"The research on high-dose biotin and hair growth — what works, what doesn't, and what dosage is right for you.", img:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80", date:"Feb 3, 2025", readTime:"6 min read", author:"Dr. Kavita Sharma" },
  { id:4, tag:"Antioxidants", title:"Glutathione: India's Fastest Growing Wellness Supplement Explained", excerpt:"Glutathione supplements are everywhere. But what does the master antioxidant actually do? We asked a dermatologist.", img:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80", date:"Jan 25, 2025", readTime:"8 min read", author:"Dr. Ananya Gupta" },
  { id:5, tag:"Nutrition Tips", title:"The 7 Most Common Nutrient Deficiencies in India (And How to Fix Them)", excerpt:"Iron, Vitamin D, B12 and calcium deficiencies affect over 70% of Indians. A comprehensive guide to testing and treating them.", img:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80", date:"Jan 18, 2025", readTime:"9 min read", author:"Wellness Expert Rahul Verma" },
  { id:6, tag:"Wellness Routine", title:"How to Build a Morning Supplement Routine That Actually Works", excerpt:"Timing, sequencing, and food pairing make a huge difference to how well your supplements are absorbed.", img:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80", date:"Jan 10, 2025", readTime:"5 min read", author:"Nutritionist Meera Iyer" },
];

// ── FAQ DATA ──
const FAQS = [
  { q:"How long does delivery take?", a:"Standard delivery across India takes 3–5 business days. Express delivery in major cities (Mumbai, Delhi, Bangalore, Hyderabad, Ahmedabad, Chennai) takes 1–2 business days. Free shipping on all orders above ₹599.", cat:"Shipping" },
  { q:"What payment methods do you accept?", a:"We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking for all major banks, and No-Cost EMI options via Cashfree. COD is not available — online payments only.", cat:"Payment" },
  { q:'What does "Buy 4 Get 50% OFF" mean?', a:"When you add 4 or more units of any eligible product (marked with the offer) to your cart, the 50% discount is automatically applied to all those units at checkout. This is our way of rewarding customers who stock up!", cat:"Offers" },
  { q:"Are Ascovita products FSSAI approved?", a:"Yes. All Ascovita products are manufactured in FSSAI-licensed GMP-compliant facilities and meet all regulatory requirements for food supplements in India. Product licenses are available on request.", cat:"Products" },
  { q:"Can I take multiple supplements together?", a:"Generally yes, but we recommend checking with your doctor if you're on medications. Ascovita supplements are designed to be safe when combined. Our Combo Kits are specifically curated for safe, effective multi-supplement use.", cat:"Products" },
  { q:"How do I track my order?", a:"After dispatch, you'll receive an SMS and email with a tracking link from our shipping partner (Shiprocket). Track directly at shiprocket.in/shipment-tracking or via the link in your confirmation email.", cat:"Shipping" },
  { q:"Is COD available? Any extra charges?", a:"Yes, COD is not available. We accept UPI, Cards, Net Banking and EMI across India. A nominal COD convenience fee of ₹40 applies. No COD for orders above ₹5,000.", cat:"Payment" },
  { q:"Can I return or exchange products?", a:"We offer a 7-day return policy for sealed, unused products. If you receive a damaged or wrong product, we will replace it at no cost. Contact ascovitahealthcare@gmail.com with your order details and photo.", cat:"Returns" },
  { q:"How should I store the products?", a:"Store all Ascovita products in a cool, dry place below 30°C. Keep away from direct sunlight and moisture. After opening effervescent tablet tubes, seal tightly and use within 30 days.", cat:"Products" },
  { q:"Are these suitable for vegetarians/vegans?", a:"All Ascovita supplements are 100% vegetarian. The spirulina products are also vegan. Glutathione and B1+Biotin are vegetarian but check if vegan-strict, as some capsule shells may vary.", cat:"Products" },
  { q:"How do I apply a discount code?", a:"At checkout, enter your promo code in the 'Apply Coupon' field and click Apply. Valid promo codes are shared on our Instagram, WhatsApp channel, and promotional emails.", cat:"Offers" },
  { q:"Do you offer bulk/wholesale pricing?", a:"Yes! For bulk orders of 50+ units or wholesale partnerships, contact us at ascovitahealthcare@gmail.com or call +91 9898 582 650. We offer attractive pricing for distributors, pharmacies, and gyms.", cat:"Orders" },
];

// ── APP STATE ──
let currentPage = 'home';
let currentProduct = null;
let currentCat = 'all';
let priceMax = 2000;
let carouselIdx = 0;
let pQty = 1;
let selectedRating = 0;
let appliedDiscount = null;

// ── PAGE NAV ──
function showPage(pg) {
  document.getElementById('codOverlay')?.remove();
  // Update URL to clean path (e.g. ascovita.com/about) — no hash
  try {
    const cleanPath = (pg && pg !== 'home') ? '/' + pg : '/';
    history.pushState({ page: pg }, '', cleanPath);
  } catch(e) { /* suppressed: sandboxed iframe preview */ }
  // Track page view in GA
  window._trackPage && window._trackPage(pg);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pg);
  if (!el) return;
  el.classList.add('active');
  window.scrollTo({ top:0, behavior:'smooth' });
  currentPage = pg;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pg);
  });
  if (pg === 'shop') initShop();
  if (pg === 'cart') {
    renderCart();
    try {
      const items = STORE.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return{id:i.id,name:p?.name||'',price:p?.salePrice||p?.price||0,qty:i.qty};});
      const tot = items.reduce((s,i)=>s+i.price*i.qty,0);
      window._trackViewCart && window._trackViewCart(items, tot);
    } catch(e){}
  }
  if (pg === 'checkout') {
    renderCheckoutSummary();
    try {
      const items = STORE.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return{id:i.id,name:p?.name||'',price:p?.salePrice||p?.price||0,qty:i.qty};});
      const tot = items.reduce((s,i)=>s+i.price*i.qty,0);
      window._trackBeginCheckout && window._trackBeginCheckout(items, tot);
    } catch(e){}
  }
  if (pg === 'blog') renderFullBlog();
  if (pg === 'faq') renderFullFaq();

  // Footer: hide on transactional/fullscreen pages
  const noFooterPages = ['checkout', 'thankyou', 'account', 'login'];
  const footer = document.getElementById('siteFooter');
  if (footer) {
    footer.style.display = noFooterPages.includes(pg) ? 'none' : '';
  }
}

function showShop(cat) {
  currentCat = cat || 'all';
  showPage('shop');
  setTimeout(() => filterCat(currentCat, document.querySelector(`.cpill[data-cat="${currentCat}"]`)), 30);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function openProduct(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  window._currentProductId = id; // track for backend sync re-render
  if (currentProduct) window._trackViewItem && window._trackViewItem(currentProduct);
  if (!currentProduct) return;
  pQty = 1;
  buildProductPage(currentProduct);
  setTimeout(()=>document.dispatchEvent(new CustomEvent('productPageShown',{detail:currentProduct})),100);
  // Push clean URL: /product/glutathione-effervescent
  try {
    const slug = slugify(currentProduct.name);
    history.pushState({ page: 'product', id: id }, '', '/product/' + slug);
  } catch(e) {}
  // Update page title + meta for SEO
  const disc = currentProduct.salePrice ? Math.round((1 - currentProduct.salePrice/currentProduct.price)*100) : 0;
  const discText = disc > 0 ? ` – ${disc}% OFF` : '';
  document.title = currentProduct.name + discText + ' | Ascovita';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content',
    'Buy ' + currentProduct.name + ' at ₹' + (currentProduct.salePrice||currentProduct.price) + discText + '. ' + (currentProduct.description||'').slice(0,120) + ' Free shipping above ₹599.'
  );
  // Show the page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-product');
  if (el) { el.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  currentPage = 'product';
  const bc=document.getElementById('prodBCName'); if(bc) bc.textContent = currentProduct.name;
}

// ── MOBILE MENU ──
function toggleMobile() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ── HOME INIT ──
function initHome() {
  // ✅ FIX 2: Filter out _hidden (active:false) products from all grids
  const visibleProducts = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  // Featured
  const feat = visibleProducts.filter(p => p.tags.includes('featured')).slice(0,8);
  const fg=document.getElementById('featuredGrid'); if(fg) fg.innerHTML = feat.map(p => renderProductCard(p)).join('');
  // New arrivals
  const newP = visibleProducts.filter(p => p.tags.includes('new')).slice(0,4);
  const nag=document.getElementById('newArrivalsGrid'); if(nag) nag.innerHTML = newP.map(p => renderProductCard(p)).join('');
  // Blog
  const hbg=document.getElementById('homeBlogGrid'); if(hbg) hbg.innerHTML = BLOGS.slice(0,3).map(renderBlogCard).join('');
  // FAQ
  const hfw=document.getElementById('homeFaqWrap'); if(hfw) hfw.innerHTML = FAQS.slice(0,5).map(renderFaqItem).join('');
  // Testimonials
  const tg=document.getElementById('testiGrid'); if(tg) tg.innerHTML = renderTestimonials();
  STORE.updateCartUI();
}

// ── SHOP ──
function initShop() { applyFilters(); }

function filterCat(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
  const titles = {
    all:'All Products', premium:'🏆 Ascovita Premium', spirulina:'🌊 Spirulina Range',
    effervescent:'🫧 Effervescent Range', ayurvedic:'🌿 Ayurvedic Wellness', energy:'⚡ Energy & Performance',
    combos:'🎁 Combos & Bundles', bestsellers:'🔥 Best Sellers', sale:'💰 On Sale', new:'🆕 New Launch',
    skin:'⭐ Skin & Glow', immunity:'💪 Immunity Boosters', brain:'🧠 Brain & Focus', weight:'🏋 Weight Management',
    moringa:'🌿 Moringa', vitamins:'💊 Vitamins', specialty:'⭐ Specialty'
  };
  const t = document.getElementById('shopTitle');
  if (t) t.textContent = titles[cat] || 'All Products';
}

function applyFilters() {
  // ✅ FIX 2: Never show hidden/inactive products in shop
  let prods = PRODUCTS.filter(p => !p._hidden && p.active !== false);
  const goalTags = ['skin','immunity','energy','brain','weight'];
  if (currentCat === 'bestsellers') prods = prods.filter(p => p.tags.includes('bestseller'));
  else if (currentCat === 'sale') prods = prods.filter(p => p.salePrice || (p.tags && p.tags.includes('sale')));
  else if (currentCat === 'new') prods = prods.filter(p => p.tags.includes('new'));
  else if (goalTags.includes(currentCat)) prods = prods.filter(p => p.tags.includes(currentCat) || p.category === currentCat);
  else if (currentCat !== 'all') prods = prods.filter(p => p.category === currentCat);

  prods = prods.filter(p => { var px = p.salePrice || p.price; return px == null || px <= priceMax; });

  const rChecks = [...document.querySelectorAll('[id^=fr]:checked')].map(c => +c.value);
  if (rChecks.length) { const min = Math.min(...rChecks); prods = prods.filter(p => p.rating >= min); }
  if (document.getElementById('fSale')?.checked) prods = prods.filter(p => p.salePrice);
  if (document.getElementById('fNew')?.checked) prods = prods.filter(p => p.tags.includes('new'));
  if (document.getElementById('fBest')?.checked) prods = prods.filter(p => p.tags.includes('bestseller'));

  const sort = document.getElementById('sortSel')?.value;
  if (sort === 'plo') prods.sort((a,b) => (a.salePrice||a.price)-(b.salePrice||b.price));
  else if (sort === 'phi') prods.sort((a,b) => (b.salePrice||b.price)-(a.salePrice||a.price));
  else if (sort === 'rat') prods.sort((a,b) => b.rating-a.rating);

  const grid = document.getElementById('shopGrid');
  const empty = document.getElementById('shopEmpty');
  const cnt = document.getElementById('shopCount');
  if (!grid) return;
  grid.innerHTML = prods.length ? prods.map(p => renderProductCard(p)).join('') : '';
  if (empty) empty.style.display = prods.length ? 'none' : 'block';
  if (cnt) cnt.textContent = `Showing ${prods.length} product${prods.length!==1?'s':''}`;
}

function updatePrice(v) {
  priceMax = +v;
  const pd=document.getElementById('priceDisp'); if(pd) pd.textContent = v >= 2000 ? 'Any price' : `Up to ${fmt(+v)}`;
  applyFilters();
}

function clearFilters() {
  const pr=document.getElementById('priceRange'); if(pr) pr.value = 2000;
  priceMax = 2000;
  const pd2=document.getElementById('priceDisp'); if(pd2) pd2.textContent = 'Any price';
  document.querySelectorAll('[id^=fr], #fSale, #fNew, #fBest').forEach(c => { if(c) c.checked=false; });
  const ss=document.getElementById('sortSel'); if(ss) ss.value = 'def';
  currentCat = 'all';
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  document.querySelector('.cpill[data-cat="all"]')?.classList.add('active');
  applyFilters();
}

// ── QUANTITY DISCOUNT WIDGET ──
// Tracks which tier is selected per product (productId → tierIndex)
const selectedTiers = {};

function buildTierWidget(p) {
  const tiers = p._backendTiers || QTY_TIERS[p.id];
  if (!tiers) return '';            // no tiers for this product
  const sel = selectedTiers[p.id] !== undefined ? selectedTiers[p.id] : 0;
  const t = tiers[sel];
  const saving = t.mrp - t.rate;

  return `
    <div class="qty-discount-wrap" id="tierWidget_${p.id}">
      <div class="qty-discount-header">
        <span class="spark">⚡</span>
        Buy More, Save More — Choose Your Pack Size
      </div>
      <div class="qty-tiers-grid">
        ${tiers.map((tier, i) => {
          const isSel = i === sel;
          const isBest = tier.discountPct === Math.max(...tiers.map(t=>t.discountPct));
          return `
          <div class="qty-tier${isSel ? ' selected' : ''}${isBest ? ' best-value' : ''}"
               onclick="selectTier(${p.id}, ${i})">
            <div class="tier-tabs">${tier.tabs}</div>
            <span class="tier-tabs-label">Tablets</span>
            <span class="tier-units-label" style="font-size:.62rem;color:rgba(255,255,255,.5);font-weight:500;margin-top:1px">${tier.tabs===15?'1 Pack':tier.tabs===30?'2 Packs':tier.tabs===45?'3 Packs':'4 Packs'}</span>
            <span class="tier-disc">${tier.discountPct}% OFF</span>
            <span class="tier-rate">₹${tier.rate.toLocaleString('en-IN')}</span>
            <span class="tier-mrp">₹${tier.mrp.toLocaleString('en-IN')}</span>
            <span class="tier-save-label">Save ₹${(tier.mrp-tier.rate).toLocaleString('en-IN')}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="qty-discount-footer">
        <span class="selected-summary">
          <strong>${t.tabs} Tablets</strong> for <strong>₹${t.rate.toLocaleString('en-IN')}</strong>
          (MRP ₹${t.mrp.toLocaleString('en-IN')})
        </span>
        <span class="savings-pill">You Save ₹${saving.toLocaleString('en-IN')}!</span>
      </div>
    </div>`;
}

function selectTier(productId, tierIdx) {
  selectedTiers[productId] = tierIdx;
  const p2 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p2 && p2._backendTiers) || QTY_TIERS[productId];
  if (!tiers) return;
  const t = tiers[tierIdx];

  // Rebuild widget in place
  const widget = document.getElementById(`tierWidget_${productId}`);
  if (widget) {
    const p = PRODUCTS.find(p => p.id === productId);
    widget.outerHTML = buildTierWidget(p);
  }
  // Re-register after DOM replace
  // Also update the displayed price
  updatePriceDisplay(productId, tierIdx);
}

function updatePriceDisplay(productId, tierIdx) {
  const p3 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p3 && p3._backendTiers) || QTY_TIERS[productId];
  if (!tiers) return;
  const t = tiers[tierIdx];
  const disc = Math.round((1 - t.rate / t.mrp) * 100);

  const salePriceEl = document.getElementById('dynSalePrice');
  const origPriceEl = document.getElementById('dynOrigPrice');
  const discTagEl   = document.getElementById('dynDiscTag');
  const savingEl    = document.getElementById('dynSaving');

  if (salePriceEl) {
    salePriceEl.textContent = `₹${t.rate.toLocaleString('en-IN')}`;
    salePriceEl.classList.remove('price-updated');
    void salePriceEl.offsetWidth; // reflow
    salePriceEl.classList.add('price-updated');
  }
  if (origPriceEl) origPriceEl.textContent = `₹${t.mrp.toLocaleString('en-IN')}`;
  if (discTagEl)   discTagEl.textContent = `Save ${disc}%`;
  if (savingEl)    savingEl.textContent  = `You save ₹${(t.mrp - t.rate).toLocaleString('en-IN')} on this pack!`;

  // Update Add to Cart button label
  const addBtn = document.getElementById('addCartBtn');
  if (addBtn) addBtn.dataset.tier = tierIdx;
}

// ── PRODUCT PAGE ──
function buildProductPage(p) {
  const rvs = REVIEWS[p.id] || [];
  const avg = rvs.reduce((s,r)=>s+r.rating,0)/rvs.length || p.rating;
  const related = PRODUCTS.filter(r=>r.category===p.category&&r.id!==p.id).slice(0,4);
  const rg=document.getElementById('relatedGrid'); if(rg) rg.innerHTML = related.map(r=>renderProductCard(r)).join('');

  // Determine tier for display
  const tiers = p._backendTiers || QTY_TIERS[p.id];
  const tierIdx = selectedTiers[p.id] !== undefined ? selectedTiers[p.id] : 0;
  const activeTier = tiers ? tiers[tierIdx] : null;
  const displayRate = activeTier ? activeTier.rate : (p.salePrice || p.price);
  const displayMRP  = activeTier ? activeTier.mrp  : p.price;
  const displayDisc = Math.round((1 - displayRate / displayMRP) * 100);
  const displaySaving = displayMRP - displayRate;

  const pdEl=document.getElementById('productDetail'); if(pdEl) pdEl.innerHTML = `
    ${buildMediaGallery(p)}
    <div>
      <div class="prod-brand">${p.brand}</div>
      <h1 class="prod-title">${p.name}</h1>
      <div class="prod-rating-row">${stars(avg)} <span class="review-ct">(${rvs.length + p.reviews} reviews)</span> <span class="write-rv" onclick="document.getElementById('rvFormWrap').scrollIntoView({behavior:'smooth'})">Write a Review</span></div>
      <div class="prod-price-block">
        <span class="prod-sale" id="dynSalePrice">&#x20B9;${displayRate.toLocaleString('en-IN')}</span>
        <span class="prod-orig" id="dynOrigPrice">&#x20B9;${displayMRP.toLocaleString('en-IN')}</span>
        ${displayDisc > 0 ? `<span class="prod-disc-tag" id="dynDiscTag">Save ${displayDisc}%</span>` : ''}
      </div>
      <div id="dynSaving" style="font-size:.8rem;color:var(--success);font-weight:600;margin-bottom:${tiers?'4px':'16px'}">
        ${displaySaving > 0 ? `&#x1F389; You save &#x20B9;${displaySaving.toLocaleString('en-IN')} on this pack!` : ''}
      </div>
      ${tiers ? buildTierWidget(p) : (p.offer ? `<div class="prod-offer-line">&#x1F389; ${p.offer}</div>` : '')}
      <div class="prod-stock">&#x2705; In Stock (${p.stock} units)</div>
      <p style="font-size:.88rem;color:var(--gray);line-height:1.8;margin-bottom:20px;">${p.description}</p>
      ${!tiers ? `<div class="qty-wrap"><button class="qty-btn" onclick="chQty(-1)">&#x2212;</button><span class="qty-num" id="pQtyDisp">1</span><button class="qty-btn" onclick="chQty(1)">+</button></div>` : ''}
      <button class="add-cart-btn" id="addCartBtn" data-tier="${tierIdx}" onclick="addToCartWithTier(${p.id})">&#x1F6D2; Add to Cart</button>
      <div class="stock-urgency" id="stockUrgency"></div>
      <div class="live-viewers"><span class="lv-dot"></span><span id="liveViewerCount">12</span> people viewing this right now</div>
      <button class="buy-now-btn" onclick="addToCartWithTier(${p.id});showPage('checkout')">&#x26A1; Buy Now</button>
      <div class="prod-features">
        <div class="feat-item"><span class="feat-ico">&#x1F331;</span>100% Organic</div>
        <div class="feat-item"><span class="feat-ico">&#x1F52C;</span>Lab Tested</div>
        <div class="feat-item"><span class="feat-ico">&#x2705;</span>FSSAI Approved</div>
        <div class="feat-item"><span class="feat-ico">&#x1F1EE;&#x1F1F3;</span>Made in India</div>
        <div class="feat-item"><span class="feat-ico">&#x21A9;&#xFE0F;</span>7-Day Returns</div>
        <div class="feat-item"><span class="feat-ico">&#x1F69A;</span>Free Ship &#x20B9;599+</div>
      </div>
      <div class="tabs">
        <button class="tab active" onclick="switchTab(this,'desc')">Description</button>
        <button class="tab" onclick="switchTab(this,'ingr')">Ingredients</button>
        <button class="tab" onclick="switchTab(this,'rvs')">Reviews (${rvs.length})</button>
        ${tiers ? `<button class="tab" onclick="switchTab(this,'pricing')">&#x1F4CB; Pricing</button>` : ''}
      </div>
      <div class="tab-content active" id="tab-desc">
        <p style="font-size:.88rem;color:#444;line-height:1.8;">${p.description}</p>
        <div style="background:var(--green-wash);border-radius:10px;padding:18px;margin-top:16px;"><div style="font-weight:700;font-size:.88rem;margin-bottom:10px;">&#x1F4CB; How to Use</div><p style="font-size:.83rem;color:var(--gray);line-height:1.75;">${p.howToUse}</p></div>
      </div>
      <div class="tab-content" id="tab-ingr">
        <div style="font-size:.88rem;line-height:1.8;color:#444;">
          <p style="margin-bottom:12px;font-weight:600;">Key Ingredients:</p>
          <ul style="margin-left:18px;color:var(--gray);">${(p.keyIngredients||[]).map(i=>`<li style="margin-bottom:7px;">${i}</li>`).join('')}</ul>
          <div style="margin-top:16px;padding:12px;background:var(--gold-pale);border-radius:9px;font-size:.78rem;color:var(--gold)">&#x26A0;&#xFE0F; Free from: Artificial colours, flavours, preservatives, heavy metals. 100% Natural.</div>
        </div>
      </div>
      <div class="tab-content" id="tab-rvs">
        <div class="rv-summary">
          <div class="rating-big"><div class="rv-big-num">${avg.toFixed(1)}</div><div class="rv-big-stars">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div><div style="font-size:.72rem;color:var(--gray)">${rvs.length} reviews</div></div>
          <div style="flex:1">${[5,4,3,2,1].map(s=>{const c=rvs.filter(r=>Math.round(r.rating)===s).length;const pct=rvs.length?(c/rvs.length)*100:(s===5?70:s===4?20:10);return`<div class="rv-bar-row"><span style="width:14px">${s}&#x2605;</span><div class="rv-bar-track"><div class="rv-bar-fill" style="width:${pct}%"></div></div><span>${Math.round(pct)}%</span></div>`;}).join('')}</div>
        </div>
        ${rvs.map(r=>`<div class="rv-card"><div class="rv-hdr"><div><span class="rv-name">${r.user}</span>${r.verified?'<span class="rv-verified">&#x2713; Verified</span>':''}</div><span class="rv-date">${r.date}</span></div><div class="rv-stars">${'&#x2605;'.repeat(r.rating)}${'&#x2606;'.repeat(5-r.rating)}</div><p class="rv-text">${r.text}</p></div>`).join('')}
        <div class="rv-form" id="rvFormWrap">
          <h3>Write a Review</h3>
          <div class="star-picker" id="starPicker">${[1,2,3,4,5].map(s=>`<span onclick="setRating(${s})" data-s="${s}">&#x2605;</span>`).join('')}</div>
          <input class="form-input" type="text" placeholder="Your name" id="rvName">
          <textarea class="form-input" placeholder="Share your experience with this product..." id="rvText"></textarea>
          <button class="btn-primary" style="width:100%;justify-content:center" onclick="submitReview()">Submit Review &#x1F331;</button>
        </div>
      </div>
      ${tiers ? `
      <div class="tab-content" id="tab-pricing">
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.85rem">
            <thead><tr style="background:var(--green);color:white">
              <th style="padding:12px 16px;text-align:left;border-radius:8px 0 0 0">Pack Size</th>
              <th style="padding:12px 16px;text-align:right">MRP (&#x20B9;)</th>
              <th style="padding:12px 16px;text-align:right">Your Price (&#x20B9;)</th>
              <th style="padding:12px 16px;text-align:right">Discount</th>
              <th style="padding:12px 16px;text-align:right;border-radius:0 8px 0 0">You Save</th>
            </tr></thead>
            <tbody>
              ${tiers.map((t,i)=>{const isBest=t.discountPct===Math.max(...tiers.map(x=>x.discountPct));return`<tr style="background:${isBest?'var(--gold-pale)':i%2?'var(--green-wash)':'white'};cursor:pointer" onclick="selectTier(${p.id},${i})"><td style="padding:12px 16px;font-weight:700">${t.tabs} Tabs${isBest?' <span style="background:var(--gold);color:white;font-size:.6rem;padding:2px 7px;border-radius:100px;font-weight:800;vertical-align:middle">BEST VALUE</span>':''}</td><td style="padding:12px 16px;text-align:right;text-decoration:line-through;color:var(--gray)">&#x20B9;${t.mrp.toLocaleString('en-IN')}</td><td style="padding:12px 16px;text-align:right;font-weight:800;color:var(--green)">&#x20B9;${t.rate.toLocaleString('en-IN')}</td><td style="padding:12px 16px;text-align:right"><span style="background:${isBest?'var(--gold)':'var(--gold-pale)'};color:${isBest?'white':'var(--gold)'};padding:3px 9px;border-radius:100px;font-weight:700;font-size:.78rem">${t.discountPct}% OFF</span></td><td style="padding:12px 16px;text-align:right;color:var(--success);font-weight:700">&#x20B9;${(t.mrp-t.rate).toLocaleString('en-IN')}</td></tr>`;}).join('')}
            </tbody>
          </table>
          <p style="font-size:.76rem;color:var(--gray);margin-top:12px">Click any row to select that pack. All prices incl. taxes.</p>
        </div>
      </div>` : ''}
    </div>
  `;
}

// Adds a tiered product to cart, recording which tier (pack size) was chosen
function addToCartWithTier(productId) {
  const p0 = PRODUCTS.find(p => p.id === productId);
  const tiers = (p0 && p0._backendTiers) || QTY_TIERS[productId];
  if (!tiers) {
    // No tier system — standard add to cart
    STORE.addToCart(productId, pQty);
    return;
  }
  const tierIdx = selectedTiers[productId] !== undefined ? selectedTiers[productId] : 0;
  const tier = tiers[tierIdx];
  const p = PRODUCTS.find(p => p.id === productId);

  // Physical packs: 15 tabs = 1 pack, 30 = 2, 45 = 3, 60 = 4
  const physicalPacks = tier.tabs / 15;
  // qty = number of BUNDLES (1 bundle = physicalPacks physical packs)
  const ex = STORE.cart.find(i => i.id === productId && i.tierIdx === tierIdx);
  if (ex) {
    ex.qty += 1; // add 1 more bundle
  } else {
    STORE.cart.push({
      id: productId,
      qty: 1, // 1 bundle
      tierIdx,
      tierTabs: tier.tabs,
      tierRate: tier.rate,         // total price for this pack bundle
      tierMRP:  tier.mrp,
      tierDisc: tier.discountPct,
      isBundle: physicalPacks > 1, // flag for cart display
    });
  }
  STORE.save();
  const packLabel = physicalPacks === 1 ? '1 Pack (15 tabs)' : `${physicalPacks} Packs (${tier.tabs} tabs)`;
  showToast(`${p.name} — ${packLabel} added to cart!`);

}


// ── 10-Media Gallery ──────────────────────────────────────────
var _galleryMedia = [];  // [{url, type, thumb}]
var _galleryIdx   = 0;

function buildMediaGallery(p) {
  // Build media array from p.media or fallback to flat fields
  var media = [];
  if (p.media && p.media.length) {
    media = p.media.slice(0, 10);
  } else {
    var urls = [p.image, p.image2, p.image3, p.image4, p.image5].filter(Boolean);
    media = urls.map(function(u) { return {url: u, type: 'image', thumb: u}; });
  }
  if (!media.length) media = [{url:'', type:'image', thumb:''}];
  // Normalize
  media = media.map(function(m) {
    if (typeof m === 'string') return {url:m, type:'image', thumb:m};
    return {url: m.url||m.src||'', type: m.type||'image', thumb: m.thumb||m.url||m.src||''};
  });
  _galleryMedia = media;
  _galleryIdx = 0;

  var mainHtml = renderGalleryMain(media[0], 0, media.length);
  var thumbsHtml = media.map(function(m, i) {
    var isVid = m.type === 'video';
    return '<div class="thumb' + (i===0?' active':'') + '" onclick="galleryGoto(' + i + ')" title="' + (i+1) + ' of ' + media.length + '">'
      + (isVid
        ? '<video src="' + m.url + '" muted preload="metadata" style="pointer-events:none"></video><span class="vid-play-ico">▶</span>'
        : '<img src="' + (m.thumb||m.url) + '" onerror="this.src=\'https://via.placeholder.com/62x62/EAF2E0/2D5016?text=+\'">')
      + '</div>';
  }).join('');

  return '<div class="prod-images media-gallery">'
    + '<div class="gallery-main" id="galleryMain" ondblclick="openLightbox(_galleryIdx)">'
    + mainHtml
    + (media.length > 1 ? '<button class="gallery-nav prev" onclick="event.stopPropagation();galleryStep(-1)">&#8249;</button><button class="gallery-nav next" onclick="event.stopPropagation();galleryStep(1)">&#8250;</button>' : '')
    + '</div>'
    + '<div class="thumb-strip">' + thumbsHtml + '</div>'
    + '</div>';
}

function renderGalleryMain(m, idx, total) {
  if (!m) return '';
  var isVid = m.type === 'video';
  var counter = total > 1 ? '<span style="position:absolute;bottom:8px;right:10px;background:rgba(0,0,0,0.45);color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:12px;">' + (idx+1) + '/' + total + '</span>' : '';
  if (isVid) {
    return '<video src="' + m.url + '" controls preload="metadata" playsinline style="width:100%;height:100%;object-fit:contain;border-radius:var(--radius)"></video>'
      + '<span class="vid-badge">▶ Video</span>' + counter;
  }
  return '<img src="' + (m.url||'https://via.placeholder.com/500x500/EAF2E0/2D5016?text=Ascovita') + '" id="mainImg" alt="Product" onclick="openLightbox(_galleryIdx)" onerror="this.src=\'https://via.placeholder.com/500x500/EAF2E0/2D5016?text=Ascovita\'">' + counter;
}

function galleryGoto(i) {
  if (!_galleryMedia.length) return;
  i = ((i % _galleryMedia.length) + _galleryMedia.length) % _galleryMedia.length;
  _galleryIdx = i;
  var gm = document.getElementById('galleryMain');
  if (!gm) return;
  var navs = gm.querySelectorAll('.gallery-nav');
  gm.innerHTML = renderGalleryMain(_galleryMedia[i], i, _galleryMedia.length);
  if (_galleryMedia.length > 1) {
    gm.innerHTML += '<button class="gallery-nav prev" onclick="event.stopPropagation();galleryStep(-1)">&#8249;</button><button class="gallery-nav next" onclick="event.stopPropagation();galleryStep(1)">&#8250;</button>';
    gm.querySelector('img') && (gm.querySelector('img').onclick = function(){ openLightbox(_galleryIdx); });
  }
  document.querySelectorAll('.thumb-strip .thumb').forEach(function(t,j){ t.classList.toggle('active', j===i); });
}

function galleryStep(dir) {
  galleryGoto(_galleryIdx + dir);
}

// Lightbox
function openLightbox(idx) {
  var lb = document.getElementById('galleryLightbox');
  if (!lb) return;
  lb.classList.add('open');
  lbShow(idx);
}
function closeLightbox() {
  var lb = document.getElementById('galleryLightbox');
  if (lb) lb.classList.remove('open');
}
function lbShow(i) {
  i = ((i % _galleryMedia.length) + _galleryMedia.length) % _galleryMedia.length;
  _galleryIdx = i;
  var m = _galleryMedia[i];
  var lbContent = document.getElementById('lbContent');
  if (!lbContent) return;
  var isVid = m && m.type === 'video';
  lbContent.innerHTML = isVid
    ? '<video src="' + m.url + '" controls autoplay playsinline style="max-width:92vw;max-height:88vh;border-radius:10px"></video>'
    : '<img src="' + (m ? m.url : '') + '" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:10px" onerror="this.src=\'https://via.placeholder.com/600x600?text=Ascovita\'">';
  var lbCtr = document.getElementById('lbCounter');
  if (lbCtr) lbCtr.textContent = (i+1) + ' / ' + _galleryMedia.length;
}
function lbStep(dir) {
  lbShow(_galleryIdx + dir);
}
// Close lightbox on background click
document.addEventListener('DOMContentLoaded', function(){
  var lb = document.getElementById('galleryLightbox');
  if(lb) lb.addEventListener('click', function(e){ if(e.target===lb) closeLightbox(); });
  // Keyboard navigation
  document.addEventListener('keydown', function(e){
    var lb = document.getElementById('galleryLightbox');
    if(!lb || !lb.classList.contains('open')) return;
    if(e.key==='ArrowLeft') lbStep(-1);
    if(e.key==='ArrowRight') lbStep(1);
    if(e.key==='Escape') closeLightbox();
  });
});

function chQty(d) { pQty = Math.max(1, pQty + d); document.getElementById('pQtyDisp').textContent = pQty; }
function switchTab(btn, id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id)?.classList.add('active');
}
function setRating(v) {
  selectedRating = v;
  document.querySelectorAll('#starPicker span').forEach((s,i) => s.classList.toggle('lit', i < v));
}
function submitReview() {
  const name = document.getElementById('rvName')?.value.trim();
  const text = document.getElementById('rvText')?.value.trim();
  if (!name || !text || !selectedRating) { showToast('Please fill all fields and select a rating!','error'); return; }
  if (currentProduct) {
    REVIEWS[currentProduct.id] = REVIEWS[currentProduct.id]||[];
    REVIEWS[currentProduct.id].unshift({ user:name, rating:selectedRating, text, date:'Just now', verified:false });
    showToast('Review submitted! Thank you 🌿');
    buildProductPage(currentProduct);
    switchTab(document.querySelectorAll('.tab')[2], 'rvs');
  }
}

// ── CART ──
function renderCart() {
  const el = document.getElementById('cartContent');
  if (!el) return;
  if (STORE.cart.length === 0) {
    el.innerHTML = `<div class="empty-cart"><div style="font-size:4rem;margin-bottom:20px">🛒</div><h2>Your cart is empty</h2><p style="color:var(--gray);margin:10px 0 24px">Discover Ascovita's organic supplement range</p><button class="btn-primary" onclick="showPage('shop')">Shop Now →</button><div style="margin-top:28px;background:var(--green-wash);border-radius:var(--radius);padding:20px;max-width:340px;margin:28px auto 0;"><div style="font-weight:700;font-size:.88rem;margin-bottom:6px">⚡ Buy More, Save More!</div><p style="font-size:.8rem;color:var(--gray)">Select a larger pack size on any product page to unlock bigger discounts — up to 50% OFF.</p></div></div>`;
    return;
  }

  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);

  // Unified discount — check both activePromoCode and appliedDiscount
  let disc = 0, discLabel = '';
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    if (activePromoCode.type === 'pct') disc = Math.round(sub * activePromoCode.value / 100);
    else if (activePromoCode.type === 'flat') disc = Math.min(activePromoCode.value, sub);
    discLabel = activePromoCode.label || '';
  } else if (typeof appliedDiscount !== 'undefined' && appliedDiscount) {
    disc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
    discLabel = appliedDiscount.label || '';
  }

  const ship = 0; // Free shipping online
  const total = sub - disc + ship;

  // Count total physical packs for display
  const totalPacks = STORE.cart.reduce((s, item) => {
    if (item.tierTabs) return s + (item.tierTabs / 15) * item.qty;
    return s + item.qty;
  }, 0);

  el.innerHTML = `
    <div class="cart-layout">
      <div>
        <div class="cart-items-box">
          ${STORE.cart.map(item => {
            const p = PRODUCTS.find(p => p.id === item.id);
            if (!p) return '';
            const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
            const unitMRP   = item.tierMRP  !== undefined ? item.tierMRP  : p.price;
            const discPct   = item.tierDisc !== undefined ? item.tierDisc : (p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0);

            // Build a clear pack label: e.g. "4 Pack · 60 tabs · 35% OFF"
            let packLabel = '';
            if (item.tierTabs !== undefined) {
              const numPacks = item.tierTabs / 15;
              packLabel = `${numPacks} Pack${numPacks > 1 ? 's' : ''} · ${item.tierTabs} tabs${discPct > 0 ? ' · ' + discPct + '% OFF' : ''}`;
            }

            return `<div class="cart-row">
              <img class="cart-img" src="${p.image}" alt="${p.name}" onclick="openProduct(${p.id})" style="cursor:pointer" onerror="this.src='https://via.placeholder.com/80x80/EAF2E0/2D5016?text=A'">
              <div>
                <div class="ci-name" onclick="openProduct(${p.id})" style="cursor:pointer">${p.name}</div>
                ${packLabel ? `<div style="font-size:.72rem;background:var(--green-pale);color:var(--green);display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;margin-bottom:5px;font-weight:600">📦 ${packLabel}</div>` : ''}
                <div class="ci-price">₹${unitPrice.toLocaleString('en-IN')}<span class="ci-orig">${unitMRP !== unitPrice ? ' ₹' + unitMRP.toLocaleString('en-IN') : ''}</span>${discPct > 0 ? `<span style="background:#ff4757;color:white;font-size:.58rem;font-weight:800;padding:2px 6px;border-radius:100px;margin-left:6px">${discPct}% OFF</span>` : ''}</div>
                ${unitMRP !== unitPrice ? `<div style="font-size:.7rem;color:var(--success);font-weight:600;margin-top:2px">💰 Save ₹${((unitMRP - unitPrice) * item.qty).toLocaleString('en-IN')} on this item</div>` : ''}
              </div>
              <div style="text-align:right">
                <div style="font-weight:700;margin-bottom:8px;color:var(--dark)">₹${(unitPrice * item.qty).toLocaleString('en-IN')}</div>
                <div class="qty-wrap" style="margin-bottom:8px">
                  <button class="qty-btn" onclick="updateCartQty(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1},${item.qty - 1})">−</button>
                  <span class="qty-num">${item.qty}</span>
                  <button class="qty-btn" onclick="updateCartQty(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1},${item.qty + 1})">+</button>
                </div>
                <button class="ci-remove" onclick="removeCartItem(${item.id},${item.tierIdx !== undefined ? item.tierIdx : -1})">🗑️</button>
              </div>
            </div>`;
          }).join('')}
          <div style="padding:18px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <button class="btn-outline" onclick="showPage('shop')">← Continue Shopping</button>
            <span style="font-size:.82rem;color:var(--gray)">${(sub-disc) >= 599 ? '🎉 You qualify for free shipping!' : 'Add ₹' + (599 - (sub-disc)) + ' more for free shipping'}</span>
          </div>
        </div>
      </div>
      <div class="cart-summary-box">
        <h2>Order Summary</h2>
        <div class="sum-row"><span>Subtotal (${totalPacks} pack${totalPacks !== 1 ? 's' : ''})</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
        ${disc > 0 ? `
          <div class="sum-row" style="color:var(--success);font-weight:700">
            <span>🏷️ ${discLabel ? discLabel : 'Discount'}</span>
            <span>-₹${disc.toLocaleString('en-IN')}</span>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:.75rem;color:#166534;font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px">
            🎉 Total savings on this order: <strong>₹${disc.toLocaleString('en-IN')}</strong>
          </div>` : ''}
        <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success);font-weight:700">FREE 🎉</span>' : '₹' + ship}</span></div>
        <hr style="border:none;border-top:1px solid var(--light-gray);margin:8px 0">
        <div class="sum-row total"><span>Total</span><span style="color:var(--green)">₹${total.toLocaleString('en-IN')}</span></div>
        <div style="font-weight:600;font-size:.82rem;margin:16px 0 8px">Apply Coupon Code</div>
        ${(disc > 0 && discLabel) ? `<div class="disc-applied">✅ ${discLabel} applied! <span style="cursor:pointer;margin-left:auto" onclick="activePromoCode=null;appliedDiscount=null;renderCart()">✕</span></div>` : `
          <div class="coupon-row">
            <input type="text" id="couponInput" placeholder="Enter code" style="text-transform:uppercase" onkeydown="if(event.key==='Enter')applyCode()">
            <button onclick="applyCode()">Apply</button>
          </div>
          <div style="font-size:.72rem;color:var(--gray);margin-bottom:12px">Enter your promo code above</div>
        `}
        <button class="checkout-btn" onclick="showPage('checkout')">Proceed to Checkout →</button>
        <div class="pay-icons">
          <span class="pay-icon">UPI</span><span class="pay-icon">Visa</span><span class="pay-icon">MC</span><span class="pay-icon">RuPay</span>
        </div>
        <div style="text-align:center;font-size:.72rem;color:var(--gray);margin-top:10px">🔒 Secured by Cashfree</div>
      </div>
    </div>
    ${renderCartUpsell()}
    `;
}

function renderCartUpsell() {
  var cartIds = STORE.cart.map(function(i){ return i.id; });
  var hasSkin = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&p.tags.indexOf('skin')>-1; });
  var hasImmunity = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&(p.tags.indexOf('immunity')>-1||p.category==='spirulina'); });
  var hasWeight = STORE.cart.some(function(i){ var p=PRODUCTS.find(function(x){return x.id===i.id;}); return p&&p.tags&&p.tags.indexOf('weight')>-1; });
  var candidates = [];
  if (hasSkin) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('skin')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  if (hasImmunity) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('immunity')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  if (hasWeight) PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('weight')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  PRODUCTS.filter(function(p){return p.tags&&p.tags.indexOf('bestseller')>-1&&cartIds.indexOf(p.id)===-1;}).forEach(function(p){candidates.push(p);});
  var seen = {};
  var ups = candidates.filter(function(p){ if(seen[p.id])return false; seen[p.id]=true; return true; }).slice(0,4);
  if (!ups.length) return '';
  var sub = STORE.cart.reduce(function(s,item){ var p=PRODUCTS.find(function(x){return x.id===item.id;}); if(!p)return s; var up=item.tierRate!==undefined?item.tierRate:(p.salePrice||p.price); return s+up*item.qty; }, 0);
  var shipMsg = sub < 599
    ? '<div style="background:linear-gradient(135deg,#fff3cd,#ffe8a3);border:1px solid #D4A520;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px"><span style="font-size:1.4rem">&#x1F69A;</span><div><div style="font-size:.84rem;font-weight:700;color:#7a5800">Add just <strong>&#8377;' + (599-sub) + '</strong> more to unlock FREE shipping!</div><div style="font-size:.74rem;color:#9a7010;margin-top:2px">You\'re so close &#x1F382;</div></div></div>'
    : '<div style="background:linear-gradient(135deg,#d4edda,#b8dfc5);border:1px solid #28a745;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px"><span style="font-size:1.4rem">&#x1F381;</span><div><div style="font-size:.84rem;font-weight:700;color:#155724">&#x1F389; FREE shipping unlocked!</div><div style="font-size:.74rem;color:#1e7e34;margin-top:2px">Your order qualifies for free delivery</div></div></div>';
  var cards = ups.map(function(p){
    var price = p.salePrice||p.price;
    var disc = p.salePrice ? Math.round((1-p.salePrice/p.price)*100) : 0;
    var discBadge = disc > 0 ? '<span style="font-size:.68rem;color:#999;text-decoration:line-through">&#x20B9;' + p.price.toLocaleString('en-IN') + '</span> <span style="background:#ff4757;color:white;font-size:.62rem;font-weight:700;padding:1px 5px;border-radius:100px">' + disc + '% OFF</span>' : '';
    return '<div id="upsell_' + p.id + '" style="background:white;border-radius:14px;padding:14px;border:1px solid rgba(240,180,41,.3);display:flex;gap:10px;align-items:flex-start;cursor:pointer" onclick="addUpsellToCart(' + p.id + ')">'
      + '<img src="' + p.image + '" style="width:54px;height:54px;object-fit:cover;border-radius:10px;flex-shrink:0" onerror="this.src=\'https://via.placeholder.com/54x54/EAF2E0/2D5016?text=A\'" alt="' + p.name + '">'
      + '<div style="flex:1;min-width:0"><div style="font-size:.78rem;font-weight:700;color:#1a1a1a;line-height:1.35;margin-bottom:5px">' + p.name + '</div>'
      + '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap"><span style="font-size:.88rem;font-weight:800;color:var(--green)">&#x20B9;' + price.toLocaleString('en-IN') + '</span>' + discBadge + '</div>'
      + '<button style="margin-top:8px;background:var(--green);color:white;border:none;border-radius:100px;padding:5px 14px;font-size:.72rem;font-weight:700;cursor:pointer;font-family:var(--font-body)" onclick="event.stopPropagation();addUpsellToCart(' + p.id + ')">+ Add</button></div></div>';
  }).join('');
  return '<div style="margin-top:32px"><div style="background:linear-gradient(135deg,#fffdf0,#fff8e0);border:2px solid #f0b429;border-radius:20px;padding:26px">'
    + shipMsg
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><div><div style="font-size:.7rem;color:#b8860b;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">&#x1F4A1; Complete Your Wellness Stack</div><div style="font-size:1rem;font-weight:800;color:#1a1a1a;margin-top:3px">Customers Also Bought</div></div><span style="background:#f0b429;color:white;font-size:.69rem;font-weight:700;padding:3px 10px;border-radius:100px">SAVE MORE</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">' + cards + '</div>'
    + '</div></div>';
}

function addUpsellToCart(productId) {
  var p = PRODUCTS.find(function(x){ return x.id === productId; });
  if (!p) return;
  var existing = STORE.cart.find(function(i){ return i.id === productId && i.tierIdx === undefined; });
  if (existing) { existing.qty++; } else { STORE.cart.push({id:productId, qty:1}); }
  STORE.save(); STORE.updateCartUI();
  showToast('&#x1F33F; ' + p.name + ' added!', 'success');
  setTimeout(function(){ renderCart(); }, 300);
}


// Cart item helpers that handle both tiered and non-tiered items
function updateCartQty(productId, tierIdx, newQty) {
  if (newQty < 1) { removeCartItem(productId, tierIdx); return; }
  const item = STORE.cart.find(i => i.id === productId && (tierIdx === -1 ? i.tierIdx === undefined : i.tierIdx === tierIdx));
  if (item) { item.qty = newQty; STORE.save(); }
  renderCart();
}
function removeCartItem(productId, tierIdx) {
  STORE.cart = STORE.cart.filter(i => !(i.id === productId && (tierIdx === -1 ? i.tierIdx === undefined : i.tierIdx === tierIdx)));
  STORE.save();
  renderCart();
}

async function applyCode() {
  const input = document.getElementById('couponInput');
  const code = input?.value?.trim().toUpperCase();
  if (!code) return;

  // Local test codes only
  if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[code]) {
    const promo = PROMO_CODES[code];
    activePromoCode = { code, ...promo };
    appliedDiscount = { label: promo.label, type: promo.type === 'pct' ? 'percent' : 'flat', value: promo.value };
    showToast(`🏷️ ${code} applied — ${promo.label}!`);
    renderCart();
    return;
  }

  // All real codes come from backend
  const subtotal = STORE.cart.reduce((s,i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return s + ((p?.salePrice || p?.price || 0) * i.qty);
  }, 0);
  try {
    const backendPromo = await validateCouponWithBackend(code, subtotal);
    if (backendPromo) {
      const type = backendPromo.type === 'percent' ? 'pct' : 'flat';
      activePromoCode = { code, type, value: backendPromo.value, label: backendPromo.label || `${code} applied` };
      appliedDiscount = { label: activePromoCode.label, type: backendPromo.type, value: backendPromo.value };
      showToast(`🏷️ ${code} applied — ${activePromoCode.label}!`);
      renderCart();
      return;
    }
  } catch(e) {}

  showToast('❌ Invalid or expired code. Check admin for active codes.', 'error');
}

// ── CHECKOUT ──
function updateCodBtnNote() {
  const note = document.getElementById('codBtnNote');
  if (!note) return;
  const { sub, disc } = getOrderTotal();
  const net = sub - disc;
  note.textContent = net >= 599 ? '✅ Free COD on your order!' : '+₹60 COD charge · Free if order ≥ ₹599';
  note.style.color = net >= 599 ? '#d4edda' : 'rgba(255,255,255,0.85)';
}

function renderCheckoutSummary() {
  const el = document.getElementById('ckSummary');
  if (!el) return;
  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);

  // Use activePromoCode (the working variable) — fix for promo not affecting price
  let disc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    if (activePromoCode.type === 'pct') disc = Math.round(sub * activePromoCode.value / 100);
    else if (activePromoCode.type === 'flat') disc = Math.min(activePromoCode.value, sub);
  } else if (typeof appliedDiscount !== 'undefined' && appliedDiscount) {
    disc = appliedDiscount.type==='percent' ? Math.round(sub*appliedDiscount.value/100) : appliedDiscount.value;
  }

  const ship = 0; // Free shipping online
  const total = sub - disc + ship;

  el.innerHTML = `
    ${STORE.cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      if (!p) return '';
      const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
      const packLabel = item.tierTabs ? ` (${item.tierTabs} tabs)` : '';
      // Show the tier label (e.g. "3 Pack") if available
      const tierLabel = item.tierLabel ? ` — ${item.tierLabel}` : '';
      return `<div style="display:flex;gap:10px;margin-bottom:12px;align-items:center">
        <img src="${p.image}" style="width:46px;height:46px;border-radius:8px;object-fit:contain;background:var(--off-white);padding:4px" onerror="this.src='https://via.placeholder.com/46/EAF2E0/2D5016?text=A'">
        <div style="flex:1">
          <div style="font-size:.8rem;font-weight:600">${p.name}${packLabel}${tierLabel}</div>
          <div style="font-size:.72rem;color:var(--gray)">Qty: ${item.qty} × ₹${unitPrice.toLocaleString('en-IN')}</div>
        </div>
        <div style="font-weight:700;font-size:.85rem">₹${(unitPrice * item.qty).toLocaleString('en-IN')}</div>
      </div>`;
    }).join('')}
    <hr style="border:none;border-top:1px solid var(--light-gray);margin:12px 0">
    <div class="sum-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
    ${disc > 0 ? `<div class="sum-row" style="color:var(--success)"><span>🏷️ Discount</span><span>-₹${disc.toLocaleString('en-IN')}</span></div>` : ''}
    <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success);font-weight:700">FREE</span>' : '₹' + ship}</span></div>
    <hr style="border:none;border-top:1px solid var(--light-gray);margin:8px 0">
    <div class="sum-row total"><span>Total</span><span style="color:var(--green);font-size:1.1rem">₹${total.toLocaleString('en-IN')}</span></div>`;
}

function selPayMethod(el) { /* handled by new payment modal */ }

function placeOrder() {
  // Route to the real payment gateway
  initiatePayment();
}

// ── BLOG ──
function renderBlogCard(b) {
  return `<a class="blog-card" href="#" onclick="return false">
    <img class="blog-img" src="${b.img}" alt="${b.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=60'">
    <div class="blog-body">
      <span class="blog-tag">${b.tag}</span>
      <h3 class="blog-title">${b.title}</h3>
      <p class="blog-exc">${b.excerpt}</p>
      <div class="blog-meta"><span>📅 ${b.date}</span><span>⏱ ${b.readTime}</span><span>✍ ${b.author}</span></div>
    </div>
  </a>`;
}
function renderFullBlog() { const el=document.getElementById('fullBlogGrid'); if(el) el.innerHTML=BLOGS.map(renderBlogCard).join(''); }

// ── FAQ ──
function renderFaqItem(f) {
  return `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q}<span class="faq-icon">+</span></button><div class="faq-a"><div class="faq-a-inner">${f.a}</div></div></div>`;
}
function renderFullFaq() {
  const el=document.getElementById('fullFaqWrap'); if(!el) return;
  const cats=[...new Set(FAQS.map(f=>f.cat))];
  el.innerHTML=cats.map(c=>`<h2 style="font-size:1.1rem;font-weight:700;color:var(--green);margin:28px 0 14px;padding-bottom:7px;border-bottom:2px solid var(--green-pale)">${c}</h2>${FAQS.filter(f=>f.cat===c).map(renderFaqItem).join('')}`).join('');
}
function toggleFaq(btn) {
  const item=btn.parentElement, ans=item.querySelector('.faq-a'), open=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i=>{i.classList.remove('open');i.querySelector('.faq-a').style.maxHeight='0';});
  if(!open){item.classList.add('open');ans.style.maxHeight=ans.scrollHeight+'px';}
}

// ── TESTIMONIALS ──
function renderTestimonials() {
  const testi=[
    {stars:5,text:'"Moringa Green Apple has become my morning ritual. My energy levels have transformed in 3 weeks. The taste is genuinely delicious – not like medicine at all!"',name:'Kavya Patel',loc:'Ahmedabad, Gujarat',ico:'👩'},
    {stars:5,text:'"B1+Biotin Guava is magical for hair. My hair fall dropped dramatically. I tell every woman in my family to get this. Ascovita is a brand I trust completely."',name:'Deepa Nair',loc:'Kochi, Kerala',ico:'👩'},
    {stars:5,text:'"Spirulina Vita Plus improved my haemoglobin from 9.2 to 11.8 in 3 months! My doctor was impressed. Best investment in my health I\'ve ever made."',name:'Sunita Rao',loc:'Hyderabad, Telangana',ico:'👩'},
    {stars:5,text:'"Glutathione has genuinely improved my skin tone. I noticed the change within a month. The effervescent format means fast absorption. Worth every rupee."',name:'Meera Sharma',loc:'Mumbai, Maharashtra',ico:'👩'},
    {stars:4,text:'"Multidiata covers all my nutritional bases at a very affordable price. My B12 deficiency has improved significantly as confirmed by recent blood reports."',name:'Rahul Kumar',loc:'Delhi',ico:'👨'},
    {stars:5,text:'"The Moringa Duo Pack is great value. Alternating flavours keeps it fun. Ascovita packaging is also very neat – feels premium."',name:'Anjali Mehta',loc:'Pune, Maharashtra',ico:'👩'},
  ];
  return testi.map(t=>`<div class="testi-card"><div class="testi-stars">${'★'.repeat(t.stars)}</div><p class="testi-text">${t.text}</p><div class="testi-user"><div class="testi-avatar">${t.ico}</div><div><div class="testi-name">${t.name}</div><div class="testi-loc">${t.loc}</div></div></div></div>`).join('');
}

// ── CAROUSEL ──
const totalSlides=3;
function moveCarousel(d) { carouselIdx=(carouselIdx+d+totalSlides)%totalSlides; goSlide(carouselIdx); }
function goSlide(i) {
  carouselIdx=i;
  const ct=document.getElementById('carouselTrack'); if(ct) ct.style.transform=`translateX(-${i*100}%)`;
  document.querySelectorAll('.c-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}
document.addEventListener('DOMContentLoaded', function(){ setInterval(function(){ moveCarousel(1); }, 5500); });

// ── UTILS ──
function copyCode(code) { navigator.clipboard?.writeText(code).catch(()=>{}); showToast(`Code "${code}" copied! 🌿`); }
function subscribeNL() {
  const e=document.getElementById('nlEmail')?.value;
  if(!e||!e.includes('@')){showToast('Please enter a valid email','error');return;}
  showToast('Subscribed! Welcome to the Ascovita family 🌿');
  if(document.getElementById('nlEmail')) document.getElementById('nlEmail').value='';
}

// ── INIT ──
function bootApp() {
  try { STORE.init(); } catch(e) { console.error('STORE init:', e); }
  try { initCashfree(); } catch(e) {}
  try { renderFullFaq(); } catch(e) {}
  try { const hfw2=document.getElementById('homeFaqWrap'); if(hfw2) hfw2.innerHTML = FAQS.slice(0,5).map(renderFaqItem).join(''); } catch(e) {}
  // 🔗 Sync live product data from Supabase backend (non-blocking)
  syncProductsFromBackend();

  // 📡 Ping backend to register this visitor session (for Live Visitors in admin)
  (function pingVisitor() {
    try {
      const page = document.title || window.location.pathname;
      const device = /Mobi|Android/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 Desktop';
      const sessionId = sessionStorage.getItem('asc_sid') || (() => {
        const id = Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem('asc_sid', id);
        return id;
      })();
      const payload = { session_id: sessionId, page, device, ts: Date.now() };
      fetch(`${API_BASE}/api/visitors/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {}); // silently ignore if backend offline
      // Re-ping every 4 minutes to keep session alive
      setInterval(() => {
        payload.ts = Date.now();
        payload.page = document.title || window.location.pathname;
        fetch(`${API_BASE}/api/visitors/ping`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), keepalive: true
        }).catch(() => {});
      }, 4 * 60 * 1000);
    } catch(e) {}
  })();

  // ── GitHub Pages SPA routing fix ──
  // When 404.html catches /about etc., it redirects to /?p=%2Fabout
  // We decode that here and show the right page, then clean the URL
  const _spParam = new URLSearchParams(window.location.search).get('p');
  if (_spParam) {
    try { history.replaceState(null, '', _spParam); } catch(e) {}
  }

  // Handle direct URL with clean path (e.g. ascovita.com/about) OR legacy hash (ascovita.com/#shop)
  const _fullPath = (_spParam || window.location.pathname).replace(/^\//, '').trim();
  const _pathParts = _fullPath.split('/');
  const _pathPage = _pathParts[0];
  const _pathSlug = _pathParts[1] || null; // e.g. 'glutathione-effervescent' from /product/glutathione-effervescent
  const _hashPage = window.location.hash.replace('#', '').trim();
  const _initPage = _pathPage || _hashPage;
  const _validPages = ['home','shop','blog','about','b2b','contact','faq','advisor','product'];
  if (_initPage && _validPages.includes(_initPage)) {
    if (_initPage === 'product' && _pathSlug) {
      // Find product by slug and open it
      setTimeout(function() {
        if (typeof slugify === 'function' && typeof PRODUCTS !== 'undefined') {
          const prod = PRODUCTS.find(p => slugify(p.name) === _pathSlug);
          if (prod) openProduct(prod.id);
          else showPage('shop');
        }
      }, 300);
    } else {
      setTimeout(function() { showPage(_initPage); }, 200);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    const state = e.state || {};
    const pathParts = window.location.pathname.replace(/^\//, '').split('/');
    const pg = state.page || pathParts[0] || 'home';
    const slug = state.id ? null : pathParts[1];
    if (pg === 'product') {
      const prodId = state.id || (typeof slugify === 'function' && PRODUCTS.find(p => slugify(p.name) === slug)?.id);
      if (prodId) { currentProduct = PRODUCTS.find(p => p.id === prodId); buildProductPage(currentProduct); }
    }
    if (_validPages.includes(pg)) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const el = document.getElementById('page-' + pg);
      if (el) { el.classList.add('active'); window.scrollTo({top:0}); currentPage = pg; }
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === pg));
    }
  });

  // ── Handle Cashfree redirect return ──
  var sp = new URLSearchParams(window.location.search);
  var cfoid = sp.get('cf_order');
  if (cfoid) {
    try { history.replaceState({}, '', window.location.pathname); } catch(e) { /* suppressed: sandboxed iframe preview */ }
    var sv = localStorage.getItem('asc_pend_' + cfoid);
    if (sv) {
      try {
        var pd = JSON.parse(sv);
        localStorage.removeItem('asc_pend_' + cfoid);
        var apiEp = API_BASE;
        // Show processing screen while verifying
        document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
        showProcessingScreen(cfoid, pd.total, 'redirect');
        updateProcessingStatus(70, 'Verifying payment...');
        fetch(apiEp + '/api/verify-order/' + cfoid, {})
          .then(function(r){ return r.json(); })
          .then(function(d){
            var st = (d.order_status || d.payment_status || '').toUpperCase();
            // ACTIVE = order created but not paid. PAID/SUCCESS = confirmed payment only.
            var isPaid = (st === 'PAID' || st === 'SUCCESS');
            var isCancelled = (st === 'ACTIVE' || st === 'PENDING' || st === 'CANCELLED' || st === 'EXPIRED' || st === '');
            if (isPaid) {
              updateProcessingStatus(100, 'Payment confirmed!');
              setTimeout(function(){ hideProcessingScreen(); finalizeOrder(cfoid, pd.formData, pd.total, 'redirect'); }, 800);
            } else {
              // Not paid — show clear message, do NOT finalize
              hideProcessingScreen();
              initHome();
              var msg = isCancelled
                ? 'Payment was not completed. Your cart has been saved — please try again.'
                : 'Payment not confirmed (status: ' + st + '). If money was deducted, contact +91 98985 82650 with Order ID: ' + cfoid;
              setTimeout(function(){
                showPaymentError(msg, cfoid, pd.formData, pd.total, 'redirect');
              }, 400);
            }
          }).catch(function(err){
            // Network error during verification — do NOT finalize, show safe error
            hideProcessingScreen();
            initHome();
            setTimeout(function(){
              showPaymentError('Could not verify payment due to network error. If money was deducted, contact +91 98985 82650 with Order ID: ' + cfoid, cfoid, pd.formData, pd.total, 'redirect');
            }, 400);
          });
        return; // Don't call initHome below
      } catch(e) {}
    }
  }

  try { initHome(); } catch(e) { console.error('initHome:', e); }
  // Ensure home page is shown
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var home = document.getElementById('page-home');
  if (home) home.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function(){ bootApp(); });
// Fallback for Hostinger CDN edge case where DOMContentLoaded may already have fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function(){ bootApp(); }, 50);
}

// ══════════════════════════════════════════════
// CASHFREE PAYMENT INTEGRATION — LIVE GATEWAY
// ══════════════════════════════════════════════

// ── CASHFREE SDK INIT ──
// Per Cashfree docs: initialize with mode each time before checkout()
let cashfree = null;
function getCashfreeInstance() {
  const CF = (typeof window.Cashfree !== 'undefined') ? window.Cashfree
           : (typeof Cashfree !== 'undefined') ? Cashfree : null;
  if (!CF) return null;
  return CF({ mode: 'production' });
}
function initCashfree() {
  cashfree = getCashfreeInstance();
  return !!cashfree;
}

// ── COLLECT FORM DATA ──
function getFormField(selector) {
  return document.querySelector('#page-checkout ' + selector)?.value?.trim() || '';
}

function validateCheckoutForm() {
  const firstName = getFormField('input[placeholder="Enter first name"]');
  const lastName  = getFormField('input[placeholder="Enter last name"]');
  const email     = getFormField('input[type="email"]');
  const phone     = getFormField('input[type="tel"]');
  const addr1     = getFormField('input[placeholder="House / Flat No., Street"]');
  const city      = getFormField('input[placeholder="City"]');
  const state     = getFormField('input[placeholder="State"]');
  const pin       = getFormField('input[placeholder="6-digit PIN"]');
  const addr2     = getFormField('input[placeholder="Area / Locality (optional)"]');

  if (!firstName || !lastName) { showToast('⚠️ Please enter your full name', 'error'); return null; }
  if (!email || !email.includes('@')) { showToast('⚠️ Please enter a valid email address', 'error'); return null; }
  if (!phone || phone.replace(/\D/g,'').length < 10) { showToast('⚠️ Please enter a valid 10-digit mobile number', 'error'); return null; }
  if (!addr1) { showToast('⚠️ Please enter your delivery address', 'error'); return null; }
  if (!city || !state) { showToast('⚠️ Please enter your city and state', 'error'); return null; }
  if (!pin || pin.replace(/\D/g,'').length !== 6) { showToast('⚠️ Please enter a valid 6-digit PIN code', 'error'); return null; }

  return { firstName, lastName, email, phone: phone.replace(/\D/g,'').slice(-10), addr1, addr2, city, state, pin };
}

// ── ORDER TOTAL ──
function getOrderTotal() {
  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return s;
    const unitPrice = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return s + unitPrice * item.qty;
  }, 0);
  // Check both activePromoCode and appliedDiscount (same value, two variable names used in different places)
  let disc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    disc = activePromoCode.type === 'pct' ? Math.round(sub * activePromoCode.value / 100) : Math.min(activePromoCode.value, sub);
  } else if (appliedDiscount) {
    disc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
  }
  const ship = 0; // Free shipping for online payment
  return { sub, disc, ship, total: Math.max(0, sub - disc + ship) };
}

// ── GENERATE ORDER ID ──
function generateOrderId() {
  return 'AVC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// ══════════════════════════════════════════════
// MAIN PAYMENT ENTRY POINT
// Called when user clicks "Pay Securely"
// ══════════════════════════════════════════════
async function initiatePayment() {
  if (STORE.cart.length === 0) { showToast('🛒 Your cart is empty!', 'error'); return; }

  const formData = validateCheckoutForm();
  if (!formData) return;

  const { total, sub, disc, ship } = getOrderTotal();
  const orderId = generateOrderId();

  // Lock button
  const btn = document.querySelector('#page-checkout .checkout-btn');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Opening Payment Gateway...'; }

  // Always show the Cashfree payment modal UI
  // In PRODUCTION: the modal calls your backend to get a payment_session_id
  // then opens the real Cashfree SDK checkout
  openPaymentGateway(orderId, total, sub, disc, ship, formData, btn, origText);
}

// ══════════════════════════════════════════════
// CASHFREE PAYMENT GATEWAY MODAL
// This opens a full-screen payment UI
// ══════════════════════════════════════════════
function openPaymentGateway(orderId, total, sub, disc, ship, formData, btn, origText) {

  // Store payment context globally to avoid quote-escaping issues in onclick
  window._pendingPayment = { orderId, total, sub, disc, ship, formData };

  // Remove any existing modal
  document.getElementById('cfPayModal')?.remove();

  // Build cart items HTML
  const cartItems = STORE.cart.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return '';
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    const pack = item.tierTabs ? ` (${item.tierTabs} tabs)` : '';
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:.82rem">
      <span style="color:#444">${p.name}${pack} × ${item.qty}</span>
      <span style="font-weight:700;color:#2D5016">₹${(price * item.qty).toLocaleString('en-IN')}</span>
    </div>`;
  }).join('');

  const discHtml = disc > 0
    ? `<div style="display:flex;justify-content:space-between;font-size:.78rem;color:#27ae60;margin-bottom:4px">
        <span>Discount (${appliedDiscount ? appliedDiscount.label : 'Applied'})</span>
        <span>-₹${disc.toLocaleString('en-IN')}</span>
       </div>` : '';

  const modal = document.createElement('div');
  modal.id = 'cfPayModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:480px;max-height:94vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,0.45)">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2D5016,#4a7c28);padding:20px 24px;border-radius:20px 20px 0 0;color:white;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:1.05rem;font-weight:800">🔒 Secure Checkout</div>
          <div style="font-size:.68rem;opacity:.8;margin-top:2px">Powered by Cashfree · PCI DSS Secured</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.8rem;font-weight:900">₹${total.toLocaleString('en-IN')}</div>
          <div style="font-size:.62rem;opacity:.75">Total payable</div>
        </div>
      </div>

      <div style="padding:20px 22px">

        <!-- Order Summary -->
        <div style="background:#f8fdf4;border:1px solid #c8e6a8;border-radius:12px;padding:14px;margin-bottom:16px">
          <div style="font-weight:700;font-size:.75rem;color:#2D5016;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">📦 Order · ${orderId}</div>
          ${cartItems}
          <div style="margin-top:10px;padding-top:8px;border-top:1.5px solid #c8e6a8">
            <div style="display:flex;justify-content:space-between;font-size:.78rem;color:#666;margin-bottom:3px"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
            ${discHtml}
            <div style="display:flex;justify-content:space-between;font-size:.78rem;color:#666;margin-bottom:6px"><span>Shipping</span><span style="color:${ship === 0 ? '#27ae60' : '#333'}">${ship === 0 ? 'FREE' : '₹' + ship}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:.95rem;color:#2D5016"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div style="background:#fafafa;border-radius:10px;padding:11px 14px;margin-bottom:16px;font-size:.78rem;color:#555;line-height:1.6">
          <span style="font-weight:700;color:#222">👤 Ship to: </span>
          ${formData.firstName} ${formData.lastName} · ${formData.phone}<br>
          ${formData.addr1}, ${formData.city}, ${formData.state} – ${formData.pin}<br>
          <span style="color:#2D5016">✉ ${formData.email}</span>
        </div>

        <!-- Payment Methods Title -->
        <div style="font-weight:700;font-size:.85rem;color:#222;margin-bottom:10px">💳 Select Payment Method</div>

        <!-- Payment Buttons -->
        <div style="display:grid;gap:10px;margin-bottom:14px">

          <button class="cfPayBtn" onclick="startPayment('upi')"
            style="background:linear-gradient(135deg,#5f48ea,#7c3aed);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">📱</span>
            <div style="flex:1">
              <div>UPI · Google Pay / PhonePe / BHIM</div>
              <div style="font-size:.68rem;opacity:.8;font-weight:400;margin-top:1px">Instant transfer · No extra charges</div>
            </div>
            <span style="background:rgba(255,255,255,.25);padding:2px 8px;border-radius:100px;font-size:.62rem;white-space:nowrap">⭐ BEST</span>
          </button>

          <button class="cfPayBtn" onclick="startPayment('card')"
            style="background:linear-gradient(135deg,#1a1a2e,#2d2d5e);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">💳</span>
            <div>
              <div>Credit / Debit Card</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">Visa · Mastercard · RuPay · AmEx</div>
            </div>
          </button>

          <button class="cfPayBtn" onclick="startPayment('netbanking')"
            style="background:linear-gradient(135deg,#0052cc,#0070f3);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">🏦</span>
            <div>
              <div>Net Banking</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">All major Indian banks supported</div>
            </div>
          </button>

          <button class="cfPayBtn" onclick="startPayment('emi')"
            style="background:linear-gradient(135deg,#c0392b,#e74c3c);color:#fff;border:none;border-radius:13px;padding:15px 18px;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:opacity .15s">
            <span style="font-size:1.6rem">📊</span>
            <div>
              <div>EMI — No Cost Available</div>
              <div style="font-size:.68rem;opacity:.7;font-weight:400;margin-top:1px">3 / 6 / 9 / 12 months · Partner banks</div>
            </div>
          </button>

        </div>

        <!-- Trust Badges -->
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px;flex-wrap:wrap">
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">🔒 256-bit SSL</span>
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">✅ PCI DSS</span>
          <span style="font-size:.68rem;color:#999;display:flex;align-items:center;gap:4px">🛡️ Cashfree Secured</span>
        </div>

        <!-- Cancel -->
        <button onclick="closePaymentModal()" style="width:100%;background:#f2f2f2;color:#777;border:none;border-radius:10px;padding:11px;font-size:.82rem;cursor:pointer">
          ✕ Cancel &amp; Go Back
        </button>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Re-enable checkout button
  if (btn) { btn.disabled = false; btn.textContent = origText || '🔒 Pay Securely via Cashfree'; }
}
// ── CLOSE PAYMENT MODAL ──
function closePaymentModal() {
  document.getElementById('cfPayModal')?.remove();
}

// ══════════════════════════════════════════════
// startPayment(method) — called by modal buttons
// Reads from window._pendingPayment (no escaping issues)
// ══════════════════════════════════════════════
async function startPayment(method) {
  const pd = window._pendingPayment;
  if (!pd) { showToast('Payment session expired. Please try again.', 'error'); closePaymentModal(); return; }

  const { orderId, total, formData } = pd;

  // Get checkout button reference so we can re-enable it on error
  const btn = document.querySelector('#page-checkout .checkout-btn');
  const origText = btn ? btn.textContent : '🔒 Pay Securely via Cashfree';

  // Lock all pay buttons and show spinner on selected
  document.querySelectorAll('.cfPayBtn').forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.5';
  });

  const methodLabels = { upi:'UPI', card:'Credit/Debit Card', netbanking:'Net Banking', emi:'EMI' };
  const activeBtn = [...document.querySelectorAll('.cfPayBtn')].find(b => b.onclick.toString().includes(`'${method}'`));
  if (activeBtn) {
    activeBtn.style.opacity = '1';
    activeBtn.innerHTML = `<span style="font-size:1.4rem">⏳</span> <span>Processing ${methodLabels[method]}...</span>`;
  }

  // Close modal after brief delay and show processing screen
  await new Promise(r => setTimeout(r, 600));
  closePaymentModal();
  showProcessingScreen(orderId, total, method);

  // ────────────────────────────────────────────────────────
  // CASHFREE PAYMENT FLOW — PRODUCTION
  // ────────────────────────────────────────────────────────

  window.ASCOVITA_API_ENDPOINT = API_BASE;
  const apiEndpoint = window.ASCOVITA_API_ENDPOINT;

  try {
    // ── STEP 1: Wake up Render backend (free tier cold-start fix) ──
    updateProcessingStatus(10, '⏳ Starting payment server (may take 30s on first load)...');
    try {
      await fetch(apiEndpoint + '/');
      await new Promise(r => setTimeout(r, 2000)); // wait 2s for backend to fully wake
    } catch(e) { /* ignore */ }

    // ── STEP 2: Create Cashfree order on backend ──
    // NOTE: No AbortSignal used here — AbortSignal is not cloneable and causes
    // DataCloneError when Cashfree SDK calls postMessage() internally
    updateProcessingStatus(25, 'Creating secure payment session...');
    const resp = await fetch(apiEndpoint + '/api/create-cashfree-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id:       orderId,
        amount:         total,
        order_amount:   total,
        order_currency: 'INR',
        customer_name:  formData.firstName + ' ' + formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone.replace(/^\+?91/, '').replace(/\D/g, ''),
        customer_details: {
          customer_id:    'CUST_' + formData.phone.replace(/\D/g, ''),
          customer_name:  formData.firstName + ' ' + formData.lastName,
          customer_email: formData.email,
          customer_phone: formData.phone.replace(/^\+?91/, '').replace(/\D/g, ''),
        }
      })
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Backend error ' + resp.status);
    }
    const sessionData = await resp.json();
    const payment_session_id = sessionData.payment_session_id;
    if (!payment_session_id) throw new Error('No payment session received from server');

    // ── STEP 3: Initialize Cashfree SDK ──
    updateProcessingStatus(45, 'Loading payment gateway...');

    // Wait for Cashfree global to be available (max 15s)
    let CF = null;
    for (let i = 0; i < 15; i++) {
      // Cashfree CDN sets window.Cashfree as a function
      if (typeof window.Cashfree === 'function') { CF = window.Cashfree; break; }
      // Some environments expose it as global Cashfree
      try { if (typeof Cashfree === 'function') { CF = Cashfree; break; } } catch(e) {}
      await new Promise(r => setTimeout(r, 1000));
      updateProcessingStatus(45, 'Loading payment gateway... (' + (i+1) + 's)');
    }

    if (!CF) throw new Error('Cashfree SDK not loaded. Please refresh the page and try again.');

    // Initialize with mode — Cashfree CDN v3 pattern
    let cfInstance;
    try {
      cfInstance = CF({ mode: 'production' });
    } catch(e) {
      console.error('CF init error:', e);
      throw new Error('Payment gateway initialization failed: ' + e.message);
    }

    // ── STEP 4: Open Cashfree checkout ──
    updateProcessingStatus(60, 'Opening secure checkout...');

    // Save pending data before redirect
    localStorage.setItem('asc_pend_'+orderId, JSON.stringify({formData,total,method:'redirect'}));

    // Show a "Redirecting..." message instead of hiding screen — looks professional
    // We'll hide it if the redirect doesn't happen (inline payment)
    updateProcessingStatus(75, '🔒 Redirecting to secure payment...');
    // Show redirecting message overlay
    const procScreen = document.getElementById('processingScreen') || document.getElementById('paymentProcessing');
    const procMsg = document.querySelector('.processing-msg') || document.querySelector('.proc-status');
    if (procMsg) procMsg.innerHTML = '🔒 Redirecting to secure Cashfree checkout&hellip;<br><small style="opacity:.6;font-size:.78rem">Please wait, do not press back</small>';

    const returnUrl = window.location.origin + window.location.pathname + '?cf_order=' + orderId;
    // ── Set a redirect flag so we know the page is leaving ──
    let isRedirecting = false;

    const result = await cfInstance.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget:   '_self',
      returnUrl:        returnUrl,
      mode:             'production',
      onRedirect: () => { isRedirecting = true; },
    });

    // If page is navigating away to Cashfree — do nothing, let it redirect
    // The result here is from _inline_ payment (UPI/Card widget), not redirect
    if (isRedirecting) {
      // Browser is leaving the page — keep showing "Opening checkout..." screen
      // Do NOT show error — page will redirect momentarily
      return;
    }

    // Only reach here for inline (non-redirect) payment results

    // ── STEP 5: Verify inline result ──
    if (!result || result.error) {
      const errMsg = (result?.error?.message) || (result?.error?.type) || 'Payment cancelled or failed.';
      showPaymentError(errMsg, orderId, formData, total, method);
      if (btn) { btn.disabled = false; btn.textContent = origText; }
      return;
    }

    // Check payment status — try backend verification first for accuracy
    showProcessingScreen(orderId, total, method);
    updateProcessingStatus(80, 'Verifying payment...');
    let verified = false;

    try {
      const verifyResp = await fetch(apiEndpoint + '/api/verify-order/' + orderId);
      const verifyData = await verifyResp.json();
      const status = (verifyData.order_status || verifyData.payment_status || '').toUpperCase();
      // Only PAID or SUCCESS = real payment. ACTIVE/PENDING = user didn't pay.
      verified = (status === 'PAID' || status === 'SUCCESS');
      if (!verified) {
      }
    } catch(e) {
      // If backend verify fails, ONLY trust explicit SUCCESS from paymentDetails
      // Never trust result.redirect — it fires even when user closes checkout
      const rd = result && result.paymentDetails;
      verified = !result?.error && rd && (
        rd.paymentStatus === 'SUCCESS' ||
        rd.paymentMessage === 'Payment successful'
      ) && result?.transaction?.txStatus === 'SUCCESS';
      // Default to NOT verified if we can't confirm — safer to ask user to contact support
    }

    if (verified) {
      updateProcessingStatus(100, '✅ Payment confirmed!');
      await new Promise(r => setTimeout(r, 600));
      hideProcessingScreen();
      await finalizeOrder(orderId, formData, total, method);
    } else {
      hideProcessingScreen();
      showPaymentError('Payment could not be verified. If amount was deducted, contact us at +91 98985 82650 with Order ID: ' + orderId, orderId, formData, total, method);
      if (btn) { btn.disabled = false; btn.textContent = origText; }
    }

  } catch(err) {
    // If we're mid-redirect, suppress errors — browser is leaving the page
    if (typeof isRedirecting !== 'undefined' && isRedirecting) return;
    // Also suppress if page is actually navigating (document hidden or unloading)
    if (document.hidden || document.visibilityState === 'hidden') return;
    
    hideProcessingScreen();
    console.error('Payment error:', err);
    const msg = err.name === 'TimeoutError'
      ? 'Our payment server is starting up (takes ~30 seconds on first load). Please wait 30 seconds and click Retry Payment.'
      : (err.message || 'Payment failed. Please try again.');
    showPaymentError(msg, orderId, formData, total, method);
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

// ══════════════════════════════════════════════
// COD — called directly from checkout page (no modal)
// ══════════════════════════════════════════════
async function initiateCOD() {
  if (STORE.cart.length === 0) { showToast('🛒 Your cart is empty!', 'error'); return; }
  const formData = validateCheckoutForm();
  if (!formData) return;

  const { sub, disc } = getOrderTotal();
  const orderId = generateOrderId();
  const netSub = sub - disc;
  const codCharge = netSub >= 599 ? 0 : 60;
  const codTotal = netSub + codCharge;

  // Store for COD flow
  window._pendingPayment = { orderId, total: codTotal, sub, disc, formData };

  // Show overlay
  const overlay = document.createElement('div');
  overlay.id = 'codOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:340px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
    <div style="font-size:3rem;margin-bottom:12px">💵</div>
    <div style="font-weight:800;font-size:1.15rem;color:#2D5016;margin-bottom:6px">Confirm COD Order</div>
    <div style="font-size:.85rem;color:#444;margin-bottom:4px">Order: <strong>${orderId}</strong></div>
    <div style="font-size:.9rem;color:#333;margin:10px 0;font-weight:700">Total: ₹${codTotal.toLocaleString('en-IN')}</div>
    ${codCharge > 0 ? `<div style="font-size:.75rem;color:#888;margin-bottom:16px">Includes ₹${codCharge} COD charge</div>` : `<div style="font-size:.75rem;color:#27ae60;font-weight:700;margin-bottom:16px">✅ Free COD on orders ≥ ₹599</div>`}
    <div style="display:flex;gap:10px;margin-top:8px">
      <button onclick="document.getElementById('codOverlay').remove()" style="flex:1;padding:13px;background:#f0f0f0;color:#555;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:.88rem">Cancel</button>
      <button onclick="confirmCODOrder('${orderId}',${codTotal},${codCharge})" style="flex:2;padding:13px;background:linear-gradient(135deg,#f39c12,#e67e22);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:.88rem">✅ Confirm COD Order</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

async function confirmCODOrder(orderId, codTotal, codCharge) {
  const overlay = document.getElementById('codOverlay');
  if (overlay) overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:340px;width:90%">
    <div style="font-size:2.5rem;margin-bottom:12px">⏳</div>
    <div style="font-weight:700;color:#2D5016">Placing your order...</div>
  </div>`;

  const pd = window._pendingPayment;
  if (!pd) { if(overlay) overlay.remove(); showToast('Session expired', 'error'); return; }

  try {
    await finalizeOrder(orderId, pd.formData, codTotal, 'cod', codCharge);
    if (overlay) overlay.remove();
    // finalizeOrder calls showPage('thankyou')
  } catch(err) {
    if (overlay) overlay.remove();
    showPaymentError('COD order failed: ' + err.message, orderId, pd.formData, codTotal, 'cod');
  }
}

// ══════════════════════════════════════════════
// COD PAYMENT FLOW (from modal — kept for compatibility)
// ══════════════════════════════════════════════
async function startCOD() {
  const pd = window._pendingPayment;
  if (!pd) { showToast('Session expired. Please try again.', 'error'); closePaymentModal(); return; }

  const { orderId, sub, disc, formData } = pd;

  // COD charge: free if order >= 599, else ₹60
  const netSub = sub - disc;
  const codCharge = netSub >= 599 ? 0 : 60;
  const codTotal = netSub + codCharge;

  closePaymentModal();

  // Show brief confirmation overlay (not "Processing Payment" which implies card)
  const overlay = document.createElement('div');
  overlay.id = 'codOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:#fff;border-radius:20px;padding:32px 28px;text-align:center;max-width:320px;width:90%">
    <div style="font-size:3rem;margin-bottom:12px">💵</div>
    <div style="font-weight:800;font-size:1.1rem;color:#2D5016;margin-bottom:6px">Confirming COD Order...</div>
    <div style="font-size:.85rem;color:#666">Order: ${orderId}</div>
    <div style="font-size:.82rem;color:#555;margin-top:8px">Total: ₹${codTotal}${codCharge > 0 ? ' (incl. ₹' + codCharge + ' COD charge)' : ' (Free COD)'}</div>
    <div style="margin-top:16px;height:4px;background:#eee;border-radius:4px;overflow:hidden">
      <div style="height:100%;background:#2D5016;border-radius:4px;animation:codprog 1.5s ease forwards" id="codProgressBar"></div>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  // Animate progress bar
  const styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes codprog{from{width:0}to{width:100%}}';
  document.head.appendChild(styleTag);

  try {
    await finalizeOrder(orderId, formData, codTotal, 'cod', codCharge);
    overlay.remove();
    // finalizeOrder calls showPage('thankyou') — done!
  } catch(err) {
    overlay.remove();
    showPaymentError('COD order failed: ' + err.message, orderId, formData, codTotal, 'cod');
  }
}


// Helper to update the processing screen status bar
function updateProcessingStatus(pct, msg) {
  const bar = document.getElementById('cfPBar');
  const status = document.getElementById('cfPStatus');
  if (bar) bar.style.width = pct + '%';
  if (status) status.textContent = msg;
}

// ── PROCESSING OVERLAY ──
function showProcessingScreen(orderId, total, method) {
  document.getElementById('cfProcessing')?.remove();
  const methodIcons = { upi:'📱', card:'💳', netbanking:'🏦', emi:'📊' };
  const methodNames = { upi:'UPI', card:'Card', netbanking:'Net Banking', emi:'EMI' };

  const el = document.createElement('div');
  el.id = 'cfProcessing';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,10,0.92);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui;text-align:center;padding:32px';
  el.innerHTML = `
    <div style="font-size:3.5rem;margin-bottom:20px;animation:cfSpin 1.2s linear infinite">${methodIcons[method] || '💳'}</div>
    <div style="font-size:1.3rem;font-weight:800;margin-bottom:8px">Processing Payment</div>
    <div style="font-size:.85rem;opacity:.7;margin-bottom:4px">₹${total.toLocaleString('en-IN')} via ${methodNames[method] || method}</div>
    <div style="font-size:.72rem;opacity:.5;margin-bottom:28px">Order: ${orderId}</div>
    <div style="width:240px;height:5px;background:rgba(255,255,255,.15);border-radius:100px;overflow:hidden">
      <div id="cfPBar" style="height:100%;width:0%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:100px;transition:width .4s ease"></div>
    </div>
    <div id="cfPStatus" style="font-size:.72rem;opacity:.5;margin-top:12px">Connecting to payment gateway...</div>
    <div style="font-size:.65rem;opacity:.35;margin-top:24px">🔒 256-bit SSL · Cashfree Secured · PCI DSS</div>
    <style>@keyframes cfSpin{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}</style>
  `;
  document.body.appendChild(el);
}

async function animateProcessing() {
  const steps = [
    [15, 'Connecting to Cashfree...'],
    [35, 'Authenticating...'],
    [55, 'Verifying order details...'],
    [75, 'Processing payment...'],
    [90, 'Confirming transaction...'],
    [100, '✅ Payment successful!'],
  ];
  for (const [pct, msg] of steps) {
    await new Promise(r => setTimeout(r, 480));
    const bar = document.getElementById('cfPBar');
    const status = document.getElementById('cfPStatus');
    if (bar) bar.style.width = pct + '%';
    if (status) status.textContent = msg;
  }
  await new Promise(r => setTimeout(r, 500));
}

function hideProcessingScreen() {
  document.getElementById('cfProcessing')?.remove();
}

// ── PAYMENT ERROR — with Retry, Back to Cart, Contact buttons ──
function showPaymentError(msg, orderId, formData, total, method) {
  hideProcessingScreen();
  closePaymentModal();
  document.getElementById('payErrorOverlay')?.remove();

  const el = document.createElement('div');
  el.className = 'pay-error-overlay';
  el.id = 'payErrorOverlay';
  const orderRef = orderId ? `<div style="font-size:.72rem;color:#999;margin-bottom:16px;background:#f5f5f5;padding:8px 14px;border-radius:8px">Order Ref: <strong>${orderId}</strong></div>` : '';
  el.innerHTML = `
    <div class="pay-error-box">
      <div class="pay-error-icon">❌</div>
      <div class="pay-error-title">Payment Failed</div>
      ${orderRef}
      <p class="pay-error-msg">${msg}</p>
      <div class="pay-error-actions">
        <button class="pay-error-try" onclick="document.getElementById('payErrorOverlay')?.remove(); initiatePayment();">
          🔄 Retry Payment
        </button>
        <button class="pay-error-back" onclick="document.getElementById('payErrorOverlay')?.remove(); showPage('cart');">
          ← Back to Cart
        </button>
        <button class="pay-error-back" style="background:#fff3cd;border-color:#ffc107;color:#856404" onclick="document.getElementById('payErrorOverlay')?.remove(); window.open('https://wa.me/919898582650?text=Payment+failed+for+order+${orderId || ''}+amount+₹${total || ''}+please+help','_blank')">
           WhatsApp Support
        </button>
        <button class="pay-error-cancel" onclick="document.getElementById('payErrorOverlay')?.remove(); showPage('home');">
          Cancel & Continue Shopping
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
}

// ── FINALIZE ORDER AFTER SUCCESSFUL PAYMENT ──
async function finalizeOrder(orderId, formData, total, method, codCharge) {
  const orderNumEl = document.getElementById('orderNum');
  if (orderNumEl) orderNumEl.textContent = orderId;

  // Build order items
  const cartSnapshot = [...STORE.cart];
  const srItems = cartSnapshot.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return null;
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    const mrp   = item.tierMrp  !== undefined ? item.tierMrp  : p.price;
    return {
      name: p.name + (item.tierTabs ? ` (${item.tierTabs} tabs)` : ''),
      sku:  'ASC-' + p.id + (item.tierTabs ? '-' + item.tierTabs : ''),
      units: item.qty,
      selling_price: price,
      mrp: mrp,
      discount: Math.max(0, mrp - price),
      tax: '',
      hsn: '30049099',
    };
  }).filter(Boolean);

  const sub  = srItems.reduce((s, i) => s + i.selling_price * i.units, 0);
  const disc = srItems.reduce((s, i) => s + i.discount * i.units, 0);
  // Also add promo discount (on top of product tier discounts)
  let promoDisc = 0;
  if (typeof activePromoCode !== 'undefined' && activePromoCode) {
    promoDisc = activePromoCode.type === 'pct' ? Math.round(sub * activePromoCode.value / 100) : Math.min(activePromoCode.value, sub);
  } else if (appliedDiscount) {
    promoDisc = appliedDiscount.type === 'percent' ? Math.round(sub * appliedDiscount.value / 100) : appliedDiscount.value;
  }
  const totalDisc = disc + promoDisc;
  const ship = total - (sub - promoDisc);

  const nameParts = (formData.firstName + ' ' + formData.lastName).trim().split(' ');
  const firstName = nameParts[0] || formData.firstName;
  const lastName  = nameParts.slice(1).join(' ') || '.';

  // ── 1. Push to Shiprocket ──────────────────────────────────
  let srOrderId = null, srShipmentId = null, srAwb = null;
  let srStatus = 'Confirmed — Awaiting Dispatch';
  if (method !== 'demo') {
    try {
      const srResp = await fetch(SHIPROCKET_CONFIG.apiBase + '/api/create-shiprocket-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          order_date: new Date().toISOString().slice(0,19).replace('T',' '),
          pickup_location: SHIPROCKET_CONFIG.pickup_location,
          billing_customer_name: firstName, billing_last_name: lastName,
          billing_address: formData.addr1, billing_address_2: formData.addr2 || '',
          billing_city: formData.city, billing_pincode: formData.pin,
          billing_state: formData.state, billing_country: 'India',
          billing_email: formData.email, billing_phone: formData.phone,
          shipping_is_billing: true, order_items: srItems,
          payment_method: method === 'cod' ? 'COD' : 'Prepaid', sub_total: total,
          length: 15, breadth: 10, height: 10,
          weight: Math.max(0.2, srItems.reduce((s,i)=>s+i.units*0.1,0)),
        }),
      });
      const srData = await srResp.json();
      if (srResp.ok && srData.order_id) {
        srOrderId = srData.order_id; srShipmentId = srData.shipment_id; srAwb = srData.awb_code || null;
        srStatus = 'Pushed to Shiprocket — Ready to Ship 🚚';
        const trackBtn = document.getElementById('trackOrderBtn');
        if (trackBtn) { trackBtn.href = srAwb ? 'https://shiprocket.co/tracking/'+srAwb : 'https://shiprocket.in/shipment-tracking/'; trackBtn.style.display='inline-flex'; }
        const srIdEl = document.getElementById('srOrderId');
        if (srIdEl) { srIdEl.textContent = srOrderId; const row=document.getElementById('srOrderRow'); if(row) row.style.display='flex'; }
      } else {
        // Log the actual error from Shiprocket so we can debug
        console.error('❌ Shiprocket error:', JSON.stringify(srData));
        srStatus = 'Order Confirmed — Dispatch Pending (SR: ' + (srData.error || srData.message || 'error') + ')';
      }
    } catch(e) { console.error('❌ Shiprocket fetch failed:', e.message); }
  } else {
    srStatus = '';
  }

  // ── 2. Save order locally ──────────────────────────────────
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    orders.push({
      orderId, srOrderId, srShipmentId, srAwb,
      date: new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}),
      customer: `${formData.firstName} ${formData.lastName}`,
      email: formData.email, phone: formData.phone,
      address: `${formData.addr1}, ${formData.city}, ${formData.state} - ${formData.pin}`,
      total, method, items: srItems.map(i=>({name:i.name,qty:i.units,price:i.selling_price})),
      status: srStatus,
    });
    localStorage.setItem('asc_orders', JSON.stringify(orders));
  } catch(e) {}

  // ── 2b. Save order to Supabase via backend (shows in Admin) ────
  try {
      const _jwt = localStorage.getItem('asc_jwt') || '';
      const isOnlinePayment = (method !== 'cod');
      const orderPayload = {
        id: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address_line1: formData.addr1,
        address_line2: formData.addr2 || '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pin,
        total: total,
        payment_status: method === 'cod' ? 'COD - Pending' : 'Paid',
        fulfillment: 'Pending',
        payment_method: method,
        cf_order_id: orderId,
        shiprocket_id: srOrderId || null,
        items: JSON.stringify(srItems.map(i=>({name:i.name,qty:i.units,price:i.selling_price,id:cartSnapshot.find(c=>PRODUCTS.find(p=>p.id===c.id)?.name===i.name.split(' (')[0])?.id}))),
      };

      if (isOnlinePayment) {
        // ── ONLINE PAYMENT: use /api/confirm-order which re-verifies with Cashfree first ──
        // This prevents any order being saved as Paid without confirmed payment
        const confirmResp = await fetch(API_BASE + '/api/confirm-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ..._jwt ? { 'Authorization': 'Bearer ' + _jwt } : {},
          },
          body: JSON.stringify({ cf_order_id: orderId, order_data: orderPayload }),
        });
        const confirmResult = await confirmResp.json();
        if (!confirmResp.ok) {
          // Payment not actually confirmed — this should NOT happen if frontend verify worked
          // But if it does, log it loudly and do NOT show thank you page
          console.error('🚨 confirm-order REJECTED payment:', confirmResult);
          showPaymentError(
            confirmResult.message || 'Payment could not be confirmed by our server. If money was deducted, contact +91 98985 82650 with Order ID: ' + orderId,
            orderId, formData, total, method
          );
          return; // Stop — do not show thank you
        }
      } else {
        // COD: save directly, no payment verification needed
        await fetch(API_BASE + '/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ..._jwt ? { 'Authorization': 'Bearer ' + _jwt } : {},
          },
          body: JSON.stringify(orderPayload),
        });
      }
  } catch(e) { console.error('Order save to backend failed:', e.message); }

  // ── 3. Generate invoice ────────────────────────────────────
  let invoiceHtml = null;
  try {
    invoiceHtml = generateInvoice({ orderId, formData, srItems, sub, disc: totalDisc, promoDisc, ship, total, method, srOrderId });
  } catch(e) { console.warn('Invoice:', e); }

  // ── 4. Send confirmation email ─────────────────────────────
  try {
    await sendOrderEmail({ orderId, formData, srItems, sub, totalDisc, promoDisc, ship, total, method, srAwb, invoiceHtml });
  } catch(e) { console.warn('Email:', e.message); }

  // ── 5. Clear cart + show thank-you ────────────────────────
  STORE.cart = []; STORE.save();
  activePromoCode = null; appliedDiscount = null; window._pendingPayment = null;
  // Track purchase in Google Analytics
  try {
    window._trackPurchase && window._trackPurchase(orderId, total,
      srItems.map(i => ({ item_name: i.name, price: i.selling_price, quantity: i.units }))
    );
  } catch(e) {}
  showPage('thankyou');
  showToast(`✅ Order confirmed! Invoice opened & email sent 🧾`);
}

// ══════════════════════════════════════════════════════════════
// AUTO EMAIL — Sends order confirmation via EmailJS
// Setup: https://www.emailjs.com (free — 200 emails/month)
// 1. Create account → Email Services → connect Gmail
// 2. Email Templates → create template with variables below
// 3. Replace EMAILJS_SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY
// ══════════════════════════════════════════════════════════════
async function sendOrderEmail({ orderId, formData, srItems, sub, totalDisc, promoDisc, ship, total, method, srAwb, invoiceHtml }) {
  // ── CONFIG — replace these 3 values with yours from emailjs.com ──
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz456'
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'user_AbCdEfGhIj'

  // Build items table for email
  const itemsText = srItems.map(i => `${i.name} × ${i.units} = ₹${(i.selling_price * i.units).toLocaleString('en-IN')}`).join('\n');
  const itemsHtml = srItems.map(i =>
    `<tr style="border-bottom:1px solid #eee">
       <td style="padding:8px 12px">${i.name}</td>
       <td style="padding:8px 12px;text-align:center">${i.units}</td>
       <td style="padding:8px 12px;text-align:right">₹${i.selling_price.toLocaleString('en-IN')}</td>
       <td style="padding:8px 12px;text-align:right;font-weight:700">₹${(i.selling_price * i.units).toLocaleString('en-IN')}</td>
     </tr>`
  ).join('');

  const trackUrl = srAwb ? `https://shiprocket.co/tracking/${srAwb}` : 'https://shiprocket.in/shipment-tracking/';
  const methodName = method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'netbanking' ? 'Net Banking' : method === 'emi' ? 'EMI' : method === 'demo' ? 'Demo (Test)' : method;

  // Full HTML email body
  const emailHtml = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2D5016,#4a7c28);padding:28px 32px;color:white;text-align:center">
      <div style="font-size:24px;font-weight:900;margin-bottom:4px">🌿 Ascovita Healthcare</div>
      <div style="font-size:13px;opacity:.8">Order Confirmation</div>
    </div>
    <div style="padding:28px 32px">
      <h2 style="font-size:18px;color:#2D5016;margin-bottom:4px">Hi ${formData.firstName}! Your order is confirmed 🎉</h2>
      <p style="color:#666;font-size:14px;margin-bottom:20px">Thank you for shopping with Ascovita. Here's your order summary.</p>

      <div style="background:#f8fdf4;border:1px solid #c8e6a8;border-radius:8px;padding:14px 18px;margin-bottom:20px;font-size:13px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>Order ID:</strong><span style="color:#2D5016;font-weight:700">${orderId}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>Date:</strong><span>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</span></div>
        <div style="display:flex;justify-content:space-between"><strong>Payment:</strong><span>${methodName} ✅ PAID</span></div>
      </div>

      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:10px">Order Items</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
        <thead><tr style="background:#2D5016;color:white">
          <th style="padding:8px 12px;text-align:left">Product</th>
          <th style="padding:8px 12px;text-align:center">Qty</th>
          <th style="padding:8px 12px;text-align:right">Price</th>
          <th style="padding:8px 12px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #2D5016;padding-top:12px;font-size:13px">
        <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
        ${totalDisc > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#16a34a;font-weight:700"><span>🏷️ Discount Saved</span><span>-₹${totalDisc.toLocaleString('en-IN')}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555"><span>Shipping</span><span>${ship === 0 ? '<span style="color:#16a34a">FREE</span>' : '₹' + ship}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-size:16px;font-weight:900;color:#2D5016;border-top:1px solid #e5e7eb;margin-top:6px"><span>Grand Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      </div>

      <div style="margin:20px 0;background:#f9f9f9;border-radius:8px;padding:14px 18px;font-size:13px;line-height:1.8">
        <strong style="display:block;margin-bottom:6px">📍 Delivery Address</strong>
        ${formData.firstName} ${formData.lastName}<br>
        ${formData.addr1}${formData.addr2 ? ', ' + formData.addr2 : ''}<br>
        ${formData.city}, ${formData.state} – ${formData.pin}, India<br>
        📞 ${formData.phone}
      </div>

      ${method !== 'demo' ? `<a href="${trackUrl}" style="display:block;background:#2D5016;color:white;text-align:center;padding:13px;border-radius:100px;font-weight:700;text-decoration:none;font-size:14px;margin:16px 0">📦 Track Your Order on Shiprocket</a>` : ''}

      <p style="font-size:12px;color:#999;text-align:center;margin-top:20px">
        For queries: <a href="mailto:Ascovitahealthcare@gmail.com" style="color:#2D5016">Ascovitahealthcare@gmail.com</a> | +91 98985 82650<br>
        Ascovita Healthcare · Near Rajshivalay Cinema, Anand – 388001, Gujarat
      </p>
    </div>
  </div>`;

  // Send via EmailJS
  if (typeof emailjs === 'undefined') {
    return;
  }
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    console.info('📧 Demo email (EmailJS not configured yet). Email HTML ready:\n', emailHtml.substring(0, 200) + '...');
    return;
  }

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email:      formData.email,
    to_name:       formData.firstName + ' ' + formData.lastName,
    order_id:      orderId,
    order_total:   '₹' + total.toLocaleString('en-IN'),
    order_date:    new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'}),
    items_text:    itemsText,
    email_body:    emailHtml,
    company_email: 'Ascovitahealthcare@gmail.com',
    phone:         formData.phone,
    address:       `${formData.addr1}, ${formData.city}, ${formData.state} - ${formData.pin}`,
    tracking_url:  trackUrl,
  }, { publicKey: EMAILJS_PUBLIC_KEY });

}


// ══════════════════════════════════════════════════════════════
// INVOICE GENERATOR — Full GST Tax Invoice
// ══════════════════════════════════════════════════════════════
function generateInvoice({ orderId, formData, srItems, sub, disc, promoDisc, ship, total, method, srOrderId }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const invNo = 'INV-' + orderId.replace('AVC-','').replace('DEMO-','D');

  // GST calculation: 18% GST (CGST 9% + SGST 9% for Gujarat, IGST 18% for other states)
  const isGujarat = (formData.state || '').toLowerCase().includes('gujarat');
  const taxableBase = Math.round(sub / 1.18); // reverse-calculate base from inclusive price
  const gstTotal = sub - taxableBase;
  const cgst = isGujarat ? Math.round(gstTotal / 2) : 0;
  const sgst = isGujarat ? Math.round(gstTotal / 2) : 0;
  const igst = !isGujarat ? gstTotal : 0;

  const itemRows = srItems.map(item => {
    const base = Math.round((item.selling_price * item.units) / 1.18);
    const gst  = (item.selling_price * item.units) - base;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.sku}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.units}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.mrp}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.selling_price}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.discount > 0 ? item.discount * item.units : '-'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">18%</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">₹${gst.toLocaleString('en-IN')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700">₹${(item.selling_price * item.units).toLocaleString('en-IN')}</td>
      </tr>`;
  }).join('');

  const gstRows = isGujarat ? `
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">CGST (9%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${cgst.toLocaleString('en-IN')}</td></tr>
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">SGST (9%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${sgst.toLocaleString('en-IN')}</td></tr>
  ` : `
    <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">IGST (18%)</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${igst.toLocaleString('en-IN')}</td></tr>
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${invNo} — Ascovita Healthcare</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #222; background:#fff; padding:30px; }
  .inv-wrap { max-width:900px; margin:0 auto; border:1px solid #ddd; border-radius:8px; overflow:hidden; }
  .inv-header { background:linear-gradient(135deg,#2D5016,#4a7c28); color:#fff; padding:28px 32px; display:flex; justify-content:space-between; align-items:flex-start; }
  .inv-logo-name { font-size:22px; font-weight:900; letter-spacing:.5px; }
  .inv-logo-sub { font-size:11px; opacity:.8; margin-top:3px; }
  .inv-company-addr { font-size:11px; opacity:.85; line-height:1.7; text-align:right; }
  .inv-meta { background:#f8fdf4; padding:20px 32px; display:flex; justify-content:space-between; border-bottom:2px solid #2D5016; }
  .inv-meta-block { line-height:1.8; }
  .inv-meta-block strong { font-size:11px; text-transform:uppercase; color:#666; letter-spacing:.5px; display:block; }
  .inv-meta-block span { font-size:14px; font-weight:700; color:#2D5016; }
  .inv-section { padding:20px 32px; }
  .inv-section h3 { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#666; margin-bottom:12px; }
  .inv-cust-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .inv-cust-box { background:#f9f9f9; border:1px solid #eee; border-radius:6px; padding:14px; line-height:1.8; }
  .inv-cust-box strong { font-size:11px; text-transform:uppercase; color:#999; display:block; margin-bottom:4px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#2D5016; color:#fff; }
  thead th { padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.3px; }
  thead th:not(:first-child) { text-align:right; }
  thead th:nth-child(3),thead th:nth-child(7) { text-align:center; }
  tbody tr:hover { background:#f8fdf4; }
  .inv-totals { background:#f8fdf4; border-top:2px solid #2D5016; }
  .inv-totals td { padding:7px 12px; }
  .inv-grand { background:#2D5016 !important; color:#fff; }
  .inv-grand td { padding:12px; font-size:15px; font-weight:900; }
  .inv-footer { background:#2D5016; color:white; padding:16px 32px; text-align:center; font-size:11px; opacity:.9; line-height:2; }
  .inv-status { display:inline-block; background:#22c55e; color:white; border-radius:100px; padding:3px 14px; font-size:11px; font-weight:700; margin-left:8px; }
  @media print { body{padding:0;} .no-print{display:none!important;} }
</style>
</head>
<body>
<div class="inv-wrap">
  <!-- HEADER -->
  <div class="inv-header">
    <div>
      <div class="inv-logo-name">🌿 ASCOVITA HEALTHCARE</div>
      <div class="inv-logo-sub">Organic Vitamins & Nutraceuticals</div>
      <div style="font-size:10px;opacity:.7;margin-top:6px">FSSAI Lic. No: 10024022001967 &nbsp;|&nbsp; GSTIN: 24XXXXX (update)</div>
    </div>
    <div class="inv-company-addr">
      <strong style="font-size:13px;display:block;margin-bottom:4px">TAX INVOICE</strong>
      Amin Auto Road, Near Rajshivalay Cinema<br>
      Anand – 388001, Gujarat, India<br>
      📞 +91 98985 82650<br>
      ✉ Ascovitahealthcare@gmail.com<br>
      🌐 ascovita.in
    </div>
  </div>

  <!-- META ROW -->
  <div class="inv-meta">
    <div class="inv-meta-block">
      <strong>Invoice Number</strong>
      <span>${invNo}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Invoice Date</strong>
      <span>${dateStr}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Order ID</strong>
      <span>${orderId}</span>
    </div>
    <div class="inv-meta-block">
      <strong>Payment</strong>
      <span>${method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'netbanking' ? 'Net Banking' : method === 'emi' ? 'EMI' : method === 'demo' ? '🧪 Demo' : method} <span class="inv-status" style="${method === 'demo' ? 'background:#f59e0b' : ''}">${method === 'demo' ? 'TEST MODE' : 'PAID'}</span></span>
    </div>
    ${srOrderId ? `<div class="inv-meta-block"><strong>Shiprocket ID</strong><span>${srOrderId}</span></div>` : ''}
  </div>

  <!-- CUSTOMER & SHIPPING -->
  <div class="inv-section">
    <h3>Bill To / Ship To</h3>
    <div class="inv-cust-grid">
      <div class="inv-cust-box">
        <strong>Customer Details</strong>
        <b>${formData.firstName} ${formData.lastName}</b><br>
        📞 ${formData.phone}<br>
        ✉ ${formData.email}
      </div>
      <div class="inv-cust-box">
        <strong>Delivery Address</strong>
        ${formData.addr1}${formData.addr2 ? ', ' + formData.addr2 : ''}<br>
        ${formData.city}, ${formData.state} – ${formData.pin}<br>
        India
      </div>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <div class="inv-section" style="padding-top:0">
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th><th>SKU</th><th style="text-align:center">Qty</th>
          <th>MRP</th><th>Unit Price</th><th>Discount</th>
          <th style="text-align:center">GST</th><th>Tax Amt</th><th>Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tbody class="inv-totals">
        <tr><td colspan="7" style="padding:8px 12px;text-align:right;color:#555">Subtotal (incl. GST)</td><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:700">₹${sub.toLocaleString('en-IN')}</td></tr>
        <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">Taxable Amount</td><td colspan="2" style="padding:6px 12px;text-align:right">₹${taxableBase.toLocaleString('en-IN')}</td></tr>
        ${gstRows}
        ${disc > 0 ? `<tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#27ae60">Product Discount</td><td colspan="2" style="padding:6px 12px;text-align:right;color:#27ae60">-₹${disc.toLocaleString('en-IN')}</td></tr>` : ''}
        ${promoDisc > 0 ? `<tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#27ae60">🏷️ Promo Discount</td><td colspan="2" style="padding:6px 12px;text-align:right;color:#27ae60;font-weight:700">-₹${promoDisc.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td colspan="7" style="padding:6px 12px;text-align:right;color:#555">Shipping</td><td colspan="2" style="padding:6px 12px;text-align:right">${ship <= 0 ? '<span style="color:#27ae60">FREE</span>' : '₹' + ship}</td></tr>
        <tr class="inv-grand"><td colspan="7" style="text-align:right">GRAND TOTAL</td><td colspan="2" style="text-align:right">₹${total.toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- NOTES -->
  <div class="inv-section" style="border-top:1px solid #eee;font-size:11px;color:#666;line-height:1.9">
    <strong style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">Terms & Notes</strong><br>
    • All prices are inclusive of 18% GST &nbsp;|&nbsp; HSN Code: 30049099 (Nutraceuticals)<br>
    • Returns accepted within 7 days for sealed/unused products<br>
    • This is a computer-generated invoice and does not require a physical signature<br>
    • For queries: Ascovitahealthcare@gmail.com &nbsp;|&nbsp; +91 98985 82650
  </div>

  <!-- FOOTER -->
  <div class="inv-footer">
    Thank you for shopping with Ascovita Healthcare 🌿 &nbsp;|&nbsp; Made in India, Anand Gujarat &nbsp;|&nbsp; FSSAI Approved · GMP Certified · Lab Tested
  </div>
</div>

<div class="no-print" style="text-align:center;margin-top:24px;padding-bottom:30px">
  <button onclick="window.print()" style="background:#2D5016;color:white;border:none;padding:13px 32px;border-radius:100px;font-size:15px;font-weight:700;cursor:pointer;margin-right:12px">🖨️ Print Invoice</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:none;padding:13px 32px;border-radius:100px;font-size:15px;font-weight:700;cursor:pointer">✕ Close</button>
</div>

<!-- ── Media Lightbox ── -->
<div class="gallery-lightbox" id="galleryLightbox">
  <span class="lb-close" onclick="closeLightbox()">&#x2715;</span>
  <button class="lb-nav prev" onclick="lbStep(-1)">&#8249;</button>
  <div id="lbContent"></div>
  <button class="lb-nav next" onclick="lbStep(1)">&#8250;</button>
  <div id="lbCounter" style="color:#fff;font-size:0.85rem;margin-top:10px;opacity:0.7"></div>
</div>
</body></html>`;

  // Show invoice in new window + add download button on thank-you page
  const invWin = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
  if (invWin) { invWin.document.write(html); invWin.document.close(); }

  // Also put a "View Invoice" button on the thank-you page
  const tyPage = document.getElementById('page-thankyou');
  if (tyPage) {
    const existing = document.getElementById('invoiceBtn');
    if (existing) existing.remove();
    const invBtn = document.createElement('a');
    invBtn.id = 'invoiceBtn';
    invBtn.textContent = '🧾 Download / Print Invoice';
    invBtn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:#2D5016;color:white;border-radius:100px;padding:11px 26px;font-weight:700;font-size:.84rem;text-decoration:none;margin:8px 4px;cursor:pointer';
    invBtn.onclick = function() {
      const w = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
      if (w) { w.document.write(html); w.document.close(); }
    };
    const orderNumEl = document.getElementById('orderNum');
    if (orderNumEl && orderNumEl.parentNode) {
      orderNumEl.parentNode.insertAdjacentElement('afterend', invBtn);
    }
  }
}


// ── ORDER TRACKING ──
function trackOrder() {
  const input = document.getElementById('trackOrderInput');
  const orderId = input?.value?.trim();
  if (!orderId) { showToast('Please enter your Order ID', 'error'); return; }

  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId || o.orderId.includes(orderId));
    if (order) showToast(`📦 Order ${orderId}: ${order.status}`);
  } catch(e) {}
  window.open(SHIPROCKET_CONFIG.trackingUrl + orderId, '_blank');
}

// placeOrder() routes to initiatePayment() — defined above

// initCashfree() is called from the main DOMContentLoaded handler above

// ═══════════════════════════════════════════════════════
// AUTH SYSTEM
// ═══════════════════════════════════════════════════════

function openAuth(tab = 'login') {
  switchAuthTab(tab);
  document.getElementById('authOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuth() {
  document.getElementById('authOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  clearAuthMessages();
}

function clearAuthMessages() {
  const err = document.getElementById('authError');
  const suc = document.getElementById('authSuccess');
  if (err) { err.style.display = 'none'; err.textContent = ''; }
  if (suc) { suc.style.display = 'none'; suc.textContent = ''; }
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccess');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function switchAuthTab(tab) {
  clearAuthMessages();
  document.getElementById('loginTab')?.classList.toggle('active', tab === 'login');
  document.getElementById('registerTab')?.classList.toggle('active', tab === 'register');
  const lf=document.getElementById('loginForm'); if(lf) lf.style.display = tab === 'login' ? 'block' : 'none';
  const rf=document.getElementById('registerForm'); if(rf) rf.style.display = tab === 'register' ? 'block' : 'none';
}

function handleAccountNavClick() {
  const user = getCurrentUser();
  if (user) {
    showPage('account');
    loadAccountPage();
  } else {
    openAuth('login');
  }
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('asc_user') || 'null'); } catch(e) { return null; }
}

async function doLogin() {
  clearAuthMessages();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) { showAuthError('Please enter your email and password.'); return; }
  try {
    const res = await fetch(API_BASE + '/api/auth/email-login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
      signal: makeSignal(8000),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error || 'Invalid email or password.'); return; }
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));
    closeAuth(); updateAccountNavBtn();
    showPage('account'); loadAccountPage();
    showToast('🌿 Welcome back, ' + data.user.name.split(' ')[0] + '!');
  } catch(e) {
    // Fallback to localStorage if backend offline
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    const user  = users.find(u => u.email === email && u.password === btoa(pass));
    if (!user) { showAuthError('Invalid email or password. Please try again.'); return; }
    localStorage.setItem('asc_user', JSON.stringify(user));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Welcome back, ' + user.name.split(' ')[0] + '!');
  }
}

async function doRegister() {
  clearAuthMessages();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass  = document.getElementById('regPassword').value;
  if (!name || !email || !pass) { showAuthError('Please fill in all required fields.'); return; }
  if (pass.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
  try {
    const res = await fetch(API_BASE + '/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password: pass }),
      signal: makeSignal(8000),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error || 'Registration failed.'); return; }
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Account created! Welcome to Ascovita, ' + name.split(' ')[0] + '!');
  } catch(e) {
    // Fallback to localStorage if backend offline
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    if (users.find(u => u.email === email)) { showAuthError('An account with this email already exists.'); return; }
    const newUser = { name, email, phone, password: btoa(pass), createdAt: new Date().toISOString(), address: {} };
    users.push(newUser);
    localStorage.setItem('asc_users', JSON.stringify(users));
    localStorage.setItem('asc_user', JSON.stringify(newUser));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Account created! Welcome to Ascovita, ' + name.split(' ')[0] + '!');
  }
}

// ══════════════════════════════════════════════════════════
// GOOGLE SIGN-IN — Real Google Identity Services (GIS)
// Client ID: 6793142938-b9sl3d3lh2svjkmcnina8fsh31nut0bu.apps.googleusercontent.com
// ══════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID = '6793142938-b9sl3d3lh2svjkmcnina8fsh31nut0bu.apps.googleusercontent.com';

// ── Parse JWT from Google's credential response ──
function parseGoogleJWT(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(base64));
  } catch(e) { return null; }
}

// ── Called by Google after user picks account ──
async function handleGoogleCredential(response) {
  try {
    showToast('⏳ Signing in with Google...');

    // Send Google credential to our backend for verification + Supabase upsert
    const res = await fetch(API_BASE + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
      signal: makeSignal(10000),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Auth failed');

    // Store JWT + user in localStorage
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));

    closeAuth();
    updateAccountNavBtn();
    autofillCheckoutFromGoogle(data.user);

    const firstName = (data.user.name || 'there').split(' ')[0];
    showToast('🌿 Welcome, ' + firstName + '! Signed in with Google.');

    const onCheckout = document.getElementById('page-checkout')?.classList.contains('active');
    if (!onCheckout) { showPage('account'); loadAccountPage(); }

  } catch(err) {
    // Fallback: parse JWT locally and work offline if backend is sleeping
    const payload = parseGoogleJWT(response.credential);
    if (payload) {
      const user = { name: payload.name || 'Google User', email: payload.email || '', picture: payload.picture || '', social: 'google' };
      localStorage.setItem('asc_user', JSON.stringify(user));
      closeAuth();
      updateAccountNavBtn();
      autofillCheckoutFromGoogle(user);
      showToast('🌿 Signed in with Google! (offline mode)');
    } else {
      showToast('Google sign-in failed. Please try again.', 'error');
    }
  }
}

// ── Auto-fill checkout form with Google profile ──
function autofillCheckoutFromGoogle(user) {
  if (!user) return;
  const nameParts = (user.name || '').split(' ');
  const setField = (sel, val) => {
    const el = document.querySelector('#page-checkout ' + sel);
    if (el && val && !el.value) el.value = val;
  };
  setField('input[placeholder="Enter first name"]', nameParts[0] || '');
  setField('input[placeholder="Enter last name"]',  nameParts.slice(1).join(' ') || '');
  setField('input[type="email"]',                   user.email || '');
  if (user.phone) setField('input[type="tel"]',     user.phone);
}

// ── Trigger Google One Tap or popup ──
function socialLogin(provider) {
  if (provider !== 'google') {
    // Phone OTP — coming soon
    showToast('📱 Phone OTP login coming soon!');
    return;
  }
  // Use Google One Tap / popup
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.prompt(notification => {
      // If One Tap is dismissed or not available, fall back to popup
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        showGooglePopup();
      }
    });
  } else {
    // SDK not loaded yet — wait and retry
    setTimeout(() => socialLogin('google'), 800);
  }
}

function showGooglePopup() {
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('Google sign-in not available. Please try again.', 'error');
    return;
  }
  const client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'profile email',
    callback: (tokenResponse) => {
      if (tokenResponse.error) { showToast('Google sign-in cancelled.', 'error'); return; }
      // Fetch profile with the access token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
      })
      .then(r => r.json())
      .then(profile => {
        handleGoogleCredential({ credential: btoa(JSON.stringify({ alg:'none' })) + '.' + btoa(JSON.stringify({
          name: profile.name, email: profile.email,
          picture: profile.picture, sub: profile.sub,
          given_name: profile.given_name
        })) + '.sig' });
      })
      .catch(() => showToast('Google sign-in failed.', 'error'));
    }
  });
  client.requestAccessToken();
}

// ── Init Google One Tap on page load ──
function initGoogleOneTap() {
  if (typeof google === 'undefined' || !google.accounts) return;
  const currentUser = getCurrentUser();
  if (currentUser) return; // already logged in

  google.accounts.id.initialize({
    client_id:  GOOGLE_CLIENT_ID,
    callback:   handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
  });

  // Show One Tap only after 3 seconds, non-intrusively
  setTimeout(() => {
    if (!getCurrentUser()) {
      google.accounts.id.prompt();
    }
  }, 3000);
}

// ── Sign out from Google too ──
const _origDoLogout = typeof doLogout !== 'undefined' ? doLogout : null;
function doLogout() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
  localStorage.removeItem('asc_user');
  updateAccountNavBtn();
  showPage('home');
  showToast('You have been signed out.');
}

// ── Update nav avatar with Google photo ──
const _origUpdateAccountNavBtn = typeof updateAccountNavBtn !== 'undefined' ? updateAccountNavBtn : null;
function updateAccountNavBtn() {
  const user = getCurrentUser();
  const btn = document.getElementById('accountNavBtn');
  if (!btn) return;
  if (user) {
    if (user.picture) {
      btn.innerHTML = '<img src="' + user.picture + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid white" onerror="this.outerHTML=\'' + (user.name||'U')[0].toUpperCase() + '\'">';
      btn.title = user.name;
    } else {
      btn.textContent = (user.name||'U')[0].toUpperCase();
      btn.title = user.name;
    }
    btn.style.cssText = 'background:var(--green);color:white;border-radius:50%;width:36px;height:36px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0';
  } else {
    btn.innerHTML = '<svg width="20" height="20"><use href="#ico-user"/></svg>';
    btn.title = 'Account';
    btn.style.cssText = '';
  }
}

// ── Auto-fill checkout when user is already logged in ──
document.addEventListener('DOMContentLoaded', function() {
  // Init Google One Tap after SDK loads
  const gsiInterval = setInterval(function() {
    if (typeof google !== 'undefined' && google.accounts) {
      clearInterval(gsiInterval);
      initGoogleOneTap();
    }
  }, 300);

  // Show Google sign-in hint on checkout page if not logged in
  const origShowPage2 = window.showPage;
  window._googleShowPageWrapped = true;
  if (origShowPage2 && !window._googleShowPageWrapped2) {
    window._googleShowPageWrapped2 = true;
    const _sp2 = window.showPage;
    window.showPage = function(pg) {
      _sp2(pg);
      if (pg === 'checkout') {
        const user = getCurrentUser();
        if (user) autofillCheckoutFromGoogle(user);
        setTimeout(function() {
          const bar = document.getElementById('savedAddressBar');
          if (user && bar) {
            document.getElementById('savedAddrName').textContent = user.name;
            document.getElementById('savedAddrDetails').textContent = user.email;
            bar.style.display = 'flex';
          }
        }, 100);
      }
    };
  }
});

function showForgotPassword() {
  clearAuthMessages();
  showAuthSuccess('Password reset link would be sent to your email. (Feature coming soon)');
}

// ═══════════════════════════════════════════════════════
// ACCOUNT DASHBOARD
// ═══════════════════════════════════════════════════════

function loadAccountPage() {
  const user = getCurrentUser();
  if (!user) { openAuth('login'); return; }
  document.getElementById('accName')?.textContent != null && (document.getElementById('accName').textContent = user.name);
  document.getElementById('accEmail')?.textContent != null && (document.getElementById('accEmail').textContent = user.email);
  const parts = user.name.split(' ');
  const av=document.getElementById('accAvatar'); if(av) av.textContent = (parts[0][0] + (parts[1]?parts[1][0]:'')).toUpperCase();
  loadOrdersList();
  loadInvoicesList();
  prefillProfile(user);
}

function switchAccountPanel(panel) {
  document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.account-nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('panel-' + panel);
  if (el) el.classList.add('active');
  const navItems = document.querySelectorAll('.account-nav-item');
  const labels = ['orders','tracking','invoices','profile'];
  const idx = labels.indexOf(panel);
  if (idx >= 0 && navItems[idx]) navItems[idx].classList.add('active');
}

function loadOrdersList() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    if (orders.length === 0) {
      container.innerHTML = `<div class="no-orders"><div class="no-orders-ico">📦</div><h3 style="margin-bottom:8px">No orders yet</h3><p style="color:var(--gray);margin-bottom:20px">Your order history will appear here after your first purchase.</p><button class="btn-primary" onclick="showPage('shop')">Start Shopping →</button></div>`;
      return;
    }
    container.innerHTML = orders.slice().reverse().map(o => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">${o.orderId}</div>
            <div class="order-date">${o.date}</div>
          </div>
          <span class="order-status ${o.status?.toLowerCase().includes('dispatch')||o.status?.toLowerCase().includes('confirm') ? 'confirmed' : o.status?.toLowerCase().includes('ship') ? 'shipped' : o.status?.toLowerCase().includes('deliver') ? 'delivered' : 'pending'}">${o.status || 'Processing'}</span>
        </div>
        <div class="order-items">${o.items?.map(i => `${i.name} × ${i.qty}`).join(', ') || 'Items loading...'}</div>
        <div class="order-footer">
          <div class="order-total">₹${(o.total||0).toLocaleString('en-IN')}</div>
          <div style="display:flex;gap:8px">
            <button class="invoice-btn" onclick="downloadInvoice('${o.orderId}')">🧾 Invoice</button>
            <button class="order-track-btn" onclick="openTracking('${o.orderId}')">🚚 Track</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch(e) { container.innerHTML = '<p style="color:var(--gray)">Could not load orders.</p>'; }
}

function loadInvoicesList() {
  const container = document.getElementById('invoicesList');
  if (!container) return;
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--gray)">No invoices yet. They'll appear here after you place an order.</div>`;
      return;
    }
    container.innerHTML = `
      <div style="background:white;border-radius:var(--radius);border:1px solid rgba(0,0,0,0.08);overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:var(--off-white);font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--gray)">
            <th style="padding:12px 18px;text-align:left">Order ID</th>
            <th style="padding:12px 18px;text-align:left">Date</th>
            <th style="padding:12px 18px;text-align:left">Amount</th>
            <th style="padding:12px 18px;text-align:left">Status</th>
            <th style="padding:12px 18px;text-align:left">Invoice</th>
          </tr></thead>
          <tbody>${orders.slice().reverse().map(o => `
            <tr style="border-top:1px solid var(--light-gray);font-size:0.84rem">
              <td style="padding:14px 18px;font-weight:700;color:var(--green)">${o.orderId}</td>
              <td style="padding:14px 18px;color:var(--gray)">${o.date}</td>
              <td style="padding:14px 18px;font-weight:600">₹${(o.total||0).toLocaleString('en-IN')}</td>
              <td style="padding:14px 18px"><span style="background:#f0fdf4;color:#16a34a;padding:3px 10px;border-radius:100px;font-size:0.72rem;font-weight:700">Paid</span></td>
              <td style="padding:14px 18px"><button class="invoice-btn" onclick="downloadInvoice('${o.orderId}')">⬇ Download</button></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  } catch(e) {}
}

function openTracking(orderId) {
  switchAccountPanel('tracking');
  setTimeout(() => {
    const inp = document.getElementById('trackInput');
    if (inp) { inp.value = orderId; doTrackOrder(); }
  }, 100);
}

function doTrackOrder() {
  const inp = document.getElementById('trackInput');
  const res = document.getElementById('trackResult');
  if (!inp || !res) return;
  const orderId = inp.value.trim();
  if (!orderId) { showToast('Please enter an Order ID', 'error'); return; }
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId || orderId.includes(o.orderId.replace('AVC-','')));
    if (order) {
      res.style.display = 'block';
      res.innerHTML = `
        <div style="background:var(--green-wash);border-radius:var(--radius);padding:18px">
          <div style="font-weight:700;margin-bottom:8px;color:var(--green)">📦 Order Found: ${order.orderId}</div>
          <div style="font-size:0.84rem;color:var(--gray);margin-bottom:12px">${order.address}</div>
          <div style="font-size:0.84rem;font-weight:700;color:var(--text)">Status: ${order.status}</div>
          <div style="margin-top:14px">
            <a href="https://www.shiprocket.in/shipment-tracking/" target="_blank" class="btn-primary" style="font-size:0.82rem;padding:10px 20px">Track on Shiprocket ↗</a>
          </div>
        </div>
      `;
    } else {
      res.style.display = 'block';
      res.innerHTML = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius);padding:14px;font-size:0.84rem;color:var(--red)">Order not found locally. <a href="https://www.shiprocket.in/shipment-tracking/" target="_blank" style="color:var(--green);font-weight:700">Try Shiprocket directly ↗</a></div>`;
    }
  } catch(e) {}
}

function downloadInvoice(orderId) {
  try {
    const orders = JSON.parse(localStorage.getItem('asc_orders') || '[]');
    const o = orders.find(ord => ord.orderId === orderId);
    if (!o) { showToast('Invoice not found', 'error'); return; }
    const html = `<!DOCTYPE html><html><head><title>Invoice ${o.orderId}</title>
    <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto}
    .header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #2D5016}
    .brand{font-size:1.4rem;font-weight:700;color:#2D5016}.sub{font-size:.7rem;color:#666;letter-spacing:2px}
    h2{color:#2D5016;margin:20px 0 10px}table{width:100%;border-collapse:collapse}
    th{background:#f0f7e8;padding:10px;text-align:left;font-size:.8rem}
    td{padding:10px;border-bottom:1px solid #eee;font-size:.85rem}
    .total{font-weight:700;font-size:1rem}.footer{margin-top:30px;font-size:.75rem;color:#999;text-align:center}
    

/* ════════════════════════════════════════════════════
   ASCOVITA v10 — 3D MINIMALIST PROFESSIONAL REDESIGN
   No emoji clutter. Depth. Precision. Authority.
════════════════════════════════════════════════════ */

/* === GLOBAL REFINEMENTS === */
body { -webkit-font-smoothing: antialiased; }

/* Override section-title to use Syne for authority */
.section-title {
  font-family: 'Syne', 'Cormorant Garamond', serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
}
.b2b-title {
  font-family: 'Syne', serif !important;
  letter-spacing: -0.025em !important;
  font-weight: 800 !important;
}
.section-label {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.62rem !important;
  letter-spacing: 0.22em !important;
  color: var(--green-light) !important;
  font-weight: 700 !important;
}

/* === FROSTED GLASS NAVBAR === */
.navbar {
  backdrop-filter: blur(20px) saturate(1.6) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.6) !important;
  background: rgba(253,250,244,0.88) !important;
  border-bottom: 1px solid rgba(45,80,22,0.07) !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.9), 0 4px 20px rgba(45,80,22,0.05) !important;
}

/* === 3D CARD SYSTEM === */
.card-3d-lift {
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1),
              box-shadow 0.38s ease;
  will-change: transform;
}
.card-3d-lift:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg);
  box-shadow:
    0 2px 4px rgba(13,31,8,.04),
    0 8px 20px rgba(13,31,8,.08),
    0 28px 56px rgba(13,31,8,.10),
    0 0 0 1px rgba(45,80,22,.06);
}

/* === B2B SERVICE CARDS — 3D Professional === */
.b2b-svc-card {
  background: white !important;
  border: 1px solid #E6EDD8 !important;
  border-radius: 16px !important;
  padding: 32px 28px !important;
  position: relative;
  overflow: hidden;
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease, border-color 0.3s !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
}
.b2b-svc-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--green), var(--green-light));
  opacity: 0;
  transition: opacity 0.3s;
}
.b2b-svc-card:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg) !important;
  box-shadow: 0 4px 12px rgba(13,31,8,.06), 0 20px 48px rgba(13,31,8,.10) !important;
  border-color: #C8D8B0 !important;
}
.b2b-svc-card:hover::before { opacity: 1; }

.b2b-svc-ico {
  font-size: 0 !important; /* Hide emoji size, we'll override per card */
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: var(--green-pale) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 18px !important;
  flex-shrink: 0 !important;
}
.b2b-svc-t {
  font-family: 'Syne', sans-serif !important;
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: var(--dark) !important;
  letter-spacing: -0.01em !important;
  margin-bottom: 10px !important;
}
.b2b-svc-d {
  font-size: 0.84rem !important;
  line-height: 1.7 !important;
  color: #5A6E45 !important;
}
.b2b-svc-tag {
  font-size: 0.66rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  padding: 3px 10px !important;
  border-radius: 4px !important;
  background: var(--green-pale) !important;
  color: var(--green) !important;
  border: 1px solid rgba(45,80,22,.12) !important;
}

/* === B2B MINI CARDS (hero right side) === */
.b2b-mini-card {
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.14) !important;
  border-radius: 14px !important;
  padding: 20px 18px !important;
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), background 0.3s !important;
  backdrop-filter: blur(8px);
}
.b2b-mini-card:hover {
  transform: translateY(-6px) !important;
  background: rgba(255,255,255,0.12) !important;
  border-color: rgba(255,255,255,0.24) !important;
}
.b2b-mini-ico {
  font-size: 0 !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 10px !important;
  background: rgba(212,165,32,0.2) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 12px !important;
}
.b2b-mini-t {
  font-family: 'Syne', sans-serif !important;
  font-size: 0.86rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  color: white !important;
  margin-bottom: 5px !important;
}
.b2b-mini-d {
  font-size: 0.75rem !important;
  color: rgba(255,255,255,0.6) !important;
  line-height: 1.5 !important;
}

/* === HERO REFINEMENTS === */
.b2b-hero {
  background: linear-gradient(140deg, #0D1F08 0%, #1A3A0D 45%, #0D2010 100%) !important;
  position: relative;
  overflow: hidden;
}
.b2b-hero::after {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,138,40,0.12) 0%, transparent 65%);
  pointer-events: none;
}
.b2b-eyebrow {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.65rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  background: rgba(184,134,11,0.15) !important;
  border: 1px solid rgba(184,134,11,0.35) !important;
  border-radius: 6px !important;
  padding: 7px 14px !important;
  display: inline-block !important;
  margin-bottom: 20px !important;
}
.b2b-stat-n {
  font-family: 'Syne', serif !important;
  font-size: 1.9rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}
.b2b-stat-l {
  font-size: 0.68rem !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  opacity: 0.55 !important;
  font-weight: 600 !important;
}

/* === PACKAGING CARDS — 3D === */
.pkg-card {
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease !important;
}
.pkg-card:hover {
  transform: translateY(-8px) perspective(600px) rotateX(1.5deg) !important;
  box-shadow: 0 4px 12px rgba(13,31,8,.06), 0 20px 48px rgba(13,31,8,.10) !important;
}
.pkg-card-name {
  font-family: 'Syne', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  font-size: 1.1rem !important;
}

/* === TEAM CARD 3D (fully rebuilt below) === */
.team-card-v10 {
  background: white;
  border-radius: 20px;
  border: 1px solid #E6EDD8;
  overflow: visible;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04);
  position: relative;
}
.team-card-v10:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(13,31,8,.08), 0 32px 64px rgba(13,31,8,.10);
}
.team-card-v10 .tc-header {
  height: 130px;
  position: relative;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.team-card-v10 .tc-header-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px);
  background-size: 30px 30px;
}
.team-card-v10 .tc-monogram {
  width: 80px; height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: white;
  position: absolute;
  bottom: -32px;
  left: 24px;
  z-index: 2;
}
.team-card-v10 .tc-header-label {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 100px;
}
.team-card-v10 .tc-body {
  padding: 44px 24px 24px;
}
.team-card-v10 .tc-name {
  font-family: 'Syne', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0D1F08;
  letter-spacing: -0.02em;
  margin-bottom: 3px;
}
.team-card-v10 .tc-role {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--green-light);
  margin-bottom: 12px;
}
.team-card-v10 .tc-desc {
  font-size: 0.83rem;
  color: #5A6E45;
  line-height: 1.68;
  margin-bottom: 18px;
}
.team-card-v10 .tc-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 7px;
  background: #0A66C2;
  color: white !important;
  font-size: 0.73rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.22s ease;
  letter-spacing: 0.02em;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-li:hover {
  background: #0952A5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10,102,194,.3);
}
.btn-li svg { width: 13px; height: 13px; fill: white; flex-shrink: 0; }
.btn-wa-sm {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 7px;
  background: #25D366;
  color: white !important;
  font-size: 0.73rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.22s ease;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-wa-sm:hover {
  background: #128C7E;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37,211,102,.3);
}

/* === EXPORT/IMPORT SECTION === */
.export-section {
  background: linear-gradient(140deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%);
  border-radius: 24px;
  padding: 56px 52px;
  position: relative;
  overflow: hidden;
  margin: 0;
}
.export-section::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10,102,194,.2) 0%, transparent 65%);
  pointer-events: none;
}
.export-section::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -40px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,165,32,.1) 0%, transparent 65%);
  pointer-events: none;
}
.export-stat-box {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 14px;
  padding: 20px 18px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(6px);
}
.export-stat-box:hover {
  background: rgba(255,255,255,.11);
  border-color: rgba(212,165,32,.3);
  transform: translateY(-4px);
}
.export-stat-n {
  font-family: 'Syne', serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 5px;
}
.export-stat-l {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,.45);
}
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 8px;
  background: transparent;
  border: 1.5px solid rgba(212,165,32,.5);
  color: #D4A520;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.02em;
  cursor: pointer;
}
.btn-export:hover {
  background: rgba(212,165,32,.12);
  border-color: #D4A520;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,165,32,.15);
}
.btn-export-solid {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 8px;
  background: #D4A520;
  border: none;
  color: #0A1628;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.02em;
  cursor: pointer;
}
.btn-export-solid:hover {
  background: #E8B830;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,165,32,.3);
}
.export-service-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.75);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.2s;
}
.export-service-chip:hover {
  background: rgba(212,165,32,.12);
  border-color: rgba(212,165,32,.3);
  color: #D4A520;
}
.export-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.5; }

/* === SVG ICON HELPERS === */
.ico-box {
  width: 44px; height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ico-box svg { width: 20px; height: 20px; }
.ico-green { background: rgba(45,80,22,.1); }
.ico-green svg { stroke: var(--green); fill: none; }
.ico-gold { background: rgba(184,134,11,.1); }
.ico-gold svg { stroke: var(--gold-light); fill: none; }
.ico-blue { background: rgba(10,102,194,.1); }
.ico-blue svg { stroke: #0A66C2; fill: none; }
.ico-white { background: rgba(255,255,255,.15); }
.ico-white svg { stroke: white; fill: none; }

/* === SECTION OVERLINE + DIVIDER === */
.sec-overline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green-light);
  margin-bottom: 14px;
}
.sec-overline::before {
  content: '';
  display: block;
  width: 24px; height: 2px;
  border-radius: 1px;
  background: var(--green-light);
  flex-shrink: 0;
}

/* === BROCHURE CARDS — 3D === */
.brochure-card {
  transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s ease !important;
  box-shadow: 0 2px 8px rgba(13,31,8,.04), 0 8px 24px rgba(13,31,8,.04) !important;
}
.brochure-card:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 8px 20px rgba(13,31,8,.08), 0 28px 56px rgba(13,31,8,.09) !important;
  border-color: #C8D8B0 !important;
}

/* === PROGRESS / PROCESS STEPS — refined === */
.b2b-step {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}
.b2b-step:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 32px rgba(13,31,8,.10) !important;
}

/* === TESTIMONIAL CARDS — refined === */
.b2b-review-card {
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease !important;
}
.b2b-review-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 16px 40px rgba(13,31,8,.10) !important;
}

/* === PRICING TIERS — 3D === */
.b2b-pricing-card {
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease !important;
}
.b2b-pricing-card:hover {
  transform: translateY(-8px) !important;
}

/* === GENERAL SECTION BG REFINEMENTS === */
.b2b-section { position: relative; }

/* Remove emoji font scaling trick — make icon containers visible */
.b2b-svc-ico span,
.b2b-mini-ico span { font-size: 1.1rem !important; }

/* Contact form refinements */
.b2b-form-input {
  border-radius: 8px !important;
  border: 1.5px solid rgba(255,255,255,.15) !important;
  background: rgba(255,255,255,.07) !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.86rem !important;
  transition: border-color 0.25s, background 0.25s !important;
}
.b2b-form-input:focus {
  border-color: rgba(212,165,32,.5) !important;
  background: rgba(255,255,255,.1) !important;
  outline: none !important;
}

/* WhatsApp button refinement */
.b2b-wa-btn {
  border-radius: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.86rem !important;
  letter-spacing: 0.01em !important;
  transition: all 0.25s cubic-bezier(0.23,1,0.32,1) !important;
}
.b2b-wa-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(37,211,102,.3) !important;
}

/* btn-primary refinement */
.btn-primary {
  border-radius: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  letter-spacing: 0.01em !important;
  transition: all 0.25s cubic-bezier(0.23,1,0.32,1) !important;
}
.btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(45,80,22,.25) !important;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F4F8EF; }
::-webkit-scrollbar-thumb { background: #BDD0AB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2D5016; }

/* Subtle page load animation */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.b2b-hero .b2b-hero-inner { animation: fadeSlideUp 0.7s cubic-bezier(0.23,1,0.32,1) both; }
.b2b-hero .b2b-card-grid  { animation: fadeSlideUp 0.8s 0.1s cubic-bezier(0.23,1,0.32,1) both; }


/* ═══════════════════════════════════════════════════
   MOBILE FIXES & RESPONSIVE POLISH
   Targets: 480px (phones), 768px (tablets)
═══════════════════════════════════════════════════ */

@media (max-width: 768px) {
  /* General spacing */
  .container { padding: 0 16px; }
  .section { padding: 48px 0; }

  /* Typography */
  .section-title { font-size: 1.7rem !important; }
  .section-sub { font-size: 0.86rem; margin-bottom: 1.8rem; }

  /* Product grid */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 12px; }
  .product-card { min-width: 0; }
  .pc-img { height: 160px; }

  /* Hero slides */
  .slide-inner { grid-template-columns: 1fr !important; gap: 20px; padding: 40px 0 30px !important; }
  .slide-visual { display: block !important; }
  .slide-title { font-size: clamp(1.8rem, 6vw, 2.8rem) !important; }

  /* Product page */
  .product-page { grid-template-columns: 1fr !important; gap: 0 !important; }
  .prod-images { position: relative !important; top: auto !important; align-self: auto !important; margin-bottom: 20px !important; overflow: visible !important; }
  .prod-images .main-img { height: 300px !important; max-height: 300px !important; }
  .prod-images .main-img img { max-height: 300px; object-fit: contain !important; }
  .qty-discount-wrap { margin: 0 0 16px; }
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }

  /* Cart */
  .cart-layout { grid-template-columns: 1fr !important; }
  .side-cart { width: 100vw !important; }

  /* Checkout */
  .checkout-layout { grid-template-columns: 1fr !important; }

  /* B2B page */
  .b2b-hero-inner { grid-template-columns: 1fr !important; gap: 30px; }
  .b2b-card-grid { display: none !important; }
  .b2b-title { font-size: clamp(1.8rem, 6vw, 2.8rem) !important; }
  .b2b-service-grid { grid-template-columns: 1fr !important; }
  .b2b-contact-grid { grid-template-columns: 1fr !important; }
  .b2b-step { flex-direction: column; }

  /* Team cards */
  .team-card-v10 { max-width: 400px; margin: 0 auto; }

  /* Packaging */
  .pkg-grid { grid-template-columns: 1fr 1fr !important; }

  /* Export section */
  .export-section { padding: 32px 24px; }
  .export-section > div:first-child { flex-direction: column !important; }

  /* Rewards tiers */
  .rewards-tiers { grid-template-columns: 1fr !important; }

  /* Brochure */
  .brochure-grid { grid-template-columns: 1fr !important; }

  /* Map section */
  .b2b-contact-grid > div:last-child > div { grid-template-columns: 1fr !important; }

  /* Quiz */
  .quiz-steps-row { gap: 10px; }
  .quiz-title { font-size: 1.9rem !important; }
  .qm-opts { grid-template-columns: 1fr !important; }
  .qm-body { padding: 20px; }

  /* Bundle builder */
  .bundle-layout { grid-template-columns: 1fr !important; }
  .bundle-summary { position: static !important; }

  /* Influencer */
  .influencer-grid { grid-template-columns: 1fr 1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr 1fr; }

  /* Navbar */
  .nav-links, .btn-primary.nav-cta { display: none !important; }
  .hamburger { display: flex !important; }

}

@media (max-width: 480px) {
  /* Products */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 8px; }
  .pc-img { height: 130px; }
  .pc-body { padding: 10px; }
  .pc-name { font-size: 0.78rem; }

  /* Tier widget compact */
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px; }
  .qty-tier { padding: 10px 8px !important; }
  .tier-tabs { font-size: 1.4rem !important; }
  .tier-rate { font-size: .88rem !important; }
  .qty-discount-footer { flex-direction: column; gap: 6px; align-items: flex-start; }

  /* Category chips */
  .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* UGC grid */
  .ugc-grid { grid-template-columns: repeat(3, 1fr) !important; }

  /* B2B stats row */
  .b2b-stats { gap: 16px !important; flex-wrap: wrap; }
  .b2b-stats > div { min-width: 80px; }

  /* Export stats */
  .export-section > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }

  /* B2B contact */
  .b2b-form-input { font-size: 0.84rem; }

  /* Pkg grid */
  .pkg-grid { grid-template-columns: 1fr !important; }

  /* Map */
  .export-section + section .container > div { grid-template-columns: 1fr !important; }

}





.mobile-filter-btn { display: none; }
/* ═══════════════════════════════════════════════════════
   MOBILE FIXES v11 — based on real device recordings
   Device: ~384px wide mobile (Android)
═══════════════════════════════════════════════════════ */

/* ─── GLOBAL: Fix horizontal overflow ─── */
html, body { overflow-x: hidden; max-width: 100%; }
* { box-sizing: border-box; }

/* ─── PRODUCT PAGE MOBILE CRITICAL FIXES ─── */
@media (max-width: 768px) {

  /* Product detail layout — single column, no sticky */
  .product-page {
    grid-template-columns: 1fr !important;
    gap: 0 !important;
    padding: 16px 0 40px !important;
    overflow: visible !important;
  }

  /* Remove sticky on product images — causes overlap/bleed on mobile */
  .prod-images {
    position: relative !important;
    top: auto !important;
    align-self: auto !important;
    z-index: 1 !important;
    overflow: visible !important;
    width: 100% !important;
    margin-bottom: 20px !important;
  }

  /* Product info column — must clear image, no overlap */
  .product-page > div:last-child,
  .product-page > div:nth-child(2) {
    position: relative !important;
    z-index: 2 !important;
    background: white !important;
    overflow: visible !important;
    width: 100% !important;
  }

  /* Product image — full width, fixed height, no overflow bleed */
  .main-img {
    aspect-ratio: 1 !important;
    max-height: 300px !important;
    height: 300px !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    display: block !important;
    background: var(--off-white) !important;
  }
  .main-img img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    padding: 16px !important;
    display: block !important;
  }

  /* Thumb row — smaller on mobile */
  .thumb { width: 52px !important; height: 52px !important; }

  /* Page top padding — reduce for mobile */
  #page-product { padding-top: 70px !important; }

  /* Product title + price */
  .prod-title { font-size: 1.3rem !important; line-height: 1.25 !important; }
  .prod-sale  { font-size: 1.5rem !important; }

  /* ─── TIER WIDGET: 2×2 grid on mobile ─── */
  .qty-tiers-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0 !important;
  }
  /* Fix border for 2x2 layout */
  .qty-tier:nth-child(2)  { border-right: none !important; }
  .qty-tier:nth-child(3)  { border-top: 1px solid var(--light-gray) !important; }
  .qty-tier:nth-child(4)  { border-top: 1px solid var(--light-gray) !important; border-right: none !important; }
  .qty-tier { border-right: 1px solid var(--light-gray) !important; }

  .tier-tabs { font-size: 1.4rem !important; }
  .tier-rate { font-size: 0.88rem !important; }
  .tier-mrp  { font-size: 0.72rem !important; }
  .tier-save-label { font-size: 0.62rem !important; }

  .qty-discount-footer {
    flex-direction: column !important;
    gap: 6px !important;
    align-items: flex-start !important;
  }

  /* ─── SHOP PAGE: Hide filter sidebar on mobile ─── */
  .shop-layout {
    grid-template-columns: 1fr !important;
  }
  .filter-sidebar {
    display: none !important;
  }
  /* Show filter toggle button */
  .mobile-filter-btn {
    display: flex !important;
  }
  .filter-sidebar.mobile-visible {
    display: block !important;
  }

  /* Products grid — 2 column on mobile */
  .products-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }
  .pc-img { height: 150px !important; }
  .pc-body { padding: 10px 10px 12px !important; }
  .pc-name { font-size: 0.78rem !important; line-height: 1.3 !important; }
  .pc-price { font-size: 0.9rem !important; }
  .pc-badge { font-size: 0.58rem !important; padding: 2px 7px !important; }
  .pc-offer { font-size: 0.62rem !important; padding: 4px 8px !important; }

  /* ─── PRODUCT PAGE: content area ─── */
  .prod-brand { font-size: 0.7rem !important; }
  .prod-rating-row { font-size: 0.78rem !important; }

  /* ─── BREADCRUMB: Compact on mobile ─── */
  .breadcrumb { font-size: 0.74rem !important; padding-bottom: 12px !important; }

  /* ─── ADD TO CART BUTTON: Full width mobile ─── */
  .add-cart-btn {
    width: 100% !important;
    padding: 16px 20px !important;
    font-size: 0.9rem !important;
    margin-bottom: 10px !important;
  }
  .buy-now-btn {
    width: 100% !important;
    padding: 14px 20px !important;
    font-size: 0.9rem !important;
  }

  /* ─── RELATED PRODUCTS ─── */
  #relatedGrid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  /* ─── PRODUCT TABS ─── */
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap !important; }
  .tab  { font-size: 0.78rem !important; padding: 8px 14px !important; white-space: nowrap; flex-shrink: 0; }

  /* ─── CART + CHECKOUT ─── */
  .cart-layout, .checkout-layout { grid-template-columns: 1fr !important; gap: 16px !important; }
  .cart-summary { position: static !important; }
  .side-cart     { width: 100vw !important; }

  /* ─── HOMEPAGE SECTIONS ─── */
  .slide-inner { grid-template-columns: 1fr !important; padding: 40px 0 30px !important; }
  .slide-visual { display: block !important; }
  .slide-title  { font-size: clamp(1.7rem, 6vw, 2.4rem) !important; }

  .hero-new-inner { grid-template-columns: 1fr !important; gap: 20px !important; }

  /* Category grid */
  .cat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }

  /* Quiz */
  .quiz-title { font-size: 1.7rem !important; }
  .quiz-steps-row { gap: 8px !important; }
  .qm-opts { grid-template-columns: 1fr !important; }
  .qm-body { padding: 16px !important; }

  /* Bundle builder */
  .bundle-layout { grid-template-columns: 1fr !important; }
  .bundle-summary { position: static !important; }

  /* UGC grid */
  .ugc-grid { grid-template-columns: repeat(3, 1fr) !important; }

  /* Influencer */
  .influencer-grid { grid-template-columns: 1fr 1fr !important; }

  /* Meal CTA */
  .meal-cta { flex-direction: column !important; padding: 24px 20px !important; gap: 20px !important; }

  /* Refer card */
  .refer-card { padding: 28px 20px !important; }
  .refer-card > div[style*="display:flex"] { flex-wrap: wrap !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }

  /* B2B */
  .b2b-hero-inner { grid-template-columns: 1fr !important; gap: 24px !important; }
  .b2b-card-grid  { display: none !important; }
  .b2b-title      { font-size: clamp(1.7rem, 6vw, 2.6rem) !important; }
  .b2b-service-grid { grid-template-columns: 1fr !important; }
  .b2b-contact-grid { grid-template-columns: 1fr !important; }
  .b2b-stats      { gap: 16px !important; flex-wrap: wrap !important; }
  .b2b-stats > div { min-width: 80px !important; }

  /* Export section */
  .export-section { padding: 32px 20px !important; }
  .export-section > div { flex-wrap: wrap !important; }

  /* Team cards grid */
  div[style*="grid-template-columns:repeat(3,1fr)"] { 
    grid-template-columns: 1fr !important; 
  }

  /* Pkg grid */
  .pkg-grid { grid-template-columns: 1fr 1fr !important; }

  /* Map + brochure */
  .brochure-grid { grid-template-columns: 1fr !important; }

  /* Sticky cart notification */
  .sticky-cart { display: none !important; }
}

/* ── 480px and below (small phones) ── */
@media (max-width: 480px) {
  .container { padding: 0 14px !important; }

  /* Product grid — 2 col */
  .products-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
  .pc-img { height: 120px !important; }
  .pc-name { font-size: 0.74rem !important; }

  /* Tier widget — still 2×2 */
  .qty-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .qty-tier { padding: 10px 8px !important; }

  /* Cat grid */
  .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* Section headings */
  .section-title { font-size: 1.5rem !important; }
  .b2b-title { font-size: 1.5rem !important; }

  /* Pkg grid — 1 col on very small */
  .pkg-grid { grid-template-columns: 1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns: 1fr !important; }

  /* Export stats */
  .export-section > div:nth-child(2) { grid-template-columns: 1fr 1fr !important; }

  /* Team card — full width */
  .team-card-v10 { max-width: 100% !important; }
}


/* Mobile filter panel show/hide */
@media (max-width: 768px) {
  .filter-sidebar.mobile-visible {
    display: block !important;
    margin-bottom: 16px;
  }
}


/* ═══════════════════════════════════════════════════════
   ASCOVITA — FULL MOBILE RESPONSIVE OVERHAUL
   ═══════════════════════════════════════════════════════ */

/* ── Base mobile improvements ── */
@media(max-width:768px) {
  /* Navbar */
  .nav-inner { height:60px; padding:0 16px; }
  .nav-logo img { height:40px; }

  /* Container padding */
  .container { padding:0 16px; }

  /* Sections */
  .section { padding:40px 0; }

  /* Hero slider — smooth on mobile */
  .hero-slides-wrap { min-height:auto !important; }
  .hero-slide { position:absolute; inset:0; min-height:auto; }
  .hero-slide.active { position:relative; min-height:auto; }
  .slide-inner { padding:100px 0 40px !important; grid-template-columns:1fr !important; gap:20px !important; }
  .slide-headline { font-size:clamp(1.7rem,7vw,2.4rem) !important; margin-bottom:10px; }
  .slide-sub { font-size:0.85rem !important; margin-bottom:14px; }
  .slide-offer { font-size:0.78rem !important; padding:6px 14px !important; margin-bottom:18px; }
  .slide-btns { flex-direction:column; gap:8px; }
  .slide-btns button, .slide-btns a { width:100% !important; justify-content:center; text-align:center; padding:12px 16px !important; font-size:0.84rem !important; }
  .slide-visual { display:block !important; }
  .slide-img-frame img { height:200px !important; border-radius:14px; }
  .slide-bubble { display:none !important; }
  .slides-controls { bottom:16px; gap:10px; }
  .slide-arrow { width:34px; height:34px; font-size:1rem; }

  /* Trust bar */
  .trust-bar { overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; }

  /* Section titles */
  .section-title { font-size:clamp(1.5rem,5vw,2rem) !important; }

  /* Product cards */
  .products-grid { grid-template-columns:1fr 1fr !important; gap:12px; }
  .p-name { font-size:0.82rem; }
  .sale-price { font-size:0.95rem; }
  .p-img-wrap { aspect-ratio:1; }
  .p-info { padding:10px 12px 12px; }

  /* Category grid */
  .cat-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px; }
  .cat-card { padding:16px 8px; }
  .cat-icon { font-size:1.6rem; }
  .cat-name { font-size:0.78rem; }

  /* Promo carousel */
  .promo-card { padding:24px 20px; flex-direction:column; gap:16px; }
  .promo-text h2 { font-size:clamp(1.1rem,4vw,1.5rem); }

  /* Product detail page */
  .product-page { grid-template-columns:1fr !important; gap:0 !important; padding:16px 0 40px; }
  .prod-images { margin-bottom:16px; }
  .prod-title { font-size:clamp(1.3rem,4.5vw,1.8rem); }

  /* Cart */
  .cart-layout { grid-template-columns:1fr !important; }

  /* Checkout */
  .checkout-layout { grid-template-columns:1fr !important; }

  /* Footer */
  .footer-grid { grid-template-columns:1fr 1fr !important; gap:24px; }

  /* Bundle section */
  .bundle-layout { grid-template-columns:1fr !important; }
  .bundle-summary { position:static !important; }

  /* Sticky cart bar */
  #stickyCart { padding:10px 16px !important; }

  /* Side cart */
  .side-cart { width:100vw !important; }

  /* Qty tier widget */
  .qty-tiers { grid-template-columns:repeat(2,1fr) !important; }
  .qty-tier { padding:12px 8px; }
  .tier-tabs { font-size:0.88rem; }
}

@media(max-width:480px) {
  .products-grid { grid-template-columns:1fr 1fr !important; gap:10px; }
  .cat-grid { grid-template-columns:repeat(3,1fr) !important; gap:6px; }
  .cat-card { padding:12px 6px; }
  .cat-icon { font-size:1.4rem; margin-bottom:6px; }
  .cat-name { font-size:0.7rem; }
  .footer-grid { grid-template-columns:1fr !important; }
  .promo-code-box .code { font-size:1rem; letter-spacing:2px; }
  .slide-img-frame img { height:160px !important; }
  .slide-inner { padding:80px 0 36px !important; }
  .qty-tiers { grid-template-columns:1fr 1fr !important; }
}

/* ── Fix slider height so page doesn't jump ── */
@media(max-width:768px) {
  #heroSlidesWrap { 
    height:auto !important;
    min-height:auto !important;
  }
  .hero-slide {
    position:relative !important;
    opacity:1 !important;
    pointer-events:all !important;
    transform:none !important;
    display:none !important;
    transition:none !important;
  }
  .hero-slide.active {
    display:flex !important;
  }
  .hero-slide.leaving {
    display:none !important;
  }
}

</style></head><body>
    <div class="header"><div><div class="brand">🌿 Ascovita</div><div class="sub">ORGANIC VITAMINS & SUPPLEMENTS</div></div><div style="text-align:right"><div style="font-weight:700">TAX INVOICE</div><div style="font-size:.82rem;color:#666">${o.orderId}</div><div style="font-size:.82rem;color:#666">${o.date}</div></div></div>
    <h2>Bill To</h2><p>${o.customer}<br>${o.email}<br>${o.phone}<br>${o.address}</p>
    <h2>Order Items</h2><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
    ${o.items?.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price*i.qty}</td></tr>`).join('')}
    </tbody></table>
    <div style="text-align:right;margin-top:20px"><div class="total">Total Paid: ₹${o.total?.toLocaleString('en-IN')}</div><div style="font-size:.75rem;color:#666;margin-top:4px">Payment via ${o.method?.toUpperCase()||'Online'} · Cashfree</div></div>
    <div class="footer">Ascovita · FSSAI License · Made in India · ascovita.com<br>Thank you for shopping with us! 🌿</div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Ascovita-Invoice-${orderId}.html`; a.click();
    URL.revokeObjectURL(url);
    showToast('🧾 Invoice downloaded!');
  } catch(e) { showToast('Could not generate invoice', 'error'); }
}

function prefillProfile(user) {
  const parts = user.name?.split(' ') || ['',''];
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('profileFirst', parts[0]);
  setVal('profileLast', parts.slice(1).join(' '));
  setVal('profileEmail', user.email);
  setVal('profilePhone', user.phone);
  if (user.address) {
    setVal('profileAddr1', user.address.addr1);
    setVal('profileAddr2', user.address.addr2);
    setVal('profileCity', user.address.city);
    setVal('profileState', user.address.state);
    setVal('profilePin', user.address.pin);
  }
}

function saveProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const getVal = id => document.getElementById(id)?.value?.trim() || '';
  user.name = (getVal('profileFirst') + ' ' + getVal('profileLast')).trim();
  user.phone = getVal('profilePhone');
  user.address = {
    addr1: getVal('profileAddr1'),
    addr2: getVal('profileAddr2'),
    city: getVal('profileCity'),
    state: getVal('profileState'),
    pin: getVal('profilePin'),
  };
  // Update in users list
  try {
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    localStorage.setItem('asc_users', JSON.stringify(users));
  } catch(e) {}
  localStorage.setItem('asc_user', JSON.stringify(user));
  const an=document.getElementById('accName'); if(an) an.textContent = user.name;
  updateAccountNavBtn();
  showToast('✅ Profile & address saved!');
}

// ═══════════════════════════════════════════════════════
// CHECKOUT: PROMO CODES + SAVED ADDRESS AUTO-FILL
// ═══════════════════════════════════════════════════════

// Promo codes — only TEST100 kept locally for payment testing.
// ALL real codes are fetched live from backend (Supabase coupons table).
const PROMO_CODES = {
  'TEST100': { type: 'pct', value: 100, label: '100% OFF (Test Mode)', demo: true },
  'TESTPAY': { type: 'pct', value: 100, label: '100% OFF (Payment Test)', demo: true },
};

let activePromoCode = null;

async function applyPromoCode() {
  const input  = document.getElementById('promoCodeInput');
  const status = document.getElementById('promoStatus');
  if (!input || !status) return;
  const code = input.value.trim().toUpperCase();
  if (!code) {
    status.innerHTML = '<div style="font-size:0.78rem;color:var(--red);margin-top:6px">Please enter a promo code.</div>';
    return;
  }

  status.innerHTML = '<div style="font-size:0.78rem;color:var(--gray);margin-top:6px">⏳ Checking code...</div>';

  // Local-only test codes (never go to backend)
  const localCode = PROMO_CODES[code];
  if (localCode) {
    activePromoCode = { code, ...localCode };
    status.innerHTML = `<div class="promo-badge">✅ ${code} applied — ${localCode.label} <button class="promo-remove" onclick="removePromoCode()">✕</button></div>`;
    renderCheckoutSummary();
    showToast(`🏷️ Code ${code} applied!`);
    return;
  }

  // ALL real codes come from backend (Supabase coupons table via admin)
  const subtotal = STORE.getSubtotal ? STORE.getSubtotal() : 0;
  const backendPromo = await validateCouponWithBackend(code, subtotal);
  if (backendPromo) {
    const type = backendPromo.type === 'percent' ? 'pct' : 'flat';
    activePromoCode = { code, type, value: backendPromo.value, label: backendPromo.label || `${code} applied` };
    status.innerHTML = `<div class="promo-badge">✅ ${code} applied — ${activePromoCode.label} <button class="promo-remove" onclick="removePromoCode()">✕</button></div>`;
    renderCheckoutSummary();
    showToast(`🏷️ Code ${code} applied!`);
    return;
  }

  status.innerHTML = '<div style="font-size:0.78rem;color:var(--red);margin-top:6px">❌ Invalid or expired code. Add codes in the admin panel.</div>';
  activePromoCode = null;
  renderCheckoutSummary();
}

function removePromoCode() {
  activePromoCode = null;
  const input = document.getElementById('promoCodeInput');
  const status = document.getElementById('promoStatus');
  if (input) input.value = '';
  if (status) status.innerHTML = '';
  renderCheckoutSummary();
}

// Override renderCheckoutSummary to include promo discount
const _origRenderCheckoutSummary = window.renderCheckoutSummary;

function getPromoDiscount(subtotal) {
  if (!activePromoCode) return 0;
  if (activePromoCode.type === 'pct') return Math.round(subtotal * activePromoCode.value / 100);
  if (activePromoCode.type === 'flat') return Math.min(activePromoCode.value, subtotal);
  return 0;
}

// Show saved address bar on checkout page load for logged-in users
function checkSavedAddressForCheckout() {
  const user = getCurrentUser();
  const bar = document.getElementById('savedAddressBar');
  if (!bar) return;
  if (user && user.address && user.address.addr1) {
    const sn=document.getElementById('savedAddrName'); if(sn) sn.textContent = user.name;
    const sd=document.getElementById('savedAddrDetails'); if(sd) sd.textContent = `${user.address.addr1}, ${user.address.city} - ${user.address.pin}`;
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

function fillSavedAddress() {
  const user = getCurrentUser();
  if (!user || !user.address) return;
  const a = user.address;
  const setVal = (sel, val) => { const el = document.querySelector(sel); if (el && val) el.value = val; };
  // Use form-input selectors (nth-child approach for the checkout form inputs)
  const inputs = document.querySelectorAll('#page-checkout .form-input');
  if (inputs.length >= 8) {
    const nameParts = user.name?.split(' ') || ['',''];
    inputs[0].value = nameParts[0] || '';
    inputs[1].value = nameParts.slice(1).join(' ') || '';
    inputs[2].value = user.email || '';
    inputs[3].value = user.phone || '';
    inputs[4].value = a.addr1 || '';
    inputs[5].value = a.addr2 || '';
    inputs[6].value = a.city || '';
    inputs[7].value = a.state || '';
    if (inputs[8]) inputs[8].value = a.pin || '';
  }
  const sab=document.getElementById('savedAddressBar'); if(sab) sab.style.display = 'none';
  showToast('✅ Saved address filled in!');
}

// ── CONSOLIDATED showPage — handles ALL page-specific logic ──
var _baseSP = window.showPage;
window.showPage = function(pg) {
  if (typeof _baseSP === 'function') _baseSP(pg);
  if (pg === 'account')       { try { loadAccountPage(); } catch(e){} }
  if (pg === 'checkout')      { try { checkSavedAddressForCheckout(); } catch(e){} }
  if (pg === 'wishlist')      { try { renderWishlistPage(); } catch(e){} }
  if (pg === 'subscriptions') { try { initSubscriptionsPage(); } catch(e){} }
  if (pg === 'advisor')       { try { vitaInit(); } catch(e){} }
};


// ═══════════════════════════════════════════════════════
// SIDE CART DRAWER
// ═══════════════════════════════════════════════════════
function openSideCart() {
  renderSideCart();
  document.getElementById('sideCart')?.classList.add('open');
  document.getElementById('sideCartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSideCart() {
  document.getElementById('sideCart')?.classList.remove('open');
  document.getElementById('sideCartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderSideCart() {
  const body = document.getElementById('scBody');
  const foot = document.getElementById('scFoot');
  const countEl = document.getElementById('scCount');
  if (!body || !foot) return;

  const count = STORE.cart.reduce((s,i) => s + i.qty, 0);
  if (countEl) countEl.textContent = count;

  if (STORE.cart.length === 0) {
    body.innerHTML = `<div class="sc-empty"><div style="font-size:3.5rem;margin-bottom:16px">🛒</div><h3 style="margin-bottom:8px">Your cart is empty</h3><p style="color:var(--gray);font-size:0.84rem;margin-bottom:20px">Add some products to get started!</p><button class="btn-primary" onclick="closeSideCart();showPage('shop')">Shop Now →</button></div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = STORE.cart.map(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    if (!p) return '';
    const price = item.tierRate !== undefined ? item.tierRate : (p.salePrice || p.price);
    return `
      <div class="sc-item">
        <img class="sc-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/64x64/EAF2E0/2D5016?text=A'">
        <div class="sc-info">
          <div class="sc-name">${p.name}</div>
          ${item.tierTabs ? `<div class="sc-tier-info" style="font-size:.7rem;color:var(--green);font-weight:600;margin:1px 0">${item.tierTabs} Tablets (${item.tierTabs/15} ${item.tierTabs===15?'Pack':'Packs'})</div>` : ''}
          <div class="sc-brand">${p.brand}</div>
          <div class="sc-price">₹${(price * item.qty).toLocaleString('en-IN')}</div>
          <div class="sc-qty-row">
            <button class="sc-qty-btn" onclick="scUpdateQty(${item.id}, ${item.qty - 1}, ${item.tierIdx ?? 'undefined'})">−</button>
            <span class="sc-qty-val">${item.qty}</span>
            <button class="sc-qty-btn" onclick="scUpdateQty(${item.id}, ${item.qty + 1}, ${item.tierIdx ?? 'undefined'})">+</button>
          </div>
        </div>
        <button class="sc-remove" onclick="STORE.removeFromCart(${item.id});renderSideCart()" title="Remove">🗑</button>
      </div>`;
  }).join('');

  const sub = STORE.cart.reduce((s, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    const price = item.tierRate !== undefined ? item.tierRate : (p ? (p.salePrice || p.price) : 0);
    return s + price * item.qty;
  }, 0);
  const ship = 0; // Free shipping online
  const promoDisc = getPromoDiscount ? getPromoDiscount(sub) : 0;
  const total = Math.max(0, sub - promoDisc + ship);

  foot.innerHTML = `
    <div class="sc-totals">
      <div class="sc-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
      ${promoDisc > 0 ? `<div class="sc-row" style="color:var(--success)"><span>Discount</span><span>−₹${promoDisc.toLocaleString('en-IN')}</span></div>` : ''}
      <div class="sc-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:var(--success)">FREE</span>' : '₹' + ship}</span></div>
      <div class="sc-row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    </div>
    <button class="sc-checkout-btn" onclick="closeSideCart();showPage('checkout')">🔒 Proceed to Checkout</button>
    <button class="sc-view-btn" onclick="closeSideCart();showPage('cart')">View Full Cart</button>
    <div style="text-align:center;font-size:0.7rem;color:var(--gray);margin-top:10px">🔒 Secured by Cashfree · Free shipping above ₹599</div>
  `;
}

function scUpdateQty(id, qty, tierIdx) {
  if (qty < 1) { STORE.removeFromCart(id); }
  else { STORE.updateQty(id, qty); }
  renderSideCart();
}

// ═══════════════════════════════════════════════════════
// WISHLIST PAGE
// ═══════════════════════════════════════════════════════
function renderWishlistPage() {
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  const subtitle = document.getElementById('wishlistSubtitle');
  if (!grid) return;

  const wishIds = STORE.wishlist || [];
  const wishProds = PRODUCTS.filter(p => wishIds.includes(p.id));

  if (subtitle) subtitle.textContent = `${wishProds.length} saved product${wishProds.length !== 1 ? 's' : ''}`;

  if (wishProds.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = wishProds.map(p => renderProductCard(p)).join('');

  // Update wish badge in nav
  updateWishBadge();
}

function updateWishBadge() {
  const badge = document.getElementById('wishBadge');
  const count = (STORE.wishlist || []).length;
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Override toggleWishlist to update badge
const _origToggleWish = STORE.toggleWishlist.bind(STORE);
STORE.toggleWishlist = function(id) {
  _origToggleWish(id);
  updateWishBadge();
};

// ═══════════════════════════════════════════════════════
// PAYMENT FAILED PAGE — route errors here
// ═══════════════════════════════════════════════════════
function showPaymentFailedPage(msg) {
  const el = document.getElementById('pfErrorMsg');
  if (el && msg) el.textContent = msg;
  showPage('payment-failed');
}

// ═══════════════════════════════════════════════════════
// SUBSCRIPTIONS PAGE
// ═══════════════════════════════════════════════════════
let selectedSubProduct = null;
let selectedSubPlan = 'quarterly';

function initSubscriptionsPage() {
  const grid = document.getElementById('subProductGrid');
  if (!grid) return;

  // Show subscribable products (all non-combo)
  const eligible = PRODUCTS.filter(p => !p.category.includes('combos'));
  grid.innerHTML = eligible.map(p => {
    const price = p.salePrice || p.price;
    return `
      <div onclick="selectSubProduct(${p.id}, this)" style="border:2px solid var(--light-gray);border-radius:var(--radius-sm);padding:12px;cursor:pointer;transition:var(--transition);display:flex;align-items:center;gap:10px" class="sub-prod-card">
        <img src="${p.image}" style="width:44px;height:44px;border-radius:8px;object-fit:contain;background:var(--off-white)" onerror="this.src=''">
        <div>
          <div style="font-size:0.8rem;font-weight:700;color:var(--text)">${p.name}</div>
          <div style="font-size:0.74rem;color:var(--green)">from ₹${price}/delivery</div>
        </div>
      </div>`;
  }).join('');

  // Update price displays based on bestseller as example
  const exampleProduct = PRODUCTS.find(p => p.tags.includes('bestseller'));
  if (exampleProduct) {
    const base = exampleProduct.salePrice || exampleProduct.price;
    const el1 = document.getElementById('subPrice1');
    const el3 = document.getElementById('subPrice3');
    const el6 = document.getElementById('subPrice6');
    if (el1) el1.textContent = Math.round(base * 0.9).toLocaleString('en-IN');
    if (el3) el3.textContent = Math.round(base * 0.85 * 3).toLocaleString('en-IN');
    if (el6) el6.textContent = Math.round(base * 0.8 * 6).toLocaleString('en-IN');
  }
}

function selectSubProduct(id, el) {
  selectedSubProduct = id;
  document.querySelectorAll('.sub-prod-card').forEach(c => { c.style.borderColor = 'var(--light-gray)'; c.style.background = ''; });
  if (el) { el.style.borderColor = 'var(--green)'; el.style.background = 'var(--green-pale)'; }
  const p = PRODUCTS.find(p => p.id === id);
  const sel = document.getElementById('subSelectedProduct');
  if (sel && p) sel.textContent = p.name;

  // Update prices based on selection
  const base = p ? (p.salePrice || p.price) : 0;
  const el1 = document.getElementById('subPrice1');
  const el3 = document.getElementById('subPrice3');
  const el6 = document.getElementById('subPrice6');
  if (el1) el1.textContent = Math.round(base * 0.9).toLocaleString('en-IN');
  if (el3) el3.textContent = Math.round(base * 0.85 * 3).toLocaleString('en-IN');
  if (el6) el6.textContent = Math.round(base * 0.8 * 6).toLocaleString('en-IN');
}

function startSubscription(plan) {
  if (!selectedSubProduct) {
    showToast('Please select a product first', 'error');
    const grid = document.getElementById('subProductGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const user = getCurrentUser();
  if (!user) { openAuth('login'); return; }

  const p = PRODUCTS.find(p => p.id === selectedSubProduct);
  const planNames = { monthly: 'Monthly', quarterly: 'Quarterly (Most Popular)', halfyearly: '6-Monthly (Best Value)' };
  showToast(`✅ Subscription started: ${p?.name} — ${planNames[plan]}! We'll contact you to confirm.`);

  // Save subscription to localStorage
  try {
    const subs = JSON.parse(localStorage.getItem('asc_subs') || '[]');
    subs.push({ productId: selectedSubProduct, productName: p?.name, plan, startDate: new Date().toISOString(), status: 'Active' });
    localStorage.setItem('asc_subs', JSON.stringify(subs));
  } catch(e) {}
}

// ══ Subscriptions & wishlist page hooks already handled above ══


// Init wishlist badge on load
document.addEventListener('DOMContentLoaded', function() {
  try { updateWishBadge(); } catch(e) {}

  // ── 3D TILT EFFECT on cert cards, cat cards, product cards ──
  function addTilt(selector, maxTilt, scale) {
    document.querySelectorAll(selector).forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * maxTilt;
        const rotY =  dx * maxTilt;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  // Apply tilt after a short delay to ensure DOM is ready
  setTimeout(function() {
    addTilt('.cert-card', 8, 1.04);
    addTilt('.cat-card', 6, 1.03);
    addTilt('.cat-card-sm', 10, 1.06);
  }, 500);

  // ── SCROLL-REVEAL for SVG icons ──
  const revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  setTimeout(function() {
    document.querySelectorAll('.cert-card, .cat-card, .cat-card-sm').forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px) scale(0.95)';
      el.style.transition = 'opacity 0.5s ease ' + (i * 0.07) + 's, transform 0.5s ease ' + (i * 0.07) + 's';
      revealObs.observe(el);
    });
  }, 100);
});



// ═══════════════════════════════════════════════════════
let heroCurrentSlide = 0;
const heroTotalSlides = 3;
let heroAutoTimer = null;

function goHeroSlide(n) {
  const isMobile = window.innerWidth <= 768;
  const slides = document.querySelectorAll('.hero-slide');
  slides.forEach((s,i) => {
    s.classList.toggle('active', i === n);
    s.classList.remove('leaving');
    if (!isMobile && i === heroCurrentSlide && i !== n) s.classList.add('leaving');
  });
  document.querySelectorAll('.slide-dot').forEach((d,i) => d.classList.toggle('active', i === n));
  heroCurrentSlide = n;
  // Update dot colors for dark slides
  const activeSlideBg = document.querySelector('.hero-slide.active');
  const dots = document.querySelectorAll('.slide-dot');
  const isDark = activeSlideBg && activeSlideBg.classList.contains('hero-slide-2');
  dots.forEach(d => {
    d.style.borderColor = isDark ? 'rgba(255,255,255,0.5)' : '';
  });
}

function heroSlide(dir) {
  const next = (heroCurrentSlide + dir + heroTotalSlides) % heroTotalSlides;
  goHeroSlide(next);
  resetHeroAuto();
}

function startHeroAuto() {
  heroAutoTimer = setInterval(() => {
    heroSlide(1);
  }, 5000);
}

function resetHeroAuto() {
  clearInterval(heroAutoTimer);
  startHeroAuto();
}

// ═══════════════════════════════════════════════════════
// CHECKOUT UPSELL WIDGET
// ═══════════════════════════════════════════════════════
const UPSELL_SUGGESTIONS = [
  { id: 14, label: 'Add Vitamin C', price: 249, pitch: 'Boosts immunity & absorption' },
  { id:  3, label: 'Add Biotin', price: 449, pitch: 'Hair, skin & nail support' },
  { id: 10, label: 'Upgrade to Spirulina Combo', price: 999, pitch: 'Save ₹98 vs buying separately' },
  { id: 21, label: 'Add L-Lysine', price: 379, pitch: 'Collagen + immune defence' },
];

function renderUpsells() {
  const bar = document.getElementById('upsellBar');
  const container = document.getElementById('upsellItems');
  if (!bar || !container) return;
  const cartIds = STORE.cart.map(i => i.id);
  const suggestions = UPSELL_SUGGESTIONS.filter(u => !cartIds.includes(u.id)).slice(0, 2);
  if (!suggestions.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  container.innerHTML = suggestions.map(u =>
    `<div class="upsell-item">
      <div class="upsell-info"><span class="upsell-label">${u.label}</span><span class="upsell-pitch">${u.pitch}</span></div>
      <div class="upsell-price">₹${u.price}</div>
      <button class="upsell-add" onclick="STORE.addToCart(${u.id});renderCheckoutSummary();renderUpsells();">+ Add</button>
    </div>`
  ).join('');
}


/* ── COMPETITOR FEATURES JS ── */
const QUIZ_DATA=[
  {q:"What's your primary health goal?",opts:[{ico:'✨',lbl:'Skin Glow & Brightening'},{ico:'💪',lbl:'Immunity & Energy'},{ico:'🏋',lbl:'Weight Management'},{ico:'🧠',lbl:'Focus & Vitality'}]},
  {q:"How would you describe your lifestyle?",opts:[{ico:'🏃',lbl:'Active / Gym-goer'},{ico:'💼',lbl:'Busy & Desk-based'},{ico:'🏠',lbl:'Home & Family-focused'},{ico:'🧘',lbl:'Yoga & Wellness'}]},
  {q:"Any specific concerns?",opts:[{ico:'💇',lbl:'Hair fall / Hair growth'},{ico:'😴',lbl:'Fatigue & Low energy'},{ico:'🫁',lbl:'Digestive health'},{ico:'🌿',lbl:'Overall nutrition gap'}]},
  {q:"How do you prefer to take supplements?",opts:[{ico:'🫧',lbl:'Effervescent (fizzy drink)'},{ico:'💊',lbl:'Capsules / Tablets'},{ico:'🍵',lbl:'Powder / Mix'},{ico:'🤷',lbl:'No preference'}]}
];
const QUIZ_RECS={0:[4,3,14],1:[5,14,8],2:[15,20,8],3:[8,5,22]};
let quizStep=0,quizAnswers=[];
function openQuiz(){quizStep=0;quizAnswers=[];const o=document.getElementById('quizOverlay');if(o)o.style.display='flex';renderQuizStep();}
function closeQuiz(){const o=document.getElementById('quizOverlay');if(o)o.style.display='none';}
function renderQuizStep(){
  const ov=document.getElementById('quizOverlay');if(!ov)return;
  if(quizStep>=QUIZ_DATA.length){renderQuizResult();return;}
  const d=QUIZ_DATA[quizStep],pct=Math.round((quizStep/QUIZ_DATA.length)*100);
  ov.innerHTML='<div class="quiz-modal"><div class="qm-head"><div class="qm-title">Find Your Health Stack<\/div><button class="qm-close" onclick="closeQuiz()">✕<\/button><\/div><div class="qm-body"><div class="qm-prog"><div class="qm-prog-fill" style="width:'+pct+'%"><\/div><\/div><div class="qm-prog-lbl">Question '+(quizStep+1)+' of '+QUIZ_DATA.length+'<\/div><div class="qm-q">'+d.q+'<\/div><div class="qm-opts">'+d.opts.map((o,i)=>'<div class="qm-opt" onclick="selectQuizOpt('+i+')" id="qopt-'+i+'"><span class="qm-opt-ico">'+o.ico+'<\/span>'+o.lbl+'<\/div>').join('')+'<\/div><div class="qm-nav"><button class="qm-back" onclick="quizBack()"'+(quizStep===0?' style="visibility:hidden"':'')+'>← Back<\/button><button class="qm-next" id="quizNextBtn" onclick="quizNext()" disabled style="opacity:.45;cursor:not-allowed">Next →<\/button><\/div><\/div><\/div>';
  if(quizAnswers[quizStep]!==undefined){const el=document.getElementById('qopt-'+quizAnswers[quizStep]);if(el)el.classList.add('sel');const nb=document.getElementById('quizNextBtn');if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.cursor='pointer';}}
}
function selectQuizOpt(i){document.querySelectorAll('.qm-opt').forEach(o=>o.classList.remove('sel'));const el=document.getElementById('qopt-'+i);if(el)el.classList.add('sel');quizAnswers[quizStep]=i;const nb=document.getElementById('quizNextBtn');if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.cursor='pointer';}}
function quizNext(){if(quizAnswers[quizStep]===undefined)return;quizStep++;renderQuizStep();}
function quizBack(){if(quizStep>0){quizStep--;renderQuizStep();}}
function renderQuizResult(){
  const ov=document.getElementById('quizOverlay');if(!ov)return;
  const ids=QUIZ_RECS[quizAnswers[0]||0]||QUIZ_RECS[0];
  const rp=ids.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  ov.innerHTML='<div class="quiz-modal"><div class="qm-head"><div class="qm-title">🎯 Your Personalised Stack<\/div><button class="qm-close" onclick="closeQuiz()">✕<\/button><\/div><div class="qm-body"><div class="qm-result"><div class="qm-result-ico">🌿<\/div><div class="qm-result-title">Here\'s what your body needs<\/div><div class="qm-result-sub">Based on your answers, our nutritionists recommend this personalised Ascovita stack.<\/div><div class="qm-result-prods">'+rp.map(p=>'<div class="qm-rp" onclick="closeQuiz();showProduct('+p.id+')"><img src="'+( p.image||'')+ '" style="width:72px;height:72px;object-fit:cover;border-radius:10px;display:block;margin:0 auto 8px" onerror="this.style.display=\'none\'"><div class="qm-rp-name">'+(p.name||'')+'<\/div><div class="qm-rp-price">₹'+(p.salePrice||p.price||0)+'<\/div><\/div>').join('')+'<\/div><button class="btn-primary" onclick="closeQuiz();showPage(\'shop\')" style="margin-bottom:12px">Shop My Recommendations →<\/button><\/div><\/div><\/div>';
}

let selectedBundleIds=new Set();
function renderBundleBuilder(){const list=document.getElementById('bundleProdList');if(!list||!PRODUCTS)return;list.innerHTML=PRODUCTS.map(p=>'<div class="b-prod-row" id="brow-'+p.id+'" onclick="toggleBundle('+p.id+')"><div class="b-prod-cb" id="bcb-'+p.id+'">✓<\/div><div class="b-prod-img">'+(p.image?'<img src="'+p.image+'" style="width:54px;height:54px;object-fit:cover;border-radius:10px">':'🌿')+'<\/div><div class="b-prod-info"><div class="b-prod-name">'+p.name+'<\/div><div class="b-prod-cat">'+(p.category||'supplement')+'<\/div>'+(p.badge?'<div class="b-prod-badge">'+p.badge+'<\/div>':'')+'<\/div><div class="b-prod-price">₹'+(p.salePrice||p.price)+'<\/div><\/div>').join('');}
function toggleBundle(id){if(selectedBundleIds.has(id)){selectedBundleIds.delete(id);document.getElementById('brow-'+id)?.classList.remove('sel');}else{selectedBundleIds.add(id);document.getElementById('brow-'+id)?.classList.add('sel');}updateBundleSummary();}
function updateBundleSummary(){const sel=[...selectedBundleIds].map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean),n=sel.length,sub=sel.reduce((s,p)=>s+(p.salePrice||p.price),0),dp=n>=4?0.20:n===3?0.15:n===2?0.10:0,sav=Math.round(sub*dp),tot=sub-sav;const box=document.getElementById('bundleItemsBox');if(box)box.innerHTML=n===0?'<div class="bundle-empty-hint">No products selected yet<\/div>':sel.map(p=>'<div class="b-item-chip"><span class="b-item-name">'+p.name+'<\/span><span class="b-item-price">₹'+(p.salePrice||p.price)+'<\/span><\/div>').join('');const s=document.getElementById('bundleSubtotal'),t=document.getElementById('bundleTotal'),dr=document.getElementById('bundleDiscountRow'),dl=document.getElementById('bundleDiscountLabel'),dv=document.getElementById('bundleDiscountVal'),sb=document.getElementById('bundleSavingsBanner');if(s)s.textContent='₹'+sub;if(t)t.textContent='₹'+tot;if(dp>0){if(dr)dr.style.display='flex';if(dl)dl.textContent='Bundle discount ('+(dp*100)+'% off)';if(dv)dv.textContent='−₹'+sav;if(sb){sb.style.display='block';sb.textContent='🎉 You\'re saving ₹'+sav+' with your '+n+'-product bundle!';}}else{if(dr)dr.style.display='none';if(sb)sb.style.display='none';}}
function addBundleToCart(){const sel=[...selectedBundleIds].map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);if(!sel.length){showToast('Select at least one product 🌿','error');return;}sel.forEach(p=>STORE.addToCart(p.id,1));openSideCart();showPtsToast('+'+sel.length*10+' VitaPoints!');}

let stickyQty=1,stickyProdId=null;
function initStickyCart(prod){if(!prod)return;stickyProdId=prod.id;stickyQty=1;const ne=document.getElementById('scProdName'),pe=document.getElementById('scProdPrice'),qe=document.getElementById('scQtyVal');if(ne)ne.textContent=prod.name;if(pe)pe.textContent='₹'+(prod.salePrice||prod.price);if(qe)qe.textContent=1;const sc=document.getElementById('stickyCart'),ab=document.getElementById('addCartBtn');if(!sc||!ab)return;const obs=new IntersectionObserver(en=>{if(!en[0].isIntersecting){sc.style.display='flex';requestAnimationFrame(()=>{sc.style.transform='translateY(0)';});}else{sc.style.transform='translateY(100%)';setTimeout(()=>{if(sc.style.transform==='translateY(100%)')sc.style.display='none';},300);}},{threshold:0.1});obs.observe(ab);}
function scQtyChange(d){stickyQty=Math.max(1,stickyQty+d);const e=document.getElementById('scQtyVal');if(e)e.textContent=stickyQty;}
function scAddToCart(){if(!stickyProdId)return;STORE.addToCart(stickyProdId,stickyQty);openSideCart();showPtsToast('+5 VitaPoints earned!');}

function renderStockUrgency(prod){const el=document.getElementById('stockUrgency');if(!el||!prod)return;const stock=prod.stock||prod.inventory||0;if(stock<=0||stock>50){el.innerHTML='';return;}const pct=Math.min(100,Math.round((stock/50)*100)),cls=stock<=10?'danger':stock<=25?'warning':'ok',msg=stock<=10?'Only '+stock+' left — selling fast!':'Low stock — only '+stock+' remaining';el.innerHTML='<div class="su-low"'+(stock>10?' style="background:#FFF8E1;border-color:#FFD54F;color:#E65100"':'')+'><span class="su-dot"'+(stock>10?' style="background:#E65100"':'')+'><\/span>'+msg+'<\/div><div class="su-bar"><div class="su-bar-fill '+cls+'" style="width:'+pct+'%"><\/div><\/div>';}
function startLiveViewers(){const el=document.getElementById('liveViewerCount');if(!el)return;let n=8+Math.floor(Math.random()*16);el.textContent=n;setInterval(()=>{n=Math.max(5,Math.min(30,n+(Math.random()>.5?1:-1)*Math.floor(Math.random()*3+1)));el.textContent=n;},6500);}
function showPtsToast(msg){const t=document.getElementById('ptsToast');if(!t)return;t.textContent='🪙 '+msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}
function copyReferLink(){const inp=document.getElementById('referLink');if(!inp)return;inp.select();try{document.execCommand('copy');showToast('Referral link copied! Share on WhatsApp 🤝','success');showPtsToast('Share to earn ₹100!');}catch(e){showToast('Link: '+inp.value,'info');}}

document.addEventListener('DOMContentLoaded',function(){
  if(document.getElementById('bundleProdList')&&typeof PRODUCTS!=='undefined')renderBundleBuilder();
  if(typeof addToCartWithTier==='function'){const _o=addToCartWithTier;window.addToCartWithTier=function(id){_o(id);showPtsToast('+5 VitaPoints earned!');};}
});
document.addEventListener('productPageShown',function(e){const prod=e.detail;if(!prod)return;initStickyCart(prod);renderStockUrgency(prod);startLiveViewers();});

// ── Video player toggle ──
function playVideo(wrap) {
  const video = wrap.querySelector('video');
  const btn = wrap.querySelector('.video-play-btn');
  if (!video) return;
  if (video.paused) {
    // Pause all other videos
    document.querySelectorAll('.video-thumb-wrap video').forEach(v => {
      if (v !== video) { v.pause(); const b = v.parentElement.querySelector('.video-play-btn'); if(b) b.style.display = 'flex'; }
    });
    video.play();
    if (btn) btn.style.display = 'none';
    video.addEventListener('ended', () => { if(btn) btn.style.display = 'flex'; }, {once:true});
  } else {
    video.pause();
    if (btn) btn.style.display = 'flex';
  }
}


// ═══════════════════════════════════════════════════════════════
// VITA — AI HEALTH ADVISOR (Claude API)
// ═══════════════════════════════════════════════════════════════

// API key management — loaded from site config
// To enable AI chat: paste your Anthropic API key below
const AI_API_KEY = (function(){
  // Check sessionStorage first (set via admin)
  try { const k = sessionStorage.getItem('asc_ai_key'); if(k) return k; } catch(e){}
  // ↓↓ PASTE YOUR ANTHROPIC API KEY HERE ↓↓
  return 'sk-ant-api03-lzMU_lxDmpjOqm6aMH-_C06K8-Y9oXU32jW1b0WK3C5EqrGrRqpMF_4HkCJtC6GGXOx5FXAL93VFxNZEz8aTA-YoKFiQAA';
  // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
})();


function vitaInit() {
  if (vitaStarted) return;
  vitaStarted = true;
  vitaHistory = [];
  vitaMsgCount = 0;
  vitaLeadCaptured = false;
  const lf = document.getElementById('vitaLeadForm');
  if (lf) lf.style.display = 'none';
  const box = document.getElementById('vitaMessages');
  if (box) box.innerHTML = '';

  setTimeout(() => {
    vitaAddMsg("Namaste! 🌿 I'm **Vita**, your personal health advisor at Ascovita.\n\nI'm here to help you find the right supplements for your goals. May I know your name first? 😊", 'bot');
  }, 400);
}

function vitaRestart() {
  vitaStarted = false;
  vitaInit();
}

async function vitaSend() {
  const input = document.getElementById('vitaInput');
  const btn = document.getElementById('vitaSendBtn');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  vitaAddMsg(text, 'user');
  document.querySelectorAll('.vita-chips').forEach(el => el.remove());

  vitaHistory.push({ role: 'user', content: text });
  btn.disabled = true;
  vitaShowTyping();

  try {
    const res = await fetch('vita-proxy.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        system: VITA_SYSTEM,
        messages: vitaHistory
      })
    });

    vitaHideTyping();
    if (!res.ok) throw new Error('API ' + res.status);

    const data = await res.json();
    const raw = data.content?.[0]?.text || "I'm having a small issue. Please try again! 🌿";

    // Parse product recs
    const recPat = /\[VITA_REC:(\d+):([^\]]+)\]/g;
    const ids = [], reasons = [];
    let m;
    while ((m = recPat.exec(raw)) !== null) {
      ids.push(parseInt(m[1]));
      reasons.push(m[2]);
    }
    const clean = raw.replace(/\[VITA_REC:\d+:[^\]]+\]/g, '').trim();
    if (clean) vitaAddMsg(clean, 'bot');
    if (ids.length > 0) setTimeout(() => vitaRenderRecs(ids, reasons), 250);

    // Smart quick replies based on conversation stage
    const msgLen = vitaHistory.length;
    if (ids.length === 0) {
      if (msgLen <= 2) {
        setTimeout(() => vitaAddChips(['18–25 years','26–35 years','36–50 years','50+ years']), 500);
      } else if (msgLen <= 4) {
        setTimeout(() => vitaAddChips(['🌟 Skin & Glow','⚡ Energy & Focus','💪 Immunity','💇 Hair Growth','⚖️ Weight Loss','🦴 Bone Health']), 500);
      } else if (ids.length === 0 && msgLen <= 6) {
        setTimeout(() => vitaAddChips(['Active lifestyle','Desk job / sedentary','Vegetarian','I travel a lot']), 500);
      }
    } else {
      setTimeout(() => vitaAddChips(['Tell me more about these','Are there combo packs?','How long to see results?','Add all to cart']), 600);
    }

    vitaHistory.push({ role: 'assistant', content: raw });

  } catch(err) {
    vitaHideTyping();
    vitaAddMsg("Sorry, I'm having a small connection issue 🌿 Please try again in a moment, or WhatsApp us at +91 98985 82650!", 'bot');
  } finally {
    btn.disabled = false;
    input.focus();
  }
}

function vitaSubmitLead() {
  const name = document.getElementById('vitaLeadName')?.value.trim();
  const email = document.getElementById('vitaLeadEmail')?.value.trim();
  if (!name || !email) { alert('Please fill in both name and email 🌿'); return; }
  vitaLeadCaptured = true;
  document.getElementById('vitaLeadForm').style.display = 'none';
  // Store locally
  try { localStorage.setItem('asc_lead', JSON.stringify({name, email, date: new Date().toISOString()})); } catch(e){}
  vitaAddMsg(`Thank you, ${name}! 🌿 Your personalised plan has been saved. We'll send your exclusive offer to **${email}** soon. Is there anything else I can help you with?`, 'bot');
}

// Vita is initialized via the consolidated showPage above
