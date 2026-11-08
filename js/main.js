(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const S = window.PixelSprites;
  const PASTELS = [
    "#ffc2dd",
    "#dccbff",
    "#b6f0d6",
    "#fff0a6",
    "#bde7ff",
    "#ffd1b8",
  ];
  const BADGES = [
    { count: 1, label: "🥉 First Finish" },
    { count: 3, label: "🥈 3 Events Completed" },
    { count: 5, label: "🥇 5 Events Completed" },
    { count: 10, label: "🏆 10 Events Completed" },
  ];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let lastEvents = [],
    queue = [],
    bubbleTimer = null,
    nextEvent = null;

  /* ---------- theme ---------- */
  function initTheme() {
    const root = document.documentElement,
      btn = $("themeToggle");
    const icon = () =>
      (btn.textContent =
        root.getAttribute("data-theme") === "dark" ? "☀️" : "🌙");
    icon();
    btn.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      icon();
    });
  }

  /* ---------- profile, ticker, sprites ---------- */
  const CFG_CACHE = "runlog_cfg";

  // Apply the "Config" sheet values over the config.js defaults.
  function applyConfig(c) {
    if (!c) return;
    if (c.name) CONFIG.PROFILE.name = String(c.name);
    if (c.bio) CONFIG.PROFILE.bio = String(c.bio);
    if (typeof c.photo === "string") CONFIG.PROFILE.photo = c.photo;
    if (Array.isArray(c.ticker) && c.ticker.length) CONFIG.TICKER = c.ticker;
    if (Number(c.bubble_interval_ms) > 0)
      CONFIG.BUBBLE_INTERVAL_MS = Number(c.bubble_interval_ms);
    if (Number(c.bubble_duration_s) > 0)
      CONFIG.BUBBLE_DURATION_S = Number(c.bubble_duration_s);
    renderProfile();
  }

  function renderProfile() {
    $("profileName").textContent = CONFIG.PROFILE.name;
    $("profileBio").textContent = CONFIG.PROFILE.bio;
    const img = $("profilePhoto");
    if (CONFIG.PROFILE.photo) {
      img.src = CONFIG.PROFILE.photo;
      img.className = "photo";
    } else {
      img.src = S.uri("girl", 4);
      img.className = "";
    }
    const txt = CONFIG.TICKER.map((t) => "★ " + t + " ").join("") + "♡ ";
    $("tickerTrack").innerHTML =
      `<span>${esc(txt.repeat(3))}</span><span>${esc(txt.repeat(3))}</span>`;
  }

  function initProfile() {
    const h = new Date().getHours();
    $("greeting").textContent = $("someElementId") // Updated to use a specific element ID
      ? "Morning ☀️"
      : h < 15
        ? "Afternoon 🌤️"
        : h < 18
          ? "Evening 🌷"
          : "Night 🌙";
    $("progressRunner").src = S.uri("mini", 4);
    $("fabHeart").src = S.uri("heart", 2);
    $("favicon").href = S.uri("heart", 3);
    // Show the last saved config first to avoid a default-state flash.
    try {
      applyConfig(JSON.parse(localStorage.getItem(CFG_CACHE)));
    } catch (e) {}
    renderProfile();

    const tick = () => {
      const n = new Date();
      $("todayDate").textContent =
        n.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }) +
        " " +
        [n.getHours(), n.getMinutes(), n.getSeconds()]
          .map((v) => String(v).padStart(2, "0"))
          .join(":");
    };
    tick();
    setInterval(tick, 1000);
  }

  function initDecor() {
    const layer = $("decor");
    const add = (name, px, cls, style, over) => {
      const im = new Image();
      im.src = S.uri(name, px, over);
      im.alt = "";
      im.className = "decor-item " + cls;
      Object.assign(im.style, style);
      layer.appendChild(im);
    };
    for (let i = 0; i < 8; i++)
      add("star", 4, "twinkle", {
        left: rand(2, 94) + "%",
        top: rand(3, 92) + "%",
        animationDelay: rand(0, 2) + "s",
      });
    for (let i = 0; i < 6; i++)
      add(
        "mini",
        4,
        "bob",
        {
          left: rand(2, 94) + "%",
          top: rand(5, 90) + "%",
          animationDelay: rand(0, 2) + "s",
        },
        { R: pick(["#ff8cc0", "#c9b3ff", "#9be8c4", "#ffb347"]) },
      );
    for (let i = 0; i < 3; i++)
      add("cloud", 6, "cloud", {
        top: rand(4, 70) + "%",
        animationDuration: rand(70, 120) + "s",
        animationDelay: -rand(0, 100) + "s",
      });

    document.addEventListener("click", (e) => {
      const h = new Image();
      h.src = S.uri("mini", 3);
      h.className = "click-heart";
      h.style.left = e.clientX + "px";
      h.style.top = e.clientY + "px";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 900);
    });
  }

  /* ---------- data ---------- */
  async function fetchData() {
    if (!CONFIG.ENDPOINT_URL) return MOCK_DATA;
    const ctrl = new AbortController(),
      t = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(CONFIG.ENDPOINT_URL, { signal: ctrl.signal });
      if (!res.ok) throw new Error("Failed to load data (" + res.status + ")");
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  async function loadAll() {
    $("listState").hidden = false;
    $("listState").textContent = "Loading.. ♡";
    $("todoList").hidden = true;
    try {
      const data = await fetchData();
      if (data.config) {
        applyConfig(data.config);
        try {
          localStorage.setItem(CFG_CACHE, JSON.stringify(data.config));
        } catch (e) {}
      }
      lastEvents = sortEvents(data.events || []);
      renderTodos(lastEvents);
      renderCountdown(lastEvents);
      checkReminders();
      startBubbles(data.semangat || []);
    } catch (err) {
      $("listState").textContent = "Could not load data. Try refreshing ⟳!";
      console.error(err);
    }
  }

  /* ---------- helpers ---------- */
  const parseDate = (ev) => {
    const d = ev && ev.time ? new Date(ev.time) : null;
    return d && !isNaN(d) ? d : null;
  };
  const daysUntil = (d) => {
    const n = new Date();
    return Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
        new Date(n.getFullYear(), n.getMonth(), n.getDate())) /
        864e5,
    );
  };
  function fmtDate(v) {
    const d = new Date(v);
    return isNaN(d)
      ? v || ""
      : new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
  }
  function sortEvents(list) {
    return list
      .map((ev, i) => ({ ev, i, d: parseDate(ev) }))
      .sort((a, b) => (a.d && b.d ? a.d - b.d : a.d ? -1 : b.d ? 1 : a.i - b.i))
      .map((x) => x.ev);
  }
  function classify(ev) {
    const s = String(ev.status || "pending").toLowerCase();
    const isCanceled = s === "canceled" || s === "cancelled";
    const d = parseDate(ev);
    const isDone =
      !isCanceled && (s === "done" || s === "true" || (d && daysUntil(d) < 0));
    const isActive =
      !isDone &&
      !isCanceled &&
      ["active", "ongoing", "in_progress"].includes(s);
    return { isDone: Boolean(isDone), isActive, isCanceled };
  }

  /* ---------- render ---------- */
  function renderTodos(events) {
    if (!events.length) {
      $("listState").textContent =
        "No events yet. Add one through Google Sheets ♡";
      return;
    }
    $("listState").hidden = true;
    const ul = $("todoList");
    ul.hidden = false;
    let done = 0;
    const reminders = loadReminders();
    ul.innerHTML = events
      .map((ev, i) => {
        const c = classify(ev);
        if (c.isDone) done++;
        const d = parseDate(ev),
          key = eventKey(ev);
        const bell =
          !c.isDone && !c.isCanceled && d && d.getTime() > Date.now()
            ? `<button type="button" class="todo-bell${reminders[key] ? " is-active" : ""}" data-key="${encodeURIComponent(key)}" title="Remind me one day before">🔔</button>`
            : "";
        const cls =
          "todo-item" +
          (c.isDone ? " is-done" : "") +
          (c.isActive ? " is-active" : "") +
          (c.isCanceled ? " is-canceled" : "");
        return `<li class="${cls}">
        <div class="todo-icon" style="background:${/^#[0-9a-f]{6}$/i.test(ev.color) ? ev.color : PASTELS[i % PASTELS.length]}">${esc(ev.icon || "🎀")}</div>
        <div class="todo-body">
          <p class="todo-title">${esc(ev.title || "Untitled")}</p>
          <p class="todo-desc">${esc(ev.description || "")}</p>
          ${ev.time ? `<p class="todo-time">${esc(fmtDate(ev.time))}</p>` : ""}
        </div>
        ${bell}
        <div class="todo-check">${c.isCanceled ? "✗" : c.isDone ? "✓" : ""}</div></li>`;
      })
      .join("");
    const pct = Math.round((done / events.length) * 100);
    $("progressFill").style.width = pct + "%";
    $("progressRunner").style.left = pct + "%";
    $("progressLabel").textContent = `${done} / ${events.length} Completed`;
  }

  function renderCountdown(events) {
    const next = events
      .map((ev) => ({ ev, d: parseDate(ev) }))
      .filter(
        ({ ev, d }) =>
          d &&
          !classify(ev).isDone &&
          !classify(ev).isCanceled &&
          daysUntil(d) >= 0,
      )
      .sort((a, b) => a.d - b.d)[0];
    const el = $("countdownBadge");
    if (!next) {
      nextEvent = null;
      el.hidden = true;
      return;
    }
    const diff = daysUntil(next.d);
    nextEvent = { ev: next.ev, diff };
    el.hidden = false;
    el.textContent = `⏳ ${next.ev.title || "Event"} · ${diff === 0 ? "TODAY! 🎉" : "D-" + diff}`;
  }

  /* ---------- next event modal + share PNG ---------- */
  const countLabel = (diff) => (diff === 0 ? "TODAY!" : "D-" + diff);

  $("countdownBadge").addEventListener("click", () => {
    if (!nextEvent) return;
    const { ev, diff } = nextEvent;
    const i = Math.max(0, lastEvents.indexOf(ev));
    const color = /^#[0-9a-f]{6}$/i.test(ev.color)
      ? ev.color
      : PASTELS[i % PASTELS.length];
    $("nextEventCard").innerHTML =
      `<div class="next-event-icon" style="background:${color}">${esc(ev.icon || "🎀")}</div>
      <div><p class="next-event-title">${esc(ev.title || "Event")}</p><p class="next-event-date">${esc(fmtDate(ev.time))}</p>
      <span class="next-event-count">${countLabel(diff)}</span></div>`;
    $("nextEventShareStatus").textContent = "";
    toggle("nextEventOverlay", true);
  });
  $("nextEventClose").addEventListener("click", () =>
    toggle("nextEventOverlay", false),
  );
  $("nextEventOverlay").addEventListener("click", (e) => {
    if (e.target === $("nextEventOverlay")) toggle("nextEventOverlay", false);
  });

  function pixBox(ctx, x, y, w, h, fill, p) {
    const notch = (dx, dy, c) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + dx - p, y + dy, w + 2 * p, h);
      ctx.fillRect(x + dx, y + dy - p, w, h + 2 * p);
    };
    notch(p * 1.5, p * 1.5, "#f2a9c9");
    notch(0, 0, "#8a3b68");
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  function wrapText(ctx, text, x, y, maxW, lh, maxLines) {
    const words = String(text).split(/\s+/);
    let line = "",
      lines = [];
    words.forEach((w) => {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    });
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] += "…";
    }
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    return y + lines.length * lh;
  }

  async function makeNextEventImage({ ev, diff }) {
    if (document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('20px "Press Start 2P"'),
          document.fonts.load('600 20px "Pixelify Sans"'),
        ]);
      } catch (e) {}
    }
    const W = 1080,
      H = 1350,
      c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffe3ee";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffd3e6";
    for (let y = 0; y < H; y += 54)
      for (let x = 0; x < W; x += 54)
        if ((x / 54 + y / 54) % 2 === 0) ctx.fillRect(x, y, 54, 54);
    S.draw(ctx, "star", 70, 80, 8);
    S.draw(ctx, "mini", 940, 100, 9, { R: "#c9b3ff" });
    S.draw(ctx, "mini", 60, 1230, 9, { R: "#9be8c4" });
    S.draw(ctx, "star", 950, 1210, 8);

    const x = 90,
      y = 170,
      w = 900,
      h = 1000,
      cx = W / 2;
    pixBox(ctx, x, y, w, h, "#fff5fa", 8);
    ctx.fillStyle = "#ff8cc0";
    ctx.fillRect(x, y, w, 72);
    ctx.fillStyle = "#8a3b68";
    ctx.fillRect(x, y + 72, w, 6);
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillText("♡ next_run.exe", x + 30, y + 48);

    ctx.textAlign = "center";
    ctx.fillStyle = "#b0709a";
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillText("UPCOMING RUN", cx, 330);
    const i = Math.max(0, lastEvents.indexOf(ev));
    pixBox(
      ctx,
      cx - 80,
      370,
      160,
      160,
      /^#[0-9a-f]{6}$/i.test(ev.color) ? ev.color : PASTELS[i % PASTELS.length],
      8,
    );
    ctx.fillStyle = "#000";
    ctx.font = "84px serif";
    ctx.fillText(ev.icon || "🎀", cx, 478);

    ctx.fillStyle = "#6d2b52";
    ctx.font = '38px "Press Start 2P", monospace';
    const afterTitle = wrapText(
      ctx,
      ev.title || "Running Event",
      cx,
      620,
      760,
      56,
      3,
    );
    ctx.fillStyle = "#b0709a";
    ctx.font = '600 34px "Pixelify Sans", sans-serif';
    ctx.fillText(fmtDate(ev.time), cx, afterTitle + 10);
    if (ev.description) {
      ctx.font = '600 30px "Pixelify Sans", sans-serif';
      wrapText(ctx, ev.description, cx, afterTitle + 62, 760, 38, 2);
    }

    const label = countLabel(diff);
    ctx.font = (diff === 0 ? 80 : 150) + 'px "Press Start 2P", monospace';
    ctx.fillStyle = "#e0457f";
    ctx.fillText(label, cx + 8, 1038);
    ctx.fillStyle = "#ff5fa2";
    ctx.fillText(label, cx, 1030);
    ctx.fillStyle = "#6d2b52";
    ctx.font = '600 34px "Pixelify Sans", sans-serif';
    ctx.fillText(
      diff === 0
        ? "Race day is today, good luck! ♡"
        : "days to go, get ready! ♡",
      cx,
      1110,
    );

    ctx.fillStyle = "#8a3b68";
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText("♡ " + CONFIG.PROFILE.name + "'s run log ♡", cx, H - 60);
    return new Promise((res) => c.toBlob(res, "image/png"));
  }

  $("nextEventShareBtn").addEventListener("click", async () => {
    if (!nextEvent) return;
    const btn = $("nextEventShareBtn"),
      st = $("nextEventShareStatus"),
      label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Menyiapkan gambar..";
    st.className = "form-status";
    st.textContent = "";
    try {
      const blob = await makeNextEventImage(nextEvent);
      if (!blob) throw new Error("Canvas is empty");
      const { ev, diff } = nextEvent;
      const text =
        diff === 0
          ? `${ev.title} is today! 🏁`
          : `${ev.title} is in ${diff} days! 🏃‍♀️`;
      const file = new File([blob], "next-run.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Run Log", text });
      } else {
        const url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = "next-run.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        st.textContent = "Image downloaded. Share it from your gallery ♡";
        st.classList.add("ok");
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      st.textContent = "Could not create the image. Try again?";
      st.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  /* ---------- reminder H-1 (notifikasi browser) ---------- */
  const REMINDER_KEY = "runReminders";
  const eventKey = (ev) =>
    ev.id !== undefined && ev.id !== ""
      ? "id:" + ev.id
      : "ev:" + (ev.title || "") + "|" + (ev.time || "");
  function loadReminders() {
    try {
      return JSON.parse(localStorage.getItem(REMINDER_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveReminders(r) {
    try {
      localStorage.setItem(REMINDER_KEY, JSON.stringify(r));
    } catch (e) {}
  }

  function toggleReminder(key, btn) {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    const r = loadReminders();
    if (r[key]) {
      delete r[key];
      saveReminders(r);
      btn.classList.remove("is-active");
      return;
    }
    const arm = () => {
      r[key] = { notified: false };
      saveReminders(r);
      btn.classList.add("is-active");
      checkReminders();
    };
    if (Notification.permission === "granted") arm();
    else if (Notification.permission !== "denied")
      Notification.requestPermission().then((p) => {
        if (p === "granted") arm();
      });
    else alert("Notifikasi diblokir. Aktifkan dulu di pengaturan browser ya.");
  }
  $("todoList").addEventListener("click", (e) => {
    const b = e.target.closest(".todo-bell");
    if (b) toggleReminder(decodeURIComponent(b.dataset.key), b);
  });

  function checkReminders() {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !lastEvents.length
    )
      return;
    const r = loadReminders(),
      now = Date.now();
    let changed = false;
    lastEvents.forEach((ev) => {
      const rem = r[eventKey(ev)],
        d = parseDate(ev);
      if (!rem || rem.notified || !d) return;
      if (now >= d.getTime() - 864e5 && now < d.getTime()) {
        try {
          new Notification("Tomorrow: " + (ev.title || "Running event"), {
            body: ev.description || "Do not forget to get ready! 🏃‍♀️",
            icon: S.uri("heart", 8),
          });
        } catch (e) {}
        rem.notified = true;
        changed = true;
      }
    });
    if (changed) saveReminders(r);
  }

  /* ---------- share progress PNG ---------- */
  function computeStats(events) {
    const total = events.length,
      cl = events.map(classify);
    const done = cl.filter((c) => c.isDone).length,
      canceled = cl.filter((c) => c.isCanceled).length;
    return {
      total,
      done,
      canceled,
      upcoming: total - done - canceled,
      pct: total ? Math.round((done / total) * 100) : 0,
    };
  }

  async function makeProgressImage() {
    if (document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('20px "Press Start 2P"'),
          document.fonts.load('600 20px "Pixelify Sans"'),
        ]);
      } catch (e) {}
    }
    const st = computeStats(lastEvents);
    const W = 1080,
      H = 1350,
      c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffe3ee";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffd3e6";
    for (let y = 0; y < H; y += 54)
      for (let x = 0; x < W; x += 54)
        if ((x / 54 + y / 54) % 2 === 0) ctx.fillRect(x, y, 54, 54);
    S.draw(ctx, "star", 70, 80, 8);
    S.draw(ctx, "mini", 940, 100, 9, { R: "#c9b3ff" });
    S.draw(ctx, "mini", 60, 1230, 9, { R: "#9be8c4" });
    S.draw(ctx, "star", 950, 1210, 8);

    const x = 90,
      y = 170,
      w = 900,
      h = 1000,
      cx = W / 2;
    pixBox(ctx, x, y, w, h, "#fff5fa", 8);
    ctx.fillStyle = "#ff8cc0";
    ctx.fillRect(x, y, w, 72);
    ctx.fillStyle = "#8a3b68";
    ctx.fillRect(x, y + 72, w, 6);
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillText("♡ my_progress.exe", x + 30, y + 48);

    ctx.textAlign = "center";
    ctx.fillStyle = "#b0709a";
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillText("RUNNING JOURNEY", cx, 320);
    ctx.fillStyle = "#6d2b52";
    ctx.font = '32px "Press Start 2P", monospace';
    wrapText(ctx, "Progress " + CONFIG.PROFILE.name, cx, 390, 780, 48, 2);

    ctx.font = '170px "Press Start 2P", monospace';
    ctx.fillStyle = "#e0457f";
    ctx.fillText(st.pct + "%", cx + 8, 628);
    ctx.fillStyle = "#ff5fa2";
    ctx.fillText(st.pct + "%", cx, 620);
    ctx.fillStyle = "#6d2b52";
    ctx.font = '600 32px "Pixelify Sans", sans-serif';
    ctx.fillText("running events completed ♡", cx, 685);

    const bw = 36,
      gap = 6,
      n = 20,
      bx0 = cx - (n * bw + (n - 1) * gap) / 2,
      filled = Math.round(st.pct / 5);
    ctx.fillStyle = "#8a3b68";
    ctx.fillRect(bx0 - 8, 725, n * bw + (n - 1) * gap + 16, 72);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < filled ? "#ff5fa2" : "#ffe3ee";
      ctx.fillRect(bx0 + i * (bw + gap), 733, bw, 56);
      if (i < filled) {
        ctx.fillStyle = "#ff9ec4";
        ctx.fillRect(bx0 + i * (bw + gap), 733, bw, 12);
      }
    }

    const boxes = [
      ["Completed", st.done, "#b6f0d6"],
      ["Upcoming", st.upcoming, "#dccbff"],
      ["Total", st.total, "#fff0a6"],
    ];
    boxes.forEach(([label, val, col], i) => {
      const bx = 150 + i * 280;
      pixBox(ctx, bx, 860, 240, 170, col, 6);
      ctx.fillStyle = "#6d2b52";
      ctx.font = '48px "Press Start 2P", monospace';
      ctx.fillText(String(val), bx + 120, 940);
      ctx.font = '600 26px "Pixelify Sans", sans-serif';
      ctx.fillText(label, bx + 120, 995);
    });

    const unlocked = BADGES.filter((b) => st.done >= b.count).map(
      (b) => b.label,
    );
    ctx.fillStyle = "#6d2b52";
    ctx.font = '600 30px "Pixelify Sans", sans-serif';
    if (unlocked.length)
      wrapText(ctx, unlocked.join("   "), cx, 1100, 780, 40, 2);
    else ctx.fillText("No badges yet, keep going! ♡", cx, 1100);

    ctx.fillStyle = "#8a3b68";
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText("♡ " + CONFIG.PROFILE.name + "'s run log ♡", cx, H - 60);
    return new Promise((res) => c.toBlob(res, "image/png"));
  }

  $("shareBtn").addEventListener("click", async () => {
    const btn = $("shareBtn"),
      st = $("shareStatus"),
      label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Menyiapkan gambar..";
    st.className = "form-status";
    st.textContent = "";
    try {
      const blob = await makeProgressImage();
      if (!blob) throw new Error("Canvas is empty");
      const s = computeStats(lastEvents);
      const text = `My running progress: ${s.done}/${s.total} events completed (${s.pct}%)! 🏃‍♀️💗`;
      const file = new File([blob], "run-progress.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Run Log", text });
      } else {
        const url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = "run-progress.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        st.textContent = "Gambar terunduh, share dari galeri ya ♡";
        st.classList.add("ok");
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      st.textContent = "Could not create the image. Try again?";
      st.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  /* ---------- stats ---------- */
  function renderStats() {
    const total = lastEvents.length;
    const done = lastEvents.filter((e) => classify(e).isDone).length;
    const canceled = lastEvents.filter((e) => classify(e).isCanceled).length;
    const box = (v, l) =>
      `<div class="stat-box"><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`;
    $("statsGrid").innerHTML =
      box(total, "Total Events") +
      box(done, "Completed") +
      box((total ? Math.round((done / total) * 100) : 0) + "%", "Progress") +
      box(total - done - canceled, "Upcoming");
    $("badgesRow").innerHTML = BADGES.map(
      (b) =>
        `<span class="badge-chip${done >= b.count ? "" : " is-locked"}">${b.label}</span>`,
    ).join("");
  }

  /* ---------- bubbles ---------- */
  function startBubbles(list) {
    queue = (list || []).slice(-40);
    clearInterval(bubbleTimer);
    if (!queue.length) return;
    let i = 0;
    const next = () => spawnBubble(queue[i++ % queue.length]);
    next();
    bubbleTimer = setInterval(next, CONFIG.BUBBLE_INTERVAL_MS || 3500);
  }
  function spawnBubble(item) {
    if (!item) return;
    const b = document.createElement("div");
    b.className = "bubble";
    b.style.left = 6 + Math.random() * 55 + "%";
    b.style.setProperty("--drift", Math.round(rand(-30, 30)) + "px");
    b.style.setProperty("--b", pick(PASTELS));
    b.style.animationDuration =
      (CONFIG.BUBBLE_DURATION_S || 12) + rand(-1.5, 1.5) + "s";
    b.innerHTML = `<span class="bubble-name">${esc(item.name || "Anonim")}</span><span class="bubble-msg">${esc(item.message || "")}</span>`;
    $("bubbleLane").appendChild(b);
    b.addEventListener("animationend", () => b.remove());
  }

  /* ---------- modals & form ---------- */
  const toggle = (id, open) => $(id).classList.toggle("is-open", open);
  [
    ["fabBtn", "modalOverlay", "modalClose"],
    ["statsBtn", "statsOverlay", "statsClose"],
  ].forEach(([open, ov, close]) => {
    $(open).addEventListener("click", () => {
      if (ov === "statsOverlay") {
        renderStats();
        $("shareStatus").textContent = "";
      }
      toggle(ov, true);
    });
    $(close).addEventListener("click", () => toggle(ov, false));
    $(ov).addEventListener("click", (e) => {
      if (e.target === $(ov)) toggle(ov, false);
    });
  });
  $("msgInput").addEventListener(
    "input",
    () => ($("charCount").textContent = $("msgInput").value.length),
  );
  $("refreshBtn").addEventListener("click", loadAll);

  $("encouragementForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = $("msgInput").value.trim();
    if (!message) return;
    const payload = { name: $("nameInput").value.trim() || "Anonim", message };
    const btn = $("submitBtn"),
      st = $("formStatus");
    btn.disabled = true;
    btn.textContent = "Mengirim..";
    st.className = "form-status";
    st.textContent = "";
    try {
      if (CONFIG.ENDPOINT_URL) {
        // text/plain avoids a CORS preflight (Apps Script does not support it).
        const res = await fetch(CONFIG.ENDPOINT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("status " + res.status);
      } else MOCK_DATA.semangat.push(payload);
      queue.push(payload);
      spawnBubble(payload);
      st.textContent = "Sent! Thanks for the encouragement ♡";
      st.classList.add("ok");
      e.target.reset();
      $("charCount").textContent = "0";
      setTimeout(() => {
        toggle("modalOverlay", false);
        st.textContent = "";
      }, 1200);
    } catch (err) {
      console.error(err);
      st.textContent = "Could not send it. Try again?";
      st.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Encouragement ♡";
    }
  });

  initTheme();
  initProfile();
  initDecor();
  loadAll();
  setInterval(checkReminders, 60 * 1000);
})();
