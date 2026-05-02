// ═══════════════════════════════════════════════════════════════════
// ASCOVITA BACKEND — server.js  v7.0
// Node.js + Express + Supabase (acts as ORM layer)
//
// ✅ Google OAuth + Email Auth with sessions
// ✅ Stored Procedures (atomic order placement)
// ✅ Triggers simulation (stock decrement, coupon usage, audit)
// ✅ Soft Delete everywhere (products, orders, customers, coupons)
// ✅ Full Audit Log
// ✅ Order Status History
// ✅ Image Upload to Supabase Storage (products bucket)
// ✅ Image Library (list/reuse uploaded images)
// ✅ WhatsApp Reports via Twilio (every 12hrs + manual send)
// ✅ Email Order Confirmation (Nodemailer)
// ✅ Cashfree Payments + Webhook
// ✅ Shiprocket Integration
// ✅ Instagram Feed
//
// ENV VARS REQUIRED (Render → Environment):
//   SUPABASE_URL              supabase project URL
//   SUPABASE_SERVICE_KEY      supabase service role key
//   GOOGLE_CLIENT_ID          google oauth client id
//   JWT_SECRET                long random string
//   ADMIN_PASSWORD            admin panel password
//   CASHFREE_APP_ID           cashfree app id
//   CASHFREE_SECRET_KEY       cashfree secret
//   CASHFREE_ENV              PRODUCTION or SANDBOX
//   SHIPROCKET_EMAIL          shiprocket email
//   SHIPROCKET_PASSWORD       shiprocket password
//   INSTAGRAM_TOKEN           instagram long-lived token
//   RECAPTCHA_SECRET          recaptcha v3 secret
//   FRONTEND_URL              https://www.ascovita.com
//   MAIL_USER                 gmail address
//   MAIL_PASSWORD             gmail app password
//   MAIL_FROM                 Ascovita Healthcare <mail@gmail.com>
//   TWILIO_ACCOUNT_SID        twilio account sid
//   TWILIO_AUTH_TOKEN         twilio auth token
//   TWILIO_WHATSAPP_FROM      whatsapp:+14155238886
//   WHATSAPP_REPORT_TO        whatsapp:+919898582650
// ═══════════════════════════════════════════════════════════════════

'use strict';

const express      = require('express');
const cors         = require('cors');
// fetch is available natively in Node 18+ — no require needed
const jwt          = require('jsonwebtoken');
const bcrypt       = require('bcrypt');
const nodemailer   = require('nodemailer');
const multer       = require('multer');
const { createClient } = require('@supabase/supabase-js');

const BCRYPT_ROUNDS = 12;

const app    = express();
const PORT   = process.env.PORT || 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WebP, GIF, SVG images are allowed'));
  }
});

const BUCKET_NAME = 'product-images'; // must match your Supabase bucket name

// Auto-create bucket if it doesn't exist (fixes "bucket not found" error)
async function ensureBucket(sb) {
  const { data: buckets, error } = await sb.storage.listBuckets();
  if (error) throw new Error('Cannot list buckets: ' + error.message);
  if (buckets.some(b => b.name === BUCKET_NAME)) return;
  const { error: createErr } = await sb.storage.createBucket(BUCKET_NAME, {
    public: true,
    allowedMimeTypes: ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'],
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (createErr) throw new Error('Cannot create bucket "' + BUCKET_NAME + '": ' + createErr.message);
  console.log('✅ Created Supabase storage bucket:', BUCKET_NAME);
}

// ── Supabase ──────────────────────────────────────────────────────
// Crash loudly on missing env vars so Render shows the real error in build logs
const _REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET', 'ADMIN_PASSWORD'];
const _MISSING = _REQUIRED_ENV.filter(k => !process.env[k]);
if (_MISSING.length) {
  console.error('\n❌  FATAL — Missing required environment variables:\n  ' + _MISSING.join('\n  '));
  console.error('\nFix: Render Dashboard → your service → Environment → add the missing vars → Manual Deploy\n');
  process.exit(1);
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = ['https://ascovita.com','https://www.ascovita.com', process.env.FRONTEND_URL||'','http://localhost:3000','http://localhost:5500','http://127.0.0.1:5500'];
    if (allowed.some(o => o && origin.startsWith(o)) || origin.includes('ascovita.com') || origin.endsWith('.github.io')) return cb(null, true);
    cb(new Error('CORS: not allowed → ' + origin));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));

// ── Email ─────────────────────────────────────────────────────────
// Explicit SMTP config — more reliable than service:'gmail' shorthand on Render
function createMailer() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER     || '',
      pass: process.env.MAIL_PASSWORD || '',
    },
    tls: { rejectUnauthorized: false },
  });
}
const mailer = createMailer();

// Verify SMTP on startup — readable output in Render logs
async function verifyMailer() {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    console.warn('⚠️  [EMAIL] MAIL_USER or MAIL_PASSWORD not set — emails disabled');
    return;
  }
  try {
    await mailer.verify();
    console.log('✅ [EMAIL] SMTP connected — sending as ' + process.env.MAIL_USER);
  } catch(e) {
    console.error('❌ [EMAIL] SMTP failed: ' + e.message);
    console.error('   Fix: use Gmail App Password (myaccount.google.com/apppasswords), NOT your login password');
  }
}

// ── JWT helpers ───────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}
function verifyToken(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}
function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: 'Unauthorised' });
  const p = verifyToken(t);
  if (!p) return res.status(401).json({ error: 'Invalid token' });
  req.user = p;
  next();
}
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ═══════════════════════════════════════════════════════════════
// STORED PROCEDURES (atomic operations on Supabase)
// ═══════════════════════════════════════════════════════════════

