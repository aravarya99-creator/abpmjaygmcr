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

/* USER DROPDOWN MENU - 1:1 REFERENCE DESIGN */
.user-dropdown {
  position: absolute !important;
  top: calc(100% + 10px) !important;
  right: 0 !important;
  left: auto !important;
  background: #ffffff !important;
  border-radius: 20px !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16), 0 2px 10px rgba(0, 0, 0, 0.06) !important;
  border: 1.5px solid #e2e8f0 !important;
  width: 290px !important;
  min-width: 290px !important;
  padding: 20px 18px !important;
  box-sizing: border-box !important;
  display: none;
  z-index: 100000 !important;
  font-family: 'Inter', 'Segoe UI', sans-serif !important;
}
.user-dropdown.open {
  display: block !important;
  animation: phDdFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
@keyframes phDdFade {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Dropdown Profile Header */
.ph-dd-profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.ph-dd-big-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}
.ph-dd-big-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ph-dd-user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.ph-dd-name {
  color: #1e293b;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ph-dd-role {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ph-dd-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #dcfce7;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  margin-top: 6px;
  width: fit-content;
}
.ph-dd-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

/* Card Action Buttons (My Profile, Change Password) */
.ph-dd-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  padding: 11px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  box-sizing: border-box;
}
.ph-dd-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
.ph-dd-btn svg {
  width: 18px;
  height: 18px;
  stroke: #475569;
  stroke-width: 2;
  fill: none;
  flex-shrink: 0;
}

/* Switch Workspace Section Title */
.ph-dd-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin: 18px 0 10px 0;
}

