// --- ICON SYSTEM ---
const icons = {
  clock:
    '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
  "layout-dashboard":
    '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>',
  "bar-chart-2":
    '<line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line>',
  settings:
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  "trash-2":
    '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "pie-chart":
    '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
  calendar:
    '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line>',
  globe:
    '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
  "pause-circle":
    '<circle cx="12" cy="12" r="10"></circle><line x1="10" x2="10" y1="15" y2="9"></line><line x1="14" x2="14" y1="15" y2="9"></line>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
};

function createIcons() {
  document.querySelectorAll("[data-lucide]").forEach((el) => {
    const key = el.getAttribute("data-lucide");
    if (icons[key])
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.getAttribute("width") || 24}" height="${el.getAttribute("width") || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[key]}</svg>`;
  });
}

// --- STATE MANAGEMENT ---
let state = {
  onboarded: false,
  activeTab: "website",
  timerState: {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
    taskName: "",
  },
  sessions: [],
  websiteStats: {},
  summaryFilter: "week",
};

let showAllHistory = false;
let timerInterval;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load Data
  await loadData();

  // 2. Initialize Icons
  createIcons();

  // 3. Setup Listeners
  setupEventListeners();

  // 4. Route View
  if (state.onboarded) {
    showDashboard();
  } else {
    showWelcome();
  }

  // 5. Initial Render
  refreshAllViews();

  // 6. Resume Timer if needed
  if (state.timerState.isRunning) {
    startTicker();
  } else if (
    state.timerState.taskName &&
    state.timerState.accumulatedTime > 0
  ) {
    // Just update display if paused
    const mainTimer = document.getElementById("main-timer");
    if (mainTimer)
      mainTimer.textContent = formatTime(state.timerState.accumulatedTime);
  }

  // 7. Poll for Website Stats (Background updates storage, we read it)
  setInterval(async () => {
    const data = await browser.storage.local.get("websiteStats");
    state.websiteStats = data.websiteStats || {};

    if (state.onboarded) {
      // Only re-render website list if it's the active tab to save perf
      if (state.activeTab === "website") renderWebsiteStats();

      // Always update overview stats as they might change
      updateOverviewStats();
    }
  }, 2000);
});

async function loadData() {
  const data = await browser.storage.local.get([
    "trackly_onboarded",
    "sessions",
    "websiteStats",
    "timerState",
  ]);

  state.onboarded = data.trackly_onboarded || false;
  state.sessions = Array.isArray(data.sessions) ? data.sessions : [];
  state.websiteStats = data.websiteStats || {};
  state.timerState = data.timerState || {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
    taskName: "",
  };
}

function refreshAllViews() {
  updateUI();
  renderHistory();
  renderWebsiteStats();
  renderTaskStats();
  renderSummary();
}

// --- TIMER LOGIC (CRITICAL) ---

function startSession(taskName = "Untitled Task") {
  // If a session is already active (running or paused), stop it first
  if (state.timerState.taskName) {
    stopSession();
  }

  state.timerState = {
    isRunning: true,
    startTime: Date.now(),
    accumulatedTime: 0,
    taskName: taskName,
  };

  saveState();
  refreshAllViews(); // Updates history list to show active row
  startTicker();
}

function togglePause() {
  // Case 1: Start (if button says Start but logic calls pause)
  if (!state.timerState.taskName) {
    startSession("Quick Session");
    return;
  }

  const now = Date.now();

  // Case 2: Pause
  if (state.timerState.isRunning) {
    // Add current elapsed time to accumulation
    state.timerState.accumulatedTime += now - state.timerState.startTime;
    state.timerState.isRunning = false;
    state.timerState.startTime = null;
    clearInterval(timerInterval); // Stop ticking
  }
  // Case 3: Resume
  else {
    state.timerState.isRunning = true;
    state.timerState.startTime = now;
    startTicker(); // Resume ticking
  }

  saveState();
  updateUI(); // Update buttons/text
}

function stopSession() {
  if (!state.timerState.taskName) return;

  const finalDuration = calculateElapsed();

  // Don't save empty sessions (< 1 second)
  if (finalDuration > 1000) {
    const newSession = {
      id: Date.now(),
      task: state.timerState.taskName,
      duration: finalDuration,
      date: new Date().toLocaleDateString(),
      timeStr: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      startTime: new Date().toISOString(),
    };
    state.sessions.push(newSession);
  }

  // Reset State
  state.timerState = {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
    taskName: "",
  };

  saveState();
  clearInterval(timerInterval);
  refreshAllViews();
}

function calculateElapsed() {
  let t = state.timerState.accumulatedTime;
  if (state.timerState.isRunning && state.timerState.startTime) {
    t += Date.now() - state.timerState.startTime;
  }
  return t;
}

function startTicker() {
  // Clear existing to avoid doubles
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const elapsed = calculateElapsed();
    const fmt = formatTime(elapsed);

    // Update Dashboard Main Timer
    const mainTimer = document.getElementById("main-timer");
    if (mainTimer) mainTimer.textContent = fmt;

    // Update History Active Row Timer
    const histTimer = document.getElementById("active-history-time");
    if (histTimer) histTimer.textContent = fmt;
  }, 1000);
}

// --- UI UPDATES ---

function updateUI() {
  const bannerTask = document.getElementById("active-task-label");
  const mainTimer = document.getElementById("main-timer");
  const pauseBtn = document.getElementById("banner-pause-btn");

  if (state.timerState.taskName) {
    bannerTask.textContent = state.timerState.taskName;

    // --- BUTTON MANAGEMENT ---
    // We clone to remove old listeners easily
    const newBtn = pauseBtn.cloneNode(true);
    pauseBtn.parentNode.replaceChild(newBtn, pauseBtn);

    // Add Stop Button if missing
    let stopBtn = document.getElementById("banner-stop-btn");
    if (!stopBtn) {
      newBtn.insertAdjacentHTML(
        "afterend",
        `<button id="banner-stop-btn" class="action-btn" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; width: auto; margin-left: 8px;">Stop</button>`,
      );
      stopBtn = document.getElementById("banner-stop-btn");
    }

    // Attach Listeners
    newBtn.addEventListener("click", togglePause);
    document
      .getElementById("banner-stop-btn")
      .addEventListener("click", stopSession);

    // Update Button State
    if (state.timerState.isRunning) {
      newBtn.textContent = "Pause";
      newBtn.className = "btn-secondary";
      newBtn.style =
        "padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem;";
    } else {
      newBtn.textContent = "Resume";
      newBtn.className = "btn-start-session";
      newBtn.style =
        "padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; background: var(--primary); color: #0b0f19;";
    }

    // Set Timer Value immediately (prevents 00:00:00 flash)
    mainTimer.textContent = formatTime(calculateElapsed());
  } else {
    // Idle State
    bannerTask.textContent = "No active task";
    mainTimer.textContent = "00:00:00";

    // Remove Stop Button
    const stopBtn = document.getElementById("banner-stop-btn");
    if (stopBtn) stopBtn.remove();

    // Reset Pause Button to Start
    const newBtn = pauseBtn.cloneNode(true);
    pauseBtn.parentNode.replaceChild(newBtn, pauseBtn);
    newBtn.textContent = "Start";
    newBtn.className = "btn-secondary";
    newBtn.style =
      "padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem;";

    // Clicking "Start" in banner starts a default session
    newBtn.addEventListener("click", () => startSession("Quick Session"));
  }

  updateOverviewStats();
}

