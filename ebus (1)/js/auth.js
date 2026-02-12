/**
 * Ebus Management - Authentication Helper
 * Handles login, register, role resolution; safe and testable.
 */

const EbusAuth = (function () {
  'use strict';

  const ROLES = { ADMIN: 'admin', DRIVER: 'driver', USER: 'user' };
  const ROLES_COLLECTION = 'roles';

  function getLogger() {
    return window.EbusLogger || { info: function () {}, error: function () {} };
  }

  function getDb() {
    return window.ebusDb;
  }

  function getAuth() {
    return window.ebusAuth;
  }

  async function getUserRole(uid) {
    const db = getDb();
    if (!db) return null;
    try {
      const doc = await db.collection(ROLES_COLLECTION).doc(uid).get();
      const role = doc.exists ? doc.data().role : null;
      getLogger().info('auth', 'getUserRole', { uid, role });
      return role;
    } catch (err) {
      getLogger().error('auth', 'getUserRole failed', { uid, error: err.message });
      return null;
    }
  }

  async function setUserRole(uid, role, setBy) {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    getLogger().info('auth', 'setUserRole', { uid, role, setBy });
    await db.collection(ROLES_COLLECTION).doc(uid).set({ role, setBy, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  }

  async function getCurrentUserRole() {
    const auth = getAuth();
    if (!auth || !auth.currentUser) return null;
    return getUserRole(auth.currentUser.uid);
  }

  function requireAuth(requiredRole) {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      if (!auth) return reject(new Error('Auth not initialized'));
      const unsub = auth.onAuthStateChanged(async (user) => {
        unsub();
        if (!user) {
          reject(new Error('Not authenticated'));
          return;
        }
        const role = await getUserRole(user.uid);
        if (requiredRole && role !== requiredRole) {
          reject(new Error('Insufficient role'));
          return;
        }
        resolve({ user, role });
      });
    });
  }

  return {
    ROLES,
    getUserRole,
    setUserRole,
    getCurrentUserRole,
    requireAuth,
  };
})();

if (typeof window !== 'undefined') window.EbusAuth = EbusAuth;
