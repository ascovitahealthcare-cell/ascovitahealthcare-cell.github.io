// ═══════════════════════════════════════════════════════
// AUTH SYSTEM
// ═══════════════════════════════════════════════════════

function openAuth(tab = 'login') {
  switchAuthTab(tab);
  document.getElementById('authOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuth() {
  document.getElementById('authOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  clearAuthMessages();
}

function clearAuthMessages() {
  const err = document.getElementById('authError');
  const suc = document.getElementById('authSuccess');
  if (err) { err.style.display = 'none'; err.textContent = ''; }
  if (suc) { suc.style.display = 'none'; suc.textContent = ''; }
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccess');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function switchAuthTab(tab) {
  clearAuthMessages();
  document.getElementById('loginTab')?.classList.toggle('active', tab === 'login');
  document.getElementById('registerTab')?.classList.toggle('active', tab === 'register');
  const lf=document.getElementById('loginForm'); if(lf) lf.style.display = tab === 'login' ? 'block' : 'none';
  const rf=document.getElementById('registerForm'); if(rf) rf.style.display = tab === 'register' ? 'block' : 'none';
}

function handleAccountNavClick() {
  const user = getCurrentUser();
  if (user) {
    showPage('account');
    loadAccountPage();
  } else {
    openAuth('login');
  }
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('asc_user') || 'null'); } catch(e) { return null; }
}

async function doLogin() {
  clearAuthMessages();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) { showAuthError('Please enter your email and password.'); return; }
  try {
    const res = await fetch(API_BASE + '/api/auth/email-login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
      signal: makeSignal(8000),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error || 'Invalid email or password.'); return; }
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));
    closeAuth(); updateAccountNavBtn();
    showPage('account'); loadAccountPage();
    showToast('🌿 Welcome back, ' + data.user.name.split(' ')[0] + '!');
  } catch(e) {
    // Fallback to localStorage if backend offline
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    const user  = users.find(u => u.email === email && u.password === btoa(pass));
    if (!user) { showAuthError('Invalid email or password. Please try again.'); return; }
    localStorage.setItem('asc_user', JSON.stringify(user));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Welcome back, ' + user.name.split(' ')[0] + '!');
  }
}

async function doRegister() {
  clearAuthMessages();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass  = document.getElementById('regPassword').value;
  if (!name || !email || !pass) { showAuthError('Please fill in all required fields.'); return; }
  if (pass.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
  try {
    const res = await fetch(API_BASE + '/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password: pass }),
      signal: makeSignal(8000),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error || 'Registration failed.'); return; }
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Account created! Welcome to Ascovita, ' + name.split(' ')[0] + '!');
  } catch(e) {
    // Fallback to localStorage if backend offline
    const users = JSON.parse(localStorage.getItem('asc_users') || '[]');
    if (users.find(u => u.email === email)) { showAuthError('An account with this email already exists.'); return; }
    const newUser = { name, email, phone, password: btoa(pass), createdAt: new Date().toISOString(), address: {} };
    users.push(newUser);
    localStorage.setItem('asc_users', JSON.stringify(users));
    localStorage.setItem('asc_user', JSON.stringify(newUser));
    closeAuth(); updateAccountNavBtn(); showPage('account'); loadAccountPage();
    showToast('🌿 Account created! Welcome to Ascovita, ' + name.split(' ')[0] + '!');
  }
}

// ══════════════════════════════════════════════════════════
// GOOGLE SIGN-IN — Real Google Identity Services (GIS)
// Client ID: 6793142938-b9sl3d3lh2svjkmcnina8fsh31nut0bu.apps.googleusercontent.com
// ══════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID = '6793142938-b9sl3d3lh2svjkmcnina8fsh31nut0bu.apps.googleusercontent.com';

// ── Parse JWT from Google's credential response ──
function parseGoogleJWT(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(base64));
  } catch(e) { return null; }
}

