/* ============================================================================
   GMC RAJOURI — CENTRALIZED LEAVE SERVICE
   Single Source of Truth for Leave Engine, Rule Enforcement, & Leave Requests.
   ============================================================================ */
(function(global) {
  'use strict';

  var DEFAULT_RULES = {
    casual: 15,
    medical: 10,
    maternity: 180,
    paternity: 15,
    lwp: 30
  };

  var GMCLeave = {
    rules: Object.assign({}, DEFAULT_RULES),
    requests: [],
    subRequests: [],
    _unsubRules: null,
    _unsubReqs: null,

    /**
     * Calculate difference in days between two date strings (YYYY-MM-DD)
     */
    calculateDays: function(fromDateStr, toDateStr) {
      if (!fromDateStr || !toDateStr) return 0;
      var d1 = new Date(fromDateStr);
      var d2 = new Date(toDateStr);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
      var diffTime = d2.getTime() - d1.getTime();
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    },

    /**
     * Calculate return to duty date
     */
    calculateReturnDate: function(toDateStr) {
      if (!toDateStr) return '';
      var d = new Date(toDateStr);
      if (isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },

    /**
     * Submit a new leave application to Firestore
     */
    submitLeaveRequest: function(data) {
      return new Promise(function(resolve, reject) {
        var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
        if (!db) return reject(new Error('Database connection not initialized.'));

        var user = global.GMCAuth ? global.GMCAuth.getUser() : null;
        var email = data.email || (user ? user.email : '');
        var name  = data.name  || (user ? (user.name || user.userName) : '');

        if (!email) return reject(new Error('User email required to submit leave application.'));

        var days = GMCLeave.calculateDays(data.fromDate, data.toDate);
        if (days <= 0) return reject(new Error('Invalid date range. "To Date" must be on or after "From Date".'));

        var payload = {
          applicantEmail: email.toLowerCase().trim(),
          applicantName: name || email,
          leaveType: data.leaveType || 'Casual Leave',
          fromDate: data.fromDate,
          toDate: data.toDate,
          totalDays: days,
          returnDate: data.returnDate || GMCLeave.calculateReturnDate(data.toDate),
          substituteEmail: (data.substituteEmail || '').toLowerCase().trim(),
          substituteName: data.substituteName || '',
          wardName: data.wardName || '',
          assignedWards: data.assignedWards || (data.wardName ? [data.wardName] : []),
          reason: data.reason || '',
          status: data.substituteEmail ? 'Needs Substitute' : 'Pending',
          substituteStatus: data.substituteEmail ? 'Pending' : 'N/A',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('leave_requests').add(payload)
          .then(function(docRef) {
            resolve(Object.assign({ id: docRef.id }, payload));
          })
          .catch(reject);
      });
    },

    /**
     * Listen to Firestore Leave Rules
     */
    initRulesSync: function() {
      var self = this;
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db) return;

      this._unsubRules = db.collection('settings').doc('leave_rules').onSnapshot(function(doc) {
        if (doc.exists) {
          var d = doc.data() || {};
          self.rules.casual = d.casual_limit !== undefined ? parseInt(d.casual_limit) : 15;
          self.rules.medical = d.medical_limit !== undefined ? parseInt(d.medical_limit) : 10;
          self.rules.maternity = d.mat_limit !== undefined ? parseInt(d.mat_limit) : 180;
          self.rules.paternity = d.pat_limit !== undefined ? parseInt(d.pat_limit) : 15;
          self.rules.lwp = d.lwp_limit !== undefined ? parseInt(d.lwp_limit) : 30;
        }
      }, function(err){
        console.warn('[GMCLeave] Leave rules sync error:', err && err.message);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ GMCLeave.initRulesSync(); });
  } else {
    GMCLeave.initRulesSync();
  }

  global.GMCLeave = GMCLeave;
  global.LeaveEngine = GMCLeave; // Backwards compatibility with LeaveEngine
})(typeof window !== 'undefined' ? window : this);
