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
      return roles.some(function(r){ return r.indexOf('accountant') !== -1 || r.indexOf('finance') !== -1; });
    },

    /**
     * Check if user is an In-Charge (I/C)
     */
    isIC: function(user) {
      user = user || this.getUser();
      if (this.isAdmin(user)) return true;
      var roles = this.getUserRoles(user);
      return roles.some(function(r){ return r.indexOf('ic') !== -1 || r.indexOf('incharge') !== -1 || r.indexOf('in-charge') !== -1; });
    },

    /**
     * Check if user is a PMAM
     */
    isPMAM: function(user) {
      user = user || this.getUser();
      var roles = this.getUserRoles(user);
      return roles.some(function(r){ return r.indexOf('pmam') !== -1 || r.indexOf('arogya mitra') !== -1; });
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
          reqRole = reqRole.toLowerCase();
          if (reqRole === 'admin' && GMCAuth.isAdmin(user)) return true;
          if (reqRole === 'accountant' && GMCAuth.isAccountant(user)) return true;
          if (reqRole === 'ic' && GMCAuth.isIC(user)) return true;
          if (reqRole === 'pmam' && GMCAuth.isPMAM(user)) return true;
          return userRoles.indexOf(reqRole) !== -1;
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
