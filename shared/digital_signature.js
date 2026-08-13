/*
 * DIGITAL SIGNATURE MODULE
 * Universal Digital Signature, PIN Verification Engine, & Dynamic Modal Dialog
 */
(function(global) {
  var DSig = {
    portal: 'pmam',
    
    init: function(config) {
      if (config && config.portal) this.portal = config.portal;
    },

    verifyUserPin: function(email, pin) {
      return new Promise(function(resolve, reject) {
        if (!pin || String(pin).trim().length < 4) {
          return reject(new Error('Please enter your 4-digit Signature PIN.'));
        }
        var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
        if (!db) {
          return reject(new Error('Database connection not available.'));
        }
        
        var user = global.GMCAuth ? global.GMCAuth.getUser() : null;
        var myEmail = (email || (user ? user.email : '') || '').toLowerCase().trim();
        if (!myEmail) {
          return reject(new Error('User email not found. Please log in again.'));
        }

        db.collection('users').doc(myEmail).get().then(function(doc) {
          if (!doc.exists) {
            return reject(new Error('User profile not found in database.'));
          }
          var udata = doc.data() || {};
          var pinStr = String(pin).trim();
          var hashedPin = (typeof CryptoJS !== 'undefined') ? CryptoJS.SHA256(pinStr).toString() : pinStr;

          var isValid = false;

          if (udata.pin && String(udata.pin).trim() === pinStr) {
            isValid = true;
          } else if (udata.signPinHash && udata.signPinHash === hashedPin) {
            isValid = true;
          } else if (!udata.signPinHash && (!udata.pin || String(udata.pin).trim() === '1234')) {
            // First time user or default admin reset PIN (1234) -> set/update PIN
            isValid = true;
            db.collection('users').doc(myEmail).update({
              pin: pinStr,
              signPinHash: hashedPin
            }).catch(function(err){ console.warn('Could not save initial PIN:', err); });
          }

          if (isValid) {
            if (!udata.signPinHash) {
              db.collection('users').doc(myEmail).update({
                pin: pinStr,
                signPinHash: hashedPin
              }).catch(function(e){});
            }
            resolve(udata);
          } else {
            reject(new Error('Incorrect PIN. Please try again (default PIN is 1234).'));
          }
        }).catch(function(err) {
          reject(new Error('Error checking PIN: ' + err.message));
        });
      });
    },

    /**
     * Dynamic PIN Modal Dialog Prompt
     * Opens a modal overlay asking user for 4-digit signature PIN and verifies it.
     */
    promptPin: function(email, title) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var existingModal = document.getElementById('dsig-pin-modal');
        if (existingModal) existingModal.remove();

        title = title || 'Enter Digital Signature PIN';
        var user = global.GMCAuth ? global.GMCAuth.getUser() : null;
        var myEmail = email || (user ? user.email : '');

        var modal = document.createElement('div');
        modal.id = 'dsig-pin-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Inter,sans-serif;padding:16px;';

        modal.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.25);width:100%;max-width:380px;overflow:hidden;animation:dsigPop 0.2s ease-out;">
            <' + 'style>
              @keyframes dsigPop { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
            <' + '/style>
            <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:10px;">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <h3 style="font-size:14px;font-weight:800;margin:0;letter-spacing:0.3px;">${title}</h3>
              </div>
              <button id="dsig-close-btn" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;">&times;</button>
            </div>
            <div style="padding:20px;">
              <p style="font-size:12px;color:#475569;margin-bottom:14px;text-align:center;">
                Please enter your 4-digit Signature PIN to authorize this request:
              </p>
              <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;">
                <input type="password" maxlength="1" class="dsig-pbox" style="width:44px;height:48px;font-size:22px;font-weight:800;text-align:center;border:2px solid #cbd5e1;border-radius:10px;outline:none;" autofocus>
                <input type="password" maxlength="1" class="dsig-pbox" style="width:44px;height:48px;font-size:22px;font-weight:800;text-align:center;border:2px solid #cbd5e1;border-radius:10px;outline:none;">
                <input type="password" maxlength="1" class="dsig-pbox" style="width:44px;height:48px;font-size:22px;font-weight:800;text-align:center;border:2px solid #cbd5e1;border-radius:10px;outline:none;">
                <input type="password" maxlength="1" class="dsig-pbox" style="width:44px;height:48px;font-size:22px;font-weight:800;text-align:center;border:2px solid #cbd5e1;border-radius:10px;outline:none;">
              </div>
              <div id="dsig-err-msg" style="font-size:11.5px;color:#dc2626;text-align:center;min-height:18px;font-weight:600;margin-bottom:10px;"></div>
              <div style="display:flex;gap:10px;">
                <button id="dsig-cancel-btn" style="flex:1;height:40px;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">Cancel</button>
                <button id="dsig-submit-btn" style="flex:1;height:40px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">Verify &amp; Sign</button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        var boxes = modal.querySelectorAll('.dsig-pbox');
        var errDiv = modal.querySelector('#dsig-err-msg');

        boxes.forEach(function(b, idx) {
          b.addEventListener('input', function() {
            if (b.value.length === 1 && idx < boxes.length - 1) {
              boxes[idx + 1].focus();
            }
          });
          b.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !b.value && idx > 0) {
              boxes[idx - 1].focus();
            }
          });
        });

        function cleanup() {
          if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        }

        modal.querySelector('#dsig-close-btn').onclick = function() { cleanup(); reject(new Error('PIN prompt cancelled by user.')); };
        modal.querySelector('#dsig-cancel-btn').onclick = function() { cleanup(); reject(new Error('PIN prompt cancelled by user.')); };

        modal.querySelector('#dsig-submit-btn').onclick = function() {
          var pin = Array.from(boxes).map(function(b){ return b.value; }).join('');
          if (pin.length < 4) {
            errDiv.textContent = 'Please enter all 4 digits.';
            return;
          }
          errDiv.textContent = 'Verifying PIN...';
          self.verifyUserPin(myEmail, pin).then(function(udata) {
            cleanup();
            resolve(udata);
          }).catch(function(err) {
            errDiv.textContent = err.message || 'Invalid PIN.';
            boxes.forEach(function(b){ b.value = ''; });
            boxes[0].focus();
          });
        };
      });
    },

    initiateSignedLeave: function(reqObj, pin) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (!reqObj) return reject(new Error('Leave request details missing.'));
        
        var user = global.GMCAuth ? global.GMCAuth.getUser() : null;
        var email = reqObj.email || (user ? user.email : '');
        var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);

        self.verifyUserPin(email, pin).then(function(udata) {
          reqObj.applicantSignatureUrl = udata.signatureImage || '';
          reqObj.applicantSignedAt = Date.now();
          reqObj.status = 'Pending Substitute';
          if (!reqObj.timestamp) reqObj.timestamp = Date.now();

          return db.collection('leave_requests').add(reqObj);
        }).then(function(ref) {
          resolve(ref);
        }).catch(function(err) {
          reject(err);
        });
      });
    }
  };

  global.DSig = DSig;
})(typeof window !== 'undefined' ? window : this);
