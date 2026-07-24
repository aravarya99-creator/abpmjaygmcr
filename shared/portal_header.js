(function(global) {
  'use strict';

  var headerCSS = `
    .portal-header-wrapper {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      margin: 10px 14px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #f1f5f9;
      font-family: "Inter", Arial, sans-serif;
    }

    /* Left Section */
    .ph-left-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .ph-gmc-logo {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      object-fit: contain;
      border: 1px solid #e2e8f0;
      padding: 2px;
    }
    .ph-text-stack {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ph-t1 {
      font-size: 10px;
      font-weight: 800;
      color: #ea580c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ph-t2 {
      font-size: 16px;
      font-weight: 900;
      color: #0f2b8c;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .ph-t3 {
      font-size: 10px;
      font-weight: 500;
      color: #1e3a8a;
    }

    /* Center Section */
    .ph-center-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      flex: 1;
    }
    .ph-ribbon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 400px;
      position: relative;
    }
    .ph-ribbon-line {
      height: 10px;
      flex: 1;
      background: linear-gradient(90deg, rgba(37,99,235,0) 0%, #2563eb 30%, #2563eb 70%, rgba(37,99,235,0) 100%);
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      z-index: 1;
    }
    .ph-ribbon-dots {
      position: absolute;
      width: 100%;
      height: 14px;
      top: 50%;
      transform: translateY(-50%);
      background-image: radial-gradient(#2563eb 1.5px, transparent 1.5px);
      background-size: 6px 6px;
      z-index: 2;
      -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%);
      mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%);
    }

    .ph-pmjay-logo {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid #2563eb;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 3px;
    }

    .ph-portal-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ph-pt-line {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ph-pt-line::before {
      content: "";
      display: block;
      width: 20px;
      height: 2px;
      background: #3b82f6;
    }
    .ph-pt-line::after {
      content: "";
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #3b82f6;
    }
    .ph-pt-line.right {
      flex-direction: row-reverse;
    }
    .ph-pt-text {
      font-size: 13px;
      font-weight: 800;
      color: #ea580c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Right Section */
    .ph-right-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ph-bell {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      background: #fff;
      transition: all 0.2s;
    }
    .ph-bell:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .ph-bell svg {
      width: 22px;
      height: 22px;
      stroke: #1e3a8a;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .ph-bell-dot {
      position: absolute;
      top: 10px;
      right: 12px;
      width: 8px;
      height: 8px;
      background: #2563eb;
      border-radius: 50%;
      border: 2px solid #fff;
      box-sizing: content-box;
      display: none;
    }
    .ph-bell-dot.active {
      display: block;
    }
    /* Fallback for badge mode */
    .ph-bell-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ph-user-pill {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 50px;
      padding: 4px 6px 4px 4px;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 180px;
    }
    .ph-user-pill:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .ph-u-av {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f2b8c;
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .ph-u-av img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .ph-u-details {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: 1;
    }
    .ph-u-name {
      font-size: 11px;
      font-weight: 800;
      color: #ea580c;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
    .ph-u-role {
      font-size: 9px;
      font-weight: 600;
      color: #2563eb;
      text-transform: uppercase;
    }
    .ph-u-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-weight: 600;
      color: #475569;
    }
    .ph-u-status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #16a34a;
    }
    .ph-u-chevron {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
      flex-shrink: 0;
      background: #fff;
    }
    .ph-u-chevron svg {
      width: 12px;
      height: 12px;
      stroke: #1e3a8a;
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    @media (max-width: 900px) {
      .portal-header-wrapper {
        flex-direction: column;
        gap: 16px;
      }
      .ph-center-brand {
        order: -1;
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

      var html = `
        <div class="portal-header-wrapper">
          
          <!-- LEFT: Branding -->
          <div class="ph-left-brand">
            <img src="\${fallbackLogo}" class="ph-gmc-logo" id="headerGmcLogo" alt="GMC Rajouri" onerror="this.src='https://via.placeholder.com/58?text=GMC'">
            <div class="ph-text-stack">
              <div class="ph-t1">AYUSHMAN BHARAT — PM-JAY</div>
              <div class="ph-t2">MANAGEMENT INFORMATION SYSTEM</div>
              <div class="ph-t3">Government Medical College & Associated Hospital, Rajouri</div>
            </div>
          </div>

          <!-- CENTER: Ribbon & Title -->
          <div class="ph-center-brand">
            <div class="ph-ribbon-container">
              <div class="ph-ribbon-dots"></div>
              <div class="ph-ribbon-line"></div>
              <div class="ph-pmjay-logo" id="centerLogoContainer">
                \${pmjaySVG}
              </div>
            </div>
            <div class="ph-portal-title">
              <div class="ph-pt-line"></div>
              <div class="ph-pt-text">\${title}</div>
              <div class="ph-pt-line right"></div>
            </div>
          </div>

          <!-- RIGHT: Actions -->
          <div class="ph-right-actions">
            <div class="ph-bell" onclick="if(window.LeaveEngine && window.LeaveEngine.role) { document.getElementById('leaveModal').style.display='flex'; }">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div class="ph-bell-badge" id="topBellBadge" style="display:none;">0</div>
            </div>

            <div class="ph-user-pill" onclick="document.getElementById('userDD') && document.getElementById('userDD').classList.toggle('open')">
              <div class="ph-u-av" id="hAvatarContainer">
                <span id="hInitials">U</span>
              </div>
              <div class="ph-u-details">
                <div class="ph-u-name" id="hName">Loading...</div>
                <div class="ph-u-role udesig" id="hRole">Role</div>
                <div class="ph-u-status">
                  <div class="ph-u-status-dot"></div>
                  <span>Online</span>
                </div>
              </div>
              <div class="ph-u-chevron">
                <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
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
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  // Also expose to window in case manual re-trigger is needed
  global.initPortalHeader = initHeader;

})(window);
