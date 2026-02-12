/**
 * Driver Routes & Location - Ebus Management
 * Post route (source/destination) and current location for arrival prediction.
 */

(function () {
  'use strict';

  const alertEl = document.getElementById('driverAlert');
  const form = document.getElementById('routeForm');
  const submitBtn = document.getElementById('submitRouteBtn');
  const routeListEl = document.getElementById('routeList');
  const busSelect = document.getElementById('busId');

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

  async function loadBusesIntoSelect() {
    var auth = window.ebusAuth && window.ebusAuth.currentUser;
    if (!auth) return;
    var buses = await window.EbusFirestore.getBusesByDriver(auth.uid);
    busSelect.innerHTML = '<option value="">Select bus</option>' +
      buses.map(function (b) { return '<option value="' + b.id + '">' + (b.busNumber || b.id) + ' (' + (b.busType || '') + ')</option>'; }).join('');
  }

  async function loadRoutes() {
    var auth = window.ebusAuth && window.ebusAuth.currentUser;
    if (!auth) return;
    routeListEl.textContent = 'Loading...';
    routeListEl.className = 'ebus-loading';
    try {
      var buses = await window.EbusFirestore.getBusesByDriver(auth.uid);
      var busIds = buses.map(function (b) { return b.id; });
      var allRoutes = [];
      for (var i = 0; i < busIds.length; i++) {
        var routes = await window.EbusFirestore.getRoutesByBusId(busIds[i]);
        allRoutes = allRoutes.concat(routes);
      }
      if (allRoutes.length === 0) {
        routeListEl.className = 'ebus-empty';
        routeListEl.textContent = 'No routes yet. Add one above.';
        return;
      }
      routeListEl.className = 'ebus-table-wrap';
      routeListEl.innerHTML = '<table class="ebus-table" role="grid"><thead><tr><th>From</th><th>To</th><th>Where Now</th><th>Mins Away</th><th>Wait (min)</th></tr></thead><tbody>' +
        allRoutes.map(function (r) {
          return '<tr><td data-label="From">' + esc(r.source) + '</td><td data-label="To">' + esc(r.destination) + '</td><td data-label="Where Now">' + esc(r.currentLocation) + '</td><td data-label="Mins Away">' + (r.estimatedArrivalMinutes != null ? esc(r.estimatedArrivalMinutes) : '-') + '</td><td data-label="Wait (min)">' + (r.lingerTimeMinutes != null ? esc(r.lingerTimeMinutes) : '-') + '</td></tr>';
        }).join('') + '</tbody></table>';
    } catch (e) {
      if (window.EbusLogger) EbusLogger.error('driver-routes', 'Load routes failed', { message: e.message });
      routeListEl.className = 'ebus-empty';
      routeListEl.textContent = 'Could not load. Check internet.';
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
    var busId = document.getElementById('busId').value;
    if (!busId) {
      showAlert('Add a bus first (My Buses).', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      var routeData = {
        busId: busId,
        source: document.getElementById('source').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        currentLocation: document.getElementById('currentLocation').value.trim() || null,
        estimatedArrivalMinutes: parseInt(document.getElementById('estimatedArrivalMinutes').value, 10) || null,
        lingerTimeMinutes: parseFloat(document.getElementById('lingerTimeMinutes').value) || null,
      };
      var existing = await window.EbusFirestore.getRoutesByBusId(busId);
      var sameRoute = existing.filter(function (r) {
        return (r.source || '').toLowerCase() === routeData.source.toLowerCase() && (r.destination || '').toLowerCase() === routeData.destination.toLowerCase();
      })[0];
      if (sameRoute) {
        await window.EbusFirestore.updateRoute(sameRoute.id, routeData);
        showAlert('Route updated!', 'success');
        if (window.EbusLogger) EbusLogger.info('driver-routes', 'Route updated', { routeId: sameRoute.id });
      } else {
        await window.EbusFirestore.addRoute(routeData);
        showAlert('Route added!', 'success');
        if (window.EbusLogger) EbusLogger.info('driver-routes', 'Route added', { busId });
      }
      form.reset();
      document.getElementById('busId').value = busId;
      loadRoutes();
    } catch (err) {
      if (window.EbusLogger) EbusLogger.error('driver-routes', 'Save route failed', { message: err.message });
      var msg = (window.EbusUtils && window.EbusUtils.getFirestoreError) ? window.EbusUtils.getFirestoreError(err) : (err.message || 'Failed to save route.');
      showAlert(msg, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  (async function () {
    try {
      await window.EbusAuth.requireAuth('driver');
      await loadBusesIntoSelect();
      loadRoutes();
    } catch (e) {
      window.location.href = 'login.html';
    }
  })();
})();
