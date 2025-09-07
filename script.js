// ---------- Configuration ----------
const STORAGE_KEY = "shot-tracker:v1"; // change this if you ever want to reset saved data

// ---------- State ----------
/**
 * We keep all mutable app data in one object.
 * Keeping "state" centralized makes it easier to read + debug.
 */
const state = {
  made: 0,
  missed: 0,
};

// ---------- DOM Lookups ----------
const el = {
  totalShots: document.getElementById("totalShots"),
  madeShots: document.getElementById("madeShots"),
  missedShots: document.getElementById("missedShots"),
  fgPercentage: document.getElementById("fgPercentage"),
  madeBtn: document.getElementById("madeShotBtn"),
  missedBtn: document.getElementById("missedShotBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

// ---------- Utilities ----------
/**
 * Safely compute a percentage (0–100). If total is 0, return 0 to avoid NaN.
 * Rounded to one decimal place for a nice display (e.g., 42.9%).
 */
function computePercentage(made, total) {
  if (total === 0) return 0;
  return Math.round((made / total) * 1000) / 10; // one decimal
}

/**
 * Read state from localStorage, if it exists.
 * If the stored data is invalid or missing, we fall back to the defaults.
 */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      typeof parsed.made === "number" &&
      typeof parsed.missed === "number"
    ) {
      state.made = parsed.made;
      state.missed = parsed.missed;
    }
  } catch {
    // If JSON is corrupt, ignore and start fresh
  }
}

/**
 * Save current state to localStorage so it persists across reloads.
 */
function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ made: state.made, missed: state.missed })
  );
}

/**
 * Update the DOM to reflect the current state.
 * This is the only place that touches the UI text content.
 */
function render() {
  const total = state.made + state.missed;
  const pct = computePercentage(state.made, total);

  el.totalShots.textContent = String(total);
  el.madeShots.textContent = String(state.made);
  el.missedShots.textContent = String(state.missed);
  el.fgPercentage.textContent = `${pct}%`;
}

/**
 * Centralized function to change state, then save + render.
 * Keeps event handlers tiny and predictable.
 */
function updateState(updater) {
  updater(state);
  save();
  render();
}

// ---------- Event Wiring ----------
function setupEvents() {
  // Button clicks
  el.madeBtn.addEventListener("click", () =>
    updateState((s) => {
      s.made += 1;
    })
  );

  el.missedBtn.addEventListener("click", () =>
    updateState((s) => {
      s.missed += 1;
    })
  );

  el.resetBtn.addEventListener("click", () =>
    updateState((s) => {
      s.made = 0;
      s.missed = 0;
    })
  );

  // Optional keyboard shortcuts:
  // M = made, X = missed, R = reset
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "m") {
      el.madeBtn.click();
    } else if (key === "x") {
      el.missedBtn.click();
    } else if (key === "r") {
      el.resetBtn.click();
    }
  });
}

// ---------- App Init ----------
/**
 * On load:
 * 1) pull any existing data from localStorage
 * 2) render the initial UI
 * 3) attach listeners for user input
 */
(function init() {
  load();
  render();
  setupEvents();
})();
