/* ============================================================================
   GMC RAJOURI — SHARED HEADER RENDERERS
   Depends on: shared/logos.js (window.GMCLogos must be loaded first)
   Provides:   window.GMCHeaders with 3 render functions + helpers
   ============================================================================ */
(function (global) {
  'use strict';

  if (!global.GMCLogos) {
    console.error('[GMCHeaders] shared/logos.js must be loaded before headers.js');
    return;
  }
  var L = global.GMCLogos;

  // ----- tiny helpers -----------------------------------------------------
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Set the print orientation for this page. Browsers honor only one
  // @page rule at a time, so the last call wins. Each page should typically
  // contain only one header anyway, so this is the right model.
  function setPrintOrientation(formatKey, orientation) {
    var existing = document.getElementById('gmc-page-rule');
    if (existing) existing.remove();
    var style = document.createElement('style');
    style.id = 'gmc-page-rule';
    var size = (orientation === 'landscape') ? 'A4 landscape' : 'A4';
    // ab-pmjay uses larger margins (report-header layout);
    // ms uses zero margin (the .ms-page div handles its own padding).
    var margin = (formatKey === 'abpmjay') ? '8mm 10mm' : '0';
    style.textContent =
      '@media print { @page { size: ' + size + '; margin: ' + margin + '; } }';
    document.head.appendChild(style);
  }


  // =====================================================================
  // FORMAT 1 — AB PM-JAY REPORT HEADER (landscape)
  // Usage:
  //   container.innerHTML = GMCHeaders.abpmjayReport('PMAM-WISE SUMMARY');
  //   GMCHeaders.abpmjayReport({ title: 'PMAM-WISE SUMMARY', editable: false });
  // =====================================================================
  function abpmjayReport(opts) {
    if (typeof opts === 'string') opts = { title: opts };
    opts = opts || {};
    var title       = opts.title       != null ? opts.title : 'REPORT TITLE';
    var editable    = opts.editable !== false;            // default true
    var orientation = opts.orientation === 'portrait' ? 'portrait' : 'landscape';

    setPrintOrientation('abpmjay', orientation);

    var wrapClass = 'abpmjay-wrap'
                  + (orientation === 'portrait' ? ' abpmjay-wrap--portrait' : '');

    return ''
      + '<div class="' + wrapClass + '">'
      +   '<div class="abpmjay-banner">'
      +     '<img class="abpmjay-banner__logo--gmc"   src="' + L.gmc   + '" alt="GMC Rajouri">'
      +     '<div class="abpmjay-banner__center">'
      +       '<p class="abpmjay-banner__title-1a">GOVERNMENT MEDICAL COLLEGE</p>'
      +       '<p class="abpmjay-banner__title-1b">&amp; ASSOCIATED HOSPITAL RAJOURI</p>'
      +       '<p class="abpmjay-banner__title-2">AYUSHMAN BHARAT PRADHAN MANTRI JAN AROGYA YOJANA</p>'
      +     '</div>'
      +     '<img class="abpmjay-banner__logo--pmjay" src="' + L.pmjay + '" alt="AB PM-JAY">'
      +   '</div>'
      +   '<div class="abpmjay-report-title-row">'
      +     '<span class="abpmjay-report-title"'
      +       (editable ? ' contenteditable="true"' : '') + '>'
      +       esc(title)
      +     '</span>'
      +   '</div>'
      + '</div>';
  }


  // =====================================================================
  // FORMAT 2 — MEDICAL SUPERINTENDENT REPORT HEADER (portrait)
  // Just the header strip. Wrap the page content in <div class="ms-page">…</div>
  // and put body content in <div class="ms-body">…</div>.
  // =====================================================================
  function msHeader() {
    return ''
      + '<header class="ms-header">'
      +   '<img class="ms-header__gmc"    src="' + L.gmc    + '" alt="GMC Rajouri">'
      +   '<img class="ms-header__emblem" src="' + L.emblem + '" alt="National Emblem of India">'
      +   '<img class="ms-header__swachh" src="' + L.swachh + '" alt="Swachh Bharat Mission">'
      +   '<p class="ms-header__title ms-header__title-1">UNION TERRITORY OF JAMMU &amp; KASHMIR</p>'
      +   '<p class="ms-header__title ms-header__title-2">OFFICE OF THE MEDICAL SUPERINTENDENT RAJOURI</p>'
      +   '<p class="ms-header__title ms-header__title-3">ASSOCIATED HOSPITAL-GOVERNMENT MEDICAL COLLEGE RAJOURI</p>'
      +   '<p class="ms-header__contact">'
      +     'Email: <a href="mailto:medsupdhraj@gmail.com">medsupdhraj@gmail.com</a>'
      +     '<span class="gap"></span>'
      +     'Tele: 01962-263209, 262309'
      +   '</p>'
      +   '<hr class="ms-header__divider">'
      + '</header>';
  }

  // Convenience wrapper: full MS-style report page
  // Usage:
  //   container.innerHTML = GMCHeaders.msReport({ bodyHTML: '<p>…</p>' });
  function msReport(opts) {
    opts = opts || {};
    var bodyHTML    = opts.bodyHTML != null ? opts.bodyHTML : '';
    var orientation = opts.orientation === 'landscape' ? 'landscape' : 'portrait';

    setPrintOrientation('ms', orientation);

    var pageClass = 'ms-page'
                  + (orientation === 'landscape' ? ' ms-page--landscape' : '');

    return ''
      + '<div class="' + pageClass + '">'
      +   msHeader()
      +   '<div class="ms-body">' + bodyHTML + '</div>'
      + '</div>';
  }


  // =====================================================================
  // FORMAT 3 — MEDICAL SUPERINTENDENT FORMAL LETTER (portrait)
  // Usage:
  //   container.innerHTML = GMCHeaders.msLetter({
  //     to:        ['In-charge AB-PMJAY,', 'GMC&AH Rajouri.'],
  //     refNo:     '2026-27/2981-83',
  //     date:      '15-05-2026',
  //     subject:   'Complaint regarding negligence in Golden Card Service…',
  //     paragraphs:['First paragraph…', 'Second paragraph…'],
  //     signature: { name: 'Dr. Shahin Ahmed', role: 'Medical Superintendent', org: 'AH&GMC Rajouri' },
  //     encl:      'One Leaf.',
  //     copyTo:    ['Principal, GMC Rajouri for kind information.',
  //                 'Administrative Officer, GMC Rajouri for kind information.',
  //                 'Office file.'],
  //     editable:  true,        // editable contenteditable fields on screen
  //     showCopyControls: true  // show + Add / x Remove buttons on screen
  //   });
  // =====================================================================
  function msLetter(opts) {
    opts = opts || {};

    var to         = opts.to         || ['In-charge AB-PMJAY,', 'GMC&AH Rajouri.'];
    var refPrefix  = opts.refPrefix  || 'MS/AH-GMC/R/';
    var refNo      = opts.refNo      || '2026-27/____';
    var date       = opts.date       || '__-__-____';
    var subject    = opts.subject    || '____';
    var paragraphs = opts.paragraphs || ['____'];
    var sig        = opts.signature  || { name: 'Dr. Shahin Ahmed', role: 'Medical Superintendent', org: 'AH&GMC Rajouri' };
    var encl       = opts.encl       || '';
    var copyTo     = opts.copyTo     || [];
    var editable   = opts.editable !== false;
    var showCopyControls = opts.showCopyControls !== false;
    var orientation = opts.orientation === 'landscape' ? 'landscape' : 'portrait';

    setPrintOrientation('ms', orientation);

    var pageClass = 'ms-page'
                  + (orientation === 'landscape' ? ' ms-page--landscape' : '');

    var ce = editable ? ' contenteditable="true"' : '';

    var toHTML = to.map(function (line) {
      return '<span class="ms-to__line"' + ce + '>' + esc(line) + '</span>';
    }).join('');

    var paraHTML = paragraphs.map(function (p) {
      return '<p class="ms-body-text"' + ce + '>' + esc(p) + '</p>';
    }).join('');

    var copyHTML = copyTo.map(function (item) {
      return ''
        + '<li><span' + ce + '>' + esc(item) + '</span>'
        + (showCopyControls
            ? ' <button class="ms-copy__remove" type="button" onclick="GMCHeaders._removeCopy(this)">×</button>'
            : '')
        + '</li>';
    }).join('');

    return ''
      + '<div class="' + pageClass + '">'
      +   msHeader()
      +   '<div class="ms-letter-body">'
      +     '<div class="ms-to">' + toHTML + '</div>'
      +     '<div class="ms-refrow">'
      +       '<div class="ms-refrow__no">No:- ' + esc(refPrefix)
      +         '<span' + ce + '>' + esc(refNo) + '</span></div>'
      +       '<div class="ms-refrow__date">Dated:- <span' + ce + '>' + esc(date) + '</span></div>'
      +     '</div>'
      +     '<div class="ms-subject">'
      +       '<span class="ms-subject__label">Subject:-</span>'
      +       '<span' + ce + '>' + esc(subject) + '</span>'
      +     '</div>'
      +     paraHTML
      +     '<div class="ms-signature">'
      +       '<p class="ms-signature__name">' + esc(sig.name) + '</p>'
      +       '<p class="ms-signature__role">' + esc(sig.role) + '</p>'
      +       '<p class="ms-signature__org">'  + esc(sig.org)  + '</p>'
      +     '</div>'
      +     '<div class="ms-footer">'
      +       (encl
        ? '<div class="ms-encl"><span class="ms-encl__label">Encl:-</span> <span' + ce + '>' + esc(encl) + '</span></div>'
        : '')
      +       (copyTo.length
        ? '<div class="ms-copy">'
            + '<span class="ms-copy__label">Copy to the:-</span>'
            + '<ol class="ms-copy__list" id="gmcCopyToList">' + copyHTML + '</ol>'
            + (showCopyControls
                ? '<div class="ms-copy__controls">'
                    + '<button class="ms-copy__btn" type="button" onclick="GMCHeaders._addCopy()">+ Add recipient</button>'
                  + '</div>'
                : '')
          + '</div>'
        : '')
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // Letter helpers — used by inline onclick handlers in msLetter output
  function _addCopy() {
    var list = document.getElementById('gmcCopyToList');
    if (!list) return;
    var li = document.createElement('li');
    li.innerHTML = '<span contenteditable="true">New recipient</span> '
                 + '<button class="ms-copy__remove" type="button" onclick="GMCHeaders._removeCopy(this)">×</button>';
    list.appendChild(li);
    var span = li.querySelector('[contenteditable]');
    span.focus();
    var range = document.createRange();
    range.selectNodeContents(span);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function _removeCopy(btn) {
    var list = document.getElementById('gmcCopyToList');
    if (!list) return;
    if (list.querySelectorAll('li').length <= 1) {
      alert('At least one recipient must remain. Clear the text instead if not needed.');
      return;
    }
    btn.closest('li').remove();
  }


  // ----- expose ---------------------------------------------------------
  global.GMCHeaders = {
    // primary renderers
    abpmjayReport: abpmjayReport,
    msReport:      msReport,
    msLetter:      msLetter,
    // building blocks
    msHeader:      msHeader,
    // internal letter helpers
    _addCopy:    _addCopy,
    _removeCopy: _removeCopy,
    // utility
    print: function () { window.print(); }
  };
})(window);
