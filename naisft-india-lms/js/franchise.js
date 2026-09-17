(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const preferredModel = document.getElementById('preferredModel');
  document.querySelectorAll('.package-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (preferredModel) preferredModel.value = btn.dataset.package || '';
      document.getElementById('franchise-enquiry')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const tabs = document.querySelectorAll('.support-tab');
  const panels = document.querySelectorAll('.support-tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const alreadyOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const mark = i.querySelector('button b');
        if (mark) mark.textContent = '+';
      });
      if (!alreadyOpen) {
        item.classList.add('active');
        const mark = item.querySelector('button b');
        if (mark) mark.textContent = '−';
      }
    });
  });


  // Interactive franchise approval journey.
  const processSteps = [
    {
      title: 'Submit your franchise enquiry',
      description: 'Share your contact details, preferred city or district, and the type of training center you plan to build. This gives the franchise team the basic context needed for the first conversation.',
      checklist: ['Basic applicant and contact details', 'Preferred city, district or territory', 'Initial center and business intent']
    },
    {
      title: 'Discuss goals and partnership fit',
      description: 'The franchise team discusses your local market, existing setup, expansion plan and preferred partnership model so both sides can understand the opportunity before formal review.',
      checklist: ['Center goals and target market', 'Partnership model discussion', 'Questions on operations and support']
    },
    {
      title: 'Review the proposed location',
      description: 'The proposed center location and territory are reviewed in the context of accessibility, local demand, operating suitability and availability under the partnership framework.',
      checklist: ['Location and catchment review', 'Territory availability check', 'Center readiness discussion']
    },
    {
      title: 'Submit the required documents',
      description: 'Provide the applicant, identity, address, center and business documents requested for verification. The exact document set can vary according to the approved partnership model.',
      checklist: ['Identity and address proofs', 'Center or property documents', 'Business and bank details, where applicable']
    },
    {
      title: 'Complete agreement and payment formalities',
      description: 'After approval, the selected partnership terms are documented and the applicable commercial formalities are completed according to the proposal and agreement shared with the applicant.',
      checklist: ['Review approved proposal', 'Complete agreement formalities', 'Complete applicable payment process']
    },
    {
      title: 'Activate the franchise portal',
      description: 'The approved partner receives portal access and operating guidance for student admissions, learner records, reporting and the certificate-request workflow.',
      checklist: ['Portal credentials and orientation', 'Student admission workflow', 'Certificate-request and reporting process']
    },
    {
      title: 'Prepare and launch the center',
      description: 'Use the approved brand resources, center-launch guidance, staff orientation and admission-support materials to prepare the center for student counselling and training operations.',
      checklist: ['Branding and launch guidance', 'Staff and counselling orientation', 'Admission campaign support']
    },
    {
      title: 'Continue with operating support',
      description: 'After launch, the partner continues to receive guidance for counselling, portal use, reporting, certificate requests and other operating processes covered by the partnership model.',
      checklist: ['Ongoing counselling guidance', 'Reporting and portal support', 'Certificate-request workflow support']
    }
  ];

  const processButtons = [...document.querySelectorAll('.process-step')];
  const processTitle = document.getElementById('processTitle');
  const processDescription = document.getElementById('processDescription');
  const processChecklist = document.getElementById('processChecklist');
  const processCounter = document.getElementById('processCounter');
  const processPercent = document.getElementById('processPercent');
  const processProgress = document.getElementById('processProgress');
  const processPrev = document.getElementById('processPrev');
  const processNext = document.getElementById('processNext');
  let activeProcessStep = 0;

  function renderProcessStep(index, scrollIntoView = false) {
    if (!processButtons.length || !processTitle || !processDescription || !processChecklist) return;
    activeProcessStep = (index + processSteps.length) % processSteps.length;
    const data = processSteps[activeProcessStep];
    processButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === activeProcessStep;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    processTitle.textContent = data.title;
    processDescription.textContent = data.description;
    processChecklist.innerHTML = data.checklist.map(item => `<li>${item}</li>`).join('');
    const shownIndex = String(activeProcessStep + 1).padStart(2, '0');
    const percentage = Math.round(((activeProcessStep + 1) / processSteps.length) * 100);
    if (processCounter) processCounter.textContent = `${shownIndex} / 08`;
    if (processPercent) processPercent.textContent = `${percentage}%`;
    if (processProgress) processProgress.style.setProperty('--progress', `${percentage}%`);
    if (scrollIntoView) processButtons[activeProcessStep]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  processButtons.forEach((button, index) => {
    button.addEventListener('click', () => renderProcessStep(index, true));
  });
  processPrev?.addEventListener('click', () => renderProcessStep(activeProcessStep - 1, true));
  processNext?.addEventListener('click', () => renderProcessStep(activeProcessStep + 1, true));

  const form = document.getElementById('franchiseForm');
  const message = document.getElementById('franchiseMessage');
  if (form && message) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      const data = Object.fromEntries(new FormData(form));
      try {
        const res = await fetch(((['localhost','127.0.0.1'].includes(location.hostname)?'http://localhost:5000':location.origin)+'/api/franchise-enquiry'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          message.textContent = 'Thank you! Your franchise enquiry has been received. Our team will contact you shortly.';
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        message.textContent = 'Enquiry noted. Please also reach us at info@naisftindia.com or +91 98356 27522.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Enquiry <span>→</span>';
      }
    });
  }
})();
