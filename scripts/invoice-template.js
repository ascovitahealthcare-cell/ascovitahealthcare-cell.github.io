/* ══════════════════════════════════════════════════════════════════════
   OZYLIX — SHARED TAX INVOICE TEMPLATE

   Loaded by BOTH the storefront (index.html) and the admin panel
   (admin.html). It used to live inside index.html, which meant the admin
   panel could not reach it and carried a second, hand-written invoice of
   its own — a different layout, different fonts, a different GST split and
   a different header. Two invoices for the same order, depending on who
   printed it.

   One file, one invoice. Edit the layout here and both change together.
   ══════════════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════
// OZYLIX — A4 TAX INVOICE (GST Rule 46 compliant layout)
//
// Single source of truth for every invoice the site produces.
// Renders to exactly one A4 page (210x297mm) with @page margins,
// uses hard-coded brand hex values (a standalone document has no
// access to the site's CSS custom properties — the previous
// template referenced var(--t-low) and rendered those lines with
// no colour at all), and carries the statutory blocks: supplier
// GSTIN, place of supply, HSN, tax split, reverse-charge
// declaration, e-invoice IRN/Ack fields and signature panel.
// ══════════════════════════════════════════════════════════════

// ⚠️ UPDATE THESE BEFORE GOING LIVE — statutory identifiers.
const OZYLIX_LEGAL = {
  legalName:  'Ascovita Healthcare',
  tradeName:  'Ozylix',
  /* Absolute, not relative. The storefront hands this document to the
     customer as a Blob URL, and a blob has an opaque origin — "assets/…"
     resolves against nothing and the logo silently fails to load. An
     absolute https URL works from the blob, from the admin panel, and
     from a saved copy of the file. There is a text wordmark behind it
     via onerror for the offline case. */
  logoUrl:    'https://www.ozylix.com/assets/ozylix-logo.png',
  addr1:      'Near Rajshivalay Cinema, R.S. Cinema Road',
  addr2:      'Vivekanand Wadi, Anand, Gujarat 388001, India',
  gstin:      '24XXXXXXXXXXXZX',      // ⚠️ replace with real GSTIN
  fssai:      '10024022001967',
  stateName:  'Gujarat',
  stateCode:  '24',
  phone:      '+91 98985 82650',
  email:      'ascovitahealthcare@gmail.com',
  site:       'ozylix.com',
  hsnDefault: '2106',                  // food/nutraceutical preparations
  gstRate:    5                        // % — inclusive pricing
};

const IN_STATE_CODES = {
  'jammu and kashmir':'01','himachal pradesh':'02','punjab':'03','chandigarh':'04',
  'uttarakhand':'05','haryana':'06','delhi':'07','rajasthan':'08','uttar pradesh':'09',
  'bihar':'10','sikkim':'11','arunachal pradesh':'12','nagaland':'13','manipur':'14',
  'mizoram':'15','tripura':'16','meghalaya':'17','assam':'18','west bengal':'19',
  'jharkhand':'20','odisha':'21','chhattisgarh':'22','madhya pradesh':'23','gujarat':'24',
  'maharashtra':'27','karnataka':'29','goa':'30','kerala':'32','tamil nadu':'33',
  'puducherry':'34','telangana':'36','andhra pradesh':'37','ladakh':'38'
};

function _amtWords(n) {
  n = Math.round(n || 0);
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function two(x){ return x<20 ? a[x] : b[Math.floor(x/10)] + (x%10 ? ' ' + a[x%10] : ''); }
  function three(x){ return (x>=100 ? a[Math.floor(x/100)] + ' Hundred' + (x%100?' ':'') : '') + (x%100?two(x%100):''); }
  if (n === 0) return 'Zero Rupees Only';
  let out = '', cr = Math.floor(n/10000000); n %= 10000000;
  let lk = Math.floor(n/100000); n %= 100000;
  let th = Math.floor(n/1000); n %= 1000;
  if (cr) out += three(cr) + ' Crore ';
  if (lk) out += three(lk) + ' Lakh ';
  if (th) out += three(th) + ' Thousand ';
  if (n)  out += three(n);
  return out.trim().replace(/\s+/g,' ') + ' Rupees Only';
}

