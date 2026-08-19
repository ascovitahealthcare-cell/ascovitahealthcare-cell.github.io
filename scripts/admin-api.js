// ADMIN-API.JS
// ─────────────────────────────────────────────
// Extracted from admin.html inline blocks 4, 5, 12, 13, 15 (19 Aug 2026, Manus SEO pass).
// Order inside each file follows the original document order.

/* ══ block 4 (origin 276245-292373, 16111 B) ══ */
/* ═══ Staff & Permissions — owner-only page ═══ */
const AZ_STAFF_PERMS = [
  ['orders.view','View orders'],['orders.fulfil','Fulfil / dispatch'],['orders.delete','Delete orders'],['orders.refund','Refund orders'],
  ['customers.view','View customers'],['customers.edit','Edit customers'],['products.view','View products'],['products.edit','Edit products'],
  ['products.delete','Delete products'],['reviews.view','View reviews'],['reviews.moderate','Moderate reviews'],
  ['coupons.view','View coupons'],['coupons.edit','Edit coupons'],['coupons.delete','Delete coupons'],['coupons.publish','Publish coupons'],
  ['content.view','View content'],['content.edit','Edit content'],['finance.view','View finance'],['finance.refund','Finance refunds'],
  ['analytics.view','Analytics'],['reports.view','Reports'],['shipping.view','Shipping'],['shipping.dispatch','Dispatch shipping'],
  ['settings.manage','Settings'],['alerts.view','Alerts'],['alerts.resolve','Resolve alerts'],['audit.view','Audit log'],
  ['fraud.view','Fraud alerts'],['media.view','Media library'],['site-media.view','Site media'],
];
const AZ_STAFF_PRESETS = {
  warehouse: ['orders.view','orders.fulfil','products.view','shipping.view','shipping.dispatch','reviews.view','returns.view'].filter(k=>AZ_STAFF_PERMS.find(p=>p[0]===k)).concat(AZ_STAFF_PERMS.filter(p=>['orders.view','orders.fulfil','products.view','shipping.view','shipping.dispatch','reviews.view'].includes(p[0])).map(p=>p[0])),
  support:   ['orders.view','customers.view','customers.edit','reviews.view','reviews.moderate','products.view','content.view'],
  marketing: ['products.view','content.view','content.edit','coupons.view','coupons.edit','coupons.publish','analytics.view','site-media.view','media.view'],
};

/* ── Shared helpers used by the staff page, the 360 drawer and the
   password gate. Defined once so every caller uses the same logic. */
function escHtml(str){ return retEsc(str); }

/* Generic modal builder — title + HTML body + buttons. Creates the overlay
   markup on first call and reuses it afterwards. */
const AZ_MODAL_TPL2 = '<div class="modal-overlay" id="{id}"><div class="modal" style="max-width:640px"><div class="modal-hdr"><div class="modal-title">{title}</div><button class="modal-close" onclick="closeModal(\'{id}\')">✕</button></div><div class="modal-body">{body}</div>{btns}</div></div>';
function azBuildModal2(id, title, body, buttons){
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'modal-overlay';
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
    document.body.appendChild(el);
  }
  const btnsHtml = (buttons || []).map((b,i) =>
    `<button class="btn ${b.cls||''}" data-azmodal-idx="${i}">${escHtml(b.label)}</button>`).join('');
  el.innerHTML = AZ_MODAL_TPL2.replace('{id}', id).replace('{title}', escHtml(title))
    .replace('{body}', body).replace('{btns}', btnsHtml
      ? '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end">' + btnsHtml + '</div>' : '');
  (buttons || []).forEach((b,i) => {
    const btn = el.querySelector(`button[data-azmodal-idx="${i}"]`);
    if (btn) btn.addEventListener('click', () => { try { b.action(); } catch (e) { toast('❌ ' + e.message, 'error'); } });
  });
  el.classList.add('open');
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

/* ── Password re-confirmation gate ────────────────────────────────────
   Every destructive or sensitive change goes through this. The admin
   types their password — the server returns a
   one-use proof valid 5 minutes — which is sent with the real action
   as X-Password-Proof. Never rely on the open session alone. */
let __proof = null, __proofExp = 0;
function azSessionUser(){ try{ return JSON.parse(localStorage.getItem('ascovita_session')||'{}'); }catch(e){ return {}; } }
// Dual security (Aug 2026): when the backend has SAVE_PASSWORD configured,
// critical actions require that separate save/transaction password — never
// the login password — so a leaked login password can't approve changes.
// The flag arrives via /api/admin/me and is cached on the session object.
function azSavePwRequired(){ return !!azSessionUser().security?.save_pw_required; }
async function confirmCriticalAction(promptText, actionFn){
  const sess = azSessionUser();
  const reuses = __proof && Date.now() < __proofExp;
  if (reuses) return actionFn(__proof);
  const saveRequired = azSavePwRequired();
  const modalTitle = saveRequired ? 'Confirm with your save password' : 'Confirm with your password';
  const fieldLabel = saveRequired ? 'Save (transaction) password' : 'Password';
  const emptyMsg = saveRequired ? 'Enter your save password.' : 'Enter your password.';
  const hintHtml = saveRequired ? '<div style="font-size:.72rem;color:var(--accent);margin-bottom:10px">This is the separate save password you set in Render — not your login password.</div>' : '';
  return new Promise(function(resolve, reject){
    const msgId = 'azProofMsg';
    azBuildModal2('azProofModal', modalTitle, `
      <div style="padding:4px 0">
        <div style="font-size:.8rem;margin-bottom:12px;color:var(--text2)">${escHtml(promptText)}</div>
        ${hintHtml}
        <label class="field-label">${fieldLabel}</label>
        <div class="pw-wrap"><input type="password" id="azProofPw" class="field-input" autocomplete="current-password"><button type="button" class="pw-toggle" onclick="var i=document.getElementById('azProofPw');i.type=i.type==='password'?'text':'password'">👁</button></div>
        <div id="${msgId}" class="login-error" style="display:none"></div>
      </div>`, [
      { label: 'Confirm', cls: 'btn-gold', action: async function(){
        const pw = document.getElementById('azProofPw').value;
        const msg = document.getElementById(msgId);
        if (!pw) { msg.textContent = emptyMsg; msg.style.display = 'block'; return; }
        msg.style.display = 'none';
        try {
          const r = await apiFetch('/api/admin/confirm-password', {
            method: 'POST', body: JSON.stringify({ username: sess.username || '', password: pw }),
          });
          const d = await r.json();
          if (!r.ok || !d.proof) throw new Error(d.error || 'Password did not match');
          __proof = d.proof; __proofExp = Date.now() + 4 * 60 * 1000;
          closeModal('azProofModal');
          resolve(await actionFn(__proof));
        } catch (e) { msg.textContent = e.message; msg.style.display = 'block'; }
      }},
      { label: 'Cancel', cls: 'btn-secondary', action: function(){ closeModal('azProofModal'); reject(new Error('cancelled')); } },
    ]);
  });
}

