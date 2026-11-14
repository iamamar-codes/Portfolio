/* Vanilla JavaScript: content fill + all animations */
(function () {
  const D = window.PORTFOLIO;
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Fill content from data.js ---------- */
  const initials = D.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  document.title = D.name + " — Portfolio";
  $("#logoText").textContent = initials;
  $("#initials").textContent = initials;
  $("#tagline").textContent = D.tagline;
  $("#footName").textContent = D.name;
  $("#year").textContent = new Date().getFullYear();

  // Name: letter-by-letter rise animation
  const nameEl = $("#heroName");
  nameEl.setAttribute("aria-label", D.name);
  let i = 0;
  D.name.split(" ").forEach((word, wi, arr) => {
    const w = document.createElement("span");
    w.style.whiteSpace = "nowrap";
    w.style.display = "inline-block";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      s.style.animationDelay = 0.25 + i++ * 0.045 + "s";
      w.appendChild(s);
    }
    nameEl.appendChild(w);
    if (wi < arr.length - 1) nameEl.appendChild(document.createTextNode(" "));
  });

  // Photo with fallback to initials
  const photo = $("#photo");
  const frame = photo.parentElement;
  photo.onerror = () => frame.classList.add("no-photo");
  if (D.photo) photo.src = D.photo; else frame.classList.add("no-photo");

  if (D.resume) { const r = $("#resumeBtn"); r.href = D.resume; r.hidden = false; }

  $("#aboutText").innerHTML = "";
  D.about.forEach((t) => { const p = document.createElement("p"); p.textContent = t; $("#aboutText").appendChild(p); });

  // Download resume button under the About text (main resume, else the video editing one)
  const aboutResume = D.resume || (D.video && D.video.resume);
  if (aboutResume) {
    const a = document.createElement("a");
    a.className = "btn btn-primary resume-btn";
    a.href = aboutResume;
    a.setAttribute("download", "");
    a.innerHTML = "Download resume <span>↓</span>";
    $("#aboutText").appendChild(a);
  }

  D.stats.forEach((s, n) => {
    const el = document.createElement("div");
    el.className = "stat card reveal";
    el.style.setProperty("--d", n * 0.12 + "s");
    el.innerHTML = '<b data-count="' + Number(s.value) + '" data-suffix="' + (s.suffix || "").replace(/[^+%kK]/g, "") + '">0</b><span></span>';
    el.querySelector("span").textContent = s.label;
    $("#stats").appendChild(el);
  });

  const mq = $("#marquee");
  const words = D.skillGroups.flatMap((g) => g.items.map((s) => s.name));
  for (let k = 0; k < 2; k++) words.forEach((w) => { const s = document.createElement("span"); s.textContent = w; mq.appendChild(s); });

  // "Say hello" opens the contact form (name, email, message + Send)
  const hello = $("#mailBtn"), modal = $("#helloModal"), form = $("#helloForm"), status = $("#helloStatus");
  hello.href = "#contact";
  const openModal = (e) => {
    e.preventDefault();
    status.textContent = ""; status.className = "form-status";
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
    setTimeout(() => form.elements.name.focus(), 100);
  };
  const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
  hello.addEventListener("click", openModal);
  $("#helloClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), message = form.elements.message.value.trim();
    if (!name || !email || !message) return;
    const g = D.contact.googleForm, send = $("#helloSend");
    if (g && g.action) {
      // Sends straight into your Google Form's responses (no page change)
      const body = new URLSearchParams({ [g.name]: name, [g.email]: email, [g.message]: message });
      send.disabled = true; status.className = "form-status"; status.textContent = "Sending…";
      try {
        await fetch(g.action, { method: "POST", mode: "no-cors", body });
        status.textContent = "✓ Message sent — thank you!";
        form.reset();
      } catch (err) {
        status.className = "form-status err";
        status.textContent = "Could not send. Please email me at " + D.contact.email;
      }
      send.disabled = false;
    } else {
      // No Google Form connected: open the visitor's email app with the message filled in
      const subject = "Portfolio message from " + name;
      const text = message + "\n\n— " + name + "\n" + email;
      location.href = "mailto:" + D.contact.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      status.textContent = "Opening your email app — press send there to deliver it.";
    }
  });
  $("#location").textContent = "📍 " + D.contact.location + "  ·  ✉ " + D.contact.email;
  const SOCIAL_ICONS = {
    github: '<path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
    linkedin: '<path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor"/>'
  };
  D.contact.socials.forEach((s) => {
    const a = document.createElement("a");
    const icon = SOCIAL_ICONS[s.label.toLowerCase()];
    if (icon) a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icon + "</svg>";
    a.appendChild(document.createTextNode(s.label));
    a.href = s.url;
    if (s.url !== "#") { a.target = "_blank"; a.rel = "noopener"; }
    $("#socials").appendChild(a);
  });

  /* ---------- 2. Typing effect ---------- */
  const typed = $("#typed");
  if (reduced) typed.textContent = D.roles[0];
  else {
    let r = 0, c = 0, del = false;
    (function type() {
      const word = D.roles[r];
      c += del ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let wait = del ? 45 : 95;
      if (!del && c === word.length) { del = true; wait = 1500; }
      else if (del && c === 0) { del = false; r = (r + 1) % D.roles.length; wait = 350; }
      setTimeout(type, wait);
    })();
  }

  /* ---------- 3. Particle network (canvas) ---------- */
  const cv = $("#particles"), ctx = cv.getContext("2d");
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.6
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 130) { p.x += (p.x - mouse.x) / dm * 1.2; p.y += (p.y - mouse.y) / dm * 1.2; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "rgba(110,231,183,.8)"; ctx.fill();
      for (let b = a + 1; b < pts.length; b++) {
        const q = pts[b], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) {
          ctx.strokeStyle = "rgba(34,197,94," + (1 - d / 130) * 0.35 + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    if (!reduced && heroVisible) requestAnimationFrame(draw);
  }
  let heroVisible = true;
  new IntersectionObserver(([e]) => {
    const was = heroVisible; heroVisible = e.isIntersecting;
    if (heroVisible && !was && !reduced) requestAnimationFrame(draw);
  }).observe(cv);
  addEventListener("resize", resize);
  $("#home").addEventListener("pointermove", (e) => { const b = cv.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; });
  $("#home").addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  resize(); draw();

  /* ---------- 4. Scroll reveal (also catches React-rendered elements) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
      const cnt = e.target.querySelector("[data-count]");
      if (cnt) countUp(cnt);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  const watch = (root) => root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  watch(document);
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches(".reveal:not(.in)")) io.observe(n);
    watch(n);
  }))).observe(document.body, { childList: true, subtree: true });

  /* ---------- 5. Counters ---------- */
  function countUp(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
    if (reduced) { el.textContent = end + suf; return; }
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- 6. Nav state, progress bar, active link ---------- */
  const nav = $("#nav"), bar = $("#progress");
  const links = [...document.querySelectorAll(".nav-links a")];
  const secs = links.map((a) => document.querySelector(a.getAttribute("href")));
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("scrolled", y > 30);
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    let cur = 0;
    secs.forEach((s, n) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = n; });
    if (max > 0 && y >= max - 2) cur = secs.length - 1;
    links.forEach((a, n) => a.classList.toggle("active", n === cur));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 7. Mobile menu ---------- */
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  menuBtn.addEventListener("click", () => { menuBtn.classList.toggle("open"); navLinks.classList.toggle("open"); });
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") { menuBtn.classList.remove("open"); navLinks.classList.remove("open"); } });

  /* ---------- 8. Cursor glow + 3D tilt cards ---------- */
  if (!reduced && matchMedia("(hover: hover)").matches) {
    const glow = $("#cursorGlow");
    let tilted = null;
    addEventListener("pointermove", (e) => {
      glow.style.opacity = 1;
      glow.style.transform = "translate(" + (e.clientX - 210) + "px," + (e.clientY - 210) + "px)";
      const card = e.target.closest && e.target.closest(".tilt");
      if (tilted && tilted !== card) { tilted.style.transform = ""; tilted = null; }
      if (card) {
        const b = card.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + px * 9 + "deg) rotateX(" + -py * 9 + "deg) translateY(-6px)";
        tilted = card;
      }
    });
    document.addEventListener("pointerleave", () => { glow.style.opacity = 0; if (tilted) { tilted.style.transform = ""; tilted = null; } });
  }
})();
