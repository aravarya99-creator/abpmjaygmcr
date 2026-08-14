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

    init: function() {
      var self = this;
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db) return;

      var todayStr = this.getTodayStr();

      this._unsubReports = db.collection('pmam_reports')
        .where('date', '==', todayStr)
        .onSnapshot(function(snapshot) {
          var submitted = 0;
          var pending = 0;
          var approved = 0;
          var preAuth = 0;

          snapshot.forEach(function(doc) {
            var d = doc.data() || {};
            submitted++;
            if (d.status === 'Approved' || d.verified) {
              approved++;
            } else {
              pending++;
            }
            if (d.totalPreAuth || d.preAuthCount) {
              preAuth += parseInt(d.totalPreAuth || d.preAuthCount || 0, 10);
            }
          });

          self.currentStats.submittedToday = submitted;
          self.currentStats.pendingToday = pending;
          self.currentStats.approvedToday = approved;
          self.currentStats.totalPreAuth = preAuth;
          self.currentStats.lastUpdated = new Date();

          self._listeners.forEach(function(fn){ fn(self.currentStats); });
        }, function(err) {
          console.warn('[GMCMetrics] Reports snapshot listener warning:', err && err.message);
        });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ GMCMetrics.init(); });
  } else {
    GMCMetrics.init();
  }

  global.GMCMetrics = GMCMetrics;
})(typeof window !== 'undefined' ? window : this);