function updateOverviewStats() {
  const today = new Date().toISOString().split("T")[0];
  let displayTotal = 0;

  // Calculate total based on active tab context
  if (state.activeTab === "website") {
    const todayStats = state.websiteStats[today] || {};
    displayTotal = Object.values(todayStats).reduce((a, b) => a + b, 0);
  } else {
    const todaySessions = state.sessions.filter(
      (s) => s.date === new Date().toLocaleDateString(),
    );
    displayTotal = todaySessions.reduce((acc, s) => acc + s.duration, 0);
    // Add current running time
    if (state.timerState.taskName) displayTotal += calculateElapsed();
  }

  document.getElementById("dash-total-time").textContent =
    formatDurationShort(displayTotal);

  // Calculate Most Used
  const todaySessions = state.sessions.filter(
    (s) => s.date === new Date().toLocaleDateString(),
  );
  const counts = {};
  todaySessions.forEach(
    (s) => (counts[s.task] = (counts[s.task] || 0) + s.duration),
  );

  // Add active task to "Most Used" calc
  if (state.timerState.taskName) {
    counts[state.timerState.taskName] =
      (counts[state.timerState.taskName] || 0) + calculateElapsed();
  }

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const mostUsedEl = document.querySelector(
    "#overview-most-used div:nth-child(2) div:nth-child(2)",
  );

  // ----- Most used website (today) -----

  const todayKey = new Date().toISOString().split("T")[0];
  const todayWeb = state.websiteStats[todayKey] || {};

  const topWebsite = Object.entries(todayWeb).sort((a, b) => b[1] - a[1])[0];

  // this element must already exist in your HTML
  // (same as you had before)
  const websiteEl = document.getElementById("overview-top-website");

  if (websiteEl) {
    websiteEl.textContent = topWebsite ? topWebsite[0] : "No Data";
    websiteEl.parentElement.style.opacity = topWebsite ? "1" : "0.5";
  }

  if (mostUsedEl) {
    mostUsedEl.textContent = top ? top[0] : "No Data";
    mostUsedEl.parentElement.parentElement.style.opacity = top ? "1" : "0.5";
  }

  // Session Count
  document.getElementById("dash-session-count").textContent =
    todaySessions.length + (state.timerState.taskName ? 1 : 0);
}

