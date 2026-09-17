(function () {
  const base = 'Assets/Course Page Images/';
  const bySlug = {
    'diploma-fire-industrial-safety': 'DIPLOMA IN FIRE AND INDUSTRIAL SAFTEY ENGINEERING.webp',
    'diploma-oil-gas-safety': 'DIPLOM IN OIL AND GAS SAFTEY ENGINEERING ..webp',
    'diploma-drilling-rig-safety': 'DIPLOMA IN DRILLING & RIG SAFTEY MANAGEMENT.webp',
    'diploma-food-safety-quality': 'DIPLOMA IN FOOD SAFTEY & QUALITY MANAGEMENT.webp',
    'diploma-industrial-safety': 'DIPLOMA IN INDUSTRIAL SAFTEY ENGINEERING.webp',
    'adv-diploma-fire-industrial-safety': 'DIPLOMA IN FIRE AND INDUSTRIAL SAFTEY ENGINEERING.webp',
    'adv-diploma-oil-gas-safety': 'DIPLOM IN OIL AND GAS SAFTEY ENGINEERING ..webp',
    'adv-diploma-drilling-rig-safety': 'DIPLOMA IN DRILLING & RIG SAFTEY MANAGEMENT.webp',
    'adv-diploma-food-safety-quality': 'DIPLOMA IN FOOD SAFTEY & QUALITY MANAGEMENT.webp',
    'adv-diploma-industrial-safety': 'DIPLOMA IN INDUSTRIAL SAFTEY ENGINEERING.webp',
    'corp-fire-safety-emergency-response': 'FIRE SAFTEY AND EMERGENCY RESPONCE TRAINING.webp',
    'corp-first-aid-cpr': 'FIRST AID AND CPR TRAINING.webp',
    'corp-permit-to-work': 'PERMIT TO WORK SAFTEY TRAINING.webp',
    'corp-hot-work-safety': 'HOW TO WORKSAFTEY & FIRE PREVENTION TRAINING.webp',
    'corp-hira-training': 'HIRA TRAINING.webp',
    'corp-job-safety-analysis': 'JOB SAFETY ANALYSIS TRAINING.webp',
    'corp-msds-sds-chemical-safety': 'MSDS SDS INTERPRATOR AND CHEMICAL SAFTEY.webp',
    'corp-chemical-safety-hazard-mgmt': 'CHEMICAL SAFETY & HAZARD MANAGEMENT.webp',
    'corp-working-at-height': 'WORK AT HEIGHT COMPETENCY TRAINING.webp',
    'corp-scaffolding-inspection': 'ADVANCE SCUFF HOLDING INSPECTION TRAINING.webp',
    'corp-confined-space-entry': 'CONFINED SPACE ENTRY AND EMERGENCY RESPONCE TRAINING.webp',
    'corp-crane-safety-lifting': 'CRANE SAFETY & LIFTING OPERATIONAL TRAINING.webp',
    'corp-rigging-slinging-load': 'RIGGING SILINGING & LOAD HANDELING TRAINING.webp',
    'corp-banksman-signalman-lifting': 'BANKSMAN SINGNALMAN &LIFT OPRATIONAL TAINING.webp',
    'corp-forklift-operator-safety': 'FORKLIFT SAFETY OPRATOR SAFTEY TRAINING.webp',
    'corp-loto-energy-isolation': 'ENERGY ISOLATION AND LOCKOUT TAGOUT (LOTO).webp',
    'corp-electrical-safety-risk': 'ELECTRICAL SAFETY & RISK MANAGEMENT TRAINING.webp',
    'corp-arc-flash-protection': 'ARC FLASH PROTECTION AND SAFE WORK PRACTICE.webp',
    'corp-h2s-detection-emergency': 'H2S DETECTION AND EMERGENCY RESPONCE TRAINING.webp',
    'corp-incident-investigation': 'INCIDENT INVESTIGATION TRAINING.webp',
    'corp-behaviour-based-safety': 'BEHAVIOUR BASED SAFETY TRAINING.webp',
    'corp-emergency-response-rescue': 'EMERGENCY RESPONCE , RESCUE & CRISIS.webp',
    'corp-process-safety-mgmt': 'PROCESS SAFETY MANAGEMENT (PSM) TRAINING.webp',
    'corp-hazop-process-hazard': 'PROCESS HAZARD ANALYSIS (HAZOP) TRAINING.webp',
  };

  const byId = {
    1: bySlug['diploma-fire-industrial-safety'],
    2: bySlug['diploma-oil-gas-safety'],
    3: bySlug['diploma-drilling-rig-safety'],
    4: bySlug['diploma-food-safety-quality'],
    5: bySlug['diploma-industrial-safety'],
    6: bySlug['adv-diploma-fire-industrial-safety'],
    7: bySlug['adv-diploma-oil-gas-safety'],
    8: bySlug['adv-diploma-drilling-rig-safety'],
    9: bySlug['adv-diploma-food-safety-quality'],
    10: bySlug['adv-diploma-industrial-safety'],
    11: bySlug['corp-fire-safety-emergency-response'],
    12: bySlug['corp-first-aid-cpr'],
    13: bySlug['corp-permit-to-work'],
    14: bySlug['corp-hot-work-safety'],
    15: bySlug['corp-hira-training'],
    16: bySlug['corp-job-safety-analysis'],
    17: bySlug['corp-msds-sds-chemical-safety'],
    18: bySlug['corp-chemical-safety-hazard-mgmt'],
    19: bySlug['corp-working-at-height'],
    20: bySlug['corp-scaffolding-inspection'],
    21: bySlug['corp-confined-space-entry'],
    22: bySlug['corp-crane-safety-lifting'],
    23: bySlug['corp-rigging-slinging-load'],
    24: bySlug['corp-banksman-signalman-lifting'],
    25: bySlug['corp-forklift-operator-safety'],
    26: bySlug['corp-loto-energy-isolation'],
    27: bySlug['corp-electrical-safety-risk'],
    28: bySlug['corp-arc-flash-protection'],
    29: bySlug['corp-h2s-detection-emergency'],
    30: bySlug['corp-incident-investigation'],
    31: bySlug['corp-behaviour-based-safety'],
    32: bySlug['corp-emergency-response-rescue'],
    33: bySlug['corp-process-safety-mgmt'],
    34: bySlug['corp-hazop-process-hazard'],
  };

  const byName = {
    'Diploma in Fire & Industrial Safety Engineering': bySlug['diploma-fire-industrial-safety'],
    'Diploma in Oil & Gas Safety Engineering': bySlug['diploma-oil-gas-safety'],
    'Diploma in Drilling & Rig Safety Management': bySlug['diploma-drilling-rig-safety'],
    'Diploma in Food Safety & Quality Management': bySlug['diploma-food-safety-quality'],
    'Diploma in Industrial Safety Engineering': bySlug['diploma-industrial-safety'],
    'Advanced Diploma in Fire & Industrial Safety Engineering': bySlug['adv-diploma-fire-industrial-safety'],
    'Advanced Diploma in Oil & Gas Safety Engineering': bySlug['adv-diploma-oil-gas-safety'],
    'Advanced Diploma in Drilling & Rig Safety Management': bySlug['adv-diploma-drilling-rig-safety'],
    'Advanced Diploma in Food Safety & Quality Management': bySlug['adv-diploma-food-safety-quality'],
    'Advanced Diploma in Industrial Safety Engineering': bySlug['adv-diploma-industrial-safety'],
    'Fire Safety & Emergency Response Training': bySlug['corp-fire-safety-emergency-response'],
    'First Aid & CPR Training': bySlug['corp-first-aid-cpr'],
    'Permit to Work (PTW) Training': bySlug['corp-permit-to-work'],
    'Hot Work Safety & Fire Prevention Training': bySlug['corp-hot-work-safety'],
    'Hazard Identification & Risk Assessment (HIRA) Training': bySlug['corp-hira-training'],
    'Job Safety Analysis (JSA) Training': bySlug['corp-job-safety-analysis'],
    'MSDS / SDS Interpretation & Chemical Safety Training': bySlug['corp-msds-sds-chemical-safety'],
    'Chemical Safety & Hazard Management Training': bySlug['corp-chemical-safety-hazard-mgmt'],
    'Working at Height Competency Training': bySlug['corp-working-at-height'],
    'Advanced Scaffolding Inspection Training': bySlug['corp-scaffolding-inspection'],
    'Confined Space Entry & Emergency Response Training': bySlug['corp-confined-space-entry'],
    'Crane Safety & Lifting Operations Training': bySlug['corp-crane-safety-lifting'],
    'Rigging, Slinging & Load Handling Training': bySlug['corp-rigging-slinging-load'],
    'Banksman, Signalman & Lifting Operations Training': bySlug['corp-banksman-signalman-lifting'],
    'Forklift Operator Safety Training': bySlug['corp-forklift-operator-safety'],
    'Energy Isolation & Lockout Tagout (LOTO) Training': bySlug['corp-loto-energy-isolation'],
    'Electrical Safety & Risk Management Training': bySlug['corp-electrical-safety-risk'],
    'Arc Flash Protection & Safe Work Practices Training': bySlug['corp-arc-flash-protection'],
    'H2S Detection & Emergency Response Training': bySlug['corp-h2s-detection-emergency'],
    'Incident Investigation Training': bySlug['corp-incident-investigation'],
    'Behaviour Based Safety (BBS) Training': bySlug['corp-behaviour-based-safety'],
    'Emergency Response, Rescue & Crisis Management Training': bySlug['corp-emergency-response-rescue'],
    'Process Safety Management (PSM) Training': bySlug['corp-process-safety-mgmt'],
    'Process Hazard Analysis (HAZOP) Training': bySlug['corp-hazop-process-hazard'],
  };

  function pathFor(fileName) {
    return fileName ? base + fileName : '';
  }

  function normalizeName(name) {
    return String(name || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  const normalizedNames = Object.fromEntries(
    Object.entries(byName).map(([name, fileName]) => [normalizeName(name), fileName])
  );

  function get(course) {
    if (!course) return '';
    const label = course.name || course.title;
    const fileName = bySlug[course.slug] || normalizedNames[normalizeName(label)] || (!label ? byId[Number(course.id)] : '');
    return pathFor(fileName);
  }

  function hydrateCourseCardImages(root) {
    const host = root || document;
    host.querySelectorAll('.course-card').forEach((card) => {
      const link = card.querySelector('a[href*="course-detail.html#course="]');
      const slug = link ? new URL(link.href, location.href).hash.replace(/^#course=/, '') : '';
      const title = card.querySelector('h3')?.textContent || '';
      const image = get({ slug, title });
      const imageBox = card.querySelector('.course-image');
      if (!image || !imageBox) return;
      imageBox.style.backgroundImage = `linear-gradient(0deg, rgba(7,27,50,.12), rgba(7,27,50,.12)), url("${image}")`;
      imageBox.style.backgroundSize = 'cover';
      imageBox.style.backgroundPosition = 'center';
    });
  }

  window.NAISFT_COURSE_IMAGES = { bySlug, byId, byName, get, hydrateCourseCardImages };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hydrateCourseCardImages());
  } else {
    hydrateCourseCardImages();
  }
})();
