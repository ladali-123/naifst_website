(() => {
  const API = ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : `${location.origin}/api`;

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Scroll reveal
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

  // Enquiry type selector and dynamic fields
  const typeButtons = [...document.querySelectorAll('.type-btn')];
  const enquiryType = document.getElementById('enquiryType');
  const dynamicFields = [...document.querySelectorAll('.dynamic-field')];

  function setType(type, shouldScroll = false) {
    if (enquiryType) enquiryType.value = type;
    typeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
    dynamicFields.forEach(field => field.classList.toggle('hidden', field.dataset.for !== type));
    if (shouldScroll) document.getElementById('smart-enquiry')?.scrollIntoView({ behavior: 'smooth' });
  }

  typeButtons.forEach(button => button.addEventListener('click', () => setType(button.dataset.type || 'Admission')));
  document.querySelectorAll('[data-type]:not(.type-btn)').forEach(button => {
    button.addEventListener('click', event => {
      if (button.tagName === 'A' && button.getAttribute('href')) return;
      event.preventDefault();
      setType(button.dataset.type || 'Admission', true);
    });
  });

  // FAQ accordion
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

  // Contact form submission
  const form = document.getElementById('contactForm');
  const message = document.getElementById('contactFormMessage');
  if (form && message) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('.form-submit');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      message.className = 'form-message';
      message.textContent = '';

      const data = {};
      new FormData(form).forEach((value, key) => { data[key] = value; });

      try {
        const res = await fetch(API + '/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          message.className = 'form-message success';
          message.textContent = 'Your enquiry has been received. Our team will contact you shortly.';
          form.reset();
          setType('Admission');
        } else {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Server error. Please try again or call +91 98356 27522.');
        }
      } catch (err) {
        message.className = 'form-message error';
        message.textContent = err.message || 'Could not send enquiry. Please call +91 98356 27522 or email info@naisftindia.com.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }
})();
