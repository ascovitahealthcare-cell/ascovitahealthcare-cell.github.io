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
const AZ_MODAL_TPL2 = '<div class="modal" style="max-width:640px"><div class="modal-hdr"><div class="modal-title">{title}</div><button type="button" class="modal-close" onclick="closeModal(\'{id}\')">✕</button></div><div class="modal-body">{body}</div>{btns}</div>';
function azBuildModal2(id, title, body, buttons){
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'modal-overlay';
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
    document.body.appendChild(el);
  }
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.style.zIndex = '4000';
  const btnsHtml = (buttons || []).map((b,i) =>
    `<button type="button" class="btn ${b.cls||''}" data-azmodal-idx="${i}">${escHtml(b.label)}</button>`).join('');
  el.innerHTML = AZ_MODAL_TPL2.replace('{id}', id).replace('{title}', escHtml(title))
    .replace('{body}', body).replace('{btns}', btnsHtml
      ? '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end">' + btnsHtml + '</div>' : '');
  (buttons || []).forEach((b,i) => {
    const btn = el.querySelector(`button[data-azmodal-idx="${i}"]`);
    if (btn) btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await b.action(); } catch (e) { if (e?.message !== 'cancelled') toast('❌ ' + e.message, 'error'); }
      finally { btn.disabled = false; }
    });
  });
  el.classList.add('open');
  if (id === 'azProofModal') setTimeout(() => document.getElementById('azProofPw')?.focus(), 0);
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
function azSavePwRequired(){ return true; }
async function azSavePwRequiredFresh(){
  const cached = azSessionUser();
  try {
    const r = await apiFetch('/api/admin/me');
    if (r && r.ok) {
      const fresh = await r.json();
      const next = { ...cached, username:fresh.username, role:fresh.role, is_owner:!!fresh.is_owner, permissions:fresh.permissions, denied:fresh.denied, security:fresh.security || null };
      localStorage.setItem('ascovita_session', JSON.stringify(next));
      // Fail closed: a missing, stale, or false flag must never downgrade a critical action to the login password.
      return true;
    }
  } catch (_) {}
  return true;
}
async function confirmCriticalAction(promptText, actionFn){
  // Refresh the save-password requirement and identity cache before every
  // critical action; the server binds the proof to the authenticated JWT.
  const saveRequired = await azSavePwRequiredFresh();
  // Proofs are one-use on the server. Never cache or replay one after a
  // successful action; every save/approval gets a fresh confirmation.
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
            method: 'POST', body: JSON.stringify({ password: pw }),
          });
          const d = await r.json();
          if (!r.ok || !d.proof) throw new Error(d.error || 'Password did not match');
          __proof = null; __proofExp = 0;
          // Keep the dialog mounted until the protected action succeeds. If
          // the server rejects the proof or session, the catch block below
          // can show the real error inside this still-visible dialog.
          const actionResult = await actionFn(d.proof);
          closeModal('azProofModal');
          resolve(actionResult);
        } catch (e) {
          const networkFailure = e && (e.name === 'TypeError' || e.name === 'AbortError' || /failed to fetch|network/i.test(String(e.message || '')));
          msg.textContent = networkFailure
            ? 'Admin server is temporarily unreachable. Please wait a few seconds and try again.'
            : (e.message || 'Confirmation failed — please try again');
          msg.style.display = 'block';
        }
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
  selected = Array.isArray(selected) ? selected : [];
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
    const meResponse = await apiFetch('/api/admin/me');
    if (!meResponse.ok) throw new Error('Could not verify the current admin role');
    const me = await meResponse.json();
    const isOwner = me && (me.is_owner === true || me.role === 'owner');
    notice.style.display = isOwner ? 'none' : 'block';
    content.style.display = isOwner ? '' : 'none';
    if (!isOwner) return;
    const staffResponse = await apiFetch('/api/admin/staff');
    const d = await staffResponse.json();
    if (!staffResponse.ok || d.error) throw new Error(d.error || 'Could not load staff list');
    const rows = (Array.isArray(d.staff) ? d.staff : []).map(s => {
      const statusCls = s.enabled ? 'badge-ok' : 'badge-bad';
      const statusTxt = s.enabled ? 'Active' : 'Suspended';
      const permissions = Array.isArray(s.permissions) ? s.permissions : [];
      const permTags = permissions.length
        ? permissions.map(p=>`<span style="font-size:.62rem;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:1px 5px">${escHtml(azStaffPermLabel(p))}</span>`).join(' ')
        : '<span style="font-size:.7rem;color:var(--text3)">Full admin (default role)</span>';
      return `<tr style="border-bottom:1px solid var(--border);vertical-align:top">
        <td style="padding:10px;font-weight:600">${escHtml(s.username)}</td>
        <td style="padding:10px"><span class="badge badge-gold">${escHtml(s.role)}</span></td>
        <td style="padding:10px"><span class="badge ${statusCls}">${statusTxt}</span></td>
        <td style="padding:10px;max-width:320px">${permTags}</td>
        <td style="padding:10px;font-size:.72rem;color:var(--text3)">${s.last_login_at ? new Date(s.last_login_at).toLocaleString() : '—'}</td>
        <td style="padding:10px;text-align:right;white-space:nowrap">
          <button class="btn btn-secondary" style="font-size:.68rem;padding:4px 9px" onclick="azStaffEditPerms('${escHtml(s.username)}', ${JSON.stringify(permissions).replace(/"/g,'&quot;')})">✏️ Perms</button>
          <button class="btn btn-secondary" style="font-size:.68rem;padding:4px 9px" onclick="azStaffApplyProfile('${escHtml(s.username)}','full')">⬆ Promote</button>
          <button class="btn btn-secondary" style="font-size:.68rem;padding:4px 9px" onclick="azStaffApplyProfile('${escHtml(s.username)}','support')">⬇ Demote</button>
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

async function azStaffApplyProfile(username, profile){
  const isFull = profile === 'full';
  const permissions = isFull ? null : (AZ_STAFF_PRESETS?.support || ['orders.view','customers.view','products.view']);
  const label = isFull ? 'promote to full operations access' : 'demote to the Support profile';
  try {
    await confirmCriticalAction(`${isFull ? 'Promote' : 'Demote'} ${username} — ${label}?`, async function(proof){
      const r = await apiFetch('/api/admin/staff/' + encodeURIComponent(username), {
        method:'PUT', headers: proof ? {'X-Password-Proof': proof} : {}, body: JSON.stringify({permissions}),
      });
      const d = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(d.error || 'Profile update failed');
      return d;
    });
    toast(`${username} ${isFull ? 'promoted' : 'demoted'} ✅`);
    loadStaffPage();
  } catch (e) { if (e.message !== 'cancelled') toast('❌ ' + e.message, 'error'); }
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
  if (String(url || '').startsWith('/api/')) {
    const r = await apiFetch(url, opts || {});
    return r.json().catch(() => ({}));
  }
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (sessionStorage.getItem('ascovita_token') || '') } }, opts || {}));
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
    const engineReady = !!(st && !st.error);
    const engineState = document.getElementById('autEngineState');
    if (engineState) {
      engineState.className = 'oz-pill ' + (engineReady ? 'info' : 'error');
      engineState.textContent = engineReady ? 'Ready · live endpoint' : 'Unavailable';
    }
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
    const flowStates = document.querySelectorAll('#autExecutionFlow .oz-flow-state');
    flowStates.forEach((el, index) => {
      const waiting = index === 2 && list.length > 0;
      el.className = 'oz-flow-state ' + (engineReady ? (waiting ? 'wait' : '') : 'off');
      el.textContent = engineReady ? (waiting ? 'queued' : 'passed') : 'unavailable';
    });
    if (!list.length) { qe.innerHTML = '<div class="oz-empty"><strong>Nothing pending</strong>All returns are currently clear; the manual override remains available.</div>'; }
    else {
      const rows = list.map(x => `<tr><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.id}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.order_id}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.status}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.nextAction}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${x.dueInHours === 0 ? 'now' : (x.dueInHours + ' h')}</td></tr>`).join('');
      qe.innerHTML = `<div class="oz-table-scroll"><table class="oz-data-table"><thead><tr><th>Return</th><th>Order</th><th>Status</th><th>Next</th><th>Due</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    // Reconciliation
    const re = document.getElementById('autReconTable');
    const hist = rc.data || [];
    if (!hist.length) { re.innerHTML = '<div>History starts after the first scheduled reconciliation run (every 6 hours) or press "Reconcile now".</div>' + (rc.note ? `<div style="color:var(--text3);font-size:0.75rem;margin-top:4px;">${esc(rc.note)}</div>` : ''); }
    else {
      const hrows = hist.map(h => `<tr><td style="padding:6px 8px;border-top:1px solid var(--border);">${h.period}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.online_paid||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.gateway_gross||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">₹${Number(h.cod_collected||0).toFixed(0)}</td><td style="padding:6px 8px;border-top:1px solid var(--border);">${esc((h.warnings||'—').slice(0,100))}</td></tr>`).join('');
      re.innerHTML = `<div class="oz-table-scroll"><table class="oz-data-table"><thead><tr><th>Day</th><th>Online paid</th><th>Gateway gross</th><th>COD collected</th><th>Warnings</th></tr></thead><tbody>${hrows}</tbody></table></div>`;
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

  mktRenderPerformanceChart(active);
  mktRenderAutomationFlow({ active: active.length, pending, totalSpend, totalPurchases });

  // Automation status strip — fetched from the dedicated status endpoint
  // (one cheap call instead of five), through the admin-gated proxy.
  mktLoadAutomationStatus();
}

