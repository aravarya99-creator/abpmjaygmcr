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
    icActionLeave: function(id, status, pin, rejectReason) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (status === 'Rejected') {
          var updates = { status: 'Rejected', actionDate: new Date().toISOString(), actionBy: self.userName || 'Incharge' };
          if (rejectReason) updates.rejectReason = rejectReason;
          db.collection('leave_requests').doc(id).update(updates).then(resolve).catch(reject);
        } else if (status === 'Approved') {
          var myEmail = (typeof getPmjayUser === 'function' && getPmjayUser() ? getPmjayUser().email : (self.userEmail || (global.GMCAuth && global.GMCAuth.getUser() ? global.GMCAuth.getUser().email : '') || '')).toLowerCase().trim();
          
          var doApprove = function(udata) {
            var sigUrl = (udata && udata.signatureImage) ? udata.signatureImage : '';
            var icName = (udata && udata.name) ? udata.name : (self.userName || 'I/C AB-PMJAY');
            var updates = {
              status: 'Approved',
              icSignatureUrl: sigUrl,
              icName: icName,
              icSignedAt: Date.now(),
              actionDate: new Date().toISOString(),
              actionBy: icName
            };
            return db.collection('leave_requests').doc(id).update(updates);
          };

          if (pin && String(pin).trim().length >= 4) {
            if (global.DSig && typeof global.DSig.verifyUserPin === 'function') {
              global.DSig.verifyUserPin(myEmail, pin).then(doApprove).then(resolve).catch(reject);
            } else {
              db.collection('users').doc(myEmail).get().then(function(doc) {
                if (!doc.exists) throw new Error("User profile not found.");
                var udata = doc.data() || {};
                var pinStr = String(pin).trim();
                var hashedPin = (typeof CryptoJS !== 'undefined') ? CryptoJS.SHA256(pinStr).toString() : pinStr;
                var isValid = (udata.pin && String(udata.pin).trim() === pinStr) || (udata.signPinHash && udata.signPinHash === hashedPin) || (!udata.signPinHash && (!udata.pin || String(udata.pin).trim() === '1234'));
                if (!isValid) throw new Error("Incorrect PIN.");
                return doApprove(udata);
              }).then(resolve).catch(reject);
            }
          } else {
            doApprove({}).then(resolve).catch(reject);
          }
        }
      });
    },

    // ==========================================
    // UNIVERSAL PRINTABLE PDF & EMBEDDED PREVIEW GENERATOR
    // ==========================================
    printLeaveDocument: function(reqObj) {
      if (!reqObj) return;
      
      var fmtDate = function(d) {
        if (!d || d === '-') return '—';
        if (typeof d === 'string' && d.indexOf('-') !== -1) {
          var parts = d.split('-');
          if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
        }
        return d;
      };

      var name   = reqObj.name   || '—';
      var desig  = reqObj.desig  || 'PMAM';
      var ward   = reqObj.ward   || '—';
      var fromDt = reqObj.from   || reqObj.fromDt || '';
      var toDt   = reqObj.to     || reqObj.toDt   || '';
      var days   = reqObj.days   || '';
      var ret    = reqObj.retDate || reqObj.ret   || '';
      var duty   = reqObj.duty   || reqObj.substituteName || '—';
      var ltype  = reqObj.ltype  || reqObj.type   || '—';
      var reason = reqObj.reason || '—';

      var dLabel = '';
      if (days) dLabel += days + ' day(s)';
      if (fromDt && toDt) dLabel += ' (' + fmtDate(fromDt) + ' to ' + fmtDate(toDt) + ')';
      if (!dLabel) dLabel = '—';

      var todayStr = new Date(reqObj.timestamp || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      var FORM_TITLE = 'LEAVE APPLICATION FORM';

      // Signature HTML blocks
      var appSigHtml = reqObj.applicantSignatureUrl 
        ? '<img src="' + reqObj.applicantSignatureUrl + '" style="max-height:16mm;max-width:45mm;object-fit:contain;margin-bottom:2px;display:block;margin-left:auto;margin-right:auto;">'
        : '<div style="height:14mm;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9pt;font-style:italic;">—</div>';
      
      var subSigHtml = reqObj.substituteSignatureUrl 
        ? '<img src="' + reqObj.substituteSignatureUrl + '" style="max-height:16mm;max-width:45mm;object-fit:contain;margin-bottom:2px;display:block;margin-left:auto;margin-right:auto;">'
        : '<div style="height:14mm;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9pt;font-style:italic;">—</div>';
      
      var icSigHtml = reqObj.icSignatureUrl 
        ? '<img src="' + reqObj.icSignatureUrl + '" style="max-height:16mm;max-width:45mm;object-fit:contain;margin-bottom:2px;display:block;margin-left:auto;margin-right:auto;">'
        : '<div style="height:14mm;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9pt;font-style:italic;">—</div>';

      var bodyHTML = ''
        + '<div class="date-row"><strong>Date:</strong> ' + todayStr + '</div>'
        + '<table><tbody>'
        + '<tr><td class="lbl">Name of the Official</td><td>' + name + '</td></tr>'
        + '<tr><td class="lbl">Designation</td><td>' + desig + '</td></tr>'
        + '<tr><td class="lbl">Ward / Unit</td><td>' + ward + '</td></tr>'
        + '<tr><td class="lbl">Reason for Leave</td><td>' + reason + '</td></tr>'
        + '<tr><td class="lbl">Type of Leave</td><td>' + ltype + '</td></tr>'
        + '<tr><td class="lbl">Total Days Requested</td><td>' + dLabel + '</td></tr>'
        + '<tr><td class="lbl">Return Date</td><td>' + (fmtDate(ret) || '—') + '</td></tr>'
        + '<tr><td class="lbl">Duty Assigned To</td><td>' + duty + '</td></tr>'
        + '</tbody></table>'
        + '<div style="page-break-inside: avoid; break-inside: avoid;">'
        + '<div class="undertaking">'
        +   '<div style="text-align:center;font-weight:700;margin-bottom:4px;font-size:10pt;text-decoration:underline">UNDERTAKING FOR PMAM DUTY COVERAGE DURING LEAVE</div>'
        +   'I, Mr./Ms. <strong>' + (duty || '________________') + '</strong>, PMAM, hereby undertake that during the leave period of Mr./Ms. <strong>' + (name || '________________') + '</strong>, from <strong>' + (fmtDate(fromDt) || '___') + '</strong> to <strong>' + (fmtDate(toDt) || '___') + '</strong>, I shall assume full responsibility for all assigned AB PM-JAY work, including pre-auths, pre-auth queries, claim queries, enhancements, discharges, claim submissions, and all pending work. All IPDs from the assigned ward(s) during the leave period shall be counted under my IPD workload and shall be my responsibility.'
        + '</div>'
        + '<div class="sig-row">'
        + '<div class="sig-box"><div class="sig-label">Signature of Applicant - PMAM</div>' + appSigHtml + '<div class="sig-desig">' + name + '</div></div>'
        + '<div class="sig-box"><div class="sig-label">Signature of Substitute PMAM</div>' + subSigHtml + '<div class="sig-desig">' + duty + '</div></div>'
        + '</div>'
        + '<div class="sig-row" style="margin-top:6mm">'
        + '<div class="sig-box"><div class="sig-label">I/C AB-PMJAY</div>' + icSigHtml + '<div class="sig-desig">' + (reqObj.icName || 'GMC &amp; AH, Rajouri') + '</div></div>'
        + '<div class="sig-box"><div class="sig-label">Medical Superintendent</div><div style="height:14mm;"></div><div class="sig-desig">GMC &amp; AH, Rajouri</div></div>'
        + '</div>'
        + '</div>'
        + '<div class="print-footer">'
        + '<span class="footer-brand">Computer generated leave application. | PMAM Reporting Portal @ MIS AB-PMJAY GMCR</span>'
        + '</div>';

      var pageContent;
      if (typeof global.GMCHeaders !== 'undefined' && global.GMCHeaders && typeof global.GMCHeaders.abpmjayReport === 'function') {
        try {
          var headerHTML = global.GMCHeaders.abpmjayReport({
            title: FORM_TITLE,
            editable: false,
            orientation: 'portrait'
          });
          pageContent = '<div class="page-wrap">' + headerHTML + '<div class="page-body">' + bodyHTML + '</div></div>';
        } catch (e) {
          pageContent = '<div style="padding:14mm 14mm;color:#dc2626;font-weight:bold;">Letterhead failed to render: ' + e.message + '</div>' + '<div style="padding:0 14mm 14mm;">' + bodyHTML + '</div>';
        }
      } else {
        pageContent = '<div style="padding:14mm 14mm;color:#dc2626;font-weight:bold;">Shared letterhead not loaded.</div>' + '<div style="padding:0 14mm 14mm;">' + bodyHTML + '</div>';
      }

      var baseHref = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
      var pageFull = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Leave Application - ' + name + '</title>'
        + '<base href="' + baseHref + '">'
        + '<link rel="stylesheet" href="shared/headers.css?v=6">'
        + '<style>'
        + '*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}'
        + 'img{image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges}'
        + 'body{font-family:Tahoma,Verdana,Arial,sans-serif;background:#fff;font-size:12pt;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
        + '.page-wrap{padding:5mm 14mm 6mm;max-width:210mm;margin:0 auto}'
        + '.page-body{margin-top:3mm}'
        + 'table{width:100%;border-collapse:separate;border-spacing:0;font-size:12pt;border:2px solid #1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:3mm}'
        + 'thead tr th{background:#1a1a1a;color:#fff;padding:4px 10px;font-size:11pt;text-align:left;font-weight:700}'
        + 'tbody tr:nth-child(even){background:#f7f8fc}'
        + 'tbody tr:nth-child(odd){background:#fff}'
        + 'td{padding:4px 10px;border-bottom:1px solid #dde2ee;vertical-align:middle}'
        + 'tbody tr:last-child td{border-bottom:none}'
        + '.lbl{font-weight:700;width:70mm;color:#1a2340;border-right:2px solid #dde2ee}'
        + '.date-row{text-align:right;font-size:11pt;margin-bottom:3mm;color:#444}'
        + '.undertaking{font-size:9.5pt;text-align:justify;border:1px solid #1a3db5;border-left:4px solid #1a3db5;padding:8px 12px;background:#f7f8fc;margin:2mm 0;line-height:1.4}'
        + '.sig-row{display:flex;justify-content:space-between;margin-top:4mm;gap:8mm}'
        + '.sig-box{flex:1;text-align:center;min-height:24mm;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}'
        + '.sig-label{font-weight:700;font-size:11pt;color:#1a2340;line-height:1.25;margin-bottom:2mm;padding:0 2mm}'
        + '.sig-desig{font-size:10pt;font-weight:normal;color:#555;margin-top:1mm;line-height:1.3}'
        + '.print-footer{border-top:2px solid #1a2340;margin-top:6mm;padding-top:2mm;text-align:center;font-size:10pt;color:#555}'
        + '.footer-brand{font-weight:700;color:#1a2340}'
        + '@media print{body{margin:0}@page{size:A4 portrait;margin:6mm 10mm}}'
        + '</style></head><body>'
        + pageContent
        + '</body></html>';

      // Create modal container if not present
      var modalId = 'leavePdfPreviewModalOverlay';
      var modal = document.getElementById(modalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.85);backdrop-filter:blur(5px);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
        document.body.appendChild(modal);
      }

      modal.innerHTML = ''
        + '<div style="background:#fff; width:100%; max-width:920px; height:92vh; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); display:flex; flex-direction:column; overflow:hidden; border:1px solid #cbd5e1;">'
        + '  <div style="background:#0f172a; color:#fff; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #334155; flex-shrink:0;">'
        + '    <div style="display:flex; align-items:center; gap:12px;">'
        + '      <span style="font-size:22px;">📄</span>'
        + '      <div>'
        + '        <div style="font-weight:800; font-size:15px; letter-spacing:0.3px; color:#f8fafc;">Leave Application Document</div>'
        + '        <div style="font-size:11px; color:#94a3b8;">' + name + ' (' + ltype + ')</div>'
        + '      </div>'
        + '    </div>'
        + '    <div style="display:flex; align-items:center; gap:10px;">'
        + '      <button id="leavePdfPrintBtn" style="background:#166534; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">'
        + '        🖨️ Print Application'
        + '      </button>'
        + '      <button id="leavePdfCloseBtn" style="background:#dc2626; color:#fff; border:none; width:34px; height:34px; border-radius:50%; font-weight:800; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;">'
        + '        ✕'
        + '      </button>'
        + '    </div>'
        + '  </div>'
        + '  <div style="flex:1; background:#f1f5f9; padding:16px; overflow:hidden; position:relative;">'
        + '    <iframe id="leavePdfFrame" style="width:100%; height:100%; border:none; background:#fff; border-radius:10px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"></iframe>'
        + '  </div>'
        + '</div>';

      modal.style.display = 'flex';

      var iframe = document.getElementById('leavePdfFrame');
      var doc = iframe.contentWindow.document;
      doc.open();
      doc.write(pageFull);
      doc.close();

      document.getElementById('leavePdfCloseBtn').onclick = function() {
        modal.style.display = 'none';
      };

      document.getElementById('leavePdfPrintBtn').onclick = function() {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      };
    }
  };
  global.LeaveEngine = LeaveEngine;
})(window);