// --- RENDERERS ---

function renderWebsiteStats() {
  const list = document.getElementById("content-website");
  list.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  const todayStats = state.websiteStats[today] || {};
  const stats = Object.entries(todayStats).sort((a, b) => b[1] - a[1]);

  if (stats.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Browsing activity will appear here...</div>`;
  } else {
    const max = stats[0][1];
    stats.forEach(([domain, duration]) => {
      const percent = (duration / max) * 100;
      const html = `
                <div class="website-item">
                    <div class="website-header"><span>${domain}</span><span>${formatDurationShort(duration)}</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${percent}%;"></div></div>
                </div>
            `;
      list.insertAdjacentHTML("beforeend", html);
    });
  }
}

function renderTaskStats() {
  const container = document.getElementById("task-list-container");
  container.innerHTML = "";

  const taskData = {};
  state.sessions.forEach((s) => {
    taskData[s.task] = (taskData[s.task] || 0) + s.duration;
  });
  const sortedTasks = Object.entries(taskData).sort((a, b) => b[1] - a[1]);

  if (sortedTasks.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">No tasks tracked yet.</div>`;
  } else {
    const max = sortedTasks[0][1];
    sortedTasks.forEach(([task, duration]) => {
      const percent = (duration / max) * 100;
      const html = `
                <div class="website-item">
                    <div class="website-header"><span>${task}</span><span>${formatDurationShort(duration)}</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${percent}%; background: #8b5cf6;"></div></div>
                </div>
            `;
      container.insertAdjacentHTML("beforeend", html);
    });
  }
}

function renderHistory() {
  const list = document.getElementById("session-history-list");
  list.innerHTML = "";

  // 1. Active Row
  if (state.timerState.taskName) {
    list.insertAdjacentHTML(
      "beforeend",
      `
            <div class="history-mini-item active-session" id="active-history-row">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${state.timerState.taskName}</div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <span class="tag tag-active">ACTIVE</span>
                        <span style="font-size: 0.75rem; color: var(--primary);">Tracking...</span>
                    </div>
                </div>
                <div style="font-family:monospace; font-weight:600; color:var(--text-main);" id="active-history-time">
                    ${formatTime(calculateElapsed())}
                </div>
            </div>
        `,
    );
  }

  // 2. Completed Rows
  let sessionsToRender;
  if (showAllHistory) {
    sessionsToRender = [...state.sessions].reverse();
  } else {
    const today = new Date().toLocaleDateString();
    sessionsToRender = state.sessions.filter((s) => s.date === today).reverse();
  }

  if (sessionsToRender.length === 0 && !state.timerState.taskName) {
    list.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">No sessions.</div>`;
    return;
  }

  sessionsToRender.forEach((item) => {
    list.insertAdjacentHTML(
      "beforeend",
      `
            <div class="history-mini-item">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${item.task}</div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <span class="tag tag-work">Log</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${item.timeStr}</span>
                    </div>
                </div>
                <div style="font-family:monospace; font-weight:600; color:var(--text-muted);">${formatDurationShort(item.duration)}</div>
            </div>
        `,
    );
  });
}

// --- SUMMARY RENDERERS ---

