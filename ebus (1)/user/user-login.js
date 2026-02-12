/**
 * User Login - Ebus Management
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('userAlert');
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    alertEl.style.display = 'none';
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    if (!email || !password) {
      showAlert('Fill email and password.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      var auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized.');
      var cred = await auth.signInWithEmailAndPassword(email, password);
      var role = await window.EbusAuth.getUserRole(cred.user.uid);
      if (role !== 'user') {
        await auth.signOut();
        showAlert('Passenger only. Create account first or use driver login.', 'error');
        if (window.EbusLogger) EbusLogger.warn('user-login', 'Non-user login attempt', { email });
        return;
      }
      if (window.EbusLogger) EbusLogger.info('user-login', 'User logged in', { uid: cred.user.uid });
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('user-login', 'Login failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError) ? window.EbusUtils.getUserFriendlyAuthError(err) : (err.message || 'Login failed.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