function _esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Normalises the many shapes an order arrives in (localStorage,
// backend /api/orders/my, or the live checkout payload) into one
// object the template can rely on.
// Orders reach this function in several different shapes:
//  • live checkout ....... items is a real array
//  • localStorage ........ items is a real array
//  • backend /api/orders/my  items is a JSON *string* (it is saved with
//    JSON.stringify), which is why .map() blew up with
//    "(o.items || ...).map is not a function"
//  • some rows ........... items is an object map, or a plain text list
// Coerce all of them to an array before anything touches .map().
function _coerceInvoiceItems(o) {
  var raw = o.items;
  if (raw == null || raw === '') raw = o.srItems;
  if (raw == null || raw === '') raw = o.line_items;
  if (raw == null || raw === '') raw = o.order_items;
  if (raw == null || raw === '') raw = o.products;
  if (raw == null) raw = [];

  // JSON string -> parse
  if (typeof raw === 'string') {
    var t = raw.trim();
    if (t.charAt(0) === '[' || t.charAt(0) === '{') {
      try { raw = JSON.parse(t); } catch(e) { raw = t; }
    }
  }
  // object map {0:{..},1:{..}} or a single item object
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    raw = (raw.name || raw.product_name) ? [raw] : Object.keys(raw).map(function(k){ return raw[k]; });
  }
  // plain text list: "Name (30 tabs) × 1, Other × 2"
  if (typeof raw === 'string') {
    raw = raw.split(/\s*,\s*(?![^()]*\))/).filter(Boolean).map(function(part){
      var m = part.match(/^(.*?)\s*[×xX]\s*(\d+)\s*$/);
      return m ? { name: m[1].trim(), qty: Number(m[2]) } : { name: part.trim(), qty: 1 };
    });
  }
  if (!Array.isArray(raw)) raw = [];
  return raw;
}

function normaliseOrderForInvoice(o) {
  o = o || {};
  var items = _coerceInvoiceItems(o).map(function(i){
    if (typeof i === 'string') i = { name: i, qty: 1 };
    var qty  = Number(i.qty || i.units || i.quantity || 1) || 1;
    var rate = Number(i.price || i.selling_price || i.rate || i.unit_price || 0) || 0;
    var mrp  = Number(i.mrp || i.list_price || i.original_price || i.mrp_price || rate) || rate;
    var itemDiscount = Math.max(0, (mrp - rate) * qty);
    return {
      name: i.name || i.product_name || i.title || 'Item',
      hsn:  i.hsn || OZYLIX_LEGAL.hsnDefault,
      qty: qty, rate: rate, mrp: mrp,
      itemDiscount: itemDiscount,
      itemDiscountName: i.discount_name || i.discountName || i.offer_name || i.offerName || i.applied_offer || (itemDiscount ? 'Product price saving' : ''),
      gross: qty * rate
    };
  });

  var stateRaw = (o.state || o.customer_state || (o.formData && o.formData.state) || '').toString();
  // Keep one explicit authoritative total name for every invoice path.
  // Older deployed copies referenced invoiceTotal without declaring it.
  var invoiceTotal = Number(o.total || o.amount || o.order_total || 0) || 0;
  var total = invoiceTotal;

  // If the stored lines carry no prices (older rows saved only names),
  // fall back to the order total so the tax block is still correct
  // rather than printing a ₹0 invoice.
  var gross = items.reduce(function(t,i){ return t + i.gross; }, 0);
  if (!gross && total && items.length) {
    var per = total / items.reduce(function(t,i){ return t + i.qty; }, 0);
    items = items.map(function(i){
      return { name:i.name, hsn:i.hsn, qty:i.qty, rate:per, mrp:per, itemDiscount:0, itemDiscountName:'', gross:per*i.qty, estimated:true };
    });
  }

  var mrpTotal = items.reduce(function(t,i){ return t + (i.mrp || i.rate) * i.qty; }, 0) || total;

  return {
    orderId:  o.orderId || o.id || o.order_id || '',
    date:     o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN',
                {day:'2-digit',month:'short',year:'numeric'}) : new Date().toLocaleDateString('en-IN')),
    customer: o.customer || o.customer_name ||
              [o.firstName,o.lastName].filter(Boolean).join(' ') || o.name || '',
    email:    o.email || o.customer_email || '',
    phone:    o.phone || o.customer_phone || '',
    address:  o.address || o.customer_address || o.shipping_address || '',
    state:    stateRaw,
    gstinBuyer: o.buyer_gstin || o.gstin || '',
    items: items,
    mrpTotal: mrpTotal,
    ship: Number(o.ship || o.shipping || o.shipping_charge || 0) || 0,
    tierDiscount: Number(o.tier_discount || o.tierDiscount || o.pack_discount || o.quantity_discount || 0) || 0,
    mixMatchDiscount: Number(o.mix_match_discount || o.mixMatchDiscount || o.mix_discount || 0) || 0,
    couponDiscount: Number(o.coupon_discount || o.couponDiscount || o.promo_discount || 0) || 0,
    couponCode: o.coupon_code || o.couponCode || o.promo_code || '',
    vitaPointsDiscount: Number(o.vita_points_discount || o.vitaPointsDiscount || o.points_discount || 0) || 0,
    vitaPoints: Number(o.vita_points || o.vitaPoints || o.points_redeemed || 0) || 0,
    discount: Number(o.discount || o.totalDisc || 0) || 0,
    total:    invoiceTotal,
    method:   o.method || o.payment_method || 'Online',
    irn:      o.irn || '', ackNo: o.ack_no || '', ackDate: o.ack_date || ''
  };
}

