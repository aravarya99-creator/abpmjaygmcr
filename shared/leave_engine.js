/*
 * LEAVE ENGINE
 * Universal Leave Management Module for PMAM, I/C, and Admin Portals
 */
(function(global) {
  var LeaveEngine = {
    role: null,
    userEmail: null,
    userName: null,
    onUpdate: null,
    
    requests: [],
    subRequests: [],
    rules: { casual: 15, medical: 10, maternity: 180, paternity: 15, lwp: 0 },
    
    _unsubReqs: null,
    _unsubSub: null,
    _unsubRules: null,
    
    init: function(config) {
      this.role = config.role || 'pmam';
      this.userEmail = config.email || null;
      this.userName = config.name || null;
      var self = this;
      var origUpdate = config.onUpdate || function(){};
      this.onUpdate = function() {
          origUpdate();
          var actionable = 0;
          if (self.role === 'pmam') {
              var subNeed = self.subRequests.filter(function(r) { return r.status === 'Needs Substitute' || r.status === 'Pending Substitute'; }).length;
              var myPending = self.requests.filter(function(r) { return r.status === 'Pending' || r.status === 'Pending Substitute'; }).length;
              actionable = subNeed + myPending;
          } else if (self.role === 'ic' || self.role === 'admin') {
              actionable = self.requests.filter(function(r) { return r.status === 'Pending'; }).length;
          }
          var bellBadge = document.getElementById('topBellBadge');
          if (bellBadge) {
              if (actionable > 0) {
                  bellBadge.style.display = 'flex';
                  bellBadge.textContent = actionable;
                  bellBadge.style.background = '#dc2626';
              } else {
                  bellBadge.style.display = 'none';
              }
          }
      };
      
      this._fetchRules();
      this._fetchRequests();
    },
    
    _fetchRules: function() {
      if (typeof db === 'undefined') return;
      var self = this;
      this._unsubRules = db.collection('settings').doc('leave_rules').onSnapshot(function(doc) {
        if (doc.exists) {
          var d = doc.data() || {};
          var casual = d.casual_limit !== undefined ? parseInt(d.casual_limit) : (d.casual !== undefined ? parseInt(d.casual) : 15);
          var medical = d.medical_limit !== undefined ? parseInt(d.medical_limit) : (d.medical !== undefined ? parseInt(d.medical) : 30);
          var paternity = d.pat_limit !== undefined ? parseInt(d.pat_limit) : (d.paternity !== undefined ? parseInt(d.paternity) : 15);
          var maternity = d.mat_limit !== undefined ? parseInt(d.mat_limit) : (d.maternity !== undefined ? parseInt(d.maternity) : 180);
          var lwp = d.lwp_limit !== undefined ? parseInt(d.lwp_limit) : (d.lwp !== undefined ? parseInt(d.lwp) : 30);

          self.rules = Object.assign({}, d, {
            casual: casual,
            medical: medical,
            paternity: paternity,
            maternity: maternity,
            lwp: lwp,
            casual_limit: casual,
            medical_limit: medical,
            pat_limit: paternity,
            lwp_limit: lwp,
            en_casual: d.en_casual !== undefined ? d.en_casual : true,
            en_comp: d.en_comp !== undefined ? d.en_comp : true,
            en_medical: d.en_medical !== undefined ? d.en_medical : true,
            en_mat: d.en_mat !== undefined ? d.en_mat : true,
            en_pat: d.en_pat !== undefined ? d.en_pat : true,
            en_lwp: d.en_lwp !== undefined ? d.en_lwp : true
          });
        }
        if (self.onUpdate) self.onUpdate();
      });
    },
    
    _fetchRequests: function() {
      if (typeof db === 'undefined') return;
      var self = this;
      
      if (this._unsubReqs) this._unsubReqs();
      if (this._unsubSub) this._unsubSub();
      
      var query = db.collection('leave_requests');
      
      if (this.role === 'pmam') {
        if (!this.userEmail) return;
        query = query.where('email', '==', this.userEmail);
        
                if (this.userName || this.userEmail) {
          this._unsubSub = db.collection('leave_requests')
            .onSnapshot(function(snap) {
              self.subRequests = [];
              snap.forEach(function(doc) {
                var d = doc.data();
                var dutyName = (d.duty || '').toLowerCase().trim();
                var myName = (self.userName || '').toLowerCase().trim();
                var myEmail = (self.userEmail || '').toLowerCase().trim();
                var dutyEmail = (d.dutyEmail || '').toLowerCase().trim();
                
                var isMatch = false;
                if (myName && dutyName && (dutyName === myName || dutyName.indexOf(myName) !== -1 || myName.indexOf(dutyName) !== -1)) isMatch = true;
                if (myEmail && (dutyName === myEmail || dutyEmail === myEmail)) isMatch = true;
                
                if (isMatch) {
                  self.subRequests.push(Object.assign({
                    id: doc.id, type: d.ltype, name: d.name, ward: d.ward, from: d.fromDt,
                    to: d.toDt, days: d.days, retDate: d.ret, duty: d.duty,
                    reason: d.reason, status: d.status, remark: d.remark || '', timestamp: d.timestamp || 0
                  }, d));
                }
              });
              if (self.onUpdate) self.onUpdate();
            });
        }
      }
      
      this._unsubReqs = query.onSnapshot(function(snap) {
        self.requests = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          self.requests.push(Object.assign({
            id: doc.id, type: d.ltype, name: d.name, ward: d.ward, from: d.fromDt,
            to: d.toDt, days: d.days, retDate: d.ret, duty: d.duty,
            reason: d.reason, status: d.status, remark: d.remark || '', timestamp: d.timestamp || 0
          }, d));
        });
        
        // Sort newest first
        self.requests.sort(function(a,b){ return (b.timestamp||0) - (a.timestamp||0); });
        
        self.onUpdate();
      });
    },
    
    // ==========================================
    // LEAVE BALANCES CALCULATION
    // ==========================================
    calculateBalances: function(emailOrName) {
      var casualTaken = 0, medicalTaken = 0, compTaken = 0, lwpTaken = 0, maternityTaken = 0, paternityTaken = 0;
      
      this.requests.forEach(function(l) {
        // In Admin/IC portal we might need to count by name since not all records have email
        if (l.status === 'Approved' && (l.email === emailOrName || l.name === emailOrName)) {
          var d = parseFloat(l.days) || 0;
          var t = (l.ltype || l.type || '').toLowerCase();
          
          if(t.indexOf('casual') !== -1) casualTaken += d;
          else if(t.indexOf('medical') !== -1) medicalTaken += d;
          else if(t.indexOf('compensatory') !== -1) compTaken += d;
          else if(t.indexOf('maternity') !== -1) maternityTaken += d;
          else if(t.indexOf('paternity') !== -1) paternityTaken += d;
          else if(t.indexOf('pay') !== -1 || t.indexOf('lwp') !== -1) lwpTaken += d;
        }
      });
      
      return {
        taken: { casual: casualTaken, medical: medicalTaken, comp: compTaken, lwp: lwpTaken, maternity: maternityTaken, paternity: paternityTaken },
        eligible: this.rules,
        balance: {
          casual: Math.max(0, this.rules.casual - casualTaken),
          medical: Math.max(0, this.rules.medical - medicalTaken),
          maternity: Math.max(0, this.rules.maternity - maternityTaken),
          paternity: Math.max(0, this.rules.paternity - paternityTaken)
        }
      };
    },
    
    // ==========================================
    // PMAM ACTIONS
    // ==========================================
    submitLeave: function(reqObj, pin, requireDigitalSign) {
      return new Promise(function(resolve, reject) {
        if (requireDigitalSign) {
          if (!pin || pin.length < 4) return reject(new Error('Please enter your 4-digit PIN.'));
          var myEmail = (typeof getPmjayUser === 'function' && getPmjayUser() ? getPmjayUser().email : (self.userEmail || (global.GMCAuth && global.GMCAuth.getUser() ? global.GMCAuth.getUser().email : '') || '')).toLowerCase().trim();
          if (global.DSig && typeof global.DSig.verifyUserPin === 'function') {
            global.DSig.verifyUserPin(myEmail, pin).then(function(udata) {
              reqObj.applicantSignatureUrl = udata.signatureImage || '';
              reqObj.status = 'Pending Substitute';
              reqObj.timestamp = Date.now();
              return db.collection('leave_requests').add(reqObj);
            }).then(resolve).catch(reject);
          } else {
            db.collection('users').doc(myEmail).get().then(function(doc) {
              if (!doc.exists) throw new Error("User profile not found.");
              var udata = doc.data() || {};
              var pinStr = String(pin).trim();
              var hashedPin = (typeof CryptoJS !== 'undefined') ? CryptoJS.SHA256(pinStr).toString() : pinStr;
              var isValid = (udata.pin && String(udata.pin).trim() === pinStr) || (udata.signPinHash && udata.signPinHash === hashedPin) || (!udata.signPinHash && (!udata.pin || String(udata.pin).trim() === '1234'));
              if (!isValid) throw new Error("Incorrect PIN.");
              if (!udata.signPinHash) {
                db.collection('users').doc(myEmail).update({ pin: pinStr, signPinHash: hashedPin }).catch(function(e){});
              }
              reqObj.applicantSignatureUrl = udata.signatureImage || '';
              reqObj.status = 'Pending Substitute';
              reqObj.timestamp = Date.now();
              return db.collection('leave_requests').add(reqObj);
            }).then(resolve).catch(reject);
          }
        } else {
          db.collection('leave_requests').add(reqObj).then(resolve).catch(reject);
        }
      });
    },
    
    approveSubstituteDuty: function(reqId, pin) {
      return new Promise(function(resolve, reject) {
        if (!pin || pin.length < 4) return reject(new Error('Please enter your 4-digit PIN.'));
        var myEmail = (typeof getPmjayUser === 'function' && getPmjayUser() ? getPmjayUser().email : (this.userEmail || (global.GMCAuth && global.GMCAuth.getUser() ? global.GMCAuth.getUser().email : '') || '')).toLowerCase().trim();
        if (global.DSig && typeof global.DSig.verifyUserPin === 'function') {
          global.DSig.verifyUserPin(myEmail, pin).then(function(udata) {
            var sigUrl = udata.signatureImage || '';
            return db.collection('leave_requests').doc(reqId).update({
              status: 'Pending', substituteSignatureUrl: sigUrl, substituteSignedAt: Date.now()
            });
          }).then(resolve).catch(reject);
        } else {
          db.collection('users').doc(myEmail).get().then(function(doc) {
            if (!doc.exists) throw new Error("User profile not found.");
            var udata = doc.data() || {};
            var pinStr = String(pin).trim();
            var hashedPin = (typeof CryptoJS !== 'undefined') ? CryptoJS.SHA256(pinStr).toString() : pinStr;
            var isValid = (udata.pin && String(udata.pin).trim() === pinStr) || (udata.signPinHash && udata.signPinHash === hashedPin) || (!udata.signPinHash && (!udata.pin || String(udata.pin).trim() === '1234'));
            if (!isValid) throw new Error("Incorrect PIN.");
            if (!udata.signPinHash) {
              db.collection('users').doc(myEmail).update({ pin: pinStr, signPinHash: hashedPin }).catch(function(e){});
            }
            var sigUrl = udata.signatureImage || '';
            return db.collection('leave_requests').doc(reqId).update({
              status: 'Pending', substituteSignatureUrl: sigUrl, substituteSignedAt: Date.now()
            });
          }).then(resolve).catch(reject);
        }
      });
    },
    
    rejectSubstituteDuty: function(reqId) {
      return db.collection('leave_requests').doc(reqId).update({
        status: 'Rejected', remark: 'Rejected by Substitute PMAM'
      });
    },
    
    // ==========================================
    // INCHARGE ACTIONS
    // ==========================================
    icActionLeave: function(id, status, rejectReason) {
      var updates = { status: status, actionDate: new Date().toISOString(), actionBy: this.userName || 'Incharge' };
      if (status === 'Rejected' && rejectReason) updates.rejectReason = rejectReason;
      return db.collection('leave_requests').doc(id).update(updates);
    }
  };
  global.LeaveEngine = LeaveEngine;
})(window);