function renderSummary() {
  const range = state.summaryFilter;
  const dates = [];
  const today = new Date();

  // Logic for dates
  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
  }

  let totalMs = 0;
  let taskCounts = {};
  let webCounts = {};
  let activeDays = new Set();
  let historyRows = [];

  // Tasks
  state.sessions.forEach((s) => {
    if (!s.startTime) return;
    const sDate = s.startTime.split("T")[0];
    if (dates.includes(sDate)) {
      totalMs += s.duration;
      taskCounts[s.task] = (taskCounts[s.task] || 0) + s.duration;
      activeDays.add(sDate);
      historyRows.push(s);
    }
  });

  // Websites
  let totalWebMs = 0;
  dates.forEach((date) => {
    if (state.websiteStats[date]) {
      Object.entries(state.websiteStats[date]).forEach(([domain, dur]) => {
        webCounts[domain] = (webCounts[domain] || 0) + dur;
        totalWebMs += dur;
      });
      if (totalWebMs > 0) activeDays.add(date);
    }
  });

  const grandTotal = totalWebMs;

  document.getElementById("sum-total-time").textContent =
    formatDurationShort(grandTotal);

  document.getElementById("sum-active-days").textContent =
    `${activeDays.size} Days`;

  const topTask = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("sum-top-task").textContent = topTask
    ? topTask[0]
    : "No Data";

  const topWebsite = Object.entries(webCounts).sort((a, b) => b[1] - a[1])[0];

  const topWebsiteEl = document.getElementById("sum-top-website");
  if (topWebsiteEl) {
    topWebsiteEl.textContent = topWebsite ? topWebsite[0] : "No Data";
  }

  renderSummaryChart(dates);
  renderSummaryTasks(taskCounts);
  renderSummaryWebsites(webCounts);
  renderDetailedHistory(historyRows);
}

function renderSummaryTasks(counts) {
  const container = document.getElementById("summary-tasks-list");
  container.innerHTML = "";
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:10px; color:#64748b;">No data.</div>`;
    return;
  }

  const colors = ["purple", "blue", "teal", "orange", "grey"];

  sorted.forEach(([label, val], index) => {
    const colorClass = colors[index % colors.length];
    container.insertAdjacentHTML(
      "beforeend",
      `
            <div class="task-pill ${colorClass}">
                <span>${label}</span>
                <span>${formatDurationShort(val)}</span>
            </div>
        `,
    );
  });
}

function renderSummaryWebsites(counts) {
  const container = document.getElementById("summary-website-list");
  container.innerHTML = "";
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const max = sorted[0] ? sorted[0][1] : 1;

  if (sorted.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:10px; color:#64748b;">No data.</div>`;
    return;
  }

  sorted.forEach(([label, val]) => {
    const pct = (val / max) * 100;
    container.insertAdjacentHTML(
      "beforeend",
      `
            <div class="web-list-item">
                <div class="web-header"><span>${label}</span><span>${formatDurationShort(val)}</span></div>
                <div class="web-progress-bg"><div class="web-progress-fill" style="width: ${pct}%;"></div></div>
            </div>
        `,
    );
  });
}

function renderSummaryChart(dates) {
  const chartContainer = document.getElementById("activity-chart");
  const labelContainer = document.getElementById("activity-labels");
  chartContainer.innerHTML = "";
  labelContainer.innerHTML = "";

  const dailyTotals = dates.map((date) => {
    let dailySum = 0;
    state.sessions.forEach((s) => {
      if (s.startTime && s.startTime.startsWith(date)) dailySum += s.duration;
    });
    if (state.websiteStats[date]) {
      dailySum += Object.values(state.websiteStats[date]).reduce(
        (a, b) => a + b,
        0,
      );
    }
    return dailySum;
  });

  const maxVal = Math.max(...dailyTotals, 1);

  dailyTotals.forEach((val, index) => {
    const height = (val / maxVal) * 100;
    const d = new Date(dates[index]);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    chartContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="chart-bar" style="height: ${height}%;" title="${formatDurationShort(val)}"></div>`,
    );
    labelContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="chart-label">${dayLabel}</div>`,
    );
  });
}

