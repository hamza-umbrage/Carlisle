// Main Application Logic
let currentRole = 'contractor';

// ── Helpers ────────────────────────────────────────────────

function getUserRole() {
  const user = API.getUser();
  return (user && (user.roleKey || user.role)) || 'contractor';
}

function getUserPermissions() {
  const config = roleConfig[currentRole];
  return (config && config.permissions) || {};
}

function formatDateShort(d) {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now - date) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatStatLabel(key) {
  const labels = {
    activeJobs: 'Active Jobs', pendingInspections: 'Pending Inspections',
    completedWarranties: 'Registered Warranties', documentsAccessed: 'Documents Accessed',
    activeCustomers: 'Active Customers', pendingLeads: 'Pending Leads',
    completedSales: 'Completed Sales', territoryJobs: 'Territory Jobs',
    totalUsers: 'Total Users', systemUptime: 'System Uptime',
    assignedInspections: 'Assigned Inspections', completedToday: 'Completed Today',
    pendingReports: 'Pending Reports', avgCompletionTime: 'Avg. Completion Time'
  };
  return labels[key] || key;
}

function getJobStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('progress')) return 'job-status-progress';
  if (s.includes('planning')) return 'job-status-planning';
  if (s.includes('completed') || s.includes('passed')) return 'job-status-completed';
  if (s.includes('pending') || s.includes('scheduled')) return 'job-status-pending';
  return 'job-status-default';
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('progress')) return 'badge-progress';
  if (s.includes('pending')) return 'badge-pending';
  if (s.includes('planning')) return 'badge-planning';
  if (s.includes('completed') || s.includes('passed')) return 'badge-completed';
  if (s.includes('scheduled')) return 'badge-scheduled';
  if (s.includes('failed')) return 'badge-inactive';
  if (s.includes('active')) return 'badge-active';
  if (s.includes('expired')) return 'badge-expired';
  return 'badge-notstarted';
}

// ── Init ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNavBar();
  attachStatCardListeners();
  initSectionSearch();
  initSectionFilters();
  initAdminTabs();
  initProfileButton();
  initCreateButtons();
});

function updateDashboard(role) {
  currentRole = role;
  const config = roleConfig[role];
  if (!config) return;

  // Update header user name
  const headerName = document.getElementById('headerUserName');
  if (headerName) headerName.textContent = window._userName || '';

  updateNavForRole(role);
  updateWelcomeSection(config);
  updateStatsSection(config);
  updateFeaturesGrid(config);
  updateActivitySection(config);
  updateCreateButtonVisibility();

  document.querySelector('.dashboard').classList.add('updating');
  setTimeout(() => document.querySelector('.dashboard').classList.remove('updating'), 300);
}

// ── Role-Aware Navigation (Phase 4B) ──────────────────────

const roleNavItems = {
  'contractor': ['dashboard', 'jobs', 'inspections', 'warranties', 'documents', 'support'],
  'inspector': ['dashboard', 'inspections', 'documents', 'support'],
  'sales-rep': ['dashboard', 'jobs', 'inspections', 'warranties', 'documents', 'support'],
  'ccm-employee': ['dashboard', 'jobs', 'inspections', 'warranties', 'documents', 'admin', 'support'],
  'guest': ['dashboard', 'documents', 'support'],
};

function updateNavForRole(role) {
  const allowed = roleNavItems[role] || roleNavItems['contractor'];
  document.querySelectorAll('#navLinks li').forEach(li => {
    const link = li.querySelector('.nav-link');
    if (!link) return;
    const section = link.getAttribute('data-section');
    if (section === 'admin') {
      li.classList.toggle('nav-hidden', !allowed.includes('admin'));
    } else {
      li.style.display = allowed.includes(section) ? '' : 'none';
    }
  });
}

function updateCreateButtonVisibility() {
  const perms = getUserPermissions();
  const jobBtn = document.getElementById('createJobBtn');
  const inspBtn = document.getElementById('createInspectionBtn');
  const warBtn = document.getElementById('createWarrantyBtn');
  if (jobBtn) jobBtn.classList.toggle('nav-hidden', !perms.createJobs);
  if (inspBtn) inspBtn.classList.toggle('nav-hidden', !perms.requestInspections);
  if (warBtn) warBtn.classList.toggle('nav-hidden', !perms.registerWarranties);
}

// ── Welcome ────────────────────────────────────────────────

function updateWelcomeSection(config) {
  const title = document.getElementById('welcomeTitle');
  const name = window._userName || config.name;
  title.textContent = 'Welcome, ' + name;
}

// ── Stats ──────────────────────────────────────────────────

