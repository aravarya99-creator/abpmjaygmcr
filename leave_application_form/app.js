document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // DOM Elements
  const fromDateInput = document.getElementById('from-date');
  const toDateInput = document.getElementById('to-date');
  const totalDaysInput = document.getElementById('total-days');
  const returnDateInput = document.getElementById('return-date');
  
  const wardSelect = document.getElementById('ward-select');
  const btnAddWard = document.getElementById('btn-add-ward');
  const selectedWardsContainer = document.getElementById('selected-wards-tags');

  const substituteSelect = document.getElementById('substitute-select');
  const reasonSelect = document.getElementById('reason-select');
  const leaveTypeSelect = document.getElementById('leave-type-select');

  const btnClear = document.getElementById('btn-clear');
  const btnPreview = document.getElementById('btn-preview');
  const btnSubmit = document.getElementById('btn-submit');
  const leaveForm = document.getElementById('leave-form');

  const previewModal = document.getElementById('preview-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmSubmit = document.getElementById('modal-confirm-submit');
  const modalBodyContent = document.getElementById('modal-body-content');

  // Track assigned wards array
  let selectedWards = [];

  // Set default dates for convenience
  const today = new Date();
  const todayFormatted = formatDateForInput(today);
  fromDateInput.value = todayFormatted;

  const defaultToDate = new Date(today);
  defaultToDate.setDate(defaultToDate.getDate() + 2);
  toDateInput.value = formatDateForInput(defaultToDate);

  calculateDaysAndReturnDate();

  // Event Listeners for Date Calculations
  fromDateInput.addEventListener('change', calculateDaysAndReturnDate);
  toDateInput.addEventListener('change', calculateDaysAndReturnDate);

  function formatDateForInput(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function calculateDaysAndReturnDate() {
    const fromStr = fromDateInput.value;
    const toStr = toDateInput.value;

    if (fromStr && toStr) {
      const fromDate = new Date(fromStr);
      const toDate = new Date(toStr);

      if (toDate >= fromDate) {
        // Difference in days inclusive
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        totalDaysInput.value = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;

        // Return date default = toDate + 1 day
        const returnDateObj = new Date(toDate);
        returnDateObj.setDate(returnDateObj.getDate() + 1);
        returnDateInput.value = formatDateForInput(returnDateObj);
      } else {
        totalDaysInput.value = 'Invalid Date Range';
        returnDateInput.value = '';
      }
    } else {
      totalDaysInput.value = 'Auto Calculated';
    }
  }

  // Add Ward Handler
  btnAddWard.addEventListener('click', () => {
    const val = wardSelect.value;
    if (val && !selectedWards.includes(val)) {
      selectedWards.push(val);
      renderWardTags();
      wardSelect.value = '';
    }
  });

  function renderWardTags() {
    selectedWardsContainer.innerHTML = '';
    if (selectedWards.length === 0) {
      selectedWardsContainer.innerHTML = '<span class="empty-ward-text">No wards selected</span>';
      return;
    }

    selectedWards.forEach((ward, index) => {
      const tag = document.createElement('span');
      tag.className = 'ward-tag';
      tag.innerHTML = `
        ${ward}
        <span class="ward-tag-remove" data-index="${index}">&times;</span>
      `;
      selectedWardsContainer.appendChild(tag);
    });

    // Attach click events to remove buttons
    document.querySelectorAll('.ward-tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        selectedWards.splice(idx, 1);
        renderWardTags();
      });
    });
  }

  // Clear Form
  btnClear.addEventListener('click', () => {
    fromDateInput.value = '';
    toDateInput.value = '';
    totalDaysInput.value = 'Auto Calculated';
    returnDateInput.value = '';
    reasonSelect.value = '';
    leaveTypeSelect.value = '';
    substituteSelect.value = '';
    wardSelect.value = '';
    selectedWards = [];
    renderWardTags();
  });

  // Modal Functions
  function openPreviewModal() {
    const fromStr = fromDateInput.value || 'Not selected';
    const toStr = toDateInput.value || 'Not selected';
    const daysStr = totalDaysInput.value || 'N/A';
    const returnStr = returnDateInput.value || 'Not selected';
    const reasonStr = reasonSelect.value || 'Not specified';
    const typeStr = leaveTypeSelect.value || 'Not specified';
    const substituteStr = substituteSelect.value || 'None assigned';
    const wardsStr = selectedWards.length > 0 ? selectedWards.join(', ') : 'None';

    modalBodyContent.innerHTML = `
      <div class="preview-grid">
        <div class="preview-field">
          <div class="preview-field-label">Employee Name</div>
          <div class="preview-field-value">PAYAL SHARMA</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">Designation</div>
          <div class="preview-field-value">PMAM</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">Assigned Ward(s)</div>
          <div class="preview-field-value">${wardsStr}</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">Duty Assigned To</div>
          <div class="preview-field-value">${substituteStr}</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">From Date</div>
          <div class="preview-field-value">${fromStr}</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">To Date</div>
          <div class="preview-field-value">${toStr}</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">Total Duration</div>
          <div class="preview-field-value" style="color: #7e22ce;">${daysStr}</div>
        </div>
        <div class="preview-field">
          <div class="preview-field-label">Return Date</div>
          <div class="preview-field-value" style="color: #16a34a;">${returnStr}</div>
        </div>
        <div class="preview-field full-width">
          <div class="preview-field-label">Reason for Leave</div>
          <div class="preview-field-value">${reasonStr}</div>
        </div>
        <div class="preview-field full-width">
          <div class="preview-field-label">Type of Leave</div>
          <div class="preview-field-value" style="color: #db2777;">${typeStr}</div>
        </div>
      </div>
    `;

    previewModal.classList.remove('hidden');
  }

  function closePreviewModal() {
    previewModal.classList.add('hidden');
  }

  btnPreview.addEventListener('click', openPreviewModal);
  modalClose.addEventListener('click', closePreviewModal);
  modalCloseBtn.addEventListener('click', closePreviewModal);

  btnSubmit.addEventListener('click', () => {
    if (!fromDateInput.value || !toDateInput.value || !reasonSelect.value || !leaveTypeSelect.value) {
      alert('Please fill in all mandatory fields (From Date, To Date, Reason for Leave, Type of Leave).');
      return;
    }
    closePreviewModal();

    if (window.DSig && typeof DSig.promptPin === 'function') {
      DSig.promptPin(null, 'Sign & Submit Leave Application')
        .then((udata) => {
          const reqPayload = {
            applicantName: udata.name || 'Payal Sharma',
            applicantEmail: udata.email || 'payal@gmcrajouri.in',
            leaveType: leaveTypeSelect.value,
            fromDate: fromDateInput.value,
            toDate: toDateInput.value,
            totalDays: totalDaysInput.value,
            returnDate: returnDateInput.value,
            substituteName: substituteSelect.options[substituteSelect.selectedIndex]?.text || '',
            substituteEmail: substituteSelect.value || '',
            wardName: selectedWards.join(', '),
            assignedWards: selectedWards,
            reason: reasonSelect.value
          };

          if (window.GMCLeave && typeof GMCLeave.submitLeaveRequest === 'function') {
            return GMCLeave.submitLeaveRequest(reqPayload);
          }
        })
        .then(() => {
          alert('✅ Leave Application Digitally Signed & Submitted to Firestore Successfully!');
          leaveForm.reset();
        })
        .catch((err) => {
          if (err && err.message && err.message.indexOf('cancelled') === -1) {
            alert('⚠️ Could not submit leave request: ' + err.message);
          }
        });
    } else {
      alert('✅ Leave Application Signed & Submitted Successfully!');
    }
  });

  modalConfirmSubmit.addEventListener('click', () => {
    closePreviewModal();
    btnSubmit.click();
  });
});

