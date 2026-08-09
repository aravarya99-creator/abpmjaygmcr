/* ============================================================================
   GMC RAJOURI — CENTRALIZED LEAVE SERVICE
   Single Source of Truth for Leave Engine, Rule Enforcement, & Leave Requests.
   ============================================================================ */
(function(global) {
  'use strict';

  var DEFAULT_RULES = {
    casual: 15,
    comp: 0,
    medical: 15,
    maternity: 180,
    paternity: 15,
    lwp: 15,
    enabled: {
      casual: true,
      comp: true,
      medical: true,
      maternity: true,
      paternity: true,
      lwp: true
    }
  };

  var GMCLeave = {
    rules: Object.assign({}, DEFAULT_RULES),
    requests: [],
    subRequests: [],
    _unsubRules: null,
    _unsubReqs: null,
    _ruleListeners: [],

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
     * Get current Admin Global Leave Rules
     */
    getRules: function() {
      return JSON.parse(JSON.stringify(this.rules));
    },

    onRulesChange: function(fn) {
      if (typeof fn === 'function') this._ruleListeners.push(fn);
    },

    /**
     * Calculate Leave Breakdown & Utilization for an employee based on Admin Global Rules
     */
    calculateEmployeeBalances: function(userEmail, approvedRequests) {
      var r = this.getRules();
      var reqs = (approvedRequests || []).filter(function(req) {
        var applicant = (req.applicantEmail || req.email || '').toLowerCase().trim();
        var target = (userEmail || '').toLowerCase().trim();
        var status = String(req.status || '').toLowerCase();
        return applicant === target && (status === 'approved' || req.verified === true);
      });

      var taken = { casual: 0, comp: 0, medical: 0, paternity: 0, maternity: 0, lwp: 0 };

      reqs.forEach(function(req) {
        var type = String(req.leaveType || '').toLowerCase();
        var days = parseInt(req.totalDays || req.days || 0, 10) || 0;

        if (type.indexOf('casual') !== -1) taken.casual += days;
        else if (type.indexOf('comp') !== -1) taken.comp += days;
        else if (type.indexOf('medical') !== -1 || type.indexOf('sick') !== -1) taken.medical += days;
        else if (type.indexOf('paternity') !== -1 || type.indexOf('ptl') !== -1) taken.paternity += days;
        else if (type.indexOf('maternity') !== -1 || type.indexOf('mtl') !== -1) taken.maternity += days;
        else if (type.indexOf('without pay') !== -1 || type.indexOf('lwp') !== -1) taken.lwp += days;
        else taken.casual += days;
      });

      var eligible = {
        casual: r.enabled.casual !== false ? (parseInt(r.casual, 10) || 0) : 0,
        comp: r.enabled.comp !== false ? (parseInt(r.comp, 10) || 0) : 0,
        medical: r.enabled.medical !== false ? (parseInt(r.medical, 10) || 0) : 0,
        paternity: r.enabled.paternity !== false ? (parseInt(r.paternity, 10) || 0) : 0,
        maternity: r.enabled.maternity !== false ? (parseInt(r.maternity, 10) || 0) : 0,
        lwp: r.enabled.lwp !== false ? (parseInt(r.lwp, 10) || 0) : 0
      };

      var totalEligible = eligible.casual + eligible.comp + eligible.medical + eligible.paternity + eligible.maternity + eligible.lwp;
      var totalTaken = taken.casual + taken.comp + taken.medical + taken.paternity + taken.maternity + taken.lwp;
      var totalBalance = totalEligible - totalTaken;
      if (totalBalance < 0) totalBalance = 0;

      var overallUtilization = totalEligible > 0 ? ((totalTaken / totalEligible) * 100).toFixed(2) : '0.00';

      function calcPct(tk, el) {
        if (!el || el <= 0) return '0%';
        var pct = ((tk / el) * 100).toFixed(2);
        return parseFloat(pct) + '%';
      }

      return {
        rules: r,
        totalEligible: totalEligible,
        totalTaken: totalTaken,
        totalBalance: totalBalance,
        overallUtilization: parseFloat(overallUtilization),
        breakdown: {
          cl: { name: 'Casual Leave (CL)', eligible: eligible.casual, taken: taken.casual, balance: Math.max(0, eligible.casual - taken.casual), pct: calcPct(taken.casual, eligible.casual), color: '#2563eb' },
          comp: { name: 'Compensatory', eligible: eligible.comp, taken: taken.comp, balance: Math.max(0, eligible.comp - taken.comp), pct: calcPct(taken.comp, eligible.comp), color: '#16a34a' },
          ml: { name: 'Medical Leave (ML)', eligible: eligible.medical, taken: taken.medical, balance: Math.max(0, eligible.medical - taken.medical), pct: calcPct(taken.medical, eligible.medical), color: '#9333ea' },
          ptl: { name: 'Paternity Leave (PTL)', eligible: eligible.paternity, taken: taken.paternity, balance: Math.max(0, eligible.paternity - taken.paternity), pct: calcPct(taken.paternity, eligible.paternity), color: '#ea580c' },
          mtl: { name: 'Maternity Leave (MTL)', eligible: eligible.maternity, taken: taken.maternity, balance: Math.max(0, eligible.maternity - taken.maternity), pct: calcPct(taken.maternity, eligible.maternity), color: '#ec4899' },
          lwp: { name: 'Leave Without Pay (LWP)', eligible: eligible.lwp, taken: taken.lwp, balance: 0, pct: calcPct(taken.lwp, eligible.lwp || 1), color: '#94a3b8' }
        }
      };
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
     * Listen to Firestore Leave Rules (Global Admin Rules)
     */
    initRulesSync: function() {
      var self = this;
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db) return;

      this._unsubRules = db.collection('settings').doc('leave_rules').onSnapshot(function(doc) {
        if (doc.exists) {
          var d = doc.data() || {};
          self.rules.casual = d.casual_limit !== undefined ? parseInt(d.casual_limit, 10) : (d.casual !== undefined ? parseInt(d.casual, 10) : 15);
          self.rules.comp = d.comp_limit !== undefined ? parseInt(d.comp_limit, 10) : (d.comp !== undefined ? parseInt(d.comp, 10) : 0);
          self.rules.medical = d.medical_limit !== undefined ? parseInt(d.medical_limit, 10) : (d.medical !== undefined ? parseInt(d.medical, 10) : 15);
          self.rules.maternity = d.mat_limit !== undefined ? parseInt(d.mat_limit, 10) : (d.maternity !== undefined ? parseInt(d.maternity, 10) : 180);
          self.rules.paternity = d.pat_limit !== undefined ? parseInt(d.pat_limit, 10) : (d.paternity !== undefined ? parseInt(d.paternity, 10) : 15);
          self.rules.lwp = d.lwp_limit !== undefined ? parseInt(d.lwp_limit, 10) : (d.lwp !== undefined ? parseInt(d.lwp, 10) : 15);

          if (d.enabled && typeof d.enabled === 'object') {
            self.rules.enabled = Object.assign({}, DEFAULT_RULES.enabled, d.enabled);
          }
        }
        self._ruleListeners.forEach(function(fn){ fn(self.rules); });
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
  global.LeaveEngine = GMCLeave; // Backwards compatibility
})(typeof window !== 'undefined' ? window : this);
