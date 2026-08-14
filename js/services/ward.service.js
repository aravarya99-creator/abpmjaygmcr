/* ============================================================================
   GMC RAJOURI — CENTRALIZED WARD REGISTRY SERVICE
   Single Source of Truth for Wards, Dropdown Population, & Firestore Sync.
   ============================================================================ */
(function(global) {
  'use strict';

  // ── Color tokens (consistent across portals) ──────────────────────────
  var C = {
    red:         { bg:'#fee2e2', text:'#dc2626', border:'#fecaca' },
    darkRed:     { bg:'#fecaca', text:'#991b1b', border:'#f87171' },
    brightRed:   { bg:'#fef2f2', text:'#dc2626', border:'#dc2626' },
    orange:      { bg:'#ffedd5', text:'#c2410c', border:'#fdba74' },
    indigo:      { bg:'#e0e7ff', text:'#4338ca', border:'#a5b4fc' },
    pinkIndigo:  { bg:'#fce7f3', text:'#9333ea', border:'#f9a8d4' },
    blue:        { bg:'#dbeafe', text:'#1e40af', border:'#93c5fd' },
    rose:        { bg:'#ffe4e6', text:'#be185d', border:'#fda4af' },
    skyBlue:     { bg:'#e0f2fe', text:'#0369a1', border:'#7dd3fc' },
    pink:        { bg:'#fce7f3', text:'#be185d', border:'#f9a8d4' },
    teal:        { bg:'#ccfbf1', text:'#0f766e', border:'#5eead4' },
    purple:      { bg:'#ede9fe', text:'#6d28d9', border:'#c4b5fd' },
    cyan:        { bg:'#cffafe', text:'#0e7490', border:'#67e8f9' },
    violet:      { bg:'#f3e8ff', text:'#7c3aed', border:'#d8b4fe' }
  };

  // ── DEFAULT WARDS (hospital ward catalogue) ───────────────────────────
  var DEFAULTS = [
    { id:'pm_rahat',         label:'PM RAHAT',          icon:'🚑',        colorKey:'red',         caseType:'both',         order:0  },
    { id:'orthopaedics',     label:'Orthopaedics',      icon:'🦴',        colorKey:'orange',      caseType:'both',         order:1  },
    { id:'male_surgical',    label:'Male Surgical',     icon:'👨🔪',       colorKey:'indigo',      caseType:'both',         order:2  },
    { id:'female_surgical',  label:'Female Surgical',   icon:'👩🔪',       colorKey:'pinkIndigo',  caseType:'both',         order:3  },
    { id:'male_medical_a',   label:'Male Medical A',    icon:'👨‍⚕️🩺🅰️', colorKey:'blue',  caseType:'conservative', order:4  },
    { id:'male_medical_b',   label:'Male Medical B',    icon:'👨‍⚕️🩺🅱️', colorKey:'blue',  caseType:'conservative', order:5  },
    { id:'female_medical_a', label:'Female Medical A',  icon:'👩‍⚕️🩺🅰️', colorKey:'rose',  caseType:'conservative', order:6  },
    { id:'female_medical_b', label:'Female Medical B',  icon:'👩‍⚕️🩺🅱️', colorKey:'rose',  caseType:'conservative', order:7  },
    { id:'micu',             label:'MICU',              icon:'❤️‍🩹📈',   colorKey:'red',     caseType:'conservative', order:8  },
    { id:'sicu',             label:'SICU',              icon:'🛏️📈',      colorKey:'darkRed',     caseType:'both',         order:9  },
    { id:'picu',             label:'PICU',              icon:'👶',        colorKey:'skyBlue',     caseType:'both',         order:10 },
    { id:'dialysis',         label:'Dialysis',          icon:'💧🩸',      colorKey:'blue',        caseType:'conservative', order:11 },
    { id:'gynecology',       label:'Gynecology',        icon:'♀️',        colorKey:'pink',        caseType:'both',         order:12 },
    { id:'ophthalmology',    label:'Ophthalmology',     icon:'👁️',        colorKey:'teal',        caseType:'surgery',      order:13 },
    { id:'ent',              label:'ENT',               icon:'👂',        colorKey:'purple',      caseType:'both',         order:14 },
    { id:'dental',           label:'Dental',            icon:'🦷',        colorKey:'cyan',        caseType:'both',         order:15 },
    { id:'oncology',         label:'Oncology',          icon:'🎗️',        colorKey:'violet',      caseType:'conservative', order:16 },
    { id:'disaster',         label:'Disaster',          icon:'🚨',        colorKey:'brightRed',   caseType:'both',         order:17 }
  ];

  // ── ALIAS map: legacy / alternative names → canonical labels ──────────
  var ALIASES = {
    'Male Surgery Ward':      'Male Surgical',
    'Female Surgery Ward':    'Female Surgical',
    'Male Medicine Ward A':   'Male Medical A',
    'Male Medicine Ward B':   'Male Medical B',
    'Female Medicine Ward A': 'Female Medical A',
    'Female Medicine Ward B': 'Female Medical B',
    'Optha':                  'Ophthalmology',
    'Onco':                   'Oncology',
    'Gynae':                  'Gynecology',
    'Emergency & Triage Ward':'PM RAHAT',
    'Emergency':              'PM RAHAT',
    'ICU / CCU / HDU':        'MICU',
    'ICU':                    'MICU',
    'Pediatrics & SNCU Ward': 'PICU',
    'Pediatrics':             'PICU',
    'Orthopedics & Surgery Ward':'Orthopaedics',
    'Orthopedics':            'Orthopaedics',
    'Gynae & Obstetrics Ward':'Gynecology',
    'Dialysis Unit':          'Dialysis'
  };

  var _wards   = null;
  var _ready   = false;
  var _onReady = [];
  var _onChange = [];

  function hydrate(w) {
    var def = DEFAULTS.find(function(d){ return d.label === w.label || d.id === w.id; }) || {};
    var hydrated = {
      id:        w.id        || def.id        || (w.label || '').toLowerCase().replace(/[^a-z0-9]+/g,'_'),
      label:     w.label     || def.label     || '',
      icon:      w.icon      || def.icon      || '',
      caseType:  w.caseType  || def.caseType  || 'both',
      order:     (w.order != null ? w.order : (def.order != null ? def.order : 99)),
      imageUrl:  w.imageUrl  || w.image       || null,
      colorKey:  w.colorKey  || def.colorKey  || 'blue'
    };
    hydrated.color = C[hydrated.colorKey] || C.blue;
    return hydrated;
  }

  function setWards(arr) {
    _wards = arr.map(hydrate).sort(function(a,b){ return a.order - b.order; });
    _ready = true;
    _onReady.splice(0).forEach(function(cb){ try { cb(_wards); } catch(e){ console.warn(e); } });
    _onChange.forEach(function(cb){ try { cb(_wards); } catch(e){ console.warn(e); } });
  }

  function canonicalLabel(name) {
    if (!name) return null;
    var s = String(name).trim();
    if (!s) return null;
    if (ALIASES[s]) return ALIASES[s];
    if (_wards) {
      var hit = _wards.find(function(w){ return w.label.toLowerCase() === s.toLowerCase(); });
      if (hit) return hit.label;
    }
    return s;
  }

  function byLabel(name) {
    if (!_wards) return null;
    var canon = canonicalLabel(name);
    return _wards.find(function(w){ return w.label === canon; }) || null;
  }

  function escHtml(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var Registry = {
    DEFAULTS: DEFAULTS,
    ALIASES:  ALIASES,
    isReady:  function(){ return _ready; },
    list:     function(){ return _wards ? _wards.slice() : DEFAULTS.map(hydrate); },
    getAll:   function(){ return this.list(); },
    getById:  function(id){ return (_wards || DEFAULTS.map(hydrate)).find(function(w){ return w.id === id || w.label === id; }); },
    byLabel:  byLabel,
    canonical: canonicalLabel,
    caseType: function(name){ var w = byLabel(name); return w ? w.caseType : 'both'; },
    icon:     function(name){ var w = byLabel(name); return w ? w.icon : ''; },
    color:    function(name){ var w = byLabel(name); return w ? w.color : C.blue; },
    onReady:  function(cb){ if (_ready) try { cb(_wards); } catch(e){} else _onReady.push(cb); },
    onChange: function(cb){ _onChange.push(cb); },

    pill: function(name, opts){
      opts = opts || {};
      var w = byLabel(name);
      if (!w) {
        return '<span class="ward-pill ward-pill-unknown" style="display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:50px;font-size:11px;font-weight:600;background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb">'+escHtml(name||'—')+'</span>';
      }
      var c = w.color;
      var iconHtml = '';
      if (w.imageUrl) {
        iconHtml = '<img src="'+escHtml(w.imageUrl)+'" alt="" style="width:14px;height:14px;object-fit:contain;flex-shrink:0">';
      } else if (w.icon) {
        iconHtml = '<span style="font-size:'+(opts.iconSize||'12px')+';line-height:1;flex-shrink:0">'+w.icon+'</span>';
      }
      var labelHtml = opts.iconOnly ? '' : '<span>'+escHtml(w.label)+'</span>';
      return '<span class="ward-pill" data-ward-id="'+w.id+'" '
           + 'style="display:inline-flex;align-items:center;gap:5px;'
           + 'padding:2px 9px;border-radius:50px;font-size:'+(opts.fontSize||'11px')+';font-weight:700;'
           + 'background:'+c.bg+';color:'+c.text+';border:1px solid '+c.border+';'
           + 'letter-spacing:0.2px;white-space:nowrap;'+(opts.style||'')+'">'
           + iconHtml + labelHtml
           + '</span>';
    },

    populateSelect: function(sel, selected, opts){
      if (!sel) return;
      opts = opts || {};
      var canonSelected = canonicalLabel(selected);
      var withIcon = opts.withIcon !== false;
      var caseTypeFilter = opts.caseType || null;
      var html = '';
      if (opts.placeholder !== false) {
        html += '<option value="">'+(opts.placeholderText || '— Select Ward —')+'</option>';
      }
      var list = _wards || DEFAULTS.map(hydrate);
      list.forEach(function(w){
        if (caseTypeFilter && w.caseType !== caseTypeFilter && w.caseType !== 'both') return;
        var text = withIcon && w.icon ? (w.icon + ' ' + w.label) : w.label;
        var isSel = (w.label === canonSelected) ? ' selected' : '';
        html += '<option value="'+escHtml(w.label)+'"'+isSel+'>'+escHtml(text)+'</option>';
      });
      if (selected && canonSelected && !list.find(function(w){ return w.label === canonSelected; })) {
        html += '<option value="'+escHtml(selected)+'" selected>'+escHtml(selected)+' (unknown)</option>';
      }
      sel.innerHTML = html;
    },

    init: function() {
      var db = global.db || (global.GMCFirebase ? global.GMCFirebase.db : null);
      if (!db || !db.collection) {
        if (!_ready) setWards(DEFAULTS.map(function(d){ return Object.assign({}, d); }));
        return;
      }
      db.collection('settings').doc('wards').onSnapshot(function(doc){
        if (!doc.exists) { setWards(DEFAULTS.map(function(d){ return Object.assign({}, d); })); return; }
        var data = doc.data() || {};
        var arr = data.wards;
        if (!Array.isArray(arr) || arr.length === 0) {
          setWards(DEFAULTS.map(function(d){ return Object.assign({}, d); }));
          return;
        }
        if (typeof arr[0] === 'string') {
          var migrated = arr.map(function(name, i){
            var canon = ALIASES[name] || name;
            var def = DEFAULTS.find(function(d){ return d.label === canon; });
            return def ? Object.assign({}, def, { order:i }) : {
              id: canon.toLowerCase().replace(/[^a-z0-9]+/g,'_'),
              label: canon, icon: '', colorKey: 'blue', caseType: 'both', order: i
            };
          });
          setWards(migrated);
        } else {
          setWards(arr);
        }
      }, function(err){
        console.warn('[WARD_REGISTRY] Firestore listen failed:', err && err.message);
        if (!_ready) setWards(DEFAULTS.map(function(d){ return Object.assign({}, d); }));
      });
    }
  };

  // Immediate initialization with defaults so registry is never unpopulated
  setWards(DEFAULTS.map(function(d){ return Object.assign({}, d); }));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ Registry.init(); });
  } else {
    Registry.init();
  }

  global.GMCWards = Registry;
  global.WARD_REGISTRY = Registry;
})(typeof window !== 'undefined' ? window : this);
