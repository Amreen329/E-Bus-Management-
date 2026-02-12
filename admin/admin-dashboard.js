/**
 * Admin Dashboard - Ebus Management
 */

(function () {
  'use strict';

  const logoutBtn = document.getElementById('logoutBtn');

  function showAlert(message, type) {
    const el = document.getElementById('adminAlert');
    if (!el) return;
    el.textContent = message;
    el.className = 'ebus-alert ebus-alert-' + (type || 'error');
    el.style.display = 'block';
  }

  async function ensureAdmin() {
    try {
      await window.EbusAuth.requireAuth('admin');
    } catch (e) {
      if (window.EbusLogger) EbusLogger.warn('admin-dashboard', 'Unauthorized', { message: e.message });
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  logoutBtn.addEventListener('click', async function () {
    try {
      if (window.ebusAuth) await window.ebusAuth.signOut();
      if (window.EbusLogger) EbusLogger.info('admin-dashboard', 'Admin logged out');
      window.location.href = 'login.html';
    } catch (e) {
      if (window.EbusLogger) EbusLogger.error('admin-dashboard', 'Logout failed', { message: e.message });
      window.location.href = 'login.html';
    }
  });

  ensureAdmin();
})();
