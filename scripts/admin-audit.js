// ADMIN-AUDIT.JS
// ─────────────────────────────────────────────
// Extracted from admin.html inline blocks 11, 14, 16, 17, 20 (19 Aug 2026, Manus SEO pass).
// Order inside each file follows the original document order.

/* ══ block 11 (origin 801185-807869, 6667 B) ══ */
/* ══════════════════════════════════════════════════════════════
   Ozylix ADMIN — Minimal local login status telemetry
   - Stores only bounded status events in the current browser profile
   - Does not collect IP, geo, ISP, precise coordinates, or full UA data
   - Bot heuristics use local browser signals only
   - Central security logging belongs on the backend over HTTPS
══════════════════════════════════════════════════════════════ */

const LOGIN_AUDIT_KEY = 'asc_login_audit';
const LOGIN_AUDIT_MAX = 200;

// Login telemetry is intentionally local and minimal. IP, geo, ISP, precise
// coordinates, and full user-agent data must not be collected in the browser;
// central security logging belongs on the backend over HTTPS.

// ── Bot heuristic score ──────────────────────────────────────
function botScore(ua, ipData) {
  let score = 0;
  const flags = [];
  const u = ua.toLowerCase();

  if (!ua || ua.length < 30) { score += 3; flags.push('very-short-UA'); }
  if (/headless|phantomjs|selenium|puppeteer|playwright|webdriver|bot|crawl|spider|scraper/i.test(ua)) {
    score += 5; flags.push('bot-keyword');
  }
  if (!navigator.languages || navigator.languages.length === 0) { score += 2; flags.push('no-languages'); }
  if (typeof navigator.webdriver !== 'undefined' && navigator.webdriver) { score += 5; flags.push('webdriver=true'); }
  if (!window.chrome && /chrome/i.test(ua)) { score += 2; flags.push('chrome-UA-no-chrome-obj'); }
  if (navigator.hardwareConcurrency < 2) { score += 1; flags.push('low-cpu-cores'); }
  if (ipData && ipData.org && /datacenter|hosting|cloud|aws|goog|azure|linode|digital ocean|ovh|vultr|hetzner/i.test(ipData.org)) {
    score += 3; flags.push('datacenter-IP');
  }

  let label = '✅ Human';
  if (score >= 7) label = '🤖 Likely Bot';
  else if (score >= 4) label = '⚠️ Suspicious';

  return { score, flags, label };
}

// ── Record one login attempt ──────────────────────────────────
async function recordLoginAttempt(username, status) {
  const ua = navigator.userAgent;
  const bot = botScore(ua, null);

  const entry = {
    ts: new Date().toISOString(),
    username,
    status,           // 'success' | 'fail' | 'locked'
    botScore: bot.score,
    botFlags: bot.flags,
    botLabel: bot.label
  };

  // Persist only minimal status telemetry. Strip legacy IP/geo/UA fields from
  // records created by older panel versions before writing the ring buffer.
  let log = [];
  try { log = JSON.parse(localStorage.getItem(LOGIN_AUDIT_KEY) || '[]'); } catch(e) {}
  log = Array.isArray(log) ? log.map(function (old) {
    return { ts: old.ts, username: old.username, status: old.status, botScore: old.botScore, botFlags: old.botFlags, botLabel: old.botLabel };
  }).filter(function (old) { return old.ts && old.status; }) : [];
  log.unshift(entry);
  if (log.length > LOGIN_AUDIT_MAX) log = log.slice(0, LOGIN_AUDIT_MAX);
  localStorage.setItem(LOGIN_AUDIT_KEY, JSON.stringify(log));

  renderLoginAudit();
  return entry;
}

// ── Render the login audit table ─────────────────────────────
function renderLoginAudit() {
  const tbody = document.getElementById('loginAuditTbody');
  const countEl = document.getElementById('loginAuditCount');
  if (!tbody) return;

  // Owner-only data: don't populate the table for non-owner roles, even if the
  // card's CSS were somehow bypassed. The real boundary should also be enforced
  // server-side wherever this log is persisted centrally.
  const role = sessionStorage.getItem('ascovita_role') || 'admin';
  if (role !== 'owner') {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state" style="padding:24px;text-align:center;color:var(--text3)">🔒 Owner access only.</td></tr>';
    if (countEl) countEl.textContent = '';
    return;
  }

  let log = [];
  try { log = JSON.parse(localStorage.getItem(LOGIN_AUDIT_KEY) || '[]'); } catch(e) {}

  if (countEl) countEl.textContent = log.length + ' record' + (log.length !== 1 ? 's' : '');

  if (!log.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state" style="padding:24px;text-align:center;color:var(--text3)">No login attempts recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = log.map(e => {
    const statusBadge = e.status === 'success'
      ? '<span class="badge badge-green">✓ Success</span>'
      : e.status === 'locked'
        ? '<span class="badge badge-red">🔒 Locked</span>'
        : '<span class="badge badge-red">✗ Failed</span>';

    return `<tr>
      <td style="font-size:0.72rem;white-space:nowrap;color:var(--text3)">${new Date(e.ts).toLocaleString('en-IN')}</td>
      <td><code style="font-size:0.8rem">${e.username || '-'}</code></td>
      <td>${statusBadge}</td>
      <td style="font-size:0.75rem;color:var(--text3)">Not stored in browser</td>
      <td style="font-size:0.75rem;color:var(--text3)">Server audit required</td>
    </tr>`;
  }).join('');
}

// ── Clear log ────────────────────────────────────────────────
function clearLoginAudit() {
  if (!confirm('Clear all login audit records? This cannot be undone.')) return;
  localStorage.removeItem(LOGIN_AUDIT_KEY);
  renderLoginAudit();
}

// ── Patch doLogin to capture IP on attempt ───────────────────
const _origDoLogin = doLogin;
window.doLogin = async function() {
  const username = document.getElementById('loginUser')?.value?.trim() || 'unknown';
  // We call the original and intercept success/fail via a wrapper
  let loginOk = false;
  const origToken = authToken;
  await _origDoLogin();
  loginOk = authToken && authToken !== origToken;
  // Record async — don't block login UI
  recordLoginAttempt(username, loginOk ? 'success' : 'fail');
};

// ── Also render any stored log when the Audit tab opens ─────
document.addEventListener('DOMContentLoaded', function() {
  // Intercept tab switch to render audit on open
  const origSwitchTab = window.switchTab;
  if (origSwitchTab) {
    window.switchTab = function(page, tab, btn) {
      origSwitchTab(page, tab, btn);
      if (tab === 'audit') renderLoginAudit();
    };
  }
  renderLoginAudit();
});


/* ══ block 14 (origin 837837-857732, 19878 B) ══ */
const AUDIT_API_BASE = '/api/admin/audit';
let acCurrentRange = 7;
let _acTrendChart = null;

