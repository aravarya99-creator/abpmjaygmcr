/* ═══════════════════════════════════════════════════════════════════════
 * DIGITAL SIGNATURE MODULE — AB PM-JAY MIS, GMC & AH Rajouri
 * ───────────────────────────────────────────────────────────────────────
 * Shared by every portal (pmam, ic, ms, admin). Adds a "Sign Inbox" tab
 * to the sidebar with a red badge showing pending signature count.
 *
 * REUSES existing portal infrastructure:
 *   - db (firebase.firestore() — already initialized in host portal)
 *   - getPmjayUser() — session reader from sessionStorage.pmjay_user
 *   - goSec(id, el) — section switcher
 *   - GMCHeaders.abpmjayReport() — letterhead renderer
 *   - The existing 'leave_requests' collection (extended with sign fields)
 *   - The existing 'users' collection (for resolving names → emails)
 *
 * EXTENDS leave_requests schema with these OPTIONAL fields:
 *   signEnabled : true            // marks this as digitally signed flow
 *   chain       : [{role, label, email, name, signed, signedAt,
 *                   signatureHash, remarks, pinHash}]
 *   currentStage: 0,1,2,3         // index into chain
 *   signStatus  : pending|signed|rejected
 *
 * Old leave_requests records without these fields keep working exactly
 * as before. No migration needed.
 *
 * NETWORK BURDEN: ZERO email calls. In-portal red badge + onSnapshot
 * realtime listener. Total EmailJS usage by this module: 0/month.
 * ═══════════════════════════════════════════════════════════════════════ */