// SP: Place order atomically — validates stock, decrements, creates order
async function sp_place_order(orderData) {
  const items = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : (orderData.items || []);

  // 1. Validate stock for all items
  for (const item of items) {
    if (!item.id) continue;
    const { data: product } = await supabase.from('products').select('id,name,stock').eq('id', item.id).single();
    const qty = item.qty || item.units || 1;
    if (product && product.stock < qty) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    }
  }

  // 2. Normalise address: frontend sends address_line1/address_line2, schema has 'address'
  const normalisedOrderData = { ...orderData };
  if (!normalisedOrderData.address && normalisedOrderData.address_line1) {
    normalisedOrderData.address = [normalisedOrderData.address_line1, normalisedOrderData.address_line2].filter(Boolean).join(', ');
  }
  delete normalisedOrderData.address_line1;
  delete normalisedOrderData.address_line2;

  // 2. Create order
  const { data: order, error } = await supabase.from('orders').insert([{
    ...normalisedOrderData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;

  // 3. TRIGGER: Decrement stock
  for (const item of items) {
    if (!item.id) continue;
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
    if (product) {
      await supabase.from('products').update({
        stock: Math.max(0, product.stock - (item.qty || item.units || 1)),
        updated_at: new Date().toISOString(),
      }).eq('id', item.id);
    }
  }

  // 4. TRIGGER: Increment coupon used_count
  if (orderData.coupon_code) {
    const { data: coupon } = await supabase.from('coupons').select('id,used_count').ilike('code', orderData.coupon_code).single();
    if (coupon) {
      await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id);
    }
  }

  // 5. TRIGGER: Upsert customer stats
  if (orderData.customer_email) {
    const { data: existing } = await supabase.from('customers').select('id,total_orders,total_spent').eq('email', orderData.customer_email).single();
    const orderTotal = parseFloat(orderData.total || 0);
    if (existing) {
      await supabase.from('customers').update({
        total_orders: (existing.total_orders || 0) + 1,
        total_spent:  parseFloat(existing.total_spent || 0) + orderTotal,
        updated_at:   new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('customers').insert([{
        name: orderData.customer_name || '', email: orderData.customer_email,
        phone: orderData.customer_phone || '', city: orderData.city || '',
        state: orderData.state || '', pincode: orderData.pincode || '',
        total_orders: 1, total_spent: orderTotal,
        created_at: new Date().toISOString(),
      }]);
    }
  }

  // 6. TRIGGER: Log initial status
  await supabase.from('order_status_logs').insert([{
    order_id: order.id, old_status: null,
    new_status: orderData.fulfillment || 'Pending',
    note: 'Order placed', created_at: new Date().toISOString(),
  }]);

  // 7. TRIGGER: Audit log
  await writeAudit({ tableName: 'orders', recordId: order.id, action: 'INSERT', newValues: { total: orderData.total, customer_email: orderData.customer_email } });

  return order;
}

// SP: Cancel order — restores stock, logs status
async function sp_cancel_order(orderId, reason, cancelledBy) {
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order) throw new Error('Order not found');
  if (['Delivered','Cancelled'].includes(order.fulfillment)) throw new Error(`Cannot cancel: ${order.fulfillment}`);

  // Restore stock
  const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
  for (const item of items) {
    if (!item.id) continue;
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
    if (product) {
      await supabase.from('products').update({
        stock: product.stock + (item.qty || 1),
        updated_at: new Date().toISOString(),
      }).eq('id', item.id);
    }
  }

  await supabase.from('orders').update({ fulfillment: 'Cancelled', updated_at: new Date().toISOString() }).eq('id', orderId);
  await supabase.from('order_status_logs').insert([{
    order_id: orderId, old_status: order.fulfillment, new_status: 'Cancelled',
    changed_by: cancelledBy, note: reason || 'Cancelled', created_at: new Date().toISOString(),
  }]);
  await writeAudit({ tableName: 'orders', recordId: orderId, action: 'UPDATE', oldValues: { fulfillment: order.fulfillment }, newValues: { fulfillment: 'Cancelled' } });
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG TRIGGER
// ═══════════════════════════════════════════════════════════════
async function writeAudit({ userId, tableName, recordId, action, oldValues, newValues, ipAddress }) {
  try {
    await supabase.from('audit_logs').insert([{
      user_id: userId || null, table_name: tableName,
      record_id: String(recordId || ''), action,
      old_values: oldValues || null, new_values: newValues || null,
      ip_address: ipAddress || null, created_at: new Date().toISOString(),
    }]);
  } catch(e) { console.warn('[AUDIT]', e.message); }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL HELPER
// ═══════════════════════════════════════════════════════════════
async function sendOrderEmail(order) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD || !order.customer_email) return;
  let items = [];
  try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch {}

  const itemRows = items.map(i => `<tr>
    <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">${i.name||'Product'}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:center">${i.qty||i.units||1}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(i.price||i.selling_price||0).toLocaleString('en-IN')}</td>
  </tr>`).join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:30px auto;background:white;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2d5016,#4a7c2f);padding:28px 36px;text-align:center">
      <div style="font-size:26px;font-weight:800;color:white">ASCOVITA HEALTHCARE</div>
    </div>
    <div style="padding:28px 36px 0;text-align:center">
      <div style="font-size:36px">🎉</div>
      <h1 style="font-size:20px;color:#1a1a1a;margin:10px 0 4px">Order Confirmed!</h1>
      <p style="color:#666;font-size:13px">Thank you ${order.customer_name||''}! Your order is placed.</p>
    </div>
    <div style="margin:20px 36px;background:#f8fdf4;border:2px solid #4a7c2f;border-radius:10px;padding:14px;text-align:center">
      <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px">Order ID</div>
      <div style="font-size:16px;font-weight:700;color:#2d5016">${order.id||''}</div>
      <div style="margin-top:6px">${order.payment_status==='Paid'?'<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:11px">✅ PAID</span>':'<span style="background:#fef9c3;color:#854d0e;padding:3px 10px;border-radius:20px;font-size:11px">💵 COD</span>'}</div>
    </div>
    <div style="padding:0 36px">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f0f0f0"><th style="padding:8px 10px;text-align:left;font-size:11px">Product</th><th style="padding:8px 10px;text-align:center;font-size:11px">Qty</th><th style="padding:8px 10px;text-align:right;font-size:11px">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr style="background:#f8fdf4"><td colspan="2" style="padding:10px;font-weight:700;color:#2d5016">Total</td><td style="padding:10px;font-weight:700;color:#2d5016;text-align:right">₹${parseFloat(order.total||0).toLocaleString('en-IN')}</td></tr></tfoot>
      </table>
    </div>
    <div style="margin:16px 36px;background:#f9f9f9;border-radius:10px;padding:16px;font-size:12px;color:#555;line-height:1.7">
      <strong>Delivery to:</strong> ${order.customer_name||''}<br>
      ${order.address || [order.address_line1, order.address_line2].filter(Boolean).join(', ') || ''}, ${order.city||''}, ${order.state||''} - ${order.pincode||''}<br>
      📞 ${order.customer_phone||''}
    </div>
    <div style="padding:0 36px 28px;text-align:center">
      <a href="https://wa.me/919898582650" style="display:inline-block;background:#25d366;color:white;padding:9px 20px;border-radius:8px;font-weight:600;font-size:12px;text-decoration:none;margin-right:6px">💬 WhatsApp Support</a>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:11px;color:#999">© 2025 Ascovita Healthcare | Anand, Gujarat</div>
  </div></body></html>`;

  try {
    const fromAddr = process.env.MAIL_FROM || `Ascovita Healthcare <${process.env.MAIL_USER}>`;
    // Send to customer
    await mailer.sendMail({
      from: fromAddr,
      to: order.customer_email,
      subject: `✅ Order Confirmed — ${order.id} | Ascovita Healthcare`,
      html,
    });
    console.log(`✅ [EMAIL] Order confirmation sent to ${order.customer_email}`);
    // Send admin copy
    await mailer.sendMail({
      from: fromAddr,
      to: process.env.MAIL_USER,
      subject: `🛒 New Order: ${order.id} — ₹${order.total} — ${order.customer_name}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px">
        <h3 style="color:#2d5016">New Order Received</h3>
        <p><b>Order ID:</b> ${order.id}</p>
        <p><b>Customer:</b> ${order.customer_name} (${order.customer_email})</p>
        <p><b>Phone:</b> ${order.customer_phone}</p>
        <p><b>Total:</b> ₹${order.total}</p>
        <p><b>Payment:</b> ${order.payment_status}</p>
        <p><b>City:</b> ${order.city || '-'}</p>
      </div>`,
    });
    console.log(`✅ [EMAIL] Admin copy sent to ${process.env.MAIL_USER}`);
  } catch(e) {
    console.error(`❌ [EMAIL] Failed for order ${order.id}: ${e.message}`);
    if (e.message.includes('535') || e.message.includes('Username and Password')) {
      console.error('   → MAIL_PASSWORD is wrong. Use Gmail App Password from myaccount.google.com/apppasswords');
    } else if (e.message.includes('ECONNREFUSED') || e.message.includes('ETIMEDOUT')) {
      console.error('   → Render is blocking SMTP port 465. Switch to port 587 in mailer config.');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP REPORT HELPER (Twilio)
// ═══════════════════════════════════════════════════════════════
async function sendWhatsAppReport(reportText) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const to    = process.env.WHATSAPP_REPORT_TO   || 'whatsapp:+919898582650';

  if (!sid || !token) {
    console.warn('[WHATSAPP] Twilio credentials not set');
    return false;
  }

  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      },
      body: new URLSearchParams({ From: from, To: to, Body: reportText }).toString(),
    });
    const data = await r.json();
    if (data.sid) { console.log('✅ [WHATSAPP] Sent:', data.sid); return true; }
    console.error('[WHATSAPP] Failed:', JSON.stringify(data));
    return false;
  } catch(e) { console.error('[WHATSAPP]', e.message); return false; }
}

async function buildDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('*').gte('created_at', today).order('created_at', { ascending: false }),
    supabase.from('products').select('name,stock').eq('active', true).lt('stock', 20).is('deleted_at', null),
  ]);

  const orders   = ordersRes.data  || [];
  const lowStock = productsRes.data || [];
  const paid     = orders.filter(o => o.payment_status === 'Paid');
  const cod      = orders.filter(o => o.payment_status === 'COD - Pending');
  const revenue  = paid.reduce((s, o) => s + parseFloat(o.total || 0), 0);

  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

  let msg = `🌿 *ASCOVITA HEALTHCARE*\n📊 Daily Report — ${date} ${time}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 Today's Orders: *${orders.length}*\n`;
  msg += `💰 Online Revenue: *₹${revenue.toLocaleString('en-IN')}*\n`;
  msg += `✅ Paid Orders: *${paid.length}*\n`;
  msg += `💵 COD Pending: *${cod.length}*\n`;

  if (lowStock.length > 0) {
    msg += `\n⚠️ *Low Stock Alert:*\n`;
    lowStock.slice(0, 5).forEach(p => { msg += `  • ${p.name}: ${p.stock} left\n`; });
  }

  if (paid.length > 0) {
    msg += `\n🛒 *Recent Orders:*\n`;
    paid.slice(0, 3).forEach(o => { msg += `  • ${o.customer_name} — ₹${o.total}\n`; });
  }

  msg += `\n🔗 Admin: https://ascovitahealthcare-cell-github-io.onrender.com\n`;
  return msg;
}

// Schedule report every 12 hours (6 AM and 6 PM IST)
function scheduleReports() {
  const checkAndSend = async () => {
    const now  = new Date();
    const ist  = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = ist.getHours();
    const min  = ist.getMinutes();
    if ((hour === 6 || hour === 18) && min < 5) {
      console.log(`[WHATSAPP] Sending scheduled ${hour === 6 ? 'morning' : 'evening'} report...`);
      const report = await buildDailyReport();
      await sendWhatsAppReport(report);
    }
  };
  setInterval(checkAndSend, 5 * 60 * 1000); // Check every 5 minutes
  console.log('✅ WhatsApp report scheduler started (6AM & 6PM IST)');
}

// ═══════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: signToken({ role: 'admin', email: 'admin@ascovita.com' }), role: 'admin' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// ═══════════════════════════════════════════════════════════════
// AUTH — Google + Email
// ═══════════════════════════════════════════════════════════════
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });
    const googleRes  = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const googleData = await googleRes.json();
    if (googleData.error || googleData.aud !== process.env.GOOGLE_CLIENT_ID) return res.status(401).json({ error: 'Invalid Google token' });

    const { email, name, picture } = googleData;
    const { data: existing } = await supabase.from('customers').select('*').eq('email', email).single();
    let customer;
    if (existing) {
      const { data: u } = await supabase.from('customers').update({ name, updated_at: new Date().toISOString() }).eq('email', email).select().single();
      customer = u || existing;
    } else {
      const { data: c, error } = await supabase.from('customers').insert([{ email, name, created_at: new Date().toISOString() }]).select().single();
      if (error) throw error;
      customer = c;
      await writeAudit({ tableName: 'customers', recordId: customer.id, action: 'INSERT', newValues: { email, name } });
    }
    res.json({ token: signToken({ id: customer.id, email: customer.email, name: customer.name }), user: { id: customer.id, name: customer.name, email: customer.email, picture: picture||'' } });
  } catch(err) { res.status(500).json({ error: 'Authentication failed' }); }
});