function mktRenderPerformanceChart(adSets) {
  const host = document.getElementById('mkt-performance-chart');
  if (!host) return;
  const rows = (adSets || []).slice().sort((a, b) => (Number(b.last_roas) || 0) - (Number(a.last_roas) || 0)).slice(0, 6);
  if (!rows.length) {
    host.innerHTML = '<p class="mkt-empty">No active ad-set performance is available yet.</p>';
    return;
  }
  const maxRoas = Math.max(...rows.map(a => Number(a.last_roas) || 0), 1);
  host.innerHTML = rows.map((a, index) => {
    const roas = Number(a.last_roas) || 0;
    const spend = Number(a.last_spend) || 0;
    const width = Math.max(4, Math.round((roas / maxRoas) * 100));
    const verdict = a.last_verdict === 'pause' ? ' · pause' : '';
    return '<div class="mkt-bar-row" title="' + mktEsc((a.name || 'Unnamed ad set') + ' · ROAS ' + roas.toFixed(2) + 'x') + '">' +
      '<div class="mkt-bar-label">' + mktEsc(a.name || 'Unnamed ad set') + '</div>' +
      '<div class="mkt-bar-track"><div class="mkt-bar-fill" style="width:' + width + '%;animation-delay:' + (index * 70) + 'ms"></div></div>' +
      '<div class="mkt-bar-value">' + roas.toFixed(2) + 'x · ' + mktFmtMoney(spend) + mktEsc(verdict) + '</div>' +
      '</div>';
  }).join('');
}

function mktRenderAutomationFlow(metrics) {
  const host = document.getElementById('mkt-automation-flow');
  if (!host) return;
  const active = Number(metrics.active) || 0;
  const pending = Number(metrics.pending) || 0;
  const spend = Number(metrics.totalSpend) || 0;
  const purchases = Number(metrics.totalPurchases) || 0;
  const nodes = [
    ['◉', 'Signals', active ? active + ' active ad sets' : 'Waiting for data', active ? 'ready' : 'muted'],
    ['↗', 'Score & segment', active ? 'Behaviour rules ready' : 'Awaiting signals', active ? 'ready' : 'muted'],
    ['◇', 'Review gate', pending ? pending + ' approvals pending' : 'No approvals waiting', pending ? 'warn' : 'ready'],
    ['✉', 'Deliver', spend || purchases ? 'Channels can dispatch safely' : 'Test mode / no activity', spend || purchases ? 'ready' : 'muted'],
    ['⌁', 'Learn', 'Reports refresh the next decision', 'ready']
  ];
  host.innerHTML = nodes.map((node, index) => {
    const item = '<div class="mkt-flow-node"><div class="mkt-flow-icon">' + node[0] + '</div><div><strong>' + mktEsc(node[1]) + '</strong><div class="mkt-sub">' + mktEsc(node[2]) + '</div></div><span class="mkt-flow-state ' + node[3] + '">' + (node[3] === 'warn' ? 'review' : node[3]) + '</span></div>';
    return index === nodes.length - 1 ? item : item + '<div class="mkt-flow-arrow">↓</div>';
  }).join('');
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
    var url = (typeof input === 'string') ? input : (input && input.url) || '';
    init = init || {};
    var method = String(init.method || 'GET').toUpperCase();
    var isWrite = /^(POST|PUT|PATCH|DELETE)$/.test(method);
    if (url.indexOf('/api/marketing') !== -1 && typeof authToken !== 'undefined' && authToken) {
      var h = new Headers(init.headers || {});
      if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + authToken);
      if (!h.has('Content-Type') && init.body) h.set('Content-Type', 'application/json');
      if (isWrite && !h.has('X-Password-Proof') && typeof confirmCriticalAction === 'function') {
        return confirmCriticalAction('Authorize this marketing change? This action requires your separate save password.', function(proof){
          h.set('X-Password-Proof', proof);
          init.headers = h;
          return _fetch.call(this, input, init);
        }.bind(this));
      }
      init.headers = h;
    }
    return _fetch.call(this, input, init);
  };
})();