function buildInvoiceHTML(order) {
  const L = OZYLIX_LEGAL;
  const o = normaliseOrderForInvoice(order);
  const invNo = 'INV-' + String(o.orderId).replace(/^(AVC-|DEMO-)/,'');

  const buyerState = (o.state || '').toLowerCase().trim();
  const buyerCode  = IN_STATE_CODES[buyerState] || '';
  const intra      = buyerState ? (buyerCode === L.stateCode) : true;

  if (!o.items.length) o.items = [{ name:'Order '+o.orderId, hsn:OZYLIX_LEGAL.hsnDefault, qty:1, rate:o.total, gross:o.total }];
  const gross    = o.items.reduce(function(t,i){ return t + i.gross; }, 0) || o.total;
  const mrpTotal = o.mrpTotal || o.items.reduce(function(t,i){ return t + (i.mrp || i.rate) * i.qty; }, 0) || gross;
  const money = function(n){ return '₹' + Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); };
  const componentDiscount = o.tierDiscount + o.mixMatchDiscount + o.couponDiscount + o.vitaPointsDiscount;
  const itemDiscountTotal = o.items.reduce(function(t,i){ return t + (i.itemDiscount || Math.max(0, (i.mrp - i.rate) * i.qty)); }, 0);
  const totalSavings = Math.max(0, mrpTotal - (o.total || gross), o.discount || 0, componentDiscount + itemDiscountTotal);
  const discountLines = [];
  o.items.forEach(function(i){
    const amount = i.itemDiscount || Math.max(0, (i.mrp - i.rate) * i.qty);
    if (amount > 0) discountLines.push({ name: (i.itemDiscountName || 'Product price saving') + ' — ' + i.name, amount: amount });
  });
  if (o.tierDiscount) discountLines.push({ name: 'Pack / tier offer', amount: o.tierDiscount });
  if (o.mixMatchDiscount) discountLines.push({ name: 'Mix & Match — lowest-priced eligible unit free', amount: o.mixMatchDiscount });
  if (o.couponDiscount || (o.discount && !componentDiscount && !itemDiscountTotal)) discountLines.push({ name: 'Coupon' + (o.couponCode ? ' — ' + o.couponCode : ''), amount: o.couponDiscount || o.discount });
  if (o.vitaPointsDiscount) discountLines.push({ name: 'VitaPoints redemption — ' + o.vitaPoints + ' points', amount: o.vitaPointsDiscount });
  const discountDetails = discountLines.length
    ? '<div class="discount-details"><b>DISCOUNT DETAILS</b>' + discountLines.map(function(d){ return '<br><span>' + _esc(d.name) + ': <strong>− ' + money(d.amount) + '</strong></span>'; }).join('') + '</div>'
    : '<div class="discount-details"><b>DISCOUNT DETAILS</b><br><span>No additional discount applied.</span></div>';
  const rate     = L.gstRate;

  /* GST is charged on what the customer actually pays, not on the list price.
     This used to be `taxable = gross / (1 + rate/100)` using the PRE-discount
     item total, while `grand` below is the POST-discount amount — so on every
     discounted order the invoice declared more GST than was collected, and
     taxable + tax did not add up to the grand total.

     Under CGST Act s.15(3)(a), a discount given at the time of supply and
     recorded on the invoice is excluded from the taxable value. Shipping is
     part of the consideration under s.15(2)(c), so it goes in as well.
     (Shipping is 0 under the current always-free policy, but this stays
     correct if SHIP_FEE is ever switched on.) */
  let consideration = Math.max(0, gross - (o.discount || 0) + (o.ship || 0));

  /* Historical rows do not always foot. Before the backend fix, VitaPoints
     reduced orders.total but were never added to orders.discount, so on those
     orders `consideration` computes higher than what the customer actually
     paid — e.g. AVC-77409132: subtotal 1357.00, discount 0.00, total 1352.67,
     with 650 points (650/150 = ₹4.33) making up the difference.
     The amount actually paid is the authority for tax, so when a stored total
     exists and disagrees, trust the total. */
  if (o.total > 0 && Math.abs(consideration - o.total) > 0.05) consideration = o.total;

  const taxable  = consideration / (1 + rate/100);
  const taxTotal = consideration - taxable;

  /* Split the tax rather than halving it twice: with an odd tax amount,
     rounding each half independently makes CGST + SGST miss the total by a
     paisa and the invoice stops footing. */
  const cgstHalf = Math.round((taxTotal / 2) * 100) / 100;
  const cgst = intra ? cgstHalf : 0;
  const sgst = intra ? Math.round((taxTotal - cgstHalf) * 100) / 100 : 0;
  const igst = intra ? 0 : taxTotal;
  const grand = o.total || consideration;
  const rows = o.items.map(function(i, n){
    const base = i.gross / (1 + rate/100);
    return '<tr>' +
      '<td class="c">' + (n+1) + '</td>' +
      '<td>' + _esc(i.name) + (i.itemDiscount > 0 ? '<div class="item-offer">' + _esc(i.itemDiscountName || 'Product price saving') + ' · Save ' + money(i.itemDiscount) + '</div>' : '') + '</td>' +
      '<td class="c">' + _esc(i.hsn) + '</td>' +
      '<td class="c">' + i.qty + '</td>' +
      '<td class="r">' + money(i.mrp || i.rate) + '</td>' +
      '<td class="r">' + money(i.rate) + '</td>' +
      '<td class="r">' + money(base) + '</td>' +
      '<td class="c">' + rate + '%</td>' +
      '<td class="r">' + money(i.gross - base) + '</td>' +
      '<td class="r b">' + money(i.gross) + '</td>' +
    '</tr>';
  }).join('');

  const eInv = o.irn
    ? '<div class="einv"><b>IRN:</b> ' + _esc(o.irn) +
      ' &nbsp;|&nbsp; <b>Ack No:</b> ' + _esc(o.ackNo) +
      ' &nbsp;|&nbsp; <b>Ack Date:</b> ' + _esc(o.ackDate) + '</div>'
    : '';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
  '<title>Tax Invoice ' + _esc(invNo) + ' — Ozylix</title><style>' +
  '@page{size:A4;margin:10mm}' +
  '*{box-sizing:border-box;margin:0;padding:0}' +
  'body{font-family:"Helvetica Neue",Arial,sans-serif;color:#20303A;font-size:9pt;line-height:1.4;' +
    'background:#FFFDF9;width:190mm;min-height:277mm;margin:0 auto;padding:0;display:flex;flex-direction:column}' +
  '.doc{flex:1;display:flex;flex-direction:column}' +
  '.hdr{display:flex;justify-content:space-between;align-items:flex-start;' +
    'border-bottom:2.5pt solid #547177;padding-bottom:7pt;margin-bottom:8pt}' +
  '.logo{font-size:20pt;font-weight:800;letter-spacing:.06em;color:#3E555C}' +
  '.logo em{font-style:normal;color:#547177}' +
  '.logoimg{height:12mm;width:auto;max-width:58mm;display:block}' +
  '.logotx{display:none}' +   /* shown by the img onerror fallback */
  '.tag{font-size:6pt;letter-spacing:.22em;color:#8A9AA0;margin-top:1pt}' +
  '.co{font-size:7.6pt;color:#5A6B72;margin-top:5pt;line-height:1.5}' +
  '.ti{text-align:right}' +
  '.ti h1{font-size:13pt;letter-spacing:.10em;color:#547177;font-weight:800}' +
  '.ti .meta{font-size:7.8pt;color:#5A6B72;margin-top:4pt;line-height:1.6}' +
  '.ti .meta b{color:#20303A}' +
  '.einv{background:#EDF3F4;border:.6pt solid #C3D3D6;border-radius:3pt;padding:4pt 6pt;' +
    'font-size:7pt;color:#3E555C;margin-bottom:7pt}' +
  '.parties{display:flex;gap:7pt;margin-bottom:8pt}' +
  '.pty{flex:1;border:.6pt solid #D9CEC0;border-radius:4pt;padding:6pt 7pt;background:#fff}' +
  '.pty h3{font-size:6.6pt;letter-spacing:.16em;color:#A08B72;margin-bottom:3pt;font-weight:700}' +
  '.pty .nm{font-weight:700;font-size:9pt;color:#20303A}' +
  '.pty p{font-size:7.6pt;color:#5A6B72;margin-top:2pt}' +
  'table{width:100%;border-collapse:collapse;margin-bottom:7pt}' +
  'thead th{background:#547177;color:#fff;font-size:6.8pt;letter-spacing:.06em;' +
    'padding:5pt 4pt;text-align:left;font-weight:700;text-transform:uppercase}' +
  'tbody td{padding:4.5pt 4pt;border-bottom:.5pt solid #E7DED2;font-size:8pt;vertical-align:top}' +
  '.c{text-align:center}.r{text-align:right}.b{font-weight:700}' +
  '.item-offer{font-size:6.5pt;color:#547177;margin-top:1.5pt;font-weight:600}' +
  '.discount-details{margin-top:6pt;padding-top:5pt;border-top:.5pt solid #E7DED2;font-size:6.8pt;color:#5A6B72;line-height:1.55}' +
  '.discount-details b{color:#547177;letter-spacing:.08em;font-size:6.3pt}' +
  '.totwrap{display:flex;gap:8pt;margin-bottom:8pt}' +
  '.words{flex:1;border:.6pt solid #D9CEC0;border-radius:4pt;padding:6pt 7pt;background:#fff;font-size:7.6pt}' +
  '.words h3{font-size:6.6pt;letter-spacing:.16em;color:#A08B72;margin-bottom:3pt;font-weight:700}' +
  '.tot{width:74mm;border:.6pt solid #D9CEC0;border-radius:4pt;overflow:hidden;background:#fff}' +
  '.tot .row{display:flex;justify-content:space-between;padding:3.4pt 8pt;font-size:8pt;border-bottom:.5pt solid #F0E8DC}' +
  '.tot .grand{background:#547177;color:#fff;font-weight:800;font-size:10pt;padding:6pt 8pt;border:0}' +
  '.legal{display:flex;gap:7pt;margin-top:auto;padding-top:7pt}' +
  '.pol{flex:1;font-size:6.6pt;color:#6B7A80;line-height:1.55}' +
  '.pol h4{font-size:6.6pt;color:#547177;letter-spacing:.10em;margin-bottom:2.5pt;font-weight:800;text-transform:uppercase}' +
  '.pol li{margin-left:8pt;margin-bottom:1pt}' +
  /* Signature panel reduced: 52mm -> 36mm wide, and the blank signing
     space 16mm -> 8mm. It is a "digitally generated, no signature
     required" box, so it never gets written in — at the old size it took
     a quarter of the footer width and a sixth of the page height to say
     so, and pushed the terms column into a narrow ribbon beside it. */
  /* align-self:flex-start or the box stretches to the full height of the
     terms column beside it — narrowing the width alone still left a tall
     empty rectangle down the side of the page. */
  '.sign{width:36mm;align-self:flex-start;text-align:center;border:.6pt solid #D9CEC0;' +
    'border-radius:4pt;padding:4pt;background:#fff}' +
  '.sign .sp{height:8mm}' +
  '.sign .nm{font-size:6.8pt;font-weight:700;color:#20303A}' +
  '.sign .lb{font-size:5.8pt;color:#8A9AA0;margin-top:1pt}' +
  '.foot{border-top:.8pt solid #D9CEC0;margin-top:7pt;padding-top:5pt;text-align:center;' +
    'font-size:6.6pt;color:#8A9AA0;line-height:1.6}' +
  '.noprint{text-align:center;padding:14px}' +
  '.noprint button{background:#547177;color:#fff;border:0;padding:11px 26px;border-radius:100px;' +
    'font-size:13px;font-weight:700;cursor:pointer;margin:0 5px}' +
  '@media print{.noprint{display:none}body{background:#fff}}' +
  '</style></head><body>' +

  '<div class="noprint"><button onclick="window.print()">🖨️ Print / Save as PDF</button></div>' +

  '<div class="doc">' +
    '<div class="hdr">' +
      '<div>' +
        /* Was a text wordmark reading ASCOFIZZ — the old brand, still going
           out on every tax invoice long after the rename. Now the Ozylix
           logo, with the wordmark kept behind it as an onerror fallback so
           an invoice printed with no network still shows a brand. */
        '<div class="logo">' +
          '<img class="logoimg" src="' + _esc(L.logoUrl) + '" alt="' + _esc(L.tradeName) + '" ' +
            'onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'block\'">' +
          '<span class="logotx">OZY<em>LIX</em></span>' +
        '</div>' +
        '<div class="tag">ORGANIC VITAMINS &amp; SUPPLEMENTS</div>' +
        '<div class="co"><b>' + _esc(L.legalName) + '</b><br>' + _esc(L.addr1) + '<br>' + _esc(L.addr2) +
          '<br>GSTIN: <b>' + _esc(L.gstin) + '</b> &nbsp;|&nbsp; State: ' + _esc(L.stateName) + ' (' + _esc(L.stateCode) + ')' +
          '<br>FSSAI Lic. No: ' + _esc(L.fssai) + '</div>' +
      '</div>' +
      '<div class="ti"><h1>TAX INVOICE</h1><div class="meta">' +
        'Invoice No: <b>' + _esc(invNo) + '</b><br>' +
        'Invoice Date: <b>' + _esc(o.date) + '</b><br>' +
        'Order Ref: ' + _esc(o.orderId) + '<br>' +
        'Payment: ' + _esc((function(m){
          switch (String(m||'').toLowerCase()) {
            case 'cod': case 'cash': return 'COD (Cash on Delivery)';
            case 'cashfree': return 'Online (Cashfree)';
            case 'gokwik': return 'Online (GoKwik)';
            case 'upi': return 'UPI';
            case 'card': return 'Card';
            case 'netbanking': return 'Net Banking';
            case 'emi': return 'EMI';
            case 'demo': return 'Demo (Test)';
            default: return String(m||'Online Payment');
          }
        })(o.method)) + '<br>' +
        'Reverse Charge: <b>No</b>' +
      '</div></div>' +
    '</div>' +

    eInv +

    '<div class="parties">' +
      '<div class="pty"><h3>BILL TO</h3><div class="nm">' + _esc(o.customer) + '</div>' +
        '<p>' + _esc(o.address) + '</p>' +
        '<p>' + _esc(o.phone) + (o.email ? ' &nbsp;|&nbsp; ' + _esc(o.email) : '') + '</p>' +
        (o.gstinBuyer ? '<p>GSTIN: <b>' + _esc(o.gstinBuyer) + '</b></p>' : '') +
      '</div>' +
      '<div class="pty"><h3>SHIP TO / PLACE OF SUPPLY</h3><div class="nm">' + _esc(o.customer) + '</div>' +
        '<p>' + _esc(o.address) + '</p>' +
        '<p>Place of Supply: <b>' + _esc(o.state || L.stateName) + (buyerCode ? ' (' + buyerCode + ')' : '') + '</b></p>' +
        '<p>Supply Type: <b>' + (intra ? 'Intra-State' : 'Inter-State') + '</b></p>' +
      '</div>' +
    '</div>' +

    '<table><thead><tr>' +
      '<th class="c">#</th><th>Description of Goods</th><th class="c">HSN</th><th class="c">Qty</th>' +
      '<th class="r">MRP</th><th class="r">Rate</th><th class="r">Taxable</th><th class="c">GST</th><th class="r">Tax Amt</th><th class="r">Amount</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>' +

    '<div class="totwrap">' +
      '<div class="words"><h3>AMOUNT IN WORDS</h3>' + _esc(_amtWords(grand)) +
        '<div style="margin-top:6pt;font-size:6.8pt;color:#8A9AA0">' +
        'All prices are inclusive of GST. Tax is computed on the taxable value shown above ' +
        'in accordance with Rule 46 of the CGST Rules, 2017.</div>' + discountDetails + '</div>' +
      '<div class="tot">' +
        '<div class="row"><span>List / MRP value</span><span>' + money(mrpTotal) + '</span></div>' +
        '<div class="row"><span>Taxable Value</span><span>' + money(taxable) + '</span></div>' +
        (intra
          ? '<div class="row"><span>CGST @ ' + (rate/2) + '%</span><span>' + money(cgst) + '</span></div>' +
            '<div class="row"><span>SGST @ ' + (rate/2) + '%</span><span>' + money(sgst) + '</span></div>'
          : '<div class="row"><span>IGST @ ' + rate + '%</span><span>' + money(igst) + '</span></div>') +
        (discountLines.length ? discountLines.map(function(d){ return '<div class="row"><span>' + _esc(d.name) + '</span><span>− ' + money(d.amount) + '</span></div>'; }).join('') : '') +
        '<div class="row"><span>Total savings</span><span>− ' + money(totalSavings) + '</span></div>' +
        '<div class="row"><span>Shipping</span><span>' + (o.ship ? money(o.ship) : 'FREE') + '</span></div>' +
        '<div class="row grand"><span>GRAND TOTAL</span><span>' + money(grand) + '</span></div>' +
      '</div>' +
    '</div>' +

    '<div class="legal">' +
      '<div class="pol">' +
        '<h4>Return &amp; Refund Policy</h4>' +
        '<ul>' +
        '<li>Returns accepted within <b>7 days</b> of delivery for sealed, unused products in original packaging.</li>' +
        '<li>Damaged, defective or wrong items: report within <b>48 hours</b> with an unboxing photo/video.</li>' +
        '<li>For hygiene and safety, opened or partially consumed supplements cannot be returned.</li>' +
        '<li>Refunds are issued to the original payment method within <b>5–7 business days</b> of pickup and quality check.</li>' +
        '<li>Shipping charges are non-refundable unless the return is due to our error.</li>' +
        '</ul>' +
        '<h4 style="margin-top:4pt">Terms &amp; Conditions</h4>' +
        '<ul>' +
        '<li>Goods once sold are covered only by the return policy stated above.</li>' +
        '<li>This is a computer-generated invoice and is valid without a physical signature.</li>' +
        '<li>Subject to <b>Anand, Gujarat</b> jurisdiction only.</li>' +
        '<li>These are food supplements, not medicine — not intended to diagnose, treat, cure or prevent any disease.</li>' +
        '<li>Store in a cool, dry place away from direct sunlight. Keep out of reach of children.</li>' +
        '<li>Interest @18% p.a. is chargeable on payments overdue beyond the agreed credit period.</li>' +
        '</ul>' +
      '</div>' +
      '<div class="sign">' +
        '<div class="lb">For <b>' + _esc(L.tradeName) + '</b></div>' +
        '<div class="sp"></div>' +
        '<div class="nm">Authorised Signatory</div>' +
        '<div class="lb">Digitally generated</div>' +
      '</div>' +
    '</div>' +

    '<div class="foot">' +
      _esc(L.legalName) + ' &nbsp;·&nbsp; ' + _esc(L.addr2) + ' &nbsp;·&nbsp; ' + _esc(L.phone) +
      ' &nbsp;·&nbsp; ' + _esc(L.email) + ' &nbsp;·&nbsp; ' + _esc(L.site) + '<br>' +
      'FSSAI Lic. ' + _esc(L.fssai) + ' &nbsp;|&nbsp; GSTIN ' + _esc(L.gstin) +
      ' &nbsp;|&nbsp; Made in India, Anand Gujarat &nbsp;|&nbsp; Thank you, ' + _esc(o.customer || 'Customer') + '! We are happy to connect with you. 🌿✨<br>' +
      'Questions about your order or policy? Aamin Vahora: +91 72658 84137' +
    '</div>' +
  '</div></body></html>';
}
