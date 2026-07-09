"use strict";

/* =========================================================
   AXIOMTECHGURU — STUDENT DASHBOARD
   Vanilla JS only. Mirrors the auth model used in script.js
   (same localStorage key + shape) so both pages stay in sync.
   ========================================================= */
(function () {
  const AUTH_KEY = "currentUser";
  const THEME_KEY = "cf_theme";

  /* ---------------------------------------------------------
     0. AUTH GUARD — must run before anything else renders
  --------------------------------------------------------- */
  function getStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  const user = getStoredUser();
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  /* ---------------------------------------------------------
     1. THEME (kept in sync with the landing page)
  --------------------------------------------------------- */
  const root = document.documentElement;

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

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------------------------------------------------
     2. TOAST NOTIFICATIONS (same component as the landing page)
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
    const colorMap = { success: "#17D9C4", error: "#FF6B6B", info: "#7C5CFF" };

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
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", function () {
      toastEl.remove();
    });
  }

  /* ---------------------------------------------------------
     3. LOGOUT
  --------------------------------------------------------- */
  function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "index.html";
  }
  ["logoutBtn", "logoutBtnDropdown"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });
    }
  });

  /* ---------------------------------------------------------
     4. USER HEADER (avatar + name in the topbar)
  --------------------------------------------------------- */
  (function renderUserHeader() {
    document.getElementById("studentName").textContent = user.name;

    const img = document.getElementById("studentAvatarImg");
    const initial = document.getElementById("studentAvatarInitial");
    const avatarSrc = user.image || "assets/images/Profile.png";
    if (avatarSrc) {
      img.src = avatarSrc;
      img.alt = user.name || "User avatar";
      img.classList.remove("d-none");
      initial.classList.add("d-none");
    } else {
      initial.textContent = (user.name || "U").trim().charAt(0).toUpperCase();
      initial.classList.remove("d-none");
      img.classList.add("d-none");
    }
  })();

  /* ---------------------------------------------------------
     5. MOCK LEARNING DATA
     users.json only stores one enrolled course per student, so
     the rest of the LMS content below is realistic demo data
     built around that course — there is no backend to persist
     real progress against.
  --------------------------------------------------------- */
  const CATALOG = [
    {
      id: "fsd",
      name: "Full Stack Development",
      instructor: "Rohan Mehta",
      duration: "5 months",
      thumb: "cf-thumb-1",
      icon: "bi-layers-half",
      progress: 72,
    },
    {
      id: "java",
      name: "Java Programming",
      instructor: "Ananya Rao",
      duration: "4 months",
      thumb: "cf-thumb-2",
      icon: "bi-cup-hot",
      progress: 18,
    },
    {
      id: "py",
      name: "Python Development",
      instructor: "Karan Shah",
      duration: "3 months",
      thumb: "cf-thumb-3",
      icon: "bi-filetype-py",
      progress: 41,
    },
    {
      id: "ds",
      name: "Data Science",
      instructor: "Meera Iyer",
      duration: "6 months",
      thumb: "cf-thumb-4",
      icon: "bi-bar-chart-line",
      progress: 12,
    },
    {
      id: "ai",
      name: "AI & Machine Learning",
      instructor: "Vikram Nair",
      duration: "6 months",
      thumb: "cf-thumb-5",
      icon: "bi-cpu",
      progress: 8,
    },
    {
      id: "devops",
      name: "DevOps",
      instructor: "Sanya Kapoor",
      duration: "4 months",
      thumb: "cf-thumb-6",
      icon: "bi-infinity",
      progress: 5,
    },
  ];

  // Make sure the student's actual enrolled course (from users.json) leads the list.
  let enrolled = CATALOG.filter((c) => c.name === user.course);
  if (!enrolled.length) {
    enrolled = [
      {
        id: "primary",
        name: user.course || "Your Course",
        instructor: "AxiomTechguru Faculty",
        duration: "—",
        thumb: "cf-thumb-1",
        icon: "bi-mortarboard",
        progress: 65,
      },
    ];
  }
  const others = CATALOG.filter((c) => c.name !== user.course).slice(0, 2);
  const MY_COURSES = enrolled.concat(others);

  const STATS = {
    activeCourses: MY_COURSES.length,
    learningHours: 127,
    projects: 8,
    certificates: MY_COURSES.filter((c) => c.progress >= 90).length + 2,
  };

  const LIVE_CLASSES = [
    {
      title: "JavaScript Advanced",
      time: "Today · 7:00 PM",
      course: MY_COURSES[0].name,
    },
    {
      title: "REST APIs with Node.js",
      time: "Tomorrow · 6:00 PM",
      course: MY_COURSES[0].name,
    },
    {
      title: "Git & Version Control",
      time: "Fri · 5:30 PM",
      course: MY_COURSES[0].name,
    },
  ];

  const ASSIGNMENTS = [
    { title: "HTML Portfolio", due: "Due in 2 days", status: "pending" },
    { title: "JavaScript Quiz", due: "Submitted", status: "submitted" },
    { title: "Bootstrap Landing Page", due: "Graded · 92%", status: "graded" },
  ];

  const PROJECTS = [
    { title: "Netflix Clone", stack: "HTML · CSS · JS" },
    { title: "Hospital Management System", stack: "Java · MySQL" },
    { title: "Portfolio Website", stack: "Bootstrap · JS" },
  ];

  const INTERNSHIPS = [
    {
      role: "Frontend Developer",
      company: "NimbusLabs",
      location: "Remote",
      status: "open",
      icon: "bi-window-stack",
    },
    {
      role: "Python Developer",
      company: "DataForge",
      location: "Hybrid · Pune",
      status: "open",
      icon: "bi-filetype-py",
    },
    {
      role: "QA Engineer",
      company: "ByteWorks",
      location: "Remote",
      status: "applied",
      icon: "bi-bug",
    },
  ];

  const ANNOUNCEMENTS = [
    {
      title: "React Batch starts Monday",
      time: "2 hours ago",
      icon: "bi-megaphone",
    },
    {
      title: "Hackathon registration is open",
      time: "1 day ago",
      icon: "bi-trophy",
    },
    {
      title: "Placement drive with 12 companies next week",
      time: "3 days ago",
      icon: "bi-briefcase",
    },
  ];

  const ACTIVITY = [
    {
      text: "Completed lesson: Async/Await in JavaScript",
      time: "Today, 10:20 AM",
      icon: "bi-check2-circle",
    },
    {
      text: "Submitted assignment: JavaScript Quiz",
      time: "Yesterday, 6:45 PM",
      icon: "bi-journal-check",
    },
    {
      text: "Joined live class: React Fundamentals",
      time: "2 days ago",
      icon: "bi-camera-video",
    },
  ];

  /* ---------------------------------------------------------
     6. SMALL RENDER HELPERS
  --------------------------------------------------------- */
  function progressBar(pct) {
    return (
      '<div class="dash-progress"><div class="dash-progress-bar" style="width:' +
      pct +
      '%"></div></div>'
    );
  }

  function courseCard(course, showEnrollAction) {
    return (
      '<div class="col-md-6 col-lg-4">' +
      '<div class="cf-course-card h-100">' +
      '<div class="cf-course-thumb ' +
      course.thumb +
      '"><i class="bi ' +
      course.icon +
      '"></i></div>' +
      '<div class="cf-course-body">' +
      '<div class="cf-course-meta"><span><i class="bi bi-clock"></i> ' +
      course.duration +
      '</span><span class="cf-badge-level">' +
      course.instructor +
      "</span></div>" +
      "<h3>" +
      course.name +
      "</h3>" +
      '<div class="dash-course-progress">' +
      progressBar(course.progress) +
      "<span>" +
      course.progress +
      "%</span></div>" +
      '<div class="dash-course-foot">' +
      "<span>" +
      (course.progress >= 100 ? "Completed" : "In progress") +
      "</span>" +
      '<button class="btn btn-sm cf-btn-gradient dash-continue-btn" data-course="' +
      course.name +
      '">' +
      (showEnrollAction ? "Enroll" : "Continue") +
      "</button>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------
     7. PAGE TEMPLATES
  --------------------------------------------------------- */
  const pages = {
    dashboard: function () {
      const primary = MY_COURSES[0];
      const nextLive = LIVE_CLASSES[0];
      return (
        '<div class="dash-hero mb-4">' +
        "<h2>Welcome back, " +
        user.name.split(" ")[0] +
        " \u{1F44B}</h2>" +
        "<p>Continue your learning journey and complete today's goals.</p>" +
        '<button class="btn dash-goto" data-page="courses">Continue Learning</button>' +
        "</div>" +
        '<div class="row g-4 mb-4">' +
        statCard("bi-book", STATS.activeCourses, "Active Courses") +
        statCard("bi-clock-history", STATS.learningHours, "Learning Hours") +
        statCard("bi-kanban", STATS.projects, "Projects") +
        statCard("bi-patch-check", STATS.certificates, "Certificates") +
        "</div>" +
        '<div class="row g-4 mb-4">' +
        '<div class="col-lg-8">' +
        '<div class="dash-card h-100">' +
        "<h5>Continue Learning</h5>" +
        '<div class="d-flex align-items-center gap-3 mb-2">' +
        '<div class="cf-course-thumb ' +
        primary.thumb +
        '" style="width:70px;height:70px;border-radius:14px;flex-shrink:0;"><i class="bi ' +
        primary.icon +
        '"></i></div>' +
        '<div class="flex-grow-1">' +
        '<h6 class="mb-1">' +
        primary.name +
        "</h6>" +
        progressBar(primary.progress) +
        "</div>" +
        "<span>" +
        primary.progress +
        "%</span>" +
        "</div>" +
        '<button class="btn cf-btn-gradient mt-2 dash-continue-btn" data-course="' +
        primary.name +
        '">Resume Course</button>' +
        "</div>" +
        "</div>" +
        '<div class="col-lg-4">' +
        '<div class="dash-live-card">' +
        '<span class="dash-live-badge">LIVE TODAY</span>' +
        '<h5 class="mb-0">' +
        nextLive.title +
        "</h5>" +
        '<p class="mb-2">' +
        nextLive.time +
        "</p>" +
        '<button class="btn btn-sm cf-btn-gradient dash-join-btn" data-class="' +
        nextLive.title +
        '">Join Now</button>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="row g-4 mb-4">' +
        '<div class="col-lg-6">' +
        '<div class="dash-card h-100">' +
        "<h5>Recent Activity</h5>" +
        '<ul class="dash-list">' +
        ACTIVITY.map(
          (a) =>
            '<li><span class="dash-list-icon"><i class="bi ' +
            a.icon +
            '"></i></span><div><div>' +
            a.text +
            '</div><div class="dash-list-meta">' +
            a.time +
            "</div></div></li>",
        ).join("") +
        "</ul>" +
        "</div>" +
        "</div>" +
        '<div class="col-lg-6">' +
        '<div class="dash-card h-100">' +
        "<h5>Announcements</h5>" +
        '<ul class="dash-list">' +
        ANNOUNCEMENTS.map(
          (a) =>
            '<li><span class="dash-list-icon"><i class="bi ' +
            a.icon +
            '"></i></span><div><div>' +
            a.title +
            '</div><div class="dash-list-meta">' +
            a.time +
            "</div></div></li>",
        ).join("") +
        "</ul>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="dash-card">' +
        "<h5>Quick Actions</h5>" +
        '<div class="dash-quick-actions">' +
        '<div class="dash-quick-action dash-goto" data-page="assignment"><i class="bi bi-journal-check"></i>Assignments</div>' +
        '<div class="dash-quick-action dash-goto" data-page="practice"><i class="bi bi-code-slash"></i>Practice Lab</div>' +
        '<div class="dash-quick-action dash-goto" data-page="internship"><i class="bi bi-briefcase"></i>Internships</div>' +
        '<div class="dash-quick-action dash-goto" data-page="certificates"><i class="bi bi-patch-check"></i>Certificates</div>' +
        "</div>" +
        "</div>"
      );
    },

    courses: function (query) {
      const q = (query || "").trim().toLowerCase();
      const list = q
        ? MY_COURSES.filter((c) => c.name.toLowerCase().includes(q))
        : MY_COURSES;
      const suggestions = CATALOG.filter(
        (c) => !MY_COURSES.find((m) => m.name === c.name),
      ).slice(0, 3);

      return (
        '<div class="dash-page-title"><h2>My Courses</h2><p>Everything you\'re currently learning.</p></div>' +
        (list.length
          ? '<div class="row g-4 mb-5">' +
            list.map((c) => courseCard(c, false)).join("") +
            "</div>"
          : '<div class="dash-empty"><i class="bi bi-search fs-2 d-block mb-2"></i>No courses match "' +
            query +
            '".</div>') +
        '<h4 class="mb-3">Explore More Courses</h4>' +
        '<div class="row g-4">' +
        suggestions.map((c) => courseCard(c, true)).join("") +
        "</div>"
      );
    },

    live: function () {
      return (
        '<div class="dash-page-title"><h2>Live Classes</h2><p>Join your upcoming mentor-led sessions.</p></div>' +
        '<div class="row g-4">' +
        LIVE_CLASSES.map(
          (l, i) =>
            '<div class="col-md-6 col-lg-4">' +
            '<div class="dash-live-card">' +
            (i === 0
              ? '<span class="dash-live-badge">LIVE TODAY</span>'
              : '<span class="dash-live-badge" style="background:var(--cf-glass-bg);color:var(--cf-text-muted);">UPCOMING</span>') +
            '<h5 class="mb-0">' +
            l.title +
            "</h5>" +
            '<p class="mb-1">' +
            l.course +
            "</p>" +
            '<p class="mb-2 dash-list-meta">' +
            l.time +
            "</p>" +
            '<button class="btn btn-sm cf-btn-gradient dash-join-btn" data-class="' +
            l.title +
            '">Join Now</button>' +
            "</div>" +
            "</div>",
        ).join("") +
        "</div>"
      );
    },

    assignment: function () {
      return (
        '<div class="dash-page-title"><h2>Assignments</h2><p>Track submissions and grades.</p></div>' +
        '<div class="dash-card">' +
        ASSIGNMENTS.map(
          (a) =>
            '<div class="dash-assignment-row">' +
            "<div><strong>" +
            a.title +
            '</strong><div class="dash-list-meta">' +
            a.due +
            "</div></div>" +
            '<div class="d-flex align-items-center gap-2">' +
            '<span class="dash-status-pill ' +
            a.status +
            '">' +
            a.status +
            "</span>" +
            (a.status === "pending"
              ? '<button class="btn btn-sm cf-btn-gradient dash-submit-btn" data-assignment="' +
                a.title +
                '">Submit</button>'
              : '<button class="btn btn-sm cf-btn-outline" disabled>View</button>') +
            "</div>" +
            "</div>",
        ).join("") +
        "</div>"
      );
    },

    practice: function () {
      return (
        '<div class="dash-page-title"><h2>Practice Lab</h2><p>Sharpen your skills every day.</p></div>' +
        '<div class="row g-4">' +
        '<div class="col-md-4"><div class="dash-card text-center"><i class="bi bi-lightning-charge fs-2 mb-2" style="color:var(--cf-teal);"></i><h5>Daily Coding Challenge</h5><p>A new problem every day.</p><button class="btn cf-btn-gradient dash-practice-btn" data-lab="Daily Coding Challenge">Start</button></div></div>' +
        '<div class="col-md-4"><div class="dash-card text-center"><i class="bi bi-mic fs-2 mb-2" style="color:var(--cf-teal);"></i><h5>Mock Interview</h5><p>Practice with real interview questions.</p><button class="btn cf-btn-gradient dash-practice-btn" data-lab="Mock Interview">Start</button></div></div>' +
        '<div class="col-md-4"><div class="dash-card text-center"><i class="bi bi-list-check fs-2 mb-2" style="color:var(--cf-teal);"></i><h5>100 Coding Problems</h5><p>Build core problem-solving skills.</p><button class="btn cf-btn-gradient dash-practice-btn" data-lab="100 Coding Problems">Start</button></div></div>' +
        "</div>"
      );
    },

    projects: function () {
      return (
        '<div class="dash-page-title"><h2>Projects</h2><p>Build a portfolio recruiters notice.</p></div>' +
        '<div class="row g-4">' +
        PROJECTS.map(
          (p) =>
            '<div class="col-md-4">' +
            '<div class="dash-card h-100">' +
            '<i class="bi bi-kanban fs-3 mb-2" style="color:var(--cf-violet);"></i>' +
            "<h5>" +
            p.title +
            "</h5>" +
            '<p class="dash-list-meta">' +
            p.stack +
            "</p>" +
            '<button class="btn btn-sm cf-btn-outline dash-project-btn" data-project="' +
            p.title +
            '">View Details</button>' +
            "</div>" +
            "</div>",
        ).join("") +
        "</div>"
      );
    },

    internship: function () {
      return (
        '<div class="dash-page-title"><h2>Internship Portal</h2><p>Apply to roles matched to your track.</p></div>' +
        '<div class="row g-4" id="internshipGrid">' +
        INTERNSHIPS.map(
          (job, i) =>
            '<div class="col-md-6">' +
            '<div class="dash-internship-card">' +
            '<div class="dash-internship-logo"><i class="bi ' +
            job.icon +
            '"></i></div>' +
            '<div class="flex-grow-1">' +
            '<h5 class="mb-1">' +
            job.role +
            "</h5>" +
            '<p class="mb-1 dash-list-meta">' +
            job.company +
            " · " +
            job.location +
            "</p>" +
            '<span class="dash-internship-status ' +
            job.status +
            '">' +
            (job.status === "open" ? "Open" : "Applied") +
            "</span>" +
            "</div>" +
            '<button class="btn btn-sm cf-btn-gradient dash-apply-btn" data-index="' +
            i +
            '" ' +
            (job.status === "applied" ? "disabled" : "") +
            ">" +
            (job.status === "applied" ? "Applied" : "Apply") +
            "</button>" +
            "</div>" +
            "</div>",
        ).join("") +
        "</div>"
      );
    },

    certificates: function () {
      const earned = MY_COURSES.filter((c) => c.progress >= 90);
      return (
        '<div class="dash-page-title"><h2>Certificates</h2><p>Your earned certifications.</p></div>' +
        (earned.length
          ? '<div class="row g-4">' +
            earned
              .map(
                (c) =>
                  '<div class="col-md-4"><div class="dash-cert-card"><i class="bi bi-patch-check-fill"></i><h5>' +
                  c.name +
                  '</h5><p class="dash-list-meta">Issued by AxiomTechguru</p><button class="btn btn-sm cf-btn-outline dash-cert-btn" data-course="' +
                  c.name +
                  '">Download</button></div></div>',
              )
              .join("") +
            "</div>"
          : '<div class="dash-empty"><i class="bi bi-patch-check fs-2 d-block mb-2"></i>Complete a course to unlock your first certificate.</div>')
      );
    },

    schedule: function () {
      return (
        '<div class="dash-page-title"><h2>Schedule</h2><p>Upcoming classes and events.</p></div>' +
        '<div class="dash-card">' +
        '<ul class="dash-list">' +
        LIVE_CLASSES.map(
          (l) =>
            '<li><span class="dash-list-icon"><i class="bi bi-calendar-event"></i></span><div><div>' +
            l.title +
            '</div><div class="dash-list-meta">' +
            l.time +
            "</div></div></li>",
        ).join("") +
        "</ul>" +
        "</div>"
      );
    },

    announcement: function () {
      return (
        '<div class="dash-page-title"><h2>Announcements</h2><p>Stay up to date with the academy.</p></div>' +
        '<div class="dash-card">' +
        '<ul class="dash-list">' +
        ANNOUNCEMENTS.map(
          (a) =>
            '<li><span class="dash-list-icon"><i class="bi ' +
            a.icon +
            '"></i></span><div><div>' +
            a.title +
            '</div><div class="dash-list-meta">' +
            a.time +
            "</div></div></li>",
        ).join("") +
        "</ul>" +
        "</div>"
      );
    },

    profile: function () {
      return (
        '<div class="dash-page-title"><h2>My Profile</h2><p>Your account details.</p></div>' +
        '<div class="dash-card mb-4">' +
        '<div class="dash-profile-header">' +
        '<img src="' +
        (user.image || "https://i.pravatar.cc/150") +
        '" class="dash-profile-avatar" alt="' +
        user.name +
        '">' +
        '<div><h4 class="mb-1">' +
        user.name +
        '</h4><p class="mb-0 dash-list-meta">' +
        user.role +
        " · " +
        user.course +
        "</p></div>" +
        "</div>" +
        "</div>" +
        '<div class="dash-card mb-4">' +
        '<div class="dash-profile-field"><span>Full Name</span><span>' +
        user.name +
        "</span></div>" +
        '<div class="dash-profile-field"><span>Email</span><span>' +
        user.email +
        "</span></div>" +
        '<div class="dash-profile-field"><span>Role</span><span>' +
        user.role +
        "</span></div>" +
        '<div class="dash-profile-field"><span>Course</span><span>' +
        user.course +
        "</span></div>" +
        "</div>" +
        '<div class="row g-4">' +
        statCard("bi-clock-history", STATS.learningHours, "Learning Hours") +
        statCard("bi-patch-check", STATS.certificates, "Certificates") +
        statCard("bi-kanban", STATS.projects, "Projects") +
        "</div>"
      );
    },

    settings: function () {
      const currentTheme = root.getAttribute("data-theme");
      return (
        '<div class="dash-page-title"><h2>Settings</h2><p>Manage your preferences.</p></div>' +
        '<div class="dash-card">' +
        '<div class="dash-setting-row">' +
        '<div><h6>Dark Mode</h6><p class="dash-list-meta">Switch between light and dark themes.</p></div>' +
        '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="settingsThemeSwitch" ' +
        (currentTheme === "dark" ? "checked" : "") +
        "></div>" +
        "</div>" +
        '<div class="dash-setting-row">' +
        '<div><h6>Email Notifications</h6><p class="dash-list-meta">Get updates about assignments and live classes.</p></div>' +
        '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="settingsEmailSwitch" checked></div>' +
        "</div>" +
        '<div class="dash-setting-row">' +
        '<div><h6>Change Password</h6><p class="dash-list-meta">Update your account password.</p></div>' +
        '<button class="btn btn-sm cf-btn-outline" id="settingsPasswordBtn">Update</button>' +
        "</div>" +
        "</div>"
      );
    },
  };

  function statCard(icon, value, label) {
    return (
      '<div class="col-6 col-lg-3">' +
      '<div class="dash-stat-card">' +
      '<div class="dash-stat-icon"><i class="bi ' +
      icon +
      '"></i></div>' +
      "<h3>" +
      value +
      "</h3>" +
      "<p>" +
      label +
      "</p>" +
      "</div>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------
     8. ROUTER
  --------------------------------------------------------- */
  const content = document.getElementById("contentArea");
  let currentPage = "dashboard";
  let currentQuery = "";

  function setActiveNav(pageName) {
    document
      .querySelectorAll(".dash-nav-link[data-page]")
      .forEach(function (link) {
        link.classList.toggle("active", link.dataset.page === pageName);
      });
  }

  function renderPage(pageName, query) {
    if (!pages[pageName]) pageName = "dashboard";
    currentPage = pageName;
    currentQuery = query || "";
    content.innerHTML = pages[pageName](currentQuery);
    setActiveNav(pageName);
    wirePageButtons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPage(pageName) {
    renderPage(pageName, "");
    closeMobileSidebar();
  }

  // Any element (sidebar link, dropdown item, quick action, hero CTA) with data-page navigates.
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-page]");
    if (trigger) {
      e.preventDefault();
      goToPage(trigger.dataset.page);
    }
  });

  /* ---------------------------------------------------------
     9. IN-PAGE BUTTON WIRING (re-run after every render)
  --------------------------------------------------------- */
  function wirePageButtons() {
    content.querySelectorAll(".dash-continue-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast('Resuming "' + btn.dataset.course + '"...', "success");
      });
    });

    content.querySelectorAll(".dash-join-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast('Joining "' + btn.dataset.class + '"...', "info");
      });
    });

    content.querySelectorAll(".dash-submit-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const row = btn.closest(".dash-assignment-row");
        const pill = row.querySelector(".dash-status-pill");
        pill.textContent = "submitted";
        pill.className = "dash-status-pill submitted";
        btn.remove();
        showToast(
          '"' + btn.dataset.assignment + '" submitted successfully.',
          "success",
        );
      });
    });

    content.querySelectorAll(".dash-practice-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast('Starting "' + btn.dataset.lab + '"...', "info");
      });
    });

    content.querySelectorAll(".dash-project-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast(
          'Opening details for "' + btn.dataset.project + '"...',
          "info",
        );
      });
    });

    content.querySelectorAll(".dash-apply-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = parseInt(btn.dataset.index, 10);
        INTERNSHIPS[idx].status = "applied";
        showToast(
          'Application sent for "' + INTERNSHIPS[idx].role + '".',
          "success",
        );
        renderPage("internship");
      });
    });

    content.querySelectorAll(".dash-cert-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast(
          'Downloading certificate for "' + btn.dataset.course + '"...',
          "success",
        );
      });
    });

    const passwordBtn = document.getElementById("settingsPasswordBtn");
    if (passwordBtn) {
      passwordBtn.addEventListener("click", function () {
        showToast("Password update link sent to " + user.email, "info");
      });
    }

    const themeSwitch = document.getElementById("settingsThemeSwitch");
    if (themeSwitch) {
      themeSwitch.addEventListener("change", function () {
        applyTheme(themeSwitch.checked ? "dark" : "light");
      });
    }

    const emailSwitch = document.getElementById("settingsEmailSwitch");
    if (emailSwitch) {
      emailSwitch.addEventListener("change", function () {
        showToast(
          "Email notifications " +
            (emailSwitch.checked ? "enabled" : "disabled") +
            ".",
          "info",
        );
      });
    }
  }

  /* ---------------------------------------------------------
     10. SEARCH
  --------------------------------------------------------- */
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      renderPage("courses", searchInput.value);
    });
  }

  /* ---------------------------------------------------------
     11. MOBILE SIDEBAR
  --------------------------------------------------------- */
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const menuToggle = document.getElementById("menuToggle");

  function closeMobileSidebar() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("show");
      sidebarBackdrop.classList.remove("show");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("show");
      sidebarBackdrop.classList.toggle("show");
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeMobileSidebar);
  }

  /* ---------------------------------------------------------
     12. INITIAL RENDER
  --------------------------------------------------------- */
  renderPage("dashboard");
})();