(function(global){
'use strict';

console.log('[DSig] v1.0.0 loaded ·', new Date().toISOString());

// ─── DEPENDENCIES (loaded by host portal) ──────────────────────────────
// Required externals: db, getPmjayUser, goSec, GMCHeaders
// Required CDN libs: CryptoJS, jsPDF, html2canvas, QRCodeJS
// All are already in pmam_portal.html or will be added per integration.

if (typeof firebase === 'undefined') {
  console.error('[DSig] Firebase not loaded — module disabled');
  return;
}
if (typeof CryptoJS === 'undefined') {
  console.warn('[DSig] CryptoJS not loaded — PIN signing will not work. Add: <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>');
}

// ─── CONFIG ─────────────────────────────────────────────────────────────
var IC_ABPMJAY_ROLE = 'I/C AB-PMJAY';
var MS_ROLE         = 'Medical Superintendent';
var PMAM_ROLE       = 'PMAM';
var ADMIN_EMAIL     = 'aravarya99@gmail.com';

// Sign chain definition for leave applications
// Stage 0: applicant (auto-filled from logged-in user)
// Stage 1: substitute PMAM (from "duty" field of leave form)
// Stage 2: I/C AB-PMJAY (resolved by role lookup)
// Stage 3: Medical Superintendent (resolved by role lookup)
var LEAVE_CHAIN_DEF = [
  { stage:0, role:PMAM_ROLE,       label:'Applicant PMAM',          source:'applicant'  },
  { stage:1, role:PMAM_ROLE,       label:'Substitute PMAM',         source:'substitute' },
  { stage:2, role:IC_ABPMJAY_ROLE, label:'I/C AB-PMJAY',            source:'role'       },
  // Medical Superintendent is OPTIONAL: if no MS user exists yet, this stage
  // is skipped and I/C becomes the final approver. Once an MS user is created
  // (role exactly "Medical Superintendent"), future leaves auto-include it.
  { stage:3, role:MS_ROLE,         label:'Medical Superintendent',  source:'role', optional:true }
];

// ─── UTILS ─────────────────────────────────────────────────────────────
function sha256(s){ return CryptoJS.SHA256(s).toString(); }
function nowIso(){ return new Date().toISOString(); }
function fmtDt(ts){
  if (!ts) return '—';
  var d = (typeof ts === 'number') ? new Date(ts) : new Date(ts);
  return d.toLocaleString('en-IN', {dateStyle:'medium', timeStyle:'short'});
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

// ─── STYLE INJECTION (one-time) ────────────────────────────────────────
function injectStyles(){
  if (document.getElementById('dsig-styles')) return;
  var css = ''
    + '.dsig-badge{display:inline-block;background:#dc2626;color:#fff;font-size:9px;font-weight:800;'
    + 'min-width:16px;height:16px;line-height:16px;border-radius:8px;padding:0 4px;text-align:center;'
    + 'margin-left:4px;vertical-align:top;animation:dsig-pulse 1.6s ease-in-out infinite}'
    + '@keyframes dsig-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}'
    + '.dsig-pill{display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;'
    + 'text-transform:uppercase;letter-spacing:.4px}'
    + '.dsig-pill.draft{background:#f3f4f6;color:#6b7280}'
    + '.dsig-pill.pending{background:#fef3c7;color:#92400e}'
    + '.dsig-pill.signed{background:#d1fae5;color:#065f46}'
    + '.dsig-pill.rejected{background:#fee2e2;color:#991b1b}'
    + '.dsig-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(12px);border-radius:14px;'
    + 'border:1.5px solid rgba(255,255,255,0.85);padding:14px 16px;margin-bottom:12px;'
    + 'box-shadow:0 4px 16px rgba(30,80,200,0.06)}'
    + '.dsig-card-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;flex-wrap:wrap}'
    + '.dsig-card-title{font-weight:800;color:#0F2B8C;font-size:13px}'
    + '.dsig-card-sub{font-size:11px;color:#6b7280;margin-top:2px}'
    + '.dsig-pipeline{display:flex;gap:0;flex-wrap:wrap;margin:10px 0}'
    + '.dsig-stage{flex:1;min-width:130px;background:#f8fafc;border:1px solid #e5e7eb;'
    + 'padding:8px 10px;border-radius:8px;margin:3px;position:relative;font-size:11px}'
    + '.dsig-stage.done{border-color:#10b981;background:#ecfdf5}'
    + '.dsig-stage.active{border-color:#0F2B8C;background:#dbeafe;box-shadow:0 0 0 2px rgba(15,43,140,0.15)}'
    + '.dsig-stage.future{opacity:.55}'
    + '.dsig-stage.rejected{border-color:#dc2626;background:#fef2f2}'
    + '.dsig-stage-no{font-size:9px;color:#6b7280;font-weight:700;letter-spacing:.5px}'
    + '.dsig-stage-role{font-size:11px;font-weight:700;margin:2px 0;color:#0F2B8C}'
    + '.dsig-stage-name{font-size:10px;color:#374151}'
    + '.dsig-stage-meta{font-size:9px;color:#6b7280;margin-top:4px;padding-top:4px;border-top:1px dashed #e5e7eb}'
    + '.dsig-stage-tick{position:absolute;top:6px;right:8px;font-size:12px}'
    + '.dsig-btn{height:30px;padding:0 14px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;'
    + 'border:none;font-family:Inter,sans-serif;transition:all 0.15s;display:inline-flex;align-items:center;gap:5px}'
    + '.dsig-btn-sign{background:linear-gradient(90deg,#0F2B8C,#1A3DB5);color:#fff}'
    + '.dsig-btn-approve{background:linear-gradient(90deg,#166534,#16a34a);color:#fff}'
    + '.dsig-btn-reject{background:linear-gradient(90deg,#991b1b,#dc2626);color:#fff}'
    + '.dsig-btn-view{background:#F0F4FF;color:#1A3DB5;border:1.5px solid rgba(26,61,181,0.2)}'
    + '.dsig-btn:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,0.12)}'
    + '.dsig-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}'
    + '.dsig-empty{text-align:center;padding:40px 20px;color:#9ca3af;font-size:12px}'
    + '.dsig-empty .ico{font-size:36px;display:block;margin-bottom:8px;opacity:.4}'
    + '.dsig-toggle{display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(90deg,#dbeafe,#e0f2fe);'
    + 'border:1.5px dashed #0F2B8C;border-radius:10px;margin:10px 0}'
    + '.dsig-toggle input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#0F2B8C}'
    + '.dsig-toggle label{font-size:12px;font-weight:700;color:#0F2B8C;cursor:pointer}'
    + '.dsig-toggle-desc{font-size:10px;color:#374151;margin-top:2px}'
    + '.dsig-modal-bg{position:fixed;inset:0;background:rgba(15,43,140,0.55);backdrop-filter:blur(6px);'
    + 'display:none;align-items:center;justify-content:center;z-index:9999;padding:16px}'
    + '.dsig-modal-bg.open{display:flex}'
    + '.dsig-modal{background:#fff;border-radius:14px;padding:22px;width:100%;max-width:460px;max-height:90vh;'
    + 'overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}'
    + '.dsig-modal h3{font-size:15px;font-weight:800;color:#0F2B8C;margin-bottom:14px}'
    + '.dsig-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}'
    + '.dsig-field{margin-bottom:12px}'
    + '.dsig-field label{display:block;font-size:10px;color:#374151;font-weight:700;text-transform:uppercase;margin-bottom:4px;letter-spacing:.4px}'
    + '.dsig-field input,.dsig-field textarea,.dsig-field select{width:100%;padding:8px 10px;border:1.5px solid #d1d5db;'
    + 'border-radius:7px;font-size:12px;font-family:Inter,sans-serif;outline:none}'
    + '.dsig-field input:focus,.dsig-field textarea:focus,.dsig-field select:focus{border-color:#0F2B8C}'
    + '.dsig-field textarea{min-height:70px;resize:vertical}'
    + '.dsig-field small{display:block;font-size:10px;color:#6b7280;margin-top:3px}'
    + '.dsig-toast{position:fixed;bottom:20px;right:20px;background:#0F2B8C;color:#fff;padding:12px 18px;'
    + 'border-radius:10px;font-size:12px;font-weight:600;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,.25);'
    + 'max-width:320px;animation:dsig-slidein .25s ease}'
    + '.dsig-toast.error{background:#dc2626}'
    + '.dsig-toast.success{background:#166534}'
    + '@keyframes dsig-slidein{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}'
    + '.dsig-hash{font-family:Monaco,monospace;font-size:9px;color:#9ca3af;word-break:break-all}'
    + '.dsig-doc-meta{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:11px;margin:10px 0;padding:10px;background:#f9fafb;border-radius:8px}'
    + '.dsig-doc-meta dt{font-weight:700;color:#374151}'
    + '.dsig-doc-meta dd{color:#0F2B8C}';
  var s = document.createElement('style');
  s.id = 'dsig-styles';
  s.textContent = css;
  document.head.appendChild(s);
}

// ─── STATE ─────────────────────────────────────────────────────────────
var DSig = {
  portal: null,            // 'pmam' | 'ic' | 'ms' | 'admin'
  user:   null,            // { email, name, role, ward }
  docs:   [],              // all leave_requests with signEnabled === true
  users:  [],              // cached users collection
  inboxSection: null,      // DOM ref to inbox section
  inboxNav:     null,      // DOM ref to inbox sidebar item
  badgeEl:      null,      // DOM ref to badge inside nav
  unsubDocs: null,
  unsubUsers: null
};

// ─── INIT ──────────────────────────────────────────────────────────────
DSig.init = function(opts){
  opts = opts || {};
  DSig.portal = opts.portal || 'pmam';
  injectStyles();
  // Read session: prefer host's getPmjayUser(), else read sessionStorage directly.
  if (typeof getPmjayUser === 'function') {
    DSig.user = getPmjayUser();
  } else {
    try { DSig.user = JSON.parse(sessionStorage.getItem('pmjay_user') || '{}'); }
    catch(e){ DSig.user = {}; }
  }
  if (!DSig.user || !DSig.user.email) {
    console.warn('[DSig] No session — module idle');
    return;
  }
  console.log('[DSig] Init for portal:', DSig.portal, '· user:', DSig.user.email);

  DSig.mountSidebarItem();
  DSig.mountInboxSection();
  DSig.subscribeUsers();
  DSig.subscribeDocs();
};

// ─── SIDEBAR ITEM ──────────────────────────────────────────────────────
DSig.mountSidebarItem = function(){
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) { console.warn('[DSig] .sidebar not found — cannot mount nav'); return; }
  if (document.getElementById('dsig-nav')) return;

  var item = document.createElement('div');
  item.className = 'sbi';
  item.id = 'dsig-nav';
  item.title = 'Signature Inbox';
  item.onclick = function(){ DSig.openInbox(item); };
  item.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>'
    + '<div class="sbl">Sign Inbox<span class="dsig-badge" id="dsig-badge" style="display:none">0</span></div>';
  sidebar.appendChild(item);
  DSig.inboxNav = item;
  DSig.badgeEl = item.querySelector('#dsig-badge');
};

// ─── INBOX SECTION ─────────────────────────────────────────────────────
DSig.mountInboxSection = function(){
  var content = document.querySelector('.content');
  if (!content) { console.warn('[DSig] .content not found'); return; }
  if (document.getElementById('sec-dsigInbox')) return;

  var sec = document.createElement('div');
  sec.className = 'sec';
  sec.id = 'sec-dsigInbox';
  sec.innerHTML =
    '<div style="margin-bottom:16px">'
    + '<div style="font-size:18px;font-weight:800;color:#0F2B8C">Signature Inbox</div>'
    + '<div style="font-size:11px;color:#6b7280;margin-top:2px">Documents awaiting your digital signature, plus your sent/archived items.</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap" id="dsig-tabs">'
    +   '<button class="dsig-btn dsig-btn-sign" data-tab="pending">Pending My Action <span id="dsig-tabcount-pending" class="dsig-badge" style="display:none;background:#fff;color:#dc2626">0</span></button>'
    +   '<button class="dsig-btn dsig-btn-view" data-tab="initiated">I Initiated</button>'
    +   '<button class="dsig-btn dsig-btn-view" data-tab="archive">Signed Archive</button>'
    + '</div>'
    + '<div id="dsig-list"></div>';
  content.appendChild(sec);
  DSig.inboxSection = sec;

  sec.querySelectorAll('#dsig-tabs button').forEach(function(b){
    b.addEventListener('click', function(){
      sec.querySelectorAll('#dsig-tabs button').forEach(function(x){ x.classList.remove('dsig-btn-sign'); x.classList.add('dsig-btn-view'); });
      b.classList.remove('dsig-btn-view'); b.classList.add('dsig-btn-sign');
      DSig.renderInbox(b.dataset.tab);
    });
  });
};

DSig.openInbox = function(navEl){
  if (typeof goSec === 'function') {
    goSec('dsigInbox', navEl);
  } else {
    document.querySelectorAll('.sec').forEach(function(s){ s.classList.remove('active'); });
    DSig.inboxSection.classList.add('active');
    document.querySelectorAll('.sbi').forEach(function(s){ s.classList.remove('active'); });
    navEl.classList.add('active');
  }
  DSig.renderInbox('pending');
};

// ─── FIRESTORE SUBSCRIPTIONS ───────────────────────────────────────────
DSig.subscribeUsers = function(){
  if (DSig.unsubUsers) DSig.unsubUsers();
  DSig.unsubUsers = db.collection('users').onSnapshot(function(snap){
    DSig.users = [];
    snap.forEach(function(d){ DSig.users.push(Object.assign({id:d.id}, d.data())); });
    console.log('[DSig] Users cached:', DSig.users.length);
  }, function(err){ console.error('[DSig] users listener:', err); });
};

DSig.subscribeDocs = function(){
  if (DSig.unsubDocs) DSig.unsubDocs();
  // Listen to ALL leave_requests with signEnabled === true.
  // Filtering per user happens client-side to avoid composite-index requirements
  // (same pattern as the existing fetchPmamLeaves in pmam_portal).
  DSig.unsubDocs = db.collection('leave_requests')
    .where('signEnabled', '==', true)
    .onSnapshot(function(snap){
      DSig.docs = [];
      snap.forEach(function(d){ DSig.docs.push(Object.assign({id:d.id}, d.data())); });
      DSig.docs.sort(function(a,b){ return (b.timestamp||0) - (a.timestamp||0); });
      DSig.refreshBadge();
      // Re-render inbox if currently open
      if (DSig.inboxSection && DSig.inboxSection.classList.contains('active')) {
        var activeTab = DSig.inboxSection.querySelector('#dsig-tabs button.dsig-btn-sign');
        DSig.renderInbox(activeTab ? activeTab.dataset.tab : 'pending');
      }
    }, function(err){ console.error('[DSig] docs listener:', err); });
};

// ─── ROLE HELPERS ──────────────────────────────────────────────────────
DSig.findUserByName = function(name){
  if (!name) return null;
  var n = name.trim().toLowerCase();
  return DSig.users.find(function(u){ return (u.name||'').trim().toLowerCase() === n; }) || null;
};
DSig.findUserByRole = function(role){
  return DSig.users.find(function(u){ return u.role === role && u.status !== 'rejected'; }) || null;
};
DSig.isMyTurn = function(d){
  if (!d.signEnabled || d.signStatus !== 'pending') return false;
  var stage = (d.chain || [])[d.currentStage];
  return stage && stage.email && stage.email.toLowerCase() === (DSig.user.email||'').toLowerCase();
};

// ─── BUILD CHAIN AT SUBMIT TIME ────────────────────────────────────────
DSig.buildLeaveChain = function(leaveReq){
  // leaveReq = {name, email, duty, ...}
  // Role stages are resolved against the users collection. If no user exists
  // for an OPTIONAL role (e.g. Medical Superintendent not yet created), that
  // stage is skipped gracefully. Once the user is created, future leaves will
  // automatically include that stage — no code change or redeploy needed.
  var chain = [];
  var stageCounter = 0;
  for (var i=0; i<LEAVE_CHAIN_DEF.length; i++) {
    var def = LEAVE_CHAIN_DEF[i];
    var resolved = null;
    if (def.source === 'applicant') {
      resolved = { email: leaveReq.email, name: leaveReq.name };
    } else if (def.source === 'substitute') {
      var sub = DSig.findUserByName(leaveReq.duty);
      if (!sub) throw new Error('Substitute PMAM "'+leaveReq.duty+'" not found in users collection. Admin must add them first.');
      resolved = { email: sub.email, name: sub.name };
    } else if (def.source === 'role') {
      var byRole = DSig.findUserByRole(def.role);
      if (!byRole) {
        if (def.optional) {
          // Skip this stage — user for this role doesn't exist yet
          console.warn('[DSig] Optional role "'+def.role+'" has no user — skipping this stage for now.');
          continue;
        }
        throw new Error('No user found for required role: ' + def.role + '. Admin must assign someone first.');
      }
      resolved = { email: byRole.email, name: byRole.name };
    }
    chain.push({
      stage:    stageCounter++,   // renumber sequentially after any skips
      role:     def.role,
      label:    def.label,
      email:    resolved.email,
      name:     resolved.name,
      signed:   false,
      signedAt: null,
      signatureHash: null,
      remarks:  ''
    });
  }
  return chain;
};

// ─── RENDER BADGE ──────────────────────────────────────────────────────
DSig.refreshBadge = function(){
  var count = DSig.docs.filter(DSig.isMyTurn).length;
  if (!DSig.badgeEl) return;
  if (count > 0) {
    DSig.badgeEl.textContent = count;
    DSig.badgeEl.style.display = 'inline-block';
  } else {
    DSig.badgeEl.style.display = 'none';
  }
  // Also update tab counter
  var tc = document.getElementById('dsig-tabcount-pending');
  if (tc) {
    if (count > 0) { tc.textContent = count; tc.style.display = 'inline-block'; }
    else tc.style.display = 'none';
  }
};

// ─── RENDER INBOX LIST ─────────────────────────────────────────────────
DSig.renderInbox = function(tab){
  var list = document.getElementById('dsig-list');
  if (!list) return;
  var me = (DSig.user.email||'').toLowerCase();
  var filtered = [];
  if (tab === 'pending') {
    filtered = DSig.docs.filter(DSig.isMyTurn);
  } else if (tab === 'initiated') {
    filtered = DSig.docs.filter(function(d){ return (d.email||'').toLowerCase() === me; });
  } else if (tab === 'archive') {
    filtered = DSig.docs.filter(function(d){
      if (d.signStatus !== 'signed' && d.signStatus !== 'rejected') return false;
      // I'm in the archive only if I'm in the chain
      return (d.chain||[]).some(function(s){ return (s.email||'').toLowerCase() === me; });
    });
  }
  if (filtered.length === 0) {
    var emptyMsg = tab==='pending'
      ? '<span class="ico">✓</span>All caught up — nothing pending your signature.'
      : tab==='initiated'
        ? '<span class="ico">📤</span>You haven\'t initiated any digital-signature documents yet.'
        : '<span class="ico">◫</span>No completed documents yet.';
    list.innerHTML = '<div class="dsig-card"><div class="dsig-empty">'+emptyMsg+'</div></div>';
    return;
  }
  list.innerHTML = filtered.map(DSig.docCard).join('');
};

// ─── DOC CARD ──────────────────────────────────────────────────────────
DSig.docCard = function(d){
  var stages = (d.chain||[]).map(function(s,i){
    var cls = 'future', tick = '';
    if (s.signed) { cls = 'done'; tick = '✓'; }
    else if (i === d.currentStage && d.signStatus === 'pending') { cls = 'active'; tick = '●'; }
    if (d.signStatus === 'rejected' && i === d.currentStage) { cls = 'rejected'; tick = '✗'; }
    return '<div class="dsig-stage '+cls+'">'
      + '<div class="dsig-stage-no">STAGE '+(i+1)+'</div>'
      + '<div class="dsig-stage-role">'+esc(s.label)+'</div>'
      + '<div class="dsig-stage-name">'+esc(s.name||'—')+'</div>'
      + (s.signed ? '<div class="dsig-stage-meta">'+fmtDt(s.signedAt)+'</div>' : '')
      + (s.remarks ? '<div class="dsig-stage-meta" style="font-style:italic">"'+esc(s.remarks)+'"</div>' : '')
      + '<div class="dsig-stage-tick" style="color:'+(cls==='done'?'#10b981':cls==='rejected'?'#dc2626':'#0F2B8C')+'">'+tick+'</div>'
      + '</div>';
  }).join('');

  var mine = DSig.isMyTurn(d);
  var fullySigned = d.signStatus === 'signed';
  return '<div class="dsig-card">'
    + '<div class="dsig-card-hd">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    +       '<span class="dsig-pill '+(d.signStatus||'draft')+'">'+(d.signStatus||'draft')+'</span>'
    +       '<span style="font-size:10px;color:#6b7280">Ref: <strong>'+esc(d.refNo||d.id)+'</strong></span>'
    +     '</div>'
    +     '<div class="dsig-card-title" style="margin-top:6px">Leave Application — '+esc(d.name)+' ('+esc(d.ltype||'—')+')</div>'
    +     '<div class="dsig-card-sub">'+esc(d.fromDt||'')+' to '+esc(d.toDt||'')+' · '+esc(d.days||'')+' day(s) · '+fmtDt(d.timestamp)+'</div>'
    +   '</div>'
    +   '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    +     '<button class="dsig-btn dsig-btn-view" onclick="DSig.viewDoc(\''+d.id+'\')">View</button>'
    +     (mine ? '<button class="dsig-btn dsig-btn-sign" onclick="DSig.openSignModal(\''+d.id+'\')">✎ Sign</button>' : '')
    +     (fullySigned ? '<button class="dsig-btn dsig-btn-approve" onclick="DSig.downloadPdf(\''+d.id+'\')">⬇ PDF</button>' : '')
    +   '</div>'
    + '</div>'
    + '<div class="dsig-pipeline">'+stages+'</div>'
    + '</div>';
};

// ─── PUBLIC: INITIATE SIGNED LEAVE ─────────────────────────────────────
// Called from pmam_portal.js submitLeave() when checkbox is ticked.
// Returns a promise.
DSig.initiateSignedLeave = function(leaveReq, pin){
  if (!CryptoJS) return Promise.reject(new Error('CryptoJS not loaded'));
  if (!pin || pin.length < 4) return Promise.reject(new Error('PIN must be at least 4 digits'));

  var chain;
  try { chain = DSig.buildLeaveChain(leaveReq); }
  catch (e) { return Promise.reject(e); }

  // Generate ref number
  var yr = new Date().getFullYear();
  var refNo = 'LV/PMAM/'+yr+'/'+Date.now().toString(36).toUpperCase();

  // Compute content hash of immutable fields
  var contentHash = sha256([leaveReq.name, leaveReq.email, leaveReq.ltype, leaveReq.fromDt, leaveReq.toDt, leaveReq.duty, leaveReq.reason, refNo].join('|'));

  // PIN hashing: store hash on the user doc IF not already set, otherwise verify
  return DSig.ensurePinForApplicant(pin).then(function(){
    // Sign stage 0 (applicant) immediately
    var pinHash = sha256(pin);
    chain[0].signed = true;
    chain[0].signedAt = Date.now();
    chain[0].signatureHash = sha256(contentHash + leaveReq.email + pinHash + chain[0].signedAt);
    chain[0].remarks = 'Self-signed at submission';

    var full = Object.assign({}, leaveReq, {
      signEnabled: true,
      refNo: refNo,
      contentHash: contentHash,
      chain: chain,
      currentStage: 1,        // advance to substitute
      signStatus: 'pending',
      timestamp: Date.now()
    });
    return db.collection('leave_requests').add(full).then(function(ref){
      console.log('[DSig] Signed leave initiated:', ref.id, 'refNo:', refNo);
      return { id: ref.id, refNo: refNo };
    });
  });
};

// PIN bootstrap: stored on users/{email}.signPinHash. First time = set, after = verify.
DSig.ensurePinForApplicant = function(pin){
  return DSig.ensurePinForUser(DSig.user.email, pin);
};

DSig.ensurePinForUser = function(email, pin){
  if (!email) return Promise.reject(new Error('No email'));
  var pinHash = sha256(pin);
  // Find user doc by email
  var u = DSig.users.find(function(x){ return (x.email||'').toLowerCase() === email.toLowerCase(); });
  if (!u) return Promise.reject(new Error('User not found in users collection: '+email));
  if (u.signPinHash) {
    if (u.signPinHash !== pinHash) return Promise.reject(new Error('Incorrect PIN'));
    return Promise.resolve();
  }
  // First-time: set it
  return db.collection('users').doc(u.id).set({signPinHash: pinHash}, {merge:true}).then(function(){
    u.signPinHash = pinHash;
    console.log('[DSig] PIN set for', email);
  });
};

// ─── SIGN MODAL ────────────────────────────────────────────────────────
DSig.openSignModal = function(docId){
  var d = DSig.docs.find(function(x){ return x.id === docId; });
  if (!d || !DSig.isMyTurn(d)) return;
  var stage = d.chain[d.currentStage];

  var modal = document.getElementById('dsig-sign-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dsig-sign-modal';
    modal.className = 'dsig-modal-bg';
    modal.innerHTML = '<div class="dsig-modal"><h3 id="dsig-sm-title">Sign Document</h3>'
      + '<div id="dsig-sm-body"></div>'
      + '<div class="dsig-field"><label>Enter your PIN to sign</label>'
      +   '<input type="password" id="dsig-sm-pin" maxlength="6" autocomplete="off" placeholder="4–6 digits">'
      +   '<small>First-time signers: any PIN entered here becomes your permanent signing PIN.</small>'
      + '</div>'
      + '<div class="dsig-field"><label>Remarks (optional, required if rejecting)</label>'
      +   '<textarea id="dsig-sm-remarks" placeholder="e.g. Approved / Forwarded"></textarea>'
      + '</div>'
      + '<div class="dsig-modal-actions">'
      +   '<button class="dsig-btn dsig-btn-view" onclick="DSig.closeSignModal()">Cancel</button>'
      +   '<button class="dsig-btn dsig-btn-reject" onclick="DSig.rejectDoc()">✗ Reject</button>'
      +   '<button class="dsig-btn dsig-btn-approve" onclick="DSig.confirmSign()">✓ Sign & Forward</button>'
      + '</div></div>';
    document.body.appendChild(modal);
  }

  document.getElementById('dsig-sm-title').textContent = 'Sign as ' + stage.label;
  document.getElementById('dsig-sm-body').innerHTML = '<div class="dsig-doc-meta">'
    + '<dt>Applicant</dt><dd>'+esc(d.name)+'</dd>'
    + '<dt>Leave Type</dt><dd>'+esc(d.ltype)+'</dd>'
    + '<dt>From → To</dt><dd>'+esc(d.fromDt)+' → '+esc(d.toDt)+'</dd>'
    + '<dt>Days</dt><dd>'+esc(d.days)+'</dd>'
    + '<dt>Reason</dt><dd>'+esc(d.reason)+'</dd>'
    + '<dt>Ref No.</dt><dd>'+esc(d.refNo)+'</dd>'
    + '</div>'
    + '<div class="dsig-hash">Hash: '+esc((d.contentHash||'').slice(0,40))+'…</div>';
  document.getElementById('dsig-sm-pin').value = '';
  document.getElementById('dsig-sm-remarks').value = '';
  DSig._signingDoc = d;
  modal.classList.add('open');
};

DSig.closeSignModal = function(){
  var m = document.getElementById('dsig-sign-modal');
  if (m) m.classList.remove('open');
};

DSig.confirmSign = function(){
  var d = DSig._signingDoc;
  if (!d) return;
  var pin = document.getElementById('dsig-sm-pin').value.trim();
  var remarks = document.getElementById('dsig-sm-remarks').value.trim();
  if (!pin) return DSig.toast('Enter your PIN', 'error');
  DSig.ensurePinForUser(DSig.user.email, pin).then(function(){
    var stage = d.chain[d.currentStage];
    stage.signed = true;
    stage.signedAt = Date.now();
    stage.remarks = remarks;
    stage.signatureHash = sha256(d.contentHash + DSig.user.email + sha256(pin) + stage.signedAt);
    var newStage = d.currentStage + 1;
    var done = newStage >= d.chain.length;
    var patch = {
      chain: d.chain,
      currentStage: newStage,
      signStatus: done ? 'signed' : 'pending',
      lastSignedAt: Date.now()
    };
    // Mirror to legacy 'status' field for backward compat with old admin UI
    if (done) patch.status = 'Approved';
    return db.collection('leave_requests').doc(d.id).update(patch).then(function(){
      DSig.closeSignModal();
      DSig.toast(done ? 'Document fully signed!' : 'Signed and forwarded to next stage', 'success');
    });
  }).catch(function(e){
    DSig.toast(e.message, 'error');
  });
};

DSig.rejectDoc = function(){
  var d = DSig._signingDoc;
  if (!d) return;
  var pin = document.getElementById('dsig-sm-pin').value.trim();
  var remarks = document.getElementById('dsig-sm-remarks').value.trim();
  if (!pin) return DSig.toast('Enter your PIN to confirm rejection', 'error');
  if (!remarks) return DSig.toast('Rejection reason required in remarks', 'error');
  DSig.ensurePinForUser(DSig.user.email, pin).then(function(){
    var stage = d.chain[d.currentStage];
    stage.remarks = '[REJECTED] ' + remarks;
    stage.signedAt = Date.now();
    var patch = {
      chain: d.chain,
      signStatus: 'rejected',
      status: 'Rejected',
      remark: remarks,
      lastSignedAt: Date.now()
    };
    return db.collection('leave_requests').doc(d.id).update(patch).then(function(){
      DSig.closeSignModal();
      DSig.toast('Document rejected', 'success');
    });
  }).catch(function(e){
    DSig.toast(e.message, 'error');
  });
};

// ─── VIEW (read-only preview) ──────────────────────────────────────────
DSig.viewDoc = function(id){
  var d = DSig.docs.find(function(x){ return x.id === id; });
  if (!d) return;
  // Reuse the same letterhead the existing printLeaveForm uses
  DSig.openLetterheadPreview(d);
};

DSig.openLetterheadPreview = function(d){
  if (typeof GMCHeaders === 'undefined' || !GMCHeaders.abpmjayReport) {
    return DSig.toast('Letterhead engine not loaded', 'error');
  }
  var w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) return DSig.toast('Popup blocked — allow popups for this site', 'error');
  w.document.write(DSig.buildLetterheadHTML(d, false));
  w.document.close();
};

// ─── LETTERHEAD HTML (matches existing printLeaveForm exactly) ─────────
DSig.buildLetterheadHTML = function(d, forPdfId){
  var todayStr = new Date(d.timestamp || Date.now()).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  var fmtD = function(s){ if(!s) return '—'; var p=s.split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : s; };
  var dLabel = '';
  if (d.days) dLabel += d.days + ' day(s)';
  if (d.fromDt && d.toDt) dLabel += ' ('+fmtD(d.fromDt)+' to '+fmtD(d.toDt)+')';
  if (!dLabel) dLabel = '—';

  // Signatures — show name + "Digitally signed" stamp only after signing
  function sigBox(stageIdx, fixedLabel){
    var s = d.chain[stageIdx] || {};
    // Look up the signer's stored signature image from the users collection
    var signerUser = s.signed ? DSig.users.find(function(u){ return (u.email||'').toLowerCase() === (s.email||'').toLowerCase(); }) : null;
    var sigImage = signerUser ? signerUser.signatureImage : null;
    var rejected = (s.remarks||'').indexOf('[REJECTED]') === 0;
    var sigHtml;
    if (s.signed) {
      if (rejected) {
        sigHtml = '<div style="border:1.5px solid #dc2626;color:#dc2626;display:inline-block;padding:3px 8px;font-size:8pt;font-weight:700;letter-spacing:1px;transform:rotate(-3deg);margin-bottom:3px">REJECTED</div>'
          + '<div style="font-size:8.5pt;color:#444;margin-top:2px">'+fmtDt(s.signedAt)+'</div>'
          + '<div style="font-size:8pt;font-style:italic;margin-top:2px;color:#444">'+esc(s.remarks)+'</div>';
      } else if (sigImage) {
        // Pasted real signature + tiny timestamp underneath
        sigHtml = '<img src="'+sigImage+'" alt="Signature" style="max-height:18mm;max-width:55mm;display:block;margin:0 auto 2px">'
          + '<div style="font-size:7.5pt;color:#666">Digitally signed · '+fmtDt(s.signedAt)+'</div>'
          + (s.remarks ? '<div style="font-size:8pt;font-style:italic;margin-top:2px;color:#444">"'+esc(s.remarks)+'"</div>' : '');
      } else {
        // Fallback: text stamp if no signature image uploaded by admin
        sigHtml = '<div style="border:1.5px solid #166534;color:#166534;display:inline-block;padding:3px 8px;font-size:8pt;font-weight:700;letter-spacing:1px;transform:rotate(-3deg);margin-bottom:3px">DIGITALLY SIGNED</div>'
          + '<div style="font-size:8.5pt;color:#444;margin-top:2px">'+fmtDt(s.signedAt)+'</div>'
          + (s.remarks ? '<div style="font-size:8pt;font-style:italic;margin-top:2px;color:#444">"'+esc(s.remarks)+'"</div>' : '');
      }
    } else {
      sigHtml = '<div style="height:20mm"></div>';
    }
    return '<div class="sig-box">'+sigHtml+'<div class="sig-label">'+fixedLabel+'</div><div class="sig-desig">'+esc(s.name||'')+'</div></div>';
  }

  // Find a chain stage by role (robust to skipped/optional stages like MS).
  // For PMAM (used twice), pass the chain label to disambiguate applicant vs substitute.
  // Returns the stage index, or -1 if that role isn't in the chain.
  function stageIdxByRole(role, chainLabel){
    for (var k=0; k<d.chain.length; k++){
      if (d.chain[k].role === role && (!chainLabel || d.chain[k].label === chainLabel)) return k;
    }
    return -1;
  }

  // Render a signature box. `chainLabel` matches the stored chain stage label;
  // `displayLabel` is what prints under the signature line.
  function sigBoxByRole(role, chainLabel, displayLabel){
    var idx = stageIdxByRole(role, chainLabel);
    if (idx === -1) {
      return '<div class="sig-box"><div style="height:20mm"></div><div class="sig-label">'+displayLabel+'</div><div class="sig-desig">GMC &amp; AH, Rajouri</div></div>';
    }
    return sigBox(idx, displayLabel);
  }

  var bodyHTML = ''
    + '<div class="date-row"><strong>Date:</strong> '+todayStr+'</div>'
    + '<table><tbody>'
    +   '<tr><td class="lbl">Name of the Official</td><td>'+esc(d.name)+'</td></tr>'
    +   '<tr><td class="lbl">Designation</td><td>'+esc(d.desig||'PMAM')+'</td></tr>'
    +   '<tr><td class="lbl">Ward / Unit</td><td>'+esc(d.ward||'')+'</td></tr>'
    +   '<tr><td class="lbl">Reason for Leave</td><td>'+esc(d.reason||'')+'</td></tr>'
    +   '<tr><td class="lbl">Type of Leave</td><td>'+esc(d.ltype||'')+'</td></tr>'
    +   '<tr><td class="lbl">Total Days Requested</td><td>'+dLabel+'</td></tr>'
    +   '<tr><td class="lbl">Return Date</td><td>'+fmtD(d.ret)+'</td></tr>'
    +   '<tr><td class="lbl">Duty Assigned To</td><td>'+esc(d.duty||'')+'</td></tr>'
    + '</tbody></table>'
    + '<p class="undertaking">I hereby undertake that during his/her leave period, I shall assume full responsibility for all duties, work, and responsibilities assigned to him/her.</p>'
    + '<div class="sig-row">'
    +   sigBoxByRole('PMAM', 'Applicant PMAM', 'Signature of Applicant - PMAM')
    +   sigBoxByRole('PMAM', 'Substitute PMAM', 'Signature of Substitute PMAM')
    + '</div>'
    + '<div class="sig-row" style="margin-top:8mm">'
    +   sigBoxByRole('I/C AB-PMJAY', 'I/C AB-PMJAY', 'I/C AB-PMJAY')
    +   sigBoxByRole('Medical Superintendent', 'Medical Superintendent', 'Medical Superintendent')
    + '</div>'
    + '<div class="print-footer">'
    +   '<span class="footer-brand">Computer generated leave application. | Ref: '+esc(d.refNo)+' | Digitally signed via MIS AB-PMJAY GMCR</span>'
    + '</div>'
    + (forPdfId ? '<div id="'+forPdfId+'-qr" style="position:absolute;bottom:8mm;right:10mm;width:20mm;height:20mm"></div>' : '');

  var headerHTML = '';
  try {
    headerHTML = GMCHeaders.abpmjayReport({ title:'LEAVE APPLICATION FORM', editable:false, orientation:'portrait' });
  } catch(e) { headerHTML = '<div style="text-align:center;font-weight:bold;font-size:14pt;padding:10mm 0">LEAVE APPLICATION FORM</div>'; }

  var baseHref = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+esc(d.refNo||'Leave Application')+'</title>'
    + '<base href="'+baseHref+'">'
    + '<link rel="stylesheet" href="shared/headers.css?v=6">'
    + '<script src="shared/logos.js?v=6"><\/script>'
    + '<style>'
    +   '*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}'
    +   'body{font-family:Tahoma,Verdana,Arial,sans-serif;background:#fff;font-size:12pt;color:#111}'
    +   '.page-wrap{padding:5mm 14mm 6mm;max-width:210mm;margin:0 auto;position:relative}'
    +   '.page-body{margin-top:3mm}'
    +   '.date-row{text-align:right;font-size:11pt;margin-bottom:3mm;color:#444}'
    +   'table{width:100%;border-collapse:separate;border-spacing:0;font-size:12pt;border:2px solid #1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:3mm}'
    +   'tbody tr:nth-child(even){background:#f7f8fc}'
    +   'tbody tr:nth-child(odd){background:#fff}'
    +   'td{padding:4px 10px;border-bottom:1px solid #dde2ee;vertical-align:middle}'
    +   'tbody tr:last-child td{border-bottom:none}'
    +   '.lbl{font-weight:700;width:60mm;background:#eaf0ff;color:#1a3db5}'
    +   '.undertaking{font-size:11pt;font-style:italic;border-left:3px solid #1a3db5;padding:6px 12px;background:#f7f8fc;margin:3mm 0}'
    +   '.sig-row{display:flex;justify-content:space-between;gap:20mm;margin-top:6mm}'
    +   '.sig-box{flex:1;text-align:center}'
    +   '.sig-label{font-size:11pt;font-weight:700;margin-top:2mm;color:#000;padding-top:1.5mm;position:relative}'
    +   '.sig-label::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:60mm;max-width:75%;border-top:1px solid #888}'
    +   '.sig-desig{font-size:10pt;color:#444;margin-top:1mm}'
    +   '.print-footer{margin-top:10mm;text-align:center;font-size:9pt;color:#666;border-top:1px solid #ccc;padding-top:3mm}'
    +   '.section-title{font-weight:700;font-size:11pt;margin:3mm 0 2mm;color:#1a3db5}'
    + '</style></head><body>'
    + '<div class="page-wrap">'+headerHTML+'<div class="page-body">'+bodyHTML+'</div></div>'
    + '<script>setTimeout(function(){window.print();},700);<\/script>'
    + '</body></html>';
};

// ─── PDF DOWNLOAD (uses html2canvas + jsPDF if present) ────────────────
DSig.downloadPdf = function(id){
  var d = DSig.docs.find(function(x){ return x.id === id; });
  if (!d) return;
  // Simplest implementation: open the print preview (same as view).
  // The user can "Save as PDF" from the browser's print dialog.
  DSig.openLetterheadPreview(d);
  DSig.toast('Use the print dialog → Save as PDF', 'success');
};

// ─── TOAST ─────────────────────────────────────────────────────────────
DSig.toast = function(msg, type){
  var t = document.createElement('div');
  t.className = 'dsig-toast ' + (type||'');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){ t.remove(); }, 300); }, 3000);
};

