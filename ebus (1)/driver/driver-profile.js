/**
 * Driver Profile & Contact - Ebus Management
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('driverAlert');
  const form = document.getElementById('profileForm');
  const submitBtn = document.getElementById('submitBtn');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  document.getElementById('logoutBtn').addEventListener('click', function () {
    if (window.ebusAuth) window.ebusAuth.signOut();
    window.location.href = 'login.html';
  });

  async function loadProfile() {
    try {
      var auth = window.ebusAuth;
      if (!auth || !auth.currentUser) return;
      var driver = await window.EbusFirestore.getDriverByUid(auth.currentUser.uid);
      if (driver) {
        document.getElementById('displayName').value = driver.displayName || '';
        document.getElementById('phone').value = driver.phone || '';
        document.getElementById('contactDetails').value = driver.contactDetails || '';
      }
    } catch (e) {
      if (window.EbusLogger) EbusLogger.error('driver-profile', 'Load profile failed', { message: e.message });
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var uid = window.ebusAuth && window.ebusAuth.currentUser && window.ebusAuth.currentUser.uid;
    if (!uid) {
      showAlert('Enter again. Session ended.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      await window.EbusFirestore.setDriverProfile(uid, {
        displayName: document.getElementById('displayName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        contactDetails: document.getElementById('contactDetails').value.trim(),
      });
      showAlert('Saved!', 'success');
      if (window.EbusLogger) EbusLogger.info('driver-profile', 'Profile updated', { uid });
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('driver-profile', 'Save failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getFirestoreError) ? window.EbusUtils.getFirestoreError(err) : (err.message || 'Failed to save profile.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  (async function () {
    try {
      await window.EbusAuth.requireAuth('driver');
      loadProfile();
    } catch (e) {
      window.location.href = 'login.html';
    }
  })();
})();
