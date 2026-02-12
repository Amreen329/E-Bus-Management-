/**
 * User Dashboard - Search Bus Location
 * Search by source and destination; view only.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('userAlert');
  const form = document.getElementById('searchForm');
  const searchBtn = document.getElementById('searchBtn');
  const resultsEl = document.getElementById('searchResults');

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
    if (window.EbusLogger) EbusLogger.info('user-dashboard', 'User logged out');
    window.location.href = 'login.html';
  });

  function esc(str) {
    if (str == null || str === '') return '-';
    return (window.EbusUtils && window.EbusUtils.escapeHtml) ? window.EbusUtils.escapeHtml(String(str)) : String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function renderResults(routes) {
    if (!routes || routes.length === 0) {
      resultsEl.className = 'ebus-empty';
      resultsEl.textContent = 'No buses on this route. Try different names.';
      return;
    }
    var busIds = routes.map(function (r) { return r.busId; }).filter(Boolean);
    var busMap = {};
    if (window.ebusDb && busIds.length) {
      for (var i = 0; i < busIds.length; i++) {
        if (busMap[busIds[i]]) continue;
        try {
          var busSnap = await window.ebusDb.collection('buses').doc(busIds[i]).get();
          if (busSnap.exists) busMap[busIds[i]] = busSnap.data();
        } catch (e) {}
      }
    }
    resultsEl.className = 'ebus-table-wrap';
    resultsEl.innerHTML = '<table class="ebus-table" role="grid"><thead><tr><th>From</th><th>To</th><th>Bus</th><th>Where Now</th><th>Mins Away</th><th>Wait (min)</th></tr></thead><tbody>' +
      routes.map(function (r) {
        var bus = busMap[r.busId] || {};
        var busLabel = (bus.busNumber || r.busId) + (bus.busType ? ' (' + bus.busType + ')' : '');
        return '<tr><td data-label="From">' + esc(r.source) + '</td><td data-label="To">' + esc(r.destination) + '</td><td data-label="Bus">' + esc(busLabel) + '</td><td data-label="Where Now">' + esc(r.currentLocation) + '</td><td data-label="Mins Away">' + (r.estimatedArrivalMinutes != null ? esc(r.estimatedArrivalMinutes) : '-') + '</td><td data-label="Wait (min)">' + (r.lingerTimeMinutes != null ? esc(r.lingerTimeMinutes) : '-') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var source = document.getElementById('source').value.trim();
    var destination = document.getElementById('destination').value.trim();
    if (!source && !destination) {
      showAlert('Type from where or to where.', 'error');
      return;
    }
    searchBtn.disabled = true;
    resultsEl.className = 'ebus-loading';
    resultsEl.textContent = 'Searching...';
    try {
      var routes = await window.EbusFirestore.getRoutesBySourceDestination(source, destination);
      if (window.EbusLogger) EbusLogger.info('user-dashboard', 'Search bus location', { source, destination, count: routes.length });
      await renderResults(routes);
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('user-dashboard', 'Search failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getFirestoreError) ? window.EbusUtils.getFirestoreError(err) : (err.message || 'Search failed.');
      showAlert(msg, 'error');
      resultsEl.className = 'ebus-empty';
      resultsEl.textContent = 'Could not search. Check internet and try again.';
    } finally {
      searchBtn.disabled = false;
    }
  });

  (async function () {
    try {
      await window.EbusAuth.requireAuth('user');
    } catch (e) {
      if (window.EbusLogger) EbusLogger.warn('user-dashboard', 'Unauthorized', { message: e.message });
      window.location.href = 'login.html';
    }
  })();
})();