/* ═══════════════════════════════════════════════════════════════════════════
   OZYLIX BEHAVIOUR ENGINE — admin panel tabs  (Aug 2026)

   Appended at the end of the file. Nothing above is edited, matching the
   convention the rest of this file already uses.

   Two data paths, both already configured earlier in this file:
     · mktSupabase            — marketing Supabase anon client, read-only via
                                RLS. Used for plain list reads.
     · MARKETING_BACKEND_URL  — the main backend's /api/marketing/* proxy,
                                which checks a real admin JWT and the
                                marketing.manage permission, then attaches
                                INTERNAL_API_KEY server-side. That proxy
                                forwards any suffix unchanged, so /api/dash/*
                                works with no change to the main backend.

   The fetch auth shim above already stamps the bearer token onto anything
   whose URL contains /api/marketing, so these calls inherit it for free.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__ozyBehaviourTabs) return;
  window.__ozyBehaviourTabs = true;

  var BEH_TABS = ['behaviour', 'segments', 'journeys', 'recovery', 'automations', 'attribution'];

  function api(path, opts) {
    return fetch(window.MARKETING_BACKEND_URL + '/api/dash' + path, opts)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
  }
  function money(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
  function pct(n)   { return (Number(n || 0) * 100).toFixed(1) + '%'; }
  function num(n)   { return Number(n || 0).toLocaleString('en-IN'); }
  function ago(t) {
    if (!t) return '—';
    var s = Math.round((Date.now() - new Date(t)) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }
  function scoreChip(v) {
    var cls = v >= 60 ? 'hot' : v >= 30 ? 'warm' : 'cold';
    return '<span class="mkt-score ' + cls + '">' + Math.round(v || 0) + '</span>';
  }
  function fail(elId, e) {
    var el = document.getElementById(elId);
    if (!el) return;
    // A specific, honest error beats a spinner that never resolves. The most
    // common causes here are a cold Render dyno and a missing migration, so
    // both are named rather than left for the reader to guess.
    el.innerHTML = '<div class="mkt-hint warn">Could not load: ' + esc(e.message) +
      '<br><span class="mkt-sub">Usually either the marketing service is still waking up (free Render dynos cold-start), ' +
      'or <code>supabase/002_behaviour_engine.sql</code> has not been run in the marketing Supabase project yet.</span></div>';
  }

  /* ── tab routing ───────────────────────────────────────────────────────
     mktShowTab is wrapped rather than edited so the seven existing tabs keep
     working through exactly the same code path they always did. */
  var origShowTab = window.mktShowTab;
  window.mktShowTab = function (tab) {
    if (BEH_TABS.indexOf(tab) === -1) {
      return origShowTab.apply(this, arguments);
    }
    document.querySelectorAll('.mkt-tab').forEach(function (t) { t.style.display = 'none'; });
    var el = document.getElementById('mkt-tab-' + tab);
    if (el) el.style.display = 'block';
    document.querySelectorAll('.mkt-navbtn').forEach(function (b) {
      b.classList.toggle('mkt-active', b.dataset.tab === tab);
    });
    if (tab === 'behaviour')   mktLoadBehaviour();
    if (tab === 'segments')    mktLoadSegments();
    if (tab === 'journeys')    mktLoadTopIntent();
    if (tab === 'recovery')    mktLoadRecovery();
    if (tab === 'automations') { mktLoadAutomations(); mktLoadOutbox(); }
    if (tab === 'attribution') mktLoadAttribution();
  };

  /* ── BEHAVIOUR ─────────────────────────────────────────────────────── */

  window.mktLoadBehaviour = function () {
    api('/overview?days=30').then(function (d) {
      document.getElementById('beh-kpi-live').textContent      = num(d.live.active_visitors);
      document.getElementById('beh-kpi-intent').textContent    = num(d.live.high_intent_visitors);
      document.getElementById('beh-kpi-sessions').textContent  = num(d.traffic.sessions);
      document.getElementById('beh-kpi-cvr').textContent       = pct(d.funnel.conversion_rate);
      document.getElementById('beh-kpi-revenue').textContent   = money(d.revenue.total);
      document.getElementById('beh-kpi-recovered').textContent = money(d.revenue.recovered);

      var f = d.funnel;
      var steps = [
        { label: 'Sessions',          value: f.sessions },
        { label: 'Product views',     value: d.traffic.product_views },
        { label: 'Carts created',     value: f.carts_created },
        { label: 'Checkouts started', value: f.checkouts_started },
        { label: 'Orders',            value: f.orders }
      ];
      var top = Math.max.apply(null, steps.map(function (s) { return s.value || 0; })) || 1;
      document.getElementById('beh-funnel').innerHTML = steps.map(function (s, i) {
        var prev = i > 0 ? steps[i - 1].value : null;
        var drop = prev ? ' <span class="mkt-sub">(' + pct(prev ? s.value / prev : 0) + ' of previous)</span>' : '';
        return '<div class="mkt-funnel-row">' +
          '<div class="mkt-funnel-label">' + esc(s.label) + '</div>' +
          '<div class="mkt-funnel-bar" style="width:' + Math.max(2, (s.value / top) * 100) + '%"></div>' +
          '<div class="mkt-funnel-val">' + num(s.value) + drop + '</div></div>';
      }).join('');

      document.getElementById('beh-dropoff').innerHTML =
        '<table class="mkt-table"><tbody>' +
        '<tr><td>Cart abandonment</td><td style="text-align:right"><strong>' + pct(f.cart_abandon_rate) + '</strong></td></tr>' +
        '<tr><td>Checkout abandonment</td><td style="text-align:right"><strong>' + pct(f.checkout_abandon_rate) + '</strong></td></tr>' +
        '<tr><td>Add-to-cart rate</td><td style="text-align:right">' + pct(f.add_to_cart_rate) + '</td></tr>' +
        '<tr><td>Checkout rate</td><td style="text-align:right">' + pct(f.checkout_rate) + '</td></tr>' +
        '<tr><td>Abandoned cart value</td><td style="text-align:right">' + money(d.recovery.abandoned_value) + '</td></tr>' +
        '<tr><td>Recovered so far</td><td style="text-align:right"><strong>' + money(d.recovery.recovered_value) + '</strong></td></tr>' +
        '<tr><td>Automation-attributed revenue</td><td style="text-align:right"><strong>' + money(d.revenue.automation_attributed) + '</strong></td></tr>' +
        '</tbody></table>';
    })['catch'](function (e) { fail('beh-funnel', e); fail('beh-dropoff', e); });

    api('/health').then(function (h) {
      // Older deployments and partially failed health responses may omit
      // nested objects. Normalize them before rendering so one missing field
      // cannot crash the whole behaviour dashboard.
      h = h && typeof h === 'object' ? h : {};
      var channels = h.channels && typeof h.channels === 'object' && !Array.isArray(h.channels)
        ? h.channels : {};
      var outbox = h.outbox && typeof h.outbox === 'object' ? h.outbox : {};
      var integrations = h.integrations && typeof h.integrations === 'object' ? h.integrations : {};
      var cls = h.status === 'healthy' ? 'ok' : h.status === 'degraded' || h.status === 'stale' ? 'warn' : 'warn';
      var chan = Object.keys(channels).map(function (k) {
        var c = channels[k] && typeof channels[k] === 'object' ? channels[k] : {};
        return (c.enabled ? '✅ ' : '⚪ ') + esc(k) + (c.note ? ' <span class="mkt-sub">(' + esc(c.note) + ')</span>' : '');
      }).join(' &nbsp;·&nbsp; ') || '⚪ channel status unavailable';
      document.getElementById('beh-health').className = 'mkt-hint ' + cls;
      document.getElementById('beh-health').innerHTML =
        '<strong>Engine:</strong> ' + esc(h.status) +
        (h.minutes_since_tick != null ? ' — last tick ' + h.minutes_since_tick + 'm ago' : ' — has never run') +
        ' · ' + num(h.events_last_hour) + ' events in the last hour' +
        ' · outbox ' + num(outbox.queued) + ' queued, ' + num(outbox.failed) + ' failed<br>' +
        '<strong>Channels:</strong> ' + chan +
        '<br><strong>Server-side events:</strong> ' +
        (integrations.meta_capi ? '✅' : '⚪') + ' Meta CAPI &nbsp;·&nbsp; ' +
        (integrations.ga4_mp ? '✅' : '⚪') + ' GA4 Measurement Protocol' +
        (h.last_tick_error ? '<br><strong>Last error:</strong> ' + esc(h.last_tick_error) : '') +
        (!h.status ? '<br><strong>Health response incomplete:</strong> service may be waking up or needs the behaviour-engine migration.' : '');
    })['catch'](function (e) { fail('beh-health', e); });

    api('/live').then(function (d) {
      if (!d.visitors.length) {
        document.getElementById('beh-live').innerHTML = '<p class="mkt-empty">Nobody on the site right now.</p>';
        return;
      }
      document.getElementById('beh-live').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Intent</th><th>Visitor</th><th>On page</th>' +
        '<th>Source</th><th>Device</th><th>Views</th><th>Time</th><th></th></tr></thead><tbody>' +
        d.visitors.map(function (v) {
          return '<tr>' +
            '<td>' + scoreChip(v.intent_score) + '</td>' +
            '<td>' + esc(v.email || 'Anonymous') +
              (v.total_orders ? ' <span class="mkt-pill approved">' + v.total_orders + ' orders</span>' : '') +
              (v.in_checkout ? ' <span class="mkt-pill pending_approval">in checkout</span>' : '') + '</td>' +
            '<td>' + esc(v.on_page || '—') + '</td>' +
            '<td>' + esc(v.source || '—') + (v.campaign ? '<br><span class="mkt-sub">' + esc(v.campaign) + '</span>' : '') + '</td>' +
            '<td>' + esc(v.device || '—') + '</td>' +
            '<td>' + num(v.page_views) + '</td>' +
            '<td>' + Math.round(v.seconds_on_site / 60) + 'm</td>' +
            '<td><button class="btn btn-secondary btn-sm" onclick="mktOpenJourney(\'' + esc(v.profile_id) + '\')">View</button></td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    })['catch'](function (e) { fail('beh-live', e); });

    api('/products').then(function (d) {
      if (!d.products.length) {
        document.getElementById('beh-products').innerHTML = '<p class="mkt-empty">No product interest recorded yet.</p>';
        return;
      }
      document.getElementById('beh-products').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Product</th><th>People</th><th>Views</th><th>Carts</th>' +
        '<th>Purchases</th><th>View→Cart</th><th>Cart→Buy</th></tr></thead><tbody>' +
        d.products.slice(0, 25).map(function (p) {
          // A low view→cart rate on a well-viewed product is the clearest
          // signal in this whole panel: the traffic is there, the page or
          // the price is not converting it.
          var weak = p.views >= 20 && p.view_to_cart < 0.05;
          return '<tr>' +
            '<td>' + esc(p.product_name || p.product_id) +
              (weak ? ' <span class="mkt-pill pause">low conversion</span>' : '') + '</td>' +
            '<td>' + num(p.interested_people) + '</td>' +
            '<td>' + num(p.views) + '</td>' +
            '<td>' + num(p.carts) + '</td>' +
            '<td>' + num(p.purchases) + '</td>' +
            '<td>' + pct(p.view_to_cart) + '</td>' +
            '<td>' + pct(p.cart_to_purchase) + '</td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    })['catch'](function (e) { fail('beh-products', e); });
  };

  /* ── SEGMENTS ──────────────────────────────────────────────────────── */

  window.mktLoadSegments = function () {
    api('/segments').then(function (d) {
      if (!d.segments.length) {
        document.getElementById('seg-grid').innerHTML =
          '<p class="mkt-empty">No segments yet — run the migration and let the engine tick once.</p>';
        return;
      }
      document.getElementById('seg-grid').innerHTML = '<div class="mkt-seg-grid">' +
        d.segments.map(function (s) {
          return '<div class="mkt-seg-card" onclick="mktLoadSegmentMembers(\'' + esc(s.key) + '\',\'' + esc(s.name) + '\')">' +
            '<div class="mkt-seg-count">' + num(s.member_count) + '</div>' +
            '<div style="font-weight:700;font-size:13.5px;margin-bottom:3px;">' + esc(s.name) + '</div>' +
            '<div class="mkt-sub">' + esc(s.description || '') + '</div>' +
            '<div class="mkt-sub" style="margin-top:6px;">' +
              (s.total_revenue ? money(s.total_revenue) + ' lifetime · ' : '') +
              'avg intent ' + Math.round(s.avg_intent) +
            '</div></div>';
        }).join('') + '</div>';
      var filter = document.getElementById('seg-customer-segment');
      if (filter) {
        var selected = filter.value;
        filter.innerHTML = '<option value="">All segments</option>' + d.segments.map(function (s) {
          return '<option value="' + esc(s.key) + '">' + esc(s.name) + '</option>';
        }).join('');
        filter.value = selected;
      }
      mktLoadCustomerDirectory();
    })['catch'](function (e) { fail('seg-grid', e); });
  };

  function contactLinks(profile) {
    var email = profile && profile.email;
    var phone = profile && profile.phone;
    var html = '<div style="display:flex;gap:5px;flex-wrap:wrap;">';
    if (email) html += '<a class="btn btn-secondary btn-sm" href="mailto:' + encodeURIComponent(email) + '">✉ Email</a>';
    if (phone) {
      var digits = String(phone).replace(/\D/g, '');
      if (digits) html += '<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + digits + '">WhatsApp</a>';
    }
    return html + '</div>';
  }

  function renderCustomerDirectory(rows) {
    if (!rows || !rows.length) return '<p class="mkt-empty">No identified customers match these filters.</p>';
    return '<table class="mkt-table"><thead><tr><th>Customer / identity</th><th>Stage</th><th>Segments</th>' +
      '<th>Last activity</th><th>Messages</th><th>Contact</th><th></th></tr></thead><tbody>' +
      rows.map(function (c) {
        var identity = c.customer_name || c.email || c.phone || 'Anonymous visitor';
        var ids = [c.customer_id ? 'ID: ' + c.customer_id : '', c.email || '', c.phone || ''].filter(Boolean).join('<br>');
        var segs = Array.isArray(c.segments) ? c.segments.map(esc).join(', ') : '—';
        return '<tr>' +
          '<td><strong>' + esc(identity) + '</strong><br><span class="mkt-sub">' + ids + '</span></td>' +
          '<td>' + esc(c.lifecycle_stage || 'visitor') + '<br>' + scoreChip(c.intent_score) + '</td>' +
          '<td>' + (segs || '—') + '</td>' +
          '<td>' + ago(c.last_seen) + (c.last_product_viewed ? '<br><span class="mkt-sub">viewed: ' + esc(c.last_product_viewed) + '</span>' : '') + '</td>' +
          '<td><strong>' + num(c.messages_sent) + '</strong> sent<br><span class="mkt-sub">' + num(c.email_total) + ' email · ' + num(c.whatsapp_total) + ' WhatsApp</span></td>' +
          '<td>' + contactLinks(c) + '</td>' +
          '<td><button class="btn btn-primary btn-sm" onclick="mktOpenJourney(\'' + esc(c.profile_id) + '\')">Activity</button> ' +
            '<button class="btn btn-secondary btn-sm" onclick="mktLoadCustomerMessages(\'' + esc(c.profile_id) + '\',\'' + esc(identity) + '\')">Messages</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  window.mktLoadCustomerMessages = function (profileId, name) {
    var host = document.getElementById('seg-customer-history');
    if (!host) return;
    host.innerHTML = '<p class="mkt-empty">Loading communication history for ' + esc(name || 'customer') + '…</p>';
    api('/customers/' + encodeURIComponent(profileId) + '/messages?limit=200').then(function (d) {
      var t = d.totals || {};
      var rows = d.messages || [];
      var header = '<div class="card" style="padding:14px 16px;">' +
        '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">' +
        '<h3 style="margin:0;">Communication history: ' + esc((d.profile && (d.profile.display_name || d.profile.email)) || name || 'Customer') + '</h3>' +
        '<span class="mkt-sub">' + num(t.sent) + ' sent · ' + num(t.skipped) + ' skipped · ' + num(t.failed) + ' failed · ' + num(t.clicked) + ' clicked</span></div>' +
        '<div class="mkt-sub" style="margin-top:5px;">Email: ' + num(t.email) + ' · WhatsApp: ' + num(t.whatsapp) + ' · Total records: ' + num(t.all) + '</div>';
      if (!rows.length) return host.innerHTML = header + '<p class="mkt-empty" style="margin-top:12px;">No outbound communication records for this customer.</p></div>';
      var table = '<div style="overflow:auto;margin-top:12px;"><table class="mkt-table"><thead><tr><th>When</th><th>Channel</th><th>Template / subject</th><th>Status</th><th>Provider</th><th>Engagement</th></tr></thead><tbody>' +
        rows.map(function (m) {
          var engagement = [m.delivered_at ? 'delivered ' + ago(m.delivered_at) : '', m.opened_at ? 'opened ' + ago(m.opened_at) : '', m.clicked_at ? 'clicked ' + ago(m.clicked_at) : ''].filter(Boolean).join('<br>') || '—';
          return '<tr><td>' + ago(m.created_at) + '</td><td>' + esc(m.channel || '—') + '</td><td>' + esc(m.template_key || m.subject || '—') + '</td><td>' + esc(m.status || '—') + (m.skip_reason ? '<br><span class="mkt-sub">' + esc(m.skip_reason) + '</span>' : '') + '</td><td>' + esc(m.provider || '—') + '</td><td>' + engagement + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
      host.innerHTML = header + table;
    })['catch'](function (e) { host.innerHTML = '<p class="mkt-empty">Communication history unavailable: ' + esc(e.message) + '</p>'; });
  };

  window.mktLoadCustomerDirectory = function () {
    var host = document.getElementById('seg-customer-table');
    if (!host) return;
    var status = document.getElementById('seg-customer-status');
    var days = (document.getElementById('seg-customer-window') || {}).value || '30';
    var q = ((document.getElementById('seg-customer-query') || {}).value || '').trim();
    var segment = (document.getElementById('seg-customer-segment') || {}).value || '';
    var channel = (document.getElementById('seg-customer-channel') || {}).value || '';
    host.innerHTML = '<p class="mkt-empty">Loading identified customers…</p>';
    if (status) status.textContent = 'Loading…';
    var qs = '?days=' + encodeURIComponent(days) + '&limit=250' +
      (q ? '&q=' + encodeURIComponent(q) : '') +
      (segment ? '&segment=' + encodeURIComponent(segment) : '') +
      (channel ? '&channel=' + encodeURIComponent(channel) : '');
    api('/customers' + qs).then(function (d) {
      host.innerHTML = renderCustomerDirectory(d.customers || []);
      if (status) status.textContent = num(d.total || 0) + ' customer(s) shown';
    })['catch'](function (e) {
      host.innerHTML = '<p class="mkt-empty">Customer directory unavailable: ' + esc(e.message) + '</p>';
      if (status) status.textContent = 'Error';
    });
  };

  window.mktLoadSegmentMembers = function (key, name) {
    var el = document.getElementById('seg-members');
    el.innerHTML = '<p class="mkt-empty">Loading ' + esc(name) + '…</p>';
    api('/segments/' + encodeURIComponent(key) + '/members?limit=100').then(function (d) {
      if (!d.members.length) {
        el.innerHTML = '<h3>' + esc(name) + '</h3><p class="mkt-empty">Nobody in this segment right now.</p>';
        return;
      }
      el.innerHTML = '<h3 style="margin-bottom:8px;">' + esc(name) +
        ' <span class="mkt-sub">' + d.members.length + ' shown, highest intent first</span></h3>' +
        '<table class="mkt-table"><thead><tr><th>Intent</th><th>Value</th><th>Customer</th><th>Stage</th>' +
        '<th>Orders</th><th>Lifetime</th><th>Last seen</th><th>Acquired via</th><th></th></tr></thead><tbody>' +
        d.members.map(function (m) {
          return '<tr>' +
            '<td>' + scoreChip(m.intent_score) + '</td>' +
            '<td>' + scoreChip(m.value_score) + '</td>' +
            '<td>' + esc(m.email || 'Anonymous') +
              (m.last_product_viewed ? '<br><span class="mkt-sub">last viewed: ' + esc(m.last_product_viewed) + '</span>' : '') + '</td>' +
            '<td>' + esc(m.lifecycle_stage) + '</td>' +
            '<td>' + num(m.total_orders) + '</td>' +
            '<td>' + money(m.total_revenue) + '</td>' +
            '<td>' + ago(m.last_seen) + '</td>' +
            '<td>' + esc(m.first_utm_source || m.first_utm_campaign || 'direct') + '</td>' +
            '<td><button class="btn btn-secondary btn-sm" onclick="mktOpenJourney(\'' + esc(m.id) + '\')">Journey</button></td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    })['catch'](function (e) { fail('seg-members', e); });
  };

  /* ── JOURNEYS ──────────────────────────────────────────────────────── */

  window.mktLoadTopIntent = function () {
    var el = document.getElementById('jrn-results');
    el.innerHTML = '<p class="mkt-empty">Loading…</p>';
    api('/scores').then(function (d) {
      if (!d.top_intent.length) {
        el.innerHTML = '<p class="mkt-empty">No scored profiles yet.</p>';
        return;
      }
      el.innerHTML = renderPeople(d.top_intent);
    })['catch'](function (e) { fail('jrn-results', e); });
  };

  window.mktSearchJourneys = function () {
    var q = (document.getElementById('jrn-search').value || '').trim().toLowerCase();
    var el = document.getElementById('jrn-results');
    if (!q) return mktLoadTopIntent();
    if (!mktSupabase) { el.innerHTML = '<p class="mkt-empty">Marketing Supabase not configured.</p>'; return; }
    el.innerHTML = '<p class="mkt-empty">Searching…</p>';
    mktSupabase.from('mkt_profiles')
      .select('id,email,intent_score,value_score,lifecycle_stage,total_orders,total_revenue,last_seen,last_product_viewed')
      .ilike('email', '%' + q + '%').eq('is_test', false).limit(50)
      .then(function (r) {
        if (r.error) throw new Error(r.error.message);
        if (!r.data.length) { el.innerHTML = '<p class="mkt-empty">No match for “' + esc(q) + '”.</p>'; return; }
        el.innerHTML = renderPeople(r.data);
      })['catch'](function (e) { fail('jrn-results', e); });
  };

  function renderPeople(rows) {
    return '<table class="mkt-table"><thead><tr><th>Intent</th><th>Value</th><th>Customer</th><th>Stage</th>' +
      '<th>Orders</th><th>Lifetime</th><th>Last seen</th><th></th></tr></thead><tbody>' +
      rows.map(function (m) {
        return '<tr>' +
          '<td>' + scoreChip(m.intent_score) + '</td>' +
          '<td>' + scoreChip(m.value_score) + '</td>' +
          '<td>' + esc(m.email || 'Anonymous visitor') + '</td>' +
          '<td>' + esc(m.lifecycle_stage) + '</td>' +
          '<td>' + num(m.total_orders) + '</td>' +
          '<td>' + money(m.total_revenue) + '</td>' +
          '<td>' + ago(m.last_seen) + '</td>' +
          '<td><button class="btn btn-primary btn-sm" onclick="mktOpenJourney(\'' + esc(m.id) + '\')">Open</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  window.mktOpenJourney = function (profileId) {
    mktShowTab('journeys');
    var el = document.getElementById('jrn-detail');
    el.innerHTML = '<p class="mkt-empty">Loading journey…</p>';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    api('/journey/' + encodeURIComponent(profileId)).then(function (d) {
      var p = d.profile;
      var c = d.consent;

      // The score breakdown is the point of this panel. A number with no
      // explanation is not actionable — this shows exactly which behaviours
      // produced it and how much each contributed.
      function breakdown(list, title) {
        if (!list || !list.length) return '';
        return '<div style="margin-bottom:12px;"><strong style="font-size:13px;">' + esc(title) + '</strong>' +
          '<table class="mkt-table" style="margin-top:6px;"><tbody>' +
          list.map(function (b) {
            return '<tr><td style="width:60px;font-weight:700;color:' +
              (b.points < 0 ? '#963848' : 'var(--accent,#1F7A6C)') + '">' +
              (b.points > 0 ? '+' : '') + b.points + '</td>' +
              '<td>' + esc(b.why) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }

      var consentHtml = c
        ? ['email', 'whatsapp', 'push'].map(function (ch) {
            return (c[ch + '_ok'] ? '✅ ' : '⛔ ') + ch;
          }).join(' &nbsp; ') + (c.unsubscribed_all ? ' &nbsp; <strong style="color:#963848">UNSUBSCRIBED</strong>' : '')
        : '<span style="color:#963848">No consent record — this person cannot be messaged.</span>';

      el.innerHTML =
        '<div class="card" style="padding:18px;">' +
          '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;align-items:flex-start;">' +
            '<div><h3 style="margin:0 0 4px;">' + esc(p.display_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Anonymous visitor') + '</h3>' +
            '<div class="mkt-sub">' + (p.email ? esc(p.email) : '') + (p.phone ? ' · ' + esc(p.phone) : '') + (p.customer_id ? ' · customer ID ' + esc(p.customer_id) : '') + '</div>' +
            '<div style="margin:8px 0;">' + contactLinks(p) + '</div>' +
            '<div class="mkt-sub">' + esc(p.lifecycle_stage) + ' · first seen ' + ago(p.first_seen) +
            ' · ' + num(p.total_sessions) + ' sessions · ' + num(p.total_orders) + ' orders · ' +
            money(p.total_revenue) + ' lifetime</div>' +
            '<div class="mkt-sub" style="margin-top:4px;">Acquired via ' +
              esc(p.first_utm_source || p.first_source || 'direct') +
              (p.first_utm_campaign ? ' / ' + esc(p.first_utm_campaign) : '') + '</div>' +
            '<div class="mkt-sub" style="margin-top:4px;">Segments: ' +
              ((p.segments || []).map(esc).join(', ') || 'none') + '</div></div>' +
            '<div style="text-align:right;"><div class="mkt-sub">Intent</div>' +
            '<div style="font-size:30px;font-weight:700;">' + Math.round(p.intent_score || 0) + '</div>' +
            '<div class="mkt-sub">Value ' + Math.round(p.value_score || 0) + '</div></div>' +
          '</div>' +
          '<div class="mkt-hint" style="margin:14px 0;"><strong>Consent:</strong> ' + consentHtml + '</div>' +
          '<div class="mkt-split">' +
            '<div>' + breakdown(p.intent_breakdown, 'Why this intent score') +
                      breakdown(p.value_breakdown, 'Why this value score') + '</div>' +
            '<div>' +
              '<strong style="font-size:13px;">Communication history</strong>' +
              '<div class="mkt-sub" style="margin:5px 0 7px;">' +
                num(d.messages.filter(function (m) { return m.status === 'sent'; }).length) + ' sent · ' +
                num(d.messages.filter(function (m) { return m.channel === 'email'; }).length) + ' email records · ' +
                num(d.messages.filter(function (m) { return m.channel === 'whatsapp'; }).length) + ' WhatsApp records · ' +
                num(d.messages.filter(function (m) { return m.status === 'skipped'; }).length) + ' skipped</div>' +
              (d.messages.length
                ? '<table class="mkt-table" style="margin-top:6px;"><tbody>' + d.messages.slice(0, 12).map(function (m) {
                    return '<tr><td>' + esc(m.channel) + '</td><td>' + esc(m.subject || m.template_key || '') + '</td>' +
                      '<td><span class="mkt-pill ' + (m.status === 'sent' ? 'approved' : m.status === 'skipped' ? 'hold' : 'pause') + '">' +
                      esc(m.status) + '</span>' +
                      (m.skip_reason ? '<br><span class="mkt-skip">' + esc(m.skip_reason) + '</span>' : '') +
                      (m.clicked_at ? '<br><span class="mkt-skip">clicked</span>' : '') + '</td></tr>';
                  }).join('') + '</tbody></table>'
                : '<p class="mkt-empty">None yet.</p>') +
              '<strong style="font-size:13px;display:block;margin-top:14px;">Carts</strong>' +
              (d.carts.length
                ? d.carts.slice(0, 5).map(function (ct) {
                    return '<div class="mkt-angle"><div style="display:flex;justify-content:space-between;">' +
                      '<span class="mkt-pill ' + (ct.status === 'recovered' || ct.status === 'converted' ? 'approved' : 'pause') + '">' +
                      esc(ct.status) + '</span><strong>' + money(ct.total_value) + '</strong></div>' +
                      '<div class="mkt-sub">' + (ct.items || []).map(function (i) {
                        return esc(i.product_name || i.product_id) + ' ×' + i.quantity;
                      }).join(', ') + '</div></div>';
                  }).join('')
                : '<p class="mkt-empty">No carts.</p>') +
            '</div>' +
          '</div>' +
          '<strong style="font-size:13px;display:block;margin:16px 0 8px;">Timeline</strong>' +
          '<div class="mkt-timeline">' + d.events.slice(0, 60).map(function (ev) {
            return '<div class="mkt-tl-item"><div class="mkt-tl-time">' + ago(ev.at) + '</div>' +
              '<strong>' + esc(ev.event_name.replace(/_/g, ' ')) + '</strong>' +
              (ev.product_name ? ' — ' + esc(ev.product_name) : '') +
              (ev.search_term ? ' — “' + esc(ev.search_term) + '”' : '') +
              (ev.value ? ' — ' + money(ev.value) : '') +
              (ev.page ? '<div class="mkt-sub">' + esc(ev.page) + '</div>' : '') + '</div>';
          }).join('') + '</div>' +
        '</div>';
    })['catch'](function (e) { fail('jrn-detail', e); });
  };

  /* ── RECOVERY ──────────────────────────────────────────────────────── */

  window.mktLoadRecovery = function () {
    api('/recovery?days=30').then(function (d) {
      var s = d.summary;
      var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
      set('rec-kpi-active', num(s.active.count));      set('rec-kpi-active-v', money(s.active.value));
      set('rec-kpi-abandoned', num(s.abandoned.count)); set('rec-kpi-abandoned-v', money(s.abandoned.value));
      set('rec-kpi-recovered', num(s.recovered.count)); set('rec-kpi-recovered-v', money(s.recovered.value));
      set('rec-kpi-rate', pct(s.recovery_rate));
      set('rec-kpi-converted', num(s.converted.count)); set('rec-kpi-converted-v', money(s.converted.value));

      if (!d.carts.length) {
        document.getElementById('rec-carts').innerHTML = '<p class="mkt-empty">No carts in the last 30 days.</p>';
        return;
      }
      document.getElementById('rec-carts').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Status</th><th>Customer</th><th>Items</th><th>Value</th>' +
        '<th>Intent</th><th>Last activity</th><th></th></tr></thead><tbody>' +
        d.carts.map(function (c) {
          var cls = (c.status === 'recovered' || c.status === 'converted') ? 'approved'
                  : c.status === 'abandoned' ? 'pause' : 'hold';
          return '<tr>' +
            '<td><span class="mkt-pill ' + cls + '">' + esc(c.status) + '</span>' +
              (c.reached_checkout ? '<br><span class="mkt-skip">reached checkout</span>' : '') + '</td>' +
            '<td>' + esc((c.profile && c.profile.email) || 'Anonymous') + '</td>' +
            '<td>' + (c.items || []).map(function (i) {
              return esc(i.product_name || i.product_id) + ' ×' + i.quantity;
            }).join('<br>') + '</td>' +
            '<td><strong>' + money(c.total_value) + '</strong></td>' +
            '<td>' + scoreChip(c.profile && c.profile.intent_score) + '</td>' +
            '<td>' + ago(c.updated_at) + '</td>' +
            '<td>' + (c.profile ? '<button class="btn btn-secondary btn-sm" onclick="mktOpenJourney(\'' +
              esc(c.profile_id) + '\')">Journey</button>' : '') + '</td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    })['catch'](function (e) { fail('rec-carts', e); });
  };

  /* ── AUTOMATIONS ───────────────────────────────────────────────────── */

  window.mktLoadAutomations = function () {
    api('/automations').then(function (d) {
      if (!d.workflows.length) {
        document.getElementById('aut-list').innerHTML = '<p class="mkt-empty">No workflows found — run the migration first.</p>';
        return;
      }
      document.getElementById('aut-list').innerHTML = d.workflows.map(function (w) {
        var s = w.stats;
        // Skip reasons are shown prominently. A workflow with runs but no
        // sends is almost always a missing consent record or an unconfigured
        // channel — without this the owner just sees "0 sent" and no reason.
        var skips = Object.keys(s.skip_reasons || {}).map(function (k) {
          return esc(k.replace(/_/g, ' ')) + ' ×' + s.skip_reasons[k];
        }).join(', ');

        return '<div class="mkt-angle">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">' +
            '<div style="flex:1;min-width:220px;">' +
              '<strong>' + esc(w.name) + '</strong>' +
              ' <span class="mkt-pill ' + (w.active ? 'approved' : 'hold') + '">' + (w.active ? 'live' : 'off') + '</span>' +
              '<div class="mkt-sub">' + esc(w.description || '') + '</div>' +
              '<div class="mkt-sub">' + w.steps.length + ' step(s) · trigger: ' +
                esc(w.trigger_event || w.trigger_type) +
                (w.segment_key ? ' · segment: ' + esc(w.segment_key) : '') + '</div>' +
            '</div>' +
            '<button class="mkt-toggle ' + (w.active ? 'on' : '') + '" title="' +
              (w.active ? 'Switch off' : 'Switch on') + '" ' +
              'onclick="mktToggleWorkflow(\'' + esc(w.id) + '\',' + (!w.active) + ')"></button>' +
          '</div>' +
          '<table class="mkt-table" style="margin-top:10px;"><tbody><tr>' +
            '<td>Runs<br><strong>' + num(s.runs_total) + '</strong> <span class="mkt-sub">(' + num(s.runs_active) + ' active)</span></td>' +
            '<td>Sent<br><strong>' + num(s.messages_sent) + '</strong></td>' +
            '<td>Clicks<br><strong>' + num(s.clicks) + '</strong> <span class="mkt-sub">' + pct(s.click_rate) + '</span></td>' +
            '<td>Conversions<br><strong>' + num(s.conversions) + '</strong> <span class="mkt-sub">' + pct(s.conversion_rate) + '</span></td>' +
            '<td>Revenue<br><strong>' + money(s.revenue) + '</strong></td>' +
          '</tr></tbody></table>' +
          (skips ? '<div class="mkt-skip" style="margin-top:6px;"><strong>Not sent:</strong> ' + skips + '</div>' : '') +
        '</div>';
      }).join('');
    })['catch'](function (e) { fail('aut-list', e); });
  };

  window.mktToggleWorkflow = function (id, active) {
    if (active && !confirm('Switch this automation ON? It will start sending real messages to real customers on the next engine tick (within 10 minutes).')) return;
    api('/automations/' + encodeURIComponent(id) + '/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: active })
    }).then(function () { mktLoadAutomations(); })
      ['catch'](function (e) { alert('Failed: ' + e.message); });
  };

  window.mktLoadOutbox = function () {
    api('/outbox?limit=100').then(function (d) {
      if (!d.messages.length) {
        document.getElementById('aut-outbox').innerHTML = '<p class="mkt-empty">Nothing in the outbox yet.</p>';
        return;
      }
      document.getElementById('aut-outbox').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Status</th><th>Channel</th><th>To</th><th>Subject</th>' +
        '<th>Created</th><th>Sent</th></tr></thead><tbody>' +
        d.messages.map(function (m) {
          var cls = m.status === 'sent' ? 'approved' : m.status === 'queued' ? 'pending_approval'
                  : m.status === 'skipped' ? 'hold' : 'pause';
          return '<tr>' +
            '<td><span class="mkt-pill ' + cls + '">' + esc(m.status) + '</span>' +
              (m.skip_reason ? '<br><span class="mkt-skip">' + esc(m.skip_reason.replace(/_/g, ' ')) + '</span>' : '') +
              (m.error ? '<br><span class="mkt-skip">' + esc(m.error).slice(0, 60) + '</span>' : '') + '</td>' +
            '<td>' + esc(m.channel) + '</td>' +
            '<td>' + esc(m.recipient || '—') + '</td>' +
            '<td>' + esc(m.subject || m.template_key || '') +
              (m.clicked_at ? ' <span class="mkt-pill approved">clicked</span>' : '') + '</td>' +
            '<td>' + ago(m.created_at) + '</td>' +
            '<td>' + (m.sent_at ? ago(m.sent_at) : '—') + '</td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    })['catch'](function (e) { fail('aut-outbox', e); });
  };

  window.mktRunTick = function () {
    var el = document.getElementById('aut-list');
    el.innerHTML = '<p class="mkt-empty">Running the engine… this takes a few seconds.</p>';
    api('/tick', { method: 'POST' }).then(function (r) {
      var s = r.stats || {};
      alert('Engine run complete.\n\n' +
        'Sessions closed: ' + (s.sessions_closed || 0) + '\n' +
        'Carts marked abandoned: ' + (s.carts_abandoned || 0) + '\n' +
        'Profiles scored: ' + (s.profiles_scored || 0) + '\n' +
        'Workflow runs started: ' + (s.runs_started || 0) + '\n' +
        'Messages queued: ' + (s.messages_queued || 0) + '\n' +
        'Messages sent: ' + (s.messages_sent || 0) + '\n' +
        'Messages skipped: ' + (s.messages_skipped || 0) +
        ((r.errors && r.errors.length) ? '\n\nErrors:\n' + r.errors.join('\n') : ''));
      mktLoadAutomations(); mktLoadOutbox();
    })['catch'](function (e) { fail('aut-list', e); });
  };

  /* ── ATTRIBUTION ───────────────────────────────────────────────────── */

  window.mktLoadAttribution = function () {
    api('/attribution?days=30').then(function (d) {
      function table(rows, label, extra) {
        if (!rows || !rows.length) return '<p class="mkt-empty">No data yet.</p>';
        return '<table class="mkt-table"><thead><tr><th>' + label + '</th><th>Orders</th><th>Revenue</th>' +
          (extra ? '<th>' + extra + '</th>' : '') + '</tr></thead><tbody>' +
          rows.slice(0, 15).map(function (r) {
            return '<tr><td>' + esc(r.name || r.key) + '</td><td>' + num(r.count) + '</td>' +
              '<td><strong>' + money(r.revenue) + '</strong></td>' +
              (extra ? '<td>' + (r.conversion_rate != null ? pct(r.conversion_rate) : '—') + '</td>' : '') +
            '</tr>';
          }).join('') + '</tbody></table>';
      }

      document.getElementById('att-source').innerHTML     = table(d.by_source, 'Source', 'Conv. rate');
      document.getElementById('att-campaign').innerHTML   = table(d.by_campaign, 'Campaign');
      document.getElementById('att-automation').innerHTML = table(d.by_automation, 'Automation');

      var nr = d.new_vs_repeat;
      document.getElementById('att-newrepeat').innerHTML =
        '<table class="mkt-table"><tbody>' +
        '<tr><td>First orders</td><td>' + num(nr.first_orders) + '</td><td><strong>' + money(nr.first_revenue) + '</strong></td></tr>' +
        '<tr><td>Repeat orders</td><td>' + num(nr.repeat_orders) + '</td><td><strong>' + money(nr.repeat_revenue) + '</strong></td></tr>' +
        '<tr><td>Repeat purchase rate</td><td colspan="2"><strong>' +
          pct(d.total_orders ? nr.repeat_orders / d.total_orders : 0) + '</strong></td></tr>' +
        '<tr><td>Total (30d)</td><td>' + num(d.total_orders) + '</td><td><strong>' + money(d.total_revenue) + '</strong></td></tr>' +
        '</tbody></table>';
    })['catch'](function (e) {
      fail('att-source', e); fail('att-campaign', e);
      fail('att-automation', e); fail('att-newrepeat', e);
    });
  };
})();


/* ═══════════════════════════════════════════════════════════════════════════
   OZYLIX — REALITY TAB + LIVE STORE DATA  (phase 2, Aug 2026)

   Appended, as with everything else in this file. Nothing above is edited.

   THREE SOURCES, SHOWN SEPARATELY
     · store    — the main backend / store database. Authoritative for money.
     · beacon   — what the browser tracking saw. Fast, but blockable.
     · engine   — what the marketing engine decided from the above.

   Where they disagree the gap is displayed, not averaged. A blended number
   would hide exactly the thing worth knowing: how much the browser tracking
   is missing. That gap is otherwise invisible — it shows up only as an
   unexplained decline across every behavioural metric at once.

   Store reads go through the panel's EXISTING apiFetch (admin-core.js:300),
   which already attaches the admin JWT and already treats /api/admin/* as a
   protected path. No new credential enters the browser.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__ozyRealityTab) return;
  window.__ozyRealityTab = true;

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
  }
  function money(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
  function num(n)   { return Number(n || 0).toLocaleString('en-IN'); }
  function ago(t) {
    if (!t) return 'never';
    var s = Math.round((Date.now() - new Date(t)) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }

  function mktApi(path, opts) {
    return fetch(window.MARKETING_BACKEND_URL + '/api/dash' + path, opts)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  /* Store reads via the panel's own authed helper. Returns null rather than
     throwing, so one unreachable store endpoint degrades a single panel
     instead of blanking the whole tab. */
  function storeApi(path) {
    if (typeof apiFetch !== 'function') return Promise.resolve(null);
    return apiFetch(path)
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  /* ── tab routing ─────────────────────────────────────────────────────── */
  var prevShowTab = window.mktShowTab;
  window.mktShowTab = function (tab) {
    if (tab !== 'reality') return prevShowTab.apply(this, arguments);
    document.querySelectorAll('.mkt-tab').forEach(function (t) { t.style.display = 'none'; });
    var el = document.getElementById('mkt-tab-reality');
    if (el) el.style.display = 'block';
    document.querySelectorAll('.mkt-navbtn').forEach(function (b) {
      b.classList.toggle('mkt-active', b.dataset.tab === 'reality');
    });
    mktLoadReality();
  };

  /* ── Reality ─────────────────────────────────────────────────────────── */

  window.mktLoadReality = function () {
    mktApi('/reconciliation?days=30').then(function (d) {
      var t = d.totals;

      /* Status strip — the connection state and whether sending is paused.
         "Sending paused" is surfaced loudly because otherwise it looks like
         the automations have silently stopped working for no reason. */
      var statusEl = document.getElementById('rl-status');
      if (!d.store_connected) {
        statusEl.className = 'mkt-hint warn';
        statusEl.innerHTML =
          '<strong>Store database not connected.</strong> ' +
          'The engine is running on browser-beacon data alone, so orders it did not see ' +
          '(tab closed, COD confirmed later) will not stop cart reminders, and consent changes ' +
          'made in the Customers page will not reach it.<br>' +
          '<span class="mkt-sub">Fix: run <code>supabase/003_store_readonly_role.sql</code> in the store ' +
          'Supabase project and set <code>STORE_DB_URL</code> on the marketing service.</span>';
      } else {
        var paused = d.sync.sending_paused;
        statusEl.className = 'mkt-hint ' + (paused ? 'warn' : 'ok');
        statusEl.innerHTML =
          '<strong>Store connected</strong> — ' + esc(d.store.mode) +
          ' · write protection: ' + esc(d.store.readonly_enforced_by || 'unknown') +
          '<br>Last successful sync: <strong>' + ago(d.sync.last_successful_sync) + '</strong>' +
          (d.sync.minutes_since_sync !== null ? ' (' + d.sync.minutes_since_sync + ' min)' : '') +
          (paused
            ? '<br><strong style="color:#963848">⏸ Automated sending is PAUSED</strong> — consent data is ' +
              esc(d.sync.consent_staleness.minutes) + ' min old, past the ' +
              esc(d.sync.consent_staleness.limit) + ' min limit. Messages are held rather than sent on ' +
              'possibly-withdrawn consent. They resume automatically once the sync recovers.'
            : '<br><span class="mkt-sub">Consent data is fresh — automations are free to send.</span>');
      }

      /* Totals: three sources in one table, each labelled. */
      var gap = t.store_orders - t.beacon_orders;
      document.getElementById('rl-totals').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Source</th><th>Orders</th><th>Revenue</th><th>What it is</th></tr></thead><tbody>' +
        '<tr><td><strong>Store database</strong></td><td class="rl-n">' + num(t.store_orders) + '</td>' +
          '<td class="rl-n"><strong>' + money(t.store_revenue) + '</strong></td>' +
          '<td class="mkt-sub">Authoritative. Matches your Orders page.</td></tr>' +
        '<tr><td><strong>Browser beacon</strong></td><td class="rl-n">' + num(t.beacon_orders) + '</td>' +
          '<td class="rl-n">' + money(t.beacon_revenue) + '</td>' +
          '<td class="mkt-sub">What the tracking script saw. Blockable.</td></tr>' +
        '<tr style="background:rgba(0,0,0,.02)"><td><strong>Gap</strong></td>' +
          '<td class="rl-n">' + (gap > 0 ? '−' + num(gap) : num(-gap)) + '</td>' +
          '<td class="rl-n">' + money(t.revenue_delta) + '</td>' +
          '<td class="mkt-sub">' + (gap > 0
            ? 'Orders the beacon missed. The store sync recovers these.'
            : 'No gap — the beacon saw everything.') + '</td></tr>' +
        '</tbody></table>' +
        '<div class="mkt-sub" style="margin-top:8px;">Confirmed by both sources: <strong>' +
          num(t.matched_orders) + '</strong> · recovered by the store sync: <strong>' +
          num(t.store_only_orders) + '</strong>' +
          (t.beacon_only_orders ? ' · beacon-only (no store record): <strong>' + num(t.beacon_only_orders) +
            '</strong> — worth checking, this normally means an order that did not complete' : '') +
        '</div>';

      /* Coverage — a single meter, because it is one number about one thing. */
      var cov = t.beacon_coverage_pct;
      var covEl = document.getElementById('rl-coverage');
      if (cov === null || cov === undefined) {
        covEl.innerHTML = '<p class="mkt-empty">No store orders in this window, so there is nothing to measure coverage against.</p>';
      } else {
        var tone = cov >= 90 ? 'ok' : cov >= 70 ? 'warn' : 'bad';
        covEl.innerHTML =
          '<div class="rl-meter"><div class="rl-meter-track"><div class="rl-meter-fill ' + tone + '" style="width:' +
            Math.max(1, Math.min(100, cov)) + '%"></div></div>' +
          '<div class="rl-meter-val">' + cov + '%</div></div>' +
          '<div class="mkt-sub" style="margin-top:6px;">' +
            (cov >= 90 ? 'Healthy. The beacon is seeing nearly every order.'
             : cov >= 70 ? 'Some orders are being missed — commonly ad blockers, or customers closing the tab at payment. The store sync covers the gap, so nothing is lost; behavioural attribution is just less complete for those orders.'
             : 'A large share of orders never reach the beacon. Worth checking that the tracking script is loading on the thank-you page. Revenue figures are still correct — they come from the store.') +
          '</div>';
      }

      /* The orders that would have kept getting cart reminders. */
      var missed = d.recent_store_only_orders || [];
      document.getElementById('rl-missed').innerHTML = missed.length
        ? '<table class="mkt-table"><thead><tr><th>Order</th><th>Customer</th><th>Value</th><th>Placed</th></tr></thead><tbody>' +
          missed.map(function (o) {
            return '<tr><td>' + esc(o.order_id) + '</td><td>' + esc(o.email || '—') + '</td>' +
              '<td class="rl-n">' + money(o.total) + '</td><td>' + ago(o.placed_at) + '</td></tr>';
          }).join('') + '</tbody></table>'
        : '<p class="mkt-empty">' + (d.store_connected
            ? 'None — the beacon saw every order in this window.'
            : 'Connect the store database to find these.') + '</p>';

      /* Sync + engine health. */
      var states = (d.sync.states || []).map(function (s) {
        var bad = s.consecutive_failures > 0;
        return '<tr><td>' + esc(s.key) + '</td>' +
          '<td>' + (s.last_ok_at ? ago(s.last_ok_at) : '<span style="color:#963848">never</span>') + '</td>' +
          '<td class="rl-n">' + num(s.rows_total) + '</td>' +
          '<td>' + (bad
            ? '<span class="mkt-pill pause">' + s.consecutive_failures + ' failure(s)</span>' +
              (s.last_error ? '<br><span class="mkt-skip">' + esc(s.last_error).slice(0, 90) + '</span>' : '')
            : '<span class="mkt-pill approved">ok</span>') + '</td></tr>';
      }).join('');

      var engine = (d.engine.recent || []).map(function (r) {
        return '<tr><td>' + esc(r.job) + '</td><td>' + ago(r.started_at) + '</td><td colspan="2">' +
          (r.ok ? '<span class="mkt-pill approved">ok</span>'
                : '<span class="mkt-pill pause">failed</span>' +
                  (r.error ? '<br><span class="mkt-skip">' + esc(r.error).slice(0, 120) + '</span>' : '')) +
          '</td></tr>';
      }).join('');

      document.getElementById('rl-sync').innerHTML =
        '<table class="mkt-table"><thead><tr><th>Stream</th><th>Last success</th><th>Rows pulled</th><th>Status</th></tr></thead><tbody>' +
        (states || '<tr><td colspan="4" class="mkt-sub">Store sync has not run.</td></tr>') +
        (engine || '') + '</tbody></table>';
    })['catch'](function (e) {
      document.getElementById('rl-status').className = 'mkt-hint warn';
      document.getElementById('rl-status').innerHTML =
        'Could not reach the marketing service: ' + esc(e.message) +
        '<br><span class="mkt-sub">If this persists, check that <code>supabase/003_store_sync.sql</code> has been run ' +
        'in the marketing Supabase project.</span>';
    });

    mktLoadRealityStore();
  };

  /* Live store figures, read through the panel's own admin session.
     Appended once, and cleared first so repeat visits to the tab do not
     stack duplicate panels. */
  function mktLoadRealityStore() {
    var host = document.getElementById('mkt-tab-reality');
    if (!host) return;
    var old = document.getElementById('rl-store-live');
    if (old) old.remove();

    Promise.all([
      storeApi('/api/visitors/active'),
      storeApi('/api/analytics/dashboard?range=today'),
    ]).then(function (r) {
      var live = r[0], an = r[1];
      if (!live && !an) return;

      var ov = (an && an.overview) || {};
      var rows = [];
      if (live) {
        rows.push(['Active visitors right now', num(live.active_count)]);
        rows.push(['Page views today', num(live.page_views_today)]);
      }
      // The overview shape comes from a Postgres function, so only render
      // keys that are actually present rather than assuming a schema.
      [['visitors', 'Visitors'], ['sessions', 'Sessions'], ['pageviews', 'Page views'],
       ['conversions', 'Conversions']].forEach(function (pair) {
        if (ov[pair[0]] !== undefined && ov[pair[0]] !== null) {
          rows.push([pair[1] + ' (store analytics, today)', num(ov[pair[0]])]);
        }
      });
      if (!rows.length) return;

      var el = document.createElement('div');
      el.id = 'rl-store-live';
      el.style.marginTop = '22px';
      el.innerHTML =
        '<h3 style="margin-bottom:8px;">Store analytics ' +
        '<span class="mkt-sub">read live from the main backend — a third, independent count</span></h3>' +
        '<table class="mkt-table"><tbody>' +
        rows.map(function (x) {
          return '<tr><td>' + esc(x[0]) + '</td><td class="rl-n"><strong>' + x[1] + '</strong></td></tr>';
        }).join('') +
        '</tbody></table>' +
        '<div class="mkt-sub" style="margin-top:6px;">This is the store\'s own visitor tracking, which predates ' +
        'the marketing beacon and runs separately. Small differences from the beacon\'s numbers are expected ' +
        '\u2014 they count sessions slightly differently.</div>';
      host.appendChild(el);
    })['catch'](function () { /* store analytics are a bonus, never a blocker */ });
  }

  window.mktSyncNow = function () {
    var el = document.getElementById('rl-status');
    el.className = 'mkt-hint';
    el.textContent = 'Syncing from the store database…';
    mktApi('/sync-now', { method: 'POST' }).then(function (r) {
      var s = r.stats || {};
      if (s.skipped) {
        alert('Store sync skipped: the store database is not configured on the marketing service.');
      } else {
        alert('Store sync complete.\n\n' +
          'Orders pulled: ' + (s.orders_pulled || 0) + '\n' +
          'New from store (beacon missed these): ' + (s.orders_new_from_store || 0) + '\n' +
          'Confirmed against the beacon: ' + (s.orders_confirmed || 0) + '\n' +
          'Recovery workflows cancelled: ' + (s.runs_cancelled_by_store || 0) + '\n' +
          'Customers pulled: ' + (s.customers_pulled || 0) + '\n' +
          'Consent withdrawn: ' + (s.consent_withdrawn || 0) + '\n' +
          'Unsubscribes protected from being overwritten: ' + (s.consent_unsub_protected || 0) +
          ((r.errors && r.errors.length) ? '\n\nErrors:\n' + r.errors.join('\n') : ''));
      }
      mktLoadReality();
    })['catch'](function (e) { alert('Sync failed: ' + e.message); });
  };

  /* ── Journeys: pull the real customer record from the main backend ───── */

  var prevOpenJourney = window.mktOpenJourney;
  window.mktOpenJourney = function (profileId) {
    prevOpenJourney.call(this, profileId);
    // Runs after the marketing journey renders and appends to it. Deliberately
    // additive: if the store lookup fails the behavioural view is unaffected.
    setTimeout(function () { attachStoreRecord(profileId); }, 400);
  };

  function attachStoreRecord(profileId) {
    if (!mktSupabase) return;
    mktSupabase.from('mkt_profiles').select('email,customer_id').eq('id', profileId).maybeSingle()
      .then(function (r) {
        var p = r && r.data;
        if (!p || !p.customer_id) return;
        return Promise.all([
          storeApi('/api/admin/customers/' + encodeURIComponent(p.customer_id) + '/360'),
          storeApi('/api/admin/customers/' + encodeURIComponent(p.customer_id) + '/insights'),
        ]);
      })
      .then(function (res) {
        if (!res) return;
        var c360 = res[0], ins = res[1];
        if (!c360 && !ins) return;
        var detail = document.getElementById('jrn-detail');
        if (!detail) return;

        var i = (ins && ins.data) || ins || {};
        var box = document.createElement('div');
        box.className = 'card';
        box.style.cssText = 'padding:18px;margin-top:14px;';
        box.innerHTML =
          '<h3 style="margin:0 0 4px;">Store record <span class="mkt-sub">live from the main backend</span></h3>' +
          '<table class="mkt-table" style="margin-top:10px;"><tbody>' +
          (i.total_orders !== undefined ? '<tr><td>Orders</td><td class="rl-n">' + num(i.total_orders) + '</td></tr>' : '') +
          (i.total_spent !== undefined ? '<tr><td>Lifetime value</td><td class="rl-n"><strong>' + money(i.total_spent) + '</strong></td></tr>' : '') +
          (i.avg_order_value !== undefined ? '<tr><td>Average order</td><td class="rl-n">' + money(i.avg_order_value) + '</td></tr>' : '') +
          (i.segment ? '<tr><td>Store segment</td><td>' + esc(i.segment) + '</td></tr>' : '') +
          (i.days_since_last_order !== undefined && i.days_since_last_order !== null
            ? '<tr><td>Days since last order</td><td class="rl-n">' + num(i.days_since_last_order) + '</td></tr>' : '') +
          (i.payment && i.payment.preference ? '<tr><td>Payment preference</td><td>' + esc(i.payment.preference) + '</td></tr>' : '') +
          (Array.isArray(i.last_products) && i.last_products.length
            ? '<tr><td>Recently bought</td><td>' + i.last_products.map(esc).join(', ') + '</td></tr>' : '') +
          '</tbody></table>' +
          '<div class="mkt-sub" style="margin-top:8px;">The behaviour above and this record are two different systems. ' +
          'If the order counts disagree, the store is right and the Reality tab shows by how much.</div>';
        detail.appendChild(box);
      })
      ['catch'](function () { /* store enrichment is additive; never blocks the journey */ });
  }
})();
