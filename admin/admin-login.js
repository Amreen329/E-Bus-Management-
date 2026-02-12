/**
 * Admin Login - Ebus Management
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('adminAlert');
  const form = document.getElementById('adminLoginForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
    if (window.EbusLogger) EbusLogger.info('admin-login', 'Alert shown', { type, message: message.substring(0, 50) });
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
      showAlert('Fill email and password.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      const auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized. Check Firebase config.');
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const role = await window.EbusAuth.getUserRole(cred.user.uid);
      if (role !== 'admin') {
        await auth.signOut();
        showAlert('Staff only. Wrong account.', 'error');
        if (window.EbusLogger) EbusLogger.warn('admin-login', 'Non-admin login attempt', { email });
        return;
      }
      if (window.EbusLogger) EbusLogger.info('admin-login', 'Admin logged in', { uid: cred.user.uid });
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('admin-login', 'Login failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError) ? window.EbusUtils.getUserFriendlyAuthError(err) : (err.message || 'Login failed.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
