const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const aboutDropdown = document.querySelector('.nav-dropdown');
const aboutDropdownToggle = document.querySelector('.nav-dropdown-toggle');
aboutDropdownToggle?.setAttribute('aria-expanded', 'false');
aboutDropdownToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const open = aboutDropdown.classList.toggle('open');
  aboutDropdownToggle.setAttribute('aria-expanded', String(open));
});
menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('click', (event) => {
  if (aboutDropdown && !aboutDropdown.contains(event.target)) {
    aboutDropdown.classList.remove('open');
    aboutDropdownToggle?.setAttribute('aria-expanded', 'false');
  }
});

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
reveals.forEach((el) => revealObserver.observe(el));