async function auditApi(path, options = {}) {
  const res = await apiFetch(`${AUDIT_API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

const AC_PIPELINE_STAGES = ['DETECT', 'PROVE', 'PRIORITIZE', 'RECOMMEND', 'TEST', 'APPROVE', 'FIX', 'VERIFY', 'MONITOR'];
const AC_CATEGORY_LABELS = { security: 'Security', fraud: 'Fraud', code: 'Code', checkout: 'Checkout', database: 'Database', performance: 'Performance', ux: 'UX', seo: 'SEO' };
const AC_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

// Severity -> this file's own badge classes (see "═══ BADGES ═══" in <head>).
// HIGH has no dedicated badge-* class in the base stylesheet, so it's the
// one severity styled inline with the existing --orange token instead.
function acSeverityBadge(sev, extraStyle) {
  const map = { CRITICAL: 'badge-red', MEDIUM: 'badge-gold', LOW: 'badge-blue', INFO: 'badge-gray' };
  if (sev === 'HIGH') return `<span class="badge" style="background:rgba(182,91,30,0.15);color:var(--orange);${extraStyle||''}">HIGH</span>`;
  return `<span class="badge ${map[sev] || 'badge-gray'}" style="${extraStyle||''}">${sev}</span>`;
}

// Score -> this file's own color tokens (green/gold/red), same thresholds
// used everywhere else in this dashboard for "good/ok/bad".
function acScoreColor(score) {
  if (score >= 90) return '#547177';  // var(--green)
  if (score >= 70) return '#A97A1E';  // var(--gold)
  return '#C2434F';                    // var(--red)
}
function acScoreColorVar(score) {
  if (score >= 90) return 'var(--green-text)';
  if (score >= 70) return 'var(--gold-text)';
  return 'var(--red)';
}

function renderPipeline(stageData) {
  const stage = (stageData && stageData.stage) || 'MONITOR';
  document.getElementById('acPipelineDetail').textContent = (stageData && stageData.detail) || 'Status unavailable';
  document.getElementById('acSteps').innerHTML = AC_PIPELINE_STAGES.map((s, i) => `
    <span class="badge ${s === stage ? 'badge-green' : 'badge-gray'}">${s}</span>${i < AC_PIPELINE_STAGES.length - 1 ? '<span style="color:var(--border2);font-size:0.75rem;">→</span>' : ''}
  `).join('');
}

// Clickable severity tiles (new in v9.4): open counts open the drill-down
// modal listing open findings with resolve controls. Counts are stored on
// the row so the drill-down can filter without a second request for the
// same severity.
function renderSeverityRow(findings) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  findings.forEach(f => { counts[f.severity] = (counts[f.severity] || 0) + 1; });
  const icons = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵', INFO: '⚪' };
  const colors = { CRITICAL: 'var(--red)', HIGH: 'var(--orange)', MEDIUM: 'var(--gold-text)', LOW: 'var(--blue)', INFO: 'var(--text3)' };
  document.getElementById('acSeverityRow').innerHTML = AC_SEVERITIES.map(sev => `
    <div class="kpi" style="cursor:pointer;" onclick="auditDrillDown('${sev}')" title="Open ${sev} findings — click for details">
      <div class="kpi-label">${sev}</div>
      <div class="kpi-val" style="color:${colors[sev]}">${counts[sev]}</div>
      <span class="kpi-ico">${icons[sev]}</span>
      ${counts[sev] === 0 ? '<div class="badge badge-green" style="margin-top:8px;">✓ Clear</div>' : '<div style="margin-top:8px;font-size:0.62rem;color:var(--text3);">click →</div>'}
    </div>
  `).join('');
  window.__acOpenFindings = findings || [];
}

function renderCategories(scores) {
  const el = document.getElementById('acCategories');
  if (!scores) { el.innerHTML = '<div style="color:var(--text3);font-size:0.85rem;padding:16px 0;grid-column:1/-1;text-align:center;">No completed run yet.</div>'; return; }
  el.innerHTML = Object.entries(AC_CATEGORY_LABELS).map(([key, label]) => `
    <div class="card" style="text-align:center;padding:16px 10px;">
      <canvas id="acRing-${key}" style="width:70px;height:70px;display:inline-block;"></canvas>
      <div style="font-size:0.72rem;color:var(--text3);margin-top:6px;">${label}</div>
    </div>
  `).join('');
  // Reuses this file's own drawRing(canvasId, pct, color, label) helper —
  // the exact same one the Performance page uses for its conversion rings.
  for (const [key, label] of Object.entries(AC_CATEGORY_LABELS)) {
    const score = scores[key] ?? 100;
    if (typeof drawRing === 'function') drawRing(`acRing-${key}`, score, acScoreColor(score), label);
  }
}

function renderTrendChart(series) {
  const canvas = document.getElementById('acTrendCanvas');
  const emptyEl = document.getElementById('acTrendEmpty');
  const points = series.filter(d => d.overall_health_score !== null);
  if (points.length < 2) {
    canvas.style.display = 'none';
    emptyEl.style.display = 'block';
    emptyEl.textContent = 'Not enough completed runs yet in this range to draw a trend.';
    return;
  }
  canvas.style.display = 'block';
  emptyEl.style.display = 'none';

  if (_acTrendChart) _acTrendChart.destroy();
  _acTrendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: points.map(p => p.date.slice(5)),
      datasets: [{
        label: 'Overall Health',
        data: points.map(p => p.overall_health_score),
        borderColor: '#547177',
        backgroundColor: 'rgba(84,113,119,0.12)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#547177',
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, ticks: { color: '#5C6A5D', font: { family: 'DM Sans', size: 10 } }, grid: { color: 'rgba(84,113,119,0.1)' } },
        x: { ticks: { color: '#5C6A5D', font: { family: 'DM Sans', size: 10 } }, grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function renderRepoSummary(repoGroups) {
  const el = document.getElementById('acRepoSummary');
  if (!repoGroups.length) { el.innerHTML = '<div style="color:var(--text3);font-size:0.85rem;padding:16px 0;text-align:center;">No open findings 🎉 — nothing needs improvement right now.</div>'; return; }
  el.innerHTML = repoGroups.map(r => `
    <div style="margin-bottom:18px;">
      <div style="font-family:var(--mono);font-size:0.85rem;font-weight:700;color:var(--text);margin-bottom:8px;display:flex;align-items:center;gap:8px;">
        📦 ${r.repo} <span style="font-size:0.72rem;color:var(--text3);font-weight:400;">${r.findingCount} finding(s) across ${r.fileCount} file(s)</span>
      </div>
      ${r.files.map(f => `
        <div style="border-left:2px solid var(--border);margin-left:6px;padding-left:14px;margin-bottom:10px;">
          <div style="font-family:var(--mono);font-size:0.78rem;color:var(--text3);margin-bottom:6px;">${f.file}</div>
          ${f.findings.map(finding => `
            <div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--border);font-size:0.85rem;">
              ${acSeverityBadge(finding.severity, 'margin-top:2px;flex-shrink:0;')}
              <div>
                <div style="color:var(--text);">${finding.title}</div>
                ${finding.recommended_fix ? `<div style="color:var(--text3);font-size:0.78rem;margin-top:2px;">Fix: ${finding.recommended_fix}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `).join('');
}

// Clickable run rows (new in v9.4): open the run-detail modal with the
// full score breakdown and a before/after comparison against the run just
// before it.
function renderRuns(runs) {
  const body = document.getElementById('acRunsBody');
  if (!runs.length) { body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);">No runs yet.</td></tr>'; return; }
  body.innerHTML = runs.map(r => `
    <tr style="cursor:pointer;" onclick="auditShowRun('${r.id}')">
      <td class="td-id">${new Date(r.started_at).toLocaleString()}</td>
      <td>${r.run_type}</td>
      <td>${r.trigger_source}</td>
      <td><span class="badge ${r.status === 'completed' ? 'badge-green' : r.status === 'failed' ? 'badge-red' : 'badge-gray'}">${r.status}</span></td>
      <td style="font-family:var(--mono);color:${r.overall_health_score != null ? acScoreColorVar(r.overall_health_score) : 'inherit'}">${r.overall_health_score ?? '—'}</td>
    </tr>`).join('');
  window.__acRecentRuns = runs || [];
}

async function auditSetRange(days) {
  acCurrentRange = days;
  document.querySelectorAll('#acFilterGroup .tab-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.days) === days));
  try {
    const trend = await auditApi(`/trends?days=${days}`);
    renderTrendChart(trend.series);
  } catch (err) {
    document.getElementById('acTrendCanvas').style.display = 'none';
    const emptyEl = document.getElementById('acTrendEmpty');
    emptyEl.style.display = 'block';
    emptyEl.textContent = `Could not load trend: ${err.message}`;
  }
}

async function auditRefresh() {
  const statusEl = document.getElementById('acConnStatus');
  if (!statusEl) return; // page not in DOM yet
  statusEl.textContent = 'loading…';
  statusEl.className = 'badge badge-gray';
  try {
    const [latest, findings, repoSummary, runs, pipeline] = await Promise.all([
      auditApi('/health-scores/latest'),
      auditApi('/findings?status=open'),
      auditApi('/repo-summary'),
      auditApi('/runs?limit=10'),
      auditApi('/pipeline-status'),
    ]);
    renderPipeline(pipeline);
    renderSeverityRow(findings);
    renderCategories(latest.scores);
    renderRepoSummary(repoSummary);
    renderRuns(runs);
    renderHealthHero(latest, latest); // hero shows score; compare fetched below
    try {
      const trend = await auditApi('/trends?days=30');
      const series = (trend && trend.series) || [];
      const prev = series.filter(p => p.overall_health_score !== null).slice(0, 2);
      if (prev.length >= 2) renderHealthHero(prev[0], prev[1]);
    } catch (_) { /* hero already rendered with latest data */ }
    await auditSetRange(acCurrentRange);
    statusEl.textContent = 'connected';
    statusEl.className = 'badge badge-green';
  } catch (err) {
    statusEl.textContent = `disconnected`;
    statusEl.className = 'badge badge-red';
    console.error(err);
  }
}

async function auditRun(action) {
  try {
    const result = await auditApi(`/run/${action}`, { method: 'POST' });
    await auditRefresh();
    alert(`Audit complete — overall health ${result.overall}, ${result.newFindingCount} new finding(s).`);
  } catch (err) {
    alert(`Audit failed: ${err.message}`);
  }
}

// ── v9.4 additions: health hero card, severity drill-down, run detail,
//    finding resolution workflow, and 5-minute auto-refresh. Everything
//    below chains onto the functions defined above without touching them. ──
let acAutoRefreshTimer = null;

function renderHealthHero(latest, previous) {
  const score = (latest && latest.overall_health_score) ?? null;
  const ring = document.getElementById('acHeroRing');
  const scoreEl = document.getElementById('acHeroScore');
  const deltaEl = document.getElementById('acHeroDelta');
  const noteEl = document.getElementById('acHeroNote');
  if (!score && score !== 0) {
    scoreEl.textContent = '—';
    deltaEl.textContent = 'No completed run yet — run the first audit to see health.';
    noteEl.textContent = 'The full audit checks security posture, code quality, database health, checkout/payment integrity, and UX.';
    return;
  }
  scoreEl.textContent = Math.round(score);
  scoreEl.style.color = acScoreColorVar(score);
  if (ring && typeof drawRing === 'function') drawRing('acHeroRing', score, acScoreColor(score), 'Health');
  if (latest && previous && typeof previous.overall_health_score === 'number') {
    const delta = Math.round((latest.overall_health_score - previous.overall_health_score) * 10) / 10;
    const arrow = delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '– ';
    const color = delta > 0 ? 'var(--green-text)' : delta < 0 ? 'var(--red)' : 'var(--text3)';
    deltaEl.innerHTML = `<span style="color:${color};font-weight:700;">${arrow}${Math.abs(delta)}</span> vs previous run (${new Date(previous.finished_at).toLocaleDateString('en-IN')})`;
  } else {
    deltaEl.textContent = latest && latest.finished_at ? 'As of ' + new Date(latest.finished_at).toLocaleString('en-IN') : '';
  }
  const open = (window.__acOpenFindings || []).length;
  noteEl.textContent = open === 0
    ? '🎉 No open findings right now. The pipeline re-scans automatically on the scheduler and you can also trigger any audit type from the buttons above.'
    : `${open} open finding${open === 1 ? '' : 's'} to review — click a severity tile above to triage them (mark fixed, accept risk, or dismiss as false positive).`;
}

async function auditDrillDown(severity) {
  const findings = (window.__acOpenFindings || []).filter(f => f.severity === severity);
  document.getElementById('auditSevModalTitle').textContent = `Open ${severity} Findings${findings.length ? ' — ' + findings.length : ''}`;
  const body = document.getElementById('auditSevModalBody');
  if (!findings.length) {
    body.innerHTML = `<div style="padding:18px;text-align:center;color:var(--text3);">✓ No open ${severity} findings right now.</div>`;
    openModal('auditSevModal');
    return;
  }
  body.innerHTML = findings.map(f => `
    <div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
        <div style="flex:1 1 260px;">
          ${acSeverityBadge(f.severity)}
          <strong style="margin-left:8px;">${mktEsc ? mktEsc(f.title) : (f.title||'')}</strong>
          ${f.repo ? `<div style="font-family:var(--mono);font-size:0.72rem;color:var(--text3);margin-top:3px;">${mktEsc ? mktEsc(f.repo) : f.repo}${f.file ? ' → ' + (mktEsc ? mktEsc(f.file) : f.file) : ''}</div>` : ''}
          ${f.recommended_fix ? `<div style="font-size:0.8rem;color:var(--text2);margin-top:6px;line-height:1.5;">Fix: ${mktEsc ? mktEsc(f.recommended_fix) : f.recommended_fix}</div>` : ''}
          ${f.description ? `<div style="font-size:0.76rem;color:var(--text3);margin-top:4px;line-height:1.5;">${mktEsc ? mktEsc(String(f.description).slice(0, 300)) : String(f.description||'').slice(0, 300)}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
          <button class="btn btn-secondary btn-sm" onclick="auditResolveFinding('${f.id}','fixed','✓ Mark Fixed')">✓ Mark Fixed</button>
          <button class="btn btn-secondary btn-sm" onclick="auditResolveFinding('${f.id}','accepted_risk','⚠️ Accept Risk')">⚠️ Accept Risk</button>
          <button class="btn btn-secondary btn-sm" onclick="auditResolveFinding('${f.id}','false_positive','🚫 False Positive')">🚫 False Positive</button>
        </div>
      </div>
    </div>
  `).join('');
  openModal('auditSevModal');
}

async function auditResolveFinding(id, status, label) {
  const note = status === 'accepted_risk' ? prompt('Optional note explaining why this is an accepted risk:') : undefined;
  if (note === null) return;
  try {
    await auditApi(`/findings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note: note || undefined }) });
    toast(`Finding ${label.toLowerCase()}`);
    closeModal('auditSevModal');
    await auditRefresh();
  } catch (err) { toast('⚠️ Could not update finding: ' + err.message); }
}