// ─── ADMIN VERIFY (tamper detection) ───────────────────────────────────
// Recomputes content hash from current Firestore values and compares to
// the hash stored at signing time. Returns a detailed report.
// Usage from browser console (when logged in as admin):
//   DSig.verifyDocument('LV/PMAM/2026/LMXYZABC').then(console.log)
DSig.verifyDocument = function(refNoOrId){
  return db.collection('leave_requests').get().then(function(snap){
    var found = null;
    snap.forEach(function(doc){
      var d = Object.assign({id:doc.id}, doc.data());
      if (d.refNo === refNoOrId || d.id === refNoOrId) found = d;
    });
    if (!found) return { ok:false, error:'Document not found: '+refNoOrId };
    if (!found.signEnabled) return { ok:false, error:'Document is not digitally signed' };

    var recomputed = sha256([found.name, found.email, found.ltype, found.fromDt, found.toDt, found.duty, found.reason, found.refNo].join('|'));
    var match = recomputed === found.contentHash;
    var signedStages = (found.chain || []).filter(function(s){ return s.signed; });
    var pendingStages = (found.chain || []).filter(function(s){ return !s.signed; });

    return {
      ok: match,
      refNo: found.refNo,
      status: found.signStatus,
      tampered: !match,
      message: match
        ? 'AUTHENTIC — content hash matches signature'
        : 'TAMPERED — document content has been modified since signing!',
      storedHash: found.contentHash,
      recomputedHash: recomputed,
      signedBy: signedStages.map(function(s){ return s.name + ' ('+s.label+') at '+fmtDt(s.signedAt); }),
      pendingFrom: pendingStages.map(function(s){ return s.name + ' ('+s.label+')'; })
    };
  });
};