function azStaffPermLabel(k){ const f = AZ_STAFF_PERMS.find(p=>p[0]===k); return f ? f[1] : k; }

function azToggleStaffInvite(){
  const c = document.getElementById('staffInviteCard');
  c.style.display = c.style.display === 'none' ? 'block' : 'none';
  if (c.style.display === 'block') { renderAzStaffNewPerms([]); document.getElementById('azStaffNewUsername').focus(); }
}
function azToggleStaffNewPw(){
  const i = document.getElementById('azStaffNewPassword');
  i.type = i.type === 'password' ? 'text' : 'password';
}
function renderAzStaffNewPerms(selected){
  const w = document.getElementById('azStaffNewPerms');
  w.innerHTML = AZ_STAFF_PERMS.map(([k,lab]) =>
    `<label style="font-size:.75rem;display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer">
       <input type="checkbox" class="az-new-perm" value="${k}" ${selected.includes(k)?'checked':''}> ${escHtml(lab)}</label>`).join('');
}
function azStaffNewPermsAll(on){ document.querySelectorAll('.az-new-perm').forEach(c=>{c.checked=on;}); }
function azStaffNewPermsPreset(name){
  const sel = new Set(AZ_STAFF_PRESETS[name] || []);
  document.querySelectorAll('.az-new-perm').forEach(c=>{ c.checked = sel.has(c.value); });
}

async function loadStaffPage(){
  const body = document.getElementById('azStaffBody');
  const notice = document.getElementById('staffOwnerNotice');
  const content = document.getElementById('staffPageContent');
  if (!body) return;
  body.innerHTML = '<tr><td colspan="7" style="padding:22px;text-align:center;color:var(--text3)">Loading team…</td></tr>';
  try {
    const d = await apiFetch('/api/admin/staff');
    if (d.error) throw new Error(d.error);
    const isOwner = (function(){ try{ return JSON.parse(localStorage.getItem('ascovita_session')||'{}').is_owner; }catch(e){return false;} })();
    notice.style.display = isOwner ? 'none' : 'block';
    content.style.display = isOwner ? '' : 'none';
    if (!isOwner) return;
    const rows = (d.staff || []).map(s => {
      const statusCls = s.enabled ? 'badge-ok' : 'badge-bad';
      const statusTxt = s.enabled ? 'Active' : 'Suspended';
      const permTags = (s.permissions && s.permissions.length)
        ? s.permissions.map(p=>`<span style="font-size:.62rem;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:1px 5px">${escHtml(azStaffPermLabel(p))}</span>`).join(' ')
        : '<span style="font-size:.7rem;color:var(--text3)">Full admin (default role)</span>';
      return `<tr style="border-bottom:1px solid var(--border);vertical-align:top">
        <td style="padding:10px;font-weight:600">${escHtml(s.username)}</td>
        <td style="padding:10px"><span class="badge badge-gold">${escHtml(s.role)}</span></td>
        <td style="padding:10px"><span class="badge ${statusCls}">${statusTxt}</span></td>
        <td style="padding:10px;max-width:320px">${permTags}</td>
        <td style="padding:10px;font-size:.72rem;color:var(--text3)">${s.last_login_at ? new Date(s.last_login_at).toLocaleString() : '—'}</td>
        <td style="padding:10px;text-align:right;white-space:nowrap">
          <button class="btn btn-secondary" style="font-size:.68rem;padding:4px 9px" onclick="azStaffEditPerms('${escHtml(s.username)}', ${JSON.stringify(s.permissions||[]).replace(/"/g,'&quot;')})">✏️ Perms</button>
          <button class="btn btn-secondary" style="font-size:.68rem;padding:4px 9px" onclick="azStaffToggle('${escHtml(s.username)}', ${s.enabled})">${s.enabled ? '⏸ Suspend' : '▶ Enable'}</button>
          <button class="btn" style="font-size:.68rem;padding:4px 9px;color:var(--red-text);border-color:var(--red)" onclick="azStaffRevoke('${escHtml(s.username)}')">Revoke</button>
        </td>
      </tr>`;
    }).join('');
    body.innerHTML = rows || '<tr><td colspan="7" style="padding:22px;text-align:center;color:var(--text3)">No staff yet — invite someone to join the team.</td></tr>';
  } catch (e) {
    body.innerHTML = `<tr><td colspan="7" style="padding:22px;text-align:center;color:var(--red-text)">Could not load the team: ${escHtml(e.message)}</td></tr>`;
  }
}

async function azStaffInvite(){
  const msg = document.getElementById('azStaffInviteMsg');
  const username = document.getElementById('azStaffNewUsername').value.trim();
  const password = document.getElementById('azStaffNewPassword').value;
  const enforced = document.getElementById('azStaffNewEnforced').checked;
  const permissions = [...document.querySelectorAll('.az-new-perm:checked')].map(c=>c.value);
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) { msg.textContent = 'Username: 3–30 characters, a-z, 0-9, dots, underscores, hyphens.'; msg.style.display = 'block'; return; }
  if (password.length < 10) { msg.textContent = 'Password must be at least 10 characters.'; msg.style.display = 'block'; return; }
  try {
    await confirmCriticalAction(`Invite ${username} as staff?`, async function(proof){
      const headers = proof ? { 'X-Password-Proof': proof } : {};
      const r = await apiFetch('/api/admin/staff/invite', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ username, password, role: 'admin', permissions: permissions.length ? permissions : null }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Invite failed');
      return d;
    });
    document.getElementById('azStaffNewUsername').value = '';
    document.getElementById('azStaffNewPassword').value = '';
    azToggleStaffInvite();
    toast(`✅ ${username} invited — share the one-time credentials securely and ask them to sign in`);
    loadStaffPage();
  } catch (e) {
    if (e.message !== 'cancelled') { msg.textContent = e.message || 'Invite failed'; msg.style.display = 'block'; }
  }
}