async function auditShowRun(runId) {
  document.getElementById('auditRunModalTitle').textContent = 'Run Detail';
  const body = document.getElementById('auditRunModalBody');
  body.innerHTML = '<div class="empty-state loading-dots">Loading…</div>';
  openModal('auditRunModal');
  try {
    const [run, prevRun] = await Promise.all([
      auditApi(`/runs/${runId}`),
      (async () => {
        try {
          const runs = await auditApi('/runs?limit=20');
          const idx = runs.findIndex(r => r.id === runId);
          // The run started just before this one (runs are newest-first).
          const prev = runs.slice(idx + 1).find(r => r.status === 'completed' && r.overall_health_score != null);
          return prev || null;
        } catch (_) { return null; }
      })(),
    ]);
    const score = run.overall_health_score;
    let deltaHtml = '';
    if (prevRun) {
      const d = Math.round(((score ?? 0) - prevRun.overall_health_score) * 10) / 10;
      const color = d > 0 ? 'var(--green-text)' : d < 0 ? 'var(--red)' : 'var(--text3)';
      deltaHtml = `<div style="font-size:0.78rem;color:var(--text3);margin-top:2px;">vs run ${new Date(prevRun.started_at).toLocaleString('en-IN')}: <span style="font-weight:700;color:${color};">${d > 0 ? '+' : ''}${d} points</span></div>`;
    }
    const cats = run.scores || {};
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
        <strong style="font-family:var(--mono);font-size:2rem;color:${score != null ? acScoreColorVar(score) : 'inherit'};">${score ?? '—'}</strong>
        <div>
          <div style="font-size:0.85rem;color:var(--text);">${run.run_type} audit · <span class="badge ${run.status === 'completed' ? 'badge-green' : run.status === 'failed' ? 'badge-red' : 'badge-gray'}">${run.status}</span></div>
          <div style="font-size:0.72rem;color:var(--text3);">Triggered by ${run.trigger_source} · started ${new Date(run.started_at).toLocaleString('en-IN')}${run.finished_at ? ' · finished ' + new Date(run.finished_at).toLocaleString('en-IN') : ''}</div>
          ${deltaHtml}
        </div>
      </div>
      <div style="font-size:0.72rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Category Scores</div>
      <div class="grid-4">
        ${Object.entries(AC_CATEGORY_LABELS).map(([key, label]) => `
          <div style="border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center;">
            <div style="font-size:0.95rem;font-weight:800;font-family:var(--mono);color:${cats[key] != null ? acScoreColorVar(cats[key]) : 'var(--text3)'}">${cats[key] ?? '—'}</div>
            <div style="font-size:0.68rem;color:var(--text3);margin-top:2px;">${label}</div>
          </div>`).join('')}
      </div>
      ${run.summary ? `<div style="font-size:0.8rem;color:var(--text2);margin-top:14px;line-height:1.6;">${mktEsc ? mktEsc(run.summary) : run.summary}</div>` : ''}
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:var(--red);padding:16px;">Could not load run: ${err.message}</div>`;
  }
}