function updateStatsSection(config) {
  const statsSection = document.getElementById('statsSection');
  if (!config.stats) { statsSection.style.display = 'none'; return; }

  statsSection.style.display = 'grid';
  const statCards = statsSection.querySelectorAll('.stat-card');
  const statEntries = Object.entries(config.stats);

  statCards.forEach((card, index) => {
    if (index < statEntries.length) {
      const [key, value] = statEntries[index];
      card.querySelector('h3').textContent = value;
      card.querySelector('p').textContent = formatStatLabel(key);
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  populateStatDetails();
}

async function populateStatDetails() {
  const statsSection = document.getElementById('statsSection');
  let jobs, inspections, warranties;
  try {
    const [jd, id, wd] = await Promise.all([API.get('/jobs'), API.get('/inspections'), API.get('/warranties')]);
    jobs = jd.jobs || []; inspections = id.inspections || []; warranties = wd.warranties || [];
  } catch {
    jobs = (typeof demoData !== 'undefined' && demoData.jobs) || [];
    inspections = (typeof demoData !== 'undefined' && demoData.inspections) || [];
    warranties = (typeof demoData !== 'undefined' && demoData.warranties) || [];
  }

  const jobsCard = statsSection.querySelector('[data-stat="activeJobs"]');
  const detailJobs = document.getElementById('detailActiveJobs');
  if (jobsCard && jobs.length > 0) {
    const ip = jobs.filter(j => j.status === 'In Progress').length;
    const pl = jobs.filter(j => j.status === 'Planning').length;
    const co = jobs.filter(j => j.status === 'Completed').length;
    const sqft = jobs.reduce((s, j) => s + (j.squareFeet || 0), 0);
    jobsCard.querySelector('h3').textContent = jobs.length;
    if (detailJobs) {
      const parts = [];
      if (ip) parts.push(ip + ' In Progress');
      if (pl) parts.push(pl + ' Planning');
      if (co) parts.push(co + ' Completed');
      detailJobs.textContent = parts.join(' \u00b7 ') + ' \u00b7 ' + sqft.toLocaleString() + ' sq ft';
    }
  }

  const inspCard = statsSection.querySelector('[data-stat="pendingInspections"]');
  const detailInsp = document.getElementById('detailPendingInspections');
  if (inspCard && inspections.length > 0) {
    inspCard.querySelector('h3').textContent = inspections.length;
    if (detailInsp) {
      const pending = inspections.filter(i => i.status === 'Scheduled' || i.status === 'Pending').sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      if (pending.length > 0) {
        const n = pending[0];
        detailInsp.textContent = 'Next: ' + formatDateShort(n.scheduledDate) + ' \u00b7 ' + n.type + ' \u00b7 ' + (n.inspector || 'Unassigned');
      } else { detailInsp.textContent = 'No upcoming inspections'; }
    }
  }

  const warCard = statsSection.querySelector('[data-stat="completedWarranties"]');
  const detailWar = document.getElementById('detailWarranties');
  if (warCard && warranties.length > 0) {
    warCard.querySelector('h3').textContent = warranties.length;
    if (detailWar) {
      const active = warranties.filter(w => w.status === 'Active').length;
      const cov = warranties.reduce((s, w) => s + (w.squareFeet || 0), 0);
      detailWar.textContent = active + ' Active \u00b7 ' + cov.toLocaleString() + ' sq ft covered';
    }
  }
}

// ── Features Grid (Phase 4C) ──────────────────────────────

const featureRoutes = {
  'job-management': () => navigateToSection('jobs'),
  'inspection-request': () => openCreateInspectionForm(),
  'warranty-registration': () => openCreateWarrantyForm(),
  'admin-panel': () => navigateToSection('admin'),
  'user-management': () => navigateToSection('admin'),
  'all-jobs': () => navigateToSection('jobs'),
  'inspection-management': () => navigateToSection('inspections'),
  'warranty-admin': () => navigateToSection('warranties'),
  'inspection-queue': () => navigateToSection('inspections'),
  'job-overview': () => navigateToSection('jobs'),
  'inspection-tracking': () => navigateToSection('inspections'),
  'warranty-support': () => navigateToSection('warranties'),
  'product-search': () => navigateToSection('documents'),
  'ccm-communication': () => openSupportModal(),
  'contact-info': () => openSupportModal(),
};

function updateFeaturesGrid(config) {
  const grid = document.getElementById('featuresGrid');
  grid.innerHTML = '';
  config.features.forEach(f => {
    const card = document.createElement('div');
    card.className = 'feature-card' + (f.enabled ? '' : ' disabled');
    card.innerHTML = '<div class="feature-content"><h3>' + f.name + '</h3><p>' + f.description.slice(0, 80) + '...</p></div>';
    if (f.enabled) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const handler = featureRoutes[f.id];
        if (handler) handler();
        else UI.showToast(f.name + ' — Coming soon', 'info');
      });
    }
    grid.appendChild(card);
  });
}

// ── Activity Section (Phase 4D) ───────────────────────────

async function updateActivitySection(config) {
  const section = document.getElementById('activitySection');
  const list = document.getElementById('activityList');
  if (!section || !list) return;

  let activities;
  try {
    const data = await API.get('/activity?limit=10');
    activities = data.activities || data.activity || [];
  } catch {
    activities = (config && config.recentActivity) || [];
  }

  if (!activities.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = '';
  activities.forEach(a => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = '<div class="activity-content">'
      + '<p class="activity-action">' + (a.action || a.details || '') + '</p>'
      + '<p class="activity-date">' + formatDate(a.date || a.created_at || a.timestamp || '') + '</p>'
      + '</div><div class="activity-type"><span class="type-badge">' + (a.type || '') + '</span></div>';
    list.appendChild(item);
  });
}

// ── Stat Card Listeners ───────────────────────────────────

function attachStatCardListeners() {
  const statsSection = document.getElementById('statsSection');
  if (!statsSection) return;
  statsSection.querySelectorAll('.stat-card').forEach(card => {
    const stat = card.getAttribute('data-stat');
    if (stat === 'activeJobs') card.addEventListener('click', () => navigateToSection('jobs'));
    else if (stat === 'pendingInspections') card.addEventListener('click', () => navigateToSection('inspections'));
    else if (stat === 'completedWarranties') card.addEventListener('click', () => navigateToSection('warranties'));
  });
}

// ── Navigation ─────────────────────────────────────────────

function initNavBar() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      navigateToSection(section);
    });
  });
}

function navigateToSection(section) {
  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector('.nav-link[data-section="' + section + '"]');
  if (activeLink) activeLink.classList.add('active');

  // Hide all sections
  document.querySelector('.dashboard').style.display = 'none';
  document.querySelectorAll('.content-section').forEach(s => s.classList.add('nav-hidden'));

  if (section === 'dashboard') {
    document.querySelector('.dashboard').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (section === 'support') { openSupportModal(); return; }

  const sectionId = 'section' + section.charAt(0).toUpperCase() + section.slice(1);
  const el = document.getElementById(sectionId);
  if (el) {
    el.classList.remove('nav-hidden');
    loadSectionData(section);
  }
}

async function loadSectionData(section) {
  switch (section) {
    case 'jobs': await loadJobsSection(); break;
    case 'inspections': await loadInspectionsSection(); break;
    case 'warranties': await loadWarrantiesSection(); break;
    case 'documents': await loadDocumentsSection(); break;
    case 'admin': await loadAdminSection(); break;
  }
}

// ── Section: Jobs (Phase 3) ───────────────────────────────

let _jobsCache = [];

async function loadJobsSection(statusFilter, searchTerm) {
  const container = document.getElementById('jobsListContainer');
  UI.showSpinner(container);
  try {
    let url = '/jobs';
    if (statusFilter && statusFilter !== 'all') url += '?status=' + encodeURIComponent(statusFilter);
    const data = await API.get(url);
    _jobsCache = data.jobs || [];
  } catch { _jobsCache = (typeof demoData !== 'undefined' && demoData.jobs) || []; }

  let jobs = _jobsCache;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    jobs = jobs.filter(j => (j.name || '').toLowerCase().includes(q) || (j.id || '').toLowerCase().includes(q) || (j.contractor || '').toLowerCase().includes(q));
  }

  UI.hideSpinner(container);
  if (jobs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\ud83d\udcbc</div><p>No jobs found</p></div>';
    return;
  }
  container.innerHTML = '';
  jobs.forEach(job => {
    const progressColor = job.progress >= 100 ? '#10b981' : job.progress >= 50 ? '#3b82f6' : '#f59e0b';
    const card = document.createElement('div');
    card.className = 'job-card ' + getJobStatusClass(job.status);
    card.innerHTML = '<div class="job-card-top"><div class="job-card-info">'
      + '<div class="job-card-title">' + job.name + '</div>'
      + '<div class="job-card-sub">#' + job.id + ' \u00b7 ' + (job.contractor || '') + ' \u00b7 ' + job.type + '</div>'
      + '</div><span class="modal-list-badge ' + getStatusBadgeClass(job.status) + '">' + job.status + '</span></div>'
      + '<div class="job-card-details"><span>' + (job.squareFeet || 0).toLocaleString() + ' sq ft</span>'
      + '<span>' + formatDateShort(job.startDate) + ' \u2192 ' + formatDateShort(job.estimatedCompletion || job.completionDate) + '</span></div>'
      + '<div class="job-card-progress"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:' + job.progress + '%;background:' + progressColor + '"></div></div>'
      + '<span class="progress-label">' + job.progress + '%</span></div>'
      + '<div class="job-card-products">' + (job.products || []).map(p => '<span class="product-chip">' + p + '</span>').join('') + '</div>';
    card.addEventListener('click', () => openJobDetailModal(job));
    container.appendChild(card);
  });
}