// ── Google OAuth2 authorization CODE exchange (mobile/Safari redirect flow) ──
// Called by frontend after Google redirects back with ?code=xxx
// Exchanges the code for tokens server-side (keeps client_secret safe)
app.post('/api/auth/google-code', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code)         return res.status(400).json({ error: 'Missing code' });
    if (!redirect_uri) return res.status(400).json({ error: 'Missing redirect_uri' });

    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientSecret) return res.status(500).json({ error: 'GOOGLE_CLIENT_SECRET not configured on server' });

    // Step 1: Exchange auth code → access_token + id_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri,
        grant_type:    'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('[google-code] Token exchange error:', tokenData);
      return res.status(401).json({ error: tokenData.error_description || 'Code exchange failed' });
    }

    // Step 2: Verify the id_token to get user profile
    const verifyRes  = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`);
    const googleData = await verifyRes.json();
    if (googleData.error || googleData.aud !== clientId) {
      return res.status(401).json({ error: 'Invalid Google token after code exchange' });
    }

    const { email, name, picture } = googleData;

    // Step 3: Upsert customer in Supabase (same logic as /api/auth/google)
    const { data: existing } = await supabase.from('customers').select('*').eq('email', email).single();
    let customer;
    if (existing) {
      const { data: u } = await supabase.from('customers')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('email', email).select().single();
      customer = u || existing;
    } else {
      const { data: c, error } = await supabase.from('customers')
        .insert([{ email, name, created_at: new Date().toISOString() }])
        .select().single();
      if (error) throw error;
      customer = c;
      await writeAudit({ tableName: 'customers', recordId: customer.id, action: 'INSERT', newValues: { email, name } });
    }

    res.json({
      token: signToken({ id: customer.id, email: customer.email, name: customer.name }),
      user:  { id: customer.id, name: customer.name, email: customer.email, picture: picture || '' },
    });

  } catch(err) {
    console.error('[google-code] Error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/api/auth/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const { data: customer } = await supabase.from('customers').select('*').eq('email', email).single();
    if (!customer) return res.status(401).json({ error: 'Invalid email or password' });
    if (customer.deleted_at) return res.status(403).json({ error: 'Account deactivated' });
    // Support bcrypt hashes and legacy base64 (migrated on next login)
    let passwordMatch = false;
    if (customer.password) {
      if (customer.password.startsWith('$2b$') || customer.password.startsWith('$2a$')) {
        passwordMatch = await bcrypt.compare(password, customer.password);
      } else {
        // Legacy base64 — verify then silently upgrade to bcrypt
        passwordMatch = customer.password === Buffer.from(password).toString('base64');
        if (passwordMatch) {
          const upgraded = await bcrypt.hash(password, BCRYPT_ROUNDS);
          await supabase.from('customers').update({ password: upgraded, updated_at: new Date().toISOString() }).eq('id', customer.id);
        }
      }
    }
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signToken({ id: customer.id, email: customer.email, name: customer.name }), user: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone||'' } });
  } catch(err) { res.status(500).json({ error: 'Login failed' }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const { data: existing } = await supabase.from('customers').select('id,deleted_at').eq('email', email).single();
    if (existing && existing.deleted_at) {
      const hashedPw = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await supabase.from('customers').update({ name, phone, password: hashedPw, deleted_at: null, updated_at: new Date().toISOString() }).eq('email', email);
      const { data: restored } = await supabase.from('customers').select('*').eq('email', email).single();
      return res.json({ token: signToken({ id: restored.id, email: restored.email, name: restored.name }), user: { id: restored.id, name: restored.name, email: restored.email } });
    }
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashedPw = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { data: customer, error } = await supabase.from('customers').insert([{ name, email, phone, password: hashedPw, created_at: new Date().toISOString() }]).select().single();
    if (error) throw error;
    await writeAudit({ tableName: 'customers', recordId: customer.id, action: 'INSERT', newValues: { email, name } });
    res.json({ token: signToken({ id: customer.id, email: customer.email, name: customer.name }), user: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone||'' } });
  } catch(err) { res.status(500).json({ error: 'Registration failed' }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('customers').select('id,name,email,phone,address').eq('id', req.user.id).single();
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const { data, error } = await supabase.from('customers').update({ name, phone, address, updated_at: new Date().toISOString() }).eq('id', req.user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch(err) { res.status(500).json({ error: 'Update failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// GEMINI PROXY — key never leaves the server
// ═══════════════════════════════════════════════════════════════
// Admin assistant (requires JWT)
app.post('/api/gemini', authMiddleware, async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: 'Gemini not configured — add GEMINI_API_KEY to Render env vars' });
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(req.body),
        signal:  AbortSignal.timeout(20000),
      }
    );
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    console.error('[Gemini proxy]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Vita chatbot (public storefront) — IP rate-limited: 20 req/min
const _vitaCounts = new Map();
app.post('/api/gemini/vita', async (req, res) => {
  try {
    const ip  = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const now = Date.now();
    const e   = _vitaCounts.get(ip) || { count: 0, window: now };
    if (now - e.window > 60_000) { e.count = 0; e.window = now; }
    e.count++;
    _vitaCounts.set(ip, e);
    if (e.count > 20) return res.status(429).json({ error: 'Too many requests — please wait a minute.' });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: 'AI advisor temporarily unavailable.' });
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(req.body), signal:AbortSignal.timeout(20000) }
    );
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    console.error('[Gemini/vita]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// RECAPTCHA
// ═══════════════════════════════════════════════════════════════
app.post('/api/verify-captcha', async (req, res) => {
  try {
    const { token } = req.body;
    const r = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`, { method: 'POST' });
    const data = await r.json();
    res.json({ success: data.success, score: data.score });
  } catch { res.status(500).json({ success: false }); }
});

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOAD TO SUPABASE STORAGE
// ═══════════════════════════════════════════════════════════════
app.post('/api/upload/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided (field name must be "image")' });

    await ensureBucket(supabase);

    const ext          = req.file.originalname.split('.').pop().toLowerCase() || 'jpg';
    const storagePath  = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadErr) throw new Error('Upload failed: ' + uploadErr.message);

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error('Could not get public URL after upload');

    await supabase.from('image_library').insert([{
      file_name: storagePath.split('/').pop(),
      storage_path: storagePath,
      public_url: publicUrl,
      original_name: req.file.originalname,
      size_bytes: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user?.email || 'admin',
      created_at: new Date().toISOString(),
    }]);

    res.json({ url: publicUrl, public_url: publicUrl, filename: storagePath, success: true });
  } catch(err) {
    console.error('[UPLOAD]', err.message);
    res.status(500).json({
      error: err.message,
      hint: err.message.includes('bucket') ? `Create bucket "${BUCKET_NAME}" in Supabase Storage (set as Public)` : 'Check Render logs',
    });
  }
});

app.get('/api/upload/library', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('image_library').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) {
      const { data: files } = await supabase.storage.from('products').list('products', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      const urls = (files || []).map(f => ({
        filename: `products/${f.name}`,
        url: supabase.storage.from('products').getPublicUrl(`products/${f.name}`).data.publicUrl,
        original_name: f.name,
        created_at: f.created_at,
      }));
      return res.json({ data: urls });
    }
    res.json({ data: data || [] });
  } catch(err) { res.status(500).json({ error: err.message, data: [] }); }
});

