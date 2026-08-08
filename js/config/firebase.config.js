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
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    var app = firebase.app();
    var db = firebase.firestore();
    var auth = firebase.auth();

    // Set globally on window for backwards compatibility
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
  }

  global.GMCFirebase = initFirebase();
})(typeof window !== 'undefined' ? window : this);
