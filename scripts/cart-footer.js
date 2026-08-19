// Extracted from index.html (line 23640) by Manus SEO pass — load order preserved

/* Sticky pay bar wiring.
   The amount is read out of the rendered summary rather than recomputed,
   so it can never disagree with the figure the customer is looking at —
   promo codes, VitaPoints, shipping and tier pricing all already land
   there. A MutationObserver keeps it current as the summary re-renders. */
(function () {
  var bar = document.getElementById('ozPayBar');
  if (!bar) return;
  var amtEl = document.getElementById('ozPayBarAmt');

  function readTotal() {
    var row = document.querySelector('#ckSummary .sum-row.total span:last-child');
    return row ? row.textContent.trim() : '';
  }
  function sync() {
    var t = readTotal();
    if (t) amtEl.textContent = t;
    // COD is not offered on every cart; mirror the real button's state.
    var cod = document.getElementById('codBtn');
    var codLink = bar.querySelector('.opb-cod');
    if (codLink) {
      var hidden = !cod || cod.offsetParent === null || cod.disabled;
      codLink.style.display = hidden ? 'none' : '';
    }
  }
  function setActive() {
    var pg = document.getElementById('page-checkout');
    var on = !!pg && pg.classList.contains('active');
    document.body.classList.toggle('oz-checkout', on);
    // #stickyCart is the product page's add-to-cart bar and is only ever
    // shown, never hidden again, so it used to follow the customer to
    // checkout and stack under the pay bar. This scopes it to its own page.
    var prod = document.getElementById('page-product');
    document.body.classList.toggle('oz-product', !!prod && prod.classList.contains('active'));
    if (on) sync();
  }

  var sum = document.getElementById('ckSummary');
  if (sum && window.MutationObserver) {
    new MutationObserver(sync).observe(sum, { childList: true, subtree: true, characterData: true });
  }
  // showPage() toggles .active on the page containers.
  var pages = document.querySelector('.page') && document.querySelector('.page').parentNode;
  if (pages && window.MutationObserver) {
    new MutationObserver(setActive).observe(pages, { attributes: true, attributeFilter: ['class'], subtree: true });
  }
  document.addEventListener('DOMContentLoaded', setActive);
  setActive();
})();