// ─── ADMIN: SIGNATURE IMAGE MANAGEMENT ─────────────────────────────────
// These let an admin upload/update/delete a signer's signature image,
// which gets pasted onto signed letterheads in place of the text stamp.
// Stored as base64 PNG inside users/{id}.signatureImage.
//
// Usage from admin portal:
//   DSig.adminUploadSignature(userId, fileInputElement).then(...)
//   DSig.adminDeleteSignature(userId).then(...)
//   DSig.adminListSignatures()  // returns array of {userId, name, role, hasSignature}
//
// SECURITY: The signature IMAGE is a visual aid only. Tampering with it
// does NOT forge a valid digital signature — the PIN+SHA256 hash stored
// on each chain stage is the actual proof of identity.

DSig.adminUploadSignature = function(userId, fileInput){
  return new Promise(function(resolve, reject){
    var file = fileInput.files && fileInput.files[0];
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.startsWith('image/')) return reject(new Error('Must be an image file'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error('Image must be under 2MB'));
    var u = DSig.users.find(function(x){ return x.id === userId; });
    if (!u) return reject(new Error('User not found'));

    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        // Resize to max 400×150 (keeps Firestore docs small, fits letterhead box)
        var canvas = document.createElement('canvas');
        var maxW = 400, maxH = 150;
        var ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL('image/png');
        db.collection('users').doc(userId).set({signatureImage: base64}, {merge:true}).then(function(){
          console.log('[DSig] Signature uploaded for', u.name);
          resolve({userId: userId, name: u.name});
        }).catch(reject);
      };
      img.onerror = function(){ reject(new Error('Could not decode image')); };
      img.src = e.target.result;
    };
    reader.onerror = function(){ reject(new Error('Could not read file')); };
    reader.readAsDataURL(file);
  });
};

