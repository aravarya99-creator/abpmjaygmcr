/* ============================================================================
   GMC RAJOURI — CENTRALIZED FIREBASE CONFIGURATION & INITIALIZER
   Single Source of Truth for Firebase App, Firestore DB, and Auth instances.
   ============================================================================ */
(function(global) {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyBXoF7iqCymH6387RH_oHamjzmnx-Jn4DE",
    authDomain: "gmcrajouri-pmam.firebaseapp.com",
    projectId: "gmcrajouri-pmam",
    storageBucket: "gmcrajouri-pmam.firebasestorage.app",
    messagingSenderId: "115490476421",
    appId: "1:115490476421:web:871a91987e1a92a45f34ec",
    measurementId: "G-NK9VL87CJC"
  };

  var EMAILJS_CONFIG = {
    publicKey: 'TLcdrNTVwdEBBvByn',
    serviceId: 'service_1x9ecam',
    templateId: 'template_w2r2b0h'
  };

  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.error('[GMCFirebase] Firebase SDKs not loaded. Please include firebase-app, auth, and firestore compat scripts.');
      return null;
    }
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      var app = firebase.app();
      var db = (typeof firebase.firestore === 'function') ? firebase.firestore() : null;
      var auth = (typeof firebase.auth === 'function') ? firebase.auth() : null;

      global.db = db;
      global.auth = auth;

      if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey) {
        try { emailjs.init(EMAILJS_CONFIG.publicKey); } catch(e){}
      }

      return {
        app: app,
        db: db,
        auth: auth,
        config: firebaseConfig,
        emailjs: EMAILJS_CONFIG
      };
    } catch(err) {
      console.error('[GMCFirebase] Firebase initialization error:', err);
      return null;
    }
  }

  var res = initFirebase();
  global.GMCFirebase = res;
  global.ADMIN_EMAIL = 'aravarya99@gmail.com';
  if (res) {
    if (res.db) global.db = res.db;
    if (res.auth) global.auth = res.auth;
  }
})(typeof window !== 'undefined' ? window : this);

if (typeof window !== 'undefined') {
  window.db = window.db || (window.GMCFirebase ? window.GMCFirebase.db : null);
  window.auth = window.auth || (window.GMCFirebase ? window.GMCFirebase.auth : null);
  window.ADMIN_EMAIL = window.ADMIN_EMAIL || 'aravarya99@gmail.com';
}

