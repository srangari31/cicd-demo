/* =========================================================
   AxiomTechguru ACADEMY — SCRIPT
   Vanilla JS only. No jQuery, no framework.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     0. AUTH CREDENTIALS
  --------------------------------------------------------- */
  const AUTH_KEY = "currentUser";
  const USERS_FILE = "users.json";
  const THEME_KEY = "cf_theme";

  /* ---------------------------------------------------------
     1. PRELOADER
  --------------------------------------------------------- */
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(function () {
        preloader.classList.add("cf-hide");
      }, 400);
    }
  });

  /* ---------------------------------------------------------
     2. THEME TOGGLE (Dark / Light) with localStorage
  --------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)",
      ).matches;
      applyTheme(prefersLight ? "light" : "dark");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------------------------------------------------
     3. TOAST NOTIFICATIONS
  --------------------------------------------------------- */
  function showToast(message, type) {
    type = type || "success";
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const iconMap = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
    };
    const colorMap = {
      success: "#17D9C4",
      error: "#FF6B6B",
      info: "#7C5CFF",
    };

    const toastEl = document.createElement("div");
    toastEl.className = "toast cf-toast";
    toastEl.setAttribute("role", "alert");
    toastEl.innerHTML =
      '<div class="toast-header">' +
      '<i class="bi ' +
      (iconMap[type] || iconMap.success) +
      ' me-2" style="color:' +
      (colorMap[type] || colorMap.success) +
      '"></i>' +
      '<strong class="me-auto">AxiomTechguru</strong>' +
      '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' +
      "</div>" +
      '<div class="toast-body">' +
      message +
      "</div>";

    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3800 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", function () {
      toastEl.remove();
    });
  }

  /* ---------------------------------------------------------
     4. AUTHENTICATION (LocalStorage based, no backend)
  --------------------------------------------------------- */
  const authGuest = document.getElementById("authGuest");
  const authUser = document.getElementById("authUser");
  const userAvatar = document.getElementById("userAvatar");
  const userNameLabel = document.getElementById("userNameLabel");
  const loginForm = document.getElementById("loginForm");
  const loginModalEl = document.getElementById("loginModal");
  const logoutBtn = document.getElementById("logoutBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");

  function getStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function renderAuthState() {
    const user = getStoredUser();
    if (user) {
      authGuest.classList.add("d-none");
      authUser.classList.remove("d-none");
      const initial = (user.name || "U").trim().charAt(0).toUpperCase();
      // Prefer the stored user image; fall back to the local Profile image
      const avatarSrc = user.image || "assets/images/Profile.png";
      if (avatarSrc) {
        userAvatar.textContent = "";
        userAvatar.style.backgroundImage = `url(${avatarSrc})`;
        userAvatar.style.backgroundSize = "cover";
        userAvatar.style.backgroundPosition = "center";
      } else {
        userAvatar.style.backgroundImage = "";
        userAvatar.textContent = initial;
      }
      userNameLabel.textContent = user.name;
      if (dashboardBtn) {
        dashboardBtn.href = "dashboard.html";
      }
    } else {
      authGuest.classList.remove("d-none");
      authUser.classList.add("d-none");
    }
  }

  async function login(email, password) {
    try {
      const response = await fetch(USERS_FILE);

      const users = await response.json();

      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (!user) return false;

      localStorage.setItem(AUTH_KEY, JSON.stringify(user));

      renderAuthState();

      return true;
    } catch (error) {
      console.error(error);

      showToast("Unable to load users.json", "error");

      return false;
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    renderAuthState();
    window.location.href = "index.html";
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("loginEmail");
      const passInput = document.getElementById("loginPassword");
      let valid = true;

      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        valid = false;
      } else {
        emailInput.classList.remove("is-invalid");
      }

      // Password validation
      if (passInput.value.trim().length < 6) {
        passInput.classList.add("is-invalid");
        valid = false;
      } else {
        passInput.classList.remove("is-invalid");
      }

      if (!valid) return;

      const success = await login(
        emailInput.value.trim(),
        passInput.value.trim(),
      );

      if (success) {
        const modal = bootstrap.Modal.getInstance(loginModalEl);
        if (modal) modal.hide();
        loginForm.reset();
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);
      } else {
        passInput.classList.add("is-invalid");
        showToast(
          "Invalid credentials. Try the demo login shown below.",
          "error",
        );
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "dashboard.html";
    });
  }

  // Restore auth state on load
  renderAuthState();

  /* ---------------------------------------------------------
     5. NAVBAR: scroll state, active link, smooth scroll
  --------------------------------------------------------- */
  const navbar = document.getElementById("mainNavbar");
  const navLinks = document.querySelectorAll(".cf-nav-links .nav-link");
  const sections = document.querySelectorAll("section[id], header[id]");
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const revealEls = document.querySelectorAll(".cf-reveal");

  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar background state
    if (navbar) {
      navbar.classList.toggle("cf-scrolled", scrollY > 40);
    }

    // Scroll progress bar
    if (scrollProgress) {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + "%";
    }

    // Back to top visibility
    if (backToTop) {
      backToTop.classList.toggle("cf-show", scrollY > 500);
    }

    // Active nav link based on section in view
    let currentId = "";
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (scrollY >= top) {
        currentId = section.getAttribute("id");
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + currentId) {
        link.classList.add("active");
      }
    });

    // Reveal on scroll
    revealOnScroll();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Collapse mobile nav on link click
  document.querySelectorAll(".cf-nav-links .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      const navCollapse = document.getElementById("navMain");
      if (navCollapse && navCollapse.classList.contains("show")) {
        const bsCollapse =
          bootstrap.Collapse.getInstance(navCollapse) ||
          new bootstrap.Collapse(navCollapse);
        bsCollapse.hide();
      }
    });
  });

  /* ---------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS (fade-up/left/right/zoom)
  --------------------------------------------------------- */
  function revealOnScroll() {
    const triggerPoint = window.innerHeight * 0.88;
    revealEls.forEach(function (el) {
      if (el.classList.contains("cf-visible")) return;
      const rect = el.getBoundingClientRect();
      const shouldReveal =
        rect.top < triggerPoint || rect.top < window.innerHeight;
      if (shouldReveal) {
        const delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
        setTimeout(function () {
          el.classList.add("cf-visible");
        }, delay);
      }
    });
  }

  function revealAllImmediately() {
    revealEls.forEach(function (el) {
      el.classList.add("cf-visible");
    });
  }

  revealOnScroll();
  window.addEventListener("load", function () {
    revealOnScroll();
    setTimeout(revealAllImmediately, 120);
  });
  window.addEventListener("resize", revealOnScroll);

  /* ---------------------------------------------------------
     7. TYPING EFFECT (hero terminal)
  --------------------------------------------------------- */
  const typedTextEl = document.getElementById("typedText");
  const typingPhrases = [
    "npm run learn --track=fullstack",
    "python train_model.py --epochs 50",
    "kubectl apply -f deployment.yaml",
    'git commit -m "shipped my first project"',
  ];

  function startTypingEffect() {
    if (!typedTextEl) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const currentPhrase = typingPhrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typedTextEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex === currentPhrase.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        typedTextEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }
  startTypingEffect();

  /* ---------------------------------------------------------
     8. COUNTER ANIMATION (stats + counter section)
  --------------------------------------------------------- */
  const counterEls = document.querySelectorAll("[data-counter]");
  let countersStarted = false;

  function animateCounters() {
    if (countersStarted) return;
    countersStarted = true;

    counterEls.forEach(function (el) {
      const target = parseInt(el.getAttribute("data-counter"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1800;
      const startTime = performance.now();

      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Trigger counters when hero (or counter section) enters view
  const counterObserverTargets = document.querySelectorAll(
    ".cf-hero-stats, .cf-counter-section",
  );
  if ("IntersectionObserver" in window && counterObserverTargets.length) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
          }
        });
      },
      { threshold: 0.3 },
    );
    counterObserverTargets.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    animateCounters();
  }

  /* ---------------------------------------------------------
     9. BUTTON RIPPLE EFFECT
  --------------------------------------------------------- */
  document
    .querySelectorAll(".cf-btn-gradient, .cf-btn-outline, .cf-btn-ghost")
    .forEach(function (btn) {
      btn.style.position = btn.style.position || "relative";
      btn.style.overflow = "hidden";
      btn.addEventListener("click", function (e) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ripple.className = "cf-ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        btn.appendChild(ripple);
        setTimeout(function () {
          ripple.remove();
        }, 650);
      });
    });

  /* ---------------------------------------------------------
     10. CARD TILT EFFECT (feature / course cards)
  --------------------------------------------------------- */
  const tiltCards = document.querySelectorAll(
    ".cf-feature-card, .cf-course-card, .cf-why-card",
  );
  const isTouchDevice = window.matchMedia("(hover: none)").matches;

  if (!isTouchDevice) {
    tiltCards.forEach(function (card) {
      card.classList.add("cf-tilt");
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y / rect.height - 0.5) * -6;
        const rotateY = (x / rect.width - 0.5) * 6;
        card.style.transform =
          "perspective(700px) rotateX(" +
          rotateX +
          "deg) rotateY(" +
          rotateY +
          "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     11. ENROLL BUTTON (demo interaction + toast)
  --------------------------------------------------------- */
  document.querySelectorAll(".cf-enroll-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".cf-course-card");
      const courseName = card
        ? card.querySelector("h3").textContent
        : "this course";
      showToast(
        'Added "' + courseName + '" to your enrollment cart.',
        "success",
      );
    });
  });

  /* ---------------------------------------------------------
     12. CONTACT FORM VALIDATION (Bootstrap-style)
  --------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (contactForm.checkValidity() === false) {
        contactForm.classList.add("was-validated");
        showToast("Please fill in all required fields correctly.", "error");
        return;
      }

      contactForm.classList.add("was-validated");
      showToast(
        "Message sent! Our advisors will reach out shortly.",
        "success",
      );
      contactForm.reset();
      contactForm.classList.remove("was-validated");
    });
  }

  /* ---------------------------------------------------------
     13. NEWSLETTER FORM VALIDATION
  --------------------------------------------------------- */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        showToast("Please enter a valid email address.", "error");
        return;
      }
      emailInput.classList.remove("is-invalid");
      showToast("Subscribed! Check your inbox for a confirmation.", "success");
      newsletterForm.reset();
    });
  }

  /* ---------------------------------------------------------
     14. FOOTER YEAR
  --------------------------------------------------------- */
  const footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     15. CLEAR VALIDATION STATE ON INPUT
  --------------------------------------------------------- */
  document.querySelectorAll("input, textarea").forEach(function (input) {
    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
    });
  });
})();