async function azStaffToggle(username, currentlyEnabled){
  const req = confirmCriticalAction(`${currentlyEnabled ? 'Suspend' : 'Enable'} ${username}?`, async function(proof){
    const headers = proof ? { 'X-Password-Proof': proof } : {};
    const r = await apiFetch(`/api/admin/staff/${currentlyEnabled ? 'suspend' : 'enable'}`, {
      method: 'POST', headers: headers, body: JSON.stringify({ username }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Failed');
    return d;
  });
  try { await req; toast('Done'); loadStaffPage(); }
  catch (e) { toast('❌ ' + e.message, 'error'); }
}

async function azStaffRevoke(username){
  if (!confirm(`Revoke ${username}?\n\nTheir account is disabled and every open session is killed instantly. You can enable them again later.`)) return;
  const req = confirmCriticalAction(`Permanently revoke ${username}?`, async function(proof){
    const headers = proof ? { 'X-Password-Proof': proof } : {};
    const r = await apiFetch('/api/admin/staff/revoke', {
      method: 'POST', headers: headers, body: JSON.stringify({ username }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Revoke failed');
    return d;
  });
  try { await req; toast(`${username} revoked`); loadStaffPage(); }
  catch (e) { toast('❌ ' + e.message, 'error'); }
}

async function azStaffEditPerms(username, currentPerms, _unused){
  const custom = currentPerms && currentPerms.length > 0;
  const checked = custom ? new Set(currentPerms) : new Set(AZ_STAFF_PERMS.map(p=>p[0]));
  let html = `<div style="padding:4px 0"><strong>${escHtml(username)}</strong> — ${custom ? 'custom set' : 'full admin (default role)'}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:3px 12px;max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;padding:10px;background:var(--surface2)">
    ${AZ_STAFF_PERMS.map(([k,lab])=>`<label style="font-size:.75rem;display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer"><input type="checkbox" class="az-edit-perm" value="${k}" ${checked.has(k)?'checked':''}> ${escHtml(lab)}</label>`).join('')}
    </div>
    <div style="font-size:.7rem;color:var(--text3);margin-top:8px">Leave everything ticked = full admin role. Uncheck any to create a custom set — the server enforces it immediately.</div>`;
    azBuildModal2('azStaffEditModal', 'Edit permissions — ' + username, html, [
    { label: 'Save', cls: 'btn-gold', action: async function(){
      const perms = [...document.querySelectorAll('.az-edit-perm:checked')].map(c=>c.value);
      const all = AZ_STAFF_PERMS.every(p => perms.includes(p[0]));
      try {
        await confirmCriticalAction(`Apply permission changes for ${username}?`, async function(proof){
          const headers = proof ? { 'X-Password-Proof': proof } : {};
          const r = await apiFetch('/api/admin/staff/' + encodeURIComponent(username), {
            method: 'PUT', headers: headers,
            body: JSON.stringify({ permissions: all ? null : perms }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || 'Update failed');
          return d;
        });
        closeModal('azStaffEditModal');
        toast('Permissions updated');
        loadStaffPage();
      } catch (e) { toast('❌ ' + e.message, 'error'); }
    }},
    { label: 'Cancel', cls: 'btn-secondary', action: function(){ closeModal('azStaffEditModal'); } },
  ]);
}


/* ══ block 5 (origin 308996-314789, 5776 B) ══ */
/* ── Automation page ─────────────────────────────────── */
async function autFetch(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('ascovita_token') || '') } }, opts || {}));
  return r.json().catch(() => ({}));
}
function autWhen(ts){ return ts ? (new Date(ts).toLocaleString()) : 'never'; }
async function loadAutomation() {
  try {
    const [st, q, rc] = await Promise.all([
      autFetch('/api/admin/auto-status'),
      autFetch('/api/admin/returns/queue'),
      autFetch('/api/admin/finance/reconciliation'),
    ]);
    const cfg = st.config || {};
    const s = st.state || {};
    document.getElementById('autReturnsCycle').textContent = autWhen(s.lastCycleAt);
    document.getElementById('autRecon').textContent = autWhen(s.lastReconAt);
    document.getElementById('autShip').textContent = s.lastShipAt ? `${autWhen(s.lastShipAt)}` : 'never';
    document.getElementById('autNext').textContent = (s.lastCycleAt && s.config) ? 'every 30 min' : 'every 30 min';
    document.getElementById('autApproveH').value = cfg.autoApproveHours;
    document.getElementById('autPickupH').value = cfg.autoPickupHours;
    document.getElementById('autRefundH').value = cfg.autoRefundHours;
    document.getElementById('autExpiryH').value = cfg.expiryHours;
    document.getElementById('autShipOn').checked = !!cfg.autoShipOn;
    document.getElementById('autPickupOn').checked = !!cfg.autoPickupOn;
    // Queue
    const qe = document.getElementById('autQueueTable');
    const list = q.queue || [];
    if (!list.length) { qe.innerHTML = '<div style="color:var(--green-text);">✅ Nothing pending — all returns fully automatic.</div>'; }
    else {
      const rows = list.map(x => `<tr><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.id}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.order_id}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.status}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.nextAction}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.dueInHours === 0 ? 'now' : (x.dueInHours + ' h')}</td></tr>`).join('');
      qe.innerHTML = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><tr style="text-align:left;font-size:0.72rem;color:var(--text3);"><th style="padding:6px 8px;">Return</th><th style="padding:6px 8px;">Order</th><th style="padding:6px 8px;">Status</th><th style="padding:6px 8px;">Next</th><th style="padding:6px 8px;">Due</th></tr>${rows}</table></div>`;
    }
    // Reconciliation
    const re = document.getElementById('autReconTable');
    const hist = rc.data || [];
    if (!hist.length) { re.innerHTML = '<div>History starts after the first scheduled reconciliation run (every 6 hours) or press "Reconcile now".</div>' + (rc.note ? `<div style="color:var(--text3);font-size:0.75rem;margin-top:4px;">${esc(rc.note)}</div>` : ''); }
    else {
      const hrows = hist.map(h => `<tr><td style="padding:6px 8px;border-top:1px solid var(--border);">${h.period}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.online_paid||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.gateway_gross||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.cod_collected||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${esc((h.warnings||'—').slice(0,100))}</td></tr>`).join('');
      re.innerHTML = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><tr style="text-align:left;font-size:0.72rem;color:var(--text3);"><th style="padding:6px 8px;">Day</th><th style="padding:6px 8px;">Online paid</th><th style="padding:6px 8px;">Gateway gross</th><th style="padding:6px 8px;">COD collected</th><th style="padding:6px 8px;">Warnings</th></tr>${hrows}</table></div>`;
    }
    if (rc.lastRun) {
      const lr = document.createElement('div');
      lr.style.cssText = 'font-size:0.72rem;color:var(--text3);margin-top:6px;';
      const w = rc.lastRun.warnings || [];
      lr.textContent = (w.length ? '⚠️ ' + w.join(' · ') : '✅ Last reconciliation clean') + ' — ' + (rc.lastRun.period || '');
      re.appendChild(lr);
    }
  } catch (e) { console.error('[automation]', e); }
}
async function autSaveConfig() {
  const msg = document.getElementById('autConfigMsg');
  try {
    const r = await autFetch('/api/admin/auto-status', { method: 'PUT', body: JSON.stringify({
      autoApproveHours: Number(document.getElementById('autApproveH').value) || 0,
      autoPickupHours: Number(document.getElementById('autPickupH').value) || 0,
      autoRefundHours: Number(document.getElementById('autRefundH').value) || 0,
      expiryHours: Number(document.getElementById('autExpiryH').value) || 24,
      autoShipOn: document.getElementById('autShipOn').checked,
      autoPickupOn: document.getElementById('autPickupOn').checked,
    }) });
    msg.textContent = r.ok ? '✅ Saved — the engine picks up the new values within the next cycle (≤30 min). Manual buttons in Returns keep working as before.' : (r.error || 'Failed');
    loadAutomation();
  } catch (e) { msg.textContent = 'Error: ' + e.message; }
}
async function autRunCycleNow() {
  try { await autFetch('/api/admin/auto-status', { method: 'PUT', body: JSON.stringify({ runCycleNow: true }) }); loadAutomation(); }
  catch (e) { console.error('[automation]', e); }
}
async function autReconNow() {
  try { await autFetch('/api/admin/finance/reconcile-now', { method: 'POST' }); loadAutomation(); }
  catch (e) { console.error('[automation]', e); }
}


/* ══ block 12 (origin 808087-809183, 1079 B) ══ */
window.MARKETING_SUPABASE_URL = "https://wyvpuafzirwlwweifzao.supabase.co";
  window.MARKETING_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5dnB1YWZ6aXJ3bHd3ZWlmemFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODU0NTUsImV4cCI6MjA5OTg2MTQ1NX0.JG_DIQJef2rshO7TYwrk1p0DqTLR3JUQeJbQHO8K8rg";
  /* Marketing calls now go through the main backend's /api/marketing/* proxy
     instead of straight to the marketing service.

     Why: every route on that service (including POST /api/adsets/:id/budget,
     which sets your Meta daily ad budget) was reachable by anyone who knew
     its URL, and this panel called it with no credentials at all. The service
     is now key-gated — but this file is static on GitHub Pages, so it cannot
     hold that key. The backend holds it, checks your admin JWT first, and
     attaches the key server-side.

     The direct URL is kept below only for reference. */
  window.MARKETING_DIRECT_URL  = "https://marketing-automation-rmcb.onrender.com";
  window.MARKETING_BACKEND_URL = API + "/api/marketing";


/* ══ block 13 (origin 809286-837221, 27918 B) ══ */
// Requires window.MARKETING_SUPABASE_URL / MARKETING_SUPABASE_ANON_KEY / MARKETING_BACKEND_URL
// to be set, and the supabase-js UMD script loaded, above this block.
let mktSupabase = null;
function mktInit() {
  if (mktSupabase || !window.supabase || !window.MARKETING_SUPABASE_URL) return;
  mktSupabase = window.supabase.createClient(window.MARKETING_SUPABASE_URL, window.MARKETING_SUPABASE_ANON_KEY);
}

function mktShowTab(tab) {
  document.querySelectorAll('.mkt-tab').forEach(t => t.style.display = 'none');
  document.getElementById('mkt-tab-' + tab).style.display = 'block';
  document.querySelectorAll('.mkt-navbtn').forEach(b => b.classList.toggle('mkt-active', b.dataset.tab === tab));
  if (tab === 'overview') mktLoadOverview();
  if (tab === 'strategy') mktLoadStrategy();
  if (tab === 'liveads') mktLoadAdSets();
  if (tab === 'winners') mktLoadWinners();
  if (tab === 'campaigns') mktLoadCampaigns();
  if (tab === 'reports') mktLoadReportLogs();
}

function mktEsc(s) { return (s || '').toString().replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function mktFmtMoney(n) {
  if (n === null || n === undefined) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function mktFmtRoas(n) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(2) + 'x';
}

/* ---------- OVERVIEW ---------- */
async function mktLoadOverview() {
  mktInit();
  if (!mktSupabase) return;
  const [{ data: adSets }, { data: campaigns }] = await Promise.all([
    mktSupabase.from('ad_sets').select('*'),
    mktSupabase.from('campaigns').select('status'),
  ]);

  const active = (adSets || []).filter(a => a.status === 'active');
  const totalSpend = active.reduce((s, a) => s + (Number(a.last_spend) || 0), 0);
  const totalPurchases = active.reduce((s, a) => s + (Number(a.last_purchases) || 0), 0);
  const weightedRoasSum = active.reduce((s, a) => s + (Number(a.last_roas) || 0) * (Number(a.last_spend) || 0), 0);
  const blendedRoas = totalSpend > 0 ? weightedRoasSum / totalSpend : null;
  const pending = (campaigns || []).filter(c => c.status === 'pending_approval').length;

  const blendedCpa = totalPurchases > 0 ? totalSpend / totalPurchases : null;
  document.getElementById('mkt-kpi-active').textContent = active.length;
  document.getElementById('mkt-kpi-spend').textContent = mktFmtMoney(totalSpend);
  document.getElementById('mkt-kpi-roas').textContent = blendedRoas !== null ? mktFmtRoas(blendedRoas) : '—';
  document.getElementById('mkt-kpi-purchases').textContent = totalPurchases > 0 ? Math.round(totalPurchases) : '—';
  document.getElementById('mkt-kpi-cpa').textContent = blendedCpa !== null ? mktFmtMoney(blendedCpa) : '—';
  document.getElementById('mkt-kpi-pending').textContent = pending;

  const winners = active.filter(a => a.last_verdict === 'scale').sort((a, b) => (b.last_roas || 0) - (a.last_roas || 0)).slice(0, 5);
  const losers = active.filter(a => a.last_verdict === 'pause').sort((a, b) => (a.last_roas || 0) - (b.last_roas || 0)).slice(0, 5);

  document.getElementById('mkt-overview-winners').innerHTML = winners.length
    ? winners.map(a => `<div class="mkt-angle"><div style="display:flex;justify-content:space-between;"><strong>${mktEsc(a.name)}</strong><span style="color:#3F565B;font-weight:700;">${mktFmtRoas(a.last_roas)}</span></div></div>`).join('')
    : '<p class="mkt-empty">No winners flagged yet — run a report first.</p>';

  document.getElementById('mkt-overview-losers').innerHTML = losers.length
    ? losers.map(a => `<div class="mkt-angle"><div style="display:flex;justify-content:space-between;"><strong>${mktEsc(a.name)}</strong><span style="color:#963848;font-weight:700;">${mktFmtRoas(a.last_roas)}</span></div><div style="font-size:12px;color:var(--text2);">${mktEsc(a.last_reason || '')}</div></div>`).join('')
    : '<p class="mkt-empty">Nothing flagged for pausing right now.</p>';

  // Automation status strip — fetched from the dedicated status endpoint
  // (one cheap call instead of five), through the admin-gated proxy.
  mktLoadAutomationStatus();
}

async function mktLoadAutomationStatus() {
  try {
    const res = await fetch(window.MARKETING_BACKEND_URL + '/api/reports/status');
    if (!res.ok) return;
    const s = await res.json();
    const reportEl = document.getElementById('mkt-auto-report');
    const verdictsEl = document.getElementById('mkt-auto-verdicts');
    const ceilingEl = document.getElementById('mkt-auto-ceiling');
    const strategyEl = document.getElementById('mkt-auto-strategy');
    if (reportEl) reportEl.textContent = s.latest_log_at
      ? 'Last report: ' + new Date(s.latest_log_at).toLocaleString()
      : 'Last report: none yet (run one from the Reports tab)';
    const v = (s.report && s.report.verdicts) || {};
    if (verdictsEl) verdictsEl.textContent =
      'Verdicts: ' + (v.scale || 0) + ' scale · ' + (v.pause || 0) + ' pause · ' + (v.hold || 0) + ' hold';
    if (ceilingEl) ceilingEl.textContent =
      'Budget ceiling: ₹' + Number(((s.budget_rules && s.budget_rules.max_daily_budget_cents) || 500000) / 100).toLocaleString('en-IN') + '/day per ad set';
    if (strategyEl) strategyEl.textContent = s.strategy
      ? 'Strategy: ' + (s.strategy.month || '—') + (s.strategy.title ? ' · ' + s.strategy.title : '')
      : 'Strategy: none set';
  } catch (e) { /* silent — strip simply shows defaults */ }
}

/* ---------- STRATEGY ---------- */
let mktCurrentStrategy = null;
let mktStrategyEditMode = null; // 'edit' | 'new'

function mktFmtStratBudget(s) {
  if (!s) return '—';
  const parts = [];
  if (s.monthly_budget) parts.push('₹' + Number(s.monthly_budget).toLocaleString('en-IN') + '/mo');
  if (s.daily_budget) parts.push('₹' + Number(s.daily_budget).toLocaleString('en-IN') + '/day');
  return parts.join(' · ') || '—';
}

async function mktLoadStrategy() {
  mktInit();
  const view = document.getElementById('mkt-strategy-view');
  if (!mktSupabase) { view.innerHTML = '<p class="mkt-empty">Marketing Supabase not configured.</p>'; return; }
  const { data, error } = await mktSupabase.from('monthly_strategies').select('*').eq('is_active', true).maybeSingle();
  if (error) { view.innerHTML = '<p class="mkt-empty">Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  mktCurrentStrategy = data;

  if (!data) {
    document.getElementById('mkt-strategy-title').textContent = 'No active strategy yet';
    document.getElementById('mkt-strategy-sub').textContent = 'Click "Start new month" to create the first one, or run the seed SQL for month 1.';
    view.innerHTML = '<p class="mkt-empty">Nothing configured yet.</p>';
    return;
  }

  document.getElementById('mkt-strategy-title').textContent = (data.title || 'Strategy') + ' — ' + data.month;
  document.getElementById('mkt-strategy-sub').textContent = mktFmtStratBudget(data) + ' · Active';

  const budgetRows = (data.budget_split || []).map(b => `
    <tr>
      <td>${mktEsc(b.product)}</td>
      <td>${mktFmtMoney(b.monthly_budget)}/mo</td>
      <td>${mktFmtMoney(b.daily_budget)}/day</td>
      <td>${b.share_pct != null ? b.share_pct + '%' : '—'}</td>
    </tr>`).join('');

  const targeting = data.targeting || {};
  const perfRows = (data.expected_performance || []).map(p => `
    <tr><td>${mktEsc(p.metric)}</td><td>${mktEsc(p.target)}</td></tr>`).join('');
  const calRows = (data.testing_calendar || []).map(c => `
    <tr><td>Week ${mktEsc(c.week)}</td><td>${mktEsc(c.focus)}</td></tr>`).join('');

  view.innerHTML = `
    <div class="mkt-split" style="margin-bottom:20px;">
      <div>
        <h3 style="margin-bottom:8px;">Budget split</h3>
        ${budgetRows ? `<table class="mkt-table"><tr><th>Product</th><th>Monthly</th><th>Daily</th><th>Share</th></tr>${budgetRows}</table>` : '<p class="mkt-empty">No budget split set.</p>'}
      </div>
      <div>
        <h3 style="margin-bottom:8px;">Expected performance</h3>
        ${perfRows ? `<table class="mkt-table"><tr><th>Metric</th><th>Target</th></tr>${perfRows}</table>` : '<p class="mkt-empty">Not set.</p>'}
      </div>
    </div>

    <div class="card" style="padding:14px 16px;margin-bottom:16px;">
      <h3 style="margin-top:0;">Targeting</h3>
      <div style="font-size:13px;line-height:1.7;">
        ${targeting.locations ? `<div><strong>Locations:</strong> ${mktEsc((targeting.locations.tier1_core || []).join(', '))}${targeting.locations.tier2_secondary_fold_into_broad ? ' + Tier 2 folded into broad prospecting' : ''}</div>` : ''}
        ${targeting.age_gender ? `<div><strong>Age/gender:</strong> ${Object.entries(targeting.age_gender).map(([k,v]) => mktEsc(k) + ': ' + mktEsc(v)).join(' · ')}</div>` : ''}
        ${targeting.interests ? `<div><strong>Interests:</strong> ${Object.entries(targeting.interests).filter(([k])=>k!=='note').map(([k,v]) => mktEsc(k) + ': ' + (Array.isArray(v) ? mktEsc(v.join(', ')) : mktEsc(v))).join(' · ')}</div>` : ''}
        ${targeting.language_placements ? `<div><strong>Language/placements:</strong> ${mktEsc(targeting.language_placements)}</div>` : ''}
        ${targeting.retargeting_audiences ? `<div><strong>Retargeting audiences:</strong> ${mktEsc(targeting.retargeting_audiences.join('; '))}</div>` : ''}
      </div>
    </div>

    ${data.creative_notes ? `<div class="card" style="padding:14px 16px;margin-bottom:16px;"><h3 style="margin-top:0;">Creative notes</h3><div style="font-size:13px;white-space:pre-wrap;">${mktEsc(data.creative_notes)}</div></div>` : ''}
    ${data.compliance_notes ? `<div class="mkt-angle" style="background:#fff7e6;border-color:#f0dca0;"><strong>Compliance notes</strong><div style="font-size:13px;white-space:pre-wrap;margin-top:6px;">${mktEsc(data.compliance_notes)}</div></div>` : ''}
    ${calRows ? `<h3 style="margin-top:16px;">Testing calendar</h3><table class="mkt-table"><tr><th>Week</th><th>Focus</th></tr>${calRows}</table>` : ''}
    ${data.raw_notes ? `<div class="card" style="padding:14px 16px;margin-top:16px;"><h3 style="margin-top:0;">Other notes</h3><div style="font-size:13px;white-space:pre-wrap;">${mktEsc(data.raw_notes)}</div></div>` : ''}
  `;
}

function mktPopulateStrategyForm(s, { keepMonth } = { keepMonth: true }) {
  document.getElementById('mkt-strat-month').value = keepMonth ? (s?.month || '') : '';
  document.getElementById('mkt-strat-month').disabled = !!keepMonth && !!s;
  document.getElementById('mkt-strat-title').value = s?.title || '';
  document.getElementById('mkt-strat-monthly-budget').value = s?.monthly_budget || '';
  document.getElementById('mkt-strat-daily-budget').value = s?.daily_budget || '';
  document.getElementById('mkt-strat-budget-split').value = s?.budget_split ? JSON.stringify(s.budget_split, null, 2) : '';
  document.getElementById('mkt-strat-targeting').value = s?.targeting ? JSON.stringify(s.targeting, null, 2) : '';
  document.getElementById('mkt-strat-creative').value = s?.creative_notes || '';
  document.getElementById('mkt-strat-compliance').value = s?.compliance_notes || '';
  document.getElementById('mkt-strat-expected').value = s?.expected_performance ? JSON.stringify(s.expected_performance, null, 2) : '';
  document.getElementById('mkt-strat-calendar').value = s?.testing_calendar ? JSON.stringify(s.testing_calendar, null, 2) : '';
  document.getElementById('mkt-strat-raw').value = s?.raw_notes || '';
}

function mktToggleStrategyEdit(forceClose) {
  const form = document.getElementById('mkt-strategy-form');
  const isOpen = form.style.display !== 'none';
  if (forceClose === true || isOpen) { form.style.display = 'none'; mktStrategyEditMode = null; return; }
  mktStrategyEditMode = 'edit';
  document.getElementById('mkt-strat-save-btn').textContent = 'Save changes';
  mktPopulateStrategyForm(mktCurrentStrategy, { keepMonth: true });
  form.style.display = 'block';
}

function mktStartNewMonth() {
  const form = document.getElementById('mkt-strategy-form');
  mktStrategyEditMode = 'new';
  document.getElementById('mkt-strat-save-btn').textContent = 'Create new month';
  // Copy forward everything except month/title, so only the numbers that
  // actually change month to month need retyping.
  mktPopulateStrategyForm(mktCurrentStrategy, { keepMonth: false });
  document.getElementById('mkt-strat-title').value = '';
  form.style.display = 'block';
  document.getElementById('mkt-strat-month').focus();
}

function mktParseJsonField(id, label) {
  const raw = document.getElementById(id).value.trim();
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch (e) { throw new Error(label + ' is not valid JSON: ' + e.message); }
}

async function mktSaveStrategy() {
  const status = document.getElementById('mkt-strat-save-status');
  try {
    const payload = {
      title: document.getElementById('mkt-strat-title').value.trim() || null,
      monthly_budget: Number(document.getElementById('mkt-strat-monthly-budget').value) || null,
      daily_budget: Number(document.getElementById('mkt-strat-daily-budget').value) || null,
      budget_split: mktParseJsonField('mkt-strat-budget-split', 'Budget split'),
      targeting: mktParseJsonField('mkt-strat-targeting', 'Targeting'),
      creative_notes: document.getElementById('mkt-strat-creative').value.trim() || null,
      compliance_notes: document.getElementById('mkt-strat-compliance').value.trim() || null,
      expected_performance: mktParseJsonField('mkt-strat-expected', 'Expected performance'),
      testing_calendar: mktParseJsonField('mkt-strat-calendar', 'Testing calendar'),
      raw_notes: document.getElementById('mkt-strat-raw').value.trim() || null,
    };

    status.textContent = 'Saving…';
    let res;
    if (mktStrategyEditMode === 'new') {
      const month = document.getElementById('mkt-strat-month').value.trim();
      if (!month) { status.textContent = 'Month is required (e.g. 2026-08)'; return; }
      payload.month = month;
      res = await fetch(window.MARKETING_BACKEND_URL + '/api/strategy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
    } else {
      if (!mktCurrentStrategy) { status.textContent = 'No active strategy to edit — start a new month instead.'; return; }
      res = await fetch(window.MARKETING_BACKEND_URL + '/api/strategy/' + mktCurrentStrategy.id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
    }
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Save failed');
    status.textContent = 'Saved';
    mktToggleStrategyEdit(true);
    mktLoadStrategy();
  } catch (e) {
    status.textContent = 'Failed: ' + e.message;
  }
}

async function mktToggleStrategyHistory() {
  const box = document.getElementById('mkt-strategy-history');
  const isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) mktLoadStrategyHistory();
}

async function mktLoadStrategyHistory() {
  mktInit();
  const list = document.getElementById('mkt-strategy-history-list');
  if (!mktSupabase) { list.innerHTML = '<p class="mkt-empty">Marketing Supabase not configured.</p>'; return; }
  const { data, error } = await mktSupabase.from('monthly_strategies').select('*').order('month', { ascending: false });
  if (error) { list.innerHTML = '<p class="mkt-empty">Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  list.innerHTML = (data || []).map(s => `
    <div class="mkt-angle">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${mktEsc(s.month)} — ${mktEsc(s.title || '')}</strong>
        ${s.is_active ? '<span class="mkt-pill active">active</span>' : ''}
      </div>
      <div style="font-size:12px;color:var(--text2);">${mktFmtStratBudget(s)}</div>
    </div>
  `).join('') || '<p class="mkt-empty">No strategies yet.</p>';
}

/* ---------- LIVE ADS ---------- */
async function mktLoadAdSets() {
  mktInit();
  const box = document.getElementById('mkt-adsets-table');
  if (!mktSupabase) { box.innerHTML = '<p class="mkt-empty">Marketing Supabase not configured.</p>'; return; }
  const { data, error } = await mktSupabase.from('ad_sets').select('*').order('last_roas', { ascending: false });
  if (error) { box.innerHTML = '<p class="mkt-empty">Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  if (!data.length) { box.innerHTML = '<p class="mkt-empty">No ad sets yet — these populate once a daily report has run against a launched campaign.</p>'; return; }

  box.innerHTML = `<table class="mkt-table"><tr>
    <th>Ad set</th><th>Status</th><th>Spend</th><th>CPA</th><th>ROAS</th><th>Verdict</th><th>Budget</th><th>Actions</th>
  </tr>${data.map(a => `
    <tr>
      <td>${mktEsc(a.name)}</td>
      <td><span class="mkt-pill ${mktEsc(a.status)}">${mktEsc(a.status)}</span></td>
      <td>${mktFmtMoney(a.last_spend)}</td>
      <td>${mktFmtMoney(a.last_cpa)}</td>
      <td>${mktFmtRoas(a.last_roas)}</td>
      <td><span class="mkt-pill ${mktEsc(a.last_verdict)}">${mktEsc(a.last_verdict || '—')}</span></td>
      <td>
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="number" class="mkt-budget-input" id="mkt-budget-${a.id}" placeholder="${a.daily_budget_cents ? Math.round(a.daily_budget_cents / 100) : ''}">
          <button class="btn btn-secondary btn-sm" onclick="mktSetBudget('${a.id}')">Set</button>
        </div>
      </td>
      <td>
        ${a.status === 'active'
          ? `<button class="btn btn-secondary btn-sm" onclick="mktPauseAdSet('${a.id}')">Pause</button>`
          : `<button class="btn btn-secondary btn-sm" onclick="mktResumeAdSet('${a.id}')">Resume</button>`}
      </td>
    </tr>`).join('')}</table>`;
}

async function mktPauseAdSet(id) {
  if (!confirm('Pause this ad set on Meta now?')) return;
  const res = await fetch(window.MARKETING_BACKEND_URL + '/api/adsets/' + id + '/pause', { method: 'POST' });
  if (!res.ok) { alert('Failed: ' + (await res.json()).error); return; }
  mktLoadAdSets();
}

async function mktResumeAdSet(id) {
  if (!confirm('Resume this ad set on Meta now?')) return;
  const res = await fetch(window.MARKETING_BACKEND_URL + '/api/adsets/' + id + '/resume', { method: 'POST' });
  if (!res.ok) { alert('Failed: ' + (await res.json()).error); return; }
  mktLoadAdSets();
}

async function mktSetBudget(id) {
  const input = document.getElementById('mkt-budget-' + id);
  const rupees = Number(input.value);
  if (!rupees || rupees <= 0) { alert('Enter a daily budget in rupees first.'); return; }
  if (!confirm(`Set daily budget to ₹${rupees}?`)) return;
  const res = await fetch(window.MARKETING_BACKEND_URL + '/api/adsets/' + id + '/budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dailyBudgetCents: Math.round(rupees * 100) }),
  });
  if (!res.ok) { alert('Failed: ' + (await res.json()).error); return; }
  mktLoadAdSets();
}

/* ---------- WINNERS ---------- */
async function mktLoadWinners() {
  mktInit();
  const box = document.getElementById('mkt-winners-grid');
  if (!mktSupabase) { box.innerHTML = '<p class="mkt-empty">Marketing Supabase not configured.</p>'; return; }
  const { data, error } = await mktSupabase.from('ad_sets').select('*').eq('last_verdict', 'scale').order('last_roas', { ascending: false });
  if (error) { box.innerHTML = '<p class="mkt-empty">Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  if (!data.length) { box.innerHTML = '<p class="mkt-empty">Nothing crossed the scale threshold yet.</p>'; return; }
  box.innerHTML = data.map(a => `
    <div class="mkt-winner-card">
      <div class="mkt-wc-top"><strong>${mktEsc(a.name)}</strong><span class="mkt-wc-roas">${mktFmtRoas(a.last_roas)}</span></div>
      <div style="font-size:12px;color:var(--text2);">Spend ${mktFmtMoney(a.last_spend)} · CPA ${mktFmtMoney(a.last_cpa)} · ${a.last_purchases || 0} purchases</div>
    </div>
  `).join('');
}

/* ---------- ON-DEMAND REPORT ---------- */
async function mktRunReportNow() {
  const btn = document.getElementById('mkt-run-report-btn');
  const status = document.getElementById('mkt-run-report-status');
  const box = document.getElementById('mkt-run-report-result');
  btn.disabled = true;
  status.textContent = 'Running — pulling live Meta insights…';
  box.innerHTML = '';
  try {
    const res = await fetch(window.MARKETING_BACKEND_URL + '/api/reports/run-now', { method: 'POST' });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Request failed');
    status.textContent = 'Done at ' + new Date(payload.ranAt).toLocaleTimeString();
    box.innerHTML = (payload.results || []).map(r => r.error
      ? `<div class="mkt-angle"><strong>${mktEsc(r.campaign)}</strong><div style="color:#963848;font-size:12px;">${mktEsc(r.error)}</div></div>`
      : `<div class="mkt-angle"><strong>${mktEsc(r.campaign)}</strong><p style="margin:4px 0 0;">${mktEsc(r.summary)}</p></div>`
    ).join('') || '<p class="mkt-empty">No approved, launched campaigns to report on yet.</p>';
    mktLoadReportLogs();
  } catch (e) {
    status.textContent = 'Failed: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}


async function mktGenerateCampaign() {
  const product = document.getElementById('mkt-product').value;
  const goal = document.getElementById('mkt-goal').value;
  const tone = document.getElementById('mkt-tone').value;
  const status = document.getElementById('mkt-generate-status');
  status.textContent = 'Generating…';
  try {
    const res = await fetch(window.MARKETING_BACKEND_URL + '/api/campaigns/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, goal, tone }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    status.textContent = 'Done';
    mktLoadCampaigns();
  } catch (e) {
    status.textContent = 'Failed: ' + e.message;
  }
}

async function mktLoadCampaigns() {
  mktInit();
  const list = document.getElementById('mkt-campaign-list');
  if (!list) return;
  if (!mktSupabase) { list.innerHTML = '<p>Marketing Supabase not configured yet — fill in window.MARKETING_SUPABASE_URL above.</p>'; return; }
  const { data, error } = await mktSupabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) { list.innerHTML = '<p>Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  list.innerHTML = data.map(c => `
    <div class="mkt-angle">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${c.product_image_url ? `<img src="${adminCdnImg(mktEsc(c.product_image_url))}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
          <strong>${mktEsc(c.product_name)}</strong>
        </div>
        <span class="mkt-pill ${mktEsc(c.status)}">${mktEsc(c.status)}</span>
      </div>
      <div style="font-size:13px;color:var(--text2);margin:4px 0 8px;">${mktEsc(c.goal)} · ${mktEsc(c.tone)}</div>
      ${c.compliance_notes ? `<div style="font-size:12px;color:#854f0b;background:#fff7e6;border-radius:6px;padding:8px;margin-bottom:8px;">${mktEsc(c.compliance_notes)}</div>` : ''}
      ${c.status === 'pending_approval' ? `
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="mktApprove('${c.id}')">Approve and launch (paused)</button>
          <button class="btn btn-secondary btn-sm" onclick="mktReject('${c.id}')">Reject</button>
        </div>
      ` : ''}
    </div>
  `).join('') || '<p>No campaigns yet.</p>';
}

async function mktApprove(id) {
  if (!confirm('This creates a paused campaign on Meta. Continue?')) return;
  const res = await fetch(window.MARKETING_BACKEND_URL + '/api/campaigns/' + id + '/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: (window.currentAdminUser || 'admin') }),
  });
  if (!res.ok) { alert('Approval failed: ' + (await res.json()).error); return; }
  mktLoadCampaigns();
}

async function mktReject(id) {
  await fetch(window.MARKETING_BACKEND_URL + '/api/campaigns/' + id + '/reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: (window.currentAdminUser || 'admin') }),
  });
  mktLoadCampaigns();
}

async function mktAnalyzeReport() {
  const rawData = document.getElementById('mkt-report-data').value.trim();
  const status = document.getElementById('mkt-report-status');
  if (!rawData) { status.textContent = 'Paste data first'; return; }
  status.textContent = 'Analyzing…';
  try {
    const res = await fetch(window.MARKETING_BACKEND_URL + '/api/reports/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawData }),
    });
    const report = await res.json();
    if (!res.ok) throw new Error(report.error || 'Request failed');
    status.textContent = 'Done';
    document.getElementById('mkt-report-result').innerHTML = `
      <div class="mkt-angle"><p>${mktEsc(report.summary)}</p></div>
      ${(report.rows || []).map(r => `
        <div class="mkt-angle" style="display:flex;justify-content:space-between;">
          <span>${mktEsc(r.ad_set)}</span>
          <span class="mkt-pill ${mktEsc(r.verdict)}">${mktEsc(r.verdict)}</span>
        </div>`).join('')}
    `;
    mktLoadReportLogs();
  } catch (e) {
    status.textContent = 'Failed: ' + e.message;
  }
}

async function mktLoadReportLogs() {
  mktInit();
  const list = document.getElementById('mkt-report-log-list');
  if (!mktSupabase || !list) return;
  const { data, error } = await mktSupabase.from('performance_logs').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) { list.innerHTML = '<p>Failed to load: ' + mktEsc(error.message) + '</p>'; return; }
  list.innerHTML = data.map(r => `
    <div class="mkt-angle" style="display:flex;justify-content:space-between;">
      <span>${mktEsc(r.ad_set_name)}</span>
      <span class="mkt-pill ${mktEsc(r.verdict)}">${mktEsc(r.verdict)}</span>
    </div>
  `).join('') || '<p>No logs yet.</p>';
}

async function mktScanOpportunities() {
  const rawData = document.getElementById('mkt-opp-data').value.trim();
  const status = document.getElementById('mkt-opp-status');
  if (!rawData) { status.textContent = 'Paste data first'; return; }
  status.textContent = 'Scanning…';
  try {
    const res = await fetch(window.MARKETING_BACKEND_URL + '/api/opportunities/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawData }),
    });
    const report = await res.json();
    if (!res.ok) throw new Error(report.error || 'Request failed');
    status.textContent = 'Done';
    document.getElementById('mkt-opp-result').innerHTML = `
      <div class="mkt-angle"><strong>Push:</strong> ${mktEsc(report.push_recommendation)}</div>
      <div class="mkt-angle"><strong>Bundle idea:</strong> ${mktEsc(report.bundle_idea)}</div>
      ${report.discount_candidate ? `<div class="mkt-angle"><strong>Discount candidate:</strong> ${mktEsc(report.discount_candidate)}</div>` : ''}
    `;
  } catch (e) {
    status.textContent = 'Failed: ' + e.message;
  }
}

// Load the Overview tab when the Marketing nav item is first opened —
// patches the existing showPage() (defined earlier in this file) without
// touching it.
const _mktOrigShowPage = window.showPage;
if (typeof _mktOrigShowPage === 'function') {
  window.showPage = function (name) {
    _mktOrigShowPage(name);
    if (name === 'marketing') mktShowTab('overview');
  };
}


/* ══ block 15 (origin 857735-859003, 1251 B) ══ */
/* ═══════════════════════════════════════════════════════════════════
   Marketing proxy auth shim
   The Live Ads and Strategy tabs call fetch(MARKETING_BACKEND_URL + ...)
   with no headers. Those calls now land on the backend's admin-gated
   /api/marketing/* proxy, so they need the same bearer token every other
   admin call already sends. Wrapping fetch keeps all five call sites
   untouched and picks up any added later.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__mktAuthShim) return;
  window.__mktAuthShim = true;
  var _fetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      if (url.indexOf('/api/marketing') !== -1 && typeof authToken !== 'undefined' && authToken) {
        init = init || {};
        var h = new Headers(init.headers || {});
        if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + authToken);
        if (!h.has('Content-Type') && init.body) h.set('Content-Type', 'application/json');
        init.headers = h;
      }
    } catch (e) { /* never let the shim break a request */ }
    return _fetch.call(this, input, init);
  };
})();

