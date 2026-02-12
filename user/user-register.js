/**
 * User Register - Ebus Management
 * Account creation with first name, last name, email, password.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('userAlert');
  const form = document.getElementById('registerForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    if (!email || !password || password.length < 6 || !firstName || !lastName) {
      showAlert('Fill all boxes. Password: at least 6 letters or numbers.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      var auth = window.ebusAuth;
      if (!auth) throw new Error('Firebase Auth not initialized.');
      if (window.EbusLogger) EbusLogger.info('user-register', 'Registering user', { email });
      var userCred = await auth.createUserWithEmailAndPassword(email, password);
      var uid = userCred.user.uid;
      await window.EbusAuth.setUserRole(uid, 'user', 'self');
      await window.EbusFirestore.setUserProfile(uid, { firstName, lastName, email });
      showAlert('Done! Taking you to find your bus...', 'success');
      if (window.EbusLogger) EbusLogger.info('user-register', 'User registered', { uid, email });
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1500);
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('user-register', 'Register failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getUserFriendlyAuthError) ? window.EbusUtils.getUserFriendlyAuthError(err) : (err.message || 'Registration failed.');
      showAlert(msg, 'error');
      submitBtn.disabled = false;
    }
  });
})();