function openJobDetailModal(job) {
  const overlay = document.getElementById('detailOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const perms = getUserPermissions();

  title.textContent = job.name;
  const progressColor = job.progress >= 100 ? '#10b981' : job.progress >= 50 ? '#3b82f6' : '#f59e0b';

  let html = '<div class="job-detail-section">'
    + '<div class="job-detail-row"><span class="job-detail-label">Job ID</span><span>' + job.id + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Contractor</span><span>' + (job.contractor || '') + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Type</span><span>' + job.type + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Square Footage</span><span>' + (job.squareFeet || 0).toLocaleString() + ' sq ft</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Start Date</span><span>' + formatDateShort(job.startDate) + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">' + (job.completionDate ? 'Completed' : 'Est. Completion') + '</span><span>' + formatDateShort(job.completionDate || job.estimatedCompletion) + '</span></div>'
    + '</div>'
    + '<div style="margin:16px 0"><div style="display:flex;justify-content:space-between;margin-bottom:4px">'
    + '<span style="font-size:0.8125rem;font-weight:600;color:#374151">Progress</span>'
    + '<span style="font-size:0.8125rem;font-weight:600;color:' + progressColor + '">' + job.progress + '%</span></div>'
    + '<div class="progress-bar-track" style="height:10px"><div class="progress-bar-fill" style="width:' + job.progress + '%;background:' + progressColor + '"></div></div></div>';

  if (job.products && job.products.length) {
    html += '<div style="margin-bottom:16px"><span class="doc-group-title">Products</span>'
      + '<div class="modal-job-products" style="margin-top:6px">' + job.products.map(p => '<span class="product-chip">' + p + '</span>').join('') + '</div></div>';
  }

  if (job.inspections && job.inspections.length) {
    html += '<div style="margin-bottom:16px"><span class="doc-group-title">Inspections</span>';
    job.inspections.forEach(insp => {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6">'
        + '<div><div style="font-size:0.875rem;font-weight:500">' + insp.type + '</div>'
        + '<div style="font-size:0.75rem;color:#9ca3af">' + formatDateShort(insp.date) + ' \u00b7 ' + (insp.inspector || 'Unassigned') + '</div></div>'
        + '<span class="modal-list-badge ' + getStatusBadgeClass(insp.status) + '">' + insp.status + '</span></div>';
    });
    html += '</div>';
  }

  // Action buttons
  html += '<div class="modal-footer">';
  if (perms.editOwnJobs) {
    html += '<button type="button" class="btn btn-outline btn-sm" onclick="openEditJobForm(\'' + job.id + '\')">Edit</button>';
  }
  if (perms.deleteOwnJobs) {
    html += '<button type="button" class="btn btn-danger btn-sm" onclick="deleteJob(\'' + job.id + '\')">Delete</button>';
  }
  if (perms.requestInspections) {
    html += '<button type="button" class="btn btn-primary btn-sm" onclick="openCreateInspectionForm(\'' + job.id + '\')">Request Inspection</button>';
  }
  html += '</div>';

  body.innerHTML = html;
  overlay.style.display = 'flex';
}

// ── Section: Inspections ──────────────────────────────────

let _inspectionsCache = [];

async function loadInspectionsSection(statusFilter, searchTerm) {
  const container = document.getElementById('inspectionsListContainer');
  UI.showSpinner(container);
  try {
    let url = '/inspections';
    if (statusFilter && statusFilter !== 'all') url += '?status=' + encodeURIComponent(statusFilter);
    const data = await API.get(url);
    _inspectionsCache = data.inspections || [];
  } catch { _inspectionsCache = (typeof demoData !== 'undefined' && demoData.inspections) || []; }

  let inspections = _inspectionsCache;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    inspections = inspections.filter(i => (i.id || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q) || (i.jobId || '').toLowerCase().includes(q) || (i.inspector || '').toLowerCase().includes(q));
  }

  UI.hideSpinner(container);
  if (inspections.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\ud83d\udd0d</div><p>No inspections found</p></div>';
    return;
  }
  container.innerHTML = '';
  inspections.forEach(insp => {
    const card = document.createElement('div');
    card.className = 'job-card ' + getJobStatusClass(insp.status);
    card.innerHTML = '<div class="job-card-top"><div class="job-card-info">'
      + '<div class="job-card-title">' + insp.type + ' Inspection</div>'
      + '<div class="job-card-sub">#' + insp.id + ' \u00b7 Job ' + insp.jobId + '</div>'
      + '</div><span class="modal-list-badge ' + getStatusBadgeClass(insp.status) + '">' + insp.status + '</span></div>'
      + '<div class="job-card-details"><span>Inspector: ' + (insp.inspector || 'Unassigned') + '</span><span>' + formatDateShort(insp.scheduledDate) + '</span></div>'
      + ((insp.checklist && insp.checklist.length) ? '<div class="modal-insp-checklist">' + insp.checklist.map(c => '<span class="checklist-chip">' + c + '</span>').join('') + '</div>' : '')
      + (insp.notes ? '<div class="modal-insp-notes">' + insp.notes + '</div>' : '');
    card.addEventListener('click', () => openInspectionDetailModal(insp));
    container.appendChild(card);
  });
}

