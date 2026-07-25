(function(global) {
  'use strict';

  var headerCSS = `
﻿/* New Premium Header CSS */
.premium-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 10px 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: relative;
  border-bottom: 2px solid #f1f5f9;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  height: 90px;
  box-sizing: border-box;
}

/* Left Section */
.ph-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.ph-logo {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  border: 2px solid #2563eb;
  padding: 2px;
  background: #fff;
  object-fit: contain;
}
.ph-title-block {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.ph-title-top {
  color: #ea580c;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ph-title-mid {
  color: #1e3a8a;
  font-size: 20px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ph-title-bot {
  color: #1e3a8a;
  font-size: 11px;
  font-weight: 500;
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
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 24px;
  background: linear-gradient(90deg, rgba(37,99,235,0) 0%, rgba(37,99,235,1) 30%, rgba(37,99,235,1) 70%, rgba(37,99,235,0) 100%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ph-ribbon-bg::before, .ph-ribbon-bg::after {
  content: '';
  width: 40px;
  height: 24px;
  background-image: radial-gradient(#2563eb 20%, transparent 20%);
  background-size: 4px 4px;
  background-position: 0 0;
  opacity: 0.5;
}
.ph-ribbon-bg::before {
  margin-left: -20px;
}
.ph-ribbon-bg::after {
  margin-right: -20px;
}

.ph-portal-name {
  color: #ea580c;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
  text-transform: uppercase;
}
.ph-portal-name::before, .ph-portal-name::after {
  content: 'â€” â€¢';
  color: #3b82f6;
  font-weight: 900;
  letter-spacing: -1px;
}
.ph-portal-name::after {
  content: 'â€¢ â€”';
}

/* Right Section */
.ph-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  flex: 1;
}
.ph-bell-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
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
  top: -6px;
  right: -6px;
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 18px;
  min-width: 18px;
  border-radius: 9px;
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
  border-radius: 30px;
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
  background: #1e3a8a;
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

/* Vertical dividers */
.ph-divider {
  width: 1.5px;
  height: 40px;
  background: #e2e8f0;
  margin: 0 10px;
}
</style>


/* DROPDOWN MENU */
    .user-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      min-width: 210px;
      overflow: hidden;
      display: none;
      z-index: 10000;
    }
    .user-dropdown.open {
      display: block;
      animation: phDdFade 0.15s ease-out;
    }
    @keyframes phDdFade {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dd-item {
      padding: 11px 16px;
      font-size: 12px;
      color: #1e3a8a;
      font-weight: 700;
      cursor: pointer;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.15s;
    }
    .dd-item:hover {
      background: #f0f5ff;
    }
    .dd-item:last-child {
      border-bottom: none;
      color: #dc2626;
    }
    .dd-item:last-child:hover {
      background: #fef2f2;
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
      var fallbackLogo = 'https://gmcrajouri.in/assets/images/logo.png';

      // Infer role from title default
      var defaultRole = 'PMAM';
      if (title.indexOf('I/C') !== -1 || title.indexOf('INCHARGE') !== -1) defaultRole = 'INCHARGE AB-PMJAY';
      else if (title.indexOf('FINANCE') !== -1) defaultRole = 'FINANCE';
      else if (title.indexOf('CLAIMS') !== -1) defaultRole = 'CLAIMS';
      else if (title.indexOf('ADMIN') !== -1) defaultRole = 'ADMIN';
      else if (title.indexOf('PATIENT') !== -1) defaultRole = 'PATIENT SERVICES';

      
      var html = `
        <div class="premium-header-bar">
          
          <!-- LEFT: Branding -->
          <div class="ph-left">
            <img src="${fallbackLogo}" class="ph-logo" id="headerGmcLogo" alt="GMC Rajouri" onerror="this.src='https://via.placeholder.com/58?text=GMC'">
            <div class="ph-title-block">
              <div class="ph-title-top">AYUSHMAN BHARAT — PM-JAY</div>
              <div class="ph-title-mid">MANAGEMENT INFORMATION SYSTEM</div>
              <div class="ph-title-bot">Government Medical College & Associated Hospital, Rajouri</div>
            </div>
          </div>

          <!-- CENTER: Ribbon & Title -->
          <div class="ph-center">
            <div class="ph-ribbon-bg"></div>
            <div class="ph-portal-name">${title}</div>
          </div>

          <!-- RIGHT: Actions & Profile Pill -->
          <div class="ph-right">
            <div class="ph-bell-btn" title="Notifications" onclick="if(window.LeaveEngine && window.LeaveEngine.role && document.getElementById('leaveModal')) { document.getElementById('leaveModal').style.display='flex'; }">
              <svg class="ph-bell-icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div class="ph-bell-badge" id="topBellBadge" style="display:none;">0</div>
            </div>

            <div class="ph-user-pill user-pill" id="userPillBtn" onclick="event.stopPropagation(); var dd=document.getElementById('userDD'); if(dd) dd.classList.toggle('open');">
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

            <!-- BUILT-IN PROFILE DROPDOWN MENU -->
            <div class="user-dropdown" id="userDD" onclick="event.stopPropagation();">
              <div class="dd-item" onclick="document.getElementById('userDD').classList.remove('open'); if(document.getElementById('profileModal')) document.getElementById('profileModal').classList.add('open'); else alert('User Profile: ' + (document.getElementById('hName')?document.getElementById('hName').textContent:'User'));">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Update Profile</span>
              </div>
              <div class="dd-item" onclick="document.getElementById('userDD').classList.remove('open'); if(document.getElementById('signPinModal')) document.getElementById('signPinModal').classList.add('open'); else alert('Digital Signature PIN Settings');">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Digital Signature PIN</span>
              </div>
              <div class="dd-item" onclick="document.getElementById('userDD').classList.remove('open'); if(window.LeaveEngine && window.LeaveEngine.role && document.getElementById('leaveModal')) document.getElementById('leaveModal').style.display='flex'; else if(document.getElementById('sec-leave')) { if(window.goSec) window.goSec('leave'); }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Leave Application</span>
              </div>
              <div class="dd-item" onclick="var sub=document.getElementById('phPortalSwitchMenu'); if(sub) sub.style.display = (sub.style.display==='block'?'none':'block');">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3L4 7l4 4"></path><path d="M4 7h16"></path><path d="M16 21l4-4-4-4"></path><path d="M20 17H4"></path></svg>
                <span>Switch Portal ▾</span>
              </div>
              <div id="phPortalSwitchMenu" style="display:none; background:#f8fafc; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:4px 0;">
                <a href="pmam_portal.html" style="display:flex;align-items:center;gap:8px;padding:7px 16px 7px 28px;font-size:11px;font-weight:700;color:#1e3a8a;text-decoration:none;">📋 PMAM Reporting</a>
                <a href="ic_portal.html" style="display:flex;align-items:center;gap:8px;padding:7px 16px 7px 28px;font-size:11px;font-weight:700;color:#1e3a8a;text-decoration:none;">👨‍⚕️ I/C AB-PMJAY</a>
                <a href="finance.html" style="display:flex;align-items:center;gap:8px;padding:7px 16px 7px 28px;font-size:11px;font-weight:700;color:#1e3a8a;text-decoration:none;">💰 Finance Portal</a>
                <a href="admin_portal.html" style="display:flex;align-items:center;gap:8px;padding:7px 16px 7px 28px;font-size:11px;font-weight:700;color:#1e3a8a;text-decoration:none;">⚙️ Admin Portal</a>
                <a href="patient_service_portal.html" style="display:flex;align-items:center;gap:8px;padding:7px 16px 7px 28px;font-size:11px;font-weight:700;color:#1e3a8a;text-decoration:none;">🏥 Patient Services</a>
              </div>
              <div class="dd-item" onclick="document.getElementById('userDD').classList.remove('open'); if(window.logoutUser) window.logoutUser(); else if(typeof firebase !== 'undefined' && firebase.auth) firebase.auth().signOut().then(function(){ window.location.href='index.html'; }); else window.location.href='index.html';">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Logout</span>
              </div>
            </div>
            
          </div>
        </div>
      `;


      mount.outerHTML = html; // replace mount point completely
      
      // Async fetch logo from firebase if db is available
      if (typeof db !== 'undefined') {
        db.collection('settings').doc('portal').get().then(function(doc) {
          if (doc.exists && doc.data()) {
            // Apply Logo 1 (Left side GMC logo)
            if (doc.data().logo1) {
              var img1 = document.getElementById('headerGmcLogo');
              if (img1) img1.src = doc.data().logo1;
            }
            // Apply Logo 2 (Center side PM-JAY logo)
            if (doc.data().logo2) {
              var centerContainer = document.getElementById('centerLogoContainer');
              if (centerContainer) {
                centerContainer.innerHTML = '<img src="' + doc.data().logo2 + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">';
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
    var name = 'VINOD KUMAR';
    var role = '';

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
    var hName = document.getElementById('hName');
    var hRole = document.getElementById('hRole');
    var hInitials = document.getElementById('hInitials');
    var hAvatarContainer = document.getElementById('hAvatarContainer');

    if (hName) hName.textContent = (name || 'VINOD KUMAR').toUpperCase();
    if (hRole && role) hRole.textContent = role.toUpperCase();
    
    if (photoUrl && hAvatarContainer) {
      hAvatarContainer.innerHTML = '<img src="' + photoUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else if (hInitials) {
      var n = (name || 'VINOD KUMAR').trim();
      var parts = n.split(/\s+/);
      var inits = parts.length > 1 ? (parts[0][0] + parts[1][0]) : parts[0].substr(0, 2);
      hInitials.textContent = inits.toUpperCase();
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