function renderDetailedHistory(sessions) {
  const list = document.getElementById("detailed-history-body");
  list.innerHTML = "";
  sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  if (sessions.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">No records.</div>`;
    return;
  }

  sessions.forEach((s) => {
    const d = new Date(s.startTime);
    const dateStr = d.toLocaleDateString();
    const timeRange = s.timeStr;

    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
            <div style="flex: 1.5;">${dateStr}</div>
            <div style="flex: 1.5;">${timeRange}</div>
            <div style="flex: 2; font-weight: 500;">${s.task}</div>
            <div style="flex: 1; font-family: monospace;">${formatDurationShort(s.duration)}</div>
            <div style="flex: 0.5; text-align: right;">
                <button class="icon-action-btn delete-btn"><i data-lucide="trash-2" width="16"></i></button>
            </div>
        `;
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => deleteSession(s.id));
    list.appendChild(row);
  });
  createIcons();
}

// --- UTILS ---
function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDurationShort(ms) {
  const totalMin = Math.floor(ms / 1000 / 60);
  if (totalMin < 1) return "< 1m";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function deleteSession(id) {
  if (confirm("Delete record?")) {
    state.sessions = state.sessions.filter((s) => s.id !== id);
    saveState();
    refreshAllViews();
  }
}

async function saveState() {
  await browser.storage.local.set({
    timerState: state.timerState,
    sessions: state.sessions,
  });
}

function showDashboard() {
  document.getElementById("view-welcome").classList.add("hidden");
  document.getElementById("view-dashboard").classList.remove("hidden");
  document.getElementById("app-sidebar").classList.remove("hidden");
}
function showWelcome() {
  document.getElementById("view-welcome").classList.remove("hidden");
  document.getElementById("view-dashboard").classList.add("hidden");
  document.getElementById("app-sidebar").classList.add("hidden");
}
function switchView(view) {
  document.getElementById("view-dashboard").classList.add("hidden");
  document.getElementById("view-summary").classList.add("hidden");
  document.getElementById(`view-${view}`).classList.remove("hidden");
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`nav-${view}`).classList.add("active");
  if (view === "summary") renderSummary();
}

function setupEventListeners() {
  document
    .getElementById("nav-dashboard")
    .addEventListener("click", () => switchView("dashboard"));
  document
    .getElementById("nav-summary")
    .addEventListener("click", () => switchView("summary"));
  document
    .getElementById("back-to-dash")
    .addEventListener("click", () => switchView("dashboard"));

  document.getElementById("view-history-link").addEventListener("click", () => {
    const card = document.querySelector(".session-history-card");
    const btn = document.getElementById("view-history-link");

    const expanded = card.classList.toggle("expanded-history");
    showAllHistory = expanded;

    btn.textContent = expanded ? "Collapse" : "View All";

    renderHistory();
  });

  const onboardBtn = document.getElementById("btn-onboard");
  if (onboardBtn)
    onboardBtn.addEventListener("click", () => {
      browser.storage.local.set({ trackly_onboarded: true });
      state.onboarded = true;
      showDashboard();
    });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      state.summaryFilter = e.target.getAttribute("data-range");
      renderSummary();
    });
  });

  document
    .getElementById("qa-new-session")
    .addEventListener("click", () => startSession("New Session"));

  document.getElementById("btn-manual-start").addEventListener("click", () => {
    const input = document.getElementById("manual-task-input");
    const taskName = input.value.trim() || "Manual Task";
    startSession(taskName);
    input.value = "";
  });

  document.getElementById("qa-clear").addEventListener("click", async () => {
    if (confirm("Clear today's data?")) {
      const today = new Date().toLocaleDateString();
      state.sessions = state.sessions.filter((s) => s.date !== today);
      browser.runtime.sendMessage({ type: "CLEAR_TODAY_WEBSITE_STATS" });
      await saveState();
      refreshAllViews();
    }
  });

 document.getElementById("qa-export").addEventListener("click", () => {

  const rows = [];

  // ---------- TASK SESSIONS ----------
  state.sessions.forEach(s => {
    rows.push([
  "task",
  s.date,
  s.timeStr,
  s.task,
  (s.duration / 60000).toFixed(2)
].join(","));

  });

  // ---------- WEBSITE STATS ----------
  Object.entries(state.websiteStats).forEach(([date, sites]) => {
    Object.entries(sites).forEach(([domain, duration]) => {
      rows.push([
  "website",
  date,
  "",
  domain,
  (duration / 60000).toFixed(2)
].join(","));

    });
  });

  if (rows.length === 0) {
    alert("No data to export.");
    return;
  }

  const header = "type,date,time,name,duration_min\n";

  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "trackly_export.csv";
  a.click();
});


  document.getElementById("tab-task").addEventListener("click", () => {
    state.activeTab = "task";
    document.getElementById("tab-task").classList.add("active");
    document.getElementById("tab-website").classList.remove("active");
    document.getElementById("content-task").classList.remove("hidden");
    document.getElementById("content-website").classList.add("hidden");
    renderTaskStats();
    updateOverviewStats();
  });

  document.getElementById("tab-website").addEventListener("click", () => {
    state.activeTab = "website";
    document.getElementById("tab-website").classList.add("active");
    document.getElementById("tab-task").classList.remove("active");
    document.getElementById("content-website").classList.remove("hidden");
    document.getElementById("content-task").classList.add("hidden");
    renderWebsiteStats();
    updateOverviewStats();
  });
}
