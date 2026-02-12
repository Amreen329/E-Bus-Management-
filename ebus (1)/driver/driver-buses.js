/**
 * Driver Buses - Ebus Management
 * Post bus complete information and bus type.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('driverAlert');
  const form = document.getElementById('busForm');
  const submitBtn = document.getElementById('submitBusBtn');
  const busListEl = document.getElementById('busList');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'ebus-alert ebus-alert-' + (type || 'error');
    alertEl.style.display = 'block';
  }

  function hideAlert() {
    alertEl.style.display = 'none';
  }

  function esc(str) {
    if (str == null || str === '') return '-';
    return (window.EbusUtils && window.EbusUtils.escapeHtml) ? window.EbusUtils.escapeHtml(String(str)) : String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.getElementById('logoutBtn').addEventListener('click', function () {
    if (window.ebusAuth) window.ebusAuth.signOut();
    window.location.href = 'login.html';
  });

  async function loadBuses() {
    var auth = window.ebusAuth && window.ebusAuth.currentUser;
    if (!auth) return;
    busListEl.textContent = 'Loading...';
    busListEl.className = 'ebus-loading';
    try {
      var buses = await window.EbusFirestore.getBusesByDriver(auth.uid);
      if (buses.length === 0) {
        busListEl.className = 'ebus-empty';
        busListEl.textContent = 'No buses yet. Add one above.';
        return;
      }
      busListEl.className = 'ebus-table-wrap';
      busListEl.innerHTML = '<table class="ebus-table" role="grid"><thead><tr><th>Bus</th><th>Type</th><th>Seats</th><th>Details</th></tr></thead><tbody>' +
        buses.map(function (b) {
          return '<tr><td data-label="Bus">' + esc(b.busNumber) + '</td><td data-label="Type">' + esc(b.busType) + '</td><td data-label="Seats">' + esc(b.capacity) + '</td><td data-label="Details">' + esc(b.busDetails) + '</td></tr>';
        }).join('') + '</tbody></table>';
    } catch (e) {
      if (window.EbusLogger) EbusLogger.error('driver-buses', 'Load buses failed', { message: e.message });
      busListEl.className = 'ebus-empty';
      busListEl.textContent = 'Could not load. Check internet.';
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
      await window.EbusFirestore.addBus(uid, {
        busNumber: document.getElementById('busNumber').value.trim(),
        busType: document.getElementById('busType').value,
        capacity: parseInt(document.getElementById('capacity').value, 10) || null,
        busDetails: document.getElementById('busDetails').value.trim() || null,
      });
      showAlert('Bus added!', 'success');
      form.reset();
      loadBuses();
      if (window.EbusLogger) EbusLogger.info('driver-buses', 'Bus added', { driverUid: uid });
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('driver-buses', 'Add bus failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getFirestoreError) ? window.EbusUtils.getFirestoreError(err) : (err.message || 'Failed to add bus.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  (async function () {
    try {
      await window.EbusAuth.requireAuth('driver');
      loadBuses();
    } catch (e) {
      window.location.href = 'login.html';
    }
  })();
})();
