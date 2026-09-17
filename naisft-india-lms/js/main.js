document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const header = document.querySelector(".site-header");

  function closeNav() {
    if (!menuToggle || !mainNav) return;
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = mainNav.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (!menuToggle.contains(event.target) && !mainNav.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  if (header) {
    const syncHeader = () => header.classList.toggle("scrolled", window.scrollY > 10);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("#")) link.classList.toggle("active", href === page);
  });

  document.querySelectorAll("form.ajax-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector("[type='submit']");
      if (!button) return;

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Submitting...";

      setTimeout(() => {
        button.textContent = "Submitted Successfully";
        button.style.background = "#188a3f";

        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
          button.style.background = "";
          form.reset();
        }, 1800);
      }, 800);
    });
  });

  document.querySelectorAll(".testimonial").forEach((testimonial) => {
    const slider = testimonial.querySelector(".testimonial-slider");
    const slides = Array.from(testimonial.querySelectorAll(".testimonial-slide"));
    const dots = Array.from(testimonial.querySelectorAll(".testimonial-dots span"));
    const previous = testimonial.querySelector(".testimonial-btn.prev");
    const next = testimonial.querySelector(".testimonial-btn.next");
    if (!slider || !slides.length) return;

    const setActiveDot = () => {
      const active = Math.round(slider.scrollLeft / slider.clientWidth);
      dots.forEach((dot, index) => dot.classList.toggle("active", index === active));
    };

    const move = (direction) => {
      const active = Math.round(slider.scrollLeft / slider.clientWidth);
      const target = (active + direction + slides.length) % slides.length;
      slider.scrollTo({ left: target * slider.clientWidth, behavior: "smooth" });
    };

    previous?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
    slider.addEventListener("scroll", setActiveDot, { passive: true });
    window.addEventListener("resize", setActiveDot);
    setActiveDot();
  });
});
