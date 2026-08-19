// ADMIN-SEO.JS
// ─────────────────────────────────────────────
// Extracted from admin.html inline blocks 10 (19 Aug 2026, Manus SEO pass).
// Order inside each file follows the original document order.

/* ══ block 10 (origin 799349-801183, 1817 B) ══ */
// ═══════════════════════════════════════════════
// GA4 Settings helpers
// ═══════════════════════════════════════════════
function testGA4Connection() {
  var pidEl = document.getElementById("ga4PropertyIdInput");
  var pid = pidEl ? pidEl.value.trim() : "";
  var res = document.getElementById("ga4TestResult");
  function setRes(text, color) { if (res) { res.textContent = text; res.style.color = color || 'var(--text3)'; } }
  if (!pid) { setRes("Enter a Property ID first (numbers only, e.g. 381234567)", "var(--red)"); return; }
  var allDigits = true;
  for (var i = 0; i < pid.length; i++) { var c = pid.charCodeAt(i); if (c < 48 || c > 57) { allDigits = false; break; } }
  if (!allDigits) { setRes("Property ID must be numbers only (e.g. 381234567) — NOT G-XXXXXX", "var(--red)"); return; }
  localStorage.setItem("ga4_property_id", pid);
  setRes("Testing connection via backend...", "var(--gold-text)");
  fetch(API + "/api/analytics/realtime", {
    headers: { "Authorization": "Bearer " + authToken },
    signal: AbortSignal.timeout(8000)
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.activeUsers !== undefined) {
      setRes("Connected! " + d.activeUsers + " active users right now via GA4", "var(--green-text)");
    } else if (d.error) {
      setRes("Error: " + d.error, "var(--red)");
    } else {
      setRes("Connected but no data yet. Add GA4_PROPERTY_ID to Render env vars.", "var(--gold-text)");
    }
  })
  .catch(function() {
    setRes("Backend route not found. Make sure you deployed the latest server.js.", "var(--red)");
  });
}

document.addEventListener("DOMContentLoaded", function() {
  var saved = localStorage.getItem("ga4_property_id");
  var inp = document.getElementById("ga4PropertyIdInput");
  if (saved && inp) inp.value = saved;
});

