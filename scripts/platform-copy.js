// Extracted from index.html (line 23919) by Manus SEO pass — load order preserved

// Platform-aware install UX. Android uses the official beforeinstallprompt;
// iOS receives honest Safari instructions; desktop receives no install prompt.
(function () {
  var deferredInstallPrompt = null;
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  window.addEventListener('beforeinstallprompt', function (event) {
    if (!isAndroid || isStandalone) return;
    event.preventDefault();
    deferredInstallPrompt = event;
    var button = document.getElementById('androidInstallButton');
    var help = document.getElementById('androidInstallHelp');
    if (button) { button.disabled = false; button.textContent = 'Install Ozylix app'; }
    if (help) help.textContent = 'Tap the button and confirm Install in Chrome.';
  });

  window.installOzylixAndroid = async function () {
    var status = document.getElementById('appInstallStatus');
    if (isStandalone) { if (status) status.textContent = 'Ozylix is already installed on this device.'; return; }
    if (!isAndroid) { if (status) status.textContent = isIOS ? 'On iPhone or iPad, follow the Safari steps below.' : 'Desktop does not need a separate app.'; return; }
    if (!deferredInstallPrompt) {
      if (status) status.textContent = 'Chrome has not opened the prompt yet. Tap ⋮ → Install app (or Add to Home screen), then confirm the install.';
      return;
    }
    deferredInstallPrompt.prompt();
    var result = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (status) status.textContent = result && result.outcome === 'accepted' ? 'Installing Ozylix…' : 'Install cancelled. You can try again from this page.';
  };

  window.copyAppLink = async function () {
    var status = document.getElementById('appInstallStatus');
    try { await navigator.clipboard.writeText(window.location.origin + '/#download'); if (status) status.textContent = 'Ozylix link copied. Open it in Safari on your iPhone or iPad.'; }
    catch (e) { if (status) status.textContent = window.location.origin + '/#download'; }
  };

  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    var status = document.getElementById('appInstallStatus');
    if (status) status.textContent = 'Ozylix was installed successfully.'; var button = document.getElementById('androidInstallButton'); if (button) { button.disabled = true; button.textContent = 'Ozylix installed'; }
  });

  function updatePlatformCopy() {
    var status = document.getElementById('appInstallStatus');
    var android = document.getElementById('androidInstallCard');
    if (!status) return;
    if (isIOS) status.textContent = 'You are on an Apple device. Use Safari and follow the illustrated steps.';
    else if (isAndroid) status.textContent = isStandalone ? 'Ozylix is already running as an installed app.' : 'Use Chrome on Android: tap Install app here, or open ⋮ → Install app / Add to Home screen.';
    else status.textContent = 'Desktop mode: use the website directly. No app installation is needed.';
    if (android && !isAndroid) android.classList.add('app-platform-muted');
  }
  document.addEventListener('DOMContentLoaded', updatePlatformCopy);
  window.addEventListener('load', updatePlatformCopy);
})();
