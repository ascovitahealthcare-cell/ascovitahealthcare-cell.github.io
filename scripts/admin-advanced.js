/* Ozylix Advanced Admin Dashboard runtime.
   This layer is deliberately additive: it decorates existing pages and dispatches
   a range event without replacing any existing loader, action, permission, or API. */
(function () {
  'use strict';

  const FLOW_MAP = {
    dashboard: ['Overview','Signals','Priorities','Actions','Measure'], analytics: ['Events','Sessions','Funnel','Attribution','Report'], livevisitors: ['Visit','View','Cart','Checkout','Convert'], calendar: ['Plan','Schedule','Execute','Notify','Review'], orders: ['Placed','Paid','Packed','Shipped','Delivered'], returns: ['Requested','Review','Approved','Refund','Closed'], products: ['Catalog','Pricing','Visibility','Sales','Feedback'], inventory: ['Stock','Reserve','Pick','Dispatch','Restock'], discounts: ['Rule','Eligible','Applied','Redeemed','Measured'], customers: ['Identity','Consent','Activity','Journey','Retention'], marketing: ['Signal','Segment','Review','Deliver','Learn'], banners: ['Draft','Review','Publish','Reach','Refresh'], photolibrary: ['Upload','Tag','Approve','Use','Archive'], siteimages: ['Asset','Placement','Publish','Cache','Refresh'], storeeditor: ['Edit','Preview','Review','Publish','Rollback'], payments: ['Initiated','Authorized','Captured','Settled','Reconciled'], finance: ['Data','Costs','Revenue','Margin','Control'], invoices: ['Issued','Sent','Viewed','Paid','Reconciled'], whatsapp: ['Consent','Queue','Send','Delivery','Reply'], aiassistant: ['Request','Guardrail','Model','Response','Audit'], aiteam: ['Intake','Route','Agent','Review','Outcome'], database: ['Connect','Query','Verify','Backup','Monitor'], integrations: ['Connect','Health','Sync','Retry','Confirm'], geoanalytics: ['Region','Demand','Orders','Revenue','Action'], performance: ['Request','API','Database','Render','Monitor'], auditdebugger: ['Collect','Verify','Classify','Resolve','Evidence'], automation: ['Trigger','Consent','Wait','Dispatch','Measure'], staff: ['Invite','2FA','Permissions','Session','Audit']
  };
  const ICONS = ['◉','◌','◇','↗','✓'];
  const RANGE_OPTIONS = [['today','Today'],['7d','7 days'],['month','Month'],['year','Year'],['custom','Custom']];
  const RANGE_LABELS = { today:'Today','7d':'7 days',month:'Month',year:'Year',custom:'Custom range' };

  function safeText(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function pageKey(root) { return (root.id || '').replace(/^page-/,'') || 'dashboard'; }
  function pageLabel(root) { const title=root.querySelector('.page-title'); return title ? title.textContent.trim() : pageKey(root).replace(/[-_]/g,' '); }
  function getRange(root) { return root.dataset.ozAdvancedRange || '7d'; }

  function delegateRange(root, detail) {
    const key=detail.page;
    const button=root.querySelector('.oz-advanced-range-btn.is-active');
    const days={today:'today','7d':7,month:30,year:365};
    const preset={
      dashboard:['setDashGlobalRange',days[detail.mode]],
      orders:['setOrderDateRange',days[detail.mode]],
      customers:['setCustomerDateRange',days[detail.mode]],
      payments:['setPaymentDateRange',days[detail.mode]],
      invoices:['setInvoiceDateRange',days[detail.mode]],
      finance:['setFinanceRange',days[detail.mode]]
    }[key];
    if(detail.mode!=='custom' && preset && typeof window[preset[0]]==='function' && button && preset[1]!==undefined){
      try { window[preset[0]](preset[1],button); } catch(e) { console.warn('[Ozylix dashboard] range delegation skipped',key,e); }
    }
    if(detail.mode==='custom' && detail.from && detail.to){
      const custom={
        orders:['setOrderCustomRange','orderDateStart','orderDateEnd','filterOrders'],
        customers:['setCustomerCustomRange','custDateStart','custDateEnd','filterCustomers'],
        payments:['setPaymentCustomRange','payDateStart','payDateEnd','filterPayments'],
        invoices:['setInvoiceCustomRange','invDateStart','invDateEnd','filterInvoices']
      }[key];
      if(custom && typeof window[custom[0]]==='function'){
        try { window[custom[0]](); const start=document.getElementById(custom[1]); const end=document.getElementById(custom[2]); if(start) start.value=detail.from; if(end) end.value=detail.to; if(typeof window[custom[3]]==='function') window[custom[3]](); } catch(e) { console.warn('[Ozylix dashboard] custom range delegation skipped',key,e); }
      }
    }
    if(key==='livevisitors' && detail.mode!=='custom' && typeof window.loadVisitorAnalytics==='function'){
      const liveMap={today:'today','7d':'7d',month:'30d',year:'12m'};
      window.loadVisitorAnalytics(liveMap[detail.mode] || 'today');
    }
  }

  function setRange(root, mode, from, to) {
    root.dataset.ozAdvancedRange=mode; root.dataset.ozAdvancedFrom=from || ''; root.dataset.ozAdvancedTo=to || '';
    root.querySelectorAll('.oz-advanced-range-btn').forEach(function(button){ button.classList.toggle('is-active', button.dataset.range===mode); });
    const custom=root.querySelector('.oz-advanced-range-custom'); if(custom) custom.classList.toggle('is-open',mode==='custom');
    const value=mode==='custom' && from && to ? from+' to '+to : (RANGE_LABELS[mode] || mode);
    root.querySelectorAll('.oz-advanced-current-range,[data-scope-value]').forEach(function(el){ el.textContent=value; });
    const detail={page:pageKey(root),mode:mode,from:from||null,to:to||null}; root.dispatchEvent(new CustomEvent('ozylix:dashboard-range-change',{bubbles:true,detail:detail})); delegateRange(root,detail);
  }

  function makeRangeBar(root) {
    if(root.querySelector('.oz-advanced-range-bar')) return;
    const bar=document.createElement('div'); bar.className='oz-advanced-range-bar'; bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','Dashboard date range');
    bar.innerHTML='<span class="oz-advanced-range-label">View range</span>'+RANGE_OPTIONS.map(function(item){return '<button type="button" class="oz-advanced-range-btn" data-range="'+item[0]+'">'+item[1]+'</button>';}).join('')+
      '<span class="oz-advanced-range-custom" aria-label="Custom date range"><input type="date" data-range-from aria-label="Start date"><span aria-hidden="true">→</span><input type="date" data-range-to aria-label="End date"><button type="button" class="oz-advanced-range-btn" data-range-apply>Apply</button></span>';
    const header=root.querySelector('.page-hdr'); if(header) header.insertAdjacentElement('afterend',bar); else root.insertAdjacentElement('afterbegin',bar);
    bar.querySelectorAll('.oz-advanced-range-btn[data-range]').forEach(function(button){ button.addEventListener('click',function(){ const mode=button.dataset.range; if(mode==='custom'){setRange(root,mode,'',''); const from=bar.querySelector('[data-range-from]'); if(from) from.focus();} else setRange(root,mode,'',''); }); });
    const apply=bar.querySelector('[data-range-apply]'); if(apply) apply.addEventListener('click',function(){ const from=bar.querySelector('[data-range-from]')?.value || ''; const to=bar.querySelector('[data-range-to]')?.value || ''; if(!from || !to || from>to){ if(typeof window.toast==='function') window.toast('Choose a valid custom date range','error'); return; } setRange(root,'custom',from,to); });
    setRange(root,getRange(root),'','');
  }

  function makeFreshness(root) {
    if(root.querySelector('.oz-advanced-freshness')) return;
    const banner=document.createElement('div'); banner.className='oz-advanced-freshness';
    banner.innerHTML='<span><span class="oz-advanced-pulse" aria-hidden="true"></span><strong>Live admin surface</strong> · existing page loader remains the source of truth</span><span>Scope: <strong class="oz-advanced-current-range">7 days</strong> · refresh with the page action</span>';
    const range=root.querySelector('.oz-advanced-range-bar'); if(range) range.insertAdjacentElement('afterend',banner); else root.insertAdjacentElement('afterbegin',banner);
  }

  function makeSignals(root) {
    if(root.querySelector('.oz-advanced-signal-grid')) return;
    const grid=document.createElement('section'); grid.className='oz-advanced-signal-grid'; grid.setAttribute('aria-label','Dashboard operating signals');
    const items=[['Workspace',pageLabel(root),'Current admin segment'],['Data mode','Live endpoints','No demo values injected'],['Date scope','<span class="oz-advanced-current-range">7 days</span>','Shared view control'],['Safety','Preserved','Permissions and action gates unchanged']];
    grid.innerHTML=items.map(function(item,index){return '<article class="oz-advanced-signal-card"><div class="oz-advanced-signal-label">'+item[0]+'</div><div class="oz-advanced-signal-value"'+(index===2?' data-scope-value':'')+'>'+item[1]+'</div><div class="oz-advanced-signal-meta is-good">'+item[2]+'</div></article>';}).join('');
    const freshness=root.querySelector('.oz-advanced-freshness'); if(freshness) freshness.insertAdjacentElement('afterend',grid); else root.insertAdjacentElement('afterbegin',grid);
  }

  function makeFlow(root) {
    if(root.querySelector('.oz-advanced-flow-surface')) return;
    const labels=FLOW_MAP[pageKey(root)] || FLOW_MAP.dashboard; const surface=document.createElement('section'); surface.className='oz-advanced-surface oz-advanced-flow-surface'; surface.setAttribute('aria-label',pageLabel(root)+' operational path');
    const nodes=labels.map(function(label,index){return '<div class="oz-advanced-flow-node'+(index===0?' is-active':'')+'"><div class="oz-advanced-flow-icon" aria-hidden="true">'+ICONS[index]+'</div><div class="oz-advanced-flow-title">'+safeText(label)+'</div><div class="oz-advanced-flow-meta">contract view</div></div>';}).join('');
    surface.innerHTML='<div class="oz-advanced-surface-head"><div><h3>Operational path</h3><p>Existing page data and controls follow this process sequence.</p></div><span class="status-pill status-ok">Live surface</span></div><div class="oz-advanced-flow">'+nodes+'</div>';
    const signals=root.querySelector('.oz-advanced-signal-grid'); if(signals) signals.insertAdjacentElement('afterend',surface); else root.insertAdjacentElement('afterbegin',surface);
  }

  function decorate(root) {
    if(!root || root.dataset.ozAdvancedDecorated==='1') return;
    root.dataset.ozAdvancedDecorated='1'; root.classList.add('oz-advanced-page'); root.setAttribute('data-dashboard-surface',pageKey(root)); makeRangeBar(root); makeFreshness(root); makeSignals(root); makeFlow(root);
  }
  function decorateVisiblePage(){ document.querySelectorAll('.page').forEach(function(root){ if(root.classList.contains('active') || root.id==='page-dashboard') decorate(root); }); }
  function init(){ decorateVisiblePage(); document.querySelectorAll('.page').forEach(decorate); const observer=new MutationObserver(function(records){records.forEach(function(record){if(record.attributeName==='class' && record.target.classList.contains('active')) decorate(record.target);});}); document.querySelectorAll('.page').forEach(function(root){observer.observe(root,{attributes:true});}); window.OzylixAdvancedDashboard={decorate:decorate,setRange:setRange,flowMap:FLOW_MAP,version:'1.0.0'}; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
