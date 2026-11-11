(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const S = window.PixelSprites;
  const SESSION_KEY = "rj_admin_pw";
  const PASTELS = [
    "#ffc2dd",
    "#dccbff",
    "#b6f0d6",
    "#fff0a6",
    "#bde7ff",
    "#ffd1b8",
  ];
  const DEFAULT_COLOR = "#ffc2dd";
  let events = [],
    pendingDeleteId = null;

  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const getPw = () => sessionStorage.getItem(SESSION_KEY) || "";
  const open = (id, on) => $(id).classList.toggle("is-open", on);
  const setStatus = (el, msg, cls) => {
    el.textContent = msg || "";
    el.className = "form-status" + (cls ? " " + cls : "");
  };
  const fmtDate = (v) => {
    const d = new Date(v);
    return isNaN(d)
      ? v || ""
      : new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
  };

  /* ---------- theme, decoration ---------- */
  const root = document.documentElement;
  const icon = () =>
    ($("themeToggle").textContent =
      root.getAttribute("data-theme") === "dark" ? "☀️" : "🌙");
  icon();
  $("themeToggle").addEventListener("click", () => {
    const n = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", n);
    try {
      localStorage.setItem("theme", n);
    } catch (e) {}
    icon();
  });
  $("loginAvatar").src = S.uri("girl", 4);
  $("favicon").href = S.uri("heart", 3);
  for (let i = 0; i < 10; i++) {
    const im = new Image();
    im.src = S.uri(i % 2 ? "star" : "mini", 4);
    im.className = "decor-item " + (i % 2 ? "twinkle" : "bob");
    im.style.left = Math.random() * 94 + "%";
    im.style.top = Math.random() * 90 + "%";
    $("decor").appendChild(im);
  }

  /* ---------- network ---------- */
  function callApi(payload) {
    if (!CONFIG.ENDPOINT_URL)
      return Promise.reject(
        new Error("ENDPOINT_URL is not set in js/config.js"),
      );
    const ctrl = new AbortController(),
      t = setTimeout(() => ctrl.abort(), 12000);
    // text/plain avoids a CORS preflight (Apps Script does not support it).
    return fetch(CONFIG.ENDPOINT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .finally(() => clearTimeout(t));
  }
  function fetchData() {
    const ctrl = new AbortController(),
      t = setTimeout(() => ctrl.abort(), 12000);
    return fetch(CONFIG.ENDPOINT_URL, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .finally(() => clearTimeout(t));
  }

  /* ---------- auth ---------- */
  function showLogin(msg) {
    $("dashView").hidden = true;
    $("loginView").hidden = false;
    if (msg) setStatus($("loginStatus"), msg, "err");
  }
  function showDash() {
    $("loginView").hidden = true;
    $("dashView").hidden = false;
    loadEvents();
  }

  function attemptSession() {
    const pw = getPw();
    if (!pw) return showLogin();
    callApi({ action: "login", password: pw })
      .then((r) => {
        if (r.ok) showDash();
        else {
          sessionStorage.removeItem(SESSION_KEY);
          showLogin("Your session has expired. Please sign in again.");
        }
      })
      .catch(() =>
        showLogin("The server could not be reached. Please try again."),
      );
  }

  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = $("pwInput").value,
      btn = $("loginBtn");
    btn.disabled = true;
    btn.textContent = "Checking..";
    setStatus($("loginStatus"), "");
    callApi({ action: "login", password: pw })
      .then((r) => {
        if (r.ok) {
          sessionStorage.setItem(SESSION_KEY, pw);
          showDash();
        } else
          setStatus($("loginStatus"), r.error || "Incorrect password.", "err");
      })
      .catch((err) =>
        setStatus(
          $("loginStatus"),
          err.message || "The server could not be reached.",
          "err",
        ),
      )
      .finally(() => {
        btn.disabled = false;
        btn.textContent = "Sign In ♡";
      });
  });
  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    $("pwInput").value = "";
    showLogin();
  });

  /* ---------- list ---------- */
  function loadEvents() {
    $("adminListState").hidden = false;
    $("adminListState").textContent = "Loading.. ♡";
    $("adminList").hidden = true;
    fetchData()
      .then((d) => {
        events = d.events || [];
        render();
      })
      .catch((err) => {
        console.error(err);
        $("adminListState").textContent = "Could not load data. Try ⟳ again.";
      });
  }

  function render() {
    if (!events.length) {
      $("adminListState").hidden = false;
      $("adminListState").textContent = 'No events yet. Click "+ Add Event".';
      $("adminList").hidden = true;
      return;
    }
    $("adminListState").hidden = true;
    $("adminList").hidden = false;
    $("adminList").innerHTML = events
      .map((ev, i) => {
        const st = String(ev.status || "pending").toLowerCase();
        const color = /^#[0-9a-f]{6}$/i.test(ev.color)
          ? ev.color
          : PASTELS[i % PASTELS.length];
        return `<li class="todo-item${st === "done" ? " is-done" : ""}${st === "active" ? " is-active" : ""}${st === "canceled" ? " is-canceled" : ""}">
        <div class="todo-icon" style="background:${color}">${esc(ev.icon || "🎀")}</div>
        <div class="todo-body">
          <p class="todo-title">${esc(ev.title || "Untitled")}</p>
          <p class="todo-desc">${esc(ev.description || "")}</p>
          ${ev.time ? `<p class="todo-time">${esc(fmtDate(ev.time))}</p>` : ""}
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" title="Edit" data-action="edit" data-id="${esc(ev.id)}">✏️</button>
          <button class="icon-btn danger" title="Delete" data-action="delete" data-id="${esc(ev.id)}">🗑️</button>
        </div></li>`;
      })
      .join("");
  }

  $("adminList").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const ev = events.find((r) => String(r.id) === btn.dataset.id);
    if (!ev) return;
    if (btn.dataset.action === "edit") openEvent(ev);
    else openDelete(ev);
  });
  $("reloadBtn").addEventListener("click", loadEvents);

  /* ---------- add / edit ---------- */
  function openEvent(ev) {
    $("eventForm").reset();
    setStatus($("eventFormStatus"), "");
    $("eventModalTitle").textContent = ev
      ? "✏️ edit_event.exe"
      : "♡ new_event.exe";
    $("eventId").value = ev ? ev.id : "";
    $("colorInput").value =
      ev && /^#[0-9a-f]{6}$/i.test(ev.color) ? ev.color : DEFAULT_COLOR;
    $("statusInput").value = "pending";
    if (ev) {
      $("iconInput").value = ev.icon || "";
      $("titleInput").value = ev.title || "";
      $("descInput").value = ev.description || "";
      $("timeInput").value = ev.time || "";
      const s = String(ev.status).toLowerCase();
      if (["pending", "active", "done", "canceled"].includes(s))
        $("statusInput").value = s;
    }
    open("eventModal", true);
  }
  $("openAddBtn").addEventListener("click", () => openEvent(null));
  $("eventModalClose").addEventListener("click", () =>
    open("eventModal", false),
  );
  $("eventModal").addEventListener("click", (e) => {
    if (e.target === $("eventModal")) open("eventModal", false);
  });

  $("eventForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("eventId").value,
      btn = $("eventSubmitBtn");
    const payload = {
      action: id ? "updateEvent" : "addEvent",
      password: getPw(),
      id: id || undefined,
      icon: $("iconInput").value.trim() || "🎀",
      color: $("colorInput").value,
      title: $("titleInput").value.trim(),
      description: $("descInput").value.trim(),
      time: $("timeInput").value.trim(),
      status: $("statusInput").value,
    };
    btn.disabled = true;
    btn.textContent = "Saving..";
    setStatus($("eventFormStatus"), "");
    callApi(payload)
      .then((r) => {
        if (!r.ok) throw new Error(r.error || "Could not save the event");
        open("eventModal", false);
        loadEvents();
      })
      .catch((err) =>
        setStatus(
          $("eventFormStatus"),
          err.message || "Could not save the event.",
          "err",
        ),
      )
      .finally(() => {
        btn.disabled = false;
        btn.textContent = "Save Event";
      });
  });

  /* ---------- delete ---------- */
  function openDelete(ev) {
    pendingDeleteId = ev.id;
    $("deleteModalText").textContent =
      `"${ev.title}" will be permanently deleted from your sheet.`;
    setStatus($("deleteFormStatus"), "");
    open("deleteModal", true);
  }
  const closeDelete = () => {
    open("deleteModal", false);
    pendingDeleteId = null;
  };
  $("deleteModalClose").addEventListener("click", closeDelete);
  $("deleteCancelBtn").addEventListener("click", closeDelete);
  $("deleteModal").addEventListener("click", (e) => {
    if (e.target === $("deleteModal")) closeDelete();
  });

  $("deleteConfirmBtn").addEventListener("click", () => {
    if (!pendingDeleteId) return;
    const btn = $("deleteConfirmBtn");
    btn.disabled = true;
    btn.textContent = "Deleting..";
    callApi({ action: "deleteEvent", password: getPw(), id: pendingDeleteId })
      .then((r) => {
        if (!r.ok) throw new Error(r.error || "Could not delete the event");
        closeDelete();
        loadEvents();
      })
      .catch((err) =>
        setStatus(
          $("deleteFormStatus"),
          err.message || "Could not delete the event.",
          "err",
        ),
      )
      .finally(() => {
        btn.disabled = false;
        btn.textContent = "Delete";
      });
  });

  attemptSession();
})();
