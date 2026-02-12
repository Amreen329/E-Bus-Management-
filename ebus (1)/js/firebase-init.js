/**
 * Ebus Management - Firebase Initialization
 * Initializes Firebase Auth and Firestore using config.
 */

(function () {
  'use strict';

  if (typeof firebase === 'undefined') {
    console.error('[Ebus] Firebase SDK not loaded. Include firebase-app, auth, firestore scripts.');
    return;
  }

  const config = window.EbusFirebaseConfig;
  if (!config || !config.apiKey || config.apiKey === 'YOUR_API_KEY') {
    console.warn('[Ebus] Firebase config not set. Update config/firebase-config.js with your project credentials.');
    return;
  }

  firebase.initializeApp(config);
  window.ebusAuth = firebase.auth();
  window.ebusDb = firebase.firestore();

  if (window.EbusLogger) {
    EbusLogger.info('firebase-init', 'Firebase initialized', { projectId: config.projectId });
  }
})();
