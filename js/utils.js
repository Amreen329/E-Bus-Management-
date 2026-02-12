/**
 * Ebus Management - Shared Utilities
 * XSS-safe escaping, Firebase error mapping, etc.
 */

const EbusUtils = (function () {
  'use strict';

  function escapeHtml(str) {
    if (str == null || typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getUserFriendlyAuthError(err) {
    if (!err || !err.code) return err ? err.message : 'Something went wrong. Try again.';
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Wrong email. Check and type again.';
      case 'auth/user-disabled':
        return 'This account is blocked.';
      case 'auth/user-not-found':
        return 'No account with this email. Create one first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Wrong email or password. Try again.';
      case 'auth/email-already-in-use':
        return 'This email is already used. Use another or enter to login.';
      case 'auth/weak-password':
        return 'Password too short. Use at least 6 letters or numbers.';
      case 'auth/too-many-requests':
        return 'Too many tries. Wait 5 minutes. Try again.';
      case 'auth/network-request-failed':
        return 'No internet. Turn on WiFi or data. Try again.';
      case 'auth/operation-not-allowed':
        return 'Can\'t sign in. Contact support.';
      case 'auth/requires-recent-login':
        return 'Enter again to do this.';
      default:
        return err.message || 'Something went wrong. Try again.';
    }
  }

  function getFirestoreError(err) {
    if (!err) return 'Something went wrong. Try again.';
    if (err.code === 'permission-denied') return 'Not allowed.';
    if (err.code === 'unavailable') return 'No connection. Try again.';
    return err.message || 'Something went wrong. Try again.';
  }

  return {
    escapeHtml: escapeHtml,
    getUserFriendlyAuthError: getUserFriendlyAuthError,
    getFirestoreError: getFirestoreError,
  };
})();

if (typeof window !== 'undefined') window.EbusUtils = EbusUtils;
