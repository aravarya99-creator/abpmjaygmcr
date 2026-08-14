/* ============================================================================
   GMC RAJOURI — CENTRALIZED AUTHENTICATION & ROLE GUARD SERVICE
   Single Source of Truth for Session Storage, User Profile, & Access Control.
   ============================================================================ */
(function(global) {
  'use strict';

  var SESSION_KEYS = ['pmjay_user', 'currentUser', 'gmc_user'];

  var GMCAuth = {
    /**
     * Get currently logged-in user profile from sessionStorage
     */
    getUser: function() {
      for (var i = 0; i < SESSION_KEYS.length; i++) {
        var raw = sessionStorage.getItem(SESSION_KEYS[i]);
        if (raw) {
          try {
            var u = JSON.parse(raw);
            if (u && (u.email || u.userName || u.id)) return u;
          } catch(e) {}
        }
      }
      return null;
    },

    /**
     * Store active user session
     */
    setUser: function(userObj) {
      if (!userObj) return;
      var str = JSON.stringify(userObj);
      sessionStorage.setItem('pmjay_user', str);
      sessionStorage.setItem('currentUser', str);
    },

    /**
     * Clear active user session
     */
    clearSession: function() {
      SESSION_KEYS.forEach(function(k) {
        sessionStorage.removeItem(k);
      });
    },

    /**
     * Get user roles as an normalized array of lowercase strings
     */
    getUserRoles: function(user) {
      user = user || this.getUser();
      if (!user) return [];
      var roles = [];
      if (Array.isArray(user.roles)) {
        roles = user.roles.map(function(r){ return String(r).toLowerCase().trim(); });
      } else if (user.role) {
        roles.push(String(user.role).toLowerCase().trim());
      }
      if (user.desig && roles.indexOf(String(user.desig).toLowerCase().trim()) === -1) {
        roles.push(String(user.desig).toLowerCase().trim());
      }
      return roles;
    },

    /**
     * Check if user is an Admin
     */
    isAdmin: function(user) {
      user = user || this.getUser();
      if (!user || !user.email) return false;
      var email = String(user.email).toLowerCase().trim();
      if (email === 'aravarya99@gmail.com') return true;
      var roles = this.getUserRoles(user);
      return roles.indexOf('admin') !== -1 || roles.indexOf('administrator') !== -1;
    },

    /**
     * Check if user has Accountant / Finance access
     */
    isAccountant: function(user) {
      user = user || this.getUser();
      if (this.isAdmin(user)) return true;
      var roles = this.getUserRoles(user);
      return roles.some(function(r){
        var s = String(r).toLowerCase().trim();
        return s.indexOf('accountant') !== -1 || s.indexOf('finance') !== -1;
      });
    },

    /**
     * Check if user is an In-Charge (I/C)
     */
    isIC: function(user) {
      user = user || this.getUser();
      if (this.isAdmin(user)) return true;
      var roles = this.getUserRoles(user);
      return roles.some(function(r){
        var s = String(r).toLowerCase().trim();
        var norm = s.replace(/[^a-z0-9]/g, '');
        return s.indexOf('ic') !== -1 || s.indexOf('i/c') !== -1 || s.indexOf('incharge') !== -1 || s.indexOf('in-charge') !== -1 || s.indexOf('icnarge') !== -1 || s.indexOf('incherage') !== -1 || s.indexOf('inchrage') !== -1 || norm.indexOf('ic') !== -1 || norm.indexOf('inc') !== -1;
      });
    },

    /**
     * Check if user is a PMAM
     */
    isPMAM: function(user) {
      user = user || this.getUser();
      if (this.isAdmin(user)) return true;
      var roles = this.getUserRoles(user);
      return roles.some(function(r){
        var s = String(r).toLowerCase().trim();
        return s.indexOf('pmam') !== -1 || s.indexOf('arogya mitra') !== -1;
      });
    },

    /**
     * Check if user is DEO / Patient Services
     */
    isPatientService: function(user) {
      user = user || this.getUser();
      if (this.isAdmin(user)) return true;
      var roles = this.getUserRoles(user);
      return roles.some(function(r){
        var s = String(r).toLowerCase().trim();
        return s === 'deo' || s.indexOf('patient') !== -1 || s.indexOf('mts') !== -1;
      });
    },

    /**
     * Session Guard: Redirects to index.html if user is unauthenticated or lacks required role
     */
    requireAuth: function(allowedRoles, redirectUrl) {
      redirectUrl = redirectUrl || 'index.html';
      var user = this.getUser();
      if (!user || !user.email) {
        window.location.href = redirectUrl;
        return false;
      }
      if (allowedRoles && allowedRoles.length) {
        var userRoles = this.getUserRoles(user);
        var hasAccess = allowedRoles.some(function(reqRole) {
          reqRole = reqRole.toLowerCase().trim();
          if ((reqRole === 'admin' || reqRole === 'administrator') && GMCAuth.isAdmin(user)) return true;
          if ((reqRole === 'accountant' || reqRole === 'finance') && GMCAuth.isAccountant(user)) return true;
          if ((reqRole === 'ic' || reqRole === 'i/c' || reqRole === 'incharge' || reqRole === 'i/c ab-pmjay') && GMCAuth.isIC(user)) return true;
          if ((reqRole === 'pmam') && GMCAuth.isPMAM(user)) return true;
          if ((reqRole === 'deo' || reqRole === 'patient' || reqRole === 'patient_service') && GMCAuth.isPatientService(user)) return true;
          return userRoles.some(function(ur){
            var s = String(ur).toLowerCase().trim();
            return s === reqRole || s.indexOf(reqRole) !== -1;
          });
        });

        if (!hasAccess) {
          window.location.href = redirectUrl;
          return false;
        }
      }
      return true;
    }
  };

  global.GMCAuth = GMCAuth;
})(typeof window !== 'undefined' ? window : this);