// ── Called by Google after user picks account ──
async function handleGoogleCredential(response) {
  try {
    showToast('⏳ Signing in with Google...');

    // Send Google credential to our backend for verification + Supabase upsert
    const res = await fetch(API_BASE + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
      signal: makeSignal(10000),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Auth failed');

    // Store JWT + user in localStorage
    localStorage.setItem('asc_jwt', data.token);
    localStorage.setItem('asc_user', JSON.stringify(data.user));

    closeAuth();
    updateAccountNavBtn();
    autofillCheckoutFromGoogle(data.user);

    const firstName = (data.user.name || 'there').split(' ')[0];
    showToast('🌿 Welcome, ' + firstName + '! Signed in with Google.');

    const onCheckout = document.getElementById('page-checkout')?.classList.contains('active');
    if (!onCheckout) { showPage('account'); loadAccountPage(); }

  } catch(err) {
    // Fallback: parse JWT locally and work offline if backend is sleeping
    const payload = parseGoogleJWT(response.credential);
    if (payload) {
      const user = { name: payload.name || 'Google User', email: payload.email || '', picture: payload.picture || '', social: 'google' };
      localStorage.setItem('asc_user', JSON.stringify(user));
      closeAuth();
      updateAccountNavBtn();
      autofillCheckoutFromGoogle(user);
      showToast('🌿 Signed in with Google! (offline mode)');
    } else {
      showToast('Google sign-in failed. Please try again.', 'error');
    }
  }
}

// ── Auto-fill checkout form with Google profile ──
function autofillCheckoutFromGoogle(user) {
  if (!user) return;
  const nameParts = (user.name || '').split(' ');
  const setField = (sel, val) => {
    const el = document.querySelector('#page-checkout ' + sel);
    if (el && val && !el.value) el.value = val;
  };
  setField('input[placeholder="Enter first name"]', nameParts[0] || '');
  setField('input[placeholder="Enter last name"]',  nameParts.slice(1).join(' ') || '');
  setField('input[type="email"]',                   user.email || '');
  if (user.phone) setField('input[type="tel"]',     user.phone);
}

// ── Trigger Google One Tap or popup ──
function socialLogin(provider) {
  if (provider !== 'google') {
    // Phone OTP — coming soon
    showToast('📱 Phone OTP login coming soon!');
    return;
  }
  // Use Google One Tap / popup
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.prompt(notification => {
      // If One Tap is dismissed or not available, fall back to popup
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        showGooglePopup();
      }
    });
  } else {
    // SDK not loaded yet — wait and retry
    setTimeout(() => socialLogin('google'), 800);
  }
}

function showGooglePopup() {
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('Google sign-in not available. Please try again.', 'error');
    return;
  }
  const client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'profile email',
    callback: (tokenResponse) => {
      if (tokenResponse.error) { showToast('Google sign-in cancelled.', 'error'); return; }
      // Fetch profile with the access token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
      })
      .then(r => r.json())
      .then(profile => {
        handleGoogleCredential({ credential: btoa(JSON.stringify({ alg:'none' })) + '.' + btoa(JSON.stringify({
          name: profile.name, email: profile.email,
          picture: profile.picture, sub: profile.sub,
          given_name: profile.given_name
        })) + '.sig' });
      })
      .catch(() => showToast('Google sign-in failed.', 'error'));
    }
  });
  client.requestAccessToken();
}

// ── Init Google One Tap on page load ──
function initGoogleOneTap() {
  if (typeof google === 'undefined' || !google.accounts) return;
  const currentUser = getCurrentUser();
  if (currentUser) return; // already logged in

  google.accounts.id.initialize({
    client_id:  GOOGLE_CLIENT_ID,
    callback:   handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
  });

  // Show One Tap only after 3 seconds, non-intrusively
  setTimeout(() => {
    if (!getCurrentUser()) {
      google.accounts.id.prompt();
    }
  }, 3000);
}

// ── Sign out from Google too ──
const _origDoLogout = typeof doLogout !== 'undefined' ? doLogout : null;
function doLogout() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
  localStorage.removeItem('asc_user');
  updateAccountNavBtn();
  showPage('home');
  showToast('You have been signed out.');
}

// ── Update nav avatar with Google photo ──
const _origUpdateAccountNavBtn = typeof updateAccountNavBtn !== 'undefined' ? updateAccountNavBtn : null;
function updateAccountNavBtn() {
  const user = getCurrentUser();
  const btn = document.getElementById('accountNavBtn');
  if (!btn) return;
  if (user) {
    if (user.picture) {
      btn.innerHTML = '<img src="' + user.picture + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid white" onerror="this.outerHTML=\'' + (user.name||'U')[0].toUpperCase() + '\'">';
      btn.title = user.name;
    } else {
      btn.textContent = (user.name||'U')[0].toUpperCase();
      btn.title = user.name;
    }
    btn.style.cssText = 'background:var(--green);color:white;border-radius:50%;width:36px;height:36px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0';
  } else {
    btn.innerHTML = '<svg width="20" height="20"><use href="#ico-user"/></svg>';
    btn.title = 'Account';
    btn.style.cssText = '';
  }
}

// ── Auto-fill checkout when user is already logged in ──
document.addEventListener('DOMContentLoaded', function() {
  // Init Google One Tap after SDK loads
  const gsiInterval = setInterval(function() {
    if (typeof google !== 'undefined' && google.accounts) {
      clearInterval(gsiInterval);
      initGoogleOneTap();
    }
  }, 300);

  // Show Google sign-in hint on checkout page if not logged in
  const origShowPage2 = window.showPage;
  window._googleShowPageWrapped = true;
  if (origShowPage2 && !window._googleShowPageWrapped2) {
    window._googleShowPageWrapped2 = true;
    const _sp2 = window.showPage;
    window.showPage = function(pg) {
      _sp2(pg);
      if (pg === 'checkout') {
        const user = getCurrentUser();
        if (user) autofillCheckoutFromGoogle(user);
        setTimeout(function() {
          const bar = document.getElementById('savedAddressBar');
          if (user && bar) {
            document.getElementById('savedAddrName').textContent = user.name;
            document.getElementById('savedAddrDetails').textContent = user.email;
            bar.style.display = 'flex';
          }
        }, 100);
      }
    };
  }
});

function showForgotPassword() {
  clearAuthMessages();
  showAuthSuccess('Password reset link would be sent to your email. (Feature coming soon)');
}
