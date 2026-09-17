(function () {
  const localApi = new URLSearchParams(location.search).get('api');
  const API = ['localhost','127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '') ? localApi : (['localhost','127.0.0.1'].includes(location.hostname) ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api') : `${location.origin}/api`);
  const localApiSuffix = localApi ? '&api=' + encodeURIComponent(API) : '';
  const token = localStorage.getItem('naisft_admin_token');
  const isDevMode = Boolean(window.NAISFT_ADMIN_DEV);
  let students = [];
  let courses = [];
  let applications = [];
  let assignmentSubmissions = [];
  let supportRequests = [];
  let lmsCourse = null;
  let editingLms = null;
  let activePipeline = 'all';
  let activeAdminView = 'overview';
  let activeLmsStep = 'modules';
  let selectedStudentId = null;
  let selectedSubmissionId = null;
  const supportStoreKey = 'naisft_dev_support_requests';

  const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  if (!token && !isDevMode) {
    window.location.href = 'admin-login.html';
    return;
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function safeText(value, fallback) {
    return value === null || value === undefined || value === '' ? (fallback !== undefined ? fallback : '-') : String(value);
  }

  function amount(value) {
    return money.format(Number(value || 0));
  }

  function escapeHtml(value) {
    return safeText(value, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function logout() {
    localStorage.removeItem('naisft_admin_token');
    localStorage.removeItem('naisft_admin');
    window.location.href = 'admin-login.html?fresh=1';
  }

  function showAlert(message, type) {
    const alert = qs('adminAlert');
    if (!alert) return;
    alert.textContent = message || '';
    alert.className = 'admin-alert';
    if (message) alert.classList.add('active', type || 'error');
  }

  function openCredentialModal({ title, message, confirmLabel, requireReason, defaultReason, danger }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'admin-credential-modal';
      overlay.innerHTML = `<div class="admin-credential-dialog" role="dialog" aria-modal="true" aria-labelledby="credentialModalTitle"><button class="admin-modal-close" type="button" aria-label="Close">×</button><span class="admin-modal-icon ${danger ? 'danger' : ''}"><i class="fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-shield-halved'}"></i></span><h2 id="credentialModalTitle">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>${requireReason ? `<label><span>Reason</span><textarea rows="3" maxlength="500" placeholder="Enter a clear administrative reason">${escapeHtml(defaultReason || '')}</textarea><small>Minimum 5 characters</small></label>` : ''}<div class="admin-modal-actions"><button class="cancel" type="button">Cancel</button><button class="confirm ${danger ? 'danger' : ''}" type="button">${escapeHtml(confirmLabel || 'Confirm')}</button></div></div>`;
      document.body.appendChild(overlay);
      const textarea = overlay.querySelector('textarea'); const finish = (value) => { overlay.remove(); resolve(value); };
      overlay.querySelector('.admin-modal-close').addEventListener('click', () => finish(null));
      overlay.querySelector('.cancel').addEventListener('click', () => finish(null));
      overlay.addEventListener('click', (event) => { if (event.target === overlay) finish(null); });
      overlay.addEventListener('keydown', (event) => { if (event.key === 'Escape') finish(null); });
      overlay.querySelector('.confirm').addEventListener('click', () => { const reason = textarea ? textarea.value.trim() : true; if (textarea && reason.length < 5) { textarea.focus(); textarea.setAttribute('aria-invalid', 'true'); return; } finish(reason); });
      setTimeout(() => (textarea || overlay.querySelector('.confirm')).focus(), 0);
    });
  }

  function setLoading(isLoading) {
    if (qs('adminLoading')) qs('adminLoading').hidden = !isLoading;
    if (qs('adminContent')) qs('adminContent').hidden = isLoading;
  }

  function switchAdminView(view) {
    activeAdminView = view || 'overview';
    document.querySelectorAll('[data-admin-view-panel]').forEach((panel) => {
      const isActive = panel.dataset.adminViewPanel === activeAdminView;
      panel.hidden = !isActive;
      panel.classList.toggle('active', isActive);
    });
    document.querySelectorAll('[data-admin-view]').forEach((link) => {
      link.classList.toggle('active', link.dataset.adminView === activeAdminView);
    });
    if (activeAdminView === 'course-builder') switchLmsStep(activeLmsStep || 'modules');
  }

  function switchLmsStep(step) {
    activeLmsStep = step || 'modules';
    document.querySelectorAll('[data-lms-step-panel]').forEach((panel) => {
      const isActive = panel.dataset.lmsStepPanel === activeLmsStep;
      panel.hidden = !isActive;
      panel.classList.toggle('active', isActive);
    });
    document.querySelectorAll('[data-lms-step]').forEach((button) => {
      button.classList.toggle('active', button.dataset.lmsStep === activeLmsStep);
    });
  }

  function devPayload() {
    const demoStudents = [
      {
        id: 1,
        fullName: 'Demo Student',
        email: 'demo.student.naisft.20260629@example.com',
        phone: '9876500629',
        whatsapp: '9876500629',
        alternatePhone: '',
        enrollmentNo: 'NAISFT-2026-0004',
        country: 'India',
        state: 'Bihar',
        city: 'Patna',
        address: 'Demo address near training centre',
        qualification: '12th Pass',
        workExperience: 'Fresher',
        registrationStatus: 'submitted',
        registrationSubmittedAt: '2026-07-02T09:00:00.000Z',
        registrationReviewNote: '',
        isVerified: false,
        isActive: true,
        createdAt: '2026-06-29T08:30:00.000Z',
        documents: [
          { id: 1001, docType: 'Photo', fileName: 'demo-photo.jpg', fileUrl: '#', status: 'Pending', reviewNote: '' },
          { id: 1002, docType: 'Aadhaar / ID Proof', fileName: 'demo-id.pdf', fileUrl: '#', status: 'Pending', reviewNote: '' },
        ],
        certificates: [],
        enrollments: [{
          id: 11,
          status: 'Pending',
          course: { id: 1, name: 'Diploma in Industrial Safety', duration: '12 Months', fee: 26500, category: { name: 'Safety Courses' } },
        }],
        feePayments: [{ id: 21, receiptNo: 'offline_DEV_PENDING', paymentMode: 'Offline - Office Payment', amount: 26500, status: 'Pending' }],
      },
      {
        id: 2,
        fullName: 'Aarav Kumar',
        email: 'aarav.kumar@example.com',
        phone: '9876543210',
        whatsapp: '9876543210',
        alternatePhone: '9123456789',
        enrollmentNo: 'NAISFT-2026-0007',
        country: 'India',
        state: 'Jharkhand',
        city: 'Ranchi',
        address: 'Industrial area, Ranchi',
        qualification: 'Diploma Mechanical',
        workExperience: '2 years',
        registrationStatus: 'verified',
        registrationSubmittedAt: '2026-06-30T09:30:00.000Z',
        registrationReviewedAt: '2026-07-01T10:00:00.000Z',
        registrationReviewNote: 'Profile and documents verified.',
        isVerified: true,
        isActive: true,
        createdAt: '2026-06-30T09:00:00.000Z',
        documents: [
          { id: 2001, docType: 'Photo', fileName: 'aarav-photo.jpg', fileUrl: '#', status: 'Verified', reviewNote: '', reviewedAt: '2026-07-01T10:00:00.000Z' },
          { id: 2002, docType: 'Aadhaar / ID Proof', fileName: 'aarav-id.pdf', fileUrl: '#', status: 'Verified', reviewNote: '', reviewedAt: '2026-07-01T10:02:00.000Z' },
          { id: 2003, docType: 'Qualification Certificate', fileName: 'aarav-certificate.pdf', fileUrl: '#', status: 'Verified', reviewNote: '', reviewedAt: '2026-07-01T10:05:00.000Z' },
        ],
        certificates: [{ verifyToken: 'NAISFT-CERT-2026-000001', course: { id: 1, name: 'Diploma in Industrial Safety' } }],
        enrollments: [{
          id: 12,
          status: 'Active',
          course: { id: 1, name: 'Diploma in Industrial Safety', duration: '12 Months', fee: 26500, category: { name: 'Safety Courses' } },
        }],
        feePayments: [{ id: 22, receiptNo: 'RCPT-DEV-001', paymentMode: 'UPI', amount: 15000, status: 'Paid' }],
      },
    ];
    const demoCourses = [
      {
        id: 1,
        name: 'Diploma in Industrial Safety',
        duration: '12 Months',
        fee: 26500,
        category: { name: 'Safety Courses' },
        modules: [{
          id: 101,
          title: 'Safety Fundamentals',
          description: 'Core industrial safety orientation.',
          isPublished: true,
          lessons: [{
            id: 201,
            title: 'Introduction to Workplace Safety',
            lessonType: 'Video',
            contentUrl: '',
            contentText: 'Understand basic responsibilities and reporting flow before practical training.',
            position: 1,
            isPublished: true,
            materials: [{ id: 601, title: 'Safety checklist PDF', materialType: 'PDF', fileUrl: '#', position: 1 }],
          }],
          liveClasses: [],
          assignments: [],
        }],
        liveClasses: [{ id: 301, title: 'Weekly Safety Doubt Class', platform: 'Google Meet', startsAt: '2026-07-04T10:00:00.000Z', endsAt: '2026-07-04T11:00:00.000Z', joinUrl: 'https://meet.google.com/demo-class', recordingUrl: 'https://example.com/demo-recording', description: 'Bring your PPE checklist and incident observation doubts.', teacherName: 'NAISFT Faculty', status: 'Scheduled', isPublished: true }],
        assignments: [{ id: 401, title: 'Safety Observation Report', instructions: 'Submit a short workplace safety observation note.', attachmentUrl: 'https://example.com/safety-observation-brief.pdf', dueAt: '2026-07-10T18:00:00.000Z', isPublished: true }],
      },
      { id: 2, name: 'Advanced Diploma in Fire Safety & Industrial Safety', duration: '18 Months', fee: 35000, category: { name: 'Safety Courses' } },
      { id: 3, name: 'QA/QC Mechanical', duration: '6 Months', fee: 22000, category: { name: 'QA/QC Courses' } },
    ];
    const demoApplications = [
      { id: 31, fullName: 'Rohit Singh', email: 'rohit@example.com', mobile: '9000000001', courseName: 'Diploma in Industrial Safety', status: 'pending', createdAt: '2026-07-01T09:00:00.000Z' },
      { id: 32, fullName: 'Priya Sharma', email: 'priya@example.com', mobile: '9000000002', courseName: 'QA/QC Mechanical', status: 'registered', createdAt: '2026-06-30T13:00:00.000Z' },
    ];
    const demoSubmissions = [
      {
        id: 501,
        assignmentId: 401,
        studentId: 2,
        submissionText: 'Observed one blocked emergency exit and missing housekeeping sign near the welding bay. Suggested immediate clearing, supervisor reporting and daily inspection checklist.',
        fileUrl: 'https://example.com/safety-observation-report.pdf',
        status: 'Submitted',
        marks: null,
        feedback: '',
        submittedAt: '2026-07-01T11:20:00.000Z',
        reviewedAt: null,
        assignment: {
          id: 401,
          title: 'Safety Observation Report',
          dueAt: '2026-07-10T18:00:00.000Z',
          maxMarks: 100,
          course: { id: 1, name: 'Diploma in Industrial Safety' },
          module: { id: 101, title: 'Safety Fundamentals' },
        },
        student: {
          id: 2,
          fullName: 'Aarav Kumar',
          email: 'aarav.kumar@example.com',
          phone: '9876543210',
          enrollmentNo: 'NAISFT-2026-0007',
        },
      },
      {
        id: 502,
        assignmentId: 401,
        studentId: 1,
        submissionText: 'Submitted a short note on basic PPE checks and reporting unsafe acts before starting shift work.',
        fileUrl: '',
        status: 'Reviewed',
        marks: 82,
        feedback: 'Good observation structure. Add more detail about corrective actions next time.',
        submittedAt: '2026-06-30T15:05:00.000Z',
        reviewedAt: '2026-07-01T10:00:00.000Z',
        assignment: {
          id: 401,
          title: 'Safety Observation Report',
          dueAt: '2026-07-10T18:00:00.000Z',
          maxMarks: 100,
          course: { id: 1, name: 'Diploma in Industrial Safety' },
          module: { id: 101, title: 'Safety Fundamentals' },
        },
        student: {
          id: 1,
          fullName: 'Demo Student',
          email: 'demo.student.naisft.20260629@example.com',
          phone: '9876500629',
          enrollmentNo: 'NAISFT-2026-0004',
        },
      },
    ];

    return {
      summary: {
        totalStudents: 2,
        verifiedStudents: 1,
        pendingApplications: 3,
        pendingRegistrationReviews: 1,
        pendingEnrollments: 1,
        pendingPayments: 1,
        totalPaidAmount: 15000,
      },
      students: demoStudents,
      courses: demoCourses,
      applications: demoApplications,
      assignmentSubmissions: demoSubmissions,
      total: demoStudents.length,
    };
  }

  async function fetchJson(path, options) {
    const res = await fetch(API + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        ...(options && options.headers ? options.headers : {}),
      },
    });
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      logout();
      return null;
    }
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }

  function paymentTotals(student) {
    const payments = student.feePayments || [];
    const paid = payments
      .filter((payment) => String(payment.status || '').toLowerCase() === 'paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const due = (student.enrollments || []).reduce((sum, enrollment) => sum + Number(enrollment.course?.fee || 0), 0);
    return { paid, due, pending: Math.max(due - paid, 0) };
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function toDatetimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function primaryEnrollment(student) {
    const enrollments = student.enrollments || [];
    return enrollments.find((item) => item.status === 'Active') || enrollments[0] || null;
  }

  function isRegistrationReviewPending(student) {
    return ['submitted', 'correction_needed', 'rejected'].includes(String(student.registrationStatus || '').toLowerCase());
  }

  function studentPipeline(student) {
    const totals = paymentTotals(student);
    const enrollment = primaryEnrollment(student);
    const status = String(enrollment?.status || '').toLowerCase();
    const hasPendingOffline = (student.feePayments || []).some((payment) =>
      String(payment.status || '').toLowerCase() === 'pending'
      && String(payment.paymentMode || '').toLowerCase().includes('offline')
    );

    if (isRegistrationReviewPending(student)) return 'registration';
    if (hasPendingOffline || totals.pending > 0) return 'payment';
    if (!student.isVerified || status === 'pending') return 'verification';
    if (status === 'active') return 'active';
    if (status === 'completed') return 'completed';
    return 'all';
  }

  function pipelineLabel(key) {
    return {
      all: 'All Students',
      applications: 'Applications',
      registration: 'Registration Review',
      payment: 'Pending Payment',
      verification: 'Verification',
      active: 'Active Students',
      completed: 'Completed',
    }[key] || 'All Students';
  }

  function registrationLabel(status) {
    return {
      incomplete: 'Registration incomplete',
      submitted: 'Submitted for review',
      verified: 'Registration approved',
      rejected: 'Registration rejected',
      correction_needed: 'Correction needed',
    }[String(status || 'incomplete').toLowerCase()] || 'Registration incomplete';
  }

  function renderSummary(summary) {
    qs('adminTotalStudents').textContent = summary.totalStudents || 0;
    qs('adminVerifiedStudents').textContent = summary.verifiedStudents || 0;
    qs('adminPendingApplications').textContent = (summary.pendingApplications || 0) + (summary.pendingRegistrationReviews || 0);
    qs('adminPendingEnrollments').textContent = summary.pendingEnrollments || 0;
    qs('adminPendingPayments').textContent = summary.pendingPayments || 0;
    qs('adminTotalPaid').textContent = amount(summary.totalPaidAmount || 0);
  }

  function updatePipelineCounts() {
    const counts = {
      all: students.length,
      applications: applications.filter((app) => app.status !== 'registered').length,
      registration: students.filter((student) => isRegistrationReviewPending(student)).length,
      payment: students.filter((student) => studentPipeline(student) === 'payment').length,
      verification: students.filter((student) => studentPipeline(student) === 'verification').length,
      active: students.filter((student) => studentPipeline(student) === 'active').length,
      completed: students.filter((student) => studentPipeline(student) === 'completed').length,
    };

    document.querySelectorAll('[data-admin-pipeline]').forEach((btn) => {
      const key = btn.dataset.adminPipeline;
      btn.classList.toggle('active', key === activePipeline);
      const count = btn.querySelector('b');
      if (count) count.textContent = counts[key] || 0;
    });

    if (qs('adminPipelineTitle')) qs('adminPipelineTitle').textContent = pipelineLabel(activePipeline);
  }

  function filteredStudents() {
    const query = (qs('adminStudentSearch')?.value || '').toLowerCase();
    return students.filter((student) => {
      const matchesSearch = [student.fullName, student.email, student.phone, student.enrollmentNo, student.city, student.state]
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesPipeline = activePipeline === 'all' || !['applications'].includes(activePipeline)
        ? (activePipeline === 'all' || studentPipeline(student) === activePipeline)
        : true;
      return matchesSearch && matchesPipeline;
    });
  }

  function renderStudents() {
    updatePipelineCounts();
    const showingApplications = activePipeline === 'applications';
    if (qs('students')) qs('students').hidden = showingApplications;
    if (qs('adminStudentDetail')) qs('adminStudentDetail').hidden = showingApplications;
    const filtered = activePipeline === 'applications' ? [] : filteredStudents();

    if (!showingApplications) qs('adminStudentsTable').innerHTML = filtered.map((student) => {
      const enrollment = primaryEnrollment(student);
      const course = enrollment && enrollment.course;
      const totals = paymentTotals(student);
      const stage = studentPipeline(student);
      return `
        <tr class="${student.id === selectedStudentId ? 'active' : ''}">
          <td><strong>${escapeHtml(student.fullName)}</strong><span>${escapeHtml(student.email)}<br>${escapeHtml(student.phone)}</span></td>
          <td><strong>${escapeHtml(course ? course.name : 'No course')}</strong><span>${escapeHtml(student.enrollmentNo || 'Enrollment pending')}</span></td>
          <td><strong>${amount(totals.paid)}</strong><span>${amount(totals.pending)} pending</span></td>
          <td><strong>${(student.documents || []).length}</strong><span>uploaded</span></td>
          <td><em class="${escapeHtml(stage)}">${escapeHtml(pipelineLabel(stage))}</em></td>
          <td><button type="button" data-student-id="${student.id}">Open</button></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6"><div class="admin-empty-inline">No students found.</div></td></tr>';

    qs('adminStudentsTable').querySelectorAll('[data-student-id]').forEach((button) => {
      button.addEventListener('click', () => selectStudent(Number(button.dataset.studentId)));
    });

    renderApplications();
  }

  function renderApplications() {
    const panel = qs('adminApplicationsPanel');
    const list = qs('adminApplicationsList');
    if (!panel || !list) return;

    panel.hidden = activePipeline !== 'applications';
    if (activePipeline !== 'applications') return;

    const query = (qs('adminStudentSearch')?.value || '').toLowerCase();
    const filtered = applications.filter((app) => [app.fullName, app.email, app.mobile, app.courseName, app.status]
      .join(' ')
      .toLowerCase()
      .includes(query));

    list.innerHTML = filtered.map((app) => `
      <article class="admin-application-card">
        <div>
          <strong>${escapeHtml(app.fullName)}</strong>
          <span>${escapeHtml(app.email)} / ${escapeHtml(app.mobile)}</span>
          <small>${escapeHtml(safeText(app.courseName, 'Course not selected'))}</small>
        </div>
        <em class="${escapeHtml(app.status || 'pending')}">${escapeHtml(app.status || 'pending')}</em>
        <time>${escapeHtml(formatDate(app.createdAt))}</time>
      </article>
    `).join('') || '<div class="admin-empty-inline">No applications found.</div>';
  }

  function renderStatusSelect(kind, id, value) {
    const options = kind === 'enrollment'
      ? ['Pending', 'Active', 'Completed', 'Dropped']
      : ['Pending', 'Paid', 'Failed'];
    return `
      <select data-admin-action="${kind}" data-id="${id}">
        ${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
      </select>
    `;
  }

  function renderCourseOptions(selectedId) {
    return '<option value="">Select course</option>' + courses.map((course) => {
      const label = [course.name, course.category && course.category.name, amount(course.fee)].filter(Boolean).join(' / ');
      return `<option value="${course.id}" data-fee="${course.fee}" ${Number(selectedId) === Number(course.id) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  function isPendingOfflinePayment(payment) {
    return String(payment?.status || '').toLowerCase() === 'pending'
      && String(payment?.paymentMode || '').toLowerCase().includes('offline');
  }

  function paymentCourseLabel(payment) {
    if (payment?.course?.name) return payment.course.name;
    if (payment?.enrollment?.course?.name) return payment.enrollment.course.name;
    return '';
  }

  function renderPaymentAction(payment) {
    if (!isPendingOfflinePayment(payment)) return renderStatusSelect('payment', payment.id, payment.status || 'Pending');
    return `
      <div class="admin-payment-actions">
        ${renderStatusSelect('payment', payment.id, payment.status || 'Pending')}
        <button class="admin-secondary-btn admin-compact-btn" type="button" data-approve-offline-payment="${escapeHtml(payment.id)}">
          <i class="fa-solid fa-circle-check"></i> Approve & Activate
        </button>
      </div>
    `;
  }

  function renderLmsSelectOptions() {
    if (!qs('lmsCourseSelect')) return;
    qs('lmsCourseSelect').innerHTML = courses.map((course) =>
      `<option value="${course.id}">${escapeHtml(course.name)}</option>`
    ).join('');
  }

  function moduleOptions(includeAny) {
    const modules = (lmsCourse && lmsCourse.modules) || [];
    const base = includeAny ? '<option value="">Course level</option>' : '<option value="">Select module</option>';
    return base + modules.map((module) => `<option value="${module.id}">${escapeHtml(module.title)}</option>`).join('');
  }

  function lessonOptions() {
    const modules = (lmsCourse && lmsCourse.modules) || [];
    const options = modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        id: lesson.id,
        label: module.title + ' / ' + lesson.title,
      }))
    );
    return '<option value="">Select lesson</option>' + options.map((lesson) =>
      `<option value="${lesson.id}">${escapeHtml(lesson.label)}</option>`
    ).join('');
  }

  function publishedBadge(item) {
    const published = item.isPublished !== false;
    return `<em class="${published ? 'published' : 'draft'}">${published ? 'Published' : 'Hidden'}</em>`;
  }

  function lmsActionButtons(type, id, item) {
    const published = item.isPublished !== false;
    const publishLabel = published ? 'Hide' : 'Publish';
    const publishButton = type === 'material'
      ? ''
      : `<button type="button" data-lms-action="toggle" data-lms-type="${type}" data-lms-id="${id}" title="${publishLabel}"><i class="fa-solid ${published ? 'fa-eye-slash' : 'fa-eye'}"></i></button>`;
    return `
      <div class="admin-lms-actions">
        <button type="button" data-lms-action="move-up" data-lms-type="${type}" data-lms-id="${id}" title="Move up"><i class="fa-solid fa-arrow-up"></i></button>
        <button type="button" data-lms-action="move-down" data-lms-type="${type}" data-lms-id="${id}" title="Move down"><i class="fa-solid fa-arrow-down"></i></button>
        ${publishButton}
        <button type="button" data-lms-action="edit" data-lms-type="${type}" data-lms-id="${id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button type="button" data-lms-action="delete" data-lms-type="${type}" data-lms-id="${id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }

  function findLmsItem(type, id) {
    const modules = (lmsCourse && lmsCourse.modules) || [];
    const module = modules.find((item) => Number(item.id) === Number(id));
    if (type === 'module') return { item: module, list: modules };

    for (const parentModule of modules) {
      const lesson = (parentModule.lessons || []).find((item) => Number(item.id) === Number(id));
      if (type === 'lesson' && lesson) return { item: lesson, list: parentModule.lessons, parent: parentModule };

      for (const parentLesson of (parentModule.lessons || [])) {
        const material = (parentLesson.materials || []).find((item) => Number(item.id) === Number(id));
        if (type === 'material' && material) return { item: material, list: parentLesson.materials, parent: parentLesson };
      }

      const moduleLiveClass = (parentModule.liveClasses || []).find((item) => Number(item.id) === Number(id));
      if (type === 'liveClass' && moduleLiveClass) return { item: moduleLiveClass, list: parentModule.liveClasses, parent: parentModule };

      const moduleAssignment = (parentModule.assignments || []).find((item) => Number(item.id) === Number(id));
      if (type === 'assignment' && moduleAssignment) return { item: moduleAssignment, list: parentModule.assignments, parent: parentModule };
    }

    const liveClass = ((lmsCourse && lmsCourse.liveClasses) || []).find((item) => Number(item.id) === Number(id));
    if (type === 'liveClass' && liveClass) return { item: liveClass, list: lmsCourse.liveClasses };

    const assignment = ((lmsCourse && lmsCourse.assignments) || []).find((item) => Number(item.id) === Number(id));
    if (type === 'assignment' && assignment) return { item: assignment, list: lmsCourse.assignments };

    return { item: null, list: [] };
  }

  function apiPathForLms(type, id) {
    return {
      module: '/admin/modules/' + id,
      lesson: '/admin/lessons/' + id,
      material: '/admin/materials/' + id,
      liveClass: '/admin/live-classes/' + id,
      assignment: '/admin/assignments/' + id,
    }[type];
  }

  function removeLmsItem(type, id) {
    const found = findLmsItem(type, id);
    if (!found.item || !found.list) return false;
    const index = found.list.findIndex((item) => Number(item.id) === Number(id));
    if (index >= 0) found.list.splice(index, 1);
    if (type === 'liveClass' && lmsCourse) {
      (lmsCourse.modules || []).forEach((module) => {
        module.liveClasses = (module.liveClasses || []).filter((item) => Number(item.id) !== Number(id));
      });
      lmsCourse.liveClasses = (lmsCourse.liveClasses || []).filter((item) => Number(item.id) !== Number(id));
    }
    if (type === 'assignment' && lmsCourse) {
      (lmsCourse.modules || []).forEach((module) => {
        module.assignments = (module.assignments || []).filter((item) => Number(item.id) !== Number(id));
      });
      lmsCourse.assignments = (lmsCourse.assignments || []).filter((item) => Number(item.id) !== Number(id));
    }
    return index >= 0;
  }

  function resequenceList(list) {
    (list || []).forEach((item, index) => {
      item.position = index + 1;
    });
  }

  function lmsEditFields(type, item) {
    if (type === 'module') {
      return `
        <label><span>Title</span><input name="title" value="${escapeHtml(item.title || '')}" required></label>
        <label class="wide"><span>Description</span><textarea name="description">${escapeHtml(item.description || '')}</textarea></label>
      `;
    }
    if (type === 'lesson') {
      return `
        <label><span>Title</span><input name="title" value="${escapeHtml(item.title || '')}" required></label>
        <label><span>Type</span><select name="lessonType">${['Video', 'Text', 'PDF', 'Link'].map((option) => `<option ${option === item.lessonType ? 'selected' : ''}>${option}</option>`).join('')}</select></label>
        <label class="wide"><span>URL</span><input name="contentUrl" value="${escapeHtml(item.contentUrl || '')}"></label>
        <label class="wide"><span>Notes / Text</span><textarea name="contentText">${escapeHtml(item.contentText || '')}</textarea></label>
      `;
    }
    if (type === 'material') {
      return `
        <label><span>Title</span><input name="title" value="${escapeHtml(item.title || '')}" required></label>
        <label><span>Type</span><select name="materialType">${['PDF', 'Document', 'Image', 'Video', 'Link'].map((option) => `<option ${option === item.materialType ? 'selected' : ''}>${option}</option>`).join('')}</select></label>
        <label class="wide"><span>File / Link URL</span><input name="fileUrl" value="${escapeHtml(item.fileUrl || '')}" required></label>
      `;
    }
    if (type === 'liveClass') {
      return `
        <label><span>Title</span><input name="title" value="${escapeHtml(item.title || '')}" required></label>
        <label><span>Platform</span><select name="platform">${['Google Meet', 'Zoom', 'Manual', 'Other'].map((option) => `<option ${option === item.platform ? 'selected' : ''}>${option}</option>`).join('')}</select></label>
        <label><span>Teacher</span><input name="teacherName" value="${escapeHtml(item.teacherName || '')}"></label>
        <label><span>Join Link</span><input name="joinUrl" value="${escapeHtml(item.joinUrl || '')}" required></label>
        <label><span>Start Time</span><input name="startsAt" type="datetime-local" value="${escapeHtml(toDatetimeLocal(item.startsAt))}" required></label>
        <label><span>End Time</span><input name="endsAt" type="datetime-local" value="${escapeHtml(toDatetimeLocal(item.endsAt))}"></label>
        <label><span>Status</span><select name="status">${['Scheduled', 'Live', 'Completed', 'Cancelled'].map((option) => `<option ${option === item.status ? 'selected' : ''}>${option}</option>`).join('')}</select></label>
        <label><span>Recording Link</span><input name="recordingUrl" value="${escapeHtml(item.recordingUrl || '')}"></label>
        <label class="wide"><span>Class Notes</span><textarea name="description">${escapeHtml(item.description || '')}</textarea></label>
      `;
    }
    if (type === 'assignment') {
      return `
        <label><span>Title</span><input name="title" value="${escapeHtml(item.title || '')}" required></label>
        <label><span>Max Marks</span><input name="maxMarks" type="number" min="0" step="1" value="${escapeHtml(item.maxMarks || '')}"></label>
        <label class="wide"><span>Instructions</span><textarea name="instructions">${escapeHtml(item.instructions || '')}</textarea></label>
        <label class="wide"><span>Attachment URL</span><input name="attachmentUrl" value="${escapeHtml(item.attachmentUrl || '')}"></label>
      `;
    }
    return '';
  }

  function payloadFromLmsEditForm(type, form) {
    if (type === 'module') {
      return {
        title: form.elements.title.value.trim(),
        description: form.elements.description.value,
      };
    }
    if (type === 'lesson') {
      return {
        title: form.elements.title.value.trim(),
        lessonType: form.elements.lessonType.value,
        contentUrl: form.elements.contentUrl.value,
        contentText: form.elements.contentText.value,
      };
    }
    if (type === 'material') {
      return {
        title: form.elements.title.value.trim(),
        materialType: form.elements.materialType.value,
        fileUrl: form.elements.fileUrl.value.trim(),
      };
    }
    if (type === 'liveClass') {
      return {
        title: form.elements.title.value.trim(),
        platform: form.elements.platform.value,
        teacherName: form.elements.teacherName.value,
        joinUrl: form.elements.joinUrl.value.trim(),
        startsAt: form.elements.startsAt.value,
        endsAt: form.elements.endsAt.value || null,
        status: form.elements.status.value,
        recordingUrl: form.elements.recordingUrl.value.trim(),
        description: form.elements.description.value,
      };
    }
    if (type === 'assignment') {
      return {
        title: form.elements.title.value.trim(),
        maxMarks: form.elements.maxMarks.value,
        instructions: form.elements.instructions.value,
        attachmentUrl: form.elements.attachmentUrl.value.trim(),
      };
    }
    return {};
  }

  function renderLmsEditPanel(type, id) {
    const panel = qs('lmsEditPanel');
    if (!panel) return;
    const found = findLmsItem(type, id);
    if (!found.item) {
      panel.hidden = true;
      panel.innerHTML = '';
      editingLms = null;
      return;
    }

    editingLms = { type, id };
    panel.hidden = false;
    panel.innerHTML = `
      <div class="admin-lms-edit-head">
        <div>
          <span>Edit ${escapeHtml(type.replace(/([A-Z])/g, ' $1'))}</span>
          <h3>${escapeHtml(found.item.title || 'LMS item')}</h3>
        </div>
        <button type="button" id="cancelLmsEdit"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form class="admin-lms-edit-form" id="lmsEditForm">
        ${lmsEditFields(type, found.item)}
        <button class="admin-secondary-btn" type="submit"><i class="fa-solid fa-check"></i> Save Changes</button>
      </form>
    `;

    qs('cancelLmsEdit')?.addEventListener('click', () => {
      editingLms = null;
      panel.hidden = true;
      panel.innerHTML = '';
    });
    qs('lmsEditForm')?.addEventListener('submit', saveLmsEdit);
    panel.scrollIntoView({ block: 'nearest' });
  }

  function renderLmsChildRows(module) {
    const lessons = module.lessons || [];
    const liveClasses = module.liveClasses || [];
    const assignments = module.assignments || [];

    return `
      <div class="admin-lms-children">
        ${lessons.map((lesson) => `
          <div class="admin-lms-child">
            <div><i class="fa-solid fa-play"></i><strong>${escapeHtml(lesson.title)}</strong><span>${escapeHtml(lesson.lessonType || 'Lesson')} / ${(lesson.materials || []).length} materials</span></div>
            ${publishedBadge(lesson)}
            ${lmsActionButtons('lesson', lesson.id, lesson)}
          </div>
          ${(lesson.materials || []).map((material) => `
            <div class="admin-lms-child admin-lms-subchild">
              <div><i class="fa-solid fa-file-arrow-down"></i><strong>${escapeHtml(material.title)}</strong><span>${escapeHtml(material.materialType || 'File')}</span></div>
              <em class="published">Resource</em>
              ${lmsActionButtons('material', material.id, material)}
            </div>
          `).join('')}
        `).join('') || '<div class="admin-empty-inline">No lessons yet.</div>'}
        ${liveClasses.map((liveClass) => `
          <div class="admin-lms-child">
            <div><i class="fa-solid fa-video"></i><strong>${escapeHtml(liveClass.title)}</strong><span>${escapeHtml(liveClass.platform || 'Live Class')} / ${escapeHtml(formatDate(liveClass.startsAt))} / ${escapeHtml(liveClass.status || 'Scheduled')}</span></div>
            ${publishedBadge(liveClass)}
            ${lmsActionButtons('liveClass', liveClass.id, liveClass)}
          </div>
        `).join('')}
        ${assignments.map((assignment) => `
          <div class="admin-lms-child">
            <div><i class="fa-solid fa-clipboard-check"></i><strong>${escapeHtml(assignment.title)}</strong><span>Due ${escapeHtml(formatDate(assignment.dueAt))}${assignment.attachmentUrl ? ' / Attachment added' : ''}</span></div>
            ${publishedBadge(assignment)}
            ${lmsActionButtons('assignment', assignment.id, assignment)}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderCourseLevelRows(liveClasses, assignments) {
    const courseLiveClasses = (liveClasses || []).filter((item) => !item.moduleId);
    const courseAssignments = (assignments || []).filter((item) => !item.moduleId);
    if (!courseLiveClasses.length && !courseAssignments.length) return '';

    return `
      <div class="admin-lms-course-items">
        <h3>Course level items</h3>
        ${courseLiveClasses.map((liveClass) => `
          <div class="admin-lms-child">
            <div><i class="fa-solid fa-video"></i><strong>${escapeHtml(liveClass.title)}</strong><span>${escapeHtml(liveClass.platform || 'Live Class')} / ${escapeHtml(formatDate(liveClass.startsAt))} / ${escapeHtml(liveClass.status || 'Scheduled')}</span></div>
            ${publishedBadge(liveClass)}
            ${lmsActionButtons('liveClass', liveClass.id, liveClass)}
          </div>
        `).join('')}
        ${courseAssignments.map((assignment) => `
          <div class="admin-lms-child">
            <div><i class="fa-solid fa-clipboard-check"></i><strong>${escapeHtml(assignment.title)}</strong><span>Due ${escapeHtml(formatDate(assignment.dueAt))}${assignment.attachmentUrl ? ' / Attachment added' : ''}</span></div>
            ${publishedBadge(assignment)}
            ${lmsActionButtons('assignment', assignment.id, assignment)}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderLmsBuilder() {
    renderLmsSelectOptions();
    if (!lmsCourse && courses.length) {
      lmsCourse = courses[0];
      if (qs('lmsCourseSelect')) qs('lmsCourseSelect').value = String(lmsCourse.id);
    }

    if (qs('lmsLessonModule')) qs('lmsLessonModule').innerHTML = moduleOptions(false);
    if (qs('lmsMaterialLesson')) qs('lmsMaterialLesson').innerHTML = lessonOptions();
    if (qs('lmsLiveModule')) qs('lmsLiveModule').innerHTML = moduleOptions(true);
    if (qs('lmsAssignmentModule')) qs('lmsAssignmentModule').innerHTML = moduleOptions(true);

    const modules = (lmsCourse && lmsCourse.modules) || [];
    const liveClasses = (lmsCourse && lmsCourse.liveClasses) || [];
    const assignments = (lmsCourse && lmsCourse.assignments) || [];

    if (qs('lmsPreview')) qs('lmsPreview').innerHTML = lmsCourse ? `
      <div class="admin-lms-preview-head">
        <div><span>Selected Course</span><strong>${escapeHtml(lmsCourse.name)}</strong></div>
        <div><span>Modules</span><strong>${modules.length}</strong></div>
        <div><span>Live Classes</span><strong>${liveClasses.length}</strong></div>
        <div><span>Assignments</span><strong>${assignments.length}</strong></div>
      </div>
      <div class="admin-lms-module-list">
        ${modules.map((module) => `
          <article>
            <div class="admin-lms-module-head">
              <div>
                <strong>${escapeHtml(module.title)}</strong>
                <span>${escapeHtml(module.description || 'No description')}</span>
                <small>${(module.lessons || []).length} lessons / ${(module.lessons || []).reduce((sum, lesson) => sum + ((lesson.materials || []).length), 0)} materials / ${(module.liveClasses || []).length} live classes / ${(module.assignments || []).length} assignments</small>
              </div>
              ${publishedBadge(module)}
              ${lmsActionButtons('module', module.id, module)}
            </div>
            ${renderLmsChildRows(module)}
          </article>
        `).join('') || '<div class="admin-empty-inline">No modules yet. Add your first module above.</div>'}
      </div>
      ${renderCourseLevelRows(liveClasses, assignments)}
    ` : '<div class="admin-empty-inline">No course available for LMS builder.</div>';

    qs('lmsPreview')?.querySelectorAll('[data-lms-action]').forEach((button) => {
      button.addEventListener('click', () => handleLmsAction(button.dataset.lmsAction, button.dataset.lmsType, Number(button.dataset.lmsId)));
    });
  }

  async function persistLmsUpdate(type, id, payload) {
    if (isDevMode) return;
    await fetchJson(apiPathForLms(type, id), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async function saveLmsEdit(event) {
    event.preventDefault();
    if (!editingLms) return;

    const found = findLmsItem(editingLms.type, editingLms.id);
    if (!found.item) {
      showAlert('Could not find LMS item.');
      return;
    }

    const payload = payloadFromLmsEditForm(editingLms.type, event.currentTarget);
    if (!payload.title) {
      showAlert('Title cannot be empty.');
      return;
    }
    if (editingLms.type === 'material' && !payload.fileUrl) {
      showAlert('Material file/link URL is required.');
      return;
    }
    if (editingLms.type === 'liveClass' && !payload.joinUrl) {
      showAlert('Live class join link is required.');
      return;
    }

    try {
      Object.assign(found.item, payload);
      await persistLmsUpdate(editingLms.type, editingLms.id, payload);
      showAlert('LMS item updated.', 'success');
      editingLms = null;
      if (qs('lmsEditPanel')) {
        qs('lmsEditPanel').hidden = true;
        qs('lmsEditPanel').innerHTML = '';
      }
      renderLmsBuilder();
    } catch (err) {
      showAlert(err.message || 'Could not update LMS item.');
      if (!isDevMode && lmsCourse) await loadLmsCourse(lmsCourse.id);
    }
  }

  async function handleLmsAction(action, type, id) {
    const found = findLmsItem(type, id);
    const item = found.item;
    if (!item) {
      showAlert('Could not find selected LMS item.');
      return;
    }

    try {
      if (action === 'toggle') {
        item.isPublished = item.isPublished === false;
        await persistLmsUpdate(type, id, { isPublished: item.isPublished });
        showAlert((item.isPublished ? 'Published' : 'Hidden') + ' in course builder.', 'success');
      }

      if (action === 'edit') {
        renderLmsEditPanel(type, id);
        return;
      }

      if (action === 'delete') {
        if (!window.confirm('Delete this LMS item? This cannot be undone.')) return;
        if (!isDevMode) {
          await fetchJson(apiPathForLms(type, id), { method: 'DELETE' });
        }
        removeLmsItem(type, id);
        showAlert('LMS item deleted.', 'success');
      }

      if (action === 'move-up' || action === 'move-down') {
        const list = found.list || [];
        const index = list.findIndex((entry) => Number(entry.id) === Number(id));
        const swapIndex = action === 'move-up' ? index - 1 : index + 1;
        if (index < 0 || swapIndex < 0 || swapIndex >= list.length) return;
        const current = list[index];
        const swap = list[swapIndex];
        list[index] = swap;
        list[swapIndex] = current;
        resequenceList(list);
        if (!isDevMode) {
          await Promise.all([
            persistLmsUpdate(type, current.id, { position: current.position }),
            persistLmsUpdate(type, swap.id, { position: swap.position }),
          ]);
        }
        showAlert('LMS order updated.', 'success');
      }

      renderLmsBuilder();
    } catch (err) {
      showAlert(err.message || 'Could not update LMS item.');
      if (!isDevMode && lmsCourse) await loadLmsCourse(lmsCourse.id);
    }
  }

  function assignmentStatusClass(status) {
    return String(status || 'Submitted').toLowerCase();
  }

  function assignmentStatusOptions(value) {
    return ['Submitted', 'Reviewed', 'Rejected'].map((status) =>
      `<option value="${status}" ${status === value ? 'selected' : ''}>${status}</option>`
    ).join('');
  }

  function filteredAssignmentSubmissions() {
    const status = qs('assignmentStatusFilter')?.value || '';
    return assignmentSubmissions.filter((submission) => !status || submission.status === status);
  }

  function selectSubmission(submissionId) {
    selectedSubmissionId = submissionId;
    const submission = assignmentSubmissions.find((item) => Number(item.id) === Number(submissionId));
    renderAssignmentSubmissions();
    if (!submission || !qs('adminAssignmentDetail')) return;

    const assignment = submission.assignment || {};
    const student = submission.student || {};
    qs('adminAssignmentDetail').innerHTML = `
      <div class="admin-assignment-detail-head">
        <div>
          <span>${escapeHtml(student.enrollmentNo || 'Enrollment pending')}</span>
          <h3>${escapeHtml(assignment.title || 'Assignment')}</h3>
          <p>${escapeHtml(student.fullName || 'Student')} / ${escapeHtml(assignment.course ? assignment.course.name : 'Course')}</p>
        </div>
        <em class="${escapeHtml(assignmentStatusClass(submission.status))}">${escapeHtml(submission.status || 'Submitted')}</em>
      </div>

      <div class="admin-assignment-meta">
        ${infoItem('Student Email', student.email)}
        ${infoItem('Phone', student.phone)}
        ${infoItem('Module', assignment.module ? assignment.module.title : 'Course level')}
        ${infoItem('Submitted', formatDate(submission.submittedAt))}
        ${infoItem('Due Date', formatDate(assignment.dueAt))}
        ${infoItem('Max Marks', assignment.maxMarks || 100)}
      </div>

      <div class="admin-assignment-answer">
        <strong>Student Answer</strong>
        <p>${escapeHtml(submission.submissionText || 'No written answer submitted.')}</p>
        ${submission.fileUrl ? `<a href="${escapeHtml(submission.fileUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open submitted file/link</a>` : '<span>No file/link attached.</span>'}
      </div>

      <form class="admin-assignment-review-form" id="assignmentReviewForm">
        <label>
          <span>Status</span>
          <select id="reviewStatus">${assignmentStatusOptions(submission.status || 'Submitted')}</select>
        </label>
        <label>
          <span>Marks</span>
          <input id="reviewMarks" type="number" min="0" max="${escapeHtml(assignment.maxMarks || 100)}" step="1" value="${escapeHtml(submission.marks === null || submission.marks === undefined ? '' : submission.marks)}" placeholder="Marks">
        </label>
        <label class="wide">
          <span>Feedback</span>
          <textarea id="reviewFeedback" placeholder="Feedback for student">${escapeHtml(submission.feedback || '')}</textarea>
        </label>
        <button class="admin-secondary-btn" type="submit"><i class="fa-solid fa-check"></i> Save Review</button>
      </form>
    `;

    qs('assignmentReviewForm')?.addEventListener('submit', (event) => reviewAssignmentSubmission(event, submission));
  }

  function renderAssignmentSubmissions() {
    const list = qs('adminAssignmentList');
    if (!list) return;
    const filtered = filteredAssignmentSubmissions();
    list.innerHTML = filtered.map((submission) => {
      const assignment = submission.assignment || {};
      const student = submission.student || {};
      return `
        <button class="${Number(submission.id) === Number(selectedSubmissionId) ? 'active' : ''}" type="button" data-assignment-submission-id="${submission.id}">
          <span>
            <strong>${escapeHtml(student.fullName || 'Student')}</strong>
            <small>${escapeHtml(student.enrollmentNo || student.email || '-')}</small>
          </span>
          <span>
            <strong>${escapeHtml(assignment.title || 'Assignment')}</strong>
            <small>${escapeHtml(assignment.course ? assignment.course.name : 'Course')}</small>
          </span>
          <em class="${escapeHtml(assignmentStatusClass(submission.status))}">${escapeHtml(submission.status || 'Submitted')}</em>
          <time>${escapeHtml(formatDate(submission.submittedAt))}</time>
        </button>
      `;
    }).join('') || '<div class="admin-empty-inline">No assignment submissions found.</div>';

    list.querySelectorAll('[data-assignment-submission-id]').forEach((button) => {
      button.addEventListener('click', () => selectSubmission(Number(button.dataset.assignmentSubmissionId)));
    });

    if (selectedSubmissionId && !filtered.some((submission) => Number(submission.id) === Number(selectedSubmissionId))) {
      selectedSubmissionId = null;
      if (qs('adminAssignmentDetail')) {
        qs('adminAssignmentDetail').innerHTML = `
          <div class="admin-empty-state">
            <i class="fa-solid fa-clipboard-check"></i>
            <h2>Select a submission</h2>
            <p>Open any assignment submission to review answer, marks, feedback and status.</p>
          </div>
        `;
      }
    }
  }

  function renderAssignmentEmpty() {
    if (!qs('adminAssignmentDetail')) return;
    qs('adminAssignmentDetail').innerHTML = `
      <div class="admin-empty-state">
        <i class="fa-solid fa-clipboard-check"></i>
        <h2>Select a submission</h2>
        <p>Open any assignment submission to review answer, marks, feedback and status.</p>
      </div>
    `;
  }

  function readSupportStore() {
    try {
      const items = JSON.parse(localStorage.getItem(supportStoreKey) || '[]');
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  }

  function renderSupportRequests() {
    const list = qs('adminSupportList');
    if (!list) return;

    list.innerHTML = supportRequests.map((request) => `
      <article class="admin-support-card">
        <div>
          <span>${escapeHtml(formatDate(request.createdAt))}</span>
          <h3>${escapeHtml(String(request.subject || 'Support Request').replace(/^\[Student Support\]\s*/i, ''))}</h3>
          <p>${escapeHtml(request.message || 'No message provided.')}</p>
        </div>
        <aside>
          <strong>${escapeHtml(request.name || 'Student')}</strong>
          <a href="mailto:${escapeHtml(request.email || '')}">${escapeHtml(request.email || '-')}</a>
          <a href="tel:${escapeHtml(request.phone || '')}">${escapeHtml(request.phone || '-')}</a>
        </aside>
      </article>
    `).join('') || '<div class="admin-empty-inline">No support requests yet.</div>';
  }

  async function loadSupportRequests() {
    if (isDevMode) {
      supportRequests = readSupportStore();
      renderSupportRequests();
      return;
    }

    try {
      const data = await fetchJson('/admin/support-requests');
      supportRequests = data.supportRequests || [];
      renderSupportRequests();
    } catch (err) {
      showAlert(err.message || 'Could not load support requests.');
    }
  }

  async function loadAssignmentSubmissions() {
    if (isDevMode) {
      renderAssignmentSubmissions();
      return;
    }

    try {
      const data = await fetchJson('/admin/assignment-submissions');
      assignmentSubmissions = data.submissions || [];
      renderAssignmentSubmissions();
      if (selectedSubmissionId) selectSubmission(selectedSubmissionId);
    } catch (err) {
      showAlert(err.message || 'Could not load assignment submissions.');
    }
  }

  async function loadLmsCourse(courseId) {
    if (!courseId) return;
    if (isDevMode) {
      lmsCourse = courses.find((course) => Number(course.id) === Number(courseId)) || courses[0] || null;
      renderLmsBuilder();
      return;
    }

    try {
      const data = await fetchJson('/admin/courses/' + courseId + '/lms');
      lmsCourse = data.course;
      renderLmsBuilder();
    } catch (err) {
      showAlert(err.message || 'Could not load course builder content.');
    }
  }

  async function createLmsItem(path, payload, devMutator, successMessage) {
    if (!lmsCourse) {
      showAlert('Please select a course first.');
      return;
    }

    try {
      if (isDevMode) {
        devMutator();
        showAlert(successMessage + ' in dev preview.', 'success');
        renderLmsBuilder();
        return;
      }

      await fetchJson(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showAlert(successMessage + '.', 'success');
      await loadLmsCourse(lmsCourse.id);
    } catch (err) {
      showAlert(err.message || 'Could not save LMS item.');
    }
  }

  function infoItem(label, value) {
    return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(safeText(value))}</strong></div>`;
  }

  function documentStatus(documents) {
    const required = [
      { label: 'Photo', keys: ['photo', 'student_photo'] },
      { label: 'Aadhaar / ID Proof', keys: ['aadhaar', 'identity', 'id proof', 'id'] },
      { label: 'Qualification Certificate', keys: ['qualification', 'education', 'certificate', 'marksheet'] },
    ];
    return required.map(({ label, keys }) => {
      const found = documents.find((doc) => {
        const type = String(doc.docType || '').toLowerCase();
        return keys.some((key) => type.includes(key));
      });
      const isVerified = found && String(found.status || '').toLowerCase() === 'verified';
      return `<span class="${isVerified ? 'done' : 'pending'}"><i class="fa-solid ${isVerified ? 'fa-check' : 'fa-clock'}"></i> ${escapeHtml(label)}${found ? ` - ${escapeHtml(found.status || 'Pending')}` : ''}</span>`;
    }).join('');
  }

  function documentStatusClass(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'verified') return 'verified';
    if (value === 'rejected') return 'rejected';
    return 'pending';
  }

  function renderDocumentReview(documents) {
    if (!documents.length) return '<div class="admin-empty-inline">No documents uploaded yet.</div>';

    return `
      <div class="admin-doc-review-list">
        ${documents.map((doc) => {
          const status = safeText(doc.status, 'Pending');
          return `
            <article class="admin-doc-review-row">
              <div>
                <strong>${escapeHtml(doc.docType)}</strong>
                <span>${escapeHtml(safeText(doc.fileName, 'Uploaded document'))}</span>
                ${doc.reviewNote ? `<p>${escapeHtml(doc.reviewNote)}</p>` : ''}
              </div>
              <em class="${documentStatusClass(status)}">${escapeHtml(status)}</em>
              <div class="admin-doc-actions">
                ${doc.fileUrl ? `<a href="${escapeHtml(doc.fileUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> View</a>` : ''}
                <button type="button" data-review-document="${escapeHtml(doc.id)}" data-document-status="Verified" ${status === 'Verified' ? 'disabled' : ''}><i class="fa-solid fa-circle-check"></i> Verify</button>
                <button type="button" data-review-document="${escapeHtml(doc.id)}" data-document-status="Rejected"><i class="fa-solid fa-circle-xmark"></i> Reject</button>
                <button type="button" data-review-document="${escapeHtml(doc.id)}" data-document-status="Pending" ${status === 'Pending' ? 'disabled' : ''}><i class="fa-solid fa-clock"></i> Pending</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function registrationStatusClass(status) {
    const value = String(status || 'incomplete').toLowerCase();
    if (value === 'verified') return 'verified';
    if (value === 'submitted') return 'submitted';
    if (value === 'correction_needed') return 'correction';
    if (value === 'rejected') return 'rejected';
    return 'incomplete';
  }

  function renderRegistrationReview(student, documents) {
    const status = String(student.registrationStatus || 'incomplete').toLowerCase();
    const canApprove = status !== 'verified';
    const identity = [student.identityProofType, student.identityNumber].filter(Boolean).join(' - ');
    const emergency = [student.emergencyName, student.emergencyPhone, student.emergencyRelation].filter(Boolean).join(' / ');
    const address = [student.street || student.address, student.city, student.state, student.country, student.pincode].filter(Boolean).join(', ');
    const fields = [
      ['Father Name', student.fatherName],
      ['Mother Name', student.motherName],
      ['DOB / Gender', [student.dob, student.gender].filter(Boolean).join(' / ')],
      ['Nationality', student.nationality],
      ['Identity', identity],
      ['Emergency Contact', emergency],
      ['Address', address],
      ['Education', [student.qualification, student.passingYear].filter(Boolean).join(' / ')],
      ['Institute / Board', [student.institute, student.board].filter(Boolean).join(' / ')],
      ['Work Experience', student.workExperience],
      ['Language', [student.primaryLanguage, student.additionalLanguage].filter(Boolean).join(' / ')],
      ['Learning Preference', [student.preferredBatch, student.learningMode].filter(Boolean).join(' / ')],
    ];

    return `
      <div class="admin-detail-section">
        <h3>Registration review</h3>
        <div class="admin-registration-review ${registrationStatusClass(status)}">
          <div class="admin-registration-review-head">
            <div>
              <strong>${escapeHtml(registrationLabel(status))}</strong>
              <span>${escapeHtml(student.registrationSubmittedAt ? 'Submitted ' + formatDate(student.registrationSubmittedAt) : 'Profile not submitted yet')}</span>
              ${student.registrationReviewedAt ? `<span>Reviewed ${escapeHtml(formatDate(student.registrationReviewedAt))}${student.registrationReviewedBy ? ` by ${escapeHtml(student.registrationReviewedBy)}` : ''}</span>` : ''}
              ${student.registrationReviewNote ? `<p>${escapeHtml(student.registrationReviewNote)}</p>` : ''}
            </div>
            <em>${escapeHtml(registrationLabel(status))}</em>
          </div>

          <div class="admin-registration-grid">
            ${fields.map(([label, value]) => infoItem(label, value)).join('')}
          </div>

          <div class="admin-registration-docs">
            <strong>Uploaded document status</strong>
            <div class="admin-doc-checklist">${documentStatus(documents)}</div>
          </div>

          <label class="admin-review-note">
            <span>Correction / rejection note</span>
            <textarea id="registrationReviewNote" placeholder="Write what the student should correct, or why the registration is rejected.">${['correction_needed', 'rejected'].includes(status) ? escapeHtml(student.registrationReviewNote || '') : ''}</textarea>
          </label>

          <div class="admin-review-actions">
            <button type="button" data-registration-review="verified" ${canApprove ? '' : 'disabled'}><i class="fa-solid fa-circle-check"></i> Approve Registration</button>
            <button type="button" data-registration-review="correction_needed"><i class="fa-solid fa-pen-to-square"></i> Request Correction</button>
            <button type="button" data-registration-review="rejected"><i class="fa-solid fa-circle-xmark"></i> Reject</button>
          </div>
        </div>
      </div>
    `;
  }

  function certificateLink(token) {
    const origin = window.location.origin || 'https://naisftindia.com';
    return origin + '/certificate-verify.html?token=' + encodeURIComponent(token || '') + localApiSuffix;
  }

  function certificateDownloadLink(token) {
    return API + '/certificates/download/' + encodeURIComponent(token || '');
  }

  function certificateActions(cert) {
    if (!cert || !cert.verifyToken) return '';
    const link = certificateLink(cert.verifyToken);
    const downloadLink = certificateDownloadLink(cert.verifyToken);
    return `
      <div class="admin-cert-actions">
        <a href="${escapeHtml(link)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Certificate</a>
        <a class="download" href="${escapeHtml(downloadLink)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-arrow-down"></i> Download</a>
        <button type="button" data-copy-certificate-link="${escapeHtml(link)}"><i class="fa-solid fa-link"></i> Copy Link</button>
        ${cert.status === 'REVOKED'
          ? `<button type="button" data-reissue-certificate="${escapeHtml(cert.id)}"><i class="fa-solid fa-rotate"></i> Reissue</button>`
          : `<button class="danger" type="button" data-revoke-certificate="${escapeHtml(cert.id)}"><i class="fa-solid fa-ban"></i> Revoke</button>`}
      </div>
    `;
  }

  async function copyCertificateLink(link, button) {
    try {
      await navigator.clipboard.writeText(link);
      if (button) button.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
    } catch (err) {
      window.prompt('Copy certificate link:', link);
    }
  }

  function devCompletionSummary(student) {
    const studentEnrollments = student.enrollments || [];
    const payments = student.feePayments || [];
    const certificates = student.certificates || [];
    const identityCards = student.identityCards || [];
    const paidTotal = payments
      .filter((payment) => String(payment.status || '').toLowerCase() === 'paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalDue = studentEnrollments.reduce((sum, enrollment) => sum + Number(enrollment.course?.fee || 0), 0);
    const feeCleared = totalDue > 0 && paidTotal >= totalDue;

    return studentEnrollments.map((enrollment) => {
      const course = courses.find((item) => Number(item.id) === Number(enrollment.course?.id)) || enrollment.course || {};
      const lessons = (course.modules || []).flatMap((module) => module.lessons || []);
      const completedLessons = Number(student.id) === 2 ? lessons.length : 0;
      const assignments = course.assignments || [];
      const reviewedAssignments = assignments.filter((assignment) =>
        assignmentSubmissions.some((submission) =>
          Number(submission.studentId) === Number(student.id)
          && Number(submission.assignmentId) === Number(assignment.id)
          && submission.status === 'Reviewed'
        )
      ).length;
      const certificate = certificates.find((item) => Number(item.course?.id) === Number(course.id)) || null;
      const lessonComplete = lessons.length === 0 || completedLessons >= lessons.length;
      const assignmentsReviewed = assignments.length === 0 || reviewedAssignments >= assignments.length;
      const enrollmentCompleted = enrollment.status === 'Completed';
      return {
        enrollmentId: enrollment.id,
        courseId: course.id,
        courseName: course.name,
        enrollmentStatus: enrollment.status,
        totalLessons: lessons.length,
        completedLessons,
        lessonProgressPercent: lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 100,
        totalAssignments: assignments.length,
        reviewedAssignments,
        paidTotal,
        totalDue,
        feeCleared,
        lessonComplete,
        assignmentsReviewed,
        enrollmentCompleted,
        certificateIssued: Boolean(certificate),
        certificate,
        eligible: lessonComplete && assignmentsReviewed && feeCleared && enrollmentCompleted,
        checklist: [
          { key: 'lessons', label: 'Lessons completed', done: lessonComplete },
          { key: 'assignments', label: 'Assignments reviewed', done: assignmentsReviewed },
          { key: 'payment', label: 'Full fee cleared', done: feeCleared },
          { key: 'completion', label: 'Course marked completed', done: enrollmentCompleted },
        ],
      };
    });
  }

  function renderCompletionSummary(student, completion) {
    const target = qs('adminCompletionSummary');
    if (!target) return;
    if (!completion || !completion.length) {
      target.innerHTML = '<div class="admin-empty-inline">No course completion data available.</div>';
      return;
    }

    target.innerHTML = completion.map((item) => {
      const canIssue = item.eligible || item.certificateIssued;
      return `
        <article class="admin-completion-card">
          <div class="admin-completion-head">
            <div>
              <span>${escapeHtml(item.enrollmentStatus || 'Pending')}</span>
              <strong>${escapeHtml(item.courseName || 'Course')}</strong>
            </div>
            <em class="${item.certificateIssued ? 'issued' : (item.eligible ? 'eligible' : 'pending')}">${item.certificateIssued ? 'Certificate issued' : (item.eligible ? 'Eligible' : 'Not eligible')}</em>
          </div>
          <div class="admin-completion-progress">
            <div><span>Lessons</span><strong>${escapeHtml(item.completedLessons || 0)}/${escapeHtml(item.totalLessons || 0)}</strong></div>
            <div><span>Progress</span><strong>${escapeHtml(item.lessonProgressPercent || 0)}%</strong></div>
            <div><span>Assignments</span><strong>${escapeHtml(item.reviewedAssignments || 0)}/${escapeHtml(item.totalAssignments || 0)}</strong></div>
            <div><span>Fee Status</span><strong>${item.feeCleared ? 'Cleared' : 'Pending'}</strong></div>
          </div>
          <div class="admin-completion-checks">
            ${(item.checklist || []).map((check) => `<span class="${check.done ? 'done' : 'pending'}"><i class="fa-solid ${check.done ? 'fa-check' : 'fa-clock'}"></i> ${escapeHtml(check.label)}</span>`).join('')}
          </div>
          <div class="admin-completion-actions">
            <button class="admin-secondary-btn" type="button" data-complete-course="${escapeHtml(item.courseId)}" ${item.enrollmentCompleted ? 'disabled' : ''}><i class="fa-solid fa-flag-checkered"></i> ${item.enrollmentCompleted ? 'Completed' : 'Mark Course Completed'}</button>
            <button class="admin-secondary-btn" type="button" data-issue-certificate-course="${escapeHtml(item.courseId)}" ${canIssue && !item.certificateIssued ? '' : 'disabled'}><i class="fa-solid fa-certificate"></i> ${item.certificateIssued ? 'Certificate Issued' : 'Issue Certificate'}</button>
          </div>
          ${item.certificateIssued && item.certificate ? `<div class="admin-cert-row"><strong>Verify token</strong><span>${escapeHtml(item.certificate.verifyToken)}</span>${certificateActions(item.certificate)}</div>` : ''}
        </article>
      `;
    }).join('');

    target.querySelectorAll('[data-complete-course]').forEach((button) => {
      button.addEventListener('click', () => markCourseCompleted(student, Number(button.dataset.completeCourse)));
    });
    target.querySelectorAll('[data-issue-certificate-course]').forEach((button) => {
      button.addEventListener('click', () => issueCertificate(student, Number(button.dataset.issueCertificateCourse)));
    });
    target.querySelectorAll('[data-copy-certificate-link]').forEach((button) => {
      button.addEventListener('click', () => copyCertificateLink(button.dataset.copyCertificateLink, button));
    });
  }

  function selectStudent(studentId) {
    selectedStudentId = studentId;
    const student = students.find((item) => item.id === studentId);
    if (!student) return;

    const totals = paymentTotals(student);
    const enrollments = student.enrollments || [];
    const payments = student.feePayments || [];
    const documents = student.documents || [];
    const certificates = student.certificates || [];
    const identityCards = student.identityCards || [];

    qs('adminStudentDetail').innerHTML = `
      <div class="admin-detail-head">
        <div>
          <span>${escapeHtml(safeText(student.enrollmentNo, 'Enrollment pending'))}</span>
          <h2>${escapeHtml(student.fullName)}</h2>
          <p>${escapeHtml(student.email)} / ${escapeHtml(student.phone)}</p>
        </div>
        <em class="${student.isVerified ? 'active' : 'pending'}">${student.isVerified ? 'Verified' : 'Pending'}</em>
      </div>

      <div class="admin-detail-stats">
        <div><span>Total Fee</span><strong>${amount(totals.due)}</strong></div>
        <div><span>Paid</span><strong>${amount(totals.paid)}</strong></div>
        <div><span>Pending</span><strong>${amount(totals.pending)}</strong></div>
      </div>

      <div class="admin-detail-section">
        <h3>Student profile</h3>
        <div class="admin-profile-grid">
          ${infoItem('Phone', student.phone)}
          ${infoItem('WhatsApp', student.whatsapp || student.phone)}
          ${infoItem('Alternate', student.alternatePhone)}
          ${infoItem('Qualification', student.qualification)}
          ${infoItem('Experience', student.workExperience)}
          ${infoItem('Joined', formatDate(student.createdAt))}
          ${infoItem('City', student.city)}
          ${infoItem('State', student.state)}
          ${infoItem('Country', student.country)}
          ${infoItem('Address', student.address)}
        </div>
      </div>

      ${renderRegistrationReview(student, documents)}

      <div class="admin-detail-section">
        <h3>Enrollments</h3>
        ${enrollments.map((enrollment) => `
          <div class="admin-action-row">
            <div><strong>${escapeHtml(enrollment.course ? enrollment.course.name : 'Course')}</strong><span>${escapeHtml(enrollment.course ? enrollment.course.duration : '-')}</span></div>
            ${renderStatusSelect('enrollment', enrollment.id, enrollment.status || 'Pending')}
          </div>
        `).join('') || '<div class="admin-empty-inline">No enrollments yet.</div>'}
      </div>

      <div class="admin-detail-section">
        <h3>Add / activate course after offline payment</h3>
        <form class="admin-manual-form" id="manualEnrollForm">
          <label>
            <span>Course</span>
            <select id="manualCourseId" required>${renderCourseOptions(enrollments[0] && enrollments[0].course ? enrollments[0].course.id : '')}</select>
          </label>
          <label>
            <span>Amount received</span>
            <input id="manualPaymentAmount" type="number" min="0" step="1" placeholder="Course fee">
          </label>
          <label>
            <span>Payment mode</span>
            <select id="manualPaymentMode">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI Transfer">UPI Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Offline">Offline</option>
            </select>
          </label>
          <label>
            <span>Receipt / reference</span>
            <input id="manualReceiptNo" placeholder="Optional receipt or UPI reference">
          </label>
          <button class="admin-secondary-btn" type="submit"><i class="fa-solid fa-circle-check"></i> Mark paid & activate course</button>
        </form>
      </div>

      <div class="admin-detail-section" id="payments">
        <h3>Payments</h3>
        ${payments.map((payment) => `
          <div class="admin-action-row">
            <div>
              <strong>${escapeHtml(payment.receiptNo || 'Receipt pending')}</strong>
              <span>${escapeHtml(payment.paymentMode || 'Online')} / ${amount(payment.amount)} / ${escapeHtml(formatDate(payment.paidAt || payment.createdAt))}</span>
              ${paymentCourseLabel(payment) ? `<small>${escapeHtml(paymentCourseLabel(payment))}</small>` : ''}
            </div>
            ${renderPaymentAction(payment)}
          </div>
        `).join('') || '<div class="admin-empty-inline">No payment records yet.</div>'}
      </div>

      <div class="admin-detail-section">
        <h3>Documents</h3>
        <div class="admin-doc-checklist">
          ${documentStatus(documents)}
        </div>
        ${renderDocumentReview(documents)}
      </div>

      <div class="admin-detail-section" id="completion">
        <h3>Course completion & certificate eligibility</h3>
        <div class="admin-completion-list" id="adminCompletionSummary">
          <div class="admin-empty-inline">Loading course completion summary...</div>
        </div>
      </div>

      <div class="admin-detail-section" id="certificates">
        <h3>Certificates</h3>
        ${certificates.map((cert) => `<div class="admin-cert-row"><strong>${escapeHtml(cert.course ? cert.course.name : 'Certificate')}</strong><span>${escapeHtml(cert.status || 'VALID')} · ${escapeHtml(cert.certificateNumber || cert.verifyToken)}</span>${certificateActions(cert)}</div>`).join('') || '<div class="admin-empty-inline">No certificate issued.</div>'}
      </div>

      <div class="admin-detail-section" id="identity-cards">
        <h3>Student identity card</h3>
        ${identityCards.length ? identityCards.map((card) => `<div class="admin-cert-row"><strong>${escapeHtml(card.cardNumber)}</strong><span>${escapeHtml(card.status)} · expires ${escapeHtml(formatDate(card.expiresAt))}</span><div class="admin-cert-actions"><a href="identity-card-verify.html?token=${encodeURIComponent(card.verifyToken)}${localApiSuffix}" target="_blank" rel="noopener">Verify</a><a href="${API}/identity-cards/download/${encodeURIComponent(card.verifyToken)}" target="_blank" rel="noopener">View Card</a>${card.status === 'ACTIVE' ? `<button class="danger" type="button" data-revoke-identity-card="${card.id}">Revoke</button><button type="button" data-replace-identity-card="${card.id}">Replace</button>` : ''}</div></div>`).join('') : '<div class="admin-empty-inline">No identity card issued.</div>'}
        <button class="admin-secondary-btn" type="button" id="issueIdentityCardBtn" ${student.isVerified && !identityCards.some((card) => card.status === 'ACTIVE' && new Date(card.expiresAt) > new Date()) ? '' : 'disabled'}><i class="fa-solid fa-id-card"></i> Issue Identity Card</button>
      </div>

      <div class="admin-detail-section" id="credential-audit">
        <h3>Credential audit history</h3>
        <div id="credentialAuditList"><div class="admin-empty-inline">Loading credential activity…</div></div>
      </div>
    `;

    qs('adminStudentDetail').querySelectorAll('[data-admin-action]').forEach((select) => {
      select.addEventListener('change', () => updateStatus(select.dataset.adminAction, select.dataset.id, select.value));
    });

    qs('manualCourseId')?.addEventListener('change', (event) => {
      const selected = event.target.selectedOptions[0];
      if (selected && selected.dataset.fee && qs('manualPaymentAmount')) {
        qs('manualPaymentAmount').value = Math.round(Number(selected.dataset.fee || 0));
      }
    });
    if (qs('manualCourseId')) qs('manualCourseId').dispatchEvent(new Event('change'));
    qs('manualEnrollForm')?.addEventListener('submit', (event) => manualEnrollStudent(event, student));
    qs('adminStudentDetail').querySelectorAll('[data-registration-review]').forEach((button) => {
      button.addEventListener('click', () => reviewRegistration(student, button.dataset.registrationReview, qs('registrationReviewNote')?.value || ''));
    });
    qs('adminStudentDetail').querySelectorAll('[data-review-document]').forEach((button) => {
      button.addEventListener('click', () => reviewDocument(student, Number(button.dataset.reviewDocument), button.dataset.documentStatus));
    });
    qs('adminStudentDetail').querySelectorAll('[data-approve-offline-payment]').forEach((button) => {
      button.addEventListener('click', () => approveOfflinePayment(student, Number(button.dataset.approveOfflinePayment)));
    });
    qs('adminStudentDetail').querySelectorAll('[data-copy-certificate-link]').forEach((button) => {
      button.addEventListener('click', () => copyCertificateLink(button.dataset.copyCertificateLink, button));
    });
    qs('issueIdentityCardBtn')?.addEventListener('click', () => issueIdentityCard(student));
    qs('adminStudentDetail').querySelectorAll('[data-revoke-certificate]').forEach((button) => button.addEventListener('click', () => revokeCertificate(student, Number(button.dataset.revokeCertificate))));
    qs('adminStudentDetail').querySelectorAll('[data-reissue-certificate]').forEach((button) => button.addEventListener('click', () => reissueCertificate(student, Number(button.dataset.reissueCertificate))));
    qs('adminStudentDetail').querySelectorAll('[data-revoke-identity-card]').forEach((button) => button.addEventListener('click', () => revokeIdentityCard(student, Number(button.dataset.revokeIdentityCard))));
    qs('adminStudentDetail').querySelectorAll('[data-replace-identity-card]').forEach((button) => button.addEventListener('click', () => replaceIdentityCard(student, Number(button.dataset.replaceIdentityCard))));
    loadStudentCompletion(student);
    loadCredentialAudit(student.id);
    renderStudents();
  }

  async function loadStudentCompletion(student) {
    if (isDevMode) {
      renderCompletionSummary(student, devCompletionSummary(student));
      return;
    }

    try {
      const data = await fetchJson('/admin/students/' + student.id + '/completion-summary');
      renderCompletionSummary(student, data.completion || []);
    } catch (err) {
      const target = qs('adminCompletionSummary');
      if (target) target.innerHTML = `<div class="admin-empty-inline">${escapeHtml(err.message || 'Could not load completion summary.')}</div>`;
    }
  }

  async function manualEnrollStudent(event, student) {
    event.preventDefault();
    const courseId = Number(qs('manualCourseId')?.value || 0);
    if (!courseId) {
      showAlert('Please select a course.');
      return;
    }

    const payload = {
      courseId,
      amount: Number(qs('manualPaymentAmount')?.value || 0),
      paymentMode: qs('manualPaymentMode')?.value || 'Offline',
      receiptNo: qs('manualReceiptNo')?.value || '',
      status: 'Active',
      paymentStatus: 'Paid',
    };

    if (isDevMode) {
      const course = courses.find((item) => Number(item.id) === courseId);
      if (course) {
        const existing = (student.enrollments || []).find((item) => Number(item.course?.id) === courseId);
        if (existing) existing.status = 'Active';
        else student.enrollments = [{ id: Date.now(), status: 'Active', course }, ...(student.enrollments || [])];
        student.feePayments = [{
          id: Date.now() + 1,
          receiptNo: payload.receiptNo || 'manual_DEV_' + Date.now(),
          paymentMode: payload.paymentMode,
          amount: payload.amount || course.fee,
          status: 'Paid',
        }, ...(student.feePayments || [])];
      }
      showAlert('Course activated in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      await fetchJson('/admin/students/' + student.id + '/enrollments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showAlert('Offline payment recorded and course activated.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not activate course.');
    }
  }

  async function reviewRegistration(student, status, reviewNote) {
    const note = String(reviewNote || '').trim();
    if (['correction_needed', 'rejected'].includes(status)) {
      if (!note) {
        showAlert('Please enter a review note.');
        qs('registrationReviewNote')?.focus();
        return;
      }
    }

    if (isDevMode) {
      student.registrationStatus = status;
      student.registrationReviewNote = note;
      student.registrationReviewedAt = new Date().toISOString();
      showAlert('Registration status updated in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      const data = await fetchJson('/admin/students/' + student.id + '/registration', {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      const index = students.findIndex((item) => Number(item.id) === Number(student.id));
      if (index >= 0 && data.student) students[index] = data.student;
      showAlert('Registration status updated.', 'success');
      selectStudent(student.id);
    } catch (err) {
      showAlert(err.message || 'Could not update registration status.');
    }
  }

  async function reviewDocument(student, documentId, status) {
    const document = (student.documents || []).find((item) => Number(item.id) === Number(documentId));
    if (!document) return;

    let note = '';
    if (status === 'Rejected') {
      note = window.prompt('Reason for rejecting this document?') || '';
      if (!note.trim()) {
        showAlert('Please enter a rejection note.');
        return;
      }
    }

    if (isDevMode) {
      document.status = status;
      document.reviewNote = note || '';
      document.reviewedAt = status === 'Pending' ? null : new Date().toISOString();
      showAlert('Document review updated in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      const data = await fetchJson('/admin/documents/' + documentId, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      if (data.document) Object.assign(document, data.document);
      showAlert('Document review updated.', 'success');
      selectStudent(student.id);
    } catch (err) {
      showAlert(err.message || 'Could not update document review.');
    }
  }

  async function approveOfflinePayment(student, paymentId) {
    const payment = (student.feePayments || []).find((item) => Number(item.id) === Number(paymentId));
    if (!payment) return;

    if (isDevMode) {
      payment.status = 'Paid';
      payment.paidAt = new Date().toISOString();
      const linkedEnrollmentId = Number(payment.enrollmentId || payment.enrollment?.id || 0);
      const linkedCourseId = Number(payment.courseId || payment.course?.id || 0);
      const enrollment = (student.enrollments || []).find((item) =>
        (linkedEnrollmentId && Number(item.id) === linkedEnrollmentId)
        || (linkedCourseId && Number(item.course?.id) === linkedCourseId)
        || item.status === 'Pending'
      );
      if (enrollment) enrollment.status = 'Active';
      showAlert('Offline payment approved in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      await fetchJson('/admin/payments/' + paymentId + '/approve-offline', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      showAlert('Offline payment approved and course activated.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not approve offline payment.');
    }
  }

  async function updateStatus(kind, id, status) {
    if (isDevMode) {
      showAlert(kind + ' status updated in dev preview.', 'success');
      return;
    }

    try {
      const path = kind === 'enrollment' ? '/admin/enrollments/' + id : '/admin/payments/' + id;
      await fetchJson(path, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showAlert('Status updated successfully.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not update status.');
    }
  }

  async function markCourseCompleted(student, courseId) {
    const enrollment = (student.enrollments || []).find((item) => Number(item.course?.id) === Number(courseId));
    if (!enrollment) return;

    if (isDevMode) {
      enrollment.status = 'Completed';
      const exists = (student.certificates || []).some((cert) => Number(cert.course?.id) === Number(courseId));
      if (!exists) {
        student.certificates = [{
          verifyToken: 'DEV-CERT-' + Date.now(),
          course: enrollment.course,
        }, ...(student.certificates || [])];
      }
      showAlert('Course marked completed and certificate issued in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      const data = await fetchJson('/admin/students/' + student.id + '/courses/' + courseId + '/complete', {
        method: 'POST',
      });
      showAlert(data && data.certificate ? 'Course completed and certificate issued.' : 'Course marked completed successfully.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not mark course completed.');
    }
  }

  async function issueCertificate(student, courseId) {
    const enrollment = (student.enrollments || []).find((item) => Number(item.course?.id) === Number(courseId));
    if (!enrollment || !enrollment.course) return;
    if (isDevMode) {
      const exists = (student.certificates || []).some((cert) => Number(cert.course?.id) === Number(courseId));
      if (!exists) {
        student.certificates = [{
          verifyToken: 'DEV-CERT-' + Date.now(),
          course: enrollment.course,
        }, ...(student.certificates || [])];
      }
      showAlert('Certificate issued in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }

    try {
      await fetchJson('/admin/certificates', {
        method: 'POST',
        body: JSON.stringify({ studentId: student.id, courseId }),
      });
      showAlert('Certificate issued successfully.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not issue certificate.');
    }
  }

  async function issueIdentityCard(student) {
    if (isDevMode) {
      student.identityCards = [{ id: Date.now(), cardNumber: 'NAISFT-ID-2026-000001', verifyToken: 'DEV-ID-' + Date.now(), status: 'ACTIVE', issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() }, ...(student.identityCards || [])];
      showAlert('Student identity card issued in dev preview.', 'success');
      selectStudent(student.id);
      return;
    }
    try {
      await fetchJson('/identity-cards/admin', { method: 'POST', body: JSON.stringify({ studentId: student.id, expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() }) });
      showAlert('Student identity card issued successfully.', 'success');
      await loadData(false);
    } catch (err) {
      showAlert(err.message || 'Could not issue student identity card.');
    }
  }

  async function revokeCertificate(student, certificateId) {
    const reason = await openCredentialModal({ title: 'Revoke certificate', message: 'The QR verification result will immediately show this certificate as revoked.', confirmLabel: 'Revoke Certificate', requireReason: true, danger: true });
    if (!reason) return;
    if (isDevMode) {
      const certificate = (student.certificates || []).find((item) => Number(item.id) === certificateId);
      if (certificate) Object.assign(certificate, { status: 'REVOKED', revokedAt: new Date().toISOString(), revocationReason: reason.trim() });
      showAlert('Certificate revoked in dev preview.', 'success'); selectStudent(student.id); return;
    }
    try { await fetchJson('/admin/certificates/' + certificateId + '/revoke', { method: 'PATCH', body: JSON.stringify({ reason: reason.trim() }) }); showAlert('Certificate revoked.', 'success'); await loadData(false); }
    catch (err) { showAlert(err.message || 'Could not revoke certificate.'); }
  }

  async function reissueCertificate(student, certificateId) {
    const confirmed = await openCredentialModal({ title: 'Reissue certificate', message: 'A new secure QR token will be generated and the previous token will stop working.', confirmLabel: 'Reissue Certificate' });
    if (!confirmed) return;
    if (isDevMode) {
      const certificate = (student.certificates || []).find((item) => Number(item.id) === certificateId);
      if (certificate) Object.assign(certificate, { status: 'VALID', verifyToken: 'DEV-CERT-' + Date.now(), revokedAt: null, revocationReason: null });
      showAlert('Certificate reissued in dev preview.', 'success'); selectStudent(student.id); return;
    }
    try { await fetchJson('/admin/certificates/' + certificateId + '/reissue', { method: 'POST' }); showAlert('Certificate reissued with a new QR token.', 'success'); await loadData(false); }
    catch (err) { showAlert(err.message || 'Could not reissue certificate.'); }
  }

  async function revokeIdentityCard(student, cardId) {
    const reason = await openCredentialModal({ title: 'Revoke identity card', message: 'The card will no longer verify as active after this action.', confirmLabel: 'Revoke ID Card', requireReason: true, danger: true });
    if (!reason) return;
    if (isDevMode) {
      const card = (student.identityCards || []).find((item) => Number(item.id) === cardId);
      if (card) Object.assign(card, { status: 'REVOKED', revokedAt: new Date().toISOString(), revocationReason: reason.trim() });
      showAlert('Identity card revoked in dev preview.', 'success'); selectStudent(student.id); return;
    }
    try { await fetchJson('/identity-cards/admin/' + cardId + '/revoke', { method: 'PATCH', body: JSON.stringify({ reason: reason.trim() }) }); showAlert('Identity card revoked.', 'success'); await loadData(false); }
    catch (err) { showAlert(err.message || 'Could not revoke identity card.'); }
  }

  async function replaceIdentityCard(student, cardId) {
    const reason = await openCredentialModal({ title: 'Replace identity card', message: 'The current card will be marked replaced and a new card with a new QR token will be issued.', confirmLabel: 'Issue Replacement', requireReason: true, defaultReason: 'Lost or damaged card' });
    if (!reason) return;
    if (isDevMode) {
      const oldCard = (student.identityCards || []).find((item) => Number(item.id) === cardId);
      if (oldCard) oldCard.status = 'REPLACED';
      student.identityCards = [{ id: Date.now(), cardNumber: 'NAISFT-ID-2026-000002', verifyToken: 'DEV-ID-' + Date.now(), status: 'ACTIVE', issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() }, ...(student.identityCards || [])];
      showAlert('Identity card replaced in dev preview.', 'success'); selectStudent(student.id); return;
    }
    try { await fetchJson('/identity-cards/admin/' + cardId + '/replace', { method: 'POST', body: JSON.stringify({ reason, expiresAt: new Date(Date.now() + 365 * 86400000).toISOString() }) }); showAlert('Replacement identity card issued.', 'success'); await loadData(false); }
    catch (err) { showAlert(err.message || 'Could not replace identity card.'); }
  }

  async function loadCredentialAudit(studentId) {
    const target = qs('credentialAuditList'); if (!target) return;
    if (isDevMode) { target.innerHTML = '<div class="admin-empty-inline">Credential audit events will appear here after issue, verification, download, revocation or replacement.</div>'; return; }
    try {
      const data = await fetchJson('/admin/credentials/audit?studentId=' + encodeURIComponent(studentId) + '&limit=50');
      const records = data.records || [];
      target.innerHTML = records.length ? records.map((record) => `<div class="admin-action-row"><div><strong>${escapeHtml(record.action.replace(/_/g, ' '))}</strong><span>${escapeHtml(record.credentialType.replace(/_/g, ' '))} · ${escapeHtml(formatDate(record.createdAt))}</span></div><em>${escapeHtml(record.actor || 'Public verification')}</em></div>`).join('') : '<div class="admin-empty-inline">No credential activity recorded.</div>';
    } catch (err) { target.innerHTML = '<div class="admin-empty-inline">Could not load credential audit history.</div>'; }
  }

  async function reviewAssignmentSubmission(event, submission) {
    event.preventDefault();
    const payload = {
      status: qs('reviewStatus')?.value || 'Submitted',
      marks: qs('reviewMarks')?.value || '',
      feedback: qs('reviewFeedback')?.value || '',
    };

    if (isDevMode) {
      submission.status = payload.status;
      submission.marks = payload.marks === '' ? null : Number(payload.marks);
      submission.feedback = payload.feedback;
      submission.reviewedAt = new Date().toISOString();
      showAlert('Assignment review saved in dev preview.', 'success');
      renderAssignmentSubmissions();
      selectSubmission(submission.id);
      return;
    }

    try {
      const data = await fetchJson('/admin/assignment-submissions/' + submission.id, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const index = assignmentSubmissions.findIndex((item) => Number(item.id) === Number(submission.id));
      if (index >= 0) assignmentSubmissions[index] = data.submission || assignmentSubmissions[index];
      showAlert('Assignment review saved successfully.', 'success');
      renderAssignmentSubmissions();
      selectSubmission(submission.id);
    } catch (err) {
      showAlert(err.message || 'Could not save assignment review.');
    }
  }

  function parseManualVerificationMessage(message) {
    return String(message || '').split('\n').reduce((result, line) => {
      const separator = line.indexOf(':');
      if (separator > 0) result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      return result;
    }, {});
  }

  async function loadManualVerifications() {
    const target = qs('manualVerificationList'); if (!target) return;
    if (isDevMode) { target.innerHTML = '<div class="admin-empty-inline">Local preview: submitted certificate-copy requests will appear here.</div>'; return; }
    try {
      const data = await fetchJson('/admin/manual-certificate-verifications');
      const requests = data.requests || [];
      target.innerHTML = requests.length ? requests.map((request) => `<article class="admin-action-row"><div><strong>${escapeHtml(request.studentName)}</strong><span>${escapeHtml(request.requestNumber)} · ${escapeHtml(request.certificateNumber)} · ${escapeHtml(request.programme)}</span><small>${escapeHtml(request.email)} · submitted ${escapeHtml(formatDate(request.createdAt))}</small>${request.reason ? `<p>${escapeHtml(request.reason)}</p>` : ''}${request.adminNote ? `<p><b>Admin note:</b> ${escapeHtml(request.adminNote)}</p>` : ''}</div><div class="admin-cert-actions"><em>${escapeHtml(request.status.replace(/_/g, ' '))}</em>${request.fileUrl ? `<a href="${escapeHtml(request.fileUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-arrow-down"></i> Open Copy</a>` : '<em>No file</em>'}${request.status === 'PENDING' ? `<button type="button" data-review-manual="${request.id}" data-review-status="VERIFIED">Verify</button><button class="danger" type="button" data-review-manual="${request.id}" data-review-status="REJECTED">Reject</button><button type="button" data-review-manual="${request.id}" data-review-status="NEEDS_INFORMATION">Request Info</button>` : ''}</div></article>`).join('') : '<div class="admin-empty-inline">No manual certificate verification requests.</div>';
      target.querySelectorAll('[data-review-manual]').forEach((button) => button.addEventListener('click', () => reviewManualVerification(Number(button.dataset.reviewManual), button.dataset.reviewStatus)));
    } catch (err) { target.innerHTML = '<div class="admin-empty-inline">Could not load manual verification requests.</div>'; }
  }

  async function reviewManualVerification(id, status) {
    const labels = { VERIFIED: 'Mark Verified', REJECTED: 'Reject Request', NEEDS_INFORMATION: 'Request More Information' };
    const adminNote = await openCredentialModal({ title: labels[status] || 'Review request', message: 'Add a clear note explaining this manual verification decision.', confirmLabel: labels[status] || 'Save Review', requireReason: true, danger: status === 'REJECTED' });
    if (!adminNote) return;
    try { await fetchJson('/admin/manual-certificate-verifications/' + id, { method: 'PATCH', body: JSON.stringify({ status, adminNote }) }); showAlert('Manual verification request updated.', 'success'); await loadManualVerifications(); }
    catch (err) { showAlert(err.message || 'Could not update manual verification request.'); }
  }
  async function loadData(showLoader) {
    if (showLoader !== false) setLoading(true);
    showAlert('');

    try {
      if (isDevMode) {
        const data = devPayload();
        students = data.students;
        courses = data.courses || [];
        applications = data.applications || [];
        assignmentSubmissions = data.assignmentSubmissions || [];
        supportRequests = readSupportStore();
        lmsCourse = courses[0] || null;
        renderSummary(data.summary);
        renderStudents();
        renderLmsBuilder();
        renderAssignmentSubmissions();
        renderSupportRequests();
        loadManualVerifications();
        if (selectedStudentId) selectStudent(selectedStudentId);
        setLoading(false);
        return;
      }

      const [summaryData, studentsData, meData, coursesData, applicationsData] = await Promise.all([
        fetchJson('/admin/summary'),
        fetchJson('/admin/students?limit=50'),
        fetchJson('/admin/me'),
        fetchJson('/admin/courses'),
        fetchJson('/admin/applications?limit=50'),
      ]);

      students = studentsData.students || [];
      courses = coursesData.courses || [];
      applications = applicationsData.applications || [];
      assignmentSubmissions = [];
      lmsCourse = courses[0] || null;
      renderSummary(summaryData.summary || {});
      renderStudents();
      renderAssignmentSubmissions();
      renderSupportRequests();
      if (lmsCourse) await loadLmsCourse(lmsCourse.id);
      else renderLmsBuilder();
      await loadAssignmentSubmissions();
      await loadSupportRequests();
      await loadManualVerifications();
      if (selectedStudentId) selectStudent(selectedStudentId);
      if (meData && meData.admin && qs('adminEmailLabel')) qs('adminEmailLabel').textContent = meData.admin.email;
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showAlert(err.message || 'Could not load admin dashboard.');
    }
  }

  document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
    btn.addEventListener('click', logout);
  });

  document.querySelectorAll('[data-admin-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      switchAdminView(link.dataset.adminView || 'overview');
    });
  });

  document.querySelectorAll('[data-lms-step]').forEach((button) => {
    button.addEventListener('click', () => switchLmsStep(button.dataset.lmsStep || 'modules'));
  });

  document.querySelectorAll('[data-admin-pipeline]').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchAdminView('students');
      activePipeline = btn.dataset.adminPipeline || 'all';
      selectedStudentId = null;
      renderStudents();
    });
  });

  qs('adminStudentSearch')?.addEventListener('input', renderStudents);

  qs('lmsCourseSelect')?.addEventListener('change', (event) => loadLmsCourse(Number(event.target.value)));

  qs('assignmentStatusFilter')?.addEventListener('change', () => {
    selectedSubmissionId = null;
    renderAssignmentEmpty();
    renderAssignmentSubmissions();
  });

  qs('refreshSupportRequests')?.addEventListener('click', loadSupportRequests);

  qs('lmsModuleForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = qs('lmsModuleTitle')?.value.trim();
    if (!title) return;
    const payload = {
      title,
      description: qs('lmsModuleDescription')?.value || '',
      position: (lmsCourse.modules || []).length + 1,
    };
    createLmsItem('/admin/courses/' + lmsCourse.id + '/modules', payload, () => {
      lmsCourse.modules = [...(lmsCourse.modules || []), { id: Date.now(), ...payload, lessons: [], liveClasses: [], assignments: [] }];
      event.target.reset();
      switchLmsStep('lessons');
    }, 'Module added');
  });

  qs('lmsLessonForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const moduleId = Number(qs('lmsLessonModule')?.value || 0);
    const title = qs('lmsLessonTitle')?.value.trim();
    if (!moduleId || !title) {
      showAlert('Select a module and enter lesson title.');
      return;
    }
    const module = (lmsCourse.modules || []).find((item) => Number(item.id) === moduleId);
    const payload = {
      title,
      lessonType: qs('lmsLessonType')?.value || 'Video',
      contentUrl: qs('lmsLessonUrl')?.value || '',
      contentText: qs('lmsLessonText')?.value || '',
      position: module ? (module.lessons || []).length + 1 : 1,
    };
    createLmsItem('/admin/modules/' + moduleId + '/lessons', payload, () => {
      if (module) module.lessons = [...(module.lessons || []), { id: Date.now(), ...payload, materials: [] }];
      event.target.reset();
      switchLmsStep('materials');
    }, 'Lesson added');
  });

  qs('lmsMaterialForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const lessonId = Number(qs('lmsMaterialLesson')?.value || 0);
    const title = qs('lmsMaterialTitle')?.value.trim();
    const fileUrl = qs('lmsMaterialUrl')?.value.trim();
    if (!lessonId || !title || !fileUrl) {
      showAlert('Select a lesson and enter material title/link.');
      return;
    }
    const lesson = (lmsCourse.modules || [])
      .flatMap((module) => module.lessons || [])
      .find((item) => Number(item.id) === lessonId);
    const payload = {
      title,
      fileUrl,
      materialType: qs('lmsMaterialType')?.value || 'Link',
      position: lesson ? (lesson.materials || []).length + 1 : 1,
    };
    createLmsItem('/admin/lessons/' + lessonId + '/materials', payload, () => {
      if (lesson) lesson.materials = [...(lesson.materials || []), { id: Date.now(), ...payload }];
      event.target.reset();
      switchLmsStep('preview');
    }, 'Material added');
  });

  qs('lmsLiveClassForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = qs('lmsLiveTitle')?.value.trim();
    const joinUrl = qs('lmsLiveUrl')?.value.trim();
    const startsAt = qs('lmsLiveStartsAt')?.value;
    if (!title || !joinUrl || !startsAt) return;
    const moduleId = Number(qs('lmsLiveModule')?.value || 0) || null;
    const payload = {
      moduleId,
      title,
      teacherName: qs('lmsLiveTeacher')?.value || '',
      platform: qs('lmsLivePlatform')?.value || 'Manual',
      joinUrl,
      startsAt,
      endsAt: qs('lmsLiveEndsAt')?.value || null,
      recordingUrl: qs('lmsLiveRecordingUrl')?.value.trim() || '',
      description: qs('lmsLiveDescription')?.value || '',
      status: 'Scheduled',
    };
    createLmsItem('/admin/courses/' + lmsCourse.id + '/live-classes', payload, () => {
      const liveClass = { id: Date.now(), ...payload };
      lmsCourse.liveClasses = [...(lmsCourse.liveClasses || []), liveClass];
      const module = (lmsCourse.modules || []).find((item) => Number(item.id) === Number(moduleId));
      if (module) module.liveClasses = [...(module.liveClasses || []), liveClass];
      event.target.reset();
      switchLmsStep('preview');
    }, 'Live class scheduled');
  });

  qs('lmsAssignmentForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = qs('lmsAssignmentTitle')?.value.trim();
    if (!title) return;
    const moduleId = Number(qs('lmsAssignmentModule')?.value || 0) || null;
    const payload = {
      moduleId,
      title,
      instructions: qs('lmsAssignmentInstructions')?.value || '',
      attachmentUrl: qs('lmsAssignmentAttachment')?.value.trim() || '',
      dueAt: qs('lmsAssignmentDueAt')?.value || null,
    };
    createLmsItem('/admin/courses/' + lmsCourse.id + '/assignments', payload, () => {
      const assignment = { id: Date.now(), ...payload };
      lmsCourse.assignments = [...(lmsCourse.assignments || []), assignment];
      const module = (lmsCourse.modules || []).find((item) => Number(item.id) === Number(moduleId));
      if (module) module.assignments = [...(module.assignments || []), assignment];
      event.target.reset();
      switchLmsStep('preview');
    }, 'Assignment added');
  });

  const cachedAdmin = (() => {
    try { return JSON.parse(localStorage.getItem('naisft_admin') || '{}'); } catch { return {}; }
  })();
  if (cachedAdmin.email && qs('adminEmailLabel')) qs('adminEmailLabel').textContent = cachedAdmin.email;

  const initialView = window.location.hash.includes('course-builder')
    ? 'course-builder'
    : (window.location.hash.includes('assignments') ? 'assignments' : (window.location.hash.includes('support') ? 'support' : (window.location.hash.includes('students') ? 'students' : 'overview')));
  switchAdminView(initialView);
  loadData(true);
})();
