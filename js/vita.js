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