function openInspectionDetailModal(insp) {
  const overlay = document.getElementById('detailOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const user = API.getUser();
  const isInspector = user && (user.role === 'inspector' || user.roleKey === 'inspector');
  const isAdmin = user && (user.role === 'ccm_employee' || user.roleKey === 'ccm-employee');

  title.textContent = insp.type + ' Inspection';
  let html = '<div class="job-detail-section">'
    + '<div class="job-detail-row"><span class="job-detail-label">ID</span><span>' + insp.id + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Job</span><span>' + insp.jobId + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Type</span><span>' + insp.type + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Status</span><span class="modal-list-badge ' + getStatusBadgeClass(insp.status) + '">' + insp.status + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Scheduled</span><span>' + formatDateShort(insp.scheduledDate) + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Inspector</span><span>' + (insp.inspector || 'Unassigned') + '</span></div>'
    + '</div>';

  if (insp.checklist && insp.checklist.length) {
    html += '<div style="margin:12px 0"><span class="doc-group-title">Checklist</span>'
      + '<div class="modal-insp-checklist" style="margin-top:6px">' + insp.checklist.map(c => '<span class="checklist-chip">' + c + '</span>').join('') + '</div></div>';
  }
  if (insp.notes) {
    html += '<div style="margin:12px 0"><span class="doc-group-title">Notes</span><div class="modal-insp-notes">' + insp.notes + '</div></div>';
  }

  html += '<div class="modal-footer">';
  if (isInspector || isAdmin) {
    html += '<button type="button" class="btn btn-outline btn-sm" onclick="openEditInspectionForm(\'' + insp.id + '\')">Update</button>';
  }
  if (isAdmin) {
    html += '<button type="button" class="btn btn-danger btn-sm" onclick="deleteInspection(\'' + insp.id + '\')">Delete</button>';
  }
  html += '</div>';

  body.innerHTML = html;
  overlay.style.display = 'flex';
}

// ── Section: Warranties ───────────────────────────────────

let _warrantiesCache = [];

async function loadWarrantiesSection(statusFilter, searchTerm) {
  const container = document.getElementById('warrantiesListContainer');
  UI.showSpinner(container);
  try {
    let url = '/warranties';
    if (statusFilter && statusFilter !== 'all') url += '?status=' + encodeURIComponent(statusFilter);
    const data = await API.get(url);
    _warrantiesCache = data.warranties || [];
  } catch { _warrantiesCache = (typeof demoData !== 'undefined' && demoData.warranties) || []; }

  let warranties = _warrantiesCache;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    warranties = warranties.filter(w => (w.id || '').toLowerCase().includes(q) || (w.contractor || '').toLowerCase().includes(q) || (w.jobId || '').toLowerCase().includes(q));
  }

  UI.hideSpinner(container);
  if (warranties.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\ud83d\udee1\ufe0f</div><p>No warranties found</p></div>';
    return;
  }
  container.innerHTML = '';
  warranties.forEach(war => {
    const card = document.createElement('div');
    card.className = 'job-card job-status-completed';
    card.innerHTML = '<div class="job-card-top"><div class="job-card-info">'
      + '<div class="job-card-title">' + war.warrantyType + ' Warranty</div>'
      + '<div class="job-card-sub">#' + war.id + ' \u00b7 Job ' + war.jobId + '</div>'
      + '</div><span class="modal-list-badge ' + getStatusBadgeClass(war.status) + '">' + war.status + '</span></div>'
      + '<div class="job-card-details"><span>' + (war.contractor || '') + '</span>'
      + '<span>' + (war.squareFeet || 0).toLocaleString() + ' sq ft</span>'
      + '<span>' + (war.duration || '') + '</span></div>'
      + '<div class="job-card-products">' + (war.products || []).map(p => '<span class="product-chip">' + p + '</span>').join('') + '</div>'
      + '<div class="modal-insp-notes">Registered ' + formatDateShort(war.registrationDate) + '</div>';
    card.addEventListener('click', () => openWarrantyDetailModal(war));
    container.appendChild(card);
  });
}

function openWarrantyDetailModal(war) {
  const overlay = document.getElementById('detailOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const user = API.getUser();
  const isAdmin = user && (user.role === 'ccm_employee' || user.roleKey === 'ccm-employee');

  title.textContent = war.warrantyType + ' Warranty';
  let html = '<div class="job-detail-section">'
    + '<div class="job-detail-row"><span class="job-detail-label">ID</span><span>' + war.id + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Job</span><span>' + war.jobId + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Contractor</span><span>' + (war.contractor || '') + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Type</span><span>' + war.warrantyType + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Duration</span><span>' + (war.duration || '') + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Status</span><span class="modal-list-badge ' + getStatusBadgeClass(war.status) + '">' + war.status + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Square Feet</span><span>' + (war.squareFeet || 0).toLocaleString() + '</span></div>'
    + '<div class="job-detail-row"><span class="job-detail-label">Registered</span><span>' + formatDateShort(war.registrationDate) + '</span></div>'
    + '</div>';

  if (war.products && war.products.length) {
    html += '<div style="margin:12px 0"><span class="doc-group-title">Products</span>'
      + '<div class="modal-job-products" style="margin-top:6px">' + war.products.map(p => '<span class="product-chip">' + p + '</span>').join('') + '</div></div>';
  }

  if (isAdmin) {
    html += '<div class="modal-footer">'
      + '<button type="button" class="btn btn-outline btn-sm" onclick="openEditWarrantyForm(\'' + war.id + '\')">Edit</button>'
      + '<button type="button" class="btn btn-danger btn-sm" onclick="deleteWarranty(\'' + war.id + '\')">Delete</button>'
      + '</div>';
  }

  body.innerHTML = html;
  overlay.style.display = 'flex';
}

// ── Section: Documents ────────────────────────────────────

async function loadDocumentsSection() {
  const container = document.getElementById('documentsContainer');
  UI.showSpinner(container);
  let products;
  try {
    const data = await API.get('/products');
    products = data.products || [];
  } catch { products = (typeof demoData !== 'undefined' && demoData.products) || []; }

  UI.hideSpinner(container);
  let html = '<h3 style="margin-bottom:16px;color:var(--gray-700)">Product Documents</h3>';
  if (products.length === 0) {
    html += '<div class="empty-state"><p>No documents available</p></div>';
  } else {
    products.forEach(prod => {
      html += '<div class="modal-job-card job-status-default" style="border-left-color:#6366f1;margin-bottom:12px;cursor:default">'
        + '<div class="modal-job-header"><div>'
        + '<div class="modal-list-title">' + prod.name + '</div>'
        + '<div class="modal-list-subtitle">' + (prod.category || '') + '</div></div></div>'
        + '<div class="modal-job-meta">'
        + '<span>' + (prod.specifications ? prod.specifications.thickness : '') + '</span>'
        + '<span>' + (prod.specifications ? prod.specifications.width : '') + '</span>'
        + '<span>' + (prod.specifications ? prod.specifications.color : '') + '</span>'
        + '<span>' + (prod.specifications ? prod.specifications.warranty : '') + '</span></div>';
      if (prod.documents && prod.documents.length) {
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
        prod.documents.forEach(doc => {
          html += '<span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#1e293b;color:#94a3b8;border-radius:6px;font-size:0.75rem;font-weight:500">'
            + doc.name + ' <span style="color:#64748b">(' + (doc.size || doc.file_size || '') + ')</span></span>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
  }
  container.innerHTML = html;
}

// ── Search & Filter Wiring ────────────────────────────────

function initSectionSearch() {
  const sections = [
    { search: 'jobsSearch', loader: () => loadJobsSection(getActiveFilter('jobsFilterBar'), document.getElementById('jobsSearch').value) },
    { search: 'inspectionsSearch', loader: () => loadInspectionsSection(getActiveFilter('inspectionsFilterBar'), document.getElementById('inspectionsSearch').value) },
    { search: 'warrantiesSearch', loader: () => loadWarrantiesSection(getActiveFilter('warrantiesFilterBar'), document.getElementById('warrantiesSearch').value) },
  ];
  sections.forEach(({ search, loader }) => {
    const input = document.getElementById(search);
    if (!input) return;
    let timeout;
    input.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(loader, 300); });
  });
}

function initSectionFilters() {
  ['jobsFilterBar', 'inspectionsFilterBar', 'warrantiesFilterBar'].forEach(barId => {
    const bar = document.getElementById(barId);
    if (!bar) return;
    bar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-filter');
        if (barId === 'jobsFilterBar') loadJobsSection(filter, document.getElementById('jobsSearch').value);
        else if (barId === 'inspectionsFilterBar') loadInspectionsSection(filter, document.getElementById('inspectionsSearch').value);
        else if (barId === 'warrantiesFilterBar') loadWarrantiesSection(filter, document.getElementById('warrantiesSearch').value);
      });
    });
  });
}

