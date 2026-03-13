(() => {
  const hoursEl = document.querySelector("#countdown-hours");
  const minutesEl = document.querySelector("#countdown-minutes");
  const secondsEl = document.querySelector("#countdown-seconds");
  const box = document.querySelector(".hero-countdown");
  if (!hoursEl || !minutesEl || !secondsEl || !box) return;

  const durationMs = 24 * 60 * 60 * 1000;
  const endTime = Date.now() + durationMs;

  const format = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      h: String(hours).padStart(2, "0"),
      m: String(minutes).padStart(2, "0"),
      s: String(seconds).padStart(2, "0"),
    };
  };

  const update = () => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      window.clearInterval(timer);
      return;
    }

    const { h, m, s } = format(remaining);
    hoursEl.textContent = h;
    minutesEl.textContent = m;
    secondsEl.textContent = s;
  };

  update();
  const timer = window.setInterval(update, 1000);
})();

(() => {
  const slides = Array.from(document.querySelectorAll(".hero-media img"));
  if (slides.length <= 1) return;

  let i = 0;
  const advance = () => {
    slides[i]?.classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i]?.classList.add("is-active");
  };

  window.setInterval(advance, 3500);
})();

(() => {
  const navShell = document.querySelector(".nav-shell");
  const hero = document.querySelector(".hero");
  const toggle = document.querySelector("#theme-toggle");
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const navLeft = document.querySelector(".nav-left");
  const indicator = document.querySelector(".nav-indicator");
  const form = document.querySelector("#register form");
  const successOverlay = document.querySelector("#registration-success");
  const successName = document.querySelector("#success-name");
  const successEmail = document.querySelector("#success-email");
  const successClose = document.querySelector("#success-close");

  if (form && successOverlay && successName && successEmail && successClose) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim() || "there";
      const email = (data.get("email") || "").toString().trim();

      successName.textContent = name;
      successEmail.textContent = email;
      successOverlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    const closeOverlay = () => {
      successOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    successClose.addEventListener("click", () => {
      form.reset();
      closeOverlay();
    });

    successOverlay.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.close === "true") {
        closeOverlay();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && successOverlay.getAttribute("aria-hidden") === "false") {
        closeOverlay();
      }
    });
  }

  const setTheme = (mode) => {
    const isDark = mode === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    toggle?.setAttribute("aria-pressed", String(isDark));
    try {
      window.localStorage?.setItem("fsf-theme", mode);
    } catch {
      // ignore storage errors
    }
  };

  if (toggle) {
    let stored = "light";
    try {
      stored =
        window.localStorage?.getItem("fsf-theme") ||
        (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
    } catch {
      stored =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }

    setTheme(stored);

    toggle.addEventListener("click", () => {
      const next =
        document.body.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
    });
  }

  const moveIndicator = (target) => {
    if (!indicator || !navLeft) return;
    const active = links.find(
      (btn) => btn.getAttribute("data-target") === target
    );
    if (!active) return;
    const parentRect = navLeft.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const left = rect.left - parentRect.left;
    indicator.style.width = `${rect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.opacity = "1";
  };

  const setActive = (target) => {
    if (!links.length) return;
    links.forEach((btn) => {
      const isActive = btn.getAttribute("data-target") === target;
      btn.classList.toggle("nav-link--active", isActive);
    });
    moveIndicator(target);
  };

  const sections = [
    { id: "#hero", el: document.querySelector("#hero") },
    { id: "#speakers", el: document.querySelector("#speakers") },
    { id: "#agenda", el: document.querySelector("#agenda") },
  ].filter((s) => s.el);

  if (links.length) {
    links.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        if (!target) return;
        const el = document.querySelector(target);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(target);
      });
    });
  }

  if (navShell && hero) {
    const updateNav = () => {
      const rect = hero.getBoundingClientRect();
      const shouldSticky = rect.bottom < 60;
      navShell.classList.toggle("is-sticky", shouldSticky);

      if (sections.length) {
        const viewportLine = 80;
        let current = sections[0].id;
        sections.forEach((s) => {
          const r = s.el.getBoundingClientRect();
          if (r.top <= viewportLine && r.bottom > viewportLine) {
            current = s.id;
          }
        });
        setActive(current);
      }
    };

    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
  }
})();

(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const vh = Math.max(window.innerHeight, 1);
    const progress = Math.min(
      Math.max((vh - rect.top) / (vh + rect.height), 0),
      1
    );
    const y = Math.round((progress - 0.5) * 100);
    hero.style.setProperty("--parallax-y", `${y}px`);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();

(() => {
  const faqList = document.querySelector(".faq-list");
  if (!faqList) return;

  const getItems = () => Array.from(document.querySelectorAll(".faq-item"));

  const openItem = (targetItem) => {
    getItems().forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      const panel = item.querySelector(".faq-panel");
      const expanded = item === targetItem;
      item.classList.toggle("is-open", expanded);
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(expanded));
      }
      if (panel) {
        panel.hidden = !expanded;
      }
    });
  };

  faqList.addEventListener("click", (e) => {
    const trigger = e.target.closest(".faq-trigger");
    if (!trigger) return;
    const item = trigger.closest(".faq-item");
    if (!item) return;
    e.preventDefault();
    const isOpen = item.classList.contains("is-open");
    openItem(isOpen ? null : item);
  });

  getItems().forEach((item) => {
    const panel = item.querySelector(".faq-panel");
    const trigger = item.querySelector(".faq-trigger");
    const isOpen = item.classList.contains("is-open");
    if (panel) panel.hidden = !isOpen;
    if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
  });
})();

