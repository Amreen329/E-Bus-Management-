/**
 * Create Driver / Travel Account - Ebus Management
 * Admin creates Firebase Auth user and assigns driver role in Firestore.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('adminAlert');
  const form = document.getElementById('createDriverForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  async function ensureAdmin() {
    try {
      await window.EbusAuth.requireAuth('admin');
    } catch (e) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  document.getElementById('logoutBtn').addEventListener('click', function () {
    if (window.ebusAuth) window.ebusAuth.signOut();
    window.location.href = 'login.html';
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password || password.length < 6) {
      showAlert('Fill email and password. Min 6 letters or numbers.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      var auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized.');
      var adminUid = auth.currentUser && auth.currentUser.uid;
      if (!adminUid) throw new Error('Not authenticated as admin.');
      if (window.EbusLogger) EbusLogger.info('create-driver', 'Creating driver account', { email });
      var userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      var uid = userCred.user.uid;
      await window.EbusAuth.setUserRole(uid, 'driver', adminUid);
      await auth.signOut();
      showAlert('Done! Driver can now enter with: ' + email + '. You were signed out. Enter again to continue.', 'success');
      form.reset();
      if (window.EbusLogger) EbusLogger.info('create-driver', 'Driver account created', { uid, email });
      setTimeout(function () { window.location.href = 'login.html'; }, 3000);
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('create-driver', 'Create driver failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError) ? window.EbusUtils.getUserFriendlyAuthError(err) : (err.message || 'Failed to create driver account.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  ensureAdmin();
})();