/* Workspace List & Portal Cards */
.ph-workspace-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ph-ws-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid #f1f5f9;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  box-sizing: border-box;
}
.ph-ws-item:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
.ph-ws-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ph-ws-icon-box svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ph-ws-label {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

/* Active State Styles per Portal (Matching Image 2 Reference) */
/* Admin Portal (Purple Theme) */
.ph-ws-admin .ph-ws-icon-box { background: #ede9fe; }
.ph-ws-admin .ph-ws-icon-box svg { stroke: #7c3aed; }
.ph-ws-admin.active { background: #f3e8ff; border-color: #e9d5ff; }
.ph-ws-admin.active .ph-ws-label { color: #6d28d9; }

/* PMAM Portal (Green Theme) */
.ph-ws-pmam .ph-ws-icon-box { background: #dcfce7; }
.ph-ws-pmam .ph-ws-icon-box svg { stroke: #16a34a; }
.ph-ws-pmam.active { background: #dcfce7; border-color: #bbf7d0; }
.ph-ws-pmam.active .ph-ws-label { color: #15803d; }

/* I/C Portal (Blue Theme) */
.ph-ws-ic .ph-ws-icon-box { background: #e0f2fe; }
.ph-ws-ic .ph-ws-icon-box svg { stroke: #2563eb; }
.ph-ws-ic.active { background: #dbeafe; border-color: #bfdbfe; }
.ph-ws-ic.active .ph-ws-label { color: #1d4ed8; }

/* Finance Portal (Orange Theme) */
.ph-ws-finance .ph-ws-icon-box { background: #ffedd5; }
.ph-ws-finance .ph-ws-icon-box svg { stroke: #ea580c; }
.ph-ws-finance.active { background: #ffedd5; border-color: #fed7aa; }
.ph-ws-finance.active .ph-ws-label { color: #c2410c; }

/* Patient Services (Cyan Theme) */
.ph-ws-patient .ph-ws-icon-box { background: #e0f2fe; }
.ph-ws-patient .ph-ws-icon-box svg { stroke: #0284c7; }
.ph-ws-patient.active { background: #e0f2fe; border-color: #bae6fd; }
.ph-ws-patient.active .ph-ws-label { color: #0369a1; }

/* Sign Out Button (Bottom Red Card) */
.ph-dd-signout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1.5px solid #fee2e2;
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #ef4444;
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  box-sizing: border-box;
}
.ph-dd-signout-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
}
.ph-dd-signout-btn svg {
  width: 20px;
  height: 20px;
  stroke: #ef4444;
  stroke-width: 2.2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
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

      // Current page path detection for active state in workspace switcher
      var path = window.location.pathname.toLowerCase();
      var isAdmin = path.indexOf('admin') !== -1 || title.indexOf('ADMIN') !== -1;
      var isPmam = path.indexOf('pmam') !== -1 || title.indexOf('PMAM') !== -1;
      var isIc = path.indexOf('ic_') !== -1 || path.indexOf('incharge') !== -1 || title.indexOf('I/C') !== -1;
      var isFinance = path.indexOf('finance') !== -1 || title.indexOf('FINANCE') !== -1;
      var isPatient = path.indexOf('patient') !== -1 || title.indexOf('PATIENT') !== -1;

      var html = `
        <div class="premium-header-bar">
          
          <!-- LEFT: Branding -->
          <div class="ph-left">
            <img src="${initialGmcLogo}" class="ph-logo" id="headerGmcLogo" alt="GMC Rajouri" onerror="if(this.src!=='${defaultGmcLogo}') this.src='${defaultGmcLogo}';">
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
                  <span id="hInitials">VK</span>
                </div>
                <div class="ph-user-info">
                  <div class="ph-user-name" id="hName">VINOD KUMAR</div>
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

              <!-- BUILT-IN PROFILE DROPDOWN MENU - 1:1 DESIGN FROM IMAGE 2 -->
              <div class="user-dropdown" id="userDD" onclick="event.stopPropagation();">
                
                <!-- Profile Header -->
                <div class="ph-dd-profile-header">
                  <div class="ph-dd-big-avatar" id="ddBigAvatar">VK</div>
                  <div class="ph-dd-user-details">
                    <div class="ph-dd-name" id="ddName">Vinod Kumar</div>
                    <div class="ph-dd-role" id="ddRole">System Administrator</div>
                    <div class="ph-dd-status-badge">
                      <div class="ph-dd-status-dot"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>

                <!-- My Profile & Change Password Buttons -->
                <div class="ph-dd-btn" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); if(document.getElementById('profileModal')) document.getElementById('profileModal').classList.add('open'); else alert('User Profile: ' + (document.getElementById('hName')?document.getElementById('hName').textContent:'User'));">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>My Profile</span>
                </div>

                <div class="ph-dd-btn" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); if(document.getElementById('passwordModal')) document.getElementById('passwordModal').classList.add('open'); else alert('Change Password option selected');">
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Change Password</span>
                </div>

                <!-- Switch Workspace Section -->
                <div class="ph-dd-section-title">SWITCH WORKSPACE</div>

                <!-- Workspace List (Direct Instant Navigation) -->
                <div class="ph-workspace-list">
                  
                  <div class="ph-ws-item ph-ws-admin ${isAdmin ? 'active' : ''}" onclick="event.stopPropagation(); window.location.href='admin_portal.html';">
                    <div class="ph-ws-icon-box">
                      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <span class="ph-ws-label">Admin Portal</span>
                  </div>

                  <div class="ph-ws-item ph-ws-pmam ${isPmam ? 'active' : ''}" onclick="event.stopPropagation(); window.location.href='pmam_portal.html';">
                    <div class="ph-ws-icon-box">
                      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <span class="ph-ws-label">PMAM Portal</span>
                  </div>

                  <div class="ph-ws-item ph-ws-ic ${isIc ? 'active' : ''}" onclick="event.stopPropagation(); window.location.href='ic_portal.html';">
                    <div class="ph-ws-icon-box">
                      <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <span class="ph-ws-label">I/C Portal</span>
                  </div>

                  <div class="ph-ws-item ph-ws-finance ${isFinance ? 'active' : ''}" onclick="event.stopPropagation(); window.location.href='finance.html';">
                    <div class="ph-ws-icon-box">
                      <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>
                    </div>
                    <span class="ph-ws-label">Finance Portal</span>
                  </div>

                </div>

                <!-- Sign Out Button -->
                <button class="ph-dd-signout-btn" type="button" onclick="event.stopPropagation(); document.getElementById('userDD').classList.remove('open'); if(window.logoutUser) window.logoutUser(); else if(typeof firebase !== 'undefined' && firebase.auth) firebase.auth().signOut().then(function(){ window.location.href='index.html'; }); else window.location.href='index.html';">
                  <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Sign Out</span>
                </button>

              </div>
            </div>
            
          </div>
        </div>
      `;

      mount.outerHTML = html; // replace mount point completely
      
      // Async fetch logo from firebase if db is available and cache locally
      if (typeof db !== 'undefined') {
        db.collection('settings').doc('portal').get().then(function(doc) {
          if (doc.exists && doc.data()) {
            // Apply Logo 1 (Left side GMC logo)
            if (doc.data().logo1) {
              try { localStorage.setItem('gmc_logo1', doc.data().logo1); } catch(e){}
              var img1 = document.getElementById('headerGmcLogo');
              if (img1 && img1.src !== doc.data().logo1) img1.src = doc.data().logo1;
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

  function updateUserHeader() {
    var name = 'Vinod Kumar';
    var role = 'System Administrator';

    var userJson = localStorage.getItem('pmam_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('pmam_user');
    if (userJson) {
      try {
        var u = typeof userJson === 'string' ? JSON.parse(userJson) : userJson;
        if (u.name || u.displayName) name = u.name || u.displayName;
        if (u.role || u.desig) role = u.role || u.desig;
      } catch(e){}
    }

    if (window.LeaveEngine && window.LeaveEngine.userName) {
      name = window.LeaveEngine.userName;
    }
    if (window.LeaveEngine && window.LeaveEngine.role) {
      var r = window.LeaveEngine.role;
      if (r === 'pmam') role = 'PMAM';
      else if (r === 'ic') role = 'INCHARGE AB-PMJAY';
      else if (r === 'admin') role = 'ADMIN';
      else if (r === 'finance') role = 'FINANCE';
    }

    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          if (user.displayName) name = user.displayName;
          if (typeof db !== 'undefined' && user.email) {
            db.collection('users').doc(user.email).get().then(function(doc) {
              if (doc.exists && doc.data()) {
                var d = doc.data();
                if (d.name) name = d.name;
                if (d.role) {
                  var rStr = d.role.toLowerCase();
                  if (rStr.indexOf('ic') !== -1 || rStr.indexOf('incharge') !== -1) role = 'INCHARGE AB-PMJAY';
                  else if (rStr.indexOf('pmam') !== -1) role = 'PMAM';
                  else if (rStr.indexOf('finance') !== -1) role = 'FINANCE';
                  else if (rStr.indexOf('claims') !== -1) role = 'CLAIMS';
                  else if (rStr.indexOf('admin') !== -1) role = 'ADMIN';
                  else role = d.role;
                }
                applyHeaderData(name, role, d.photo || d.photoUrl);
              }
            }).catch(function(){ applyHeaderData(name, role); });
          } else {
            applyHeaderData(name, role);
          }
        } else {
          applyHeaderData(name, role);
        }
      });
    } else {
      applyHeaderData(name, role);
    }
  }

  function applyHeaderData(name, role, photoUrl) {
    var displayName = name || 'Vinod Kumar';
    var displayRole = role || 'System Administrator';

    var hName = document.getElementById('hName');
    var hRole = document.getElementById('hRole');
    var hInitials = document.getElementById('hInitials');
    var hAvatarContainer = document.getElementById('hAvatarContainer');

    if (hName) hName.textContent = displayName.toUpperCase();
    if (hRole && role) hRole.textContent = displayRole.toUpperCase();

    var ddName = document.getElementById('ddName');
    var ddRole = document.getElementById('ddRole');
    var ddBigAvatar = document.getElementById('ddBigAvatar');

    if (ddName) ddName.textContent = displayName;
    if (ddRole) ddRole.textContent = displayRole;

    var n = displayName.trim();
    var parts = n.split(/\s+/);
    var inits = parts.length > 1 ? (parts[0][0] + parts[1][0]) : parts[0].substr(0, 2);
    inits = inits.toUpperCase();

    if (photoUrl) {
      var photoHTML = '<img src="' + photoUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      if (hAvatarContainer) hAvatarContainer.innerHTML = photoHTML;
      if (ddBigAvatar) ddBigAvatar.innerHTML = photoHTML;
    } else {
      if (hInitials) hInitials.textContent = inits;
      if (ddBigAvatar) ddBigAvatar.textContent = inits;
    }
  }

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