function getActiveFilter(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return 'all';
  const active = bar.querySelector('.filter-chip.active');
  return active ? active.getAttribute('data-filter') : 'all';
}

// ── Create Buttons ────────────────────────────────────────

function initCreateButtons() {
  const jobBtn = document.getElementById('createJobBtn');
  const inspBtn = document.getElementById('createInspectionBtn');
  const warBtn = document.getElementById('createWarrantyBtn');
  if (jobBtn) jobBtn.addEventListener('click', () => openCreateJobForm());
  if (inspBtn) inspBtn.addEventListener('click', () => openCreateInspectionForm());
  if (warBtn) warBtn.addEventListener('click', () => openCreateWarrantyForm());
}

// ── CRUD: Jobs ────────────────────────────────────────────

function openCreateJobForm() {
  const html = '<div class="form-row">'
    + UI.formGroup('name', 'Job Name', UI.textInput('name', 'e.g. Downtown Office Reroof', '', true), true)
    + UI.formGroup('type', 'Job Type', UI.selectInput('type', ['Commercial', 'Residential', 'Industrial']), true)
    + '</div><div class="form-row">'
    + UI.formGroup('startDate', 'Start Date', UI.dateInput('startDate'))
    + UI.formGroup('estimatedCompletion', 'Est. Completion', UI.dateInput('estimatedCompletion'))
    + '</div>'
    + UI.formGroup('squareFeet', 'Square Footage', UI.numberInput('squareFeet', 'e.g. 25000', '', 0))
    + UI.formGroup('products', 'Products', UI.textInput('products', 'TPO Membrane, Insulation Board (comma-separated)'));

  UI.openFormModal('New Job', html, async (data) => {
    if (!data.name) throw new Error('Job name is required');
    if (!data.type) throw new Error('Job type is required');
    const body = {
      name: data.name,
      type: data.type,
      startDate: data.startDate || undefined,
      estimatedCompletion: data.estimatedCompletion || undefined,
      squareFeet: data.squareFeet || undefined,
      products: data.products ? data.products.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    };
    await API.post('/jobs', body);
    UI.showToast('Job created successfully', 'success');
    closeDetailModal();
    loadJobsSection();
  });
}

async function openEditJobForm(code) {
  let job;
  try { job = (await API.get('/jobs/' + code)).job || (await API.get('/jobs/' + code)); } catch { UI.showToast('Failed to load job', 'error'); return; }

  const html = '<div class="form-row">'
    + UI.formGroup('name', 'Job Name', UI.textInput('name', '', job.name || '', true), true)
    + UI.formGroup('type', 'Job Type', UI.selectInput('type', ['Commercial', 'Residential', 'Industrial'], job.type), true)
    + '</div><div class="form-row">'
    + UI.formGroup('status', 'Status', UI.selectInput('status', ['Planning', 'In Progress', 'Completed'], job.status))
    + UI.formGroup('progress', 'Progress (%)', UI.numberInput('progress', '0-100', job.progress, 0, 100))
    + '</div><div class="form-row">'
    + UI.formGroup('startDate', 'Start Date', UI.dateInput('startDate', (job.startDate || '').slice(0, 10)))
    + UI.formGroup('estimatedCompletion', 'Est. Completion', UI.dateInput('estimatedCompletion', (job.estimatedCompletion || '').slice(0, 10)))
    + '</div>'
    + UI.formGroup('squareFeet', 'Square Footage', UI.numberInput('squareFeet', '', job.squareFeet, 0));

  UI.openFormModal('Edit Job — ' + code, html, async (data) => {
    const body = {};
    if (data.name) body.name = data.name;
    if (data.type) body.type = data.type;
    if (data.status) body.status = data.status;
    if (data.progress !== null && data.progress !== '') body.progress = Number(data.progress);
    if (data.startDate) body.startDate = data.startDate;
    if (data.estimatedCompletion) body.estimatedCompletion = data.estimatedCompletion;
    if (data.squareFeet) body.squareFeet = data.squareFeet;
    await API.put('/jobs/' + code, body);
    UI.showToast('Job updated', 'success');
    closeDetailModal();
    loadJobsSection();
  });
}

async function deleteJob(code) {
  const ok = await UI.showConfirm('Delete Job', 'Are you sure you want to delete job ' + code + '? This cannot be undone.', 'Delete');
  if (!ok) return;
  try {
    await API.del('/jobs/' + code);
    UI.showToast('Job deleted', 'success');
    closeDetailModal();
    loadJobsSection();
  } catch (err) { UI.showToast(err.message, 'error'); }
}

// ── CRUD: Inspections ─────────────────────────────────────