function auditAutoRefreshTick() {
  clearTimeout(acAutoRefreshTimer);
  acAutoRefreshTimer = setTimeout(() => {
    if (document.getElementById('page-auditdebugger')?.style.display !== 'none' || document.location.hash.includes('auditdebugger')) {
      auditRefresh().finally(() => auditAutoRefreshTick());
    } else {
      auditAutoRefreshTick();
    }
  }, 5 * 60 * 1000);
}

// Patch showPage (chains onto every previous patch above, same pattern the
// marketing and bottom-nav features already use in this file) so opening
// the Audit / Debugger tab loads live data automatically.
const _auditOrigShowPage = window.showPage;
if (typeof _auditOrigShowPage === 'function') {
  window.showPage = function (name) {
    _auditOrigShowPage(name);
    if (name === 'auditdebugger') { auditRefresh(); auditAutoRefreshTick(); }
  };
}


/* ══ block 16 (origin 859899-868175, 8259 B) ══ */
(function () {
  if (window.__unifiedPulse) return;
  window.__unifiedPulse = true;

  var AUDIT_API_BASE = '/api/admin/audit';
  var _pulseCharts = {};

  function upMoney(n) {
    if (n === null || n === undefined) return '—';
    return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
  function upRoas(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(2) + 'x';
  }
  function upEsc(s) { return (s || '').toString().replace(/[&<>]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]); }); }

  // Marketing pulse card — verdict pills colored like the marketing page's.
  function renderMarketingPulse(s) {
    var row = document.getElementById('unifiedPulseRow');
    if (!row) return;
    var report = (s && s.report) || {};
    var strategy = s && s.strategy;
    var verdicts = report.verdicts || {};
    var verdictHtml = [
      '<span class="badge" style="background:rgba(94,171,48,.14);color:#2d5a2d;font-weight:700;">▲ ' + (verdicts.scale || 0) + ' scaling</span>',
      '<span class="badge" style="background:rgba(194,67,79,.12);color:#963848;font-weight:700;">▼ ' + (verdicts.pause || 0) + ' paused</span>',
      '<span class="badge badge-gray">◆ ' + (verdicts.hold || 0) + ' held</span>',
    ].join(' ');

    var card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'flex:1;min-width:280px;padding:0;overflow:hidden;';
    card.innerHTML =
      '<div class="card-hdr"><span class="card-title">📣 Marketing Automation</span>' +
      '<span class="badge badge-green" style="font-size:.68rem;">live</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:12px 18px;">' +
      '<div><div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">Spend · latest pull</div><div style="font-size:1.35rem;font-weight:800;">' + upMoney(report.total_spend) + '</div></div>' +
      '<div><div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">Blended ROAS</div><div style="font-size:1.35rem;font-weight:800;color:var(--green-text);">' + upRoas(report.blended_roas) + '</div></div>' +
      '<div><div style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">Blended CPA</div><div style="font-size:1.35rem;font-weight:800;">' + upMoney(report.blended_cpa) + '</div></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:0 18px 12px;">' + verdictHtml + '</div>' +
      '<div style="border-top:1px solid var(--border);font-size:.75rem;color:var(--text3);padding:8px 18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
      (strategy ? '📌 ' + upEsc(strategy.month || '—') + (strategy.title ? ' · ' + upEsc(strategy.title) : '') : '📌 No strategy set yet — create one on the Marketing page') +
      (report.active_ad_sets !== undefined ? ' · ' + (report.active_ad_sets || 0) + ' active ad set(s)' : '') +
      '</div>';
    row.appendChild(card);
  }

  // Audit health card — overall score ring + open CRITICAL/HIGH counts.
  function renderAuditPulse(latest, openFindings) {
    var row = document.getElementById('unifiedPulseRow');
    if (!row) return;
    var score = (latest && latest.overall_health_score != null) ? latest.overall_health_score : null;
    var scoreColor = score === null ? '#9aa5a8' : (score >= 90 ? 'var(--green)' : score >= 70 ? '#A97A1E' : 'var(--red)');
    var counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    (openFindings || []).forEach(function (f) { if (counts[f.severity] !== undefined) counts[f.severity] += 1; });
    var openBad = counts.CRITICAL + counts.HIGH;

    var card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'flex:1;min-width:280px;padding:0;overflow:hidden;';
    card.innerHTML =
      '<div class="card-hdr"><span class="card-title">🛡️ Platform Audit</span>' +
      (score !== null ? '<span class="badge" style="background:' + (score >= 90 ? 'rgba(94,171,48,.14)' : score >= 70 ? 'rgba(182,91,30,.15)' : 'rgba(194,67,79,.14)') + ';color:' + (score >= 90 ? '#2d5a2d' : score >= 70 ? 'var(--orange)' : '#963848') + ';font-weight:700;font-size:.68rem;">score ' + Math.round(score) + '</span>' : '<span class="badge badge-gray" style="font-size:.68rem;">no runs yet</span>') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:14px;padding:8px 18px;flex-wrap:wrap;">' +
      '<canvas id="upAuditRing" width="72" height="72" style="width:72px;height:72px;flex-shrink:0;"></canvas>' +
      '<div style="flex:1;min-width:160px;">' +
      '<div style="font-size:.78rem;margin-bottom:5px;"><span style="color:var(--red);font-weight:700;">🔴 ' + counts.CRITICAL + ' critical</span> · <span style="color:var(--orange);font-weight:700;">🟠 ' + counts.HIGH + ' high</span></div>' +
      '<div style="font-size:.78rem;margin-bottom:5px;"><span style="color:var(--gold-text);font-weight:700;">🟡 ' + counts.MEDIUM + ' medium</span> · <span style="color:var(--blue);font-weight:700;">🔵 ' + counts.LOW + ' low</span></div>' +
      (openBad > 0
        ? '<div style="font-size:.72rem;color:var(--red);font-weight:700;">⚠ ' + openBad + ' open finding(s) need action → Audit / Debugger</div>'
        : '<div style="font-size:.72rem;color:var(--green-text);font-weight:700;">✓ No critical/high findings open</div>') +
      '</div></div>';
    row.appendChild(card);

    // Draw the ring right away — drawRing() lives higher in this file.
    setTimeout(function () {
      if (typeof drawRing === 'function') drawRing('upAuditRing', score !== null ? score : 0, scoreColor, '');
    }, 50);
  }

  // One coordinated refresh of both cards; each service fails independently.
  async function refreshUnifiedPulse() {
    var row = document.getElementById('unifiedPulseRow');
    if (!row) return; // user is on a different page — nothing to render
    row.innerHTML = '<div class="kpi skel" style="height:132px;flex:1;"></div><div class="kpi skel" style="height:132px;flex:1;"></div>';
    var timeoutMs = 12000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs);

    var marketingPromise = fetch(window.MARKETING_BACKEND_URL + '/api/reports/status', { signal: ctrl.signal })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

    var auditPromise = apiFetch(AUDIT_API_BASE + '/health-scores/latest', {
      signal: ctrl.signal,
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

    var findingsPromise = apiFetch(AUDIT_API_BASE + '/findings?status=open', {
      signal: ctrl.signal,
    })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });

    var results = await Promise.all([marketingPromise, auditPromise, findingsPromise]);
    clearTimeout(timer);

    row.innerHTML = '';
    if (results[0]) renderMarketingPulse(results[0]);
    if (results[1] || results[2].length) renderAuditPulse(results[1], results[2]);
    if (!row.children.length) row.style.display = 'none';
  }

  // Hook into the dashboard loader so the pulse refreshes with every
  // dashboard load, and onto showPage for instant updates when returning.
  var _origLoadDashboard = window.loadDashboard;
  if (typeof _origLoadDashboard === 'function') {
    window.loadDashboard = async function () {
      await _origLoadDashboard();
      refreshUnifiedPulse();
    };
  } else {
    document.addEventListener('DOMContentLoaded', refreshUnifiedPulse);
  }

  // Light refresh every 5 minutes while the dashboard is visible.
  var _origShowPage2 = window.showPage;
  if (typeof _origShowPage2 === 'function') {
    window.showPage = function (name) {
      _origShowPage2(name);
      if (name === 'dashboard') refreshUnifiedPulse();
    };
  }
  setInterval(refreshUnifiedPulse, 5 * 60 * 1000);
})();