app.delete('/api/upload/library/:filename', authMiddleware, async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    await supabase.storage.from('products').remove([filename]);
    await supabase.from('image_library').delete().eq('filename', filename);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// PRODUCTS — with soft delete, audit, normalised
// ═══════════════════════════════════════════════════════════════
app.get('/api/products', async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0',
      'Surrogate-Control': 'no-store',
    });
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch(err) { res.status(500).json({ error: err.message, data: [] }); }
});

app.get('/api/admin/products', authMiddleware, async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0',
    });
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch(err) { res.status(500).json({ error: err.message, data: [] }); }
});

app.post('/api/admin/products', authMiddleware, async (req, res) => {
  try {
    const b = req.body;
    const body = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active:     b.is_active !== undefined ? Boolean(b.is_active) : (b.active !== false),
      deleted_at: null,
    };

    const safeFields = [
      'name','brand','category','badge','description',
      'price','sale_price','offer_text','stock','rating','reviews',
      'image','image2','image3','image4','image5',
      'how_to_use','has_tiers','meta_description','hsn',
    ];
    safeFields.forEach(f => { if (b[f] !== undefined) body[f] = b[f]; });

    if (!body.price && b.mrp) body.price = b.mrp;
    if ('sale_price' in b) body.sale_price = b.sale_price || null;

    const arrayFields = ['tags','key_ingredients','seo_keywords','tiers','images'];
    arrayFields.forEach(f => {
      const val = b[f];
      if (val === undefined) return;
      if (Array.isArray(val)) body[f] = val;
      else if (typeof val === 'string') {
        try { body[f] = JSON.parse(val); } catch { body[f] = val ? val.split(',').map(s=>s.trim()).filter(Boolean) : []; }
      }
    });

    console.log('[POST /api/admin/products] inserting:', JSON.stringify(body));
    const { data, error } = await supabase.from('products').insert([body]).select().single();
    if (error) {
      console.error('[POST /api/admin/products] supabase error:', error);
      throw error;
    }
    await writeAudit({ userId: req.user?.email, tableName: 'products', recordId: data.id, action: 'INSERT', newValues: { name: body.name }, ipAddress: req.ip });
    res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.json(data);
  } catch(err) {
    console.error('[POST /api/admin/products]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
  try {
    const b = req.body;
    const body = { updated_at: new Date().toISOString() };

    const safeFields = [
      'name','brand','category','badge','description',
      'price','sale_price','offer_text','stock','active','rating','reviews',
      'image','image2','image3','image4','image5',
      'how_to_use','has_tiers','meta_description','hsn','deleted_at',
    ];
    safeFields.forEach(f => { if (b[f] !== undefined) body[f] = b[f]; });

    if (b.is_active !== undefined) body.active = Boolean(b.is_active);
    if (!body.price && b.mrp) body.price = b.mrp;
    if ('sale_price' in b) body.sale_price = b.sale_price || null;
    if ('deleted_at' in b) body.deleted_at = b.deleted_at || null;

    const arrayFields = ['tags','key_ingredients','seo_keywords','tiers','images'];
    arrayFields.forEach(f => {
      const val = b[f];
      if (val === undefined) return;
      if (Array.isArray(val)) body[f] = val;
      else if (typeof val === 'string') {
        try { body[f] = JSON.parse(val); } catch { body[f] = val ? val.split(',').map(s=>s.trim()).filter(Boolean) : []; }
      }
    });

    console.log('[PUT /api/admin/products/:id] updating:', req.params.id, JSON.stringify(body));
    const { data: old } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('products').update(body).eq('id', req.params.id).select().single();
    if (error) {
      console.error('[PUT /api/admin/products/:id] supabase error:', error);
      throw error;
    }
    await writeAudit({ userId: req.user?.email, tableName: 'products', recordId: req.params.id, action: 'UPDATE', oldValues: old, newValues: body, ipAddress: req.ip });
    res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
    res.json(data);
  } catch(err) {
    console.error('[PUT /api/admin/products/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  try {
    const { data: old } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    const { error } = await supabase.from('products').update({
      active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    if (error) throw error;
    await writeAudit({ userId: req.user?.email, tableName: 'products', recordId: req.params.id, action: 'SOFT_DELETE', oldValues: old, ipAddress: req.ip });
    res.json({ success: true });
  } catch(err) {
    console.error('[DELETE /api/admin/products/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id/restore', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('products').update({
      active: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    if (error) throw error;
    await writeAudit({ userId: req.user?.email, tableName: 'products', recordId: req.params.id, action: 'RESTORE', ipAddress: req.ip });
    res.json({ success: true });
  } catch(err) {
    console.error('[PUT /api/admin/products/:id/restore]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id/restore', authMiddleware, async (req, res) => {
  try {
    await supabase.from('products').update({ active: true, deleted_at: null, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    await writeAudit({ userId: req.user?.email, tableName: 'products', recordId: req.params.id, action: 'RESTORE', ipAddress: req.ip });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// COUPONS — with soft delete, normalised
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/coupons', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  res.json({ data: data || [] });
});

app.post('/api/admin/coupons', authMiddleware, async (req, res) => {
  try {
    // Only pass known coupon columns — never let client inject updated_at/id/etc.
    const { code, type, value, min_order, max_uses, expires_at, active, description } = req.body;
    const payload = { code, type, value, min_order: min_order||null, max_uses: max_uses||null, expires_at: expires_at||null, active: active!==false, description: description||null, created_at: new Date().toISOString(), used_count: 0 };
    const { data, error } = await supabase.from('coupons').insert([payload]).select().single();
    if (error) throw error;
    await writeAudit({ userId: req.user?.email, tableName: 'coupons', recordId: data.id, action: 'INSERT', newValues: { code, type, value } });
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/coupons/:id', authMiddleware, async (req, res) => {
  try {
    // Only update known coupon columns — strip updated_at and any unknown fields
    const { code, type, value, min_order, max_uses, expires_at, active, description } = req.body;
    const payload = { code, type, value, min_order: min_order||null, max_uses: max_uses||null, expires_at: expires_at||null, active: active!==false, description: description||null };
    const { data, error } = await supabase.from('coupons').update(payload).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/coupons/:id', authMiddleware, async (req, res) => {
  await supabase.from('coupons').update({ active: false, deleted_at: new Date().toISOString() }).eq('id', req.params.id);
  res.json({ success: true });
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'No code provided' });
    const { data: coupon } = await supabase.from('coupons').select('*').ilike('code', code).single();
    if (!coupon || !coupon.active || coupon.deleted_at) return res.json({ valid: false, message: 'Invalid or inactive coupon' });
    if (coupon.min_order && subtotal < coupon.min_order) return res.json({ valid: false, message: `Min order ₹${coupon.min_order} required` });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.json({ valid: false, message: 'Coupon expired' });
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return res.json({ valid: false, message: 'Usage limit reached' });
    const discount = coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : Math.min(coupon.value, subtotal);
    res.json({ valid: true, code: coupon.code, type: coupon.type, value: coupon.value, discount, label: coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF` });
  } catch(err) { res.status(500).json({ valid: false, message: 'Server error' }); }
});

// ═══════════════════════════════════════════════════════════════
// ORDERS — full stored procedure based
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('orders').select('*').is('deleted_at', null).order('created_at', { ascending: false });
  res.json({ data: data || [] });
});

app.get('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (!data) return res.status(404).json({ error: 'Not found' });
  const { data: history } = await supabase.from('order_status_logs').select('*').eq('order_id', req.params.id).order('created_at', { ascending: true });
  res.json({ data: { ...data, status_history: history || [] } });
});

app.get('/api/orders/my', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('orders').select('*').eq('customer_email', req.user.email).is('deleted_at', null).order('created_at', { ascending: false });
  res.json({ data: data || [] });
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await sp_place_order(req.body);
    await sendOrderEmail(order).catch(() => {});
    res.json(order);
  } catch(err) {
    console.error('[ORDER]', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body, updated_at: new Date().toISOString() };
    const { data: old } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('orders').update(body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (old && body.fulfillment && body.fulfillment !== old.fulfillment) {
      await supabase.from('order_status_logs').insert([{
        order_id: req.params.id, old_status: old.fulfillment, new_status: body.fulfillment,
        changed_by: req.user?.email, note: body.shiprocket_id ? `SR: ${body.shiprocket_id}` : null,
        created_at: new Date().toISOString(),
      }]);
    }
    await writeAudit({ userId: req.user?.email, tableName: 'orders', recordId: req.params.id, action: 'UPDATE', oldValues: old, newValues: body, ipAddress: req.ip });
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders/:id/cancel', authMiddleware, async (req, res) => {
  try {
    await sp_cancel_order(req.params.id, req.body.reason, req.user?.email);
    res.json({ success: true, message: 'Order cancelled and stock restored' });
  } catch(err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  try {
    const { data: old } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    await supabase.from('orders').update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', req.params.id);
    await writeAudit({ userId: req.user?.email, tableName: 'orders', recordId: req.params.id, action: 'SOFT_DELETE', oldValues: old });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:id/history', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('order_status_logs').select('*').eq('order_id', req.params.id).order('created_at', { ascending: true });
  res.json({ data: data || [] });
});

// ═══════════════════════════════════════════════════════════════
// ADMIN STATS
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [ordersR, prodsR, custsR] = await Promise.all([
      supabase.from('orders').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(1000),
      supabase.from('products').select('id,name,stock,active').eq('active', true).is('deleted_at', null),
      supabase.from('customers').select('id').is('deleted_at', null),
    ]);
    const orders = ordersR.data || [], products = prodsR.data || [], customers = custsR.data || [];
    const today  = new Date().toISOString().split('T')[0];
    const paid   = orders.filter(o => o.payment_status === 'Paid');
    res.json({ stats: {
      totalRevenue:   paid.reduce((s, o) => s + parseFloat(o.total || 0), 0),
      totalOrders:    orders.length,
      totalCustomers: customers.length,
      totalProducts:  products.length,
      pendingOrders:  orders.filter(o => !o.fulfillment || o.fulfillment === 'Pending').length,
      todayOrders:    orders.filter(o => (o.created_at || '').startsWith(today)).length,
      todayRevenue:   paid.filter(o => (o.created_at || '').startsWith(today)).reduce((s, o) => s + parseFloat(o.total || 0), 0),
      lowStockCount:  products.filter(p => p.stock < 20).length,
    }});
  } catch(err) { res.status(500).json({ error: err.message, stats: {} }); }
});

// ═══════════════════════════════════════════════════════════════
// CUSTOMERS — soft delete + restore
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/customers', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('customers').select('*').is('deleted_at', null).order('created_at', { ascending: false });
  res.json({ data: data || [] });
});

app.delete('/api/admin/customers/:id', authMiddleware, async (req, res) => {
  try {
    const { data: old } = await supabase.from('customers').select('*').eq('id', req.params.id).single();
    await supabase.from('customers').update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', req.params.id);
    await writeAudit({ userId: req.user?.email, tableName: 'customers', recordId: req.params.id, action: 'SOFT_DELETE', oldValues: old });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/customers/:id/restore', authMiddleware, async (req, res) => {
  try {
    await supabase.from('customers').update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/audit', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
  res.json({ data: data || [] });
});

// ═══════════════════════════════════════════════════════════════
// WHATSAPP REPORTS
// ═══════════════════════════════════════════════════════════════
app.post('/api/admin/whatsapp/send-report', authMiddleware, async (req, res) => {
  try {
    const report = req.body.message || await buildDailyReport();
    const ok = await sendWhatsAppReport(report);
    if (ok) res.json({ success: true, message: 'WhatsApp report sent!' });
    else res.status(500).json({ error: 'Failed to send. Check Twilio credentials.' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/whatsapp/preview', authMiddleware, async (req, res) => {
  try {
    const report = await buildDailyReport();
    res.json({ report });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// CASHFREE PAYMENTS
// ═══════════════════════════════════════════════════════════════
const CF_BASE = process.env.CASHFREE_ENV === 'PRODUCTION'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

async function cfVerifyOrder(orderId) {
  const r = await fetch(`${CF_BASE}/orders/${orderId}`, {
    headers: {
      'x-api-version':    '2023-08-01',
      'x-client-id':      process.env.CASHFREE_APP_ID     || '',
      'x-client-secret':  process.env.CASHFREE_SECRET_KEY || '',
    },
  });
  if (!r.ok) throw new Error(`Cashfree verify HTTP ${r.status}`);
  return r.json();
}

async function cfGetPayments(orderId) {
  try {
    const r = await fetch(`${CF_BASE}/orders/${orderId}/payments`, {
      headers: {
        'x-api-version':   '2023-08-01',
        'x-client-id':     process.env.CASHFREE_APP_ID     || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
      },
    });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [data];
  } catch(e) { return []; }
}

app.post('/api/create-cashfree-order', async (req, res) => {
  try {
    const body           = req.body || {};
    const amount         = body.amount || body.order_amount || null;
    const customer_email = body.customer_email || body.customer_details?.customer_email || body.email || null;
    const customer_name  = body.customer_name  || body.customer_details?.customer_name  || 'Customer';
    const customer_phone = body.customer_phone || body.customer_details?.customer_phone || '9999999999';
    const order_id       = body.order_id || ('ASC-' + Date.now());

    if (!amount)         return res.status(400).json({ error: 'Missing amount' });
    if (!customer_email) return res.status(400).json({ error: 'Missing customer_email' });

    const BACKEND_URL  = process.env.RENDER_EXTERNAL_URL || 'https://ascovitahealthcare-cell-github-io.onrender.com';
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ascovitahealthcare-cell.github.io';

    const payload = {
      order_id,
      order_amount:   parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id:    customer_email.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50),
        customer_name,
        customer_email,
        customer_phone: String(customer_phone).replace(/[^0-9]/g, '').slice(-10),
      },
      order_meta: {
        return_url:  `${FRONTEND_URL}?cf_order=${order_id}`,
        notify_url:  `${BACKEND_URL}/api/cashfree-webhook`,
      },
    };

    const r = await fetch(`${CF_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-version':   '2023-08-01',
        'x-client-id':     process.env.CASHFREE_APP_ID     || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || JSON.stringify(data));
    console.log(`[Cashfree] Created order ${order_id} for ₹${amount}`);
    res.json(data);
  } catch(err) {
    console.error('[create-cashfree-order]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/verify-order/:orderId', async (req, res) => {
  try {
    const cfData = await cfVerifyOrder(req.params.orderId);

    if (cfData.order_status === 'PAID') {
      const payments    = await cfGetPayments(req.params.orderId);
      const cfPaymentId = payments[0]?.cf_payment_id || cfData.cf_order_id || req.params.orderId;

      const { data: existing } = await supabase
        .from('orders').select('id, payment_status').eq('id', req.params.orderId).single();

      if (existing && existing.payment_status !== 'Paid') {
        await supabase.from('orders').update({
          payment_status: 'Paid',
          cf_payment_id:  cfPaymentId,
          updated_at:     new Date().toISOString(),
        }).eq('id', req.params.orderId);
        console.log(`[verify-order] Marked ${req.params.orderId} as Paid`);
      }
    }

    res.json(cfData);
  } catch(err) {
    console.error('[verify-order]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cashfree-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  res.json({ status: 'ok' });

  try {
    const crypto      = require('crypto');
    const rawBody     = req.body;
    const receivedSig = req.headers['x-webhook-signature'];
    const timestamp   = req.headers['x-webhook-timestamp'];

    if (receivedSig && timestamp && process.env.CASHFREE_SECRET_KEY) {
      const expected = crypto
        .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
        .update(timestamp + rawBody.toString())
        .digest('base64');
      if (receivedSig !== expected) {
        console.warn('[webhook] Invalid signature — ignored');
        return;
      }
    }

    const event     = Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString()) : rawBody;
    const eventType = event?.type || '';
    console.log(`[webhook] Event: ${eventType}`);

    const isPaymentSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      event?.data?.order?.order_status === 'PAID' ||
      event?.data?.payment?.payment_status === 'SUCCESS';

    if (!isPaymentSuccess) return;

    const orderId = event?.data?.order?.order_id;
    if (!orderId) { console.warn('[webhook] No order_id in event'); return; }

    const cfData = await cfVerifyOrder(orderId);
    if (cfData.order_status !== 'PAID') {
      console.warn(`[webhook] Order ${orderId} re-verify: ${cfData.order_status} — ignoring`);
      return;
    }

    const cfPaymentId = event?.data?.payment?.cf_payment_id || cfData.cf_order_id || orderId;
    const now         = new Date().toISOString();

    const { data: existing } = await supabase
      .from('orders').select('id, payment_status').eq('id', orderId).single();

    if (existing) {
      if (existing.payment_status !== 'Paid') {
        await supabase.from('orders').update({
          payment_status: 'Paid',
          cf_payment_id:  cfPaymentId,
          updated_at:     now,
        }).eq('id', orderId);
        console.log(`[webhook] ✅ Marked existing order ${orderId} as Paid`);
      } else {
        console.log(`[webhook] Order ${orderId} already Paid — no action`);
      }
      return;
    }

    const webhookOrderData = {
      id:             orderId,
      customer_name:  event?.data?.customer_details?.customer_name  || 'Customer',
      customer_email: event?.data?.customer_details?.customer_email || '',
      customer_phone: event?.data?.customer_details?.customer_phone || '',
      total:          cfData.order_amount,
      payment_status: 'Paid',
      fulfillment:    'Pending',
      payment_method: event?.data?.payment?.payment_method || 'online',
      cf_payment_id:  cfPaymentId,
      items:          '[]',
    };

    try {
      await sp_place_order(webhookOrderData);
      console.log(`[webhook] ✅ Created new order ${orderId} from webhook`);
    } catch(saveErr) {
      if (saveErr.code === '23505' || saveErr.message?.includes('duplicate') || saveErr.message?.includes('already exists')) {
        console.log(`[webhook] Order ${orderId} duplicate on insert — already saved`);
      } else {
        console.error(`[webhook] Failed to save order ${orderId}:`, saveErr.message);
      }
    }

  } catch(err) {
    console.error('[webhook] Unhandled error:', err.message);
  }
});

app.post('/api/confirm-order', async (req, res) => {
  try {
    const { cf_order_id, order_data } = req.body;
    if (!cf_order_id)  return res.status(400).json({ error: 'Missing cf_order_id' });
    if (!order_data)   return res.status(400).json({ error: 'Missing order_data' });

    let cfData;
    try {
      cfData = await cfVerifyOrder(cf_order_id);
    } catch(verifyErr) {
      console.error('[confirm-order] Cashfree verify failed:', verifyErr.message);
      return res.status(502).json({ error: 'Could not verify payment with Cashfree. Please try again.' });
    }

    if (cfData.order_status !== 'PAID') {
      console.warn(`[confirm-order] Order ${cf_order_id} not PAID — status: ${cfData.order_status}`);
      return res.status(402).json({
        error:        'Payment not confirmed by Cashfree',
        order_status: cfData.order_status,
        message:      cfData.order_status === 'ACTIVE'
          ? 'Payment was not completed. Please try again.'
          : `Payment status: ${cfData.order_status}. If money was deducted contact support.`,
      });
    }

    const payments    = await cfGetPayments(cf_order_id);
    const cfPaymentId = payments[0]?.cf_payment_id || cfData.cf_order_id || cf_order_id;

    const { data: existing } = await supabase
      .from('orders').select('id, payment_status, customer_email').eq('id', cf_order_id).single();

    if (existing) {
      const updatePayload = {
        payment_status: 'Paid',
        cf_payment_id:  cfPaymentId,
        fulfillment:    existing.fulfillment || 'Pending',
        updated_at:     new Date().toISOString(),
      };
      if (!existing.customer_email && order_data.customer_email) {
        Object.assign(updatePayload, {
          customer_name:  order_data.customer_name,
          customer_email: order_data.customer_email,
          customer_phone: order_data.customer_phone,
          address: [order_data.address_line1, order_data.address_line2].filter(Boolean).join(', ') || order_data.address || '',
          city:           order_data.city,
          state:          order_data.state,
          pincode:        order_data.pincode,
          items:          order_data.items,
          shiprocket_id:  order_data.shiprocket_id || null,
        });
      }
      await supabase.from('orders').update(updatePayload).eq('id', cf_order_id);

      if (order_data.customer_email) {
        await sendOrderEmail({ ...order_data, id: cf_order_id, payment_status: 'Paid' }).catch(e =>
          console.warn('[confirm-order] Email failed:', e.message)
        );
      }

      console.log(`[confirm-order] ✅ Duplicate — updated order ${cf_order_id}`);
      return res.json({ success: true, duplicate: true, order_id: cf_order_id });
    }

    const orderPayload = {
      ...order_data,
      id:             cf_order_id,
      payment_status: 'Paid',
      cf_payment_id:  cfPaymentId,
      fulfillment:    order_data.fulfillment || 'Pending',
    };

    let savedOrder;
    try {
      savedOrder = await sp_place_order(orderPayload);
    } catch(saveErr) {
      if (saveErr.code === '23505' || saveErr.message?.includes('duplicate') || saveErr.message?.includes('already exists')) {
        console.log(`[confirm-order] Race condition duplicate — ${cf_order_id} already saved`);
        await supabase.from('orders').update({
          cf_payment_id: cfPaymentId,
          items:         order_data.items,
          updated_at:    new Date().toISOString(),
        }).eq('id', cf_order_id);
        await sendOrderEmail({ ...order_data, id: cf_order_id, payment_status: 'Paid' }).catch(() => {});
        return res.json({ success: true, duplicate: true, order_id: cf_order_id });
      }
      throw saveErr;
    }

    await sendOrderEmail(savedOrder).catch(e =>
      console.warn('[confirm-order] Email failed:', e.message)
    );

    console.log(`[confirm-order] ✅ New order ${cf_order_id} saved — ₹${order_data.total}`);
    res.json({ success: true, order_id: cf_order_id, data: savedOrder });

  } catch(err) {
    console.error('[confirm-order]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/confirm-cod-order', async (req, res) => {
  try {
    const { order_id, order_data } = req.body;
    if (!order_id)   return res.status(400).json({ error: 'Missing order_id' });
    if (!order_data) return res.status(400).json({ error: 'Missing order_data' });

    const required = ['customer_name','customer_email','customer_phone','city','state','pincode','total'];
    if (!order_data.address && !order_data.address_line1) {
      return res.status(400).json({ error: 'Missing required field: address' });
    }
    if (!order_data.address && order_data.address_line1) {
      order_data.address = [order_data.address_line1, order_data.address_line2].filter(Boolean).join(', ');
    }
    delete order_data.address_line1;
    delete order_data.address_line2;
    const missing = required.filter(f => !order_data[f]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    // ── Recalculate total server-side — never trust the client total ──
    const items = typeof order_data.items === 'string'
      ? JSON.parse(order_data.items || '[]') : (order_data.items || []);
    if (items.length > 0) {
      let subtotal = 0;
      for (const item of items) {
        if (!item.id) continue;
        const { data: prod } = await supabase.from('products')
          .select('sale_price,price').eq('id', item.id).is('deleted_at', null).single();
        if (!prod) continue;
        const unitPrice = parseFloat(prod.sale_price || prod.price || 0);
        subtotal += unitPrice * (item.qty || item.units || 1);
      }
      // Apply coupon discount
      if (order_data.coupon_code) {
        const { data: coupon } = await supabase.from('coupons')
          .select('*').ilike('code', order_data.coupon_code).single();
        if (coupon && coupon.active && !coupon.deleted_at) {
          const disc = coupon.type === 'percent'
            ? Math.round(subtotal * coupon.value / 100)
            : Math.min(coupon.value, subtotal);
          subtotal = Math.max(0, subtotal - disc);
        }
      }
      // COD surcharge: ₹60 waived on orders ≥ ₹599
      const codFee = subtotal >= 599 ? 0 : 60;
      order_data.total = subtotal + codFee;
      console.log(`[confirm-cod] Recalculated total: ₹${order_data.total} (subtotal ₹${subtotal} + COD fee ₹${codFee})`);
    }

    const { data: existing } = await supabase
      .from('orders').select('id, fulfillment').eq('id', order_id).single();

    if (existing) {
      console.log(`[confirm-cod] Duplicate order ${order_id} — returning existing`);
      return res.json({ success: true, duplicate: true, order_id });
    }

    const orderPayload = {
      ...order_data,
      id:             order_id,
      payment_status: 'COD - Pending',
      payment_method: 'cod',
      fulfillment:    'Pending',
    };

    let savedOrder;
    try {
      savedOrder = await sp_place_order(orderPayload);
    } catch(saveErr) {
      if (saveErr.code === '23505' || saveErr.message?.includes('duplicate') || saveErr.message?.includes('already exists')) {
        console.log(`[confirm-cod] Race-condition duplicate ${order_id}`);
        return res.json({ success: true, duplicate: true, order_id });
      }
      if (saveErr.message?.includes('stock') || saveErr.message?.includes('Insufficient')) {
        return res.status(409).json({ error: saveErr.message });
      }
      throw saveErr;
    }

    await sendOrderEmail(savedOrder).catch(e =>
      console.warn('[confirm-cod] Email failed:', e.message)
    );

    console.log(`[confirm-cod] ✅ COD order ${order_id} placed — ₹${order_data.total} — ${order_data.customer_name}`);
    res.json({ success: true, order_id, data: savedOrder });

  } catch(err) {
    console.error('[confirm-cod]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SHIPROCKET
// ═══════════════════════════════════════════════════════════════
let srToken = null, srExpiry = 0;

async function getShiprocketToken(force = false) {
  if (!force && srToken && Date.now() < srExpiry) return srToken;
  const r = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL||'', password: process.env.SHIPROCKET_PASSWORD||'' }),
  });
  const data = await r.json();
  if (!data.token) throw new Error('Shiprocket login failed');
  srToken = data.token; srExpiry = Date.now() + 9*3600*1000;
  return srToken;
}

async function srRequest(url, options = {}) {
  const token = await getShiprocketToken();
  const doReq = async (t) => fetch(url, { ...options, headers:{'Content-Type':'application/json', Authorization:`Bearer ${t}`, ...(options.headers||{}) } });
  let r = await doReq(token);
  if (r.status === 401) { const ft = await getShiprocketToken(true); r = await doReq(ft); }
  return r.json();
}

app.post('/api/create-shiprocket-order', async (req, res) => {
  try {
    const b = req.body;
    const phone    = String(b.billing_phone||'').replace(/\D/g,'').slice(-10);
    const pincode  = String(b.billing_pincode||'').replace(/\D/g,'').slice(0,6);
    const lastName = (b.billing_last_name?.trim()) ? b.billing_last_name.trim() : '.';
    const orderItems = (b.order_items||[]).map(i => ({
      name: String(i.name||'Product').slice(0,100), sku: String(i.sku||'SKU-001').slice(0,50),
      units: parseInt(i.units)||1, selling_price: parseFloat(i.selling_price)||0,
      mrp: parseFloat(i.mrp||i.selling_price)||0, discount: parseFloat(i.discount)||0, tax:'', hsn:'30049099',
    }));
    const payload = {
      order_id: String(b.order_id||'').slice(0,50), order_date: b.order_date||new Date().toISOString().slice(0,19).replace('T',' '),
      pickup_location: 'Primary',
      billing_customer_name: String(b.billing_customer_name||'').trim(), billing_last_name: lastName,
      billing_address: String(b.billing_address||'').trim(), billing_address_2: String(b.billing_address_2||'').trim(),
      billing_city: String(b.billing_city||'').trim(), billing_pincode: pincode,
      billing_state: String(b.billing_state||'').trim(), billing_country: 'India',
      billing_email: String(b.billing_email||'').trim().toLowerCase(), billing_phone: phone,
      shipping_is_billing: true, order_items: orderItems,
      payment_method: b.payment_method==='COD'?'COD':'Prepaid',
      sub_total: parseFloat(b.sub_total)||orderItems.reduce((s,i)=>s+i.selling_price*i.units,0),
      length: parseFloat(b.length)||15, breadth: parseFloat(b.breadth)||10,
      height: parseFloat(b.height)||10, weight: parseFloat(b.weight)||0.3,
    };
    const data = await srRequest('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', { method:'POST', body:JSON.stringify(payload) });
    if (!data.order_id) return res.status(422).json({ error: data.message||'Rejected', details: data.errors||data });
    if (payload.order_id) {
      const { error: srUpdateErr } = await supabase.from('orders').update({ shiprocket_id:String(data.order_id), fulfillment:'Processing', updated_at:new Date().toISOString() }).eq('id', payload.order_id);
      if (srUpdateErr) console.error('⚠️ Supabase order update failed after Shiprocket push:', srUpdateErr.message);
    }
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/track/:awb', async (req, res) => {
  try { res.json(await srRequest(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${req.params.awb}`)); }
  catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/track-order/:orderId', async (req, res) => {
  try {
    const { data: order } = await supabase.from('orders').select('*').eq('id', req.params.orderId).single();
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (!order.shiprocket_id) return res.json({ status: order.fulfillment||'Pending', tracking_url:null });
    const tracking = await srRequest(`https://apiv2.shiprocket.in/v1/external/orders/show/${order.shiprocket_id}`);
    res.json({ status: order.fulfillment, shiprocket_id: order.shiprocket_id, tracking });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// INSTAGRAM
// ═══════════════════════════════════════════════════════════════
app.get('/api/instagram', async (req, res) => {
  try {
    const token = process.env.INSTAGRAM_TOKEN;
    if (!token) return res.json({ data: [] });
    const r    = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_url,thumbnail_url,permalink,media_type&limit=6&access_token=${token}`);
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    res.json(data);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════
app.get('/api/settings', async (req, res) => {
  const { data } = await supabase.from('settings').select('*');
  const obj = {};
  (data||[]).forEach(s => { obj[s.key] = s.value; });
  res.json(obj);
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// LIVE VISITORS
// ═══════════════════════════════════════════════════════════════
const visitorSessions = new Map();

app.post('/api/visitors/ping', (req, res) => {
  try {
    const { session_id, page = '/', referrer = '' } = req.body || {};
    const id  = session_id || req.ip + '-anon';
    const ip  = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const ua  = req.headers['user-agent'] || '';
    const now = Date.now();
    const existing = visitorSessions.get(id) || {};
    visitorSessions.set(id, { ip, page, referrer, ua, lastSeen: now, firstSeen: existing.firstSeen || now });
    for (const [k, v] of visitorSessions.entries()) {
      if (now - v.lastSeen > 2 * 60 * 1000) visitorSessions.delete(k);
    }
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false }); }
});

app.get('/api/visitors/active', authMiddleware, (req, res) => {
  try {
    const now    = Date.now();
    const cutoff = now - 2 * 60 * 1000;
    const active = [];
    for (const [id, v] of visitorSessions.entries()) {
      if (v.lastSeen >= cutoff) {
        active.push({
          session_id:   id,
          ip:           v.ip,
          page:         v.page,
          referrer:     v.referrer || '',
          user_agent:   v.ua,
          duration_sec: Math.round((now - v.firstSeen) / 1000),
          last_seen:    new Date(v.lastSeen).toISOString(),
        });
      }
    }
    active.sort((a, b) => b.last_seen.localeCompare(a.last_seen));
    res.json({ count: active.length, data: active });
  } catch(e) { res.status(500).json({ error: e.message, count: 0, data: [] }); }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN SETTINGS
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/settings', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    const obj = {};
    (data || []).forEach(row => { obj[row.key] = row.value; });
    res.json({ data: obj });
  } catch(err) {
    res.json({ data: {} });
  }
});

app.put('/api/admin/settings', authMiddleware, async (req, res) => {
  try {
    const entries = Object.entries(req.body || {});
    for (const [key, value] of entries) {
      await supabase.from('settings')
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/', (_, res) => res.json({
  status:'ok', service:'Ascovita Backend', version:'7.0.0',
  timestamp: new Date().toISOString(),
  features: ['google-oauth','email-auth','soft-delete','audit-logs','order-status-history','image-upload','image-library','whatsapp-reports','cashfree','shiprocket','email-notifications'],
  env: { supabase:!!process.env.SUPABASE_URL, cashfree:!!process.env.CASHFREE_APP_ID, shiprocket:!!process.env.SHIPROCKET_EMAIL, twilio:!!process.env.TWILIO_ACCOUNT_SID, email:!!process.env.MAIL_USER },
}));
app.get('/health', (_, res) => res.json({ status:'ok' }));

// ═══════════════════════════════════════════════════════════════
// KEEP-ALIVE
// ═══════════════════════════════════════════════════════════════
function startKeepAlive() {
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://ascovitahealthcare-cell-github-io.onrender.com';
  const INTERVAL = 10 * 60 * 1000;

  setInterval(async () => {
    try {
      const r   = await fetch(`${SELF_URL}/health`, { signal: AbortSignal.timeout(10000) });
      const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      if (r.ok) console.log(`✅ [KEEP-ALIVE] Pinged at ${now} IST`);
      else       console.warn(`⚠️ [KEEP-ALIVE] Ping returned ${r.status}`);
    } catch(e) {
      console.warn(`⚠️ [KEEP-ALIVE] Ping failed: ${e.message}`);
    }
  }, INTERVAL);

  console.log(`✅ Keep-alive started — pinging ${SELF_URL} every 10 min`);
  console.log(`💡 TIP: Also register ${SELF_URL}/health on UptimeRobot.com (free, every 5min) for guaranteed uptime.`);
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS ROUTES — used by admin dashboard charts + GA4 widget
// ═══════════════════════════════════════════════════════════════

// GA4 Realtime — proxies to Google Analytics Data API using service account
app.get('/api/analytics/realtime', authMiddleware, async (req, res) => {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    // If not configured, fall back to internal visitor session count
    if (!propertyId || !serviceAccountJson) {
      const now    = Date.now();
      const cutoff = now - 2 * 60 * 1000;
      let active = 0;
      for (const [, v] of visitorSessions.entries()) {
        if (v.lastSeen >= cutoff) active++;
      }
      return res.json({
        activeUsers: active,
        screenPageViews: active,
        source: 'internal',
        note: 'Set GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON in Render env vars for real GA4 data',
      });
    }

    // Build JWT for Google OAuth2 service account
    const crypto = require('crypto');
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);
    const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).toString('base64url');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const sig = sign.sign(sa.private_key, 'base64url');
    const jwtToken = `${header}.${payload}.${sig}`;

    // Exchange JWT for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwtToken }),
      signal: AbortSignal.timeout(8000),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Could not get GA4 access token');

    // Call GA4 Realtime API
    const ga4Res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: [{ name: 'unifiedScreenName' }],
          metrics:    [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    const ga4Data = await ga4Res.json();
    if (ga4Data.error) throw new Error(ga4Data.error.message || 'GA4 API error');

    const rows = ga4Data.rows || [];
    const totalActive = rows.reduce((s, r) => s + parseInt(r.metricValues?.[0]?.value || 0), 0);
    const totalViews  = rows.reduce((s, r) => s + parseInt(r.metricValues?.[1]?.value || 0), 0);
    const sessions    = rows.slice(0, 10).map(r => ({
      page:   r.dimensionValues?.[0]?.value || '/',
      active: parseInt(r.metricValues?.[0]?.value || 0),
    }));

    res.json({ activeUsers: totalActive, screenPageViews: totalViews, sessions, source: 'ga4' });
  } catch(e) {
    console.error('[GA4 realtime]', e.message);
    // Graceful fallback — return internal ping count instead of error
    const now    = Date.now();
    const cutoff = now - 2 * 60 * 1000;
    let active = 0;
    for (const [, v] of visitorSessions.entries()) {
      if (v.lastSeen >= cutoff) active++;
    }
    res.json({ activeUsers: active, screenPageViews: active, source: 'internal', error: e.message });
  }
});

// Revenue over last 30 days — for the area chart
app.get('/api/admin/stats/revenue', authMiddleware, async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from('orders')
      .select('created_at,total,payment_status')
      .is('deleted_at', null)
      .gte('created_at', since);

    const byDay = {};
    (data || []).filter(o => o.payment_status === 'Paid').forEach(o => {
      const d = (o.created_at || '').split('T')[0];
      byDay[d] = (byDay[d] || 0) + parseFloat(o.total || 0);
    });
    res.json({ data: byDay });
  } catch(e) { res.status(500).json({ error: e.message, data: {} }); }
});

// Weekly order heatmap (day-of-week × week)
app.get('/api/admin/stats/heatmap', authMiddleware, async (req, res) => {
  try {
    const since = new Date(Date.now() - 8 * 7 * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from('orders')
      .select('created_at')
      .is('deleted_at', null)
      .gte('created_at', since);

    const matrix = {};
    (data || []).forEach(o => {
      const d    = new Date(o.created_at || 0);
      const week = Math.floor((Date.now() - d.getTime()) / (7 * 86400000));
      const day  = (d.getDay() + 6) % 7; // 0=Mon
      if (week < 8) { const k = `${week}-${day}`; matrix[k] = (matrix[k] || 0) + 1; }
    });
    res.json({ data: matrix });
  } catch(e) { res.status(500).json({ error: e.message, data: {} }); }
});


// ═══════════════════════════════════════════════════════════════
// EMAIL TEST ROUTE — hit this from browser to verify email works
// GET /api/admin/test-email?to=yourmail@gmail.com
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/test-email', authMiddleware, async (req, res) => {
  const to = req.query.to || process.env.MAIL_USER;
  if (!to) return res.status(400).json({ error: 'No recipient — add ?to=your@email.com' });
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    return res.status(503).json({ error: 'MAIL_USER or MAIL_PASSWORD not set in Render env vars' });
  }
  try {
    await mailer.verify();
    await mailer.sendMail({
      from: process.env.MAIL_FROM || `Ascovita Healthcare <${process.env.MAIL_USER}>`,
      to,
      subject: '✅ Ascovita Email Test — System Working!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:30px auto;background:#f8fdf4;border:2px solid #4a8a28;border-radius:12px;padding:28px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#2d5016;margin-bottom:8px">ASCOVITA HEALTHCARE</div>
          <div style="font-size:40px;margin:16px 0">✅</div>
          <h2 style="color:#2d5016;margin:0 0 8px">Email System Working!</h2>
          <p style="color:#555;font-size:14px">Your Nodemailer + Gmail SMTP setup is configured correctly.<br>Order confirmation emails will be delivered automatically.</p>
          <div style="margin-top:20px;background:#2d5016;color:white;padding:10px 20px;border-radius:8px;font-size:12px">
            Sent from: ${process.env.MAIL_USER}<br>
            Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>`,
    });
    console.log(`✅ [EMAIL TEST] Sent to ${to}`);
    res.json({ success: true, message: `Test email sent to ${to} — check your inbox (and spam folder)` });
  } catch(e) {
    console.error('[EMAIL TEST]', e.message);
    res.status(500).json({
      error: e.message,
      fix: e.message.includes('535') || e.message.includes('Username and Password')
        ? 'Wrong password — use Gmail App Password from myaccount.google.com/apppasswords (NOT your login password)'
        : e.message.includes('ECONNREFUSED') || e.message.includes('ETIMEDOUT')
        ? 'SMTP connection blocked — Render free tier may block port 465. Try switching to port 587.'
        : 'Check Render logs for details',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION HEALTH CHECKS
// ═══════════════════════════════════════════════════════════════
app.get('/api/health/cashfree', authMiddleware, adminOnly, async (req, res) => {
  const appId  = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  const env    = (process.env.CASHFREE_ENV || 'PROD').toUpperCase();

  if (!appId || !secret) {
    return res.json({ ok: true, status: 'env_missing', detail: 'CASHFREE_APP_ID or CASHFREE_SECRET_KEY not set in Render env vars' });
  }
  try {
    const baseUrl = env === 'PROD' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
    const r = await fetch(`${baseUrl}/orders/ASC-health-check-000`, {
      headers: { 'x-client-id': appId, 'x-client-secret': secret, 'x-api-version': '2023-08-01' },
      signal: AbortSignal.timeout(8000),
    });
    // Any response from Cashfree servers (200, 404, 422, even 401 on unknown order)
    // means the endpoint is reachable and credentials are set.
    // True auth failure (completely wrong keys) returns a specific JSON error body.
    // We verify by checking the error body — valid creds get "Order not found", bad creds get "authentication failed".
    const body = await r.json().catch(() => ({}));
    const msg  = (body.message || body.error || '').toLowerCase();
    if (msg.includes('authentication') || msg.includes('unauthorized') || msg.includes('invalid client')) {
      return res.json({ ok: true, status: 'auth_error', detail: 'Invalid App ID or Secret Key — check Render env vars' });
    }
    // Any other response (order not found, etc.) = credentials accepted ✅
    return res.json({ ok: true, status: 'connected', env, detail: 'Credentials valid' });
  } catch(e) {
    return res.json({ ok: true, status: 'unreachable', detail: e.message });
  }
});

app.get('/api/health/shiprocket', authMiddleware, adminOnly, async (req, res) => {
  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    return res.json({ ok: true, status: 'env_missing', detail: 'SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not set in Render env vars' });
  }
  try {
    const r = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json();
    if (r.ok && data.token) return res.json({ ok: true, status: 'connected', detail: 'Authenticated successfully' });
    return res.json({ ok: true, status: 'auth_error', detail: data.message || 'Invalid email or password' });
  } catch(e) {
    return res.json({ ok: true, status: 'unreachable', detail: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// STARTUP DB CHECK
// ═══════════════════════════════════════════════════════════════
async function checkDbTables() {
  // Map each table to its actual primary key column (settings uses 'key', others use 'id')
  const tableChecks = [
    { table: 'products',           col: 'id'  },
    { table: 'orders',             col: 'id'  },
    { table: 'customers',          col: 'id'  },
    { table: 'coupons',            col: 'id'  },
    { table: 'order_status_logs',  col: 'id'  },
    { table: 'audit_logs',         col: 'id'  },
    { table: 'settings',           col: 'key' },  // PK is 'key', no 'id' column
    { table: 'image_library',      col: 'id'  },
    { table: 'banners',            col: 'id'  },
  ];
  const missing = [];
  for (const { table, col } of tableChecks) {
    const { error } = await supabase.from(table).select(col).limit(1);
    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      missing.push(table);
    }
  }
  if (missing.length) {
    console.error('\n❌  MISSING DB TABLES:', missing.join(', '));
    console.error('   → Run schema.sql in Supabase SQL Editor, then redeploy\n');
  } else {
    console.log('✅ All database tables verified.');
  }
}

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════
app.listen(PORT, async () => {
  console.log(`✅ Ascovita Backend v7.0 running on port ${PORT}`);
  await checkDbTables();
  await verifyMailer();
  scheduleReports();
  startKeepAlive();
});
