// Shared UI utilities: toast, confirm, spinner, form helpers

const UI = {

  // ── Toast Notifications ──────────────────────────────────

  _toastContainer: null,

  _getToastContainer() {
    if (!this._toastContainer) {
      this._toastContainer = document.getElementById('toastContainer');
    }
    return this._toastContainer;
  },

  showToast(message, type = 'info', duration = 3500) {
    const container = this._getToastContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const icons = { success: '\u2713', error: '\u2717', info: '\u2139' };
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>'
      + '<span class="toast-msg">' + this._escapeHTML(message) + '</span>';

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 400); // fallback
    }, duration);
  },

  // ── Confirm Dialog ───────────────────────────────────────

  showConfirm(title, message, confirmText = 'Confirm', variant = 'danger') {
    return new Promise(resolve => {
      const overlay = document.getElementById('confirmOverlay');
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;

      const okBtn = document.getElementById('confirmOk');
      const cancelBtn = document.getElementById('confirmCancel');

      okBtn.textContent = confirmText;
      okBtn.className = 'btn btn-' + variant;

      function cleanup(result) {
        overlay.style.display = 'none';
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onOverlay);
        resolve(result);
      }

      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }
      function onOverlay(e) { if (e.target === overlay) cleanup(false); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', onOverlay);

      overlay.style.display = 'flex';
    });
  },

  // ── Loading Spinner ──────────────────────────────────────

  showSpinner(container) {
    if (!container) return;
    this.hideSpinner(container);
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    container.style.position = container.style.position || 'relative';
    container.appendChild(overlay);
  },

  hideSpinner(container) {
    if (!container) return;
    const existing = container.querySelector('.spinner-overlay');
    if (existing) existing.remove();
  },

  // ── Form Modal ───────────────────────────────────────────

  openFormModal(title, bodyHTML, onSubmit, footerExtra = '') {
    const overlay = document.getElementById('detailOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = title;
    modalBody.innerHTML =
      '<form id="modalForm" class="modal-form" onsubmit="return false;">' +
        bodyHTML +
        '<div class="modal-footer">' +
          footerExtra +
          '<button type="button" class="btn btn-secondary" onclick="closeDetailModal()">Cancel</button>' +
          '<button type="submit" class="btn btn-primary" id="modalSubmitBtn">Save</button>' +
        '</div>' +
      '</form>';

    const form = document.getElementById('modalForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('modalSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        await onSubmit(this.getFormData(form));
      } catch (err) {
        this.showToast(err.message || 'Something went wrong', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Save';
        }
      }
    });

    overlay.style.display = 'flex';
  },

  // ── Form Utilities ───────────────────────────────────────

  getFormData(form) {
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(el => {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        if (!data[el.name]) data[el.name] = [];
        if (el.checked) data[el.name].push(el.value);
      } else if (el.type === 'number') {
        data[el.name] = el.value ? Number(el.value) : null;
      } else {
        data[el.name] = el.value;
      }
    });
    return data;
  },

  setFormErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.form-error-text').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    // Set new errors
    for (const [field, msg] of Object.entries(errors)) {
      const errEl = form.querySelector('[data-error="' + field + '"]');
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = 'block';
      }
    }
  },

  clearFormErrors(form) {
    form.querySelectorAll('.form-error-text').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  },

  // ── Helpers ──────────────────────────────────────────────

  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Build a <select> options string
  buildOptions(options, selected) {
    return options.map(opt => {
      const val = typeof opt === 'string' ? opt : opt.value;
      const label = typeof opt === 'string' ? opt : opt.label;
      const sel = val === selected ? ' selected' : '';
      return '<option value="' + this._escapeHTML(val) + '"' + sel + '>' + this._escapeHTML(label) + '</option>';
    }).join('');
  },

  // Build a form group (label + input)
  formGroup(name, label, inputHTML, required = false) {
    return '<div class="form-group">'
      + '<label class="form-label" for="field_' + name + '">' + label + (required ? ' *' : '') + '</label>'
      + inputHTML
      + '<p class="form-error-text" data-error="' + name + '"></p>'
      + '</div>';
  },

  textInput(name, placeholder = '', value = '', required = false) {
    return '<input class="form-input" type="text" id="field_' + name + '" name="' + name + '"'
      + ' placeholder="' + this._escapeHTML(placeholder) + '"'
      + ' value="' + this._escapeHTML(value) + '"'
      + (required ? ' required' : '') + '>';
  },

  numberInput(name, placeholder = '', value = '', min = '', max = '') {
    return '<input class="form-input" type="number" id="field_' + name + '" name="' + name + '"'
      + ' placeholder="' + this._escapeHTML(placeholder) + '"'
      + (value !== '' ? ' value="' + value + '"' : '')
      + (min !== '' ? ' min="' + min + '"' : '')
      + (max !== '' ? ' max="' + max + '"' : '') + '>';
  },

  dateInput(name, value = '') {
    return '<input class="form-input" type="date" id="field_' + name + '" name="' + name + '"'
      + (value ? ' value="' + value + '"' : '') + '>';
  },

  selectInput(name, options, selected = '') {
    return '<select class="form-select" id="field_' + name + '" name="' + name + '">'
      + this.buildOptions(options, selected) + '</select>';
  },

  textareaInput(name, placeholder = '', value = '', rows = 3) {
    return '<textarea class="form-input form-textarea" id="field_' + name + '" name="' + name + '"'
      + ' placeholder="' + this._escapeHTML(placeholder) + '" rows="' + rows + '">'
      + this._escapeHTML(value) + '</textarea>';
  },

  fileInput(name, accept = '') {
    return '<input class="form-input" type="file" id="field_' + name + '" name="' + name + '"'
      + (accept ? ' accept="' + accept + '"' : '') + '>';
  },
};
