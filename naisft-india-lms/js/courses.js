(() => {
const COURSE_DATA = {
  diploma: {
    label: 'Diploma Programs',
    fee: '₹26,500',
    type: 'Diploma Program',
    meta: ['Professional Program', 'Career Focused'],
    tagClass: '',
    courses: [
      ['Diploma in Fire & Industrial Safety Engineering', 'Build foundational understanding across fire prevention, emergency response and industrial workplace safety.', 'diploma-fire-industrial-safety'],
      ['Diploma in Oil & Gas Safety Engineering', 'Develop safety awareness for oil and gas work environments, hazards, controls and safe operations.', 'diploma-oil-gas-safety'],
      ['Diploma in Drilling & Rig Safety Management', 'Learn core safety concepts relevant to drilling, rig operations, hazard controls and worksite coordination.', 'diploma-drilling-rig-safety'],
      ['Diploma in Food Safety & Quality Management', 'Build knowledge of food safety practices, quality management, hygiene controls and compliance-oriented systems.', 'diploma-food-safety-quality'],
      ['Diploma in Industrial Safety Engineering', 'Develop broad practical understanding of industrial hazards, prevention, controls and safe work practices.', 'diploma-industrial-safety']
    ]
  },
  advanced: {
    label: 'Advanced Diploma Programs',
    fee: '₹26,500',
    type: 'Advanced Diploma',
    meta: ['Advanced Program', 'Specialized Track'],
    tagClass: 'red',
    courses: [
      ['Advanced Diploma in Fire & Industrial Safety Engineering', 'Advance your understanding of fire safety systems, industrial risk controls and safety management practice.', 'adv-diploma-fire-industrial-safety'],
      ['Advanced Diploma in Oil & Gas Safety Engineering', 'Build deeper knowledge for managing risk, controls and safe operating practices in oil and gas environments.', 'adv-diploma-oil-gas-safety'],
      ['Advanced Diploma in Drilling & Rig Safety Management', 'Strengthen advanced safety understanding for drilling operations, rig hazards and operational risk management.', 'adv-diploma-drilling-rig-safety'],
      ['Advanced Diploma in Food Safety & Quality Management', 'Develop advanced knowledge across food safety systems, quality control and structured management practices.', 'adv-diploma-food-safety-quality'],
      ['Advanced Diploma in Industrial Safety Engineering', 'Progress into advanced industrial safety concepts, risk control methods and workplace safety management.', 'adv-diploma-industrial-safety']
    ]
  },
  corporate: {
    label: 'Corporate Safety Skill Development Programs',
    fee: '₹499',
    type: 'Skill Development',
    meta: ['Focused Training', 'Safety Skill'],
    tagClass: 'navy',
    courses: [
      ['Fire Safety & Emergency Response Training', 'Focused learning on fire prevention, emergency awareness and response readiness.', 'corp-fire-safety-emergency-response'],
      ['First Aid & CPR Training', 'Essential first-response awareness for medical emergencies and CPR fundamentals.', 'corp-first-aid-cpr'],
      ['Permit to Work (PTW) Training', 'Understand permit-to-work controls, responsibilities and safe authorization practices.', 'corp-permit-to-work'],
      ['Hot Work Safety & Fire Prevention Training', 'Learn controls for hot work hazards, ignition prevention and fire-risk reduction.', 'corp-hot-work-safety'],
      ['Hazard Identification & Risk Assessment (HIRA) Training', 'Build practical understanding of identifying hazards and evaluating workplace risk.', 'corp-hira-training'],
      ['Job Safety Analysis (JSA) Training', 'Learn to break down tasks, identify hazards and define safe job controls.', 'corp-job-safety-analysis'],
      ['MSDS / SDS Interpretation & Chemical Safety Training', 'Understand safety data sheets, chemical information and practical handling precautions.', 'corp-msds-sds-chemical-safety'],
      ['Chemical Safety & Hazard Management Training', 'Develop awareness of chemical hazards, controls, storage and safe workplace management.', 'corp-chemical-safety-hazard-mgmt'],
      ['Working at Height Competency Training', 'Focused learning on height-work hazards, controls and safe work considerations.', 'corp-working-at-height'],
      ['Advanced Scaffolding Inspection Training', 'Build inspection awareness around scaffold condition, access and safety considerations.', 'corp-scaffolding-inspection'],
      ['Confined Space Entry & Emergency Response Training', 'Understand confined-space hazards, entry controls and emergency response readiness.', 'corp-confined-space-entry'],
      ['Crane Safety & Lifting Operations Training', 'Learn safety principles for crane operations, lifting plans and controlled lifting work.', 'corp-crane-safety-lifting'],
      ['Rigging, Slinging & Load Handling Training', 'Develop practical awareness of rigging, slinging and safe load-handling fundamentals.', 'corp-rigging-slinging-load'],
      ['Banksman, Signalman & Lifting Operations Training', 'Learn communication, signalling and coordination principles for lifting operations.', 'corp-banksman-signalman-lifting'],
      ['Forklift Operator Safety Training', 'Focused safety learning for forklift hazards, operating awareness and workplace controls.', 'corp-forklift-operator-safety'],
      ['Energy Isolation & Lockout Tagout (LOTO) Training', 'Understand energy isolation, lockout/tagout principles and safe maintenance controls.', 'corp-loto-energy-isolation'],
      ['Electrical Safety & Risk Management Training', 'Develop awareness of electrical hazards, risk controls and safer work practices.', 'corp-electrical-safety-risk'],
      ['Arc Flash Protection & Safe Work Practices Training', 'Understand arc-flash risk, protection principles and safer electrical work practices.', 'corp-arc-flash-protection'],
      ['H2S Detection & Emergency Response Training', 'Learn H2S hazard awareness, detection principles and emergency response actions.', 'corp-h2s-detection-emergency'],
      ['Incident Investigation Training', 'Build a structured understanding of incident review, evidence, causes and corrective action.', 'corp-incident-investigation'],
      ['Behaviour Based Safety (BBS) Training', 'Explore behavioural safety principles, observation and positive safety intervention.', 'corp-behaviour-based-safety'],
      ['Emergency Response, Rescue & Crisis Management Training', 'Develop awareness of emergency coordination, rescue readiness and crisis response structure.', 'corp-emergency-response-rescue'],
      ['Process Safety Management (PSM) Training', 'Understand core process-safety principles and structured control of major operational hazards.', 'corp-process-safety-mgmt'],
      ['Process Hazard Analysis (HAZOP) Training', 'Learn the fundamentals of structured process hazard review and HAZOP thinking.', 'corp-hazop-process-hazard']
    ]
  }
};

const categoryOrder = ['diploma', 'advanced', 'corporate'];
const imageClasses = ['image-one', 'image-two', 'image-three', 'image-four', 'image-five'];
const categorySelect = document.getElementById('categorySelect');
const searchInput = document.getElementById('courseSearch');
const groupHost = document.getElementById('courseCategoryGroups');
const emptyState = document.getElementById('emptyState');
const clearFilter = document.getElementById('clearFilter');
const emptyReset = document.getElementById('emptyReset');

function cardTemplate(category, course, index) {
  const meta = COURSE_DATA[category];
  const [title, description, slug] = course;
  const imageClass = imageClasses[index % imageClasses.length];
  const image = window.NAISFT_COURSE_IMAGES?.get({ slug, title });
  const imageStyle = image ? ` style="background-image:linear-gradient(0deg,rgba(7,27,50,.12),rgba(7,27,50,.12)),url('${image}')"` : '';
  const tagClass = meta.tagClass ? ` ${meta.tagClass}` : '';
  return `
    <article class="course-card catalogue-home-card" data-title="${title.toLowerCase()}">
      <div class="course-image ${imageClass}"${imageStyle}><span class="course-tag${tagClass}">${meta.type}</span></div>
      <div class="course-body">
        <div class="course-meta"><span>${meta.meta[0]}</span><span>${meta.meta[1]}</span></div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="course-footer">
          <div class="course-price"><span>Course Fee</span><strong>${meta.fee}</strong></div>
          <a href="course-detail.html#course=${slug}">Course Details →</a>
        </div>
      </div>
    </article>`;
}

function sectionTemplate(category, query) {
  const meta = COURSE_DATA[category];
  const matches = meta.courses.filter(([title, description]) => `${title} ${description}`.toLowerCase().includes(query));
  if (!matches.length) return '';
  return `
    <section class="catalogue-category" id="category-${category}" data-category="${category}">
      <div class="catalogue-category-head">
        <div>
          <span class="eyebrow">${category === 'corporate' ? 'WORKPLACE SAFETY SKILLS' : 'PROFESSIONAL PROGRAMS'}</span>
          <h2>${meta.label}</h2>
          <p>${matches.length} ${matches.length === 1 ? 'course' : 'courses'} available in this category.</p>
        </div>
        <div class="category-fee"><span>Course Fee</span><strong>${meta.fee}</strong></div>
      </div>
      <div class="course-grid">${matches.map((course) => cardTemplate(category, course, meta.courses.indexOf(course))).join('')}</div>
    </section>`;
}

function renderCourses() {
  const query = searchInput.value.trim().toLowerCase();
  const html = categoryOrder.map(category => sectionTemplate(category, query)).join('');
  groupHost.innerHTML = html;
  window.NAISFT_COURSE_IMAGES?.hydrateCourseCardImages(groupHost);
  const hasResults = Boolean(html.trim());
  groupHost.hidden = !hasResults;
  emptyState.hidden = hasResults;
}

function scrollToSelectedCategory() {
  const target = document.getElementById(`category-${categorySelect.value}`);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetSearch() {
  searchInput.value = '';
  renderCourses();
  searchInput.focus();
}

categorySelect.addEventListener('change', scrollToSelectedCategory);
searchInput.addEventListener('input', renderCourses);
clearFilter.addEventListener('click', resetSearch);
emptyReset.addEventListener('click', resetSearch);

renderCourses();

const params = new URLSearchParams(location.search);
const requestedCategory = params.get('category');
if (requestedCategory && COURSE_DATA[requestedCategory]) {
  categorySelect.value = requestedCategory;
  requestAnimationFrame(() => {
    const target = document.getElementById(`category-${requestedCategory}`);
    if (target) target.scrollIntoView({ block: 'start' });
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}
})();
