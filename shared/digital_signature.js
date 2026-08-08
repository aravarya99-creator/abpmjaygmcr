/*
 * DIGITAL SIGNATURE MODULE
 * Universal Digital Signature and PIN Verification Engine
 */
(function(global) {
  var DSig = {
    portal: 'pmam',
    
    init: function(config) {
      if (config && config.portal) this.portal = config.portal;
    },

    verifyUserPin: function(email, pin) {
      return new Promise(function(resolve, reject) {
        if (!pin || pin.length < 4) {
          return reject(new Error('Please enter your 4-digit Signature PIN.'));
        }
        if (typeof db === 'undefined') {
          return reject(new Error('Database connection not available.'));
        }
        
        var myEmail = email || (typeof getPmjayUser === 'function' && getPmjayUser() ? getPmjayUser().email : '');
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
          } else if (!udata.pin && !udata.signPinHash) {
            // First time user setting PIN
            db.collection('users').doc(myEmail).update({
              pin: pinStr,
              signPinHash: hashedPin
            }).catch(function(err){ console.warn('Could not save initial PIN:', err); });
            isValid = true;
          }

          if (isValid) {
            resolve(udata);
          } else {
            reject(new Error('Incorrect PIN. Please try again (default PIN is 1234).'));
          }
        }).catch(function(err) {
          reject(new Error('Error checking PIN: ' + err.message));
        });
      });
    },

    initiateSignedLeave: function(reqObj, pin) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (!reqObj) return reject(new Error('Leave request details missing.'));
        
        var email = reqObj.email || (typeof getPmjayUser === 'function' && getPmjayUser() ? getPmjayUser().email : '');

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
})(window);
