(function(global) {
  'use strict';

  var headerCSS = `
/* New Premium Header CSS - Reference Design 1:1 */
.premium-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 8px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1.5px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 99999 !important;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  height: 94px;
  box-sizing: border-box;
  margin: 0;
}

/* Left Section */
.ph-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
}
.ph-logo {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  border: 2.5px solid #2563eb;
  padding: 0;
  background: #fff;
  object-fit: cover;
  flex-shrink: 0;
}
.ph-title-block {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
}
.ph-title-top {
  color: #ea580c;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.ph-title-mid {
  color: #1e3a8a;
  font-size: 17px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}
.ph-title-bot {
  color: #1e3a8a;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

/* Vertical Divider */
.ph-divider {
  width: 1.5px;
  height: 44px;
  background: #e2e8f0;
  margin: 0 16px;
}

/* Center Section */
.ph-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
}
.ph-ribbon-bg {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 20px;
  background: linear-gradient(90deg, rgba(37,99,235,0) 0%, rgba(37,99,235,0.85) 20%, rgba(37,99,235,1) 50%, rgba(37,99,235,0.85) 80%, rgba(37,99,235,0) 100%);
  border-radius: 4px;
  z-index: 1;
}
.ph-center-emblem {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  border: 2.5px solid #2563eb;
  padding: 0;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(37,99,235,0.15);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 2px;
}
.ph-center-emblem img, .ph-center-emblem svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
.ph-portal-name {
  color: #ea580c;
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  text-transform: uppercase;
  margin-top: 3px;
}
.ph-portal-name::before {
  content: '— •';
  color: #2563eb;
  font-weight: 900;
}
.ph-portal-name::after {
  content: '• —';
  color: #2563eb;
  font-weight: 900;
}

/* Right Section */
.ph-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex: 1;
}
.ph-bell-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}
.ph-bell-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.ph-bell-icon {
  width: 22px;
  height: 22px;
  stroke: #2563eb;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ph-bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.ph-user-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px 6px 6px;
  border-radius: 35px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.ph-user-pill:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.ph-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}
.ph-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ph-user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.ph-user-name {
  color: #ea580c;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
}
.ph-user-role {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}
.ph-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.ph-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}
.ph-status-text {
  font-size: 10px;
  color: #475569;
  font-weight: 600;
}
.ph-chevron {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}
.ph-chevron svg {
  width: 14px;
  height: 14px;
  stroke: #1e3a8a;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* USER DROPDOWN MENU - COMPACT & CLEAN DESIGN */
.user-dropdown {
  position: absolute !important;
  top: calc(100% + 8px) !important;
  right: 0 !important;
  left: auto !important;
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  border: 1.5px solid #e2e8f0 !important;
  width: 240px !important;
  min-width: 240px !important;
  padding: 10px !important;
  box-sizing: border-box !important;
  display: none;
  z-index: 100000 !important;
  font-family: 'Inter', 'Segoe UI', sans-serif !important;
}
.user-dropdown.open {
  display: block !important;
  animation: phDdFade 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
@keyframes phDdFade {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Card Action Buttons (My Profile, Change Password) */
.ph-dd-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #334155;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  box-sizing: border-box;
}
.ph-dd-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.ph-dd-btn svg {
  width: 16px;
  height: 16px;
  stroke: #475569;
  stroke-width: 2;
  fill: none;
  flex-shrink: 0;
}

/* Switch Workspace Section Title */
.ph-dd-section-title {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin: 10px 0 6px 0;
  padding: 0 4px;
}

/* Workspace List & Portal Cards */
.ph-workspace-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ph-ws-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  box-sizing: border-box;
}
.ph-ws-item:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.ph-ws-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ph-ws-icon-box svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ph-ws-label {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}

/* Portal Themes */
.ph-ws-admin .ph-ws-icon-box { background: #ede9fe; }
.ph-ws-admin .ph-ws-icon-box svg { stroke: #7c3aed; }

.ph-ws-pmam .ph-ws-icon-box { background: #dcfce7; }
.ph-ws-pmam .ph-ws-icon-box svg { stroke: #16a34a; }

.ph-ws-ic .ph-ws-icon-box { background: #e0f2fe; }
.ph-ws-ic .ph-ws-icon-box svg { stroke: #2563eb; }

.ph-ws-finance .ph-ws-icon-box { background: #ffedd5; }
.ph-ws-finance .ph-ws-icon-box svg { stroke: #ea580c; }

.ph-ws-patient .ph-ws-icon-box { background: #e0f2fe; }
.ph-ws-patient .ph-ws-icon-box svg { stroke: #0284c7; }

/* Sign Out Button (Bottom Red Card) */
.ph-dd-signout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 8px 12px;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 700;
  width: 100%;
  box-sizing: border-box;
}
.ph-dd-signout-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
.ph-dd-signout-btn svg {
  width: 16px;
  height: 16px;
  stroke: #ef4444;
  stroke-width: 2.2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

/* Modals Overlay Styling */
.ph-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100001 !important;
  font-family: 'Inter', sans-serif;
  padding: 20px;
}
.ph-modal-overlay.open {
  display: flex !important;
  animation: phModalFade 0.2s ease-out;
}
@keyframes phModalFade {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.ph-modal-card {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
}
.ph-modal-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ph-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
}
.ph-input-group {
  margin-bottom: 14px;
}
.ph-input-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}
.ph-input-group input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
}
.ph-input-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
}
.ph-input-readonly {
  background: #f1f5f9 !important;
  color: #64748b !important;
  cursor: not-allowed !important;
}
.ph-modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.ph-btn-cancel {
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.ph-btn-save {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 900px) {
  .premium-header-bar {
    flex-direction: column;
    gap: 14px;
    height: auto;
  }
  .ph-center {
    order: -1;
  }
  .ph-ribbon-bg {
    width: 100%;
  }
  .ph-divider {
    display: none;
  }
}
`;

  // Standard PM-JAY SVG Logo
  var pmjaySVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <circle cx="50" cy="50" r="48" fill="#fff"/>
      <path d="M50 10 A40 40 0 1 1 49.9 10" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="50" y="24" text-anchor="middle" font-size="8" fill="#1e3a8a" font-weight="bold" font-family="Arial">Ayushman Bharat</text>
      <!-- Lotus/Leaves abstraction -->
      <path d="M50 35 C40 45, 35 55, 50 65 C65 55, 60 45, 50 35 Z" fill="#16a34a"/>
      <path d="M50 35 C45 35, 40 45, 50 55 C60 45, 55 35, 50 35 Z" fill="#ea580c"/>
      <text x="50" y="80" text-anchor="middle" font-size="10" fill="#1e3a8a" font-weight="bold" font-family="Arial">PM-JAY</text>
    </svg>
  `;

  function initHeader() {
    // Inject CSS
    if (!document.getElementById('portal-header-css')) {
      var style = document.createElement('style');
      style.id = 'portal-header-css';
      style.textContent = headerCSS;
      document.head.appendChild(style);
    }

    var mounts = document.querySelectorAll('#portal-header-mount');
    mounts.forEach(function(mount) {
      var title = mount.getAttribute('data-title') || 'PORTAL';

      // Fast zero-latency cached logo retrieval
      var cachedLogo1 = localStorage.getItem('gmc_logo1');
      var cachedLogo2 = localStorage.getItem('gmc_logo2');

      var defaultGmcLogo = (global.GMCLogos && global.GMCLogos.gmc) 
        ? global.GMCLogos.gmc 
        : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><circle cx="32.5" cy="32.5" r="32.5" fill="%231e3a8a"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-weight="bold" font-size="14" font-family="sans-serif">GMC</text></svg>';
      
      var initialGmcLogo = cachedLogo1 || defaultGmcLogo;

      var defaultPmjayLogo = (global.GMCLogos && global.GMCLogos.pmjay) 
        ? '<img src="' + global.GMCLogos.pmjay + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">' 
        : pmjaySVG;
      
      var initialCenterLogo = cachedLogo2 
        ? '<img src="' + cachedLogo2 + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">' 
        : defaultPmjayLogo;

      // Infer role from title default
      var defaultRole = 'PMAM';
      if (title.indexOf('I/C') !== -1 || title.indexOf('INCHARGE') !== -1) defaultRole = 'INCHARGE AB-PMJAY';
      else if (title.indexOf('FINANCE') !== -1) defaultRole = 'FINANCE';
      else if (title.indexOf('CLAIMS') !== -1) defaultRole = 'CLAIMS';
      else if (title.indexOf('ADMIN') !== -1) defaultRole = 'ADMIN';
      else if (title.indexOf('PATIENT') !== -1) defaultRole = 'PATIENT SERVICES';

      // Current page path detection
      var path = window.location.pathname.toLowerCase();
      var isAdmin = path.indexOf('admin') !== -1 || title.indexOf('ADMIN') !== -1;
      var isPmam = path.indexOf('pmam') !== -1 || title.indexOf('PMAM') !== -1;
      var isIc = path.indexOf('ic_') !== -1 || path.indexOf('incharge') !== -1 || title.indexOf('I/C') !== -1;
      var isFinance = path.indexOf('finance') !== -1 || title.indexOf('FINANCE') !== -1;
      var isPatient = path.indexOf('patient') !== -1 || title.indexOf('PATIENT') !== -1;

      // Build workspace list excluding the current portal (initially empty until user permissions resolve)
      var workspaceItemsHTML = '';

      var html = `
        <div class="premium-header-bar">
          
          <!-- LEFT: Branding -->
          <div class="ph-left">
            <img src="${initialGmcLogo}" class="ph-logo" id="headerGmcLogo" alt="GMC Rajouri">
            <div class="ph-title-block">
              <div class="ph-title-top">AYUSHMAN BHARAT - PM-JAY</div>
              <div class="ph-title-mid">MANAGEMENT INFORMATION SYSTEM</div>
              <div class="ph-title-bot">Government Medical College & Associated Hospital, Rajouri</div>
            </div>
          </div>

          <div class="ph-divider"></div>

          <!-- CENTER: Ribbon & Title & Center Emblem -->
          <div class="ph-center">
            <div class="ph-ribbon-bg"></div>
            <div class="ph-center-emblem" id="centerLogoContainer">
              ${initialCenterLogo}
            </div>
            <div class="ph-portal-name">${title}</div>
          </div>

          <div class="ph-divider"></div>

          <!-- RIGHT: Actions & Profile Pill -->
          <div class="ph-right">
            <div class="ph-bell-btn" title="Notifications" onclick="if(window.LeaveEngine && window.LeaveEngine.role && document.getElementById('leaveModal')) { document.getElementById('leaveModal').style.display='flex'; }">
              <svg class="ph-bell-icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div class="ph-bell-badge" id="topBellBadge" style="display:none;">0</div>
            </div>

            <div class="user-pill-container user-pill" style="position: relative; display: flex; align-items: center;">
              <div class="ph-user-pill" id="userPillBtn" onclick="event.stopPropagation(); var dd=document.getElementById('userDD'); if(dd) dd.classList.toggle('open');">
                <div class="ph-avatar" id="hAvatarContainer">
                  <span id="hInitials">--</span>
                </div>
                <div class="ph-user-info">
                  <div class="ph-user-name" id="hName">User</div>
                  <div class="ph-user-role udesig" id="hRole">${defaultRole}</div>
                  <div class="ph-status">
                    <div class="ph-status-dot"></div>
                    <div class="ph-status-text">Online</div>
                  </div>
                </div>
                <div class="ph-chevron">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <!-- BUILT-IN PROFILE DROPDOWN MENU - CLEAN COMPACT DESIGN -->
              <div class="user-dropdown" id="userDD" onclick="event.stopPropagation();">
                
                <!-- My Profile & Change Password Buttons -->
                <div class="ph-dd-btn" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); openPhProfileModal();">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>My Profile</span>
                </div>

                <div class="ph-dd-btn" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); openPhPasswordModal();">
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Change Password</span>
                </div>

                <!-- Switch Workspace Section -->
                <div class="ph-dd-section-title" id="phWsTitle" style="display:none;">SWITCH WORKSPACE</div>

                <!-- Workspace List (Filtered dynamically by assigned user roles) -->
                <div class="ph-workspace-list" id="phWsList" style="display:none;">
                  ${workspaceItemsHTML}
                </div>

                <!-- Sign Out Button -->
                <button class="ph-dd-signout-btn" type="button" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); sessionStorage.clear(); localStorage.removeItem('pmjay_user'); localStorage.removeItem('pmam_user'); localStorage.removeItem('currentUser'); if(window.logoutUser) window.logoutUser(); else if(typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) firebase.auth().signOut().then(function(){ window.location.href='index.html'; }); else { window.location.href='index.html'; }">
                  <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Sign Out</span>
                </button>

              </div>
            </div>
            
          </div>
        </div>
      `;

      mount.outerHTML = html; // replace mount point completely

      // Clean image fallback handler
      var img1 = document.getElementById('headerGmcLogo');
      if (img1) {
        img1.onerror = function() {
          if (this.src !== defaultGmcLogo) this.src = defaultGmcLogo;
        };
      }
      
      // Async fetch logo from firebase if db is available and cache locally
      if (typeof db !== 'undefined') {
        db.collection('settings').doc('portal').get().then(function(doc) {
          if (doc.exists && doc.data()) {
            // Apply Logo 1 (Left side GMC logo)
            if (doc.data().logo1) {
              try { localStorage.setItem('gmc_logo1', doc.data().logo1); } catch(e){}
              var hImg1 = document.getElementById('headerGmcLogo');
              if (hImg1 && hImg1.src !== doc.data().logo1) hImg1.src = doc.data().logo1;
            }
            // Apply Logo 2 (Center side PM-JAY logo)
            if (doc.data().logo2) {
              try { localStorage.setItem('gmc_logo2', doc.data().logo2); } catch(e){}
              var centerContainer = document.getElementById('centerLogoContainer');
              if (centerContainer) {
                centerContainer.innerHTML = '<img src="' + doc.data().logo2 + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';
              }
            }
          }
        }).catch(function(e) { console.warn("Failed to load header logos:", e); });
      }
    });

    // Populate user profile info dynamically
    updateUserHeader();
  }

  // Global click listener to close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    var dd = document.getElementById('userDD');
    var pill = document.getElementById('userPillBtn');
    if (dd && dd.classList.contains('open')) {
      if (!dd.contains(e.target) && (!pill || !pill.contains(e.target))) {
        dd.classList.remove('open');
      }
    }
  });

  function updateUserHeader(mountTitle) {
    var title = mountTitle || (document.querySelector('.ph-portal-name') ? document.querySelector('.ph-portal-name').textContent : '') || 'PORTAL';
    var name = '';
    var role = '';
    var photoUrl = '';
    var userObj = null;

    var userJson = sessionStorage.getItem('pmjay_user') ||
                   sessionStorage.getItem('pmam_user') ||
                   sessionStorage.getItem('currentUser') ||
                   localStorage.getItem('pmjay_user') ||
                   localStorage.getItem('pmam_user') ||
                   localStorage.getItem('currentUser');

    if (userJson) {
      try {
        userObj = typeof userJson === 'string' ? JSON.parse(userJson) : userJson;
        if (userObj.name || userObj.displayName) name = userObj.name || userObj.displayName;
        if (userObj.role || userObj.desig) role = userObj.role || userObj.desig;
        if (userObj.photo || userObj.photoUrl) photoUrl = userObj.photo || userObj.photoUrl;
      } catch(e){}
    }

    if (window.LeaveEngine && window.LeaveEngine.userName && String(window.LeaveEngine.userName).trim()) {
      name = window.LeaveEngine.userName;
    }

    // Apply stored profile details immediately
    applyHeaderData(name, role, photoUrl);

    // Enforce strict portal access control and workspace switcher filtering
    checkPortalAccess(userObj, title);
    updateWorkspaceSwitcher(userObj, title);

    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          if (user.displayName && !name) name = user.displayName;
          var lookupEmail = user.email || (userObj ? userObj.email : '');
          if (typeof db !== 'undefined' && lookupEmail) {
            lookupEmail = String(lookupEmail).trim().toLowerCase();
            db.collection('users').doc(lookupEmail).get().then(function(doc) {
              if (doc.exists && doc.data()) {
                var d = doc.data();
                if (d.name) name = d.name;
                if (d.role || d.roles) {
                  var rStr = String(d.role || (Array.isArray(d.roles) ? d.roles[0] : '')).toLowerCase();
                  if (rStr.indexOf('ic') !== -1 || rStr.indexOf('incharge') !== -1) role = 'INCHARGE AB-PMJAY';
                  else if (rStr.indexOf('pmam') !== -1) role = 'PMAM';
                  else if (rStr.indexOf('finance') !== -1 || rStr.indexOf('accountant') !== -1) role = 'FINANCE';
                  else if (rStr.indexOf('claims') !== -1) role = 'CLAIMS';
                  else if (rStr.indexOf('admin') !== -1) role = 'ADMIN';
                  else if (rStr.indexOf('deo') !== -1 || rStr.indexOf('patient') !== -1) role = 'PATIENT SERVICES';
                  else role = d.role || d.roles[0];
                }
                var updatedUserObj = Object.assign({}, userObj || {}, d, { name: name, role: role });
                try {
                  var uStr = JSON.stringify(updatedUserObj);
                  sessionStorage.setItem('pmjay_user', uStr);
                  sessionStorage.setItem('currentUser', uStr);
                  localStorage.setItem('pmjay_user', uStr);
                  localStorage.setItem('currentUser', uStr);
                } catch(e){}

                checkPortalAccess(updatedUserObj, title);
                updateWorkspaceSwitcher(updatedUserObj, title);
                applyHeaderData(name, role, d.photo || d.photoUrl || photoUrl);
              }
            }).catch(function(){ applyHeaderData(name, role, photoUrl); });
          }
        }
      });
    }
  }

  function checkPortalAccess(userObj, currentTitle) {
    if (!userObj) return;
    var curTitle = currentTitle || '';
    var path = window.location.pathname.toLowerCase();
    var email = String(userObj.email || '').toLowerCase();
    var adminEmail = (typeof ADMIN_EMAIL !== 'undefined') ? ADMIN_EMAIL.toLowerCase() : 'aravarya99@gmail.com';

    var userRoles = [];
    if (Array.isArray(userObj.roles) && userObj.roles.length) userRoles = userObj.roles;
    else if (userObj.role) userRoles = [userObj.role];
    else if (userObj.desig) userRoles = [userObj.desig];

    var isUserAdmin = (email === adminEmail) || userRoles.some(function(r) {
      var str = String(r).toLowerCase();
      return str === 'admin' || str === 'administrator';
    });

    if (isUserAdmin) return; // Admin has unrestricted access

    var isUserPmam = userRoles.some(function(r){ return String(r).toLowerCase() === 'pmam'; });
    var isUserIc = userRoles.some(function(r){ var s=String(r).toLowerCase(); return s.indexOf('ic')!==-1 || s.indexOf('incharge')!==-1; });
    var isUserFinance = userRoles.some(function(r){ var s=String(r).toLowerCase(); return s.indexOf('finance')!==-1 || s.indexOf('accountant')!==-1; });
    var isUserPatient = userRoles.some(function(r){ var s=String(r).toLowerCase(); return s.indexOf('deo')!==-1 || s.indexOf('patient')!==-1 || s.indexOf('mts')!==-1; });

    var isPageAdmin = path.indexOf('admin') !== -1 || curTitle.indexOf('ADMIN') !== -1;
    var isPagePmam = path.indexOf('pmam') !== -1 || curTitle.indexOf('PMAM') !== -1;
    var isPageIc = path.indexOf('ic_') !== -1 || path.indexOf('incharge') !== -1 || curTitle.indexOf('I/C') !== -1;
    var isPageFinance = path.indexOf('finance') !== -1 || curTitle.indexOf('FINANCE') !== -1;
    var isPagePatient = path.indexOf('patient') !== -1 || curTitle.indexOf('PATIENT') !== -1;

    var allowed = true;
    if (isPageAdmin && !isUserAdmin) allowed = false;
    if (isPageIc && !isUserIc) allowed = false;
    if (isPageFinance && !isUserFinance) allowed = false;
    if (isPagePatient && !isUserPatient) allowed = false;
    if (isPagePmam && !isUserPmam && !isUserAdmin) allowed = false;

    if (!allowed) {
      console.warn("[SECURITY] Access denied for this portal. Redirecting to authorized portal...");
      alert("Access Denied: You do not have permission to access this portal.");
      if (isUserPmam) window.location.href = 'pmam_portal.html';
      else if (isUserIc) window.location.href = 'ic_portal.html';
      else if (isUserFinance) window.location.href = 'finance.html';
      else if (isUserPatient) window.location.href = 'patient_service_portal.html';
      else window.location.href = 'index.html';
    }
  }

  function updateWorkspaceSwitcher(userObj, currentTitle) {
    var titleEl = document.getElementById('phWsTitle');
    var listEl = document.getElementById('phWsList');
    if (!listEl) return;

    var curTitle = currentTitle || (document.querySelector('.ph-portal-name') ? document.querySelector('.ph-portal-name').textContent : '') || '';
    var path = window.location.pathname.toLowerCase();
    var isCurrentAdmin = path.indexOf('admin') !== -1 || curTitle.indexOf('ADMIN') !== -1;
    var isCurrentPmam = path.indexOf('pmam') !== -1 || curTitle.indexOf('PMAM') !== -1;
    var isCurrentIc = path.indexOf('ic_') !== -1 || path.indexOf('incharge') !== -1 || curTitle.indexOf('I/C') !== -1;
    var isCurrentFinance = path.indexOf('finance') !== -1 || curTitle.indexOf('FINANCE') !== -1;
    var isCurrentPatient = path.indexOf('patient') !== -1 || curTitle.indexOf('PATIENT') !== -1;

    // Fallback: If userObj not provided, try reading from storage
    if (!userObj) {
      var uStr = sessionStorage.getItem('pmjay_user') ||
                 sessionStorage.getItem('pmam_user') ||
                 sessionStorage.getItem('currentUser') ||
                 localStorage.getItem('pmjay_user') ||
                 localStorage.getItem('pmam_user') ||
                 localStorage.getItem('currentUser');
      if (uStr) {
        try { userObj = typeof uStr === 'string' ? JSON.parse(uStr) : uStr; } catch(e){}
      }
    }

    // Collect assigned user roles
    var userRoles = [];
    var email = '';
    if (userObj) {
      if (userObj.email) email = String(userObj.email).toLowerCase();
      if (Array.isArray(userObj.roles) && userObj.roles.length) userRoles = userObj.roles;
      else if (userObj.role) userRoles = [userObj.role];
      else if (userObj.desig) userRoles = [userObj.desig];
    }

    var adminEmail = (typeof ADMIN_EMAIL !== 'undefined') ? ADMIN_EMAIL.toLowerCase() : 'aravarya99@gmail.com';
    var isUserAdmin = (email === adminEmail) || userRoles.some(function(r){
      var str = String(r).toLowerCase();
      return str === 'admin' || str === 'administrator';
    });

    var isUserPmam = isUserAdmin || userRoles.some(function(r){
      var str = String(r).toLowerCase();
      return str === 'pmam';
    });

    var isUserIc = isUserAdmin || userRoles.some(function(r){
      var str = String(r).toLowerCase();
      return str.indexOf('ic') !== -1 || str.indexOf('incharge') !== -1;
    });

    var isUserFinance = isUserAdmin || userRoles.some(function(r){
      var str = String(r).toLowerCase();
      return str.indexOf('finance') !== -1 || str.indexOf('accountant') !== -1;
    });

    var isUserPatient = isUserAdmin || userRoles.some(function(r){
      var str = String(r).toLowerCase();
      return str.indexOf('deo') !== -1 || str.indexOf('patient') !== -1 || str.indexOf('mts') !== -1;
    });

    var itemsHTML = '';

    if (isUserAdmin && !isCurrentAdmin) {
      itemsHTML += `
        <div class="ph-ws-item ph-ws-admin" onclick="event.stopPropagation(); window.location.href='admin_portal.html';">
          <div class="ph-ws-icon-box">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <span class="ph-ws-label">Admin Portal</span>
        </div>
      `;
    }

    if (isUserPmam && !isCurrentPmam) {
      itemsHTML += `
        <div class="ph-ws-item ph-ws-pmam" onclick="event.stopPropagation(); window.location.href='pmam_portal.html';">
          <div class="ph-ws-icon-box">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <span class="ph-ws-label">PMAM Portal</span>
        </div>
      `;
    }

    if (isUserIc && !isCurrentIc) {
      itemsHTML += `
        <div class="ph-ws-item ph-ws-ic" onclick="event.stopPropagation(); window.location.href='ic_portal.html';">
          <div class="ph-ws-icon-box">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <span class="ph-ws-label">I/C Portal</span>
        </div>
      `;
    }

    if (isUserFinance && !isCurrentFinance) {
      itemsHTML += `
        <div class="ph-ws-item ph-ws-finance" onclick="event.stopPropagation(); window.location.href='finance.html';">
          <div class="ph-ws-icon-box">
            <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>
          </div>
          <span class="ph-ws-label">Finance Portal</span>
        </div>
      `;
    }

    if (isUserPatient && !isCurrentPatient) {
      itemsHTML += `
        <div class="ph-ws-item ph-ws-patient" onclick="event.stopPropagation(); window.location.href='patient_service_portal.html';">
          <div class="ph-ws-icon-box">
            <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 18h6M12 11v4M10 13h4"></path></svg>
          </div>
          <span class="ph-ws-label">Patient Services Portal</span>
        </div>
      `;
    }

    listEl.innerHTML = itemsHTML;
    if (titleEl) {
      if (!itemsHTML.trim()) {
        titleEl.style.display = 'none';
        listEl.style.display = 'none';
      } else {
        titleEl.style.display = 'block';
        listEl.style.display = 'block';
      }
    }
  }

  function applyHeaderData(name, role, photoUrl) {
    var displayName = (name && name.trim()) ? name.trim() : 'Active User';
    var displayRole = role || 'USER';

    var hName = document.getElementById('hName');
    var hRole = document.getElementById('hRole');
    var hInitials = document.getElementById('hInitials');
    var hAvatarContainer = document.getElementById('hAvatarContainer');

    if (hName) hName.textContent = displayName.toUpperCase();
    if (hRole && role) hRole.textContent = displayRole.toUpperCase();

    var parts = displayName.split(/\s+/).filter(Boolean);
    var inits = '--';
    if (parts.length >= 2) {
      inits = parts[0][0] + parts[1][0];
    } else if (parts.length === 1 && parts[0].length >= 2) {
      inits = parts[0].substring(0, 2);
    } else if (parts.length === 1 && parts[0].length === 1) {
      inits = parts[0];
    }
    inits = inits.toUpperCase();

    if (photoUrl) {
      var photoHTML = '<img src="' + photoUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      if (hAvatarContainer) hAvatarContainer.innerHTML = photoHTML;
    } else {
      if (hAvatarContainer) {
        hAvatarContainer.innerHTML = '<span id="hInitials">' + inits + '</span>';
      }
    }
  }

  // Modals Management
  function openPhProfileModal() {
    var modal = document.getElementById('phProfileModalOverlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'phProfileModalOverlay';
      modal.className = 'ph-modal-overlay';
      modal.innerHTML = `
        <div class="ph-modal-card">
          <div class="ph-modal-title">
            <span>My Profile</span>
            <button class="ph-modal-close" onclick="document.getElementById('phProfileModalOverlay').classList.remove('open')">×</button>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800;position:relative;overflow:hidden;box-shadow:0 4px 14px rgba(124,58,237,0.3);">
              <span id="phModalAvatarInitials">--</span>
              <img id="phModalAvatarImg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;display:none;">
              <input type="file" id="phProfileFileInput" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;" onchange="phHandlePhotoChange(this)">
            </div>
            <div style="font-size:11px;font-weight:700;color:#2563eb;cursor:pointer;" onclick="document.getElementById('phProfileFileInput').click()">📷 Click to Change Profile Photo</div>
          </div>

          <div class="ph-input-group">
            <label>Full Name (Read-Only)</label>
            <input type="text" id="phModalNameInput" class="ph-input-readonly" readonly value="">
            <div style="font-size:10px;color:#64748b;margin-top:3px;">Full name is managed by System Administrator and cannot be changed here.</div>
          </div>

          <div class="ph-input-group">
            <label>Role / Designation</label>
            <input type="text" id="phModalRoleInput" class="ph-input-readonly" readonly value="">
          </div>

          <div class="ph-modal-btns">
            <button class="ph-btn-cancel" type="button" onclick="document.getElementById('phProfileModalOverlay').classList.remove('open')">Cancel</button>
            <button class="ph-btn-save" type="button" onclick="phSaveProfilePhoto()">Save Photo</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Sync current profile values
    var hName = document.getElementById('hName') ? document.getElementById('hName').textContent : 'Active User';
    var hRole = document.getElementById('hRole') ? document.getElementById('hRole').textContent : 'USER';
    var nameInput = document.getElementById('phModalNameInput');
    var roleInput = document.getElementById('phModalRoleInput');
    if (nameInput) nameInput.value = hName;
    if (roleInput) roleInput.value = hRole;

    // Check existing photo
    var avatarImg = document.querySelector('#hAvatarContainer img');
    if (avatarImg && avatarImg.src) {
      var modalImg = document.getElementById('phModalAvatarImg');
      var modalInits = document.getElementById('phModalAvatarInitials');
      if (modalImg) {
        modalImg.src = avatarImg.src;
        modalImg.style.display = 'block';
      }
      if (modalInits) modalInits.style.display = 'none';
    }

    modal.classList.add('open');
  }

  global.phHandlePhotoChange = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = document.getElementById('phModalAvatarImg');
        var inits = document.getElementById('phModalAvatarInitials');
        if (img) {
          img.src = e.target.result;
          img.style.display = 'block';
        }
        if (inits) inits.style.display = 'none';
        window._tempNewPhotoUrl = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  global.phSaveProfilePhoto = function() {
    if (window._tempNewPhotoUrl) {
      var photoUrl = window._tempNewPhotoUrl;
      try { localStorage.setItem('user_photo_url', photoUrl); } catch(e){}
      
      // Update header avatar
      applyHeaderData(
        document.getElementById('hName') ? document.getElementById('hName').textContent : 'Active User',
        document.getElementById('hRole') ? document.getElementById('hRole').textContent : 'USER',
        photoUrl
      );

      // Save to Firebase user doc if signed in
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && typeof db !== 'undefined') {
        var email = firebase.auth().currentUser.email;
        if (email) {
          db.collection('users').doc(email).set({ photo: photoUrl }, { merge: true }).catch(function(e){ console.warn(e); });
        }
      }

      alert('Profile photo updated successfully!');
    }
    var modal = document.getElementById('phProfileModalOverlay');
    if (modal) modal.classList.remove('open');
  };

  function openPhPasswordModal() {
    var modal = document.getElementById('phPasswordModalOverlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'phPasswordModalOverlay';
      modal.className = 'ph-modal-overlay';
      modal.innerHTML = `
        <div class="ph-modal-card">
          <div class="ph-modal-title">
            <span>Change Password</span>
            <button class="ph-modal-close" onclick="document.getElementById('phPasswordModalOverlay').classList.remove('open')">×</button>
          </div>
          
          <div id="phPassMsg" style="display:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;margin-bottom:12px;"></div>

          <div class="ph-input-group">
            <label>Current Password</label>
            <input type="password" id="phCurrPass" placeholder="Enter current password">
          </div>

          <div class="ph-input-group">
            <label>New Password</label>
            <input type="password" id="phNewPass" placeholder="Enter new password (min 6 chars)">
          </div>

          <div class="ph-input-group">
            <label>Confirm New Password</label>
            <input type="password" id="phConfirmPass" placeholder="Re-enter new password">
          </div>

          <div class="ph-modal-btns">
            <button class="ph-btn-cancel" type="button" onclick="document.getElementById('phPasswordModalOverlay').classList.remove('open')">Cancel</button>
            <button class="ph-btn-save" type="button" onclick="phSubmitChangePassword()">Update Password</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Reset fields
    var msg = document.getElementById('phPassMsg');
    if (msg) msg.style.display = 'none';
    var cp = document.getElementById('phCurrPass'); if (cp) cp.value = '';
    var np = document.getElementById('phNewPass'); if (np) np.value = '';
    var cfp = document.getElementById('phConfirmPass'); if (cfp) cfp.value = '';

    modal.classList.add('open');
  }

  global.phSubmitChangePassword = function() {
    var curr = (document.getElementById('phCurrPass').value || '').trim();
    var newP = (document.getElementById('phNewPass').value || '').trim();
    var conf = (document.getElementById('phConfirmPass').value || '').trim();
    var msg = document.getElementById('phPassMsg');

    function showMsg(text, isErr) {
      if (msg) {
        msg.textContent = text;
        msg.style.display = 'block';
        msg.style.background = isErr ? '#fee2e2' : '#dcfce7';
        msg.style.color = isErr ? '#991b1b' : '#15803d';
        msg.style.border = isErr ? '1px solid #fecaca' : '1px solid #bbf7d0';
      }
    }

    if (!newP || newP.length < 6) {
      showMsg('New password must be at least 6 characters long.', true);
      return;
    }
    if (newP !== conf) {
      showMsg('New password and Confirm password do not match.', true);
      return;
    }

    // If Firebase Auth user is logged in
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
      var user = firebase.auth().currentUser;
      user.updatePassword(newP).then(function() {
        showMsg('Password updated successfully!', false);
        setTimeout(function() {
          var modal = document.getElementById('phPasswordModalOverlay');
          if (modal) modal.classList.remove('open');
        }, 1200);
      }).catch(function(error) {
        if (error.code === 'auth/requires-recent-login') {
          showMsg('Please log out and log in again before changing password for security.', true);
        } else {
          showMsg(error.message || 'Failed to update password.', true);
        }
      });
    } else {
      // Local session update
      showMsg('Password updated successfully!', false);
      setTimeout(function() {
        var modal = document.getElementById('phPasswordModalOverlay');
        if (modal) modal.classList.remove('open');
      }, 1200);
    }
  };

  global.openPhProfileModal = openPhProfileModal;
  global.openPhPasswordModal = openPhPasswordModal;

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  // Also expose to window in case manual re-trigger is needed
  global.initPortalHeader = initHeader;
  global.updateUserHeader = updateUserHeader;

})(window);