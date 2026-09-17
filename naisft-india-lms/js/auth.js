/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAISFT INDIA â€” Student Registration JS
   Flow: Registration Form â†’ OTP Verify â†’ Success
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const API = ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : `${location.origin}/api`;

/* â”€â”€ App State â”€â”€ */
const state = {
  selectedCategoryId: null,
  selectedCategoryName: '',
  selectedCourse: null,
  studentToken: null,
  studentPhone: '',
  studentEmail: '',
  studentName: '',
  otpTimer: null,
  eotpTimer: null,
  mobileVerified: false,
  emailVerified: false,
  currentStudent: null,
  currentRegistrationStatus: 'incomplete',
};

/* â”€â”€ Cities by State â”€â”€ */
const citiesByState = {
  'Bihar': ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Ara','Bihar Sharif','Begusarai','Katihar','Munger','Chhapra','Samastipur','Madhubani','Sitamarhi','Bettiah','Motihari','Hajipur','Jehanabad','Aurangabad','Other'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Agra','Varanasi','Allahabad','Meerut','Bareilly','Aligarh','Ghaziabad','Noida','Moradabad','Saharanpur','Gorakhpur','Mathura','Jhansi','Faizabad','Mirzapur','Other'],
  'Jharkhand': ['Ranchi','Dhanbad','Jamshedpur','Bokaro','Deoghar','Phusro','Hazaribagh','Giridih','Ramgarh','Medininagar','Other'],
  'West Bengal': ['Kolkata','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Baharampur','Habra','Kharagpur','Shantipur','Other'],
  'Delhi': ['New Delhi','Central Delhi','North Delhi','South Delhi','East Delhi','West Delhi','Dwarka','Rohini','Janakpuri','Other'],
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Thane','Kolhapur','Amravati','Nanded','Other'],
  'Rajasthan': ['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Sikar','Other'],
  'Madhya Pradesh': ['Bhopal','Indore','Gwalior','Jabalpur','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa','Other'],
  'Karnataka': ['Bangalore','Mysore','Hubli','Mangalore','Belgaum','Gulbarga','Davangere','Bellary','Bijapur','Other'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Other'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela','Brahmapur','Sambalpur','Puri','Balasore','Bhadrak','Other'],
  'Haryana': ['Faridabad','Gurgaon','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Other'],
  'Punjab': ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Pathankot','Hoshiarpur','Other'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Khammam','Karimnagar','Ramagundam','Secunderabad','Other'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Vellore','Erode','Other'],
  'Kerala': ['Thiruvananthapuram','Kochi','Kozhikode','Kollam','Thrissur','Palakkad','Malappuram','Kannur','Other'],
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Rajahmundry','Kakinada','Other'],
  'Uttarakhand': ['Dehradun','Haridwar','Roorkee','Haldwani','Rudrapur','Kashipur','Rishikesh','Other'],
  'Chhattisgarh': ['Raipur','Bhilai','Korba','Bilaspur','Durg','Rajnandgaon','Jagdalpur','Other'],
  'Assam': ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Other'],
  'Himachal Pradesh': ['Shimla','Mandi','Solan','Dharamsala','Kullu','Bilaspur','Hamirpur','Other'],
  'Goa': ['Panaji','Vasco da Gama','Margao','Mapusa','Ponda','Other'],
  'Other': ['Other'],
};

const catIcons = {
  'Diploma Programs':                    'ðŸŽ“',
  'Advanced Diploma Programs':           'ðŸ…',
  'Corporate Safety Skill Development':  'ðŸ—ï¸',
};

/* â”€â”€ Pre-select coordination flags â”€â”€ */
window._categoriesLoaded = false;
window._tokenData        = null;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INIT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.addEventListener('DOMContentLoaded', () => {
  // Ping health endpoint so Render wakes up before the user reaches the course section
  fetch(`${API}/health`).catch(() => {});
  loadCategories();
  wireWhatsAppCheckbox();
  initExistingStudentRegistration();
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PANEL NAVIGATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function showPanel(panelId) {
  document.querySelectorAll('.reg-step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (panelId === 'panel-otp') {
    setStepperActive(2);
    setSidebarMode('otp');
  } else if (panelId === 'panel-docs') {
    setStepperActive(3);
    setSidebarMode('docs');
    populateStep4Fields();
    populatePassingYears();
    updateProfileCompletion();
  } else if (panelId === 'panel-confirmed') {
    setStepperActive(4);
    setSidebarMode('confirmed');
    populateStep6Fields();
  } else if (panelId === 'panel-success') {
    setStepperActive(2);
    setSidebarMode('otp');
  } else {
    setStepperActive(1);
    setSidebarMode('register');
  }
}

function setStepperActive(activeStep) {
  for (let i = 1; i <= 4; i++) {
    const item = document.getElementById(`si-${i}`);
    const line = document.getElementById(`sl-${i}`);
    if (!item) continue;
    item.classList.remove('done', 'active');
    const numEl = item.querySelector('.rs-num');
    if (i < activeStep) {
      item.classList.add('done');
      if (numEl) numEl.innerHTML = '<i class="fas fa-check"></i>';
    } else if (i === activeStep) {
      item.classList.add('active');
      if (numEl) numEl.textContent = i;
    } else {
      if (numEl) numEl.textContent = i;
    }
    if (line) line.classList.toggle('done', i < activeStep);
  }
}

/* mode: 'register' | 'otp' | 'docs' | 'confirmed' - 4-step registration flow */
function setSidebarMode(mode) {
  const isOtp       = mode === 'otp';
  const isDocs      = mode === 'docs';
  const isConfirmed = mode === 'confirmed';

  // â”€â”€ Left sidebar panels â”€â”€
  show('lsb-content-step2', mode === 'register');
  show('lsb-content-step3', isOtp);
  show('lsb-content-step4', isDocs);
  show('lsb-content-step5', false);
  show('lsb-content-step6', isConfirmed);

  // â”€â”€ Center title / subtitle â”€â”€
  const titles = {
    register:  ['STEP 1  STUDENT REGISTRATION',            'Create Your Account in Just a Few Simple Steps'],
    otp:       ['STEP 2  OTP VERIFICATION',                'Verify Your Mobile & Email to Secure Your Account'],
    docs:      ['STEP 3  PROFILE & DOCUMENT VERIFICATION', 'Complete Your Student Profile & Upload Required Documents'],
    confirmed: ['STEP 4  REGISTRATION CONFIRMED', 'Your NAISFT registration profile has been submitted'],
  };
  const [t, s] = titles[mode] || titles.register;
  const titleEl = document.querySelector('.reg-page-title');
  const subEl   = document.querySelector('.reg-page-sub');
  if (titleEl) titleEl.textContent = t;
  if (subEl)   subEl.textContent   = s;

  // â”€â”€ Right sidebar extra summary rows â”€â”€
  ['sb-row-name','sb-row-mobile','sb-row-email','sb-row-qual','sb-row-loc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (isOtp || isDocs || isConfirmed) ? 'flex' : 'none';
  });

  // â”€â”€ Right sidebar boxes â”€â”€
  show('rsb-verify-box',         isOtp);
  show('rsb-why-box',            mode === 'register');
  show('rsb-doc-status-box',     isDocs);
  show('rsb-profile-box',        isDocs);
  show('rsb-secure-box',         isDocs);
  show('rsb-conf-notes-box',     isConfirmed);
  show('rsb-community-box',      isConfirmed);
  show('rsb-conf-help-box',      isConfirmed);
}

function show(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? 'block' : 'none';
}

/* â”€â”€ DEV ONLY: click stepper numbers to jump panels â”€â”€ */
function devStepJump(n) {
  const map = { 1: 'panel-register', 2: 'panel-otp', 3: 'panel-docs', 4: 'panel-confirmed' };
  showPanel(map[n] || 'panel-register');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   POPULATE OTP PANEL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function populateOtpPanel(phone, email, studentData) {
  // Mask phone: show first 2 + last 4 digits
  const masked = phone.replace(/^(\d{2})\d{4}(\d{4})$/, '$1XXXX$2');

  // Mobile display
  const mobileDisplay = document.getElementById('mobileDisplay');
  if (mobileDisplay) mobileDisplay.innerHTML = `<i class="fas fa-mobile-alt"></i> +91 ${masked}`;

  // Show "OTP Sent" badge
  const sentBadge = document.getElementById('mobileSentBadge');
  if (sentBadge) sentBadge.style.display = 'inline-flex';

  // Email display
  const emailText = document.getElementById('emailDisplayText');
  if (emailText) emailText.textContent = email || '-';

  // Reset verification badges to pending state
  const vbMobile = document.getElementById('vb-mobile');
  if (vbMobile) { vbMobile.className = 'rsb-verify-badge amber'; vbMobile.innerHTML = '<i class="fas fa-clock"></i> Pending'; }
  const vbEmail = document.getElementById('vb-email');
  if (vbEmail) { vbEmail.className = 'rsb-verify-badge green'; vbEmail.innerHTML = '<i class="fas fa-check"></i> Verified'; }
  const vbNote = document.getElementById('vb-status-note');
  if (vbNote) vbNote.textContent = 'Enter the OTP sent to your mobile number';

  // Reset continue button and verified messages
  const continueBtn = document.getElementById('continueToDocsBtn');
  if (continueBtn) continueBtn.style.display = 'none';
  const continueNote = document.getElementById('otpContinueNote');
  if (continueNote) continueNote.style.display = 'none';
  const mobileVerifiedMsg = document.getElementById('mobileVerifiedMsg');
  if (mobileVerifiedMsg) mobileVerifiedMsg.style.display = 'none';
  // Clear any leftover OTP boxes
  ['otp1','otp2','otp3','otp4','otp5','otp6'].forEach(id => {
    const b = document.getElementById(id);
    if (b) { b.value = ''; b.classList.remove('verified'); b.style.borderColor = ''; }
  });

  // Populate extended sidebar
  setText('sb-name', studentData?.fullName || state.studentName || '-');
  setText('sb-mobile', `+91 ${masked}`);
  setText('sb-email', email || '-');
  setText('sb-qualification', document.getElementById('qualification')?.value || '-');

  const city = document.getElementById('city')?.value || '';
  const stateVal = document.getElementById('state')?.value || '';
  setText('sb-location', city && stateVal ? `${city}, ${stateVal}` : stateVal || city || '-');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COURSE CATEGORY & COURSE LOADING
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
async function loadCategories() {
  const sel = document.getElementById('courseCategory');
  if (!sel) return;

  sel.innerHTML = '<option value="">Loading categoriesâ€¦</option>';
  sel.disabled = true;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(`${API}/courses/categories`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (!data.success) {
      _categoriesError(sel, 'Failed to load â€” click to retry');
      return;
    }
    sel.innerHTML = '<option value="">Select Course Category</option>';
    data.categories.forEach(cat => {
      const icon = catIcons[cat.name] || 'ðŸ“š';
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.dataset.name = cat.name;
      opt.textContent = `${icon} ${cat.name} (${cat._count.courses} courses)`;
      sel.appendChild(opt);
    });
    sel.disabled = false;
    window._categoriesLoaded = true;
    tryPreSelect();
  } catch (e) {
    clearTimeout(timer);
    _categoriesError(sel, e.name === 'AbortError'
      ? 'Server is starting upâ€¦ click to retry'
      : 'Connection error â€” click to retry');
  }
}

function _categoriesError(sel, msg) {
  sel.innerHTML = `<option value="">${msg}</option>`;
  sel.disabled = false;
  sel.addEventListener('mousedown', function retry(ev) {
    sel.removeEventListener('mousedown', retry);
    ev.preventDefault();
    loadCategories();
  }, { once: true });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOKEN PRE-FILL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function tryPreSelect() {
  if (!window._categoriesLoaded || !window._tokenData) return;
  preSelectFromToken();
}

async function initExistingStudentRegistration() {
  const token = localStorage.getItem('naisft_token');
  if (!token) return;

  try {
    const res = await fetch(`${API}/student/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.student) return;

    state.studentToken = token;
    state.currentStudent = data.student;
    state.currentRegistrationStatus = data.registrationStatus?.status || data.student.registrationStatus || 'incomplete';
    state.studentName = data.student.fullName || '';
    state.studentPhone = String(data.student.phone || '').replace(/^\+91\s?/, '');
    state.studentEmail = data.student.email || '';
    state.mobileVerified = true;
    state.emailVerified = true;

    localStorage.setItem('naisft_student', JSON.stringify(data.student));
    localStorage.setItem('naisft_registration_status', JSON.stringify(data.registrationStatus || {
      status: state.currentRegistrationStatus,
    }));

    prefillExistingStudent(data.student, data.registrationStatus);

    const params = new URLSearchParams(window.location.search);
    const shouldOpenProfile = params.get('source') === 'dashboard'
      || params.get('edit') === 'registration'
      || ['incomplete', 'correction_needed', 'rejected', 'submitted'].includes(state.currentRegistrationStatus);

    if (shouldOpenProfile) {
      showPanel('panel-docs');
    }
  } catch (err) {
    console.warn('Could not load existing student profile:', err);
  }
}

function prefillExistingStudent(student, registrationStatus) {
  if (!student) return;
  const phone = String(student.phone || '').replace(/^\+91\s?/, '');
  const whatsapp = String(student.whatsapp || '').replace(/^\+91\s?/, '');

  setVal('fullName', student.fullName);
  setVal('email', student.email);
  setVal('phone', phone);
  setVal('whatsapp', whatsapp && whatsapp !== phone ? whatsapp : '');
  setVal('altPhone', student.alternatePhone);
  setVal('country', student.country);
  setVal('state', student.state);
  if (student.state) onStateChange();
  setVal('city', student.city);
  setVal('qualification', student.qualification);
  setVal('workExperience', student.workExperience);

  setVal('s4-fullName', student.fullName);
  setVal('s4-mobile', phone ? `+91 ${phone}` : '');
  setVal('s4-email', student.email);
  setVal('s4-whatsapp', whatsapp ? `+91 ${whatsapp}` : (phone ? `+91 ${phone}` : ''));
  setVal('s4-country', student.country);
  setVal('s4-state', student.state);
  setVal('s4-city', student.city);
  setVal('s4-qualification', student.qualification);
  setVal('s4-experience', student.workExperience);
  setVal('s4-fatherName', student.fatherName);
  setVal('s4-motherName', student.motherName);
  setVal('s4-dob', student.dob ? String(student.dob).slice(0, 10) : '');
  setVal('s4-gender', student.gender);
  setVal('s4-bloodGroup', student.bloodGroup);
  setVal('s4-marital', student.maritalStatus);
  setVal('s4-nationality', student.nationality);
  onNationalityChange();
  setVal('s4-idtype', student.identityProofType);
  onIdTypeChange();
  setVal('s4-idnum', student.identityNumber);
  setVal('s4-emergName', student.emergencyName);
  setVal('s4-emergPhone', student.emergencyPhone);
  setVal('s4-relation', student.emergencyRelation);
  setVal('s4-pincode', student.pincode);
  setVal('s4-street', student.street || student.address);
  populatePassingYears();
  setVal('s4-passYear', student.passingYear);
  setVal('s4-institute', student.institute);
  setVal('s4-board', student.board);
  setVal('s4-primaryLang', student.primaryLanguage);
  setVal('s4-addLang', student.additionalLanguage);
  setVal('s4-batch', student.preferredBatch);
  if (student.learningMode) {
    const mode = document.querySelector(`input[name="learningMode"][value="${student.learningMode}"]`);
    if (mode) mode.checked = true;
  }

  if (student.photoUrl) {
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');
    if (preview) { preview.src = student.photoUrl; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    markExistingDocument('photo', 'Existing photo');
  }

  (student.documents || []).forEach((doc) => {
    const type = normalizeDocType(doc.docType);
    markExistingDocument(type, doc.fileName || 'Uploaded document');
  });

  populateOtpPanel(phone, student.email, student);
  const vbMobile = document.getElementById('vb-mobile');
  const vbEmail = document.getElementById('vb-email');
  if (vbMobile) { vbMobile.className = 'rsb-verify-badge green'; vbMobile.innerHTML = '<i class="fas fa-check"></i> Verified'; }
  if (vbEmail) { vbEmail.className = 'rsb-verify-badge green'; vbEmail.innerHTML = '<i class="fas fa-check"></i> Verified'; }

  updateRegistrationStatusNotice(registrationStatus);
  updateProfileCompletion();
}

function normalizeDocType(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('photo')) return 'photo';
  if (raw.includes('identity') || raw.includes('aadhaar') || raw.includes('id')) return 'aadhaar';
  if (raw.includes('education') || raw.includes('certificate') || raw.includes('qualification')) return 'cert';
  if (raw.includes('additional') || raw.includes('extra')) return 'extra';
  return raw;
}

function markExistingDocument(type, fileName) {
  const map = {
    photo: ['docBox-photo', 'docName-photo', 'docBadge-photo'],
    aadhaar: ['docBox-aadhaar', 'docName-aadhaar', 'docBadge-aadhaar'],
    cert: ['docBox-cert', 'docName-cert', 'docBadge-cert'],
    extra: ['docBox-extra', 'docName-extra', 'docBadge-extra'],
  };
  const ids = map[type];
  if (!ids) return;
  const [boxId, nameId, badgeId] = ids;
  const box = document.getElementById(boxId);
  const nameEl = document.getElementById(nameId);
  const badge = document.getElementById(badgeId);
  if (box) box.classList.add('uploaded');
  if (nameEl) { nameEl.textContent = fileName || 'Uploaded document'; nameEl.style.display = 'block'; }
  if (badge) { badge.className = 'rsb-doc-badge uploaded'; badge.innerHTML = '<i class="fas fa-check"></i> Uploaded'; }
}

function updateRegistrationStatusNotice(registrationStatus) {
  const status = registrationStatus?.status || state.currentRegistrationStatus;
  const reviewNote = registrationStatus?.reviewNote || state.currentStudent?.registrationReviewNote || '';
  let notice = document.getElementById('registrationStatusNotice');
  const panel = document.getElementById('panel-docs');
  if (!panel) return;

  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'registrationStatusNotice';
    notice.className = 'reg-alert';
    panel.insertBefore(notice, panel.firstElementChild);
  }

  if (status === 'correction_needed' || status === 'rejected') {
    notice.className = 'reg-alert error';
    notice.style.display = 'flex';
    notice.innerHTML = `<i class="fas fa-circle-exclamation"></i><span>${reviewNote || 'The admin requested corrections. Please update your details and resubmit.'}</span>`;
    return;
  }
  if (status === 'submitted') {
    notice.className = 'reg-alert success';
    notice.style.display = 'flex';
    notice.innerHTML = '<i class="fas fa-clock"></i><span>Your registration profile is already submitted and under review. You can still update and resubmit if needed.</span>';
    return;
  }
  notice.style.display = 'none';
}

async function preSelectFromToken() {
  const data = window._tokenData;
  if (!data) return;

  const setV = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
  setV('fullName', data.fullName);
  setV('email',    data.email);
  if (data.mobile) setV('phone', String(data.mobile).replace(/^\+91\s?/, ''));

  if (!data.courseId) return;

  try {
    const res = await fetch(`${API}/courses/${data.courseId}`);
    const cdata = await res.json();
    if (!cdata.success) return;
    const course = cdata.course;

    const catSel = document.getElementById('courseCategory');
    if (!catSel) return;
    catSel.value = String(course.categoryId);
    await onCategoryChange();

    const courseSel = document.getElementById('courseId');
    if (!courseSel) return;
    courseSel.value = String(data.courseId);
    onCourseChange();
  } catch (e) {
    console.error('Pre-select error:', e);
  }
}

async function onCategoryChange() {
  const sel = document.getElementById('courseCategory');
  const catId = sel.value;
  const catName = sel.options[sel.selectedIndex]?.dataset?.name || '';
  const courseSel = document.getElementById('courseId');
  const card = document.getElementById('courseSelCard');
  const intlNote = document.getElementById('intlNote');

  state.selectedCategoryId = catId;
  state.selectedCategoryName = catName;
  state.selectedCourse = null;
  document.getElementById('g-courseCategory').classList.remove('has-error');

  courseSel.innerHTML = '<option value="">Loading coursesâ€¦</option>';
  courseSel.disabled = true;
  card.classList.remove('show');
  intlNote.style.display = 'none';
  updateSidebar(null);

  if (!catId) { courseSel.innerHTML = '<option value="">Select category first</option>'; return; }

  try {
    const res = await fetch(`${API}/courses?categoryId=${catId}`);
    const data = await res.json();
    if (!data.success || !data.courses.length) {
      courseSel.innerHTML = '<option value="">No courses in this category</option>';
      return;
    }
    courseSel.innerHTML = '<option value="">Select Course</option>';
    data.courses.forEach(course => {
      const opt = document.createElement('option');
      opt.value = course.id;
      opt.dataset.name = course.name;
      opt.dataset.duration = course.duration;
      opt.dataset.eligibility = course.eligibility;
      opt.dataset.fee = course.fee;
      opt.dataset.description = course.description || '';
      opt.textContent = course.name;
      courseSel.appendChild(opt);
    });
    courseSel.disabled = false;
  } catch (e) {
    courseSel.innerHTML = '<option value="">Error loading courses</option>';
  }
}

function onCourseChange() {
  const sel = document.getElementById('courseId');
  const opt = sel.options[sel.selectedIndex];
  const card = document.getElementById('courseSelCard');
  const intlNote = document.getElementById('intlNote');

  document.getElementById('g-courseId').classList.remove('has-error');

  if (!sel.value) {
    state.selectedCourse = null;
    card.classList.remove('show');
    intlNote.style.display = 'none';
    updateSidebar(null);
    return;
  }

  const course = {
    id: sel.value,
    name: opt.dataset.name,
    duration: opt.dataset.duration,
    eligibility: opt.dataset.eligibility,
    fee: opt.dataset.fee,
    description: opt.dataset.description,
  };
  state.selectedCourse = course;

  const fee = parseFloat(course.fee).toLocaleString('en-IN');
  document.getElementById('csc-name').textContent = course.name;
  document.getElementById('csc-dur').textContent = `â± ${course.duration}`;
  document.getElementById('csc-eli').textContent = `ðŸŽ“ ${course.eligibility}`;
  document.getElementById('csc-about').textContent = course.description || 'Industry-focused training with QR-verified certification and placement assistance.';
  document.getElementById('csc-fee').textContent = fee;
  document.getElementById('csc-img').textContent = catIcons[state.selectedCategoryName] || 'ðŸŽ“';
  card.classList.add('show');
  intlNote.style.display = 'flex';
  updateSidebar(course);
}

function viewCourseDetails() {
  if (!state.selectedCourse) { window.open('courses.html', '_blank'); return; }
  const url = `course-detail.html#name=${encodeURIComponent(state.selectedCourse.name)}`;
  window.open(url, '_blank');
}

function updateSidebar(course) {
  setText('sb-category', state.selectedCategoryName || 'â€”');
  if (course) {
    const fee = parseFloat(course.fee).toLocaleString('en-IN');
    setText('sb-course', course.name);
    const durEl = document.getElementById('sb-duration');
    if (durEl) { durEl.textContent = course.duration; durEl.className = 'rsb-val'; }
    setText('sb-fee', `â‚¹ ${fee}/- All Inclusive`);
  } else {
    setText('sb-course', 'â€”');
    const durEl = document.getElementById('sb-duration');
    if (durEl) { durEl.textContent = 'Select course'; durEl.className = 'rsb-val muted'; }
    setText('sb-fee', 'â€”');
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   WHATSAPP CHECKBOX
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function wireWhatsAppCheckbox() {
  const cb = document.getElementById('wasSame');
  const waInput = document.getElementById('whatsapp');
  if (!cb || !waInput) return;
  cb.addEventListener('change', () => {
    waInput.disabled = cb.checked;
    waInput.value = '';
    waInput.placeholder = cb.checked ? 'Same as mobile number' : 'Enter WhatsApp number';
  });
  waInput.disabled = true;
  waInput.placeholder = 'Same as mobile number';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LOCATION CASCADES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function onCountryChange() {
  document.getElementById('city').innerHTML = '<option value="">Select City</option>';
  document.getElementById('state').value = '';
}

function onStateChange() {
  const stateVal = document.getElementById('state').value;
  const cityEl = document.getElementById('city');
  cityEl.innerHTML = '<option value="">Select City</option>';
  (citiesByState[stateVal] || ['Other']).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    cityEl.appendChild(opt);
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PASSWORD VALIDATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function checkPassword() {
  const val = document.getElementById('password').value;
  toggleRule('pr-len', val.length >= 8);
  toggleRule('pr-cap', /[A-Z]/.test(val));
  toggleRule('pr-num', /[0-9]/.test(val));
  toggleRule('pr-spc', /[@#$%^&*!]/.test(val));
  if (document.getElementById('confirmPassword').value) checkConfirmPass();
}

function checkConfirmPass() {
  const pass = document.getElementById('password').value;
  const conf = document.getElementById('confirmPassword').value;
  const g = document.getElementById('g-confirmPassword');
  if (g) g.classList.toggle('has-error', conf.length > 0 && pass !== conf);
}

function toggleRule(id, ok) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('ok', ok);
}

function isPasswordValid() {
  const val = document.getElementById('password').value;
  return val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[@#$%^&*!]/.test(val);
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye'; }
  else { input.type = 'password'; icon.className = 'fas fa-eye-slash'; }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FORM VALIDATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function validateRegistration() {
  let valid = true;
  const fields = [
    { id: 'fullName',  gid: 'g-fullName',  msg: 'Full name is required.',               test: v => v.trim().length >= 2 },
    { id: 'email',     gid: 'g-email',     msg: 'Valid email address is required.',       test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'phone',     gid: 'g-phone',     msg: 'Valid 10-digit mobile number required.', test: v => /^[6-9]\d{9}$/.test(v) },
    { id: 'country',   gid: 'g-country',   msg: 'Country is required.',                  test: v => v.length > 0 },
    { id: 'state',     gid: 'g-state',     msg: 'State is required.',                    test: v => v.length > 0 },
    { id: 'city',      gid: 'g-city',      msg: 'City is required.',                     test: v => v.length > 0 },
    { id: 'qualification', gid: 'g-qualification', msg: 'Highest qualification is required.', test: v => v.length > 0 },
  ];
  fields.forEach(({ id, gid, msg, test }) => {
    const el = document.getElementById(id);
    const grp = document.getElementById(gid);
    if (!el || !grp) return;
    const ok = test(el.value);
    grp.classList.toggle('has-error', !ok);
    const errEl = grp.querySelector('.rf-error-msg');
    if (errEl) errEl.textContent = msg;
    if (!ok) valid = false;
  });

  if (!isPasswordValid()) {
    document.getElementById('g-password').classList.add('has-error');
    document.getElementById('passErrMsg').textContent = 'Password does not meet all requirements.';
    valid = false;
  } else {
    document.getElementById('g-password').classList.remove('has-error');
  }

  const pass = document.getElementById('password').value;
  const conf = document.getElementById('confirmPassword').value;
  if (pass !== conf || !conf) {
    document.getElementById('g-confirmPassword').classList.add('has-error');
    valid = false;
  }
  return valid;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SEND OTP (SIGNUP)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
async function handleSendOtp() {
  const alertEl = document.getElementById('regAlert');
  const alertMsg = document.getElementById('regAlertMsg');
  hideAlert(alertEl);

  if (!validateRegistration()) {
    showAlert(alertEl, alertMsg, 'Please fix the errors above before continuing.');
    return;
  }

  const btn = document.getElementById('sendOtpBtn');
  setLoading(btn, true, 'Sending OTPâ€¦');

  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const wasSame = document.getElementById('wasSame').checked;

  const payload = {
    fullName:       document.getElementById('fullName').value.trim(),
    email,
    phone,
    whatsapp:       wasSame ? phone : (document.getElementById('whatsapp').value.trim() || phone),
    alternatePhone: document.getElementById('altPhone').value.trim() || null,
    password:       document.getElementById('password').value,
    country:        document.getElementById('country').value,
    state:          document.getElementById('state').value,
    city:           document.getElementById('city').value,
    qualification:  document.getElementById('qualification').value,
    workExperience: document.getElementById('workExperience').value,
    courseId:       state.selectedCourse ? state.selectedCourse.id : undefined,
  };

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(alertEl, alertMsg, data.message || 'Signup failed. Please try again.');
      setLoading(btn, false, '<i class="fas fa-paper-plane"></i> Continue Next');
      return;
    }

    // Store state
    state.studentToken = data.token;
    state.studentPhone = phone;
    state.studentEmail = email;
    state.studentName = payload.fullName;
    localStorage.setItem('naisft_token', data.token);
    localStorage.setItem('naisft_student', JSON.stringify(data.student));

    if (data.devOtp) {
      console.log('%c[DEV] OTP: ' + data.devOtp, 'background:#e2a800;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:14px;');
    }

    // Populate OTP panel
    populateOtpPanel(phone, email, data.student);

    // Switch to OTP panel
    showPanel('panel-otp');
    startOtpTimer();

  } catch (e) {
    showAlert(alertEl, alertMsg, 'Network error. Please check your connection and try again.');
  } finally {
    setLoading(btn, false, '<i class="fas fa-paper-plane"></i> Continue Next');
  }
}

function handleGoogleSignup() {
  alert('Google Sign-In integration coming soon. Please use OTP signup for now.');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MOBILE OTP VERIFICATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function otpInput(el, prevId, nextId) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && nextId) document.getElementById(nextId).focus();
  const full = ['otp1','otp2','otp3','otp4','otp5','otp6'].every(id => document.getElementById(id).value);
  if (full) handleVerifyOtp();
}

function otpKeydown(e, el, prevId, nextId) {
  if (e.key === 'Backspace' && !el.value && prevId) document.getElementById(prevId).focus();
}

function getOtpValue() {
  return ['otp1','otp2','otp3','otp4','otp5','otp6'].map(id => document.getElementById(id).value).join('');
}

async function handleVerifyOtp() {
  const otp = getOtpValue();
  const errEl = document.getElementById('otpAlert');
  const errMsg = document.getElementById('otpAlertMsg');
  hideAlert(errEl);

  if (otp.length !== 6) {
    showAlert(errEl, errMsg, 'Please enter the complete 6-digit OTP.');
    return;
  }

  const verifyBtn = document.getElementById('continueToDocsBtn');
  setLoading(verifyBtn, true, '<i class="fas fa-spinner fa-spin"></i> Verifyingâ€¦');
  verifyBtn.style.display = 'flex';

  try {
    const res = await fetch(`${API}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.studentPhone, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(errEl, errMsg, data.message || 'Invalid OTP. Please try again.');
      document.querySelectorAll('.otp-box:not(.dashed)').forEach(b => {
        b.style.borderColor = '#ef4444';
        setTimeout(() => b.style.borderColor = '', 1500);
      });
      verifyBtn.style.display = 'none';
      return;
    }

    // Mobile verified
    state.studentToken = data.token;
    state.mobileVerified = true;
    localStorage.setItem('naisft_token', data.token);
    localStorage.setItem('naisft_student', JSON.stringify(data.student));

    // Mark boxes green
    ['otp1','otp2','otp3','otp4','otp5','otp6'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.classList.add('verified');
    });

    // Show verified message
    const verifiedMsg = document.getElementById('mobileVerifiedMsg');
    if (verifiedMsg) verifiedMsg.style.display = 'flex';

    // Update sidebar verification status
    const vbMobile = document.getElementById('vb-mobile');
    if (vbMobile) {
      vbMobile.className = 'rsb-verify-badge green';
      vbMobile.innerHTML = '<i class="fas fa-check"></i> Verified';
    }
    const vbNote = document.getElementById('vb-status-note');
    if (vbNote) vbNote.textContent = 'Mobile and email verified. Continue to documents.';

    const visibleContinue = document.getElementById('verifyEmailNowBtn');
    if (visibleContinue) {
      visibleContinue.disabled = false;
      visibleContinue.innerHTML = 'Continue Next<small>Mobile verified</small>';
    }

    // Keep the legacy CTA available for narrow/alternate layouts.
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Continue Next';
    verifyBtn.style.display = 'flex';
    const continueNote = document.getElementById('otpContinueNote');
    if (continueNote) continueNote.style.display = 'flex';

    // Store enrollment number for success panel
    const enrollDisplay = document.getElementById('enrollNoDisplay');
    if (enrollDisplay && data.student.enrollmentNo) {
      enrollDisplay.textContent = data.student.enrollmentNo;
    }

    // Update sidebar status text
    setText('sb-status-text', 'Mobile Verified');

    clearInterval(state.otpTimer);

  } catch (e) {
    showAlert(errEl, errMsg, 'Network error. Please try again.');
    verifyBtn.style.display = 'none';
  }
}

async function handleResendOtp() {
  const errEl = document.getElementById('otpAlert');
  const errMsg = document.getElementById('otpAlertMsg');
  hideAlert(errEl);

  try {
    const res = await fetch(`${API}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.studentPhone }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.devOtp) console.log('%c[DEV] Resent OTP: ' + data.devOtp, 'background:#e2a800;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;');
      ['otp1','otp2','otp3','otp4','otp5','otp6'].forEach(id => {
        const b = document.getElementById(id);
        if (b) { b.value = ''; b.classList.remove('verified'); b.style.borderColor = ''; }
      });
      document.getElementById('otp1').focus();
      startOtpTimer();
    } else {
      showAlert(errEl, errMsg, data.message || 'Failed to resend OTP.');
    }
  } catch (e) {
    showAlert(errEl, errMsg, 'Network error. Could not resend OTP.');
  }
}

function startOtpTimer() {
  clearInterval(state.otpTimer);
  let secs = 60;
  const btn = document.getElementById('resendBtn');
  const timerEl = document.getElementById('otpTimer');
  if (!btn || !timerEl) return;
  btn.disabled = true;
  timerEl.textContent = `(${secs}s)`;

  state.otpTimer = setInterval(() => {
    secs--;
    timerEl.textContent = `(${secs}s)`;
    if (secs <= 0) {
      clearInterval(state.otpTimer);
      btn.disabled = false;
      timerEl.textContent = '';
    }
  }, 1000);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EMAIL OTP
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function eotpInput(el, prevId, nextId) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && nextId) document.getElementById(nextId).focus();
}

function getEotpValue() {
  return ['eotp1','eotp2','eotp3','eotp4','eotp5','eotp6'].map(id => document.getElementById(id).value).join('');
}

async function handleVerifyEmail() {
  const eotp = getEotpValue();
  const errEl = document.getElementById('eotpAlert');
  const errMsg = document.getElementById('eotpAlertMsg');
  hideAlert(errEl);

  if (eotp.length !== 6) {
    showAlert(errEl, errMsg, 'Please enter the 6-digit email OTP first.');
    return;
  }

  const btn = document.getElementById('verifyEmailNowBtn');
  setLoading(btn, true, 'Verifying Emailâ€¦');

  try {
    const res = await fetch(`${API}/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.studentToken}`,
      },
      body: JSON.stringify({ email: state.studentEmail, otp: eotp }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(errEl, errMsg, data.message || 'Invalid email OTP. Please try again.');
      return;
    }

    state.emailVerified = true;

    // Mark email boxes green
    ['eotp1','eotp2','eotp3','eotp4','eotp5','eotp6'].forEach(id => {
      const b = document.getElementById(id);
      if (b) { b.classList.add('verified'); b.classList.remove('dashed'); }
    });

    const emailVerifiedMsg = document.getElementById('emailVerifiedMsg');
    if (emailVerifiedMsg) emailVerifiedMsg.style.display = 'flex';

    // Update email sent badge
    const emailSentBadge = document.getElementById('emailSentBadge');
    if (emailSentBadge) {
      emailSentBadge.innerHTML = '<i class="fas fa-check-circle"></i> Email Verified';
    }

    // Update sidebar
    const vbEmail = document.getElementById('vb-email');
    if (vbEmail) { vbEmail.className = 'rsb-verify-badge green'; vbEmail.innerHTML = '<i class="fas fa-check"></i> Verified'; }
    const vbNote = document.getElementById('vb-status-note');
    if (vbNote) vbNote.textContent = 'Mobile & Email Verified â€“ Ready for Documents Upload';

    btn.innerHTML = '<i class="fas fa-check-circle"></i> Email Verified';
    btn.disabled = true;

  } catch (e) {
    // Email OTP endpoint may not exist yet â€” graceful fallback
    showAlert(errEl, errMsg, 'Email verification is not available yet. You can verify later from the dashboard.');
  } finally {
    if (!state.emailVerified) {
      setLoading(btn, false, 'Continue Next');
    }
  }
}

function handleBackToRegistration() {
  showPanel('panel-register');
}

function handleSkipEmail() {
  if (!state.mobileVerified) {
    const errEl = document.getElementById('otpAlert');
    const errMsg = document.getElementById('otpAlertMsg');
    showAlert(errEl, errMsg, 'Please verify your mobile number first before skipping email.');
    return;
  }
  showPanel('panel-success');
}

async function handleResendEmailOtp() {
  const errEl = document.getElementById('eotpAlert');
  const errMsg = document.getElementById('eotpAlertMsg');
  hideAlert(errEl);

  try {
    const res = await fetch(`${API}/auth/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.studentToken}`,
      },
      body: JSON.stringify({ email: state.studentEmail }),
    });
    const data = await res.json();
    if (data.success) {
      ['eotp1','eotp2','eotp3','eotp4','eotp5','eotp6'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.value = '';
      });
      document.getElementById('eotp1').focus();
      startEotpTimer();

      const emailSentBadge = document.getElementById('emailSentBadge');
      if (emailSentBadge) emailSentBadge.style.display = 'inline-flex';
    } else {
      showAlert(errEl, errMsg, data.message || 'Failed to send email OTP.');
    }
  } catch (e) {
    showAlert(errEl, errMsg, 'Email OTP not available yet. Verify later from your dashboard.');
  }
}

function startEotpTimer() {
  clearInterval(state.eotpTimer);
  let secs = 60;
  const btn = document.getElementById('resendEmailBtn');
  const timerEl = document.getElementById('eotpTimer');
  if (!btn || !timerEl) return;
  btn.disabled = true;
  timerEl.textContent = `(${secs}s)`;

  state.eotpTimer = setInterval(() => {
    secs--;
    timerEl.textContent = `(${secs}s)`;
    if (secs <= 0) {
      clearInterval(state.eotpTimer);
      btn.disabled = false;
      timerEl.textContent = '';
    }
  }, 1000);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 4 â€” PROFILE & DOCUMENTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function populateStep4Fields() {
  // Pre-fill read-only contact fields from state
  setVal('s4-fullName',    state.studentName  || getStored('fullName'));
  setVal('s4-mobile',      state.studentPhone ? `+91 ${state.studentPhone}` : getStored('phone'));
  setVal('s4-email',       state.studentEmail || getStored('email'));
  setVal('s4-whatsapp',    getStored('whatsapp') || (state.studentPhone ? `+91 ${state.studentPhone}` : ''));

  // Pre-fill location from registration form
  setVal('s4-country',       document.getElementById('country')?.value       || '');
  setVal('s4-state',         document.getElementById('state')?.value         || '');
  setVal('s4-city',          document.getElementById('city')?.value          || '');
  setVal('s4-qualification', document.getElementById('qualification')?.value || '');
  setVal('s4-experience',    document.getElementById('workExperience')?.value|| '');

}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function apiAuthHeaders(extra = {}) {
  const token = state.studentToken || localStorage.getItem('naisft_token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getStored(key) {
  try {
    const s = JSON.parse(localStorage.getItem('naisft_student') || '{}');
    return s[key] || '';
  } catch { return ''; }
}

function populatePassingYears() {
  const sel = document.getElementById('s4-passYear');
  if (!sel || sel.options.length > 1) return;
  const cur = new Date().getFullYear();
  for (let y = cur; y >= 1990; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  }
}

/* â”€â”€ Profile photo preview â”€â”€ */
function previewPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');
    if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    // Also mark the doc-photo box as uploaded
    onDocUploaded(input, 'docBox-photo', 'docName-photo', 'docBadge-photo');
    updateProfileCompletion();
  };
  reader.readAsDataURL(input.files[0]);
}

/* â”€â”€ Document upload handlers â”€â”€ */
function triggerDocUpload(inputId, boxId, badgeId) {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

function onDocUploaded(input, boxId, nameId, badgeId) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const box  = document.getElementById(boxId);
  const nameEl = document.getElementById(nameId);
  const badge  = document.getElementById(badgeId);

  if (box)    box.classList.add('uploaded');
  if (nameEl) { nameEl.textContent = file.name; nameEl.style.display = 'block'; }
  if (badge)  { badge.className = 'rsb-doc-badge uploaded'; badge.innerHTML = '<i class="fas fa-check"></i> Uploaded'; }

  updateProfileCompletion();
}

function removeDoc(event, boxId, badgeId, inputId) {
  event.stopPropagation();
  const box   = document.getElementById(boxId);
  const badge = document.getElementById(badgeId);
  const input = document.getElementById(inputId);

  if (box) {
    box.classList.remove('uploaded');
    const nameEl = box.querySelector('.doc-file-name');
    if (nameEl) { nameEl.textContent = ''; nameEl.style.display = 'none'; }
  }
  if (badge) { badge.className = 'rsb-doc-badge pending'; badge.innerHTML = '<i class="fas fa-clock"></i> Pending'; }
  if (input) input.value = '';

  // Reset photo preview if it's the photo box
  if (boxId === 'docBox-photo') {
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (placeholder) placeholder.style.display = 'flex';
  }
  updateProfileCompletion();
}

/* â”€â”€ Aadhaar formatter: 0000 0000 0000 â”€â”€ */
function formatAadhaar(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 12);
  input.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/* â”€â”€ Nationality â†’ ID proof options â”€â”€ */
const ID_PROOF_OPTIONS = {
  indian: [
    { value: 'aadhaar',  label: 'Aadhaar Card',      placeholder: '12-digit Aadhaar number',    maxlen: 14, pattern: /^\d{4}\s?\d{4}\s?\d{4}$/ },
    { value: 'pan',      label: 'PAN Card',           placeholder: 'E.g. ABCDE1234F',            maxlen: 10, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/i },
    { value: 'driving',  label: 'Driving Licence',    placeholder: 'Driving licence number',     maxlen: 20, pattern: /.{5,}/ },
    { value: 'voter',    label: 'Voter ID Card',       placeholder: 'Voter ID number',            maxlen: 20, pattern: /.{5,}/ },
  ],
  international: [
    { value: 'passport', label: 'Passport',            placeholder: 'Passport number',            maxlen: 20, pattern: /.{6,}/ },
  ],
};

function onNationalityChange() {
  const nat = document.getElementById('s4-nationality').value;
  const row = document.getElementById('g-s4-idproof-row');
  const sel = document.getElementById('s4-idtype');

  if (!nat) { row.style.display = 'none'; return; }

  const opts = ID_PROOF_OPTIONS[nat] || [];
  sel.innerHTML = '<option value="">Select Type</option>' +
    opts.map(o => `<option value="${o.value}">${o.label}</option>`).join('');

  row.style.display = '';
  onIdTypeChange();
}

function onIdTypeChange() {
  const nat   = document.getElementById('s4-nationality').value;
  const type  = document.getElementById('s4-idtype').value;
  const input = document.getElementById('s4-idnum');
  const label = document.getElementById('s4-idnum-label');

  if (!type) {
    input.placeholder = 'Enter identity number';
    input.maxLength   = 30;
    return;
  }

  const opts = ID_PROOF_OPTIONS[nat] || [];
  const opt  = opts.find(o => o.value === type);
  if (!opt) return;

  label.innerHTML   = `${opt.label} Number <span class="req">*</span>`;
  input.placeholder = opt.placeholder;
  input.maxLength   = opt.maxlen;

  if (type === 'aadhaar') {
    input.oninput = function() { formatAadhaar(this); };
  } else {
    input.oninput = null;
    input.value   = input.value.toUpperCase();
  }
}

/* â”€â”€ Profile completion tracker â”€â”€ */
function updateProfileCompletion() {
  const checks = [
    () => !!document.getElementById('photoPreview')?.src && document.getElementById('photoPreview').style.display !== 'none',
    () => document.getElementById('s4-fatherName')?.value.trim().length > 1,
    () => document.getElementById('s4-motherName')?.value.trim().length > 1,
    () => !!document.getElementById('s4-dob')?.value,
    () => !!document.getElementById('s4-gender')?.value,
    () => document.getElementById('s4-idnum')?.value.trim().length >= 5,
    () => document.getElementById('s4-emergName')?.value.trim().length > 1,
    () => document.getElementById('s4-emergPhone')?.value.trim().length === 10,
    () => document.getElementById('s4-pincode')?.value.trim().length === 6,
    () => document.getElementById('s4-street')?.value.trim().length > 3,
    () => !!document.getElementById('s4-passYear')?.value,
    () => document.getElementById('s4-institute')?.value.trim().length > 2,
    () => !!document.getElementById('s4-batch')?.value,
    () => document.querySelector('input[name="learningMode"]:checked') !== null,
    () => document.getElementById('docBox-aadhaar')?.classList.contains('uploaded'),
    () => document.getElementById('docBox-cert')?.classList.contains('uploaded'),
  ];

  const done = checks.filter(fn => { try { return fn(); } catch { return false; } }).length;
  const pct  = Math.round((done / checks.length) * 100);

  const fill = document.getElementById('rsb-profile-fill');
  const pctEl = document.getElementById('rsb-profile-pct');
  if (fill)  fill.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
}

// Live update completion as user types
document.addEventListener('DOMContentLoaded', () => {
  const s4fields = ['s4-fatherName','s4-motherName','s4-dob','s4-gender','s4-idtype','s4-idnum',
    's4-emergName','s4-emergPhone','s4-pincode','s4-street','s4-passYear','s4-institute','s4-batch'];
  s4fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateProfileCompletion);
    if (el) el.addEventListener('change', updateProfileCompletion);
  });
  document.querySelectorAll('input[name="learningMode"]').forEach(r =>
    r.addEventListener('change', updateProfileCompletion)
  );
});

/* â”€â”€ Save Draft â”€â”€ */
async function handleSaveDraft() {
  const btn = document.getElementById('saveDraftBtn');
  setLoading(btn, true, 'Savingâ€¦');
  // Store locally for now; backend endpoint to be wired later
  const draft = {
    fatherName:   getVal('s4-fatherName'),
    motherName:   getVal('s4-motherName'),
    dob:          getVal('s4-dob'),
    gender:       getVal('s4-gender'),
    bloodGroup:   getVal('s4-bloodGroup'),
    marital:      getVal('s4-marital'),
    nationality:  getVal('s4-nationality'),
    identityProofType: getVal('s4-idtype'),
    identityNumber: getVal('s4-idnum'),
    emergName:    getVal('s4-emergName'),
    emergPhone:   getVal('s4-emergPhone'),
    relation:     getVal('s4-relation'),
    pincode:      getVal('s4-pincode'),
    street:       getVal('s4-street'),
    passYear:     getVal('s4-passYear'),
    institute:    getVal('s4-institute'),
    board:        getVal('s4-board'),
    primaryLang:  getVal('s4-primaryLang'),
    addLang:      getVal('s4-addLang'),
    batch:        getVal('s4-batch'),
    learningMode: document.querySelector('input[name="learningMode"]:checked')?.value,
  };
  localStorage.setItem('naisft_step4_draft', JSON.stringify(draft));
  setTimeout(() => setLoading(btn, false, '<i class="fas fa-save"></i> Save as Draft'), 800);
}

function getRegistrationProfilePayload() {
  return {
    fullName: getVal('s4-fullName') || state.studentName,
    whatsapp: getVal('s4-whatsapp'),
    country: getVal('s4-country') || getVal('country'),
    state: getVal('s4-state') || getVal('state'),
    city: getVal('s4-city') || getVal('city'),
    qualification: getVal('s4-qualification') || getVal('qualification'),
    workExperience: getVal('s4-experience') || getVal('workExperience'),
    fatherName: getVal('s4-fatherName'),
    motherName: getVal('s4-motherName'),
    dob: getVal('s4-dob'),
    gender: getVal('s4-gender'),
    bloodGroup: getVal('s4-bloodGroup'),
    maritalStatus: getVal('s4-marital'),
    nationality: getVal('s4-nationality'),
    identityProofType: getVal('s4-idtype'),
    identityNumber: getVal('s4-idnum'),
    emergencyName: getVal('s4-emergName'),
    emergencyPhone: getVal('s4-emergPhone'),
    emergencyRelation: getVal('s4-relation'),
    pincode: getVal('s4-pincode'),
    street: getVal('s4-street'),
    address: getVal('s4-street'),
    institute: getVal('s4-institute'),
    board: getVal('s4-board'),
    passingYear: getVal('s4-passYear'),
    primaryLanguage: getVal('s4-primaryLang'),
    additionalLanguage: getVal('s4-addLang'),
    preferredBatch: getVal('s4-batch'),
    learningMode: document.querySelector('input[name="learningMode"]:checked')?.value,
    submitRegistration: true,
  };
}

async function saveRegistrationDocuments() {
  const documents = [
    { docType: 'photo', inputId: 'docInput-photo' },
    { docType: 'identity', inputId: 'docInput-aadhaar' },
    { docType: 'education', inputId: 'docInput-cert' },
    { docType: 'additional', inputId: 'docInput-extra' },
  ];

  const saved = [];
  for (const doc of documents) {
    const input = document.getElementById(doc.inputId);
    const file = input && input.files ? input.files[0] : null;
    if (!file) continue;

    const fileData = await fileToDataUrl(file);
    const uploadRes = await fetch(`${API}/upload/file`, {
      method: 'POST',
      headers: apiAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        dataUrl: fileData,
        folder: 'naisft/student-documents',
      }),
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.message || `Could not upload ${doc.docType} document.`);

    const res = await fetch(`${API}/student/documents`, {
      method: 'POST',
      headers: apiAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        docType: doc.docType,
        fileName: file.name,
        fileUrl: uploadData.file.fileUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Could not save ${doc.docType} document.`);
    saved.push(data.document);
  }
  return saved;
}

/* Submit registration profile */
async function handleContinueToFee() {
  if (!apiAuthHeaders().Authorization) {
    alert('Please log in again before submitting your registration profile.');
    window.location.href = 'student-login.html';
    return;
  }

  const required = [
    { id: 'g-s4-fatherName', check: () => document.getElementById('s4-fatherName')?.value.trim().length > 1 },
    { id: 'g-s4-motherName', check: () => document.getElementById('s4-motherName')?.value.trim().length > 1 },
    { id: 'g-s4-dob',        check: () => !!document.getElementById('s4-dob')?.value },
    { id: 'g-s4-gender',     check: () => !!document.getElementById('s4-gender')?.value },
    { id: 'g-s4-idproof-row', check: () => !!getVal('s4-nationality') && !!getVal('s4-idtype') },
    { id: 'g-s4-idnum',      check: () => getVal('s4-idnum').replace(/\s/g,'').length >= 5 },
    { id: 'g-s4-emergName',  check: () => document.getElementById('s4-emergName')?.value.trim().length > 1 },
    { id: 'g-s4-emergPhone', check: () => document.getElementById('s4-emergPhone')?.value.trim().length === 10 },
    { id: 'g-s4-pincode',    check: () => document.getElementById('s4-pincode')?.value.trim().length === 6 },
    { id: 'g-s4-street',     check: () => document.getElementById('s4-street')?.value.trim().length > 3 },
    { id: 'g-s4-passYear',   check: () => !!document.getElementById('s4-passYear')?.value },
    { id: 'g-s4-institute',  check: () => document.getElementById('s4-institute')?.value.trim().length > 2 },
    { id: 'g-s4-batch',      check: () => !!document.getElementById('s4-batch')?.value },
  ];

  let valid = true;
  required.forEach(({ id, check }) => {
    const grp = document.getElementById(id);
    const ok = check();
    if (grp) grp.classList.toggle('has-error', !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    window.scrollTo({ top: document.getElementById('panel-docs')?.offsetTop - 100 || 0, behavior: 'smooth' });
    return;
  }

  const btn = document.getElementById('continueToFeeBtn');
  setLoading(btn, true, 'Submitting registration...');

  try {
    handleSaveDraft();
    const savedDocuments = await saveRegistrationDocuments();
    const photoDocument = savedDocuments.find((doc) => doc.docType === 'photo');
    const profilePayload = getRegistrationProfilePayload();
    profilePayload.currentRegistrationStatus = state.currentRegistrationStatus;
    if (photoDocument?.fileUrl) profilePayload.photoUrl = photoDocument.fileUrl;

    const res = await fetch(`${API}/student/profile`, {
      method: 'PATCH',
      headers: apiAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(profilePayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not submit registration profile.');

    localStorage.setItem('naisft_registration_status', JSON.stringify(data.registrationStatus || {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    }));
    if (data.student) localStorage.setItem('naisft_student', JSON.stringify(data.student));
    showPanel('panel-confirmed');
  } catch (err) {
    alert(err.message || 'Could not submit registration profile. Please try again.');
  } finally {
    setLoading(btn, false, '<i class="fas fa-arrow-right"></i> Submit &amp; Continue');
  }
}

/* Registration confirmed */

function populateStep6Fields() {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };

  const name = state.studentName || document.getElementById('reg-fullName')?.value || 'Student';
  set('c6-name',     name);
  set('c6-sname',    name);
  set('c6-course',   'Submitted');
  set('c6-duration', 'Under Review');
  set('c6-batch',    document.getElementById('s4-batch')?.value || 'After review');

  set('c6-admNo', 'Under Review');
}

function handleDownloadDoc(e, docType) {
  if (e) e.preventDefault();
  const labels = {
    'admission-letter':    'Admission Letter',
    'student-id':          'Student ID Card',
    'schedule':            'Class Schedule',
  };
  const notReady = ['student-id', 'schedule'];
  if (notReady.includes(docType)) {
    alert(`${labels[docType]} will be available after batch allocation. We'll notify you via SMS and email.`);
    return;
  }
  alert(`${labels[docType] || 'Document'} download will be available once the document generation system is integrated. Check your registered email for a copy.`);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   UTILITIES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function showAlert(containerEl, msgEl, msg) {
  if (!containerEl) return;
  if (msgEl) msgEl.textContent = msg;
  else containerEl.textContent = msg;
  containerEl.classList.add('show');
}

function hideAlert(el) {
  if (el) el.classList.remove('show');
}

function setLoading(btn, loading, html) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> ' + html : html;
}