/* ══ block 17 (origin 876533-895074, 18524 B) ══ */
/* ══════════════════════════════════════════════════════════════════════
   1. IDLE + ABSOLUTE SESSION TIMEOUT
   Staff tokens now expire server-side after 1 hour. The UI has to agree,
   or the panel sits there looking signed in while every call 401s.
   Two independent clocks:
     • idle   — 60 min with no interaction, 2-minute warning first
     • absolute — the token's own exp, which cannot be extended by activity
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__azSession) return;
  window.__azSession = true;

  var IDLE_MS  = 60 * 60 * 1000;   // 60 minutes of inactivity
  var WARN_MS  = 2 * 60 * 1000;    // warn for the last 2 minutes
  var lastAct  = Date.now();
  /* Mobile Safari puts backgrounded tabs to sleep and throttles timers;
     when the phone wakes, Date.now() has jumped by minutes or hours and
     a naïve tick() would compute idleLeft <= 0 and sign the admin out
     instantly on wake-up — the classic "signed in, bounced immediately"
     loop on phones. The foreground clamp makes sleep time invisible:
     the idle clock resumes as if the phone had never been put down. */
  document.addEventListener('visibilitychange', function () {
    /* Foreground clamp: sleep time is invisible to the idle clock.
       The tick() below also re-evaluates the absolute (token) clock, so a
       genuinely expired session is still caught the moment the phone wakes. */
    if (!document.hidden) { lastAct = Date.now(); tick(); }
  });
  var warning  = false;
  /* Which clock raised the warning. Activity can dismiss an IDLE warning —
     that's the whole point of it. It must NOT dismiss an ABSOLUTE-expiry
     warning: the token is running out regardless of how much you move the
     mouse, so hiding it would drop the person out with no notice at all. */
  var warnKind = null;
  var tickRef  = null;

  function tokenExp() {
    try {
      var t = sessionStorage.getItem('ascovita_token');
      if (!t) return 0;
      // JWT payloads are base64URL (- and _, no padding), not plain base64
      // (+ and /, padded). atob() on a raw JWT segment can throw — or on
      // some inputs silently decode the wrong bytes — whenever the payload
      // happens to contain a run that differs between the two alphabets.
      // That corrupted/zero exp was read as "already expired", which is
      // indistinguishable from a real 2-minute session to whoever is
      // looking at the clock. Normalise to standard base64 first.
      var b64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return (JSON.parse(atob(b64)).exp || 0) * 1000;
    } catch (e) { return 0; }
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  window.azStaySignedIn = function () {
    lastAct = Date.now();
    hideWarn();
    /* Activity resets the idle clock but cannot extend the token. If the
       server-side hour is nearly up, refresh it by re-authenticating rather
       than leaving the user on a token that is about to start 401ing. */
    var left = tokenExp() - Date.now();
    if (left > 0 && left < 5 * 60 * 1000) {
      alert('Your 1-hour session is almost over. Please sign in again to continue.');
      doLogout();
    }
  };

  function showWarn(kind) {
    warning = true;
    warnKind = kind;
    var m = document.getElementById('azIdleModal');
    if (m) m.classList.add('show');
    var why = document.getElementById('azIdleWhy');
    if (why) {
      why.textContent = kind === 'expiry'
        ? 'Your 1-hour session is ending. Sign in again to continue — staying active will not extend it.'
        : "You'll be signed out automatically after 60 minutes of inactivity.";
    }
    var keep = document.getElementById('azIdleKeep');
    if (keep) keep.style.display = (kind === 'expiry') ? 'none' : 'block';
  }
  function hideWarn() {
    warning = false;
    warnKind = null;
    var m = document.getElementById('azIdleModal');
    if (m) m.classList.remove('show');
  }

  function tick() {
    if (!sessionStorage.getItem('ascovita_token')) return;

    var idleLeft = IDLE_MS - (Date.now() - lastAct);
    var exp      = tokenExp();
    var absLeft  = exp ? exp - Date.now() : Infinity;

    // Whichever runs out first wins.
    var left = Math.min(idleLeft, absLeft);

    if (left <= 0) {
      hideWarn();
      try { localStorage.setItem('ascovita_logout_reason', absLeft <= 0 ? 'expired' : 'idle'); } catch (e) {}
      doLogout();
      /* doLogout() swaps the panel for the login screen in place — it does
         not reload — so the DOMContentLoaded handler below has long since
         run. Show the reason now, or the person is dropped back to a blank
         login form with no idea why. */
      showLogoutReason();
      return;
    }

    if (left <= WARN_MS) {
      if (!warning) showWarn(absLeft <= idleLeft ? 'expiry' : 'idle');
      var c = document.getElementById('azIdleCount');
      if (c) c.textContent = fmt(left);
    } else if (warning) {
      hideWarn();
    }

    var pill = document.getElementById('azSessionPill');
    if (pill && exp) {
      pill.textContent = '⏱ ' + fmt(absLeft);
      pill.classList.toggle('warn', absLeft < 5 * 60 * 1000);
    }
  }

  ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      lastAct = Date.now();
      if (warning && warnKind === 'idle') hideWarn();
    }, { passive: true, capture: true });
  });

  /* setInterval alone is unreliable — a backgrounded tab throttles it, and a
     laptop that sleeps for two hours would wake up still "signed in". The
     visibility check re-evaluates the moment the tab comes back. */
  window.__azTick = tick;   // so applyRole can refresh the pill immediately
  tickRef = setInterval(tick, 1000);
  tick();

  /* Signing out in one tab should sign out every tab. */
  window.addEventListener('storage', function (e) {
    if (e.key === 'ascovita_token' && !e.newValue) location.reload();
  });

  /* Explain why they were kicked out — both on a fresh page load and
     immediately after an in-place logout. */
  function showLogoutReason() {
    var why = localStorage.getItem('ascovita_logout_reason');
    if (!why) return;
    localStorage.removeItem('ascovita_logout_reason');
    var err = document.getElementById('loginError');
    if (err) {
      err.style.display = 'block';
      /* Reset the "backend is starting up" styling wakeServer() may have
         left on this same element, or the message renders green-on-green
         as if it were a progress note rather than the reason you are out. */
      err.style.background = '';
      err.style.color = '';
      err.textContent =
        why === 'idle'     ? 'Signed out after 60 minutes of inactivity. Please sign in again.' :
        why === 'invalid-signature' ? 'The server could not verify this session’s signature — this usually means the JWT_SECRET environment variable on Render was changed or reset. Ask the developer to re-set the same JWT_SECRET in Render and restart the service, then sign in again.' :
        why === 'token-version-mismatch' ? 'The server says this session was deliberately revoked. Sign in again — if it repeats, the owner has suspended or reset this account.' :
        why === 'rejected' ? 'The server rejected your session. Sign in again — the server now auto-heals freshly minted tokens (v9.4.1+), so a bounce straight after signing in should not repeat; if it still does, check that this device’s clock is correct.'
                           : 'Your 1-hour session expired. Please sign in again.';
    }
  }
  window.showLogoutReason = showLogoutReason;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showLogoutReason);
  } else {
    showLogoutReason();
  }
})();

