// Extracted from index.html (line 13663) by Manus SEO pass — load order preserved

// ── Password visibility toggle ──
function _togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.textContent = isText ? '👁' : '🙈';
}

// ── Password strength meter ──
function _updateStrength(val) {
  const bar  = document.getElementById('pwStrengthBar');
  const fill = document.getElementById('pwStrengthFill');
  if (!bar || !fill) return;
  if (!val) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  let score = 0;
  if (val.length >= 6)  score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const color = score <= 1 ? '#FF5C82' : score <= 3 ? '#E8B33C' : '#17E0C0';
  fill.style.transform = 'scaleX(' + (score / 5) + ')';
  fill.style.background = color;
}

