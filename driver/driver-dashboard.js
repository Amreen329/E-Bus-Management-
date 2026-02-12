/**
 * Driver Dashboard - Ebus Management
 */

(function () {
  'use strict';

  document.getElementById('logoutBtn').addEventListener('click', function () {
    if (window.ebusAuth) window.ebusAuth.signOut();
    if (window.EbusLogger) EbusLogger.info('driver-dashboard', 'Driver logged out');
    window.location.href = 'login.html';
  });

  (async function () {
    try {
      await window.EbusAuth.requireAuth('driver');
    } catch (e) {
      if (window.EbusLogger) EbusLogger.warn('driver-dashboard', 'Unauthorized', { message: e.message });
      window.location.href = 'login.html';
    }
  })();
})();
