/* ============================================================================
   GMC RAJOURI — CENTRALIZED METRICS & DASHBOARD SERVICE
   Single Source of Truth for Shift Aggregation, Daily Summaries & Report Stats.
   ============================================================================ */
(function(global) {
  'use strict';

  var GMCMetrics = {
    _unsubReports: null,
    _listeners: [],
    currentStats: {
      totalPmams: 0,
      submittedToday: 0,
      pendingToday: 0,
      approvedToday: 0,
      totalPreAuth: 0,
      totalClaims: 0,
      lastUpdated: null
    },

    getTodayStr: function() {
      var d = new Date();
      var yyyy = d.getFullYear();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      return yyyy + '-' + mm + '-' + dd;
    },

    onChange: function(fn) {
      if (typeof fn === 'function') this._listeners.push(fn);
    },

    init: function(retryCount) {
      retryCount = retryCount || 0;
      var self = this;
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db) {
        if (retryCount < 10) {
          setTimeout(function(){ self.init(retryCount + 1); }, 1000);
        }
        return;
      }

      var todayStr = this.getTodayStr();
      var processSnapshots = function(snap1, snap2) {
        var submitted = 0, pending = 0, approved = 0, preAuth = 0;
        var seenIds = {};

        function addDoc(doc) {
          if (!doc || seenIds[doc.id]) return;
          seenIds[doc.id] = true;
          var d = doc.data() || {};
          submitted++;
          if (d.status === 'Approved' || d.verified) {
            approved++;
          } else {
            pending++;
          }
          if (d.totalPreAuth || d.preAuthCount || d.preauth) {
            preAuth += parseInt(d.totalPreAuth || d.preAuthCount || d.preauth || 0, 10);
          }
        }

        if (snap1) snap1.forEach(addDoc);
        if (snap2) snap2.forEach(addDoc);

        self.currentStats.submittedToday = submitted;
        self.currentStats.pendingToday = pending;
        self.currentStats.approvedToday = approved;
        self.currentStats.totalPreAuth = preAuth;
        self.currentStats.lastUpdated = new Date();

        self._listeners.forEach(function(fn){ fn(self.currentStats); });
      };

      var snap1 = null, snap2 = null;
      var unsub1 = db.collection('daily_reports').where('date', '==', todayStr).onSnapshot(function(s){
        snap1 = s;
        processSnapshots(snap1, snap2);
      }, function(err){ console.warn('[GMCMetrics] daily_reports error:', err && err.message); });

      var unsub2 = db.collection('pmam_reports').where('date', '==', todayStr).onSnapshot(function(s){
        snap2 = s;
        processSnapshots(snap1, snap2);
      }, function(err){ console.warn('[GMCMetrics] pmam_reports error:', err && err.message); });

      this._unsubReports = function() {
        if (typeof unsub1 === 'function') unsub1();
        if (typeof unsub2 === 'function') unsub2();
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ GMCMetrics.init(); });
  } else {
    GMCMetrics.init();
  }

  global.GMCMetrics = GMCMetrics;
})(typeof window !== 'undefined' ? window : this);