async function openCreateInspectionForm(prefilledJobId) {
  let jobs = [];
  try { jobs = (await API.get('/jobs')).jobs || []; } catch {}
  const jobOptions = jobs.map(j => ({ value: j.id, label: j.id + ' — ' + j.name }));
  if (jobOptions.length === 0) jobOptions.push({ value: '', label: 'No jobs available' });

  const checklistItems = ['Substrate Preparation', 'Insulation', 'Membrane Application', 'Seam Welding', 'Flashing', 'Drainage'];

  const html = UI.formGroup('jobId', 'Job', UI.selectInput('jobId', jobOptions, prefilledJobId || ''), true)
    + UI.formGroup('type', 'Inspection Type', UI.selectInput('type', ['Pre-Installation', 'Mid-Installation', 'Final']), true)
    + UI.formGroup('scheduledDate', 'Scheduled Date', UI.dateInput('scheduledDate'))
    + '<div class="form-group"><label class="form-label">Checklist Items</label>'
    + '<div class="form-checkbox-group">' + checklistItems.map(item =>
      '<label class="form-checkbox-label"><input type="checkbox" name="checklist" value="' + item + '"> ' + item + '</label>'
    ).join('') + '</div></div>';

  UI.openFormModal('Request Inspection', html, async (data) => {
    if (!data.jobId) throw new Error('Please select a job');
    if (!data.type) throw new Error('Please select an inspection type');
    await API.post('/inspections', {
      jobId: data.jobId,
      type: data.type,
      scheduledDate: data.scheduledDate || undefined,
      checklist: data.checklist || [],
    });
    UI.showToast('Inspection requested', 'success');
    closeDetailModal();
    loadInspectionsSection();
  });
}

async function openEditInspectionForm(code) {
  let insp;
  try { const data = await API.get('/inspections/' + code); insp = data.inspection || data; } catch { UI.showToast('Failed to load inspection', 'error'); return; }

  const statuses = ['Scheduled', 'Pending', 'In Progress', 'Completed', 'Passed', 'Failed'];
  const html = UI.formGroup('status', 'Status', UI.selectInput('status', statuses, insp.status))
    + UI.formGroup('notes', 'Notes', UI.textareaInput('notes', 'Add inspection notes...', insp.notes || '', 4));

  UI.openFormModal('Update Inspection — ' + code, html, async (data) => {
    const body = {};
    if (data.status) body.status = data.status;
    if (data.notes !== undefined) body.notes = data.notes;
    await API.put('/inspections/' + code, body);
    UI.showToast('Inspection updated', 'success');
    closeDetailModal();
    loadInspectionsSection();
  });
}

async function deleteInspection(code) {
  const ok = await UI.showConfirm('Delete Inspection', 'Delete inspection ' + code + '?', 'Delete');
  if (!ok) return;
  try {
    await API.del('/inspections/' + code);
    UI.showToast('Inspection deleted', 'success');
    closeDetailModal();
    loadInspectionsSection();
  } catch (err) { UI.showToast(err.message, 'error'); }
}

// ── CRUD: Warranties ──────────────────────────────────────

async function openCreateWarrantyForm(prefilledJobId) {
  let jobs = [];
  try { jobs = (await API.get('/jobs')).jobs || []; } catch {}
  const jobOptions = jobs.map(j => ({ value: j.id, label: j.id + ' — ' + j.name }));
  if (jobOptions.length === 0) jobOptions.push({ value: '', label: 'No jobs available' });

  const html = UI.formGroup('jobId', 'Job', UI.selectInput('jobId', jobOptions, prefilledJobId || ''), true)
    + '<div class="form-row">'
    + UI.formGroup('warrantyType', 'Warranty Type', UI.selectInput('warrantyType', ['Total System', 'Standard']), true)
    + UI.formGroup('duration', 'Duration', UI.textInput('duration', 'e.g. 20 years', '', true), true)
    + '</div>'
    + UI.formGroup('squareFeet', 'Square Footage', UI.numberInput('squareFeet', 'e.g. 25000', '', 0))
    + UI.formGroup('products', 'Products', UI.textInput('products', 'TPO Membrane, Insulation (comma-separated)'));

  UI.openFormModal('Register Warranty', html, async (data) => {
    if (!data.jobId) throw new Error('Please select a job');
    if (!data.warrantyType) throw new Error('Warranty type is required');
    if (!data.duration) throw new Error('Duration is required');
    await API.post('/warranties', {
      jobId: data.jobId,
      warrantyType: data.warrantyType,
      duration: data.duration,
      squareFeet: data.squareFeet || undefined,
      products: data.products ? data.products.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    });
    UI.showToast('Warranty registered', 'success');
    closeDetailModal();
    loadWarrantiesSection();
  });
}

async function openEditWarrantyForm(code) {
  let war;
  try { const data = await API.get('/warranties/' + code); war = data.warranty || data; } catch { UI.showToast('Failed to load warranty', 'error'); return; }

  const html = UI.formGroup('status', 'Status', UI.selectInput('status', ['Active', 'Pending', 'Expired'], war.status))
    + UI.formGroup('warrantyType', 'Warranty Type', UI.selectInput('warrantyType', ['Total System', 'Standard'], war.warrantyType))
    + UI.formGroup('duration', 'Duration', UI.textInput('duration', '', war.duration || ''));

  UI.openFormModal('Edit Warranty — ' + code, html, async (data) => {
    const body = {};
    if (data.status) body.status = data.status;
    if (data.warrantyType) body.warrantyType = data.warrantyType;
    if (data.duration) body.duration = data.duration;
    await API.put('/warranties/' + code, body);
    UI.showToast('Warranty updated', 'success');
    closeDetailModal();
    loadWarrantiesSection();
  });
}

async function deleteWarranty(code) {
  const ok = await UI.showConfirm('Delete Warranty', 'Delete warranty ' + code + '?', 'Delete');
  if (!ok) return;
  try {
    await API.del('/warranties/' + code);
    UI.showToast('Warranty deleted', 'success');
    closeDetailModal();
    loadWarrantiesSection();
  } catch (err) { UI.showToast(err.message, 'error'); }
}

// ── Admin Panel (Phase 5) ─────────────────────────────────

function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      if (tabName === 'users') loadAdminUsers();
      else if (tabName === 'activity') loadAdminActivity();
      else if (tabName === 'analytics') loadAdminAnalytics();
    });
  });
}

async function loadAdminSection() {
  // Default to users tab
  const activeTab = document.querySelector('.admin-tab.active');
  const tab = activeTab ? activeTab.getAttribute('data-tab') : 'users';
  if (tab === 'users') loadAdminUsers();
  else if (tab === 'activity') loadAdminActivity();
  else if (tab === 'analytics') loadAdminAnalytics();
}

