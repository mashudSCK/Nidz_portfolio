/**
 * Nidzaree A. Maulana – Portfolio  |  script.js
 * ─────────────────────────────────────────────
 * Features:
 *  1. AOS (Animate On Scroll) initialisation
 *  2. Sticky navbar shadow on scroll
 *  3. Active nav-link highlight on scroll (IntersectionObserver)
 *  4. Hamburger / mobile menu toggle
 *  5. Close mobile menu on link click
 *  6. Scroll-to-top button show / hide
 *  7. Contact form validation + EmailJS send
 *  8. Smooth scroll polyfill safety
 */

/* ── EmailJS configuration ───────────────────────────────────
   Replace the three placeholder strings below with the real
   values from your EmailJS dashboard:
     https://dashboard.emailjs.com/admin
   ─────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = "n6xcTrw9Up6lfLqHo";   // Account → General
const EMAILJS_SERVICE_ID  = "service_shxd1xi";   // Email Services
const EMAILJS_TEMPLATE_ID = "template_ong3cbz";  // Email Templates

"use strict";

/* ── 1. AOS initialisation + EmailJS init ───────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // If AOS CDN loaded successfully, initialise it
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 700,
      once: true,
      offset: 80,
      easing: "ease-out-cubic",
    });
  } else {
    // Fallback: AOS CDN failed – remove data-aos so elements are visible
    document.querySelectorAll("[data-aos]").forEach((el) => {
      el.removeAttribute("data-aos");
    });
  }

  // Initialise EmailJS only if the SDK loaded successfully
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
});

/* ── Wait for full DOM ───────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {

  /* ────────────────────────────────────────────────────────
     2. Sticky navbar – add shadow when user scrolls down
  ──────────────────────────────────────────────────────── */
  const navbar = document.getElementById("navbar");

  const handleNavbarScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load in case page is refreshed mid-scroll


  /* ────────────────────────────────────────────────────────
     3. Active nav link highlight via IntersectionObserver
  ──────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  /**
   * Given a section id, mark the corresponding nav links as active
   * and remove the mark from all others.
   * @param {string} id
   */
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${id}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      root: null,
      // Top margin: negative value = fires when section is near top of viewport
      rootMargin: "-30% 0px -65% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));


  /* ────────────────────────────────────────────────────────
     4. Hamburger / Mobile Menu Toggle
  ──────────────────────────────────────────────────────── */
  const menuBtn    = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  /**
   * Open or close the mobile menu.
   * @param {boolean} forceClose – if true, always close
   */
  const toggleMenu = (forceClose = false) => {
    const isOpen = mobileMenu.classList.contains("open");

    if (forceClose || isOpen) {
      // Close
      mobileMenu.classList.remove("open");
      mobileMenu.classList.add("hidden");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuBtn.setAttribute("aria-expanded", "false");
    } else {
      // Open
      mobileMenu.classList.remove("hidden");
      // Small timeout so the element is rendered before transition starts
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mobileMenu.classList.add("open");
        });
      });
      mobileMenu.setAttribute("aria-hidden", "false");
      menuBtn.setAttribute("aria-expanded", "true");
    }
  };

  menuBtn.addEventListener("click", () => toggleMenu());

  // Close menu when pressing Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleMenu(true);
    }
  });


  /* ────────────────────────────────────────────────────────
     5. Close mobile menu when a mobile nav link is clicked
  ──────────────────────────────────────────────────────── */
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleMenu(true);
    });
  });


  /* ────────────────────────────────────────────────────────
     6. Scroll-to-top button
  ──────────────────────────────────────────────────────── */
  const scrollTopBtn = document.getElementById("scroll-top");

  const handleScrollTopVisibility = () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  };

  window.addEventListener("scroll", handleScrollTopVisibility, { passive: true });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  /* ────────────────────────────────────────────────────────
     7. Contact form validation
  ──────────────────────────────────────────────────────── */
  const form        = document.getElementById("contact-form");
  const nameInput   = document.getElementById("name");
  const emailInput  = document.getElementById("email");
  const msgInput    = document.getElementById("message");
  const nameError   = document.getElementById("name-error");
  const emailError  = document.getElementById("email-error");
  const msgError    = document.getElementById("message-error");
  const successMsg  = document.getElementById("form-success");
  const submitBtn   = document.getElementById("submit-btn");

  /**
   * Validate a single field and toggle its error state.
   * @param {HTMLElement} field
   * @param {HTMLElement} errorEl
   * @param {function(string): boolean} testFn
   * @returns {boolean} true = valid
   */
  const validateField = (field, errorEl, testFn) => {
    const value = field.value.trim();
    const valid = testFn(value);

    if (!valid) {
      field.classList.add("error");
      errorEl.classList.remove("hidden");
      // ARIA: associate the error message with the input
      field.setAttribute("aria-describedby", errorEl.id);
    } else {
      field.classList.remove("error");
      errorEl.classList.add("hidden");
      field.removeAttribute("aria-describedby");
    }

    return valid;
  };

  /** Basic email regex */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /** Live validation (on blur, so feedback appears after leaving the field) */
  nameInput.addEventListener("blur", () => {
    validateField(nameInput, nameError, (v) => v.length >= 2);
  });
  emailInput.addEventListener("blur", () => {
    validateField(emailInput, emailError, (v) => emailRegex.test(v));
  });
  msgInput.addEventListener("blur", () => {
    validateField(msgInput, msgError, (v) => v.length >= 10);
  });

  /** Clear error styles as soon as the user starts typing again */
  [nameInput, emailInput, msgInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
    });
  });

  /** Form submit handler */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameValid  = validateField(nameInput,  nameError,  (v) => v.length >= 2);
    const emailValid = validateField(emailInput, emailError, (v) => emailRegex.test(v));
    const msgValid   = validateField(msgInput,   msgError,   (v) => v.length >= 10);

    if (!nameValid || !emailValid || !msgValid) {
      // Focus first invalid field for accessibility
      if (!nameValid)  { nameInput.focus();  return; }
      if (!emailValid) { emailInput.focus(); return; }
      if (!msgValid)   { msgInput.focus();   return; }
      return;
    }

    // ── All valid – send via EmailJS ────────────────────
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Sending…
    `;

    // Template parameters – must match the variable names in your EmailJS template
    const templateParams = {
      from_name:  nameInput.value.trim(),
      from_email: emailInput.value.trim(),
      message:    msgInput.value.trim(),
    };

    if (typeof emailjs === "undefined") {
      alert("Sorry, the email service failed to load. Please email nidzareem@gmail.com directly.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="ri-send-plane-fill" aria-hidden="true"></i> Send Message`;
      return;
    }

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        // Success
        form.reset();
        successMsg.classList.remove("hidden");
        successMsg.classList.add("flex");

        // Auto-hide success message after 5 s
        setTimeout(() => {
          successMsg.classList.add("hidden");
          successMsg.classList.remove("flex");
        }, 5000);
      })
      .catch((error) => {
        // Show a user-friendly error without leaking internals
        console.error("EmailJS error:", error);
        alert("Sorry, something went wrong sending your message. Please try emailing nidzareem@gmail.com directly.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="ri-send-plane-fill" aria-hidden="true"></i> Send Message`;
      });
  });


  /* ────────────────────────────────────────────────────────
     8. Smooth scroll fallback for browsers that don't
        support CSS scroll-behavior natively (rare in 2026)
  ──────────────────────────────────────────────────────── */
  if (!("scrollBehavior" in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

}); // end DOMContentLoaded