/* ══════════════════════════════════════════════════════════════════════
   2. ROLE-AWARE UI
   Reads /api/admin/me, which returns the SAME permission list the API
   guards use. So a button is only ever hidden when the server would
   genuinely refuse the action — the UI can't drift from the rules.

   This is presentation only. The real boundary is server-side: every
   owner-only route 403s for an admin token no matter what this file does.
   ══════════════════════════════════════════════════════════════════════ */
window.AZPerms = { role: null, list: [], loaded: false };

window.azCan = function (perm) {
  if (!window.AZPerms.loaded) return true;   // don't grey things out before we know
  return window.AZPerms.list.indexOf(perm) !== -1;
};

/* Which permission each part of the panel needs. Selector -> permission. */
var AZ_UI_PERMS = [
  ['[onclick*="deleteProduct"]',      'products.delete'],
  ['[onclick*="deleteOrder"]',        'orders.delete'],
  ['[onclick*="deleteCustomer"]',     'customers.delete'],
  ['[onclick*="manualRefund"]',       'orders.refund'],
  ['[onclick*="refundOrder"]',        'orders.refund'],
  ['[onclick*="saveCoupon"]',         'coupons.manage'],
  ['[onclick*="deleteCoupon"]',       'coupons.manage'],
  ['[onclick*="addCoupon"]',          'coupons.manage'],
  ['[onclick*="saveSettings"]',       'settings.manage'],
  ['[onclick*="syncProducts"]',       'system.maintenance'],
  ['[onclick*="sendWhatsapp"]',       'whatsapp.send'],
  ['[onclick*="sendReport"]',         'whatsapp.send'],
  ['[onclick*="testEmail"]',          'system.maintenance'],
  ['[onclick*="revokeTokens"]',       'tokens.revoke'],
  ['#navCoupons',                     'coupons.manage'],
  ['#navSettings',                    'settings.manage'],
  ['#navAuditLog',                    'audit.view'],
  ['#navMarketing',                   'marketing.manage'],
  ['#moreCoupons',                    'coupons.manage'],
  ['#moreSettings',                   'settings.manage'],
];

