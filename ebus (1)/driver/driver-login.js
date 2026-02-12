/**
 * Driver Login - Ebus Management
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('driverAlert');
  const form = document.getElementById('driverLoginForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    alertEl.style.display = 'none';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
      showAlert('Fill email and password.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      const auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized.');
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const role = await window.EbusAuth.getUserRole(cred.user.uid);
      if (role !== 'driver') {
        await auth.signOut();
        showAlert('Driver only. Create account first or use passenger login.', 'error');
        if (window.EbusLogger) EbusLogger.warn('driver-login', 'Non-driver login attempt', { email });
        return;
      }
      if (window.EbusLogger) EbusLogger.info('driver-login', 'Driver logged in', { uid: cred.user.uid });
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('driver-login', 'Login failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError) ? window.EbusUtils.getUserFriendlyAuthError(err) : (err.message || 'Login failed.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