DSig.adminDeleteSignature = function(userId){
  return db.collection('users').doc(userId).update({
    signatureImage: firebase.firestore.FieldValue.delete()
  });
};

DSig.adminListSignatures = function(){
  return DSig.users.filter(function(u){
    return u.role === 'PMAM' || u.role === 'I/C AB-PMJAY' || u.role === 'Medical Superintendent';
  }).map(function(u){
    return {
      userId: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      hasSignature: !!u.signatureImage,
      signatureImage: u.signatureImage || null
    };
  });
};

// Convenience: render a complete admin UI section into a container element
DSig.mountAdminSignatureManager = function(containerEl){
  if (!containerEl) return;
  containerEl.innerHTML = ''
    + '<div style="background:rgba(254,243,199,0.5);border:1px solid #fcd34d;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:11px;color:#92400e;line-height:1.5">'
    +   '<strong>🔒 Note:</strong> Signature images are a visual aid only. The PIN + cryptographic hash stored separately is the actual legal proof of identity.'
    + '</div>'
    + '<div id="dsig-admin-sigs-list"></div>';
  DSig._renderAdminSigList();
};

DSig._renderAdminSigList = function(){
  var list = document.getElementById('dsig-admin-sigs-list');
  if (!list) return;
  var sigs = DSig.adminListSignatures();
  list.innerHTML = sigs.map(function(u){
    return '<div class="dsig-card">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap">'
      +   '<div style="flex:1;min-width:180px">'
      +     '<div style="font-weight:800;color:#0F2B8C;font-size:13px">'+esc(u.name)+'</div>'
      +     '<div style="font-size:11px;color:#6b7280;margin-top:2px">'+esc(u.role)+' · '+esc(u.email)+'</div>'
      +     '<div style="margin-top:6px"><span class="dsig-pill '+(u.hasSignature?'signed':'draft')+'">'+(u.hasSignature?'✓ ON FILE':'○ NOT UPLOADED')+'</span></div>'
      +   '</div>'
      +   '<div style="background:#fff;border:1.5px dashed '+(u.hasSignature?'#10b981':'#d1d5db')+';border-radius:8px;padding:8px;min-width:180px;min-height:70px;display:flex;align-items:center;justify-content:center">'
      +     (u.hasSignature ? '<img src="'+u.signatureImage+'" alt="Signature" style="max-height:55px;max-width:170px">' : '<span style="color:#9ca3af;font-size:11px;font-style:italic">No signature</span>')
      +   '</div>'
      +   '<div style="display:flex;flex-direction:column;gap:6px">'
      +     '<input type="file" id="dsig-sigup-'+u.userId+'" accept="image/*" style="display:none" onchange="DSig._handleAdminSigUpload(\''+u.userId+'\', this)">'
      +     '<button class="dsig-btn dsig-btn-sign" onclick="document.getElementById(\'dsig-sigup-'+u.userId+'\').click()">'+(u.hasSignature?'↻ Replace':'⬆ Upload')+'</button>'
      +     (u.hasSignature ? '<button class="dsig-btn dsig-btn-reject" onclick="DSig._handleAdminSigDelete(\''+u.userId+'\', \''+esc(u.name)+'\')">🗑 Delete</button>' : '')
      +   '</div>'
      + '</div>'
      + '</div>';
  }).join('');
};

DSig._handleAdminSigUpload = function(userId, input){
  DSig.adminUploadSignature(userId, input).then(function(res){
    DSig.toast('Signature saved for ' + res.name, 'success');
    setTimeout(DSig._renderAdminSigList, 300); // wait for users listener to refresh
  }).catch(function(e){
    DSig.toast(e.message, 'error');
  });
  input.value = '';
};

DSig._handleAdminSigDelete = function(userId, name){
  if (!confirm('Delete signature for ' + name + '?')) return;
  DSig.adminDeleteSignature(userId).then(function(){
    DSig.toast('Signature deleted', 'success');
    setTimeout(DSig._renderAdminSigList, 300);
  }).catch(function(e){
    DSig.toast(e.message, 'error');
  });
};

// ─── EXPOSE ────────────────────────────────────────────────────────────
global.DSig = DSig;

})(window);