function azApplyPermsToDOM() {
  /* SELF-HEALING: this must be safe to run at any time, in any order. If the
     role or permission set has CHANGED since the last run (e.g. the user
     logged in as a different account, or the server came back after a
     timeout), elements that were hidden earlier MUST come back — previously
     an inline `display:none` was permanent and the only escape was a page
     refresh. */
  var isOwner = window.AZPerms.loaded && window.AZPerms.role === 'owner';
  AZ_UI_PERMS.forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (el) {
      var permitted = isOwner || window.azCan(pair[1]);
      if (!permitted) {
        el.dataset.azPerm = pair[1];
        if (pair[0].charAt(0) === '#') { el.style.display = 'none'; return; }
        if (el.classList.contains('az-noperm')) return;   // already styled
        el.classList.add('az-noperm');
        el.title = 'Owner only — ask the owner to do this';
        el.setAttribute('aria-disabled', 'true');
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopImmediatePropagation();
          if (typeof showToast === 'function') showToast('Owner only — you do not have permission for this', 'error');
          else alert('Owner only — you do not have permission for this action.');
        }, true);
      } else {
        /* Whatever this element hides when blocked, it shows when allowed.
           Nav items are flex, buttons stay as designed, buttons with text
           keep their default. `display` is cleared only when we know we
           set it, so third-party styles (the designer themes) are never
           clobbered. */
        if (el.dataset.azPerm) {
          delete el.dataset.azPerm;
          el.style.display = '';
          el.removeAttribute('aria-disabled');
          el.title = '';
        }
        if (el.classList.contains('az-noperm')) el.classList.remove('az-noperm');
      }
    });
  });

  /* Role-driven nav items: decide their visibility from the CURRENT role
     every time the perms loader (or a re-login) runs — never from stale
     state captured before the role was known. Owner-only sections use the
     .owner-only CSS class, which the body's role-admin/role-owner class
     flips; just make sure the body class is current. */
  // FIX (owner features invisible on mobile): when the role is still
  // unknown (server has not answered yet, or gave up after timeouts),
  // never assume 'admin' — an unknown role defaulting to admin made
  // body.role-admin hide ALL owner-only sections (Staff & Permissions,
  // Content, Finance, System) via the .owner-only { display:none!important }
  // rule, and the body class was sticky. Prefer the cached session
  // identity, fall back to 'owner' visibility (server still enforces
  // everything), and only apply role-admin once the server positively
  // confirms a staff role.
  var cached = function () { try { return JSON.parse(localStorage.getItem('ascovita_session') || '{}'); } catch (e) { return {}; } }();
  var knownRole = window.AZPerms.loaded ? window.AZPerms.role : null;
  if (!knownRole && cached && cached.role) knownRole = cached.role;
  var currentRole = knownRole || 'owner';
  document.body.classList.remove('role-owner', 'role-admin');
  document.body.classList.add('role-' + currentRole);
  ['navAiTeam', 'moreAiTeam'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = (currentRole === 'owner') ? 'flex' : 'none';
  });
  var badge = document.getElementById('roleBadge');
  if (badge) badge.textContent = currentRole === 'owner' ? '\u{1F451} Owner' : '\u{1F527} Admin';

  /* Price fields are read-only for staff; stock stays editable. */
  document.querySelectorAll('#prodPrice,#prodSalePrice,#prodMrp,[id*="Price"],[name*="price"]').forEach(function (el) {
    if (el.tagName !== 'INPUT' || el.dataset.azPriceLocked) return;
    if (window.azCan('products.pricing')) return;
    el.dataset.azPriceLocked = '1';
    el.readOnly = true;
    el.title = 'Only the owner can change pricing';
    el.style.background = 'var(--surface2, #EFE7DA)';
  });
}

