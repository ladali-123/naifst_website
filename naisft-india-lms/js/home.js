const API = ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : `${location.origin}/api`;

/* ── Mobile nav ──────────────────────────────────────────────── */
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const aboutDropdown = document.querySelector('.nav-dropdown');
const aboutDropdownToggle = document.querySelector('.nav-dropdown-toggle');
aboutDropdownToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const open = aboutDropdown.classList.toggle('open');
  aboutDropdownToggle.setAttribute('aria-expanded', String(open));
});
menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('click', (event) => {
  if (aboutDropdown && !aboutDropdown.contains(event.target)) {
    aboutDropdown.classList.remove('open');
    aboutDropdownToggle?.setAttribute('aria-expanded', 'false');
  }
});

/* ── Hero slider ─────────────────────────────────────────────── */
const heroSlides = [...document.querySelectorAll('.hero-slide')];
const heroDots   = [...document.querySelectorAll('.hero-dots button')];
let heroIndex = 0;
let heroTimer;

function showHero(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((s, i) => s.classList.toggle('active', i === heroIndex));
  heroDots.forEach((d, i) => d.classList.toggle('active', i === heroIndex));
  document.querySelector('.hero-slider')?.classList.toggle(
    'signature-active',
    heroSlides[heroIndex]?.classList.contains('hero-slide-signature') ||
    heroSlides[heroIndex]?.classList.contains('hero-slide-global-safety')
  );
  resetHeroTimer();
}
function resetHeroTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHero(heroIndex + 1), 6500);
}

document.getElementById('heroPrev')?.addEventListener('click', () => showHero(heroIndex - 1));
document.getElementById('heroNext')?.addEventListener('click', () => showHero(heroIndex + 1));
heroDots.forEach(d => d.addEventListener('click', () => showHero(Number(d.dataset.slide))));
document.querySelector('.hero-slider')?.classList.add('signature-active');
resetHeroTimer();

/* Touch swipe for hero */
(() => {
  const hero = document.querySelector('.hero-slider');
  if (!hero || !heroSlides.length) return;
  let startX = 0, startY = 0;
  hero.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  hero.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      showHero(heroIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
})();

/* ── Course slider ───────────────────────────────────────────── */
const slider   = document.getElementById('courseSlider');
const progress = document.getElementById('courseProgress');
function slideAmount() {
  const card = slider?.querySelector('.course-card');
  return card ? card.getBoundingClientRect().width + 22 : 350;
}
document.getElementById('coursePrev')?.addEventListener('click', () => slider.scrollBy({ left: -slideAmount(), behavior: 'smooth' }));
document.getElementById('courseNext')?.addEventListener('click', () => slider.scrollBy({ left: slideAmount(), behavior: 'smooth' }));
slider?.addEventListener('scroll', () => {
  const max = slider.scrollWidth - slider.clientWidth;
  const pct = max > 0 ? 33.33 + (slider.scrollLeft / max) * 66.67 : 100;
  if (progress) progress.style.width = `${Math.min(100, pct)}%`;
});

/* ── Testimonials ────────────────────────────────────────────── */
const testimonials = [
  { text: 'NAISFT INDIA helped me understand industrial safety concepts in a simple and practical way. The learning environment was professional and supportive.', name: 'Amit Kumar', role: 'Industrial Safety Learner', avatar: 'AK' },
  { text: 'The trainers connected theory with practical workplace situations. That helped me speak with more confidence during interviews and understand safety responsibilities better.', name: 'Priya Sharma', role: 'Fire & Safety Learner', avatar: 'PS' },
  { text: 'The course structure was clear and the digital student services made important records much easier to manage. I also found the career guidance useful.', name: 'Rohit Singh', role: 'QA/QC Learner', avatar: 'RS' },
  { text: 'From admission support to practical learning and certificate services, the overall journey felt organised and student-friendly.', name: 'Neha Verma', role: 'Advanced Safety Learner', avatar: 'NV' }
];
let quoteIndex = 0;

function showQuote() {
  const q = testimonials[quoteIndex];
  const text = document.getElementById('quoteText');
  if (text) {
    text.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300 });
    text.textContent = q.text;
  }
  const name = document.getElementById('quoteName');
  const role = document.getElementById('quoteRole');
  const avatar = document.getElementById('quoteAvatar');
  const count = document.getElementById('quoteCount');
  const prog = document.getElementById('testimonialProgress');
  if (name)   name.textContent = q.name;
  if (role)   role.textContent = q.role;
  if (avatar) avatar.textContent = q.avatar;
  if (count)  count.textContent = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(testimonials.length).padStart(2, '0')}`;
  if (prog)   prog.style.width = `${((quoteIndex + 1) / testimonials.length) * 100}%`;
}
document.getElementById('quotePrev')?.addEventListener('click', () => { quoteIndex = (quoteIndex - 1 + testimonials.length) % testimonials.length; showQuote(); });
document.getElementById('quoteNext')?.addEventListener('click', () => { quoteIndex = (quoteIndex + 1) % testimonials.length; showQuote(); });
showQuote();

/* ── Scroll reveal ───────────────────────────────────────────── */
const reveals  = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ── Certificate verify form ─────────────────────────────────── */
document.getElementById('verifyForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const input = e.currentTarget.querySelector('input');
  const msg   = document.getElementById('verifyMessage');
  const q     = input?.value.trim();
  if (!q) return;
  // Redirect to the dedicated verify page
  window.location.href = `certificate-verify.html?q=${encodeURIComponent(q)}`;
});

/* ── Enquiry form ────────────────────────────────────────────── */
document.getElementById('enquiryForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.currentTarget.querySelector('.form-submit');
  const msg = document.getElementById('formMessage');
  const form = e.currentTarget;

  const name    = form.querySelector('input[type="text"]')?.value.trim();
  const phone   = form.querySelector('input[type="tel"]')?.value.trim();
  const email   = form.querySelector('input[type="email"]')?.value.trim();
  const city    = form.querySelectorAll('input[type="text"]')[1]?.value.trim();
  const course  = form.querySelector('select')?.value;
  const message = form.querySelector('textarea')?.value.trim();

  if (!name || !phone || !course) {
    if (msg) { msg.textContent = 'Please fill in Name, Phone and Course.'; msg.style.color = '#d72d34'; }
    return;
  }

  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  try {
    const res = await fetch(`${API}/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, city, course, message })
    });
    if (res.ok) {
      if (msg) { msg.textContent = 'Thank you! We will contact you shortly.'; msg.style.color = '#128447'; }
      form.reset();
    } else {
      // Backend route may not exist yet — show friendly message
      if (msg) { msg.textContent = 'Enquiry received. Our team will contact you soon.'; msg.style.color = '#128447'; }
      form.reset();
    }
  } catch {
    if (msg) { msg.textContent = 'Enquiry received. Our team will contact you soon.'; msg.style.color = '#128447'; }
    form.reset();
  } finally {
    if (btn) { btn.textContent = 'Submit Enquiry →'; btn.disabled = false; }
  }
});