async function loadAdminUsers() {
  const container = document.getElementById('adminContent');
  UI.showSpinner(container);
  let users = [];
  try {
    const data = await API.get('/users');
    users = data.users || [];
  } catch (err) {
    UI.hideSpinner(container);
    container.innerHTML = '<div class="empty-state"><p>Unable to load users. ' + (err.message || '') + '</p></div>';
    return;
  }

  UI.hideSpinner(container);
  let html = '<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="color:var(--gray-500);font-size:0.875rem">' + users.length + ' users</span>'
    + '<button type="button" class="btn btn-primary btn-sm" onclick="openCreateUserForm()">+ Create User</button></div>';

  html += '<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
  users.forEach(u => {
    const roleName = { contractor: 'Contractor', sales_rep: 'Sales Rep', ccm_employee: 'CCM Employee', inspector: 'Inspector', guest: 'Guest' }[u.role] || u.role;
    const statusBadge = u.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-inactive">Inactive</span>';
    html += '<tr><td>' + u.name + '</td><td>' + u.email + '</td><td>' + roleName + '</td><td>' + statusBadge + '</td>'
      + '<td class="actions-cell">'
      + '<button type="button" class="btn btn-secondary btn-sm" onclick="openEditUserForm(\'' + u.id + '\')">Edit</button>'
      + (u.is_active ? '<button type="button" class="btn btn-danger btn-sm" onclick="deactivateUser(\'' + u.id + '\')">Deactivate</button>' : '')
      + '</td></tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function openCreateUserForm() {
  const roles = [
    { value: 'contractor', label: 'Contractor' },
    { value: 'sales_rep', label: 'Sales Rep' },
    { value: 'ccm_employee', label: 'CCM Employee' },
    { value: 'inspector', label: 'Inspector' },
  ];
  const html = '<div class="form-row">'
    + UI.formGroup('name', 'Full Name', UI.textInput('name', 'John Smith', '', true), true)
    + UI.formGroup('email', 'Email', '<input class="form-input" type="email" id="field_email" name="email" placeholder="user@company.com" required>', true)
    + '</div>'
    + UI.formGroup('password', 'Password', '<input class="form-input" type="password" id="field_password" name="password" placeholder="Min 6 characters" required>', true)
    + '<div class="form-row">'
    + UI.formGroup('role', 'Role', UI.selectInput('role', roles))
    + UI.formGroup('phone', 'Phone', UI.textInput('phone', '(555) 123-4567'))
    + '</div>';

  UI.openFormModal('Create User', html, async (data) => {
    if (!data.name || !data.email || !data.password) throw new Error('Name, email, and password are required');
    await API.post('/users', data);
    UI.showToast('User created', 'success');
    closeDetailModal();
    loadAdminUsers();
  });
}

async function openEditUserForm(userId) {
  let users = [];
  try { users = (await API.get('/users')).users || []; } catch {}
  const user = users.find(u => u.id === userId);
  if (!user) { UI.showToast('User not found', 'error'); return; }

  const roles = [
    { value: 'contractor', label: 'Contractor' },
    { value: 'sales_rep', label: 'Sales Rep' },
    { value: 'ccm_employee', label: 'CCM Employee' },
    { value: 'inspector', label: 'Inspector' },
  ];
  const html = '<div class="form-row">'
    + UI.formGroup('name', 'Full Name', UI.textInput('name', '', user.name))
    + UI.formGroup('email', 'Email', '<input class="form-input" type="email" id="field_email" name="email" value="' + UI._escapeHTML(user.email) + '">')
    + '</div><div class="form-row">'
    + UI.formGroup('role', 'Role', UI.selectInput('role', roles, user.role))
    + UI.formGroup('phone', 'Phone', UI.textInput('phone', '', user.phone || ''))
    + '</div>';

  UI.openFormModal('Edit User', html, async (data) => {
    const body = {};
    if (data.name) body.name = data.name;
    if (data.email) body.email = data.email;
    if (data.role) body.role = data.role;
    if (data.phone !== undefined) body.phone = data.phone;
    await API.put('/users/' + userId, body);
    UI.showToast('User updated', 'success');
    closeDetailModal();
    loadAdminUsers();
  });
}

async function deactivateUser(userId) {
  const ok = await UI.showConfirm('Deactivate User', 'This will prevent the user from logging in.', 'Deactivate');
  if (!ok) return;
  try {
    await API.put('/users/' + userId, { is_active: false });
    UI.showToast('User deactivated', 'success');
    loadAdminUsers();
  } catch (err) { UI.showToast(err.message, 'error'); }
}

async function loadAdminActivity() {
  const container = document.getElementById('adminContent');
  UI.showSpinner(container);
  let activities = [];
  try { const data = await API.get('/activity?limit=50'); activities = data.activities || data.activity || []; } catch {}
  UI.hideSpinner(container);

  if (activities.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No activity logged</p></div>';
    return;
  }
  let html = '<div class="activity-list">';
  activities.forEach(a => {
    html += '<div class="activity-item"><div class="activity-content">'
      + '<p class="activity-action">' + (a.action || a.details || '') + '</p>'
      + '<p class="activity-date">' + (a.user_name || '') + ' \u00b7 ' + formatDate(a.created_at || a.date || '') + '</p>'
      + '</div><div class="activity-type"><span class="type-badge">' + (a.type || '') + '</span></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

async function loadAdminAnalytics() {
  const container = document.getElementById('adminContent');
  UI.showSpinner(container);
  let stats = {};
  try { const data = await API.get('/analytics/dashboard'); stats = data.stats || {}; } catch {}
  UI.hideSpinner(container);

  const entries = Object.entries(stats);
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No analytics data available</p></div>';
    return;
  }

  let html = '<div class="kpi-grid">';
  entries.forEach(([key, value]) => {
    html += '<div class="kpi-card"><h3>' + value + '</h3><p>' + formatStatLabel(key) + '</p></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── Profile (Phase 6) ─────────────────────────────────────

function initProfileButton() {
  const btn = document.getElementById('profileBtn');
  if (btn) btn.addEventListener('click', openProfileModal);
}

async function openProfileModal() {
  let profile;
  try { profile = await API.get('/auth/me'); } catch { UI.showToast('Failed to load profile', 'error'); return; }

  const isContractor = profile.role === 'contractor';
  let html = UI.formGroup('name', 'Full Name', UI.textInput('name', '', profile.name || ''))
    + '<div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" value="' + (profile.email || '') + '" disabled></div>'
    + '<div class="form-group"><label class="form-label">Role</label><input class="form-input" value="' + (profile.role || '') + '" disabled></div>'
    + UI.formGroup('phone', 'Phone', UI.textInput('phone', '(555) 123-4567', profile.phone || ''));

  if (isContractor && profile.profile) {
    html += UI.formGroup('companyName', 'Company Name', UI.textInput('companyName', '', profile.profile.company_name || ''));
  }

  html += '<div style="border-top:1px solid var(--gray-100);margin-top:16px;padding-top:16px">'
    + '<button type="button" class="btn btn-secondary btn-sm" onclick="openChangePasswordForm()">Change Password</button></div>';

  UI.openFormModal('My Profile', html, async (data) => {
    const body = { name: data.name, phone: data.phone };
    if (data.companyName) body.companyName = data.companyName;
    await API.put('/auth/me', body);
    // Update stored user
    const user = API.getUser();
    if (user) { user.name = data.name; sessionStorage.setItem('user', JSON.stringify(user)); }
    window._userName = data.name;
    document.getElementById('headerUserName').textContent = data.name;
    UI.showToast('Profile updated', 'success');
    closeDetailModal();
  });
}

function openChangePasswordForm() {
  const html = UI.formGroup('currentPassword', 'Current Password', '<input class="form-input" type="password" id="field_currentPassword" name="currentPassword" required>', true)
    + UI.formGroup('newPassword', 'New Password', '<input class="form-input" type="password" id="field_newPassword" name="newPassword" placeholder="Min 6 characters" required>', true)
    + UI.formGroup('confirmPassword', 'Confirm New Password', '<input class="form-input" type="password" id="field_confirmPassword" name="confirmPassword" required>', true);

  UI.openFormModal('Change Password', html, async (data) => {
    if (!data.currentPassword || !data.newPassword) throw new Error('All fields are required');
    if (data.newPassword.length < 6) throw new Error('New password must be at least 6 characters');
    if (data.newPassword !== data.confirmPassword) throw new Error('Passwords do not match');
    await API.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
    UI.showToast('Password changed successfully', 'success');
    closeDetailModal();
  });
}

// ── Support Modal ─────────────────────────────────────────

async function openSupportModal() {
  const overlay = document.getElementById('detailOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = 'Support & Contact';
  let reps;
  try { reps = (await API.get('/sales-reps')).salesReps || []; } catch { reps = (typeof demoData !== 'undefined' && demoData.salesReps) || []; }

  let html = '<div style="margin-bottom:20px"><p style="font-size:0.9375rem;color:#6b7280;margin-bottom:16px">Need help? Reach out to your Carlisle representative.</p>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
    + '<span style="padding:10px 18px;background:#1e293b;color:#60a5fa;border-radius:8px;font-size:0.8125rem;font-weight:600">Phone: 1-800-479-6832</span>'
    + '<span style="padding:10px 18px;background:#1e293b;color:#60a5fa;border-radius:8px;font-size:0.8125rem;font-weight:600">Email: support@carlisle.com</span>'
    + '</div></div>';

  if (reps.length > 0) {
    html += '<div class="doc-group-title">Your Sales Representatives</div>';
    reps.forEach(rep => {
      html += '<div class="modal-job-card job-status-default" style="border-left-color:#10b981"><div class="modal-job-header"><div>'
        + '<div class="modal-list-title">' + rep.name + '</div>'
        + '<div class="modal-list-subtitle">' + (rep.territory || '') + '</div>'
        + '</div></div><div class="modal-job-meta">'
        + '<span>' + rep.email + '</span><span>' + rep.phone + '</span>'
        + '<span>' + (rep.customers || 0) + ' customers</span></div></div>';
    });
  }

  body.innerHTML = html;
  overlay.style.display = 'flex';
}

// ── Modals ─────────────────────────────────────────────────

function closeDetailModal() {
  document.getElementById('detailOverlay').style.display = 'none';
}

function closeDocViewer() {
  document.getElementById('docOverlay').style.display = 'none';
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'detailOverlay') closeDetailModal();
  if (e.target.id === 'docOverlay') closeDocViewer();
});

// ESC key closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const confirm = document.getElementById('confirmOverlay');
    if (confirm && confirm.style.display === 'flex') { confirm.style.display = 'none'; return; }
    if (document.getElementById('docOverlay').style.display === 'flex') { closeDocViewer(); return; }
    if (document.getElementById('detailOverlay').style.display === 'flex') { closeDetailModal(); }
  }
});

// ── Document Content (kept for product doc viewer) ────────

const documentContent = {
  'tpo-tech-data': { title: 'Sure-Weld TPO Technical Data Sheet', body: '<h3>Sure-Weld\u00ae TPO Membrane</h3><p style="color:#666;margin-bottom:16px">Thermoplastic Polyolefin Single-Ply Roofing Membrane</p><h4 style="color:#0369a1;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:16px 0 8px">Physical Properties</h4><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#f8fafc"><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Thickness</td><td style="padding:8px;border:1px solid #e5e7eb">60 mil (1.52 mm)</td></tr><tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Sheet Width</td><td style="padding:8px;border:1px solid #e5e7eb">6, 8, 10, 12 ft</td></tr><tr style="background:#f8fafc"><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Breaking Strength</td><td style="padding:8px;border:1px solid #e5e7eb">\u2265 180 lbf/in</td></tr></table><h4 style="color:#0369a1;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:16px 0 8px">Warranty</h4><p>Up to 30 years total system warranty when installed by an authorized contractor.</p>' },
  'tpo-install-guide': { title: 'TPO Installation Guide', body: '<h3>Sure-Weld\u00ae TPO Installation Guide</h3><div style="background:#fff7ed;padding:12px;border-radius:8px;border-left:4px solid #92400e;margin:16px 0"><strong style="color:#92400e">Important:</strong> Must be installed by a Carlisle Authorized Applicator.</div><h4 style="color:#047857;margin:16px 0 8px">1. Substrate Preparation</h4><ul style="line-height:1.8"><li>Verify structural deck is dry, clean, and free of debris</li><li>Ensure deck is smooth with no projections greater than 1/8"</li></ul><h4 style="color:#047857;margin:16px 0 8px">2. Membrane Application</h4><ul style="line-height:1.8"><li>Unroll membrane with minimum 6" side laps</li><li>Hot-air weld all seams at 10 ft/min, 1050\u00b0F nozzle temp</li></ul>' },
  'tpo-sds': { title: 'TPO Safety Data Sheet', body: '<h3>Sure-Weld\u00ae TPO Roofing Membrane</h3><p style="color:#92400e;font-weight:600">SAFETY DATA SHEET</p><div style="background:#e6ffed;padding:12px;border-radius:8px;border-left:4px solid #047857;margin:16px 0"><strong>GHS Classification:</strong> Not classified as hazardous under normal conditions of use.</div>' },
};

function openDocViewer(contentId) {
  const doc = documentContent[contentId];
  if (!doc) return;
  document.getElementById('docViewerTitle').textContent = doc.title;
  document.getElementById('docViewerBody').innerHTML = doc.body;
  document.getElementById('docOverlay').style.display = 'flex';
}

// ── Console ────────────────────────────────────────────────
console.log('%cCarlisle CCM Dashboard', 'font-size: 20px; font-weight: bold; color: #2563eb;');
