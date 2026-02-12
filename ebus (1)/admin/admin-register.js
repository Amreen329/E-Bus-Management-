/**
 * Admin / Staff Register - Ebus Management
 * Allows new staff/admin accounts to self-register.
 * Creates Firebase Auth user and assigns admin role in Firestore.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('adminAlert');
  const form = document.getElementById('adminRegisterForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
    if (window.EbusLogger) EbusLogger.info('admin-register', 'Alert shown', { type, message: message.substring(0, 80) });
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  if (!form) {
    // Defensive: if script is loaded on wrong page, do nothing.
    if (window.EbusLogger) EbusLogger.warn('admin-register', 'Form not found on page');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();

    const firstName = (document.getElementById('firstName').value || '').trim();
    const lastName = (document.getElementById('lastName').value || '').trim();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value;

    if (!firstName || !lastName || !email || !password || password.length < 6) {
      showAlert('Fill all boxes. Password: at least 6 letters or numbers.', 'error');
      return;
    }

    submitBtn.disabled = true;

    try {
      const auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized.');

      if (window.EbusLogger) {
        EbusLogger.info('admin-register', 'Registering admin', { email });
      }

      // 1. Create Firebase Auth user (this also signs them in)
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCred.user.uid;

      // 2. Assign admin role for this user in Firestore
      await window.EbusAuth.setUserRole(uid, 'admin', 'self-register');

      // 3. Optionally store basic profile using shared userProfiles collection
      if (window.EbusFirestore && window.EbusFirestore.setUserProfile) {
        await window.EbusFirestore.setUserProfile(uid, { firstName, lastName, email, role: 'admin' });
      }

      showAlert('Done! You are now staff admin. Taking you to staff home...', 'success');

      if (window.EbusLogger) {
        EbusLogger.info('admin-register', 'Admin registered', { uid, email });
      }

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (err) {
      if (window.EbusLogger) {
        EbusLogger.error('admin-register', 'Register failed', { message: err.message });
      }
      const msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError)
        ? window.EbusUtils.getUserFriendlyAuthError(err)
        : (err.message || 'Registration failed.');
      showAlert(msg, 'error');
      submitBtn.disabled = false;
    }
  });
})();

