/**
 * Ebus Management - Firestore Data Helpers
 * Collections: roles, drivers, buses, routes, users (profile cache).
 */

const EbusFirestore = (function () {
  'use strict';

  const COLLECTIONS = {
    ROLES: 'roles',
    DRIVERS: 'drivers',
    BUSES: 'buses',
    ROUTES: 'routes',
    USER_PROFILES: 'userProfiles',
  };

  function getDb() {
    return window.ebusDb;
  }

  function getLogger() {
    return window.EbusLogger || { info: function () {}, error: function () {} };
  }

  // ---------- Drivers (driver profile: contact, etc.) ----------
  async function getDriverByUid(uid) {
    const db = getDb();
    if (!db) return null;
    const doc = await db.collection(COLLECTIONS.DRIVERS).doc(uid).get();
    getLogger().info('firestore', 'getDriverByUid', { uid, exists: doc.exists });
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async function setDriverProfile(uid, data) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = { ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    getLogger().info('firestore', 'setDriverProfile', { uid });
    await db.collection(COLLECTIONS.DRIVERS).doc(uid).set(payload, { merge: true });
  }

  // ---------- Buses (bus info + type, linked to driver) ----------
  async function addBus(driverUid, busData) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = {
      driverUid,
      ...busData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    getLogger().info('firestore', 'addBus', { driverUid });
    const ref = await db.collection(COLLECTIONS.BUSES).add(payload);
    return ref.id;
  }

  async function updateBus(busId, busData) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = { ...busData, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    getLogger().info('firestore', 'updateBus', { busId });
    await db.collection(COLLECTIONS.BUSES).doc(busId).update(payload);
  }

  async function getBusesByDriver(driverUid) {
    const db = getDb();
    if (!db) return [];
    const snap = await db.collection(COLLECTIONS.BUSES).where('driverUid', '==', driverUid).get();
    getLogger().info('firestore', 'getBusesByDriver', { driverUid, count: snap.size });
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ---------- Routes (source, destination, busId, current location, linger times) ----------
  async function addRoute(routeData) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = {
      ...routeData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    getLogger().info('firestore', 'addRoute', { busId: routeData.busId });
    const ref = await db.collection(COLLECTIONS.ROUTES).add(payload);
    return ref.id;
  }

  async function updateRoute(routeId, routeData) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = { ...routeData, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    getLogger().info('firestore', 'updateRoute', { routeId });
    await db.collection(COLLECTIONS.ROUTES).doc(routeId).update(payload);
  }

  async function getRoutesBySourceDestination(source, destination) {
    const db = getDb();
    if (!db) return [];
    const snap = await db.collection(COLLECTIONS.ROUTES).get();
    let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    var s = (source || '').trim().toLowerCase();
    var d = (destination || '').trim().toLowerCase();
    if (s) list = list.filter(function (r) { return (r.source || '').toLowerCase().indexOf(s) !== -1 || s.indexOf((r.source || '').toLowerCase()) !== -1; });
    if (d) list = list.filter(function (r) { return (r.destination || '').toLowerCase().indexOf(d) !== -1 || d.indexOf((r.destination || '').toLowerCase()) !== -1; });
    getLogger().info('firestore', 'getRoutesBySourceDestination', { source, destination, count: list.length });
    return list;
  }

  async function getRoutesByBusId(busId) {
    const db = getDb();
    if (!db) return [];
    const snap = await db.collection(COLLECTIONS.ROUTES).where('busId', '==', busId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ---------- User profiles (name, etc. for users) ----------
  async function setUserProfile(uid, data) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    const payload = { ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    getLogger().info('firestore', 'setUserProfile', { uid });
    await db.collection(COLLECTIONS.USER_PROFILES).doc(uid).set(payload, { merge: true });
  }

  async function getUserProfile(uid) {
    const db = getDb();
    if (!db) return null;
    const doc = await db.collection(COLLECTIONS.USER_PROFILES).doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  return {
    COLLECTIONS,
    getDriverByUid,
    setDriverProfile,
    addBus,
    updateBus,
    getBusesByDriver,
    addRoute,
    updateRoute,
    getRoutesBySourceDestination,
    getRoutesByBusId,
    setUserProfile,
    getUserProfile,
  };
})();

if (typeof window !== 'undefined') window.EbusFirestore = EbusFirestore;
