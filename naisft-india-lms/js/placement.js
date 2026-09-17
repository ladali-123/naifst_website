(() => {
  const API = ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : `${location.origin}/api`;

  // Mobile menu toggle
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

  // Scroll reveal (uses 'in-view' class as per design CSS)
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }

  // Placement registration form
  const placementForm = document.getElementById('placementForm');
  const formStatus = document.getElementById('formStatus');
  if (placementForm && formStatus) {
    placementForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!placementForm.checkValidity()) {
        placementForm.reportValidity();
        return;
      }

      const submitBtn = placementForm.querySelector('.form-submit');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      const data = { enquiryType: 'Placement' };
      new FormData(placementForm).forEach((value, key) => { data[key] = value; });

      try {
        const res = await fetch(API + '/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Registration submitted. Our placement team will review your profile and be in touch shortly.';
          placementForm.reset();
        } else {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Server error. Please try again or call +91 98356 27522.');
        }
      } catch (err) {
        formStatus.className = 'form-status error';
        formStatus.textContent = err.message || 'Could not submit. Please call +91 98356 27522 or email info@naisftindia.com.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }
})();
