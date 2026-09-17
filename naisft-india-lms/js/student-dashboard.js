(function () {
  const localApi = new URLSearchParams(location.search).get('api');
  const API = ['localhost','127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '') ? localApi : (['localhost','127.0.0.1'].includes(location.hostname) ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api') : `${location.origin}/api`);
  const localApiSuffix = localApi ? '&api=' + encodeURIComponent(API) : '';
  const token = localStorage.getItem('naisft_token');
  const params = new URLSearchParams(window.location.search);
  const isLocalDevHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isDevMode = Boolean(window.NAISFT_DASHBOARD_DEV) || (isLocalDevHost && params.get('dev') === '1');

  let cachedCourses = [];
  let activeCourseFilter = 'all';
  const supportStoreKey = 'naisft_dev_support_requests';

  const courseImages = [
    'Assets/Course Page Images/safety-training-fallback-01.webp',
    'Assets/Course Page Images/safety-training-fallback-02.webp',
    'Assets/Course Page Images/safety-training-fallback-03.webp',
    'Assets/Course Page Images/safety-training-fallback-04.webp',
    'Assets/Course Page Images/safety-training-fallback-05.webp',
    'Assets/Course Page Images/safety-training-fallback-06.webp',
  ];

  const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  if (!token && !isDevMode) {
    window.location.href = 'student-login.html';
    return;
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function safeText(value, fallback) {
    return value === null || value === undefined || value === '' ? (fallback || '-') : String(value);
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

  function readJsonStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (err) {
      return {};
    }
  }

  function readSupportStore() {
    try {
      const items = JSON.parse(localStorage.getItem(supportStoreKey) || '[]');
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  }

  function writeSupportStore(items) {
    localStorage.setItem(supportStoreKey, JSON.stringify(items || []));
  }

  function logout() {
    localStorage.removeItem('naisft_token');
    localStorage.removeItem('naisft_student');
    window.location.href = 'student-login.html?fresh=1';
  }

  function showAlert(message, type) {
    const alert = qs('dashAlert');
    if (!alert) return;
    alert.textContent = message || '';
    alert.className = 'dash-alert';
    if (message) alert.classList.add('active', type || 'error');
  }

  function setLoading(isLoading) {
    if (qs('dashLoading')) qs('dashLoading').hidden = !isLoading;
    if (qs('dashContent')) qs('dashContent').hidden = isLoading;
  }

  function getDevPayload() {
    return {
      success: true,
      dashboard: {
        totalFeeDue: 41500,
        totalFeePaid: 15000,
        pendingFee: 26500,
        documentsCount: 3,
        enrollmentsCount: 2,
        paymentsCount: 3,
        hasActiveCourse: true,
        registrationStatus: {
          status: 'submitted',
          profilePercent: 92,
          isComplete: true,
          isSubmitted: true,
          missingDocuments: [],
          submittedAt: '2026-07-04T10:00:00.000Z',
          reviewedAt: null,
          reviewNote: null,
        },
        lms: [{
          courseId: 1,
          courseName: 'Diploma in Industrial Safety',
          totalLessons: 2,
          completedLessons: 1,
          progressPercent: 50,
          nextLesson: { id: 202, title: 'Hazard Identification Basics' },
          upcomingLiveClasses: [{
            id: 301,
            title: 'Weekly Safety Doubt Class',
            platform: 'Google Meet',
            teacherName: 'NAISFT Faculty',
            joinUrl: 'https://meet.google.com/demo-class',
            startsAt: '2026-07-04T10:00:00.000Z',
            status: 'Scheduled',
          }],
          assignments: [{
            id: 401,
            title: 'Safety Observation Report',
            dueAt: '2026-07-10T18:00:00.000Z',
            maxMarks: 100,
            submission: null,
          }],
          certificateEligibility: {
            status: 'in_progress',
            message: 'Complete your lessons to unlock certificate review.',
            eligible: false,
            certificateIssued: false,
            checklist: [
              { key: 'lessons', label: 'Complete lessons', done: false },
              { key: 'assignments', label: 'Assignments reviewed', done: false },
              { key: 'payment', label: 'Clear full payment', done: false },
              { key: 'approval', label: 'Admin completion approval', done: false },
            ],
          },
        }],
        student: {
          fullName: 'Aarav Kumar',
          email: 'aarav.kumar@example.com',
          phone: '+91 9876543210',
          whatsapp: '+91 9876543210',
          alternatePhone: '+91 9123456780',
          enrollmentNo: 'NAISFT-2026-0007',
          photoUrl: 'Assets/principal.png',
          country: 'India',
          state: 'Bihar',
          city: 'Patna',
          address: 'Boring Road, Patna, Bihar - 800001',
          qualification: '12th Pass',
          workExperience: 'Fresher',
          isVerified: true,
          isActive: true,
          registrationStatus: 'submitted',
          registrationSubmittedAt: '2026-07-04T10:00:00.000Z',
          registrationReviewNote: null,
          createdAt: '2026-06-29T08:30:00.000Z',
          enrollments: [
            {
              status: 'Active',
              batch: 'Morning Batch',
              learningMode: 'Hybrid',
              admissionNo: 'ADM-NAISFT-2026-0007',
              enrolledAt: '2026-06-29T08:30:00.000Z',
              course: {
                id: 1,
                name: 'Diploma in Industrial Safety',
                duration: '12 Months',
                eligibility: '10th / 12th Pass',
                fee: 26500,
                category: { name: 'Safety Courses' },
                description: 'Career-focused industrial safety training with practical workplace safety, hazard control, and compliance basics.',
              },
            },
            {
              status: 'Pending',
              batch: 'Awaiting allocation',
              learningMode: 'Classroom',
              enrolledAt: '2026-07-01T08:30:00.000Z',
              course: {
                id: 12,
                name: 'Basic Computer',
                duration: '6 Months',
                eligibility: '10th Pass',
                fee: 15000,
                category: { name: 'Computer Courses' },
                description: 'Foundation computer skills, office tools and digital basics.',
              },
            },
          ],
          feePayments: [
            { receiptNo: 'RCPT-DEV-001', paymentMode: 'UPI', amount: 10000, status: 'Paid', paidAt: '2026-06-29T08:35:00.000Z' },
            { receiptNo: 'RCPT-DEV-002', paymentMode: 'Cash', amount: 5000, status: 'Paid', paidAt: '2026-07-05T08:35:00.000Z' },
            { receiptNo: 'order_DEV_PENDING', paymentMode: 'Online', amount: 26500, status: 'Pending' },
          ],
          documents: [
            { docType: 'Photo', fileUrl: '#' },
            { docType: 'Aadhaar / ID Proof', fileUrl: '#' },
            { docType: 'Qualification Certificate', fileUrl: '#' },
          ],
          certificates: [{ verifyToken: 'DEV-CERT-LOCAL-000001', issuedAt: '2026-07-02T10:30:00.000Z', course: { id: 1, name: 'Diploma in Industrial Safety' } }],
        },
      },
    };
  }

  function fallbackCourses() {
    return [
      { id: 1, name: 'Diploma in Industrial Safety', duration: '12 Months', fee: 26500, eligibility: '10th / 12th Pass', category: { name: 'Safety Courses' } },
      { id: 2, name: 'Diploma in Fire Technology', duration: '12 Months', fee: 26500, eligibility: '10th Pass', category: { name: 'Fire Safety' } },
      { id: 3, name: 'Diploma in QA/QC', duration: '12 Months', fee: 26500, eligibility: 'ITI / Diploma', category: { name: 'QA/QC Courses' } },
      { id: 6, name: 'Advanced Diploma in HSE Management', duration: '18 Months', fee: 26500, eligibility: '12th / Graduate', category: { name: 'Safety Courses' } },
      { id: 8, name: 'Advanced Diploma in Food Safety & Quality Management', duration: '12 Months', fee: 26500, eligibility: '12th / Graduate', category: { name: 'Technical Courses' } },
      { id: 12, name: 'Basic Computer', duration: '6 Months', fee: 6500, eligibility: '10th Pass', category: { name: 'Computer Courses' } },
    ];
  }

  function mergeLocalDrafts(student) {
    const step4 = readJsonStore('naisft_step4_draft');
    const step5 = readJsonStore('naisft_step5_draft');
    const normalized = Object.assign({}, student, {
      fatherName: student.fatherName || step4.fatherName,
      motherName: student.motherName || step4.motherName,
      dob: student.dob || step4.dob,
      gender: student.gender || step4.gender,
      bloodGroup: student.bloodGroup || step4.bloodGroup,
      marital: student.marital || student.maritalStatus || step4.marital,
      identityType: student.identityType || student.identityProofType || step4.identityType,
      identityNumber: student.identityNumber || step4.identityNumber || step4.aadhaar,
      emergencyName: student.emergencyName || step4.emergName,
      emergencyPhone: student.emergencyPhone || step4.emergPhone,
      emergencyRelation: student.emergencyRelation || step4.relation,
      pincode: student.pincode || step4.pincode,
      street: student.street || step4.street,
      passYear: student.passYear || student.passingYear || step4.passYear,
      institute: student.institute || step4.institute,
      board: student.board || step4.board,
      primaryLanguage: student.primaryLanguage || step4.primaryLang,
      additionalLanguage: student.additionalLanguage || step4.addLang,
      preferredBatch: student.preferredBatch || student.batchPreference || step4.batch,
      learningMode: student.learningMode || step4.learningMode,
      invoiceType: step5.invoiceType,
      coupon: step5.coupon,
    });
    return normalized;
  }

  function getDashboardParts(data) {
    const dashboard = data.dashboard || {};
    const student = mergeLocalDrafts(dashboard.student || {});
    const enrollments = Array.isArray(student.enrollments) ? student.enrollments : [];
    const payments = Array.isArray(student.feePayments) ? student.feePayments : [];
    const documents = Array.isArray(student.documents) ? student.documents : [];
    const certificates = Array.isArray(student.certificates) ? student.certificates : [];
    const identityCards = Array.isArray(student.identityCards) ? student.identityCards : [];
    const paidTotal = Number(dashboard.totalFeePaid || payments
      .filter((payment) => String(payment.status || '').toLowerCase() === 'paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
    const feeDue = Number(dashboard.totalFeeDue || enrollments
      .reduce((sum, enrollment) => sum + Number(enrollment.course?.fee || 0), 0));
    const pendingFee = Number(dashboard.pendingFee !== undefined ? dashboard.pendingFee : Math.max(feeDue - paidTotal, 0));
    const primaryEnrollment = enrollments.find((item) => item.status === 'Active') || enrollments[0] || null;
    const primaryCourse = primaryEnrollment ? primaryEnrollment.course : null;

    const lms = Array.isArray(dashboard.lms) ? dashboard.lms : [];

    const registrationStatus = dashboard.registrationStatus || data.registrationStatus || (student.registrationStatus ? {
      status: student.registrationStatus,
      submittedAt: student.registrationSubmittedAt || null,
      reviewedAt: student.registrationReviewedAt || null,
      reviewNote: student.registrationReviewNote || null,
    } : null);

    return { student, enrollments, payments, documents, certificates, identityCards, paidTotal, feeDue, pendingFee, primaryEnrollment, primaryCourse, lms, registrationStatus };
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function renderStudentInfo(student, enrollment) {
    const items = [
      ['Full Name', student.fullName],
      ['Email', student.email],
      ['Mobile', student.phone],
      ['WhatsApp', student.whatsapp],
      ['Alternate Phone', student.alternatePhone],
      ['Country', student.country],
      ['State', student.state],
      ['City', student.city],
      ['Address', student.address],
      ['Street / Locality', student.street],
      ['Pincode', student.pincode],
      ['Qualification', student.qualification],
      ['Work Experience', student.workExperience],
      ['Father Name', student.fatherName],
      ['Mother Name', student.motherName],
      ['Date of Birth', student.dob],
      ['Gender', student.gender],
      ['Blood Group', student.bloodGroup],
      ['Marital Status', student.marital],
      ['Nationality', student.nationality],
      ['Identity Proof', [student.identityType, student.identityNumber].filter(Boolean).join(' - ')],
      ['Emergency Contact', [student.emergencyName, student.emergencyPhone, student.emergencyRelation].filter(Boolean).join(' / ')],
      ['Passing Year', student.passYear],
      ['Institute', student.institute],
      ['Board / University', student.board],
      ['Primary Language', student.primaryLanguage],
      ['Additional Language', student.additionalLanguage],
      ['Admission No.', enrollment && enrollment.admissionNo],
      ['Batch', enrollment && enrollment.batch],
      ['Learning Mode', enrollment && enrollment.learningMode],
      ['Invoice Type', student.invoiceType],
      ['Coupon / Referral', student.coupon],
    ];

    if (!qs('studentInfoGrid')) return;
    qs('studentInfoGrid').innerHTML = items.map(([label, value]) => `
      <div class="sd-info-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(safeText(value))}</strong></div>
    `).join('');

    const completed = items.filter(([, value]) => value).length;
    if (qs('profileCompletion')) qs('profileCompletion').textContent = Math.round((completed / items.length) * 100) + '% complete';
  }

  function registrationStatus(student, documents) {
    const requiredProfileFields = [
      student.fullName,
      student.email,
      student.phone,
      student.country,
      student.state,
      student.city,
      student.qualification,
      student.fatherName,
      student.motherName,
      student.dob,
      student.gender,
      student.identityNumber,
      student.emergencyName,
      student.emergencyPhone,
      student.pincode,
      student.street,
      student.institute,
      student.board,
    ];
    const completedProfileFields = requiredProfileFields.filter(Boolean).length;
    const profilePercent = Math.round((completedProfileFields / requiredProfileFields.length) * 100);
    const hasCoreProfile = completedProfileFields >= Math.ceil(requiredProfileFields.length * 0.8);
    const hasDocuments = Array.isArray(documents) && documents.length >= 3;
    return {
      isComplete: hasCoreProfile && hasDocuments,
      profilePercent,
      missingDocuments: !hasDocuments,
    };
  }

  function renderRegistrationNotice(student, documents, backendRegistrationStatus) {
    const notice = qs('registrationNotice');
    if (!notice) return;

    const inferredStatus = registrationStatus(student, documents);
    const status = backendRegistrationStatus && typeof backendRegistrationStatus === 'object'
      ? Object.assign({}, inferredStatus, backendRegistrationStatus)
      : inferredStatus;
    const normalizedStatus = String(status.status || '').toLowerCase();
    const registrationSubmitted = ['submitted', 'verified', 'rejected', 'correction_needed'].includes(normalizedStatus);
    notice.classList.remove('submitted', 'verified', 'rejected', 'correction-needed', 'incomplete');
    notice.classList.add(normalizedStatus === 'correction_needed' ? 'correction-needed' : (normalizedStatus || 'incomplete'));
    notice.hidden = normalizedStatus === 'verified' || (status.isComplete && !registrationSubmitted);
    if (notice.hidden) return;

    const appToken = localStorage.getItem('naisft_application_token');
    const link = qs('registrationNoticeLink');
    if (link) {
      link.onclick = null;
      link.href = appToken ? 'apply-online.html?token=' + encodeURIComponent(appToken) : 'apply-online.html';
      link.textContent = 'Complete Registration';
    }

    const heading = notice.querySelector('h2');
    const copy = notice.querySelector('p');
    const label = notice.querySelector('span');
    if (label) label.textContent = 'Registration Profile';

    if (normalizedStatus === 'correction_needed') {
      if (heading) heading.textContent = 'Registration correction needed';
      if (copy) copy.textContent = status.reviewNote || 'The center team requested changes. Please review your profile details and submit again.';
      if (link) {
        link.href = appToken ? 'apply-online.html?token=' + encodeURIComponent(appToken) : 'apply-online.html';
        link.textContent = 'Update Registration';
      }
      return;
    }
    if (normalizedStatus === 'rejected') {
      if (heading) heading.textContent = 'Registration needs attention';
      if (copy) copy.textContent = status.reviewNote || 'Your registration could not be approved yet. Please contact NAISFT support or submit corrected details.';
      if (link) link.textContent = 'Contact / Resubmit';
      return;
    }
    if (registrationSubmitted) {
      if (label) label.textContent = 'Under Review';
      if (heading) heading.textContent = 'Registration profile submitted';
      if (copy) copy.textContent = status.submittedAt
        ? 'Submitted on ' + formatDate(status.submittedAt) + '. Your profile and documents are under center review.'
        : 'Your profile and documents are under center review. Updates will appear in your dashboard once verification is completed.';
      if (link) {
        link.href = '#profileDetails';
        link.textContent = 'View Submitted Details';
        link.onclick = (event) => {
          event.preventDefault();
          switchView('dashboard', false);
          qs('profileDetails')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      }
      return;
    }

    if (heading) heading.textContent = status.profilePercent > 35
      ? 'Finish your NAISFT registration profile'
      : 'Complete your NAISFT registration profile';
    if (copy) copy.textContent = status.missingDocuments
      ? 'Add your personal details and upload required documents so the center team can verify your student record.'
      : 'Your documents are received. Finish the remaining profile details for center verification.';
  }

  function renderTimeline(student, enrollment, paidTotal, pendingFee, documents, certificates) {
    const steps = [
      ['Quick Apply / Account Created', true],
      ['Mobile Verified', Boolean(student.isVerified)],
      ['Course Selected', Boolean(enrollment)],
      ['Profile Details Added', Boolean(student.qualification && student.city)],
      ['Documents Uploaded', documents.length > 0],
      ['Fee Payment Started', paidTotal > 0],
      ['Fee Cleared', pendingFee === 0 && paidTotal > 0],
      ['Certificate Issued', certificates.length > 0],
    ];

    if (!qs('admissionTimeline')) return;
    qs('admissionTimeline').innerHTML = steps.map(([label, done]) => `
      <div class="sd-step ${done ? 'done' : ''}">
        <i class="fa-solid ${done ? 'fa-check' : 'fa-clock'}"></i>
        <span>${escapeHtml(label)}</span>
      </div>
    `).join('');
  }

  function renderDocuments(documents) {
    const required = ['Photo', 'Aadhaar / ID Proof', 'Qualification', 'Signature'];
    if (qs('docCount')) qs('docCount').textContent = documents.length + ' uploaded';
    if (!qs('documentList')) return;
    qs('documentList').innerHTML = required.map((label) => {
      const firstWord = label.split(' ')[0].toLowerCase();
      const match = documents.find((doc) => String(doc.docType || '').toLowerCase().includes(firstWord));
      const status = match ? safeText(match.status, 'Pending') : 'Pending';
      const statusClass = String(status).toLowerCase();
      const icon = statusClass === 'verified' ? 'fa-circle-check' : (statusClass === 'rejected' ? 'fa-circle-xmark' : 'fa-clock');
      return `
        <div class="sd-doc-row ${match ? 'done' : ''} ${escapeHtml(statusClass)}">
          <i class="fa-solid ${icon}"></i>
          <span>${escapeHtml(label)}${match && match.reviewNote ? `<small>${escapeHtml(match.reviewNote)}</small>` : ''}</span>
          <b>${match ? escapeHtml(status) : 'Pending'}</b>
        </div>
      `;
    }).join('');
  }

  function renderPayments(payments, paidTotal, pendingFee, feeDue) {
    if (qs('paymentCount')) qs('paymentCount').textContent = payments.length + ' records';
    if (!qs('paymentList')) return;

    const summary = `
      <div class="sd-payment-summary">
        <div><span>Total Fee</span><strong>${amount(feeDue)}</strong></div>
        <div><span>Paid</span><strong>${amount(paidTotal)}</strong></div>
        <div><span>Pending</span><strong>${amount(pendingFee)}</strong></div>
      </div>
    `;

    if (!payments.length) {
      qs('paymentList').innerHTML = summary + '<div class="sd-empty">No payment records yet. Enroll in a course or complete checkout to start your payment record.</div>';
      return;
    }

    qs('paymentList').innerHTML = summary + payments.map((payment) => {
      const status = safeText(payment.status, 'Pending');
      return `
        <div class="sd-payment-row">
          <div><strong>${escapeHtml(safeText(payment.receiptNo, 'Receipt Pending'))}</strong><span>${escapeHtml(safeText(payment.paymentMode, 'Online'))}</span></div>
          <b>${amount(payment.amount)}</b>
          <em class="${escapeHtml(status.toLowerCase())}">${escapeHtml(status)}</em>
        </div>
      `;
    }).join('');
  }

  function renderCertificates(certificates, lms, primaryCourse) {
    if (qs('certificateCount')) qs('certificateCount').textContent = certificates.length + ' issued';
    if (!qs('certificateBox')) return;
    const cert = certificates[0];
    if (cert) {
      const certificateToken = cert.verifyToken || '';
      const querySuffix = localApi ? '&api=' + encodeURIComponent(API) : '';
      const verifyLink = (isDevMode ? 'certificate-verify.html' : 'certificate-record.html') + '?token=' + encodeURIComponent(certificateToken) + querySuffix;
      const downloadLink = isDevMode
        ? 'output/pdf/sample-certificate.pdf?v=local-verified-1'
        : (certificateToken ? API + '/certificates/download/' + encodeURIComponent(certificateToken) + '?design=editable-svg-1' : '');
      const downloadAttribute = isDevMode ? ' download="NAISFT-Local-Test-Certificate.pdf"' : '';
      qs('certificateBox').innerHTML = `
        <i class="fa-solid fa-certificate"></i>
        <div>
          <strong>${escapeHtml(cert.course ? cert.course.name : 'Certificate Issued')}</strong>
          <p>Verify Token: ${escapeHtml(safeText(cert.verifyToken))}</p>
          ${downloadLink ? `<a href="${downloadLink}" class="certificate-pdf-download"${downloadAttribute}>Download Certificate PDF</a>` : ''}
          <a href="${verifyLink}" target="_blank" rel="noopener">Open Verify Link</a>
        </div>
      `;
      return;
    }

    const active = lms.find((item) => primaryCourse && Number(item.courseId) === Number(primaryCourse.id)) || lms[0] || null;
    const eligibility = active && active.certificateEligibility;
    if (!eligibility) {
      qs('certificateBox').innerHTML = `
        <i class="fa-solid fa-shield-halved"></i>
        <div>
          <strong>Certificate not issued yet</strong>
          <p>QR certificate will appear after course completion and admin approval.</p>
        </div>
      `;
      return;
    }

    const state = eligibility.status || (eligibility.eligible ? 'ready_to_issue' : 'in_progress');
    const stateConfig = {
      issued: {
        icon: 'fa-certificate',
        title: 'Certificate issued',
        copy: 'Your QR verified certificate is ready.',
        tone: 'issued',
      },
      ready_to_issue: {
        icon: 'fa-circle-check',
        title: 'Certificate ready for admin issue',
        copy: eligibility.message || 'Admin can issue your QR verified certificate.',
        tone: 'ready',
      },
      under_review: {
        icon: 'fa-clock',
        title: 'Certificate under center review',
        copy: eligibility.message || 'Your completion is waiting for final center approval.',
        tone: 'review',
      },
      pending_requirements: {
        icon: 'fa-list-check',
        title: 'Certificate requirements pending',
        copy: eligibility.message || 'Finish the remaining requirements to become certificate-ready.',
        tone: 'pending',
      },
      in_progress: {
        icon: 'fa-person-chalkboard',
        title: 'Certificate in progress',
        copy: eligibility.message || 'Complete the remaining steps to become certificate-ready.',
        tone: 'progress',
      },
    };
    const config = stateConfig[state] || stateConfig.in_progress;

    qs('certificateBox').innerHTML = `
      <i class="fa-solid ${config.icon}"></i>
      <div>
        <strong>${escapeHtml(config.title)}</strong>
        <p>${escapeHtml(config.copy)}</p>
        <em class="sd-certificate-state ${escapeHtml(config.tone)}">${escapeHtml(state.replace(/_/g, ' '))}</em>
        <div class="sd-certificate-steps">
          ${(eligibility.checklist || []).map((step) => `<span class="${step.done ? 'done' : 'pending'}"><i class="fa-solid ${step.done ? 'fa-check' : 'fa-clock'}"></i> ${escapeHtml(step.label)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderIdentityCard(cards, student, course) {
    const box = qs('identityCardBox');
    if (!box) return;
    const card = cards.find((item) => item.status === 'ACTIVE') || cards[0];
    if (!card) {
      qs('identityCardStatus').textContent = 'Not issued';
      box.innerHTML = '<i class="fa-solid fa-id-card"></i><div><strong>ID card not issued yet</strong><p>Your QR-verifiable identity card will appear after registration approval.</p></div>';
      return;
    }
    const expired = card.expiresAt && new Date(card.expiresAt).getTime() < Date.now();
    const status = expired && card.status === 'ACTIVE' ? 'EXPIRED' : card.status;
    const downloadLink = API + '/identity-cards/download/' + encodeURIComponent(card.verifyToken || '');
    const qrLink = API + '/identity-cards/qr/' + encodeURIComponent(card.verifyToken || '');
    const apiOrigin = API.replace(/\/api$/, '');
    const rawPhoto = student?.photoUrl || 'Assets/logo Institute.png';
    const photoLink = rawPhoto.startsWith('/uploads/') ? apiOrigin + rawPhoto : rawPhoto;
    const issueYear = card.issuedAt ? new Date(card.issuedAt).getFullYear() : new Date().getFullYear();
    const expiryYear = card.expiresAt ? new Date(card.expiresAt).getFullYear() : issueYear + 1;
    const session = `${issueYear}–${String(expiryYear).slice(-2)}`;
    const emergencyContact = [student?.emergencyPhone, student?.emergencyRelation ? `(${student.emergencyRelation})` : ''].filter(Boolean).join(' ');
    qs('identityCardStatus').textContent = status;
    box.className = 'sd-identity-card-display';
    box.innerHTML = `<div class="sd-id-card-grid sd-id-portrait-grid"><section class="sd-id-card sd-id-portrait sd-id-front" aria-label="Student identity card front"><div class="sd-id-curve"></div><img class="sd-id-crest" src="Assets/logo Institute.png" alt="NAISFT INDIA emblem"><div class="sd-id-academy"><strong>NATIONAL ACADEMY OF</strong><b>INDUSTRIAL SAFETY &amp;<br>FIRE TECHNOLOGY</b><small>Under the Aegis of</small><span>ASHRAFI EDUCATIONAL &amp; WELFARE FOUNDATION</span></div><div class="sd-id-title">STUDENT IDENTITY CARD</div><div class="sd-id-profile"><img class="sd-id-photo" src="${escapeHtml(photoLink)}" alt="${escapeHtml(student?.fullName || 'Student')} photograph"><div class="sd-id-details"><p><span>Name:</span><b>${escapeHtml(student?.fullName || 'Student')}</b></p><p><span>Student ID:</span><b>${escapeHtml(student?.enrollmentNo || card.cardNumber || '-')}</b></p><p><span>Course:</span><b>${escapeHtml(course?.name || '-')}</b></p><p><span>Session:</span><b>${escapeHtml(session)}</b></p><p><span>DOB:</span><b>${escapeHtml(student?.dob || '-')}</b></p><p><span>Blood Group:</span><b>${escapeHtml(student?.bloodGroup || '-')}</b></p></div></div><div class="sd-id-front-bottom"><div class="sd-id-qr"><img src="${escapeHtml(qrLink)}" alt="Student ID verification QR code"><small>Scan to verify</small></div><div class="sd-id-signature"><i>Authorised</i><span></span><strong>Authorized Signatory</strong></div></div><div class="sd-id-footer-wave"></div></section><section class="sd-id-card sd-id-portrait sd-id-back" aria-label="Student identity card back"><div class="sd-id-curve"></div><img class="sd-id-crest back" src="Assets/logo Institute.png" alt="NAISFT INDIA emblem"><div class="sd-id-back-academy"><strong>NATIONAL ACADEMY OF</strong><b>INDUSTRIAL SAFETY &amp;<br>FIRE TECHNOLOGY</b><small>Under the Aegis of<br>ASHRAFI EDUCATIONAL &amp; WELFARE FOUNDATION</small></div><div class="sd-id-contact-list"><p><i class="fa-solid fa-location-dot"></i><span><b>Address:</b>NAISFT INDIA Campus, Knowledge &amp; Safety Park, Industrial Area, Nagpur, Maharashtra – 440026, India.</span></p><p><i class="fa-solid fa-phone"></i><span><b>Phone:</b>+91 98356 27522</span></p><p><i class="fa-solid fa-user"></i><span><b>Emergency Contact:</b>${escapeHtml(emergencyContact || '-')}</span></p><p><i class="fa-solid fa-calendar-days"></i><span><b>Valid Upto:</b>${escapeHtml(formatDate(card.expiresAt))}</span></p></div><div class="sd-id-property"><i class="fa-solid fa-shield-halved"></i><span>This card is the property of NAISFT INDIA and must be produced on request.</span></div><div class="sd-id-office"><div><strong>INSTITUTE OFFICE</strong><p><i class="fa-solid fa-location-dot"></i> NAISFT INDIA Campus, Knowledge &amp; Safety Park, Industrial Area, Nagpur, Maharashtra – 440026, India.</p><p><i class="fa-solid fa-phone"></i> +91 98356 27522</p><p><i class="fa-solid fa-envelope"></i> info@naisftindia.com · www.naisftindia.com</p></div><div class="sd-id-qr"><img src="${escapeHtml(qrLink)}" alt="Student ID verification QR code"><small>Scan to verify</small></div></div><div class="sd-id-holder-sign"><span></span>Card Holder's Signature</div></section></div><div class="sd-id-actions"><a href="${downloadLink}" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> Download ID Card (PDF)</a><span><i class="fa-solid fa-qrcode"></i> Scan either QR code to open verification</span></div>`;
  }

  function renderProfile(student, course) {
    if (qs('profileName')) qs('profileName').textContent = safeText(student.fullName, 'Student');
    if (qs('profileEmail')) qs('profileEmail').textContent = safeText(student.email);
    if (qs('profilePhone')) qs('profilePhone').textContent = safeText(student.phone);
    if (qs('profileLocation')) qs('profileLocation').textContent = [student.city, student.state].filter(Boolean).join(', ') || '-';
    if (qs('profileQualification')) qs('profileQualification').textContent = safeText(student.qualification);
    if (qs('profileSub')) qs('profileSub').textContent = course ? 'Continue your ' + course.name + ' journey.' : 'Continue your journey and achieve your target.';
    if (student.photoUrl && qs('profilePhoto')) qs('profilePhoto').src = student.photoUrl;
  }

  function renderEnrolledCourses(enrollments) {
    if (!qs('enrollmentList')) return;
    if (!enrollments.length) {
      qs('enrollmentList').innerHTML = '<div class="sd-empty">No enrolled courses yet. <a href="courses.html">Explore courses</a></div>';
      return;
    }

    qs('enrollmentList').innerHTML = enrollments.map((enrollment) => {
      const course = enrollment.course || {};
      const status = String(enrollment.status || 'Pending');
      const canOpen = ['Active', 'Completed'].includes(status);
      const tagName = canOpen ? 'a' : 'div';
      const href = canOpen ? ` href="student-course-player.html?courseId=${encodeURIComponent(course.id || '')}"` : '';
      const lockText = status === 'Pending' ? 'Access opens after payment/admin activation' : 'Course access is currently unavailable';
      return `
        <${tagName} class="sd-enrollment-row ${canOpen ? '' : 'locked'}"${href}>
          <div>
            <strong>${escapeHtml(safeText(course.name, 'Course'))}</strong>
            <span>${escapeHtml(canOpen ? ([course.duration, course.category && course.category.name].filter(Boolean).join(' / ') || 'Course') : lockText)}</span>
          </div>
          <b>${amount(course.fee)}</b>
          <em class="${escapeHtml(status.toLowerCase())}">${canOpen ? '<i class="fa-solid fa-play"></i> ' : '<i class="fa-solid fa-lock"></i> '}${escapeHtml(safeText(status, 'Pending'))}</em>
        </${tagName}>
      `;
    }).join('');
  }

  function renderLearningPanel(lms, primaryCourse) {
    const active = lms.find((item) => primaryCourse && Number(item.courseId) === Number(primaryCourse.id)) || lms[0] || null;
    if (qs('learningStatus')) qs('learningStatus').textContent = active ? active.progressPercent + '%' : '0%';
    if (!qs('learningSummary')) return;

    if (!active) {
      qs('learningSummary').innerHTML = `
        <div class="sd-empty">Learning access will appear once your course is active and content is published.</div>
      `;
      return;
    }

    const nextLessonUrl = `student-course-player.html?courseId=${encodeURIComponent(active.courseId)}${active.nextLesson ? '&lessonId=' + encodeURIComponent(active.nextLesson.id) : ''}`;
    qs('learningSummary').innerHTML = `
      <div class="sd-learning-course">
        <div>
          <span>${escapeHtml(active.completedLessons || 0)} of ${escapeHtml(active.totalLessons || 0)} lessons completed</span>
          <strong>${escapeHtml(active.courseName || 'Course')}</strong>
        </div>
        <a href="${nextLessonUrl}">${active.progressPercent >= 100 ? 'Review Course' : 'Continue'}</a>
      </div>
      <div class="sd-learning-bar"><i style="width:${Math.max(0, Math.min(100, Number(active.progressPercent || 0)))}%"></i></div>
      <div class="sd-next-lesson">
        <i class="fa-solid ${active.progressPercent >= 100 ? 'fa-circle-check' : 'fa-play'}"></i>
        <div><span>${active.progressPercent >= 100 ? 'Course completed' : 'Next lesson'}</span><strong>${escapeHtml(active.nextLesson ? active.nextLesson.title : 'All available lessons completed')}</strong></div>
      </div>
    `;
  }

  function assignmentTone(submission) {
    if (!submission) return 'pending';
    return String(submission.status || 'Submitted').toLowerCase();
  }

  function renderLmsTasks(lms) {
    const tasks = [];
    lms.forEach((course) => {
      (course.upcomingLiveClasses || []).slice(0, 2).forEach((item) => {
        tasks.push({
          type: 'Live',
          title: item.title,
          sub: [item.platform, item.teacherName].filter(Boolean).join(' / '),
          date: item.startsAt,
          href: item.joinUrl || `student-course-player.html?courseId=${encodeURIComponent(course.courseId)}`,
          icon: 'fa-video',
          tone: 'live',
        });
      });
      (course.assignments || []).forEach((item) => {
        const submitted = Boolean(item.submission);
        tasks.push({
          type: submitted ? item.submission.status || 'Submitted' : 'Assignment',
          title: item.title,
          sub: submitted
            ? (item.submission.marks !== null && item.submission.marks !== undefined ? `Marks: ${item.submission.marks}/${item.maxMarks || 100}` : 'Submitted for review')
            : 'Submission pending',
          date: item.dueAt,
          href: `student-course-player.html?courseId=${encodeURIComponent(course.courseId)}#assignments`,
          icon: submitted ? 'fa-clipboard-check' : 'fa-pen-to-square',
          tone: assignmentTone(item.submission),
        });
      });
    });

    const pendingAssignments = tasks.filter((task) => task.type === 'Assignment').length;
    if (qs('taskCount')) qs('taskCount').textContent = pendingAssignments + ' pending';
    if (!qs('lmsTaskList')) return;
    qs('lmsTaskList').innerHTML = tasks.slice(0, 5).map((task) => `
      <a class="sd-task-row ${escapeHtml(task.tone)}" href="${escapeHtml(task.href)}" ${task.href && task.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <i class="fa-solid ${escapeHtml(task.icon)}"></i>
        <div>
          <strong>${escapeHtml(task.title)}</strong>
          <span>${escapeHtml(task.sub || task.type)}${task.date ? ' / ' + escapeHtml(formatDate(task.date)) : ''}</span>
        </div>
        <em>${escapeHtml(task.type)}</em>
      </a>
    `).join('') || '<div class="sd-empty">No live classes or assignments are pending right now.</div>';
  }

  function renderCourseOverview(enrollments, primaryEnrollment, primaryCourse) {
    if (primaryCourse) {
      if (qs('courseName')) qs('courseName').textContent = primaryCourse.name;
      if (qs('courseDuration')) qs('courseDuration').textContent = safeText(primaryCourse.duration);
      if (qs('courseFee')) qs('courseFee').textContent = amount(primaryCourse.fee);
      if (qs('courseCategory')) qs('courseCategory').textContent = primaryCourse.category ? primaryCourse.category.name : 'Course';
      if (qs('courseDescription')) qs('courseDescription').textContent = safeText(primaryCourse.description, 'Course details are connected to your admission record.');
      if (qs('courseStatus')) qs('courseStatus').textContent = safeText(primaryEnrollment.status, 'Pending');
    } else {
      if (qs('courseName')) qs('courseName').textContent = 'No course selected yet';
      if (qs('courseDescription')) qs('courseDescription').textContent = 'Choose a course to start enrollment and payment tracking.';
      if (qs('courseStatus')) qs('courseStatus').textContent = 'Not enrolled';
    }
    renderEnrolledCourses(enrollments);
  }

  function renderDashboard(data) {
    const parts = getDashboardParts(data);
    const student = parts.student;

    if (qs('dashWelcome')) qs('dashWelcome').textContent = 'Welcome, ' + safeText(student.fullName, 'Student');
    if (qs('statEnrollment')) qs('statEnrollment').textContent = safeText(student.enrollmentNo, 'Pending');
    if (qs('statVerified')) qs('statVerified').textContent = student.isVerified ? 'Verified' : 'Pending';
    if (qs('statCourse')) qs('statCourse').textContent = parts.enrollments.length ? String(parts.enrollments.length) + ' course' + (parts.enrollments.length > 1 ? 's' : '') : 'Not selected';
    if (qs('statPaid')) qs('statPaid').textContent = amount(parts.paidTotal);

    renderProfile(student, parts.primaryCourse);
    renderRegistrationNotice(student, parts.documents, parts.registrationStatus);
    renderCourseOverview(parts.enrollments, parts.primaryEnrollment, parts.primaryCourse);
    renderLearningPanel(parts.lms, parts.primaryCourse);
    renderLmsTasks(parts.lms);
    renderStudentInfo(student, parts.primaryEnrollment);
    renderTimeline(student, parts.primaryEnrollment, parts.paidTotal, parts.pendingFee, parts.documents, parts.certificates);
    renderDocuments(parts.documents);
    renderPayments(parts.payments, parts.paidTotal, parts.pendingFee, parts.feeDue);
    renderCertificates(parts.certificates, parts.lms, parts.primaryCourse);
    renderIdentityCard(parts.identityCards, parts.student, parts.primaryCourse);

    if (params.get('payment') === 'success') {
      showAlert('Payment completed successfully. Your dashboard has been updated.', 'success');
    }

    setLoading(false);
  }

  function renderCourseCards() {
    if (!qs('dashboardCourseList')) return;
    const search = (qs('courseSearch')?.value || '').toLowerCase();
    const filtered = cachedCourses.filter((course) => {
      const category = course.category ? course.category.name : '';
      const matchesSearch = [course.name, category, course.eligibility].join(' ').toLowerCase().includes(search);
      const matchesFilter = activeCourseFilter === 'all' || category.toLowerCase().includes(activeCourseFilter.toLowerCase()) || course.name.toLowerCase().includes(activeCourseFilter.toLowerCase());
      return matchesSearch && matchesFilter;
    });

    qs('dashboardCourseList').innerHTML = filtered.map((course, index) => `
      <article class="sd-course-card">
        <img src="${window.NAISFT_COURSE_IMAGES?.get(course) || courseImages[index % courseImages.length]}" alt="${escapeHtml(course.name)}">
        <div class="sd-course-card-body">
          <small>${escapeHtml(safeText(course.category && course.category.name, 'Course'))}</small>
          <h3>${escapeHtml(course.name)}</h3>
          <div class="sd-course-price-row"><em>${escapeHtml(safeText(course.duration))}</em><span>${amount(course.fee)}</span></div>
          <a href="course-detail.html#id=${encodeURIComponent(course.id)}">View Details</a>
        </div>
      </article>
    `).join('') || '<div class="sd-empty">No courses found.</div>';
  }

  async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    if (res.status === 401) {
      logout();
      return null;
    }
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }

  async function loadDashboard() {
    setLoading(true);
    if (isDevMode) { renderDashboard(getDevPayload()); return; }

    const controller = new AbortController();
    const tidTimeout = setTimeout(() => controller.abort(), 60000);
    const tidWarmup = setTimeout(() => {
      const el = qs('dashLoading');
      if (el && !el.querySelector('.dash-warmup')) {
        const p = document.createElement('p');
        p.className = 'dash-warmup';
        p.style.cssText = 'margin-top:14px;color:#66778a;font-size:13px;text-align:center;';
        p.textContent = 'Server is waking up — this can take up to 30 seconds on first use. Please wait…';
        el.appendChild(p);
      }
    }, 6000);

    try {
      const res = await fetch(API + '/student/dashboard', {
        headers: { Authorization: 'Bearer ' + token },
        signal: controller.signal,
      });
      clearTimeout(tidTimeout);
      clearTimeout(tidWarmup);
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Request failed.');
      renderDashboard(data);
    } catch (err) {
      clearTimeout(tidTimeout);
      clearTimeout(tidWarmup);
      setLoading(false);
      const msg = err.name === 'AbortError'
        ? 'Dashboard is taking too long to load. Please refresh the page to try again.'
        : (err.message === 'Failed to fetch'
            ? 'Could not connect to the server. If this is your first visit today, the server may be starting up — please wait a moment and refresh.'
            : (err.message || 'Could not load dashboard. Please refresh the page.'));
      showAlert(msg);
    }
  }

  async function loadCourses() {
    if (isDevMode) {
      cachedCourses = fallbackCourses();
      renderCourseCards();
      return;
    }

    try {
      const data = await fetchJson(API + '/courses');
      cachedCourses = data.courses || data.data || [];
      if (!cachedCourses.length) cachedCourses = fallbackCourses();
    } catch (err) {
      cachedCourses = fallbackCourses();
    }
    renderCourseCards();
  }

  async function submitSupportRequest(event) {
    event.preventDefault();
    const subject = qs('supportSubject')?.value.trim();
    const message = qs('supportMessage')?.value.trim();
    if (!subject || !message) {
      showAlert('Select issue type and write your message.');
      return;
    }

    const button = event.currentTarget.querySelector('button');
    const originalText = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
    }

    try {
      if (isDevMode) {
        const student = readJsonStore('naisft_student');
        const requests = readSupportStore();
        requests.unshift({
          id: Date.now(),
          name: student.fullName || 'Demo Student',
          email: student.email || 'demo.student.naisft.20260629@example.com',
          phone: student.phone || '9876500629',
          subject: '[Student Support] ' + subject,
          message,
          createdAt: new Date().toISOString(),
        });
        writeSupportStore(requests.slice(0, 25));
      } else {
        await fetchJson(API + '/student/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ subject, message }),
        });
      }

      event.currentTarget.reset();
      showAlert('Support request sent. Our team will contact you shortly.', 'success');
    } catch (err) {
      showAlert(err.message || 'Could not submit support request.');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    }
  }

  const dashboardPanelRoutes = ['documents', 'payments', 'certificate', 'identity-card'];

  function routeFromLocation() {
    const match = window.location.pathname.match(/student-dashboard\.html\/([^/]+)/);
    return match ? match[1] : 'dashboard';
  }

  function switchView(view, updateUrl) {
    const route = dashboardPanelRoutes.includes(view) || ['dashboard', 'courses'].includes(view) ? view : 'dashboard';
    const dashboard = qs('dashboardView');
    const courses = qs('coursesView');
    dashboard?.classList.toggle('active', route !== 'courses');
    courses?.classList.toggle('active', route === 'courses');
    document.body.dataset.dashboardRoute = route;
    document.querySelectorAll('.sd-sidebar [data-dashboard-route]').forEach((item) => item.classList.toggle('active', item.dataset.dashboardRoute === route));
    document.querySelectorAll('#dashboardView .sd-card-grid > .sd-panel').forEach((panel) => {
      const panelRoute = panel.id === 'identityCard' ? 'identity-card' : panel.id;
      panel.hidden = dashboardPanelRoutes.includes(route) && panelRoute !== route;
    });
    if (updateUrl) window.history.pushState({ dashboardRoute: route }, '', `/student-dashboard.html/${route}`);
  }

  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', logout);
  });

  document.querySelectorAll('.sd-sidebar [data-dashboard-route]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      switchView(link.dataset.dashboardRoute, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  window.addEventListener('popstate', () => switchView(routeFromLocation(), false));

  document.querySelectorAll('[data-course-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCourseFilter = btn.dataset.courseFilter;
      document.querySelectorAll('[data-course-filter]').forEach((item) => item.classList.toggle('active', item === btn));
      renderCourseCards();
      switchView('courses');
    });
  });

  qs('courseSearch')?.addEventListener('input', () => {
    renderCourseCards();
    if ((qs('courseSearch').value || '').trim()) switchView('courses');
  });

  qs('studentSupportForm')?.addEventListener('submit', submitSupportRequest);

  switchView(routeFromLocation(), false);
  loadDashboard();
  loadCourses();
})();
