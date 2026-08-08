/* ============================================================================
   GMC RAJOURI — CENTRALIZED WARD REGISTRY SERVICE
   Single Source of Truth for Wards, Wards Firestore Sync, & Dropdown Population.
   ============================================================================ */
(function(global) {
  'use strict';

  var DEFAULT_WARDS = [
    { id: 'emergency_triage', label: 'Emergency & Triage Ward', icon: 'zap', colorKey: 'rose', caseType: 'both', order: 0 },
    { id: 'icu_ccu', label: 'ICU / CCU / HDU', icon: 'activity', colorKey: 'purple', caseType: 'both', order: 1 },
    { id: 'male_medical', label: 'Male Medical Ward', icon: 'user', colorKey: 'blue', caseType: 'ipd', order: 2 },
    { id: 'female_medical', label: 'Female Medical Ward', icon: 'user-check', colorKey: 'pink', caseType: 'ipd', order: 3 },
    { id: 'pediatrics', label: 'Pediatrics & SNCU Ward', icon: 'smile', colorKey: 'amber', caseType: 'ipd', order: 4 },
    { id: 'orthopedics', label: 'Orthopedics & Surgery Ward', icon: 'shield', colorKey: 'emerald', caseType: 'ipd', order: 5 },
    { id: 'gynae_obs', label: 'Gynae & Obstetrics Ward', icon: 'heart', colorKey: 'rose', caseType: 'ipd', order: 6 },
    { id: 'dialysis', label: 'Dialysis Unit', icon: 'droplet', colorKey: 'cyan', caseType: 'both', order: 7 },
    { id: 'helpdesk', label: 'Central PM-JAY Kiosk / Helpdesk', icon: 'help-circle', colorKey: 'indigo', caseType: 'both', order: 8 }
  ];

  var WARD_ALIASES = {
    'Emergency': 'Emergency & Triage Ward',
    'ICU': 'ICU / CCU / HDU',
    'Male Medical': 'Male Medical Ward',
    'Female Medical': 'Female Medical Ward',
    'Pediatrics': 'Pediatrics & SNCU Ward',
    'Orthopedics': 'Orthopedics & Surgery Ward',
    'Gynae': 'Gynae & Obstetrics Ward',
    'Dialysis': 'Dialysis Unit',
    'Kiosk': 'Central PM-JAY Kiosk / Helpdesk'
  };

  var _wards = DEFAULT_WARDS.slice();
  var _listeners = [];
  var _readyListeners = [];
  var _isReady = false;

  var GMCWards = {
    getAll: function() {
      return _wards.slice();
    },

    canonical: function(name) {
      if (!name) return '';
      var trimmed = String(name).trim();
      return WARD_ALIASES[trimmed] || trimmed;
    },

    getById: function(id) {
      return _wards.find(function(w){ return w.id === id || w.label === id; });
    },

    onChange: function(fn) {
      if (typeof fn === 'function') _listeners.push(fn);
    },

    onReady: function(fn) {
      if (typeof fn === 'function') {
        if (_isReady) fn(_wards);
        else _readyListeners.push(fn);
      }
    },

    populateSelect: function(selectEl, selectedValue, options) {
      if (!selectEl) return;
      options = options || {};
      var placeholder = options.placeholderText || '— Select Ward —';
      var filterCaseType = options.caseType || null;

      selectEl.innerHTML = '';
      if (placeholder) {
        var ph = document.createElement('option');
        ph.value = '';
        ph.textContent = placeholder;
        selectEl.appendChild(ph);
      }

      var canonSelected = this.canonical(selectedValue || selectEl.value);

      _wards.forEach(function(w) {
        if (filterCaseType && w.caseType && w.caseType !== 'both' && w.caseType !== filterCaseType) {
          return;
        }
        var opt = document.createElement('option');
        opt.value = w.label;
        opt.textContent = w.label;
        if (w.label === canonSelected || w.id === selectedValue) {
          opt.selected = true;
        }
        selectEl.appendChild(opt);
      });
    },

    init: function() {
      var self = this;
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db) {
        _isReady = true;
        _readyListeners.forEach(function(fn){ fn(_wards); });
        _readyListeners = [];
        return;
      }

      db.collection('settings').doc('wards').onSnapshot(function(doc) {
        if (doc.exists) {
          var data = doc.data() || {};
          if (Array.isArray(data.wards) && data.wards.length > 0) {
            _wards = data.wards.map(function(w, i) {
              if (typeof w === 'string') {
                var canon = self.canonical(w);
                var def = DEFAULT_WARDS.find(function(d){ return d.label === canon; });
                return def ? Object.assign({}, def, { order: i }) : {
                  id: canon.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                  label: canon, icon: '', colorKey: 'blue', caseType: 'both', order: i
                };
              }
                return w;
            });
          }
        }
        _isReady = true;
        _readyListeners.forEach(function(fn){ fn(_wards); });
        _readyListeners = [];
        _listeners.forEach(function(fn){ fn(_wards); });
      }, function(err) {
        console.warn('[GMCWards] Ward Firestore sync error:', err && err.message);
        _isReady = true;
        _readyListeners.forEach(function(fn){ fn(_wards); });
        _readyListeners = [];
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ GMCWards.init(); });
  } else {
    GMCWards.init();
  }

  global.GMCWards = GMCWards;
  global.WARD_REGISTRY = GMCWards; // Backwards compatibility with index.html
})(typeof window !== 'undefined' ? window : this);