async function azLoadPerms() {
  /* RETRY-SAFE: the server sometimes naps between requests or the admin
     panel gets opened mid-deploy, so the very first /api/admin/me can time
     out even with a perfectly valid token. Retry up to 3 times before
     giving up — and when we do give up, keep everything visible so the
     panel stays usable (the server is the real enforcer). */
  var attempts = 0, lastErr = null;
  while (attempts < 3 && authToken) {
    try {
      const r = await fetch(API + '/api/admin/me', {
        headers: { 'Authorization': 'Bearer ' + authToken },
        signal: AbortSignal.timeout(15000)
      });
      if (r.status === 401 || r.status === 403) { window.AZPerms.loaded = true; return; }
      if (!r.ok) { attempts++; lastErr = new Error('HTTP ' + r.status); continue; }
      const d = await r.json();
      window.AZPerms = { role: d.role, list: d.permissions || [], loaded: true };
      /* Cache the identity so owner-only UI (Staff page) can
         gate itself instantly without a second round trip. */
      try {
        localStorage.setItem('ascovita_session', JSON.stringify({
          username: d.username, role: d.role, is_owner: !!d.is_owner,
          permissions: d.permissions || [], denied: d.denied || [],
          security: d.security || null,
        }));
        var _staffNav = document.getElementById('navStaff');
        if (_staffNav) _staffNav.style.display = d.is_owner ? '' : 'none';
      } catch (e) {}

      const banner = document.getElementById('azRoleBanner');
      if (banner && d.role === 'admin') {
        banner.innerHTML = '<strong>Staff account.</strong> You can manage orders, stock, customers and returns. '
          + 'Pricing, refunds, coupons, deletions, settings, revenue reports and ad spend are owner-only. '
          + 'Actions marked \u{1F451} need the owner.';
      }
      azApplyPermsToDOM();
      return;
    } catch (e) {
      attempts++; lastErr = e;
      await new Promise(function (res) { setTimeout(res, 1500 * attempts); });
    }
  }
  if (lastErr) {
    console.warn('[AZPerms] /api/admin/me did not respond after retries —', lastErr.message,
      'UI stays fully enabled; the server still enforces every rule.');
    /* Nothing was applied; nothing is hidden. Retry lazily on next login. */
  }
}

/* The panel re-renders its tables constantly, so re-apply as the DOM changes
   rather than only once after login. Throttled to one pass per frame. */
(function () {
  var queued = false;
  new MutationObserver(function () {
    if (queued || !window.AZPerms.loaded) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; azApplyPermsToDOM(); });
  }).observe(document.body, { childList: true, subtree: true });
})();

/* Hook into the existing applyRole() rather than editing it — the same
   convention the other patches in this file use. */
(function () {
  var _orig = window.applyRole;
  window.applyRole = function (role) {
    var r = _orig ? _orig.apply(this, arguments) : undefined;
    azLoadPerms();
    /* Staff page is owner-only — reveal the nav item even before
       /api/admin/me answers, using the cached session identity. */
    var _s = function () { try { return JSON.parse(localStorage.getItem('ascovita_session') || '{}'); } catch (e) { return {}; } }();
    var _nv = document.getElementById('navStaff');
    if (_nv) _nv.style.display = (_s.is_owner || r === 'owner') ? '' : 'none';

    /* Session countdown pill next to the role badge. */
    var tickNow = function () { try { if (window.__azTick) window.__azTick(); } catch (e) {} };
    var badge = document.getElementById('roleBadge');
    if (badge && !document.getElementById('azSessionPill')) {
      var pill = document.createElement('span');
      pill.id = 'azSessionPill';
      pill.title = 'Time left in this session';
      badge.parentNode.insertBefore(pill, badge.nextSibling);
      tickNow();   // otherwise the pill sits empty until the next 1s tick
    }

    /* Explain the limits once, at the top of the page area. */
    if (!document.getElementById('azRoleBanner')) {
      var main = document.querySelector('main') || document.body;
      var b = document.createElement('div');
      b.id = 'azRoleBanner';
      main.insertBefore(b, main.firstChild);
    }
    return r;
  };
  if (sessionStorage.getItem('ascovita_token')) azLoadPerms();
})();


/* ══ block 20 (origin 952347-955176, 2812 B) ══ */
(function(){
  let _seGalKey = ''; let _seGalLib = []; window._seGalQuery = '';
  window.storeEdOpenGallery = async function(mediaKey){
    _seGalKey = mediaKey;
    document.getElementById('storeEdGalleryTarget').textContent = 'Target: ' + mediaKey;
    const modal = document.getElementById('storeEdGalleryModal');
    modal.style.display = 'flex';
    const grid = document.getElementById('storeEdGalleryGrid');
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:22px;color:var(--text3);">Loading photos…</div>';
    try {
      const r = await fetch(API + '/api/upload/library', { headers: { 'Authorization': 'Bearer ' + authToken } });
      const d = await r.json();
      _seGalLib = (d && (d.data || d.images || d.files || d.photos)) || [];
      _seGalLib = _seGalLib.filter(i => !isVideoFileUrl(i.url));
      storeEdRenderGalleryGrid();
    } catch(e) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:22px;color:var(--danger);">Could not load photos: ' + e.message + '</div>'; }
  };
  window.storeEdRenderGalleryGrid = function(){
    const grid = document.getElementById('storeEdGalleryGrid');
    const q = window._seGalQuery || '';
    const list = _seGalLib.filter(i => !q || (i.filename||'').toLowerCase().includes(q));
    grid.innerHTML = list.length ? list.map(i => {
      const url = JSON.stringify(String(i.url || ''));
      const name = String(i.original_name || i.filename || '');
      const label = esc(name.replace(/\.[^.]+$/, '')) || 'Untitled image';
      return '<div class="store-gallery-item" role="button" tabindex="0" aria-label="Select ' + escAttr(name) + '" onclick="storeEdPickGallery(' + url + ')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();storeEdPickGallery(' + url + ')}">' +
        '<div class="store-gallery-preview"><img src="' + adminCdnImg(i.url) + '" alt="' + escAttr(name) + '" loading="lazy"></div>' +
        '<span class="store-gallery-select" aria-hidden="true">✓</span>' +
        '<span class="store-gallery-name" title="' + escAttr(name) + '">' + label + '</span></div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:22px;color:var(--text3);">No photos match' + (q ? ' "' + esc(q) + '"' : '') + '</div>';
  };
  window.storeEdPickGallery = async function(url){
    try {
      if (window._homeThumbnailGalleryActive) {
        const productId = Number(window._homeThumbnailGalleryProductId);
        if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error('No product is selected');
        const r = await apiFetch('/api/admin/products/' + productId + '/home-thumbnail', { method: 'PUT', body: JSON.stringify({ url: url }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
        if (typeof resetHomeThumbnailPreview === 'function' && typeof drawerProductId !== 'undefined' && drawerProductId === productId) resetHomeThumbnailPreview(d.data?.url || url);
        toast('✅ Gallery image set as homepage thumbnail');
        storeEdCloseGallery();
        return;
      }
      const r = await apiFetch('/api/admin/site-media/' + encodeURIComponent(_seGalKey), { method: 'PUT', body: JSON.stringify({ url: url }) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      toast('✅ Image set — live on the site now');
      storeEdCloseGallery();
    } catch(e) { toast('❌ Could not set image: ' + e.message, 'error'); }
  };
  window.storeEdCloseGallery = function(){
    document.getElementById('storeEdGalleryModal').style.display = 'none';
    window._homeThumbnailGalleryActive = false;
    window._homeThumbnailGalleryProductId = null;
  };
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') storeEdCloseGallery(); });
  // small helpers
  function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();

