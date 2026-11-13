/* Medications panel for Home Assistant (med_manager). Plain web component, no build step. */

const DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ORD = ["1st", "2nd", "3rd", "4th", "last"];
const FORMS = ["tablet", "capsule", "liquid", "injection", "inhaler", "patch", "drops", "cream", "powder", "other"];
const TABS = [
  ["today", "Today", "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"],
  ["people", "People", "M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"],
  ["meds", "Medications", "M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z"],
  ["pharmacies", "Pharmacies", "M6,4H18V5H21V7H18V9H17V20H7V9H6V7H3V5H6V4M11,15V18H13V15H16V13H13V10H11V13H8V15H11Z"],
  ["history", "History", "M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"],
  ["help", "Help", "M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"],
  ["settings", "Settings", "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"],
];
const SWATCHES = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#00897b", "#00acc1", "#1e88e5", "#3949ab",
  "#8e24aa", "#d81b60", "#6d4c41", "#78909c", "#f5f5f5"];
const ACCENTS = ["", "#03a9f4", "#1e88e5", "#3949ab", "#8e24aa", "#d81b60", "#e53935", "#fb8c00", "#43a047", "#00897b", "#546e7a"];
// Extra colours offered next to the standard ones.
const HOME_COLORS = ["#5e7d71", "#4e8ea2", "#4a59aa", "#3a3c3e", "#7fa88f", "#86bde1", "#b8965a", "#c08a55", "#e2b33f",
  "#d9a520", "#ff7a14", "#f59e0b", "#0392b5", "#35bbca", "#85cbcc", "#007aff", "#5b86f0", "#8dc25c", "#78ae46",
  "#7b81be", "#4a90e2", "#9b59b6", "#e27d4a", "#e74c3c", "#33a02c", "#f1c40f", "#c4625a", "#94a3b8"];
// 20 soft palettes (for Neumorphism and the rest). "Same as dashboard" follows input_select.home_palette when it exists.
// [background, shadow dark, shadow light, text, muted text, accent, second accent]
const HOME_SCHEMES = {
  "Calm": ["#e6e9ea", "#c3c8cb", "#ffffff", "#4e6b61", "#86958f", "#5e7d71", "#7fa88f"],
  "Blue": ["#bdd8e9", "#97b6ca", "#ffffff", "#0a4174", "#49769f", "#4e8ea2", "#7bbde8"],
  "Mono": ["#eef0f2", "#c8ccd2", "#fafaff", "#1c1c1c", "#6b6e72", "#3a3c3e", "#8a8d91"],
  "Dusk": ["#bfbcb8", "#9c9995", "#dcd9d4", "#28305c", "#666472", "#4a59aa", "#86bde1"],
  "Pastel": ["#ecf0f3", "#bbc6d5", "#ffffff", "#5c5c62", "#8a8e99", "#7b81be", "#f88ab0"],
  "Modern": ["#f5f5f7", "#d4d4d9", "#ffffff", "#1d1d1f", "#86868b", "#007aff", "#007aff"],
  "Forest": ["#daf1de", "#b3cdb9", "#f3fbf4", "#0b2b26", "#4f7a66", "#235347", "#8eb69b"],
  "Spectrum": ["#e9edf2", "#c8cfda", "#ffffff", "#4a4f5a", "#8a909c", "#5b86f0", "#7dd8b0"],
  "Sky": ["#e1e6e6", "#bcc4c6", "#ffffff", "#2e5a78", "#6f8fa3", "#67abd6", "#c3b0d6"],
  "Sorbet": ["#faeed3", "#decda9", "#fffbf0", "#2f6b6c", "#5e8583", "#85cbcc", "#a7d676"],
  "Meadow": ["#eef5e3", "#ccd8bb", "#fbfdf7", "#3f5a2a", "#6e8a5a", "#8dc25c", "#fbc78d"],
  "Lime": ["#e4f2d5", "#c2d6ae", "#f7fcf1", "#3f5a2a", "#64824d", "#78ae46", "#fbc78d"],
  "Tropic": ["#eceded", "#c9cbcc", "#ffffff", "#234b55", "#6a8288", "#0392b5", "#d4e01a"],
  "Tropic Bright": ["#eceded", "#c9cbcc", "#ffffff", "#234b55", "#6a8288", "#0392b5", "#d4e01a"],
  "Lagoon": ["#dcf1f3", "#b6d2d5", "#f6fcfd", "#234b55", "#6a8288", "#0392b5", "#d4e01a"],
  "Sunshine": ["#fbf6d9", "#dcd6b3", "#fffef5", "#234b55", "#6a8288", "#0392b5", "#d4e01a"],
  "Citron": ["#eff5d2", "#ced6ae", "#fbfdf0", "#234b55", "#6a8288", "#0392b5", "#d4e01a"],
  "Soft Blue": ["#dce7f2", "#b2c1d1", "#ffffff", "#334155", "#64748b", "#3b82f6", "#3b82f6"],
  "Navy": ["#1e293b", "#0f172a", "#334155", "#e2e8f0", "#94a3b8", "#38bdf8", "#10b981"],
  "Flat": ["#e6e9ea", "#e6e9ea", "#e6e9ea", "#4e6b61", "#86958f", "#5e7d71", "#7fa88f"],
};
// Glassmorphism palettes: a colourful backdrop behind frosted cards.
// base = page colour, blobs = three glow colours, tint = frosting (light/dark), then text, muted text, accent.
const GLASS_SCHEMES = {
  "Aurora Night": { base: "#0b1020", blobs: ["#2dd4bf", "#8b5cf6", "#3b82f6"], tint: "dark", text: "#eef2ff", muted: "#a5b4fc", accent: "#5eead4" },
  "Midnight": { base: "#0f172a", blobs: ["#6366f1", "#0ea5e9", "#a855f7"], tint: "dark", text: "#e2e8f0", muted: "#94a3b8", accent: "#818cf8" },
  "Sunset": { base: "#2a1033", blobs: ["#fb923c", "#ec4899", "#8b5cf6"], tint: "dark", text: "#fff7ed", muted: "#fdba74", accent: "#fb923c" },
  "Emerald": { base: "#04211a", blobs: ["#10b981", "#84cc16", "#0ea5e9"], tint: "dark", text: "#ecfdf5", muted: "#a7f3d0", accent: "#34d399" },
  "Ocean": { base: "#e0f2fe", blobs: ["#38bdf8", "#22d3ee", "#6366f1"], tint: "light", text: "#0c4a6e", muted: "#3b6c8c", accent: "#0284c7" },
  "Frost": { base: "#eef2f7", blobs: ["#c7d2fe", "#bae6fd", "#fbcfe8"], tint: "light", text: "#1e293b", muted: "#64748b", accent: "#6366f1" },
  "Rose Quartz": { base: "#fdf2f8", blobs: ["#f9a8d4", "#fda4af", "#c4b5fd"], tint: "light", text: "#4a1d36", muted: "#9d5c7d", accent: "#db2777" },
  "Lavender Haze": { base: "#f5f3ff", blobs: ["#a78bfa", "#f0abfc", "#93c5fd"], tint: "light", text: "#2e1065", muted: "#6b5b95", accent: "#7c3aed" },
  "Peach": { base: "#fff7ed", blobs: ["#fdba74", "#fca5a5", "#fde68a"], tint: "light", text: "#431407", muted: "#9a5b3c", accent: "#ea580c" },
  "Home Glass": { base: "#e6e9ea", blobs: ["#5e7d71", "#b8965a", "#4e8ea2"], tint: "light", text: "#2f453d", muted: "#6b7f77", accent: "#5e7d71" },
};
const BG_CHOICES = ["", "#ffffff", "#f5f5f7", "#eceff1", "#e6e9ea", "#ecf0f3", "#faeed3", "#eef5e3", "#dce7f2", "#fdf2f8",
  "#f5f3ff", "#2a2d31", "#1e293b", "#111315", "#0b1020"];
const TEXT_CHOICES = ["", "#111111", "#1f2328", "#334155", "#4e6b61", "#0a4174", "#28305c", "#5c5c62", "#e6e6e6", "#e2e8f0", "#ffffff"];
// One palette for every colour target: neutrals, light tints (backgrounds), dark bases, then colours
// (the standard swatches and the extra ones), without repeats.
const PALETTE_ALL = [...new Set([
  "#ffffff", "#f8f9fa", "#f1f3f5", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd", "#868e96", "#6c757d", "#495057", "#343a40", "#212529", "#111315", "#000000",
  "#fff7ed", "#fef3c7", "#fefce8", "#faeed3", "#fdf2f8", "#fce7f3", "#f5f3ff", "#eef2ff", "#e0f2fe", "#dce7f2", "#ecfeff", "#ecfdf5", "#f0fdf4", "#eef5e3",
  "#e6e9ea", "#ecf0f3",
  "#0b1020", "#0f172a", "#1e293b", "#1c1f22", "#2a2d31", "#1a2e2a", "#0b2b26", "#28305c", "#2e1065", "#3b0764", "#431407", "#4a1d36",
  ...SWATCHES, ...HOME_COLORS,
].map((c) => c.toLowerCase()))];
const COLOR_TARGETS = [["accent", "Accent"], ["bg", "Background"], ["card", "Cards"], ["text", "Text"]];
const isDarkHex = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 128;
};
const NEU_VARS = ["--nm-bg", "--nm-dark", "--nm-light", "--nm-text", "--nm-muted"];
const PALETTES = {
  light: { "--primary-background-color": "#f4f5f7", "--card-background-color": "#ffffff", "--ha-card-background": "#ffffff",
    "--primary-text-color": "#1f2328", "--secondary-text-color": "#6b7280", "--divider-color": "rgba(0,0,0,.12)",
    "--secondary-background-color": "#eceef1", "--input-fill-color": "#f1f3f5" },
  dark: { "--primary-background-color": "#111315", "--card-background-color": "#1c1f22", "--ha-card-background": "#1c1f22",
    "--primary-text-color": "#e6e6e6", "--secondary-text-color": "#9aa0a6", "--divider-color": "rgba(255,255,255,.12)",
    "--secondary-background-color": "#2a2e33", "--input-fill-color": "#24282c" },
};
const fill = (text, values) => Object.entries(values).reduce((t, [k, v]) => t.split(`{${k}}`).join(v), String(text ?? ""));
const fmtMinutes = (m) => (m % 60 === 0 ? (m === 60 ? "1 hour" : `${m / 60} hours`) : m === 1 ? "1 minute" : `${m} minutes`);

// Small coloured icon per medication, by its form.
function medIcon(m, size = 22) {
  const c = (m && m.color) || "#9e9e9e";
  const form = (m && m.form) || "tablet";
  const light = /^#f[0-9a-f]{5}$/i.test(c) || /^#(fdd835|f5f5f5|ffffff)$/i.test(c);
  const stroke = light ? "#9e9e9e" : "rgba(0,0,0,.25)";
  let body;
  if (form === "capsule") {
    body = `<g transform="rotate(-40 12 12)"><rect x="3" y="8" width="18" height="8" rx="4" fill="#fff" stroke="${stroke}"/>
      <path d="M7 8h5v8H7a4 4 0 0 1 0-8z" fill="${c}" stroke="${stroke}"/></g>`;
  } else if (form === "injection") {
    body = `<g transform="rotate(-45 12 12)"><rect x="6" y="9" width="11" height="6" rx="1" fill="${c}" stroke="${stroke}"/>
      <rect x="17" y="11" width="3" height="2" fill="${stroke}"/><rect x="20" y="11.5" width="3" height="1" fill="${stroke}"/>
      <rect x="2" y="10.5" width="4" height="3" fill="${stroke}"/></g>`;
  } else if (form === "liquid" || form === "drops") {
    body = form === "drops" ? `<path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" fill="${c}" stroke="${stroke}"/>`
      : `<rect x="8" y="2.5" width="8" height="3.5" rx="1" fill="${stroke}"/><path d="M7 7h10v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20z" fill="${c}" stroke="${stroke}"/>`;
  } else if (form === "patch" || form === "cream" || form === "inhaler" || form === "powder") {
    body = `<rect x="4" y="4" width="16" height="16" rx="4" fill="${c}" stroke="${stroke}"/><circle cx="12" cy="12" r="3" fill="rgba(255,255,255,.55)"/>`;
  } else {
    body = `<circle cx="12" cy="12" r="8.5" fill="${c}" stroke="${stroke}"/><path d="M6.5 12h11" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>`;
  }
  return `<svg class="medicon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
}

const MENU_ICON = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z";

/* ---------- helpers ---------- */
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const svg = (d, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path fill="currentColor" d="${d}"/></svg>`;
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
const pad = (n) => String(n).padStart(2, "0");

// Dates are handled as "YYYY-MM-DD" strings and UTC-midnight Date objects.
const parseD = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(Date.UTC(y, (m || 1) - 1, d || 1)); };
const isoD = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
const addDays = (s, n) => { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return isoD(d); };
const wd = (dt) => (dt.getUTCDay() + 6) % 7; // Monday = 0
const lastDay = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const fmtDate = (s, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  s ? parseD(s).toLocaleDateString(undefined, { ...opts, timeZone: "UTC" }) : "";
const fmtTime = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
};
const fmtClock = (iso) => (iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "");

// JS twin of recurrence.py
function occursOn(rule, day) {
  rule = rule || {};
  const d = parseD(day);
  const start = parseD(rule.start || day);
  if (d < start) return false;
  if (rule.end && d > parseD(rule.end)) return false;
  const n = Math.max(1, Number(rule.interval) || 1);
  const freq = rule.freq || "daily";
  if (freq === "daily") return Math.round((d - start) / 864e5) % n === 0;
  if (freq === "weekly") {
    const days = rule.weekdays && rule.weekdays.length ? rule.weekdays : [wd(start)];
    if (!days.includes(wd(d))) return false;
    const week0 = new Date(start); week0.setUTCDate(week0.getUTCDate() - wd(start));
    return Math.floor(Math.round((d - week0) / 864e5) / 7) % n === 0;
  }
  if (freq === "monthly") {
    const months = (d.getUTCFullYear() - start.getUTCFullYear()) * 12 + d.getUTCMonth() - start.getUTCMonth();
    if (months % n) return false;
    const last = lastDay(d.getUTCFullYear(), d.getUTCMonth());
    if (rule.monthly_by === "weekday") {
      if (wd(d) !== wd(start)) return false;
      const nth = Math.floor((start.getUTCDate() - 1) / 7);
      if (nth >= 4) return d.getUTCDate() + 7 > last;
      return Math.floor((d.getUTCDate() - 1) / 7) === nth;
    }
    return d.getUTCDate() === Math.min(start.getUTCDate(), last);
  }
  return false;
}
function nextDates(rule, after, count = 4) {
  const out = [];
  let day = after;
  for (let i = 0; i < 800 && out.length < count; i++) {
    if (occursOn(rule, day)) out.push(day);
    day = addDays(day, 1);
  }
  return out;
}
function describe(rule) {
  rule = rule || {};
  const n = Number(rule.interval) || 1;
  const start = parseD(rule.start || isoD(new Date()));
  if (rule.freq === "weekly") {
    const days = rule.weekdays && rule.weekdays.length ? rule.weekdays : [wd(start)];
    if (days.length === 7 && n === 1) return "Every day";
    const names = days.map((x) => DAY[x]).join(", ");
    return n === 1 ? `Weekly on ${names}` : `Every ${n} weeks on ${names}`;
  }
  if (rule.freq === "monthly") {
    const every = n === 1 ? "Monthly" : `Every ${n} months`;
    if (rule.monthly_by === "weekday") return `${every} on the ${ORD[Math.min(Math.floor((start.getUTCDate() - 1) / 7), 4)]} ${DAY[wd(start)]}`;
    return `${every} on day ${start.getUTCDate()}`;
  }
  return n === 1 ? "Every day" : `Every ${n} days`;
}

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  keys.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== "object") o[k] = {}; o = o[k]; });
  o[keys[keys.length - 1]] = value;
}

const LOOKUPS = [
  ["Drugs.com", (q) => `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(q)}`],
  ["MedlinePlus", (q) => `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=${encodeURIComponent(q)}`],
  ["GoodRx prices", (q) => `https://www.goodrx.com/${encodeURIComponent(q.trim().toLowerCase().replace(/\s+/g, "-"))}`],
];

/* ---------- the panel ---------- */
class MedManagerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "today";
    this._date = null;
    this._data = null;
    this._day = null;
    this._history = null;
    this._histUser = "";
    this._edit = null; // open dialog: {kind, item, ...}
    this._busy = false;
    this._toastTimer = null;
    this._startApplied = false;
    this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
    this.shadowRoot.addEventListener("input", (e) => this._onInput(e));
    this.shadowRoot.addEventListener("change", (e) => this._onInput(e, true));
    this.shadowRoot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.dataset?.wizFind !== undefined) { e.preventDefault(); this._wizFindRun(); return; }
      if (e.key === "Enter" && e.target.dataset?.find !== undefined) { e.preventDefault(); this._findPharmacy(); }
    });
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    // Native dropdown lists follow color-scheme; match HA's light/dark theme so options stay readable.
    const dark = !!hass.themes?.darkMode;
    const homePal = hass.states?.["input_select.home_palette"]?.state;
    if (this._dark !== dark || this._homePal !== homePal) {
      this._dark = dark;
      this._homePal = homePal;
      if (this._data) this._applyAppearance(); else this.style.colorScheme = dark ? "dark" : "light";
    }
    if (first) this._start();
    else if (this._data && this._tab === "today" && !this._edit) this._renderPeopleBadges();
  }
  get hass() { return this._hass; }
  set narrow(v) { this._narrow = v; if (this._data) this._renderMain(); }
  set panel(p) { this._panel = p; }

  connectedCallback() {
    if (this._hass && !this._unsub) this._start();
    this._timer = setInterval(() => this._refresh(), 60000);
  }
  disconnectedCallback() {
    clearInterval(this._timer);
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
  }

  _checkCallLink() {
    let id = null;
    try { id = new URLSearchParams(window.location.search).get("call"); } catch (e) { /* ignore */ }
    if (!id || !this._data) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("call");
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
    if (this._med(id)) this._openCall(id);
  }

  _openCall(id) {
    this._edit = { kind: "call", item: { id } };
    this._renderDialog();
  }

  set route(r) {
    this._route = r;
    if (this._data) this._checkCallLink();
  }

  async _start() {
    this._renderShell();
    await this._refresh();
    this._checkCallLink();
    if (!this._unsub) {
      this._unsub = this._hass.connection.subscribeMessage(() => {
        clearTimeout(this._debounce);
        this._debounce = setTimeout(() => this._refresh(), 250);
      }, { type: "med_manager/subscribe" }).catch((err) => { this._toast(`Live updates off: ${err.message || err}`); return null; });
    }
  }

  _ws(msg) { return this._hass.callWS(msg); }

  async _refresh() {
    if (!this._hass) return;
    try {
      const [data, day] = await Promise.all([
        this._ws({ type: "med_manager/get" }),
        this._ws({ type: "med_manager/day", ...(this._date ? { date: this._date } : {}) }),
      ]);
      // A test button pressed on a phone shows up here instead of as another notification.
      if (this._data && (data.fake_inbox || []).length && (data.fake_inbox[0]?.ts !== (this._data.fake_inbox || [])[0]?.ts)) {
        this._toast(`Test Android phone: ${data.fake_inbox[0].title}`, 5000);
      }
      const lt = data.last_test;
      if (this._data && lt && lt.ts !== this._data.last_test?.ts) this._toast(`Button received: ${lt.text}`, 8000);
      this._demoOnly = !!(data.settings?.demo?.enabled && data.settings.demo.only !== false);
      if (this._demoOnly) this._onlyDemo(data, day);
      this._data = data;
      this._day = day;
      if (!this._startApplied && !data.users.length && !data.medications.length) {
        let seen = false;
        try { seen = localStorage.getItem("med-manager-wizard-seen") === "1"; } catch (e) { /* ignore */ }
        if (!seen) setTimeout(() => { if (!this._wiz) this._openWizard(false); }, 0);
      }
      if (!this._startApplied) {
        this._startApplied = true;
        const start = data.settings?.appearance?.start_tab;
        if (start && this._visibleTabs().some(([id]) => id === start)) this._tab = start;
      }
      if (!this._date) this._viewDate = data.today;
      if (this._tab === "history") {
        this._history = await this._ws({ type: "med_manager/history", days: 60, user_id: this._histUser || null });
        if (this._demoOnly) { const ids = new Set(data.users.map((u) => u.id)); this._history = this._history.filter((h) => ids.has(h.user_id)); }
      }
      this._error = null;
    } catch (err) {
      this._error = err.message || String(err);
    }
    this._renderMain();
  }

  // Demo mode with "show only demo data": hide real people, medications and pharmacies in the app.
  // Nothing is deleted and real reminders keep going out.
  _onlyDemo(data, day) {
    const users = new Set(data.users.filter((u) => u.demo).map((u) => u.id));
    data.users = data.users.filter((u) => u.demo);
    data.medications = data.medications.filter((m) => m.demo);
    data.pharmacies = data.pharmacies.filter((p) => p.demo);
    data.assignments = data.assignments.filter((a) => a.demo);
    const meds = new Set(data.medications.map((m) => m.id));
    data.open_reorders = (data.open_reorders || []).filter((r) => meds.has(r.medication_id));
    if (day?.people) day.people = day.people.filter((p) => users.has(p.user_id));
  }

  _demoBanner() {
    if (!this._demoOnly) return "";
    return `<div class="demo-banner"><b>Demo mode</b> — showing only demo data. Your real medications and reminders are unchanged.
      <button class="text small" data-act="tab" data-tab="settings">Settings</button></div>`;
  }

  /* ---------- lookups ---------- */
  _user(id) { return (this._data?.users || []).find((u) => u.id === id); }
  _med(id) { return (this._data?.medications || []).find((m) => m.id === id); }
  _pharm(id) { return (this._data?.pharmacies || []).find((p) => p.id === id); }
  _medName(m) { return m ? [m.name, m.strength].filter(Boolean).join(" ") : "?"; }
  _personState(u) { return u?.person ? this._hass.states[u.person] : null; }
  _slotLabel(u, t) {
    if (t.slot) { const s = (u.slots || []).find((x) => x.id === t.slot); return s ? `${s.name} ${fmtTime(s.time)}` : "?"; }
    return fmtTime(t.time);
  }

  /* ---------- rendering ---------- */
  _renderShell() {
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <div class="toolbar">
        <button class="icon menu" data-act="menu" title="Menu">${svg(MENU_ICON, 24)}</button>
        <div class="title">Medications</div>
      </div>
      <nav class="tabs"></nav>
      <main></main>
      <div class="dialog-host"></div>
      <div class="toast" hidden></div>`;
  }

  _appearance() {
    return (this._tab === "settings" && this._sdraft ? this._sdraft.appearance : this._data?.settings?.appearance) || {};
  }

  _visibleTabs() {
    const hidden = this._appearance().hide_tabs || [];
    return TABS.filter(([id]) => id === "today" || id === "settings" || id === "help" || !hidden.includes(id));
  }

  _schemeName(a) {
    let name = a.scheme || (a.theme === "light" || a.theme === "dark" ? a.theme : "auto");
    if (name === "home") name = this._hass?.states?.["input_select.home_palette"]?.state || "Calm";
    return name;
  }

  _customSchemes() {
    return (this._tab === "settings" && this._sdraft ? this._sdraft.custom_schemes : this._data?.settings?.custom_schemes) || [];
  }

  _applyAppearance() {
    let a = this._appearance();
    let custom = { ...(a.custom || {}) };
    if (String(a.scheme || "").startsWith("custom:")) {
      const cs = this._customSchemes().find((x) => x.id === a.scheme.slice(7));
      if (cs) {
        custom = { ...(cs.colors || {}), ...Object.fromEntries(Object.entries(custom).filter(([, v]) => v)) };
        a = { ...a, scheme: cs.base, card: cs.card || a.card };
      } else a = { ...a, scheme: "auto" };
    }
    const st = this.style;
    const clear = [...Object.keys(PALETTES.light), ...NEU_VARS, "--primary-color", "--app-header-background-color",
      "--app-header-text-color", "--accent-2"];
    for (const name of clear) st.removeProperty(name);
    const name = this._schemeName(a);
    const pal = HOME_SCHEMES[name];
    const glass = name.startsWith("glass:") ? GLASS_SCHEMES[name.slice(6)] : null;
    let dark = this._dark;
    st.removeProperty("background");
    if (glass) {
      dark = glass.tint === "dark";
      const [b1, b2, b3] = glass.blobs;
      // Frosted cards for Glassmorphism; solid cards a shade off the base colour for the other styles;
      // Neumorphism uses the base colour itself with matching shadows (and a plain page, the glow would break the effect).
      const solid = dark ? `color-mix(in srgb, ${glass.base} 84%, #ffffff)` : "#ffffff";
      const cardBg = a.card === "glass" ? (dark ? "#0b0d14" : "#ffffff") : a.card === "neu" ? glass.base : solid;
      const vars = {
        "--primary-background-color": glass.base, "--card-background-color": cardBg,
        "--ha-card-background": cardBg,
        "--nm-bg": glass.base, "--nm-dark": `color-mix(in srgb, ${glass.base} ${dark ? 70 : 82}%, #000)`,
        "--nm-light": `color-mix(in srgb, ${glass.base} ${dark ? 86 : 55}%, #fff)`, "--nm-text": glass.text, "--nm-muted": glass.muted,
        "--primary-text-color": glass.text, "--secondary-text-color": glass.muted,
        "--divider-color": dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.08)",
        "--secondary-background-color": dark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.55)",
        "--input-fill-color": dark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.6)",
        "--primary-color": glass.accent, "--app-header-background-color": glass.base, "--app-header-text-color": glass.text,
      };
      for (const [k, v] of Object.entries(vars)) st.setProperty(k, v);
      if (a.card !== "neu") st.setProperty("background", `radial-gradient(900px 650px at 0% 0%, ${b1}aa, transparent 60%),
        radial-gradient(850px 650px at 100% 15%, ${b2}99, transparent 60%), radial-gradient(1000px 750px at 45% 110%, ${b3}99, transparent 60%), ${glass.base}`);
    } else if (pal) {
      const [bg, sd, sl, text, muted, accent, accent2] = pal;
      dark = name === "Navy";
      // Raised / flat / glass cards sit a step lighter than the page; neumorphic ones match it.
      const card = a.card === "neu" ? bg : (dark ? sl : (sl === "#ffffff" || sl === "#fafaff" ? "#ffffff" : sl));
      const vars = {
        "--primary-background-color": bg, "--card-background-color": card, "--ha-card-background": card,
        "--primary-text-color": text, "--secondary-text-color": muted,
        "--divider-color": dark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.08)",
        "--secondary-background-color": dark ? "#26324a" : `color-mix(in srgb, ${bg} 70%, ${sd})`,
        "--input-fill-color": dark ? "#26324a" : `color-mix(in srgb, ${bg} 80%, #ffffff)`,
        "--primary-color": accent, "--accent-2": accent2,
        "--app-header-background-color": bg, "--app-header-text-color": text,
        "--nm-bg": bg, "--nm-dark": sd, "--nm-light": sl, "--nm-text": text, "--nm-muted": muted,
      };
      for (const [k, v] of Object.entries(vars)) st.setProperty(k, v);
    } else {
      if (name === "light" || name === "dark") {
        for (const [k, v] of Object.entries(PALETTES[name])) st.setProperty(k, v);
        dark = name === "dark";
      }
      // Neumorphism needs matching shadows: Calm in light mode, Navy in dark mode.
      if (a.card === "neu") {
        const [bg, sd, sl, text, muted, accent] = HOME_SCHEMES[dark ? "Navy" : "Calm"];
        for (const [k, v] of Object.entries({ "--nm-bg": bg, "--nm-dark": sd, "--nm-light": sl, "--nm-text": text, "--nm-muted": muted,
          "--primary-color": accent })) st.setProperty(k, v);
      }
    }
    // Colours customised on top of the scheme.
    if (custom.accent) st.setProperty("--primary-color", custom.accent);
    if (custom.bg) {
      st.setProperty("--primary-background-color", custom.bg);
      st.setProperty("--nm-bg", custom.bg);
      st.setProperty("--nm-dark", `color-mix(in srgb, ${custom.bg} 80%, #000)`);
      st.setProperty("--nm-light", `color-mix(in srgb, ${custom.bg} 65%, #fff)`);
      if (pal || a.card === "neu") st.setProperty("--app-header-background-color", custom.bg);
      if (a.card === "neu") {
        // Neumorphic cards are the page colour.
        for (const v of ["--card-background-color", "--ha-card-background", "--secondary-background-color", "--input-fill-color"]) st.setProperty(v, custom.bg);
      }
      if (!glass) dark = isDarkHex(custom.bg) ?? dark;
    }
    if (custom.card && a.card !== "neu") { st.setProperty("--card-background-color", custom.card); st.setProperty("--ha-card-background", custom.card); }
    if (custom.text) {
      st.setProperty("--primary-text-color", custom.text);
      st.setProperty("--nm-text", custom.text);
      st.setProperty("--secondary-text-color", `color-mix(in srgb, ${custom.text} 62%, transparent)`);
      if (pal || a.card === "neu") st.setProperty("--app-header-text-color", custom.text);
    }
    st.colorScheme = dark ? "dark" : "light";
    this.dataset.glassbg = a.glass_bg || "accent";
    // (a glass colour scheme brings its own backdrop, set above)
    // Glassmorphism knobs: how see-through, how blurred, what the frosting is tinted with.
    const alpha = { clear: 38, medium: 60, frosted: 80 }[a.glass_opacity] ?? 60;
    const blur = { low: 6, medium: 14, high: 28 }[a.glass_blur] ?? 14;
    const tint = { light: "#ffffff", dark: "#0b0d10", accent: "var(--primary-color)" }[a.glass_tint] || "var(--card-background-color)";
    if (glass) this.dataset.glassbg = "scheme";
    st.setProperty("--glass-alpha", `${alpha}%`);
    st.setProperty("--glass-blur", `${blur}px`);
    st.setProperty("--glass-tint", tint);
    this.dataset.glassedge = a.glass_border === false ? "off" : "on";
    if (!glass && a.card === "glass" && (a.glass_tint === "dark" || a.glass_tint === "light")) {
      // Dark frosting reads best with light text and vice versa.
      for (const [k, v] of Object.entries(PALETTES[a.glass_tint])) {
        if (k === "--primary-text-color" || k === "--secondary-text-color" || k === "--divider-color") st.setProperty(k, v);
      }
    }
    this.dataset.card = a.card || "raised";
    this.dataset.density = a.density || "comfortable";
    this.dataset.text = a.text || "normal";
    this.dataset.icons = a.med_icons === false ? "off" : "on";
  }

  _renderTabs() {
    this.shadowRoot.querySelector(".menu").style.display = this._narrow ? "" : "none";
    if (!this._visibleTabs().some(([id]) => id === this._tab)) this._tab = "today";
    this.shadowRoot.querySelector(".tabs").innerHTML = this._visibleTabs().map(([id, label, icon]) =>
      `<button class="tab ${this._tab === id ? "on" : ""}" data-act="tab" data-tab="${id}">${svg(icon, 18)}<span>${label}</span></button>`).join("");
  }

  _renderMain(force = false) {
    if (!this.shadowRoot.querySelector("main")) this._renderShell();
    this._applyAppearance();
    this._renderTabs();
    // Don't redraw the Settings form under someone's fingers (live refreshes arrive every minute).
    const focused = this.shadowRoot.activeElement;
    if (!force && this._tab === "settings" && this._sdraft && focused && /INPUT|SELECT|TEXTAREA/.test(focused.tagName)) return;
    // Keep the page where it was when Settings redraws itself (e.g. after picking a card style).
    const y = force ? window.scrollY : null;
    const main = this.shadowRoot.querySelector("main");
    if (this._error && !this._data) {
      main.innerHTML = `<div class="card error">Couldn't load Medications: ${esc(this._error)}</div>`;
      return;
    }
    if (!this._data) { main.innerHTML = `<div class="loading">Loading…</div>`; return; }
    const view = { today: this._viewToday, people: this._viewPeople, meds: this._viewMeds, pharmacies: this._viewPharmacies,
      history: this._viewHistory, help: this._viewHelp, settings: this._viewSettings }[this._tab] || this._viewToday;
    main.classList.toggle("wide", this._tab === "settings" || this._tab === "help");
    main.innerHTML = (this._tab === "settings" ? "" : this._demoBanner()) + view.call(this);
    if (y !== null) window.scrollTo(0, y);
  }

  _renderPeopleBadges() {
    // Cheap refresh of home/away badges when hass updates.
    this.shadowRoot.querySelectorAll("[data-presence]").forEach((el) => {
      const st = this._hass.states[el.dataset.presence];
      const home = st?.state === "home";
      el.className = `badge ${home ? "home" : "away"}`;
      el.textContent = st ? (home ? "Home" : st.state === "not_home" ? "Away" : st.state) : "";
    });
  }

  _presence(u) {
    if (!u.person) return "";
    const st = this._personState(u);
    if (!st) return "";
    const home = st.state === "home";
    return `<span class="badge ${home ? "home" : "away"}" data-presence="${esc(u.person)}">${home ? "Home" : st.state === "not_home" ? "Away" : esc(st.state)}</span>`;
  }

  _avatar(u) {
    const st = this._personState(u);
    const pic = st?.attributes?.entity_picture;
    const ring = u.color ? ` style="box-shadow:0 0 0 2px ${esc(u.color)}"` : "";
    if (pic) return `<img class="avatar" src="${esc(pic)}" alt=""${ring}>`;
    return `<div class="avatar letter"${u.color ? ` style="background:${esc(u.color)}"` : ""}>${esc((u.name || "?").slice(0, 1).toUpperCase())}</div>`;
  }

  _personStyle(u) {
    return u.color ? `border-left:4px solid ${esc(u.color)}` : "";
  }

  /* Today */
  _viewToday() {
    const d = this._data;
    if (!d.users.length) return this._welcome();
    const date = this._day?.date || d.today;
    const isToday = date === d.today;
    let html = `<div class="daynav">
        <button class="icon" data-act="day" data-delta="-1" title="Previous day">‹</button>
        <div class="dayname"><b>${isToday ? "Today" : esc(fmtDate(date, { weekday: "long" }))}</b><span>${esc(fmtDate(date, { month: "long", day: "numeric", year: "numeric" }))}</span></div>
        <button class="icon" data-act="day" data-delta="1" title="Next day">›</button>
        ${isToday ? "" : `<button class="text" data-act="day" data-delta="0">Today</button>`}
      </div>`;
    html += this._peopleFilter();
    const hidden = this._hiddenPeople();
    const shown = (this._day?.people || []).filter((p) => !hidden.includes(p.user_id));
    if (!shown.length) html += `<div class="card muted">Nobody selected. Tap a name above to show their medications.</div>`;
    for (const person of shown) {
      const u = this._user(person.user_id);
      if (!u) continue;
      html += `<section class="card person" style="${this._personStyle(u)}">
        <header>${this._avatar(u)}<h2>${esc(u.name)}</h2>${u.demo ? `<span class="chip demo">DEMO</span>` : ""}${this._presence(u)}</header>`;
      if (!person.groups.length) html += `<p class="muted">Nothing scheduled ${isToday ? "today" : "this day"}.</p>`;
      for (const g of person.groups) html += this._groupHtml(u, date, g);
      html += this._refillsFor(u);
      html += `</section>`;
    }
    return html;
  }

  _hiddenPeople() {
    if (!this._hidden) {
      try { this._hidden = JSON.parse(localStorage.getItem("med-manager-today-hidden") || "[]"); } catch (e) { this._hidden = []; }
    }
    return this._hidden;
  }

  _setHiddenPeople(list) {
    this._hidden = list;
    try { localStorage.setItem("med-manager-today-hidden", JSON.stringify(list)); } catch (e) { /* private mode */ }
  }

  _peopleFilter() {
    const users = this._data.users;
    if (users.length < 2) return "";
    const hidden = this._hiddenPeople();
    const all = users.every((u) => !hidden.includes(u.id));
    return `<div class="pfilter" role="group" aria-label="People shown">
      <button class="pchip ${all ? "on" : ""}" data-act="pf-all">Everyone</button>
      ${users.map((u) => {
        const on = !hidden.includes(u.id);
        return `<button class="pchip ${on ? "on" : ""}" data-act="pf-toggle" data-id="${u.id}" aria-pressed="${on}"
          style="${u.color ? `--pc:${esc(u.color)}` : ""}"><span class="pdot"></span>${esc(u.name)}${u.demo ? " · demo" : ""}</button>`;
      }).join("")}
    </div>`;
  }

  _groupHtml(u, date, g) {
    const open = g.items.filter((i) => ["pending", "due", "scheduled"].includes(i.state)).length;
    const statusText = {
      done: g.items.every((i) => i.state === "skipped") ? "Skipped" : "Done",
      pending: "Due now", due: "Due", scheduled: "Upcoming",
      snoozed: `Snoozed until ${fmtClock(g.next_at)}`, waiting_home: "Waiting until home",
    }[g.status] || g.status;
    const cls = { done: "ok", pending: "warn", due: "warn", snoozed: "info", waiting_home: "info", scheduled: "" }[g.status] || "";
    const items = g.items.map((i) => {
      const taken = i.state === "taken";
      const skipped = i.state === "skipped";
      const missed = i.state === "missed";
      const sub = [i.dose, i.instructions].filter(Boolean).join(" · ");
      return `<div class="item ${taken ? "taken" : ""} ${skipped ? "skipped" : ""} ${missed ? "missed" : ""}">
        <button class="check" data-act="dose" data-user="${u.id}" data-date="${date}" data-time="${g.time}" data-aid="${i.assignment_id}"
          data-do="${taken || skipped || missed ? "undo" : "taken"}" title="${taken ? "Undo" : "Mark taken"}">${taken ? "✓" : skipped ? "–" : missed ? "!" : ""}</button>
        ${medIcon(this._med(i.medication_id))}
        <div class="grow"><div class="name">${esc([i.name, i.strength].filter(Boolean).join(" "))}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
          ${skipped ? `<div class="sub">Skipped</div>` : missed ? `<div class="sub">Missed</div>` : ""}</div>
        ${!taken && !skipped ? `<button class="text small" data-act="dose" data-user="${u.id}" data-date="${date}" data-time="${g.time}" data-aid="${i.assignment_id}" data-do="skipped">Skip</button>` : ""}
      </div>`;
    }).join("");
    return `<div class="group">
      <div class="ghead"><div><b>${esc(g.label)}</b>${g.label === fmtTime(g.time) ? "" : ` <span class="muted">${fmtTime(g.time)}</span>`}</div>
        <span class="chip ${cls}">${esc(statusText)}</span></div>
      ${items}
      <div class="gactions">
        ${open ? `<button class="text" data-act="dose" data-user="${u.id}" data-date="${date}" data-time="${g.time}" data-do="taken">Mark all taken</button>` : ""}
        ${date === this._data.today && open ? `<button class="text" data-act="send-now" data-user="${u.id}" data-date="${date}" data-time="${g.time}">Send reminder now</button>` : ""}
      </div>
    </div>`;
  }

  // Who a medication's refills belong to: the people picked in its reorder settings,
  // otherwise everyone who takes it (the same people who get the reorder reminder).
  _refillOwners(m) {
    const d = this._data;
    const picked = (m.reorder?.user_ids || []).filter((id) => this._user(id));
    if (picked.length) return picked;
    const takers = [...new Set(d.assignments.filter((a) => a.medication_id === m.id).map((a) => a.user_id))];
    return takers.length ? takers : d.users.map((u) => u.id);
  }

  _refillsFor(u) {
    const d = this._data;
    const soon = addDays(d.today, 7);
    const rows = d.medications.filter((m) => m.reorder?.enabled && this._refillOwners(m).includes(u.id) &&
      (m.next_reorder && m.next_reorder <= soon || d.open_reorders.some((r) => r.medication_id === m.id)));
    if (!rows.length) return "";
    return `<div class="group refills"><div class="ghead"><div><b>📦 Refills</b> <span class="muted">next 7 days</span></div></div>${rows.map((m) => {
      const open = d.open_reorders.some((r) => r.medication_id === m.id);
      const p = this._pharm(m.pharmacy_id);
      const when = open ? "Reorder now" : m.next_reorder === d.today ? "Reorder today" : `Reorder ${fmtDate(m.next_reorder)}`;
      const tel = p?.phone ? p.phone.replace(/[^\d+]/g, "") : "";
      return `<div class="row refill"><div class="grow"><div class="name">${esc(this._medName(m))}</div>
        <div class="sub">${esc(when)}${p ? ` · ${esc(p.name)}` : ""}${m.last_ordered ? ` · last ordered ${esc(fmtDate(m.last_ordered))}` : ""}</div>
        ${m.rx_number ? `<div class="sub rxline">Rx # <b>${esc(m.rx_number)}</b> <button class="text small" data-act="copy" data-text="${esc(m.rx_number)}">Copy</button></div>` : ""}
        <div class="refill-actions">
          ${tel ? (m.rx_number ? `<button class="text small" data-act="call" data-id="${m.id}">📞 Call ${esc(p.phone)}</button>`
            : `<a class="btn text small" href="tel:${esc(tel)}">📞 Call ${esc(p.phone)}</a>`) : ""}
          ${p && (p.login_url || p.website) ? `<a class="btn text small" href="${esc(p.login_url || p.website)}" target="_blank" rel="noopener">🌐 Pharmacy site</a>` : ""}
        </div></div>
        <button class="text" data-act="ordered" data-id="${m.id}">Ordered</button>
        ${open ? `<button class="text" data-act="rx-snooze" data-id="${m.id}">Snooze 1 day</button>
          <button class="text" data-act="rx-skip" data-id="${m.id}">Not needed</button>` : ""}</div>`;
    }).join("")}</div>`;
  }

  _welcome() {
    const d = this._data;
    const step = (done, n, text, act) => `<li class="${done ? "done" : ""}"><span class="num">${done ? "✓" : n}</span><span class="grow">${text}</span>
      ${act ? `<button class="text" data-act="${act}">${done ? "Add another" : "Add"}</button>` : ""}</li>`;
    return `<section class="card welcome"><h2>Set up Medications</h2>
      <p>The setup wizard walks you through it in four short steps.</p>
      <div class="actions"><button class="primary" data-act="wiz-open">Start the setup wizard</button></div>
      <div class="label-row">Or do it yourself</div>
      <ol>
        ${step(d.pharmacies.length, 1, "Add your pharmacy (phone, website, account login)", "new-pharmacy")}
        ${step(d.medications.length, 2, "Add your prescriptions and their dosage", "new-med")}
        ${step(d.users.length, 3, "Add the people who take them, with their phones for reminders", "new-user")}
        ${step(d.assignments.length, 4, "On the People tab, add each person's medications and times", "")}
      </ol>
      ${d.medtrack_available ? `<p>You have medications in MedTrack. <button class="text" data-act="import">Import them</button></p>` : ""}
    </section>`;
  }


  /* ---------- setup wizard ---------- */
  // Steps: welcome → person → pharmacy → medication → test → done.
  // Practice runs create everything flagged as demo data, so it can be discarded in one tap (or kept).
  _openWizard(practice) {
    const d = this._data;
    this._wiz = {
      step: 0, practice: !!practice, fresh: !d.users.length && !d.medications.length,
      person: { person: "", name: "", notify: [], slots: [{ id: "morning", name: "Morning", time: "08:00" }, { id: "evening", name: "Evening", time: "20:00" }] },
      pharmacy: { name: "", phone: "", address: "", website: "", login_url: "", skip: false },
      find: { q: "", results: null, loading: false },
      med: { name: "", strength: "", form: "tablet", dose: "1 tablet", rx_number: "", slots: ["morning"], freq: "daily", weekdays: [], reorder: "none" },
      created: null, tested: false,
    };
    this._renderWizard();
  }

  async _wizFindRun() {
    const f = this._wiz.find;
    f.loading = true; this._renderWizard();
    try { f.results = (await this._ws({ type: "med_manager/find_pharmacy", query: f.q || "" })).results; }
    catch (err) { f.results = []; this._toast(err.message || String(err)); }
    f.loading = false;
    if (this._wiz) this._renderWizard();
  }

  _closeWizard() {
    this._wiz = null;
    this.shadowRoot.querySelector(".dialog-host").innerHTML = "";
    try { localStorage.setItem("med-manager-wizard-seen", "1"); } catch (e) { /* ignore */ }
  }

  _wizSteps() { return ["Welcome", "Person", "Pharmacy", "Medication", "Test", "Done"]; }

  _renderWizard() {
    const w = this._wiz;
    if (!w) return;
    const host = this.shadowRoot.querySelector(".dialog-host");
    const steps = this._wizSteps();
    const body = [this._wizWelcome, this._wizPerson, this._wizPharmacy, this._wizMed, this._wizTest, this._wizDone][w.step].call(this);
    const scroll = host.querySelector(".dbody")?.scrollTop || 0;
    const nextLabel = w.step === 3 ? (w.practice ? "Save practice data" : "Save") : "Next";
    host.innerHTML = `<div class="scrim"></div>
      <div class="dialog wizard" role="dialog" aria-label="Setup wizard">
        <div class="dhead"><h2>${w.practice ? "Practice run" : "Set up Medications"}</h2>
          <button class="icon" data-act="wiz-cancel" title="Close">✕</button></div>
        ${w.step > 0 && w.step < 5 ? `<div class="wizsteps">${steps.slice(1, 5).map((t, i) =>
          `<span class="${i + 1 === w.step ? "on" : i + 1 < w.step ? "done" : ""}">${i + 1 < w.step ? "✓" : i + 1}. ${t}</span>`).join("")}</div>` : ""}
        <div class="dbody form">${body}</div>
        ${w.step > 0 && w.step < 5 ? `<div class="dfoot">
          ${w.step > 1 && w.step < 4 ? `<button class="text" data-act="wiz-back">Back</button>` : ""}
          <span class="spacer"></span>
          ${w.step === 2 ? `<button class="text" data-act="wiz-skip">Skip</button>` : ""}
          ${w.step < 4 ? `<button class="primary" data-act="wiz-next">${nextLabel}</button>` : `<button class="primary" data-act="wiz-next">Finish</button>`}
        </div>` : ""}
      </div>`;
    const b = host.querySelector(".dbody");
    if (b) b.scrollTop = scroll;
  }

  _wizWelcome() {
    const w = this._wiz;
    const hasDemo = this._data.settings?.demo?.enabled;
    return `<div class="wizhero">💊</div>
      <h3 class="wiztitle">${w.fresh ? "Welcome to Medications" : "Setup wizard"}</h3>
      <p>In four short steps you'll add a person, their pharmacy and a medication, then send a test reminder to their phone.</p>
      <div class="wizchoices">
        <button class="wizchoice" data-act="wiz-start" data-practice="0"><b>${w.fresh ? "Set up now" : "Add for real"}</b>
          <span>Everything you enter is saved and reminders start straight away.</span></button>
        <button class="wizchoice" data-act="wiz-start" data-practice="1"><b>Practice run</b>
          <span>Try every step safely. At the end, discard it all in one tap — or keep it.</span></button>
        <label class="wizchoice filechoice"><b>Restore from a backup file</b>
          <span>Moving to a new Home Assistant or reinstalling? Load a file made with Settings → Backups → Export.</span>
          <input type="file" accept="application/json,.json" data-backup-import hidden></label>
        ${hasDemo ? "" : `<button class="wizchoice" data-act="wiz-demo"><b>Just show me a demo</b>
          <span>Adds “Pill Popper Penelope” with silly medications to explore. Turn it off in Settings → Demo.</span></button>`}
      </div>`;
  }

  _wizPerson() {
    const w = this._wiz;
    const d = this._data;
    const taken = new Set(d.users.filter((u) => u.person && !u.demo).map((u) => u.person));
    const isTv = (x) => /apple_?tv|(^|_)tv($|_)/i.test(x);
    const phones = d.notify_services.filter((x) => x.startsWith("mobile_app_") && !isTv(x));
    const p = w.person;
    return `<p class="hint">Who takes the medication? Pick them from Home Assistant so “remind me when I get home” works and their phone is found.</p>
      <label>Person<select data-wiz-person>
        <option value="">Choose someone…</option>
        ${d.persons.map((x) => `<option value="${x.entity_id}" ${p.person === x.entity_id ? "selected" : ""} ${!w.practice && taken.has(x.entity_id) ? "disabled" : ""}>${esc(x.name)}${!w.practice && taken.has(x.entity_id) ? " (already added)" : ""}</option>`).join("")}
        <option value="__other" ${p.person === "__other" ? "selected" : ""}>Someone else (not in Home Assistant)…</option>
      </select></label>
      ${p.person ? `<label>Name shown in the app<input data-wbind="person.name" value="${esc(p.name)}"></label>
        <div class="label-row">Send reminders to</div>
        <div class="checks">${phones.map((x) => `<label class="checkchip"><input type="checkbox" data-wiz-phone value="${esc(x)}" ${p.notify.includes(x) ? "checked" : ""}>${esc(x.replace(/^mobile_app_/, ""))}${{ android: " · Android", ios: " · iPhone" }[(d.platforms || {})[x]] || ""}</label>`).join("") || `<span class="muted">No phones with the Home Assistant app found.</span>`}</div>
        <div class="label-row">Reminder times <span class="hint-inline">medications at the same time arrive together</span></div>
        <div class="g2">${p.slots.map((sl, i) => `<label>${esc(sl.name)}<input type="time" data-wbind="person.slots.${i}.time" value="${esc(sl.time)}"></label>`).join("")}</div>` : ""}`;
  }

  _wizPharmacy() {
    const w = this._wiz;
    const ph = w.pharmacy;
    const f = w.find;
    const results = f.loading ? `<p class="muted">Searching…</p>` : f.results ? (f.results.length ? `<div class="finds">${f.results.slice(0, 12).map((r, i) =>
      `<button class="find" data-act="wiz-pick-pharm" data-i="${i}"><div class="grow"><div class="name">${esc(r.name)}</div>
        <div class="sub">${esc([r.address, r.phone].filter(Boolean).join(" · "))}</div></div></button>`).join("")}</div>` : `<p class="muted">Nothing found — type the name below instead.</p>`) : "";
    return `<p class="hint">Where are the prescriptions filled? Search, or leave empty and tap Nearby. You can skip this.</p>
      <div class="search"><input data-wiz-find value="${esc(f.q)}" placeholder="e.g. Walgreens, Costco, Amazon" enterkeyhint="search">
        <button class="primary" data-act="wiz-find">${f.q ? "Search" : "Nearby"}</button></div>
      ${results}
      <div class="g2">
        <label>Pharmacy name<input data-wbind="pharmacy.name" value="${esc(ph.name)}"></label>
        <label>Phone<input data-wbind="pharmacy.phone" value="${esc(ph.phone)}" type="tel"></label>
      </div>`;
  }

  _wizMed() {
    const w = this._wiz;
    const m = w.med;
    const days = DAY.map((x, i) => `<button class="wd ${m.weekdays.includes(i) ? "on" : ""}" data-act="wiz-wd" data-i="${i}">${x.slice(0, 2)}</button>`).join("");
    return `<p class="hint">Add one medication now — you can add the rest later on the People tab.</p>
      <div class="g2">
        <label>Medication name<input data-wbind="med.name" value="${esc(m.name)}" placeholder="e.g. Lisinopril"></label>
        <label>Strength<input data-wbind="med.strength" value="${esc(m.strength)}" placeholder="e.g. 10 mg"></label>
        <label>Form<select data-wbind="med.form">${FORMS.map((x) => `<option ${m.form === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
        <label>Dose<input data-wbind="med.dose" value="${esc(m.dose)}" placeholder="e.g. 1 tablet"></label>
      </div>
      <div class="label-row">When</div>
      <div class="checks">${w.person.slots.map((sl) => `<label class="checkchip"><input type="checkbox" data-wiz-slot value="${sl.id}" ${m.slots.includes(sl.id) ? "checked" : ""}>${esc(sl.name)} · ${fmtTime(sl.time)}</label>`).join("")}</div>
      <label>How often<select data-wbind="med.freq" data-wiz-rerender>
        <option value="daily" ${m.freq === "daily" ? "selected" : ""}>Every day</option>
        <option value="weekly" ${m.freq === "weekly" ? "selected" : ""}>Certain days each week</option>
        <option value="biweekly" ${m.freq === "biweekly" ? "selected" : ""}>Every 2 weeks</option>
        <option value="monthly" ${m.freq === "monthly" ? "selected" : ""}>Once a month (on today's date)</option></select></label>
      ${m.freq === "weekly" || m.freq === "biweekly" ? `<div class="weekdays">${days}</div>` : ""}
      <div class="g2">
        <label>Rx number <span class="hint-inline">optional</span><input data-wbind="med.rx_number" value="${esc(m.rx_number)}"></label>
        <label>Reorder reminder<select data-wbind="med.reorder">
          <option value="none" ${m.reorder === "none" ? "selected" : ""}>No reminder</option>
          <option value="monthly" ${m.reorder === "monthly" ? "selected" : ""}>Monthly (from today)</option>
          <option value="biweekly" ${m.reorder === "biweekly" ? "selected" : ""}>Every 2 weeks (from today)</option>
          <option value="weekly" ${m.reorder === "weekly" ? "selected" : ""}>Weekly (from today)</option></select></label>
      </div>`;
  }

  _wizTest() {
    const w = this._wiz;
    return `<div class="wizhero">✅</div>
      <h3 class="wiztitle">${w.practice ? "Practice data saved" : "All set up"}</h3>
      <p><b>${esc(w.person.name)}</b> will be reminded about <b>${esc([w.med.name, w.med.strength].filter(Boolean).join(" "))}</b>
        ${esc(w.med.slots.map((id) => w.person.slots.find((x) => x.id === id)?.name).filter(Boolean).join(" and ").toLowerCase())}.</p>
      <p>Send a test reminder to make sure their phone gets it. On iPhone, <b>long-press</b> the notification to see its buttons.</p>
      <div class="actions"><button class="primary" data-act="wiz-test">Send test reminder</button>
        ${w.tested ? `<span class="muted">Sent — check the phone.</span>` : ""}</div>`;
  }

  _wizDone() {
    const w = this._wiz;
    return `<div class="wizhero">🎉</div>
      <h3 class="wiztitle">Done!</h3>
      ${w.practice ? `<p>This was a practice run. Its person, pharmacy and medication are marked <span class="chip demo">DEMO</span>.</p>
        <div class="wizchoices">
          <button class="wizchoice" data-act="wiz-discard"><b>Discard practice data</b><span>Removes everything this run added.</span></button>
          <button class="wizchoice" data-act="wiz-keep"><b>Keep it</b><span>Turns it into real data with real reminders.</span></button>
        </div>`
        : `<p>Reminders are on. Next:</p><ul>
          <li><b>Today</b> — tick doses as they're taken.</li>
          <li><b>People</b> — add more medications and times.</li>
          <li><b>Settings</b> — colours, reminder wording and buttons.</li>
          <li><b>Help</b> — a short guide whenever you need it.</li></ul>
        <div class="actions"><button class="primary" data-act="wiz-close-today">Go to Today</button></div>`}`;
  }

  async _wizNext() {
    const w = this._wiz;
    if (w.step === 1) {
      if (!w.person.person) { this._toast("Choose who takes the medication"); return; }
      if (!String(w.person.name).trim()) { this._toast("Enter a name"); return; }
    }
    if (w.step === 3) {
      if (!String(w.med.name).trim()) { this._toast("Enter the medication's name"); return; }
      if (!w.med.slots.length) { this._toast("Choose at least one time"); return; }
      if ((w.med.freq === "weekly" || w.med.freq === "biweekly") && !w.med.weekdays.length) { this._toast("Choose the day(s) of the week"); return; }
      if (!(await this._wizSave())) return;
    }
    if (w.step === 4) { w.step = 5; this._renderWizard(); return; }
    w.step += 1;
    this._renderWizard();
  }

  // Create the person, pharmacy, medication and schedule (as demo data in a practice run).
  async _wizSave() {
    const w = this._wiz;
    const demo = w.practice;
    const today = this._data.today;
    try {
      const created = { users: [], pharmacies: [], medications: [], assignments: [] };
      let pharmacyId = null;
      if (!w.pharmacy.skip && String(w.pharmacy.name).trim()) {
        const ph = await this._ws({ type: "med_manager/save", collection: "pharmacies", item: { ...w.pharmacy, demo } });
        pharmacyId = ph.id; created.pharmacies.push(ph.id);
      }
      const p = w.person;
      const user = await this._ws({ type: "med_manager/save", collection: "users", item: {
        name: p.name, person: p.person === "__other" ? null : p.person, notify: p.notify, slots: p.slots, demo } });
      created.users.push(user.id);
      const m = w.med;
      const reorder = m.reorder === "none" ? { enabled: false }
        : { enabled: true, time: "09:00", user_ids: [user.id], schedule: m.reorder === "monthly" ? { freq: "monthly", start: today }
          : { freq: "weekly", interval: m.reorder === "biweekly" ? 2 : 1, weekdays: [wd(parseD(today))], start: today } };
      const med = await this._ws({ type: "med_manager/save", collection: "medications", item: {
        name: m.name, strength: m.strength, form: m.form, rx_number: m.rx_number, pharmacy_id: pharmacyId, reorder, demo } });
      created.medications.push(med.id);
      const schedule = m.freq === "daily" ? { freq: "daily", start: today }
        : m.freq === "monthly" ? { freq: "monthly", start: today }
        : { freq: "weekly", interval: m.freq === "biweekly" ? 2 : 1, weekdays: m.weekdays, start: today };
      const a = await this._ws({ type: "med_manager/save", collection: "assignments", item: {
        user_id: user.id, medication_id: med.id, dose: m.dose, times: m.slots.map((id) => ({ slot: id })), schedule, demo } });
      created.assignments.push(a.id);
      w.created = created;
      w.userId = user.id;
      await this._refresh();
      return true;
    } catch (err) {
      this._toast(`Couldn't save: ${err.message || err}`);
      return false;
    }
  }

  async _wizDiscard() {
    const c = this._wiz?.created;
    if (c) {
      for (const [col, ids] of [["assignments", c.assignments], ["medications", c.medications], ["users", c.users], ["pharmacies", c.pharmacies]]) {
        for (const id of ids) {
          try { await this._ws({ type: "med_manager/delete", collection: col, item_id: id }); } catch (e) { /* already gone */ }
        }
      }
    }
    this._closeWizard();
    await this._refresh();
    this._toast("Practice data removed");
  }

  async _wizKeep() {
    const c = this._wiz?.created;
    const d = this._data;
    if (c) {
      const coll = { users: d.users, pharmacies: d.pharmacies, medications: d.medications, assignments: d.assignments };
      for (const col of ["pharmacies", "users", "medications", "assignments"]) {
        for (const id of c[col]) {
          const item = coll[col].find((x) => x.id === id);
          if (item) await this._ws({ type: "med_manager/save", collection: col, item: { ...item, demo: false } });
        }
      }
    }
    this._closeWizard();
    this._tab = "today";
    await this._refresh();
    this._toast("Kept — reminders are on");
  }

  /* People */
  _viewPeople() {
    const d = this._data;
    let html = `<div class="bar"><h1>People</h1><button class="primary" data-act="new-user">+ Add person</button></div>`;
    if (!d.users.length) html += `<div class="card muted">Add a person to start assigning medications.</div>`;
    for (const u of d.users) {
      const list = d.assignments.filter((a) => a.user_id === u.id);
      const notify = (u.notify || []).map((n) => d.notify_services.includes(n) || n === "fake_android"
        ? `<span class="chip">${esc(n.replace(/^mobile_app_/, ""))}${{ android: " · Android", ios: " · iPhone" }[(d.platforms || {})[n]] || ""}</span>`
        : `<span class="chip warn" title="This phone no longer exists in Home Assistant">${esc(n.replace(/^mobile_app_/, ""))} — not found</span>`).join("") ||
        `<span class="chip warn">No phone set — no reminders</span>`;
      html += `<section class="card person" style="${this._personStyle(u)}">
        <header>${this._avatar(u)}<h2>${esc(u.name)}</h2>${u.demo ? `<span class="chip demo">DEMO</span>` : ""}${this._presence(u)}
          <span class="spacer"></span>
          <button class="text" data-act="test" data-id="${u.id}">Test reminder</button>
          <button class="text" data-act="edit-user" data-id="${u.id}">Edit</button></header>
        <div class="meta"><span class="label">Reminders to</span> ${notify}</div>
        <div class="meta"><span class="label">Reminder times</span> ${(u.slots || []).map((s) => `<span class="chip">${esc(s.name)} · ${fmtTime(s.time)}</span>`).join("") || `<span class="muted">none</span>`}</div>
        <div class="list">${list.map((a) => this._assignmentRow(u, a)).join("") || `<p class="muted">No medications yet.</p>`}</div>
        <button class="text" data-act="new-assign" data-user="${u.id}">+ Add medication for ${esc(u.name)}</button>
      </section>`;
    }
    return html;
  }

  _assignmentRow(u, a) {
    const m = this._med(a.medication_id);
    const times = (a.times || []).map((t) => `<span class="chip">${esc(this._slotLabel(u, t))}</span>`).join("");
    return `<div class="row ${a.paused ? "paused" : ""}">
      ${medIcon(m)}
      <div class="grow" data-act="edit-assign" data-id="${a.id}">
        <div class="name">${esc(this._medName(m))}${a.dose ? ` <span class="muted">— ${esc(a.dose)}</span>` : ""}</div>
        <div class="sub">${times || `<span class="chip warn">No time set</span>`} <span class="muted">${esc(a.schedule_text || describe(a.schedule))}</span></div>
        ${a.paused ? `<div class="sub warn-text">Paused${a.paused_at ? ` since ${esc(fmtDate(a.paused_at))}` : ""}</div>` : ""}
      </div>
      <button class="${a.paused ? "primary small" : "text small"}" data-act="pause" data-id="${a.id}">${a.paused ? "Resume" : "Pause"}</button>
      <button class="text small" data-act="edit-assign" data-id="${a.id}">Edit</button>
    </div>`;
  }

  /* Medications */
  _viewMeds() {
    const d = this._data;
    let html = `<div class="bar"><h1>Medications</h1><button class="primary" data-act="new-med">+ Add medication</button></div>`;
    if (!d.medications.length) html += `<div class="card muted">Add a prescription or supplement. You can then assign it to people on the People tab.</div>`;
    const sorted = [...d.medications].sort((a, b) => a.name.localeCompare(b.name));
    for (const m of sorted) {
      const p = this._pharm(m.pharmacy_id);
      const takers = [...new Set(d.assignments.filter((a) => a.medication_id === m.id).map((a) => this._user(a.user_id)?.name).filter(Boolean))];
      const ro = m.reorder || {};
      html += `<section class="card med">
        <header>${medIcon(m, 30)}<div class="grow"><h2>${m.demo ? `<span class="chip demo">DEMO</span> ` : ""}${esc(m.name)} ${m.strength ? `<span class="strength">${esc(m.strength)}</span>` : ""}</h2>
          <div class="sub">${esc([m.form, m.instructions].filter(Boolean).join(" · "))}</div></div>
          ${this._lookupMenu(m)}
          <button class="text" data-act="edit-med" data-id="${m.id}">Edit</button></header>
        <div class="facts">
          <div><span class="label">Pharmacy</span>${p ? esc(p.name) : `<span class="muted">—</span>`}</div>
          ${m.rx_number ? `<div><span class="label">Rx #</span>${esc(m.rx_number)}</div>` : ""}
          ${m.prescriber ? `<div><span class="label">Prescriber</span>${esc(m.prescriber)}</div>` : ""}
          ${m.quantity ? `<div><span class="label">Qty per fill</span>${esc(m.quantity)}</div>` : ""}
          <div><span class="label">Taken by</span>${takers.length ? esc(takers.join(", ")) : `<span class="muted">nobody yet</span>`}</div>
          <div><span class="label">Reorder</span>${ro.enabled ? `${esc(m.reorder_text)} at ${fmtTime(ro.time)}${m.next_reorder ? ` · next ${esc(fmtDate(m.next_reorder))}` : ""}
            <button class="text small" data-act="test-rx" data-id="${m.id}">Send test</button>` : `<span class="muted">no reminder</span>`}</div>
          ${m.last_ordered ? `<div><span class="label">Last ordered</span>${esc(fmtDate(m.last_ordered))}</div>` : ""}
        </div>
        ${m.notes ? `<p class="notes">${esc(m.notes)}</p>` : ""}
      </section>`;
    }
    return html;
  }

  _lookupMenu(m) {
    const p = this._pharm(m.pharmacy_id);
    const q = m.name;
    const links = LOOKUPS.map(([label, fn]) => `<a href="${esc(fn(q))}" target="_blank" rel="noopener">${esc(label)}</a>`);
    if (p?.lookup_url) links.unshift(`<a href="${esc(p.lookup_url.replace("{q}", encodeURIComponent(q)))}" target="_blank" rel="noopener">${esc(p.name)}</a>`);
    return `<details class="lookup"><summary class="btn text">Look up ▾</summary><div class="menu-pop">${links.join("")}</div></details>`;
  }

  /* Pharmacies */
  _viewPharmacies() {
    const d = this._data;
    let html = `<div class="bar"><h1>Pharmacies</h1><button class="primary" data-act="new-pharmacy">+ Add pharmacy</button></div>`;
    if (!d.pharmacies.length) html += `<div class="card muted">Add the pharmacies you use, then pick one for each medication.</div>`;
    for (const p of d.pharmacies) {
      const meds = d.medications.filter((m) => m.pharmacy_id === p.id);
      const site = p.login_url || p.website;
      html += `<section class="card">
        <header><h2 class="grow">${p.demo ? `<span class="chip demo">DEMO</span> ` : ""}${esc(p.name)}</h2><button class="text" data-act="edit-pharmacy" data-id="${p.id}">Edit</button></header>
        <div class="facts">
          ${p.phone ? `<div><span class="label">Phone</span><a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></div>` : ""}
          ${p.address ? `<div><span class="label">Address</span><a href="https://maps.apple.com/?q=${encodeURIComponent(p.address)}" target="_blank" rel="noopener">${esc(p.address)}</a></div>` : ""}
          ${p.website ? `<div><span class="label">Website</span><a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.website.replace(/^https?:\/\//, ""))}</a></div>` : ""}
          ${p.username ? `<div><span class="label">Username</span>${esc(p.username)} <button class="text small" data-act="copy" data-text="${esc(p.username)}">Copy</button></div>` : ""}
          <div><span class="label">Medications</span>${meds.length ? esc(meds.map((m) => this._medName(m)).join(", ")) : `<span class="muted">none</span>`}</div>
        </div>
        ${p.notes ? `<p class="notes">${esc(p.notes)}</p>` : ""}
        <div class="actions">
          ${site ? `<a class="btn primary" href="${esc(site)}" target="_blank" rel="noopener">Open account login</a>` : ""}
          ${p.phone ? `<a class="btn text" href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">Call</a>` : ""}
        </div>
      </section>`;
    }
    return html;
  }

  /* History */
  _viewHistory() {
    const d = this._data;
    if (!this._history) { this._loadHistory(); return `<div class="loading">Loading…</div>`; }
    const label = { taken: "Taken", skipped: "Skipped", missed: "Missed", undo: "Undone" };
    const cls = { taken: "ok", skipped: "", missed: "warn", undo: "" };
    let html = `<div class="bar"><h1>History</h1>
      <select data-act="hist-user"><option value="">Everyone</option>${d.users.map((u) => `<option value="${u.id}" ${this._histUser === u.id ? "selected" : ""}>${esc(u.name)}</option>`).join("")}</select></div>`;
    if (!this._history.length) return html + `<div class="card muted">Nothing recorded in the last 60 days.</div>`;
    let lastDay = "";
    html += `<section class="card">`;
    for (const h of this._history) {
      const day = h.date;
      if (day !== lastDay) { html += `<div class="hday">${esc(fmtDate(day, { weekday: "long", month: "short", day: "numeric" }))}</div>`; lastDay = day; }
      html += `<div class="row"><div class="grow"><div class="name">${esc(h.medication)}${h.dose ? ` <span class="muted">— ${esc(h.dose)}</span>` : ""}</div>
        <div class="sub">${esc(this._user(h.user_id)?.name || "")} · ${fmtTime(h.time)} dose · ${h.action === "missed" ? "" : `at ${esc(fmtClock(h.ts))}`} ${h.source === "notification" ? "from phone" : h.source === "panel" ? "in app" : ""}</div></div>
        <span class="chip ${cls[h.action] || ""}">${esc(label[h.action] || h.action)}</span></div>`;
    }
    return html + `</section>`;
  }

  async _loadHistory() {
    try {
      this._history = await this._ws({ type: "med_manager/history", days: 60, user_id: this._histUser || null });
      if (this._demoOnly) { const ids = new Set(this._data.users.map((u) => u.id)); this._history = this._history.filter((h) => ids.has(h.user_id)); }
    }
    catch (err) { this._history = []; this._toast(err.message || String(err)); }
    if (this._tab === "history") this._renderMain();
  }

  /* Help */
  _viewHelp() {
    const step = (n, title, body) => `<div class="hstep"><span class="hnum">${n}</span><div><b>${title}</b><div class="sub">${body}</div></div></div>`;
    const card = (title, items) => `<section class="card help"><h2>${title}</h2><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></section>`;
    return `<div class="bar"><h1>Help</h1><button class="primary" data-act="wiz-open">Run the setup wizard</button></div>
      <section class="card help">
        <h2>Get started in 4 steps</h2>
        ${step(1, "Add your pharmacy", "Pharmacies → + Add pharmacy → type a name or tap <i>Nearby</i> → pick it. Address, phone and login page fill in.")}
        ${step(2, "Add your medications", "Medications → + Add medication. Name, strength, form and colour; add the Rx number and pharmacy for refills.")}
        ${step(3, "Add the people who take them", "People → + Add person → pick them from Home Assistant. Their phone is chosen for you.")}
        ${step(4, "Give each person their medications", "On their card: + Add medication → dose, Morning/Evening time, and which days (daily, weekly, every 2 weeks, monthly…).")}
      </section>
      <div class="helpgrid">
        ${card("📋 Today", [
          "Tap the circle to mark a pill taken — tap again to undo. <b>Skip</b> if you're skipping it.",
          "<b>Mark all taken</b> ticks a whole Morning/Evening group.",
          "Tap names at the top to choose whose medications are shown.",
          "‹ › shows other days. Upcoming refills appear at the bottom of each person's card.",
        ])}
        ${card("🔔 Reminders on your phone", [
          "Medications with the same time arrive together in one notification.",
          "<b>Long-press</b> (iPhone) or pull down the notification to see the buttons.",
          "<b>Taken</b>, <b>Remind me later</b>, <b>When I get home</b> (only when you're away) or <b>Skip</b>.",
          "Unanswered reminders repeat every 15 minutes, 3 times (change it in Settings).",
        ])}
        ${card("📦 Refills", [
          "Edit a medication → <b>Reorder reminder</b> → pick the schedule (e.g. every 2 weeks on Thursday) and time.",
          "<b>Whose refill is this?</b> decides who is reminded and whose Today card shows it.",
          "It repeats daily until you tap <b>Ordered</b>, <b>Snooze 1 day</b> or <b>Not needed</b>.",
          "<b>Call pharmacy</b> opens a screen with the Rx number in big type, so you can read it out during the call.",
        ])}
        ${card("⏸️ Changing things", [
          "<b>Pause / Resume</b> a medication on the People tab — no reminders while paused.",
          "<b>Look up</b> on a medication opens Drugs.com, MedlinePlus or GoodRx.",
          "Tap <b>Edit</b> on anything to change or delete it.",
          "History shows every dose taken, skipped or missed.",
        ])}
        ${card("🎨 Settings", [
          "<b>Appearance:</b> colour scheme, card style (Neumorphism, Glass…), colours — save your own scheme with ★.",
          "<b>Medication / Refill reminders:</b> change the wording and buttons; the phone preview shows the result.",
          "<b>Send test</b> sends a sample reminder right away. <b>Reset tab to defaults</b> undoes a saved change.",
          "<b>Demo:</b> try everything with Pill Popper Penelope and silly medications, without touching your real data.",
          "<b>Backups:</b> everything is backed up nightly (14 days kept). Restore any of them, back up now, or export to a file.",
        ])}
        ${card("🛠️ If something isn't right", [
          "No reminders? People → <b>Test reminder</b>. A phone marked <i>not found</i> needs re-ticking in Edit.",
          "No buttons on the notification? Long-press it; check the Home Assistant app may send notifications.",
          "App looks out of date? Pull down to refresh, or HA app → Settings → Companion app → Debugging → Reset frontend cache.",
          "Not a medical device — keep another reminder for critical medications.",
        ])}
      </div>`;
  }

  /* Settings */
  _viewSettings() {
    if (!this._sdraft) this._sdraft = clone(this._data.settings);
    const s = this._sdraft;
    const a = s.appearance || {};
    const glassScheme = String(a.scheme || "").startsWith("glass:");
    const isGlass = a.card === "glass";
    const chk = (path, label, help = "") => `<label class="switch-row"><div class="grow"><div>${label}</div>${help ? `<div class="sub">${help}</div>` : ""}</div>
      <input type="checkbox" data-sbind="${path}" ${getPath(s, path) ? "checked" : ""}></label>`;
    const sel = (path, label, options) => `<label>${label}<select data-sbind="${path}">${options.map(([v, t]) =>
      `<option value="${v}" ${String(getPath(s, path) ?? "") === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
    const delays = (Array.isArray(s.snooze_options) ? s.snooze_options : String(s.snooze_options || "").split(/[,\s]+/))
      .map(Number).filter((x) => x > 0);
    // Each button: its text, and whether iPhones / Android phones get it (Android: 3 buttons at most).
    const btnRow = (group, name, label, help = "") => {
      const b = (s[group] || {})[name] || {};
      const field = group === "reorder_buttons" ? "reorder_buttons" : "dose_buttons";
      const ids = group === "dose_buttons" && name === "snooze" ? delays.map((_, i) => `snooze${i}`) : [name];
      const chosen = (s.android || {})[field] || [];
      const onDroid = ids.some((x) => chosen.includes(x));
      const partial = ids.length > 1 && onDroid && !ids.every((x) => chosen.includes(x))
        ? ` <span class="hint-inline">(Android: ${ids.filter((x) => chosen.includes(x)).map((x) => fmtMinutes(delays[+x.slice(6)])).join(", ")} only)</span>` : "";
      return `<div class="btnrow">
        <div class="grow"><div class="sub">${label}${help ? ` · ${help}` : ""}${partial}</div>
          <input data-sbind="${group}.${name}.label" value="${esc(b.label || "")}" maxlength="60"></div>
        <label class="oscheck"><input type="checkbox" data-sbind="${group}.${name}.on" ${b.on !== false ? "checked" : ""}>iPhone</label>
        <label class="oscheck"><input type="checkbox" data-android-field="${field}" data-android-ids="${ids.join(",")}" ${onDroid ? "checked" : ""}>Android</label>
      </div>`;
    };
    const droidCount = (field) => ((s.android || {})[field] || []).length;
    const tabs = TABS.filter(([id]) => id !== "today" && id !== "settings" && id !== "help");
    const bar = `<div class="bar sbar"><h1>Settings</h1>
        <div class="actions" style="margin:0">${this._sdirty ? `<button class="text" data-act="discard-settings">Undo changes</button>` : ""}
        ${!["about", "backups"].includes(this._settingsTab || "appearance") && this._data.default_settings
          ? `<button class="text" data-act="reset-tab" title="Put this tab back to how it was when installed">Reset tab to defaults</button>` : ""}
        <button class="primary" data-act="save-settings">Save settings</button></div></div>`;
    // Compact on/off chip (instead of a full-width switch row with help text).
    const tick = (path, label, title = "") => `<label class="checkchip" title="${esc(title)}"><input type="checkbox" data-sbind="${path}" ${getPath(s, path) ? "checked" : ""}>${label}</label>`;
    const sections = {
      appearance: `
      <section class="card form spane">
        <div class="g4">
          ${this._schemeSelect(a)}
          ${sel("appearance.card", "Card style", [["raised", "Raised"], ["flat", "Flat"], ["glass", "Glassmorphism"], ["neu", "Neumorphism"]])}
          ${sel("appearance.density", "Spacing", [["comfortable", "Comfortable"], ["compact", "Compact"]])}
          ${sel("appearance.text", "Text size", [["normal", "Normal"], ["large", "Large"]])}
          ${sel("appearance.start_tab", "Open on", this._visibleTabs().map(([id, label]) => [id, label]))}
          ${isGlass && !glassScheme ? sel("appearance.glass_bg", "Glass backdrop", [["accent", "Accent glow"], ["aurora", "Aurora"],
            ["sunset", "Sunset"], ["ocean", "Ocean"], ["forest", "Forest"], ["home", "Home (sage & gold)"], ["none", "None"]]) : ""}
          ${isGlass ? sel("appearance.glass_tint", "Frosting", [["auto", "Follow theme"], ["light", "White frost"], ["dark", "Smoked"], ["accent", "Accent tint"]]) : ""}
          ${isGlass ? sel("appearance.glass_opacity", "Transparency", [["clear", "Clear"], ["medium", "Medium"], ["frosted", "Frosted"]]) : ""}
          ${isGlass ? sel("appearance.glass_blur", "Blur", [["low", "Low"], ["medium", "Medium"], ["high", "High"]]) : ""}
        </div>
        ${this._customiseColors(a)}
        <div class="checks tight">
          <span class="label-inline">Show tabs</span>
          ${tabs.map(([id, label]) => `<label class="checkchip"><input type="checkbox" data-tabshow="${id}" ${(a.hide_tabs || []).includes(id) ? "" : "checked"}>${label}</label>`).join("")}
          <span class="label-inline">Extras</span>
          ${tick("appearance.med_icons", "Pill icons", "Coloured pill icons next to medications")}
          ${isGlass ? tick("appearance.glass_border", "Glass edges", "Thin bright border and highlight on cards") : ""}
        </div>
      </section>`,
      dose: `
      <section class="card form spane">
        <div class="split">
          <div>
            <div class="g2">
              <label><span>Title <span class="hint-inline">{label} {person} {count}</span></span><input data-sbind="dose_notice.title" value="${esc(s.dose_notice?.title || "")}"></label>
              ${sel("dose_notice.show_person", "Add the person's name", [["auto", "If more than one person"], ["always", "Always"], ["never", "Never"]])}
            </div>
            <div class="checks tight"><span class="label-inline">Show</span>
              ${tick("dose_notice.show_list", "List medications", "Off: just the reminder time and a short summary")}
              ${s.dose_notice?.show_list === false ? "" : ["show_strength:Strength", "show_dose:Dose", "show_instructions:Instructions", "show_notes:Notes"].map((x) => {
                const [k, t] = x.split(":");
                return tick(`dose_notice.${k}`, t);
              }).join("")}
            </div>
            ${s.dose_notice?.show_list === false ? `<label><span>Message instead of the list <span class="hint-inline">{count} {label} {person}</span></span>
              <input data-sbind="dose_notice.summary" value="${esc(s.dose_notice?.summary ?? "{count} to take")}"></label>` : ""}
            <div class="label-row">Buttons <span class="hint-inline">edit the text · tick which phones get each one · Android shows up to 3 (${droidCount("dose_buttons")}/3 picked${delays.length > 1 ? "; each “later” delay counts as one" : ""})</span></div>
            <div class="btngrid">
              ${btnRow("dose_buttons", "taken", "Taken")}
              ${btnRow("dose_buttons", "snooze", "Remind me later", "{time}")}
              ${btnRow("dose_buttons", "home", "When I get home", "only when away")}
              ${btnRow("dose_buttons", "skip", "Skip")}
            </div>
            <div class="g4">
              <label>Later delays (min)<input data-sbind="snooze_options" data-csv value="${esc(Array.isArray(s.snooze_options) ? s.snooze_options.join(", ") : s.snooze_options || "")}"></label>
              <label>Repeat every (min)<input type="number" min="1" data-sbind="nag_interval" value="${esc(s.nag_interval)}"></label>
              <label>Repeats<input type="number" min="0" max="20" data-sbind="nag_count" value="${esc(s.nag_count)}"></label>
            </div>
            <div class="checks tight delivery"><span class="label-inline">Delivery</span>
              ${tick("time_sensitive", "Time-sensitive (iPhone)", "iPhone: breaks through Focus modes")}
              ${tick("android.priority", "High priority (Android)", "Android: delivered right away even when the phone is idle")}
            </div>
            ${this._testRow("dose")}
          </div>
          <div class="preview" data-preview="dose">${this._previewDose()}</div>
        </div>
      </section>`,
      refill: `
      <section class="card form spane">
        <div class="split">
          <div>
            <label><span>Title <span class="hint-inline">{medication}</span></span><input data-sbind="reorder_notice.title" value="${esc(s.reorder_notice?.title || "")}"></label>
            <div class="checks tight"><span class="label-inline">Show</span>
              ${["show_rx:Rx number", "show_pharmacy:Pharmacy", "show_phone:Phone", "show_for:Who it's for"].map((x) => {
                const [k, t] = x.split(":");
                return tick(`reorder_notice.${k}`, t);
              }).join("")}
              ${tick("reorder_repeat_daily", "Repeat daily", "Until Ordered, Snooze 1 day or Not needed")}
            </div>
            <div class="label-row">Buttons <span class="hint-inline">edit the text · tick which phones get each one · Android shows up to 3 (${droidCount("reorder_buttons")}/3 picked)</span></div>
            <div class="btngrid">
              ${btnRow("reorder_buttons", "ordered", "Ordered")}
              ${btnRow("reorder_buttons", "snooze", "Snooze 1 day")}
              ${btnRow("reorder_buttons", "not_needed", "Not needed")}
              ${btnRow("reorder_buttons", "call", "Call pharmacy", "{rx} = (Rx 1234)")}
              ${btnRow("reorder_buttons", "site", "Pharmacy website")}
            </div>

            ${this._testRow("rx")}
          </div>
          <div class="preview" data-preview="rx">${this._previewReorder()}</div>
        </div>
      </section>`,
      demo: `
      <section class="card form spane">
        ${chk("demo.enabled", "Show a demo person", "Adds “Pill Popper Penelope” with a pretend pharmacy and silly medications (Chill Pills, Unicorn Sparkles, Procrastinol…). Turning it off removes all demo data.")}
        ${s.demo?.enabled ? this._demoPhoneSelect(s) : ""}
        ${s.demo?.enabled && s.demo?.notify === "fake_android" ? this._fakePhone() : ""}
        ${s.demo?.enabled ? chk("demo.only", "Show only demo data", "Hides your real people, medications and pharmacies in the app. Nothing is deleted; real reminders still go out.") : ""}
        <p class="hint">Takes effect when you tap Save settings.</p>
      </section>`,
      backups: this._backupsPane(),
      about: `
      <section class="card form spane about">
        <div class="facts">
          <div><span class="label">Version</span>${esc(this._data.about?.version || this._panel?.config?.version || "")}</div>
          <div><span class="label">Released</span>${esc(this._data.about?.date ? fmtDate(this._data.about.date, { month: "long", day: "numeric", year: "numeric" }) : "")}</div>
          <div><span class="label">GitHub</span>${this._data.about?.repo
            ? `<a href="${esc(this._data.about.repo)}" target="_blank" rel="noopener">${esc(this._data.about.repo.replace(/^https?:\/\//, ""))}</a>`
            : `<span class="muted">not published yet</span>`}</div>
          ${this._data.about?.support ? `<div><span class="label">Support</span><a href="${esc(this._data.about.support)}" target="_blank" rel="noopener">☕ Buy me a coffee</a>
            <span class="muted">— if this app helps you, thank you!</span></div>` : ""}
        </div>
      </section>`,
    };
    const st = sections[this._settingsTab] ? this._settingsTab : "appearance";
    const subtabs = [["appearance", "Appearance"], ["dose", "Medication reminders"], ["refill", "Refill reminders"], ["demo", "Demo"], ["backups", "Backups"], ["about", "About"]];
    return `${bar}
      <div class="subtabs" role="tablist">${subtabs.map(([k, label]) =>
        `<button class="subtab ${st === k ? "on" : ""}" role="tab" aria-selected="${st === k}" data-act="settings-tab" data-stab="${k}">${label}</button>`).join("")}</div>
      ${sections[st]}`;
  }

  // Android phones show at most 3 buttons: choose which. iPhones always get every button that's on.
  _androidPicker(kind, s) {
    const a = s.android || {};
    const field = kind === "rx" ? "reorder_buttons" : "dose_buttons";
    const chosen = a[field] || [];
    let opts;
    if (kind === "rx") {
      opts = [["ordered", "Ordered"], ["snooze", "Snooze 1 day"], ["not_needed", "Not needed"], ["call", "Call pharmacy"], ["site", "Pharmacy website"]];
    } else {
      const mins = (Array.isArray(s.snooze_options) ? s.snooze_options : String(s.snooze_options || "").split(/[,\s]+/)).map(Number).filter((x) => x > 0);
      opts = [["taken", "Taken"], ...mins.map((m, i) => [`snooze${i}`, `Later ${fmtMinutes(m)}`]), ["home", "When home"], ["skip", "Skip"]];
    }
    const androids = Object.entries(this._data.platforms || {}).filter(([k, v]) => v === "android" && k !== "fake_android").length;
    return `<div class="checks tight android-row" title="Android shows at most 3 buttons on a notification. iPhones are not affected.">
      <span class="label-inline">🤖 Android buttons (pick 3)</span>
      ${opts.map(([id, label]) => `<label class="checkchip"><input type="checkbox" data-android-btn="${field}" value="${id}" ${chosen.includes(id) ? "checked" : ""}>${label}</label>`).join("")}
      ${kind === "dose" ? `<label class="checkchip" title="Android only: delivered right away even when the phone is idle"><input type="checkbox" data-sbind="android.priority" ${a.priority !== false ? "checked" : ""}>High priority</label>` : ""}
      <span class="hint-inline">${androids ? `${androids} Android phone${androids > 1 ? "s" : ""} in Home Assistant` : "no Android phones yet"}</span>
    </div>`;
  }

  _backupsPane() {
    if (!this._backups) { this._loadBackups(); return `<section class="card form spane"><p class="muted">Loading…</p></section>`; }
    const reason = { nightly: "Nightly", manual: "Backed up by hand", "before restore": "Automatic, before a restore", "before import": "Automatic, before an import" };
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const rows = this._backups.map((b) => {
      const c = b.counts || {};
      const when = new Date(b.ts);
      return `<div class="row backup"><div class="grow">
          <div class="name">${esc(when.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }))}, ${esc(when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }))}
            <span class="muted">· ${esc(reason[b.reason] || b.reason)}</span></div>
          <div class="sub">${plural(c.users || 0, "person", "people")} · ${plural(c.medications || 0, "medication", "medications")} · ${plural(c.pharmacies || 0, "pharmacy", "pharmacies")} · ${plural(c.assignments || 0, "schedule", "schedules")}</div></div>
        <button class="pill" data-act="backup-restore" data-id="${b.id}">Restore</button>
        <button class="icon tiny" data-act="backup-delete" data-id="${b.id}" title="Delete this backup">✕</button></div>`;
    }).join("");
    return `<section class="card form spane">
      <p class="hint">A copy of all Medications data — people, medications, pharmacies, schedules, history and settings — is saved every night at 3 AM and kept for 14 days. Restoring only affects Medications; the rest of Home Assistant is untouched. A backup is taken automatically before every restore, so a restore can be undone.</p>
      <div class="actions pillrow">
        <button class="pill primary-pill" data-act="backup-now">Back up now</button>
        <button class="pill" data-act="backup-export">Export to a file</button>
        <label class="pill filepill">Import from a file<input type="file" accept="application/json,.json" data-backup-import hidden></label>
      </div>
      <div class="list backups">${rows || `<p class="muted">No backups yet — the first nightly one is made tonight at 3 AM, or tap Back up now.</p>`}</div>
    </section>`;
  }

  async _loadBackups() {
    try { this._backups = (await this._ws({ type: "med_manager/backups", op: "list" })).backups; }
    catch (err) { this._backups = []; this._toast(err.message || String(err)); }
    if (this._tab === "settings" && this._settingsTab === "backups") this._renderMain(true);
  }

  _testRow(kind) {
    const d = this._data;
    const opts = kind === "dose"
      ? d.users.map((u) => [u.id, u.name])
      : [...d.medications].sort((a, b) => (b.reorder?.enabled ? 1 : 0) - (a.reorder?.enabled ? 1 : 0) || a.name.localeCompare(b.name))
        .map((m) => [m.id, this._medName(m) + (m.reorder?.enabled ? "" : " (no reorder reminder)")]);
    if (!opts.length) return `<p class="hint">Add ${kind === "dose" ? "a person" : "a medication"} to send a test.</p>`;
    const cur = this[`_test_${kind}`] || opts[0][0];
    return `<div class="testrow" title="Uses the settings on this screen, even before you save. Test buttons change nothing.">
      <span class="label-inline">Try it</span>
      <select data-testpick="${kind}">${opts.map(([v, t]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
      <button class="primary" data-act="settings-test" data-kind="${kind}">Send test</button></div>`;
  }

  // The demo's pretend Android phone: what arrived, with working buttons.
  _fakePhone(testing = false) {
    const inbox = (this._data.fake_inbox || []).slice(0, testing ? 2 : 15);
    const saved = this._data.settings?.demo?.notify === "fake_android" && this._data.settings?.demo?.enabled;
    return `<div class="fakephone">
      <div class="fp-head"><b>Test Android phone</b><span class="hint-inline">exactly what an Android phone receives · buttons work</span><span class="spacer"></span>
        ${inbox.length ? `<button class="text small" data-act="fake-clear">Clear</button>` : ""}</div>
      ${testing && !inbox.length ? `<p class="hint">Tap Send test — it appears here with the Android buttons you picked.</p>` : ""}
      ${!testing && !saved ? `<p class="hint">Tap Save settings, then use Send test with Pill Popper Penelope.</p>` : ""}
      ${!testing && saved && !inbox.length ? `<p class="hint">No notifications yet. Use Send test on the Medication or Refill reminders tab, or wait for Penelope's next reminder.</p>` : ""}
      ${inbox.map((n) => `<div class="droid small"><div class="dnotif">
        <div class="dhead"><span class="appicon round"></span>Home Assistant · ${esc(fmtClock(n.ts))}
          <span class="spacer"></span><button class="icon tiny" data-act="fake-dismiss" data-tag="${esc(n.tag || "")}" title="Dismiss">✕</button></div>
        <div class="ntitle">${esc(n.title)}</div>
        <div class="nbody">${String(n.message || "").split("\n").map((l) => `<div>${esc(l)}</div>`).join("")}</div>
        <div class="dactions">${(n.data?.actions || []).map((x) => `<button data-act="fake-act" data-action="${esc(x.action)}" data-tag="${esc(n.tag || "")}"
          ${x.action === "URI" ? `data-uri="${esc(x.uri || "")}"` : ""}>${esc(x.title)}</button>`).join("")}</div>
        <div class="dmeta">${esc([n.data?.priority ? "priority: " + n.data.priority : "", n.data?.channel ? "channel: " + n.data.channel : ""].filter(Boolean).join(" · "))}</div>
      </div></div>`).join("")}
    </div>`;
  }

  _demoPhoneSelect(s) {
    const isTv = (x) => /apple_?tv|(^|_)tv($|_)/i.test(x);
    const phones = this._data.notify_services.filter((x) => x.startsWith("mobile_app_") && !isTv(x));
    const cur = s.demo?.notify ?? "";
    return `<label>Send Penelope's reminders to<select data-sbind="demo.notify">
      <option value="" ${cur === "" ? "selected" : ""}>Nowhere (only show them in the app)</option>
      <option value="fake_android" ${cur === "fake_android" ? "selected" : ""}>Test Android phone (shows on this screen)</option>
      ${phones.map((x) => `<option value="${esc(x)}" ${cur === x ? "selected" : ""}>${esc(x.replace(/^mobile_app_/, ""))}</option>`).join("")}
    </select></label>`;
  }

  _customiseColors(a) {
    const targets = COLOR_TARGETS.filter(([k]) => !(k === "card" && a.card === "neu"));
    if (!targets.some(([k]) => k === this._colorTarget)) this._colorTarget = "accent";
    const t = this._colorTarget;
    const custom = a.custom || {};
    const cur = (custom[t] || "").toLowerCase();
    const sw = (c) => `<button class="swatch ${cur === c ? "on" : ""}" data-act="pick-color" data-target="settings" data-path="appearance.custom.${t}"
      data-color="${c}" title="${c}" style="background:${c}"></button>`;
    const isCustom = cur && !PALETTE_ALL.includes(cur);
    return `<div class="customise">
      <div class="custom-head"><span class="label-inline">Customise colours</span>
      <div class="segmented" role="radiogroup" aria-label="Colour to change">
        ${targets.map(([k, label]) => `<label class="seg ${t === k ? "on" : ""}"><input type="radio" name="colortarget" value="${k}" data-colortarget ${t === k ? "checked" : ""}>
          <span class="segdot" style="${custom[k] ? `background:${esc(custom[k])}` : ""}"></span>${label}</label>`).join("")}
      </div></div>
      <div class="swatches palette">
        <button class="swatch ${cur ? "" : "on"}" data-act="pick-color" data-target="settings" data-path="appearance.custom.${t}" data-color="" title="The scheme's own colour">Auto</button>
        ${PALETTE_ALL.map(sw).join("")}
        <label class="swatch custom ${isCustom ? "on" : ""}" title="Any colour" style="${isCustom ? `background:${esc(cur)}` : ""}"><input type="color" data-color-input="appearance.custom.${t}" data-target="settings" value="${esc(cur || "#888888")}">${isCustom ? "" : "+"}</label>
      </div>
      <div class="actions pillrow">
        <button class="pill" data-act="reset-colors" ${Object.values(custom).some(Boolean) ? "" : "disabled"}>Reset colours</button>
        <button class="pill primary-pill" data-act="save-scheme">★ Save as new scheme</button>
        ${String(a.scheme || "").startsWith("custom:") ? `<button class="pill danger-pill" data-act="delete-scheme">Delete this scheme</button>` : ""}
      </div>
    </div>`;
  }

  _schemeSelect(a) {
    const cur = a.scheme || (a.theme === "light" || a.theme === "dark" ? a.theme : "auto");
    const live = this._hass?.states?.["input_select.home_palette"]?.state;
    const opt = (v, t) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(t)}</option>`;
    const mine = this._customSchemes();
    // The Home dashboard's current palette is listed once, under its own name, and follows the dashboard.
    return `<label>Colour scheme<select data-sbind="appearance.scheme">
      ${mine.length ? `<optgroup label="My schemes">${mine.map((x) => opt(`custom:${x.id}`, `★ ${x.name}`)).join("")}</optgroup>` : ""}
      ${opt("auto", "Follow Home Assistant")}${opt("light", "Light")}${opt("dark", "Dark")}
      ${Object.keys(HOME_SCHEMES).map((k) => (k === live ? opt("home", k) : opt(k, k))).join("")}
      ${Object.keys(GLASS_SCHEMES).map((k) => opt(`glass:${k}`, `${k} (glow)`)).join("")}
      </select></label>
      ${live && cur === "home" ? `<p class="hint">${esc(live)} follows your Home dashboard's palette.</p>` : ""}`;
  }

  _notifHtml(title, lines, buttons, kind = "dose") {
    const os = this._previewOs || "ios";
    const switcher = `<div class="ostoggle">${[["ios", "iPhone"], ["android", "Android"]].map(([k, t]) =>
      `<button class="${os === k ? "on" : ""}" data-act="preview-os" data-os="${k}">${t}</button>`).join("")}</div>`;
    const label = (b) => (typeof b === "string" ? b : b.label);
    if (os === "android") {
      const s = this._sdraft || this._data.settings;
      const chosen = (s.android || {})[kind === "rx" ? "reorder_buttons" : "dose_buttons"] || [];
      const shown = buttons.filter((b) => chosen.includes(b.id)).slice(0, 3);
      let standIn = "";
      if (chosen.includes("home") && kind !== "rx") {
        const order = ["skip", "snooze1", "snooze0", "taken"];
        const spare = buttons.filter((b) => !chosen.includes(b.id) && order.includes(b.id)).sort((x, y) => order.indexOf(x.id) - order.indexOf(y.id))[0];
        standIn = spare ? `At home, 🏠 is replaced by “${label(spare).trim()}”` : "At home, 🏠 isn't shown";
      }
      return `${switcher}<div class="droid">
        <div class="dnotif"><div class="dhead"><span class="appicon round"></span>Home Assistant · now</div>
          <div class="ntitle">${esc(title)}</div>
          <div class="nbody">${lines.map((l) => `<div>${esc(l)}</div>`).join("") || "&nbsp;"}</div>
          <div class="dactions">${shown.map((b) => `<span>${esc(label(b))}</span>`).join("") || `<span class="muted">No buttons</span>`}</div></div>
        <div class="hint">${standIn ? esc(standIn) + "<br>" : ""}Android · up to 3 buttons, high priority</div></div>`;
    }
    return `${switcher}<div class="phone">
      <div class="notif"><div class="nhead"><span class="appicon"></span>HOME ASSISTANT<span class="spacer"></span>now</div>
        <div class="ntitle">${esc(title)}</div>
        <div class="nbody">${lines.map((l) => `<div>${esc(l)}</div>`).join("") || "&nbsp;"}</div></div>
      <div class="nactions">${buttons.map((b) => `<div class="nbtn">${esc(label(b))}</div>`).join("") || `<div class="nbtn muted">No buttons</div>`}</div>
      <div class="hint">Preview · long-press shows the buttons</div></div>`;
  }

  _previewDose() {
    const s = this._sdraft || this._data.settings;
    const n = s.dose_notice || {};
    const b = s.dose_buttons || {};
    const d = this._data;
    const u = d.users[0] || { name: "Alex", slots: [{ id: "x", name: "Morning" }] };
    const slot = (u.slots || [])[0] || { id: "", name: "Morning" };
    let items = d.assignments.filter((a) => a.user_id === u.id && (a.times || []).some((t) => t.slot === slot.id)).slice(0, 3)
      .map((a) => ({ a, m: this._med(a.medication_id) || {} }));
    if (!items.length) items = [{ a: { dose: "1 tablet" }, m: { name: "Lisinopril", strength: "10 mg", instructions: "with food" } }];
    let title = fill(n.title || "💊 {label} medication", { label: slot.name, person: u.name, count: String(items.length) });
    const show = n.show_person || "auto";
    if (!(n.title || "").includes("{person}") && (show === "always" || (show === "auto" && d.users.length > 1))) {
      const i = title.indexOf(" ");
      const head = title.slice(0, i), rest = title.slice(i + 1);
      title = i > 0 && !/[A-Za-z0-9]/.test(head[0]) ? `${head} ${u.name}: ${rest}` : `${u.name}: ${title}`;
    }
    const count = `${items.length} medication${items.length === 1 ? "" : "s"}`;
    if (n.show_list === false) {
      const summary = fill(n.summary ?? "{count} to take", { count, label: slot.name, person: u.name }) || count;
      return this._notifHtml(title, [summary], this._previewDoseButtons(s, items.length));
    }
    const lines = items.map(({ a, m }) => {
      const name = [m.name, n.show_strength !== false ? m.strength : ""].filter(Boolean).join(" ") || "Medication";
      const extra = [[a.dose, n.show_dose !== false], [m.instructions, n.show_instructions !== false], [a.notes, !!n.show_notes]]
        .filter(([v, on]) => v && on).map(([v]) => v);
      return `• ${name}${extra.length ? ` — ${extra.join(", ")}` : ""}`;
    });
    return this._notifHtml(title, lines, this._previewDoseButtons(s, items.length));
  }

  _previewDoseButtons(s, count) {
    const b = s.dose_buttons || {};
    const on = (k) => (b[k] || {}).on !== false;
    const label = (k, dflt) => (b[k] || {}).label || dflt;
    const buttons = [];
    if (on("taken")) buttons.push({ id: "taken", label: count === 1 && label("taken") === "✅ I've taken them" ? "✅ I've taken it" : label("taken", "✅ I've taken them") });
    if (on("snooze")) {
      const mins = (Array.isArray(s.snooze_options) ? s.snooze_options : String(s.snooze_options || "").split(/[,\s]+/))
        .map(Number).filter((x) => x > 0);
      mins.forEach((m, i) => buttons.push({ id: `snooze${i}`, label: fill(label("snooze", "⏰ Remind me in {time}"), { time: fmtMinutes(m) }) }));
    }
    if (on("home")) buttons.push({ id: "home", label: `${label("home", "🏠 Remind me when I get home")}  (when away)` });
    if (on("skip")) buttons.push({ id: "skip", label: label("skip", "⏭️ Skip this time") });
    return buttons;
  }

  _previewReorder() {
    const s = this._sdraft || this._data.settings;
    const n = s.reorder_notice || {};
    const b = s.reorder_buttons || {};
    const d = this._data;
    const m = d.medications.find((x) => x.reorder?.enabled && x.rx_number) || d.medications.find((x) => x.reorder?.enabled)
      || { name: "Lisinopril", strength: "10 mg", rx_number: "7654321", id: "" };
    const p = this._pharm(m.pharmacy_id) || (m.id ? {} : { name: "Main St Pharmacy", phone: "(555) 555-1234", website: "x" });
    const takers = [...new Set(d.assignments.filter((a) => a.medication_id === m.id).map((a) => this._user(a.user_id)?.name).filter(Boolean))];
    const lines = [];
    if (m.rx_number && n.show_rx !== false) lines.push(`Rx # ${m.rx_number}`);
    const parts = [n.show_pharmacy !== false ? p.name : "", p.phone && n.show_phone !== false ? `📞 ${p.phone}` : ""].filter(Boolean);
    if (parts.length) lines.push(parts.join(" · "));
    if (n.show_for !== false && (takers.length || !m.id)) lines.push(`For ${takers.join(", ") || "Alex"}`);
    const on = (k) => (b[k] || {}).on !== false;
    const label = (k, dflt) => (b[k] || {}).label || dflt;
    const buttons = [];
    if (on("ordered")) buttons.push({ id: "ordered", label: label("ordered", "✅ Ordered") });
    if (on("snooze")) buttons.push({ id: "snooze", label: label("snooze", "⏰ Snooze 1 day") });
    if (on("not_needed")) buttons.push({ id: "not_needed", label: label("not_needed", "⏭️ Not needed this time") });
    if (on("call")) buttons.push({ id: "call", label: fill(label("call", "📞 Call pharmacy{rx}"), { rx: m.rx_number ? ` (Rx ${m.rx_number})` : "" }) + (p.phone ? "" : "  (needs a phone)") });
    if (on("site")) buttons.push({ id: "site", label: label("site", "🌐 Open pharmacy account") });
    const title = fill(n.title || "📦 Time to reorder {medication}", { medication: this._medName(m) });
    return this._notifHtml(title, lines, buttons, "rx");
  }

  _settingsChanged(rerenderAll) {
    this._sdirty = true;
    this._applyAppearance();
    if (rerenderAll) { this._renderMain(true); return; }
    const actions = this.shadowRoot.querySelector("main .bar .actions");
    if (actions && !actions.querySelector('[data-act="discard-settings"]')) {
      actions.insertAdjacentHTML("afterbegin", `<button class="text" data-act="discard-settings">Undo changes</button>`);
    }
    const dose = this.shadowRoot.querySelector('[data-preview="dose"]');
    if (dose) dose.innerHTML = this._previewDose();
    const rx = this.shadowRoot.querySelector('[data-preview="rx"]');
    if (rx) rx.innerHTML = this._previewReorder();
  }

  /* ---------- dialogs ---------- */
  _openDialog(kind, item, extra = {}) {
    this._edit = { kind, item: clone(item), ...extra };
    this._renderDialog();
  }
  _closeDialog() { this._edit = null; this.shadowRoot.querySelector(".dialog-host").innerHTML = ""; }

  _callSheet(id) {
    const m = this._med(id);
    if (!m) return "";
    const p = this._pharm(m.pharmacy_id) || {};
    const tel = p.phone ? p.phone.replace(/[^\d+]/g, "") : "";
    const site = p.login_url || p.website;
    const takers = [...new Set(this._data.assignments.filter((a) => a.medication_id === m.id).map((a) => this._user(a.user_id)?.name).filter(Boolean))];
    return `<div class="scrim" data-act="close"></div>
      <div class="dialog call-sheet" role="dialog">
        <div class="dhead"><h2>Reorder ${esc(this._medName(m))}</h2><button class="icon" data-act="close" title="Close">✕</button></div>
        <div class="dbody">
          <div class="rxbig">
            <div class="label">Rx number</div>
            ${m.rx_number ? `<div class="rxnum">${esc(m.rx_number)}</div>
              <button class="text" data-act="copy" data-text="${esc(m.rx_number)}">Copy</button>`
              : `<div class="muted">No Rx number saved — add it on the Medications tab.</div>`}
          </div>
          <div class="facts">
            <div><span class="label">Pharmacy</span>${esc(p.name || "—")}</div>
            ${p.phone ? `<div><span class="label">Phone</span>${esc(p.phone)}</div>` : ""}
            ${m.prescriber ? `<div><span class="label">Prescriber</span>${esc(m.prescriber)}</div>` : ""}
            ${m.quantity ? `<div><span class="label">Qty per fill</span>${esc(m.quantity)}</div>` : ""}
            ${takers.length ? `<div><span class="label">For</span>${esc(takers.join(", "))}</div>` : ""}
            ${m.last_ordered ? `<div><span class="label">Last ordered</span>${esc(fmtDate(m.last_ordered))}</div>` : ""}
          </div>
          <div class="call-actions">
            ${tel ? `<a class="btn primary big" href="tel:${esc(tel)}">📞 Call ${esc(p.phone)}</a>` : `<p class="muted">No phone number saved for this pharmacy.</p>`}
            ${site ? `<a class="btn text" href="${esc(site)}" target="_blank" rel="noopener">🌐 Pharmacy site</a>` : ""}
          </div>
          <p class="hint">During the call, tap the green call indicator to come back here — the Rx number stays on screen.</p>
        </div>
        <div class="dfoot">
          <span class="spacer"></span>
          <button class="text" data-act="close">Close</button>
          <button class="primary" data-act="call-ordered" data-id="${m.id}">✅ Ordered</button>
        </div>
      </div>`;
  }

  _renderDialog() {
    const host = this.shadowRoot.querySelector(".dialog-host");
    if (!this._edit) { host.innerHTML = ""; return; }
    const e = this._edit;
    if (e.kind === "call") { host.innerHTML = this._callSheet(e.item.id); return; }
    const body = { pharmacy: this._formPharmacy, med: this._formMed, user: this._formUser, assign: this._formAssign }[e.kind].call(this, e.item);
    const titles = { pharmacy: "Pharmacy", med: "Medication", user: "Person", assign: "Medication for " + esc(this._user(e.item.user_id)?.name || "") };
    const scroll = host.querySelector(".dbody")?.scrollTop || 0;
    host.innerHTML = `<div class="scrim" data-act="close"></div>
      <div class="dialog" role="dialog">
        <div class="dhead"><h2>${e.item.id ? "Edit" : "New"} ${titles[e.kind]}</h2><button class="icon" data-act="close" title="Close">✕</button></div>
        <div class="dbody form">${body}</div>
        <div class="dfoot">
          ${e.item.id ? `<button class="text danger" data-act="delete">Delete</button>` : ""}
          <span class="spacer"></span>
          <button class="text" data-act="close">Cancel</button>
          <button class="primary" data-act="save" ${this._busy ? "disabled" : ""}>Save</button>
        </div>
      </div>`;
    host.querySelector(".dbody").scrollTop = scroll;
  }

  _colorPicker(label, path, value, choices = SWATCHES, target = "edit", homeRow = true) {
    const sw = (c) => `<button class="swatch ${(value || "") === c ? "on" : ""}" data-act="pick-color" data-target="${target}" data-path="${path}" data-color="${c}"
        title="${c || "Theme colour"}" style="${c ? `background:${c}` : ""}">${c ? "" : "Auto"}</button>`;
    const custom = value && !choices.includes(value) && !HOME_COLORS.includes(value);
    return `<div class="label-row">${label}</div>
      <div class="swatches">${choices.map(sw).join("")}
        <label class="swatch custom ${custom ? "on" : ""}" title="Custom colour" style="${custom ? `background:${esc(value)}` : ""}"><input type="color" data-color-input="${path}" data-target="${target}" value="${esc(value || "#888888")}">${custom ? "" : "+"}</label>
      </div>
      ${homeRow ? `<div class="sub swatch-group">More colours</div>
      <div class="swatches">${HOME_COLORS.map(sw).join("")}</div>` : ""}`;
  }

  _field(label, path, value, attrs = "") {
    return `<label>${label}<input data-bind="${path}" value="${esc(value ?? "")}" ${attrs}></label>`;
  }
  _area(label, path, value) {
    return `<label>${label}<textarea data-bind="${path}" rows="3">${esc(value ?? "")}</textarea></label>`;
  }

  _finderHtml() {
    const f = this._edit.find || {};
    const miles = this._hass?.config?.unit_system?.length === "mi";
    const dist = (km) => (km == null ? "" : miles ? `${(km * 0.621).toFixed(1)} mi` : `${km} km`);
    let list = "";
    if (f.loading) list = `<p class="muted">Searching…</p>`;
    else if (f.results) {
      list = f.results.length ? `<div class="finds">${f.results.map((r, i) => `<button class="find" data-act="pick-pharm" data-i="${i}">
          <div class="grow"><div class="name">${esc(r.name)}${r.mail_order ? ` <span class="chip">Mail order</span>` : ""}</div>
            <div class="sub">${esc([r.address, r.phone].filter(Boolean).join(" · ")) || (r.website ? esc(r.website.replace(/^https?:\/\//, "")) : "")}</div>
            <div class="sub">${esc(r.sources.join(" + "))}${r.login_url ? " · has account login" : ""}</div></div>
          <span class="dist">${esc(dist(r.distance_km))}</span></button>`).join("")}</div>`
        : `<p class="muted">Nothing found${f.q ? ` for “${esc(f.q)}”` : " nearby"}. Try the chain or store name, or fill it in below.</p>`;
      if (f.errors?.length) list += `<p class="hint">${esc(f.errors.join(" and "))} didn't answer, so results may be incomplete.</p>`;
    }
    if (f.error) list = `<p class="error">${esc(f.error)}</p>`;
    return `<div class="finder">
      <div class="label-row">Find a pharmacy</div>
      <div class="search"><input data-find value="${esc(f.q || "")}" placeholder="Name, e.g. Walgreens, CVS, Amazon — or leave empty for nearby" enterkeyhint="search">
        <button class="primary" data-act="find-pharm">${f.q ? "Search" : "Nearby"}</button></div>
      ${list}
      <p class="hint">Searches OpenStreetMap${this._hass?.config?.country === "US" ? " and the US pharmacy registry" : ""} around your home location; only your search words and home area are sent. Pick one to fill in the details below.</p>
    </div>`;
  }

  async _findPharmacy() {
    const f = (this._edit.find = this._edit.find || {});
    f.loading = true; f.error = null;
    this._renderDialog();
    try {
      const r = await this._ws({ type: "med_manager/find_pharmacy", query: f.q || "" });
      if (this._edit?.find !== f) return;
      f.results = r.results; f.errors = r.errors;
    } catch (err) {
      f.error = `Search failed: ${err.message || err}`;
    }
    f.loading = false;
    if (this._edit?.find === f) this._renderDialog();
  }

  _pickPharmacy(i) {
    const r = this._edit.find?.results?.[i];
    if (!r) return;
    const item = this._edit.item;
    item.name = r.name;
    for (const k of ["address", "phone", "website", "login_url"]) if (r[k]) item[k] = r[k];
    this._edit.find = { ...this._edit.find, results: null, picked: r.name };
    this._renderDialog();
    this._toast(`Filled in ${r.name} — check the details`);
  }

  _formPharmacy(p) {
    return `${this._finderHtml()}
      ${this._field("Name", "name", p.name, 'placeholder="e.g. Walgreens on Main St" required')}
      <div class="two">${this._field("Phone", "phone", p.phone, 'type="tel" placeholder="(555) 555-1234"')}
      ${this._field("Website", "website", p.website, 'type="url" placeholder="https://"')}</div>
      ${this._field("Address", "address", p.address)}
      <h3>Online account</h3>
      ${this._field("Account login page", "login_url", p.login_url, 'type="url" placeholder="https://… (the page where you sign in)"')}
      ${this._field("Username or email", "username", p.username, 'autocomplete="off"')}
      <p class="hint">Passwords aren't stored here. “Open account login” opens the page and your password manager fills it in.</p>
      ${this._field("Drug info search (optional)", "lookup_url", p.lookup_url, 'placeholder="https://pharmacy.example/search?q={q}"')}
      <p class="hint">If your pharmacy's site has a search page, paste its address with <code>{q}</code> where the medication name goes. It's added to each medication's Look up menu.</p>
      ${this._area("Notes", "notes", p.notes)}`;
  }

  _formMed(m) {
    const d = this._data;
    const ro = m.reorder || {};
    return `<div class="two">${this._field("Medication name", "name", m.name, 'placeholder="e.g. Lisinopril" required')}
      ${this._field("Dosage / strength", "strength", m.strength, 'placeholder="e.g. 10 mg"')}</div>
      <div class="two"><label>Form<select data-bind="form"><option value=""></option>${FORMS.map((f) => `<option ${m.form === f ? "selected" : ""}>${f}</option>`).join("")}</select></label>
      ${this._field("Instructions", "instructions", m.instructions, 'placeholder="e.g. with food"')}</div>
      ${this._colorPicker("Colour (for the pill icon)", "color", m.color)}
      <label>Pharmacy<select data-bind="pharmacy_id"><option value="">—</option>${d.pharmacies.map((p) => `<option value="${p.id}" ${m.pharmacy_id === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
      ${d.pharmacies.length ? "" : `<p class="hint">Add pharmacies on the Pharmacies tab to choose one here.</p>`}
      <div class="two">${this._field("Rx number", "rx_number", m.rx_number)}${this._field("Prescriber", "prescriber", m.prescriber)}</div>
      ${this._field("Quantity per fill", "quantity", m.quantity, 'placeholder="e.g. 30 tablets"')}
      ${this._area("Notes", "notes", m.notes)}
      <h3>Reorder reminder</h3>
      <label class="switch-row"><div class="grow">Remind me to reorder</div><input type="checkbox" data-bind="reorder.enabled" ${ro.enabled ? "checked" : ""} data-rerender></label>
      ${ro.enabled ? `${this._scheduleEditor("reorder.schedule", ro.schedule)}
        ${this._field("At", "reorder.time", ro.time || "09:00", 'type="time"')}
        <div class="label-row">Whose refill is this? <span class="hint">(gets the reminder and sees it on their Today card; none ticked = the people who take it)</span></div>
        <div class="checks">${d.users.map((u) => `<label class="checkchip"><input type="checkbox" data-list="reorder.user_ids" value="${u.id}" ${(ro.user_ids || []).includes(u.id) ? "checked" : ""}>${esc(u.name)}</label>`).join("")}</div>
        ${m.id ? `<div class="actions"><span class="muted">${m.last_ordered ? `Last ordered ${esc(fmtDate(m.last_ordered))}` : "Not ordered yet"}</span>
          <button class="text" data-act="ordered" data-id="${m.id}">Mark ordered today</button></div>` : ""}` : ""}`;
  }

  _formUser(u) {
    const d = this._data;
    // Phones only: TVs can't show these reminders (no buttons, no push), so leave them out.
    const isTv = (s) => /apple_?tv|(^|_)tv($|_)/i.test(s);
    const services = d.notify_services.filter((s) => (s.startsWith("mobile_app_") && !isTv(s)) || (u.notify || []).includes(s));
    // Phones that are saved but no longer exist in Home Assistant: list them so they can be unticked.
    for (const s of u.notify || []) if (!services.includes(s)) services.push(s);
    const taken = new Set(d.users.filter((x) => x.id !== u.id && x.person).map((x) => x.person));
    return `<label>Person<select data-pick-person>
        <option value="" ${u.person ? "" : "selected"}>${u.id || u.name ? "Not linked to Home Assistant" : "Choose someone…"}</option>
        ${d.persons.map((p) => `<option value="${p.entity_id}" ${u.person === p.entity_id ? "selected" : ""} ${taken.has(p.entity_id) ? "disabled" : ""}>${esc(p.name)}${taken.has(p.entity_id) ? " (already added)" : ""}</option>`).join("")}
        <option value="__other" ${!u.person && u._other ? "selected" : ""}>Someone else (not in Home Assistant)…</option></select></label>
      <p class="hint">People from Home Assistant get “when I get home” reminders and their phone is picked for you.</p>
      ${u.person || u._other || u.id ? this._field("Name shown in the app", "name", u.name, 'required') : ""}
      ${this._colorPicker("Colour", "color", u.color)}
      <div class="label-row">Send reminders to</div>
      <div class="checks">${services.map((s) => `<label class="checkchip"><input type="checkbox" data-list="notify" value="${esc(s)}" ${(u.notify || []).includes(s) ? "checked" : ""}>${esc(s.replace(/^mobile_app_/, ""))}${d.notify_services.includes(s) ? "" : ` <span class="warn-text">— not found</span>`}</label>`).join("") || `<span class="muted">No Companion app phones found.</span>`}</div>
      <p class="hint">Tick a second phone too if someone else should get these reminders (e.g. a caregiver).</p>
      <h3>Reminder times</h3>
      <p class="hint">Medications set to the same time are sent together in one reminder, like “Morning” and “Evening”.</p>
      ${(u.slots || []).map((s, i) => `<div class="slot">
        <input data-bind="slots.${i}.name" value="${esc(s.name)}" placeholder="Name">
        <input type="time" data-bind="slots.${i}.time" value="${esc(s.time)}">
        <button class="icon" data-act="del-slot" data-i="${i}" title="Remove">✕</button></div>`).join("")}
      <button class="text" data-act="add-slot">+ Add a reminder time</button>`;
  }

  _formAssign(a) {
    const d = this._data;
    const u = this._user(a.user_id) || { slots: [] };
    const custom = (a.times || []).map((t, i) => [t, i]).filter(([t]) => t.time);
    const meds = [...d.medications].sort((x, y) => x.name.localeCompare(y.name));
    return `<label>Medication<select data-bind="medication_id" data-rerender>
        <option value="">Choose…</option>
        ${meds.map((m) => `<option value="${m.id}" ${a.medication_id === m.id ? "selected" : ""}>${esc(this._medName(m))}</option>`).join("")}
        <option value="__new" ${a.medication_id === "__new" ? "selected" : ""}>+ New medication…</option></select></label>
      ${a.medication_id === "__new" ? `<div class="two">${this._field("New medication name", "_new.name", a._new?.name, "required")}
        ${this._field("Dosage / strength", "_new.strength", a._new?.strength, 'placeholder="e.g. 10 mg"')}</div>
        <p class="hint">Add the pharmacy, Rx number and reorder reminder later on the Medications tab.</p>` : ""}
      ${this._field("Dose", "dose", a.dose, 'placeholder="e.g. 1 tablet, 2 capsules, 5 ml"')}
      <div class="label-row">When</div>
      <div class="checks">${(u.slots || []).map((s) => `<label class="checkchip"><input type="checkbox" data-slot="${s.id}" ${(a.times || []).some((t) => t.slot === s.id) ? "checked" : ""}>${esc(s.name)} · ${fmtTime(s.time)}</label>`).join("")}</div>
      ${custom.map(([t, i]) => `<div class="slot"><span class="grow">Other time</span><input type="time" data-bind="times.${i}.time" value="${esc(t.time)}">
        <button class="icon" data-act="del-time" data-i="${i}" title="Remove">✕</button></div>`).join("")}
      <button class="text" data-act="add-time">+ Another time</button>
      <h3>Which days</h3>
      ${this._scheduleEditor("schedule", a.schedule)}
      ${this._area("Notes", "notes", a.notes)}
      <label class="switch-row"><div class="grow"><div>Paused</div><div class="sub">No reminders while paused</div></div><input type="checkbox" data-bind="paused" ${a.paused ? "checked" : ""}></label>`;
  }

  _scheduleEditor(path, rule) {
    rule = rule || {};
    const today = this._data.today;
    const start = rule.start || today;
    const freq = rule.freq || "daily";
    const n = rule.interval || 1;
    const unit = { daily: n === 1 ? "day" : "days", weekly: n === 1 ? "week" : "weeks", monthly: n === 1 ? "month" : "months" }[freq];
    const s = parseD(start);
    const days = rule.weekdays && rule.weekdays.length ? rule.weekdays : [wd(s)];
    const nth = Math.min(Math.floor((s.getUTCDate() - 1) / 7), 4);
    const preview = nextDates({ ...rule, freq, interval: n, start, weekdays: freq === "weekly" ? days : [] }, today > start ? today : start, 4);
    return `<div class="sched">
      <div class="two">
        <label>Repeat<select data-repeat="${path}">
          <option value="daily" ${freq === "daily" ? "selected" : ""}>Daily</option>
          <option value="weekly" ${freq === "weekly" && n !== 2 ? "selected" : ""}>Weekly</option>
          <option value="biweekly" ${freq === "weekly" && n === 2 ? "selected" : ""}>Biweekly (every 2 weeks)</option>
          <option value="monthly" ${freq === "monthly" ? "selected" : ""}>Monthly</option></select></label>
        <label>Every<div class="inline"><input type="number" min="1" max="52" data-bind="${path}.interval" value="${n}" data-num data-rerender-change> <span>${unit}</span></div></label>
      </div>
      ${freq === "weekly" ? `<div class="label-row">On</div><div class="weekdays">${DAY.map((x, i) =>
        `<button class="wd ${days.includes(i) ? "on" : ""}" data-act="wd" data-path="${path}" data-i="${i}">${x.slice(0, 2)}</button>`).join("")}</div>` : ""}
      ${freq === "monthly" ? `<label>On<select data-bind="${path}.monthly_by" data-rerender>
          <option value="day" ${rule.monthly_by !== "weekday" ? "selected" : ""}>Day ${s.getUTCDate()} of the month</option>
          <option value="weekday" ${rule.monthly_by === "weekday" ? "selected" : ""}>The ${ORD[nth]} ${DAY_LONG[wd(s)]}</option></select></label>` : ""}
      <label>Starting<input type="date" data-bind="${path}.start" value="${esc(start)}" data-rerender-change></label>
      <div class="two">
        <label>Ends<select data-ends="${path}">
          <option value="never" ${rule.end ? "" : "selected"}>Never (no end date)</option>
          <option value="date" ${rule.end ? "selected" : ""}>On a date</option></select></label>
        ${rule.end ? `<label>End date<input type="date" data-bind="${path}.end" value="${esc(rule.end)}" min="${esc(start)}" data-rerender-change></label>` : ""}
      </div>
      <p class="hint">${freq === "monthly" || freq === "weekly" && n > 1 ? "The start date sets which weeks/days count. " : ""}Next: ${preview.map((x) => esc(fmtDate(x))).join(", ") || "none"}</p>
    </div>`;
  }

  /* ---------- events ---------- */
  _onInput(e, isChange) {
    const t = e.target;
    if (this._wiz) {
      const w = this._wiz;
      if (t.dataset.wbind) {
        setPath(w, t.dataset.wbind, t.type === "checkbox" ? t.checked : t.value);
        if (t.dataset.wizRerender !== undefined && isChange) this._renderWizard();
        return;
      }
      if (t.dataset.wizFind !== undefined) { w.find.q = t.value; return; }
      if (t.dataset.wizPerson !== undefined && isChange) {
        w.person.person = t.value;
        if (t.value && t.value !== "__other") {
          const x = this._data.persons.find((y) => y.entity_id === t.value);
          w.person.name = (x?.name || "").split(" ")[0] || x?.name || "";
          w.person.notify = [...new Set([...(x?.phones || [])])];
        } else if (t.value === "__other") { w.person.name = ""; w.person.notify = []; }
        this._renderWizard();
        return;
      }
      if (t.dataset.wizPhone !== undefined && isChange) {
        const set = new Set(w.person.notify);
        if (t.checked) set.add(t.value); else set.delete(t.value);
        w.person.notify = [...set];
        return;
      }
      if (t.dataset.wizSlot !== undefined && isChange) {
        const set = new Set(w.med.slots);
        if (t.checked) set.add(t.value); else set.delete(t.value);
        w.med.slots = w.person.slots.map((x) => x.id).filter((id) => set.has(id));
        return;
      }
    }
    if (t.dataset.sbind && this._sdraft) {
      let v = t.type === "checkbox" ? t.checked : t.value;
      if (t.type === "number") v = Math.max(0, parseInt(v, 10) || 0);
      setPath(this._sdraft, t.dataset.sbind, v);
      if (t.dataset.sbind === "demo.enabled" && v && !this._sdraft.demo.notify) {
        const mine = (this._data.users.find((u) => !u.demo)?.notify || []).filter((n) => this._data.notify_services.includes(n));
        const first = mine.find((n) => /phone/i.test(n)) || mine[0];
        this._sdraft.demo.notify = first || "";
      }
      if (t.dataset.sbind.startsWith("demo.") || t.dataset.sbind === "dose_notice.show_list") { this._settingsChanged(true); return; }
      // Glass palettes only make sense with glass cards: keep the two dropdowns in step.
      const ap = this._sdraft.appearance;
      if (t.dataset.sbind === "appearance.scheme" && String(v).startsWith("custom:")) {
        const cs = (this._sdraft.custom_schemes || []).find((x) => x.id === String(v).slice(7));
        if (cs) { ap.card = cs.card || ap.card; ap.custom = { accent: "", bg: "", card: "", text: "" }; }
      }
      // Look changes redraw the page (tabs, start page); text edits only refresh the previews.
      this._settingsChanged(isChange && (t.tagName === "SELECT" || t.type === "checkbox") && t.dataset.sbind.startsWith("appearance."));
      return;
    }
    if (t.dataset.colortarget !== undefined) {
      this._colorTarget = t.value;
      this._renderMain(true);
      return;
    }
    if (t.dataset.androidField && this._sdraft && isChange) {
      const field = t.dataset.androidField;
      const ids = t.dataset.androidIds.split(",").filter(Boolean);
      this._sdraft.android = this._sdraft.android || {};
      let cur = [...(this._sdraft.android[field] || [])];
      if (t.checked) {
        const next = [...cur, ...ids.filter((x) => !cur.includes(x))];
        if (next.length > 3) {
          t.checked = false;
          alert(`Android phones can only show 3 buttons on a notification${ids.length > 1 ? ` (this one adds ${ids.length}: one per “later” delay)` : ""}.\n\nUntick Android on another button first.`);
          return;
        }
        cur = next;
      } else {
        cur = cur.filter((x) => !ids.includes(x));
      }
      this._sdraft.android[field] = cur;
      this._previewOs = "android";
      this._settingsChanged(true);
      return;
    }
    if (t.dataset.backupImport !== undefined && isChange && t.files?.[0]) {
      const file = t.files[0];
      t.value = "";
      file.text().then(async (txt) => {
        let payload;
        try { payload = JSON.parse(txt); } catch (e) { this._toast("That file isn't a Medications export"); return; }
        if (!confirm(`Import “${file.name}”?\n\nThis replaces all Medications data with the file's contents. A backup of the current state is taken first, so you can undo it.`)) return;
        try {
          const r = await this._ws({ type: "med_manager/backups", op: "import", payload });
          this._backups = r.backups; this._sdraft = null; this._sdirty = false;
          if (this._wiz) this._closeWizard();
          await this._refresh(); this._toast("Imported");
        } catch (err) { this._toast(err.message || String(err)); }
      });
      return;
    }
    if (t.dataset.testpick) { this[`_test_${t.dataset.testpick}`] = t.value; return; }
    if (t.dataset.pickPerson !== undefined && this._edit && isChange) {
      const item = this._edit.item;
      if (t.value === "__other") {
        item.person = null; item._other = true;
      } else if (t.value) {
        item.person = t.value; item._other = false;
        const st = this._hass.states[t.value];
        const full = st?.attributes?.friendly_name || this._data.persons.find((x) => x.entity_id === t.value)?.name || "";
        item.name = full.split(" ")[0] || full;
        // Their phone(s), matched in Home Assistant through the person's Companion app devices.
        const phones = this._data.persons.find((x) => x.entity_id === t.value)?.phones || [];
        if (phones.length) item.notify = [...new Set([...(item.notify || []), ...phones])];
      } else {
        item.person = null; item._other = false;
      }
      this._renderDialog();
      return;
    }
    if (t.dataset.tabshow && this._sdraft && isChange) {
      const hidden = new Set(this._sdraft.appearance.hide_tabs || []);
      if (t.checked) hidden.delete(t.dataset.tabshow); else hidden.add(t.dataset.tabshow);
      this._sdraft.appearance.hide_tabs = [...hidden];
      this._settingsChanged(true);
      return;
    }
    if (t.dataset.colorInput && isChange) {
      this._setColor(t.dataset.target, t.dataset.colorInput, t.value);
      return;
    }
    if (t.dataset.find !== undefined && this._edit) {
      this._edit.find = { ...(this._edit.find || {}), q: t.value };
      const btn = this.shadowRoot.querySelector('[data-act="find-pharm"]');
      if (btn) btn.textContent = t.value.trim() ? "Search" : "Nearby";
      return;
    }
    if (t.dataset.act === "hist-user" && isChange) { this._histUser = t.value; this._history = null; this._renderMain(); return; }
    if (!this._edit) return;
    const item = this._edit.item;
    if (t.dataset.ends && isChange) {
      // "Never" clears the end date; "On a date" starts a month after the start date (editable).
      const path = t.dataset.ends;
      const rule = getPath(item, path) || {};
      rule.end = t.value === "date" ? addDays(rule.start || this._data.today, 30) : null;
      setPath(item, path, rule);
      this._renderDialog();
      return;
    }
    if (t.dataset.repeat && isChange) {
      // "Biweekly" is weekly with an interval of 2; switching away from it resets the interval.
      const path = t.dataset.repeat;
      const rule = getPath(item, path) || {};
      const wasBiweekly = rule.freq === "weekly" && Number(rule.interval) === 2;
      if (t.value === "biweekly") { rule.freq = "weekly"; rule.interval = 2; }
      else { rule.freq = t.value; if (wasBiweekly || t.value === "weekly" && Number(rule.interval) === 2) rule.interval = 1; }
      setPath(item, path, rule);
      this._renderDialog();
      return;
    }
    if (t.dataset.bind) {
      let v = t.type === "checkbox" ? t.checked : t.value;
      if (t.dataset.num !== undefined) v = Math.max(1, parseInt(v, 10) || 1);
      setPath(item, t.dataset.bind, v);
      if ((t.dataset.rerender !== undefined && isChange) || (t.dataset.rerenderChange !== undefined && isChange)) this._renderDialog();
    } else if (t.dataset.list && isChange) {
      const cur = new Set(getPath(item, t.dataset.list) || []);
      if (t.checked) cur.add(t.value); else cur.delete(t.value);
      setPath(item, t.dataset.list, [...cur]);
    } else if (t.dataset.slot && isChange) {
      const times = (item.times || []).filter((x) => x.slot !== t.dataset.slot);
      if (t.checked) times.unshift({ slot: t.dataset.slot });
      item.times = times;
    }
  }

  async _onClick(e) {
    // Phone links: hand them straight to the phone. Inside the Companion app a plain tap on a
    // tel: link can be ignored by the web view (only a long-press worked), so open it explicitly.
    const telLink = e.target.closest('a[href^="tel:"]');
    if (telLink) {
      e.preventDefault();
      const href = telLink.getAttribute("href");
      const w = window.open(href, "_blank");
      if (!w) window.location.href = href;
      return;
    }
    // Close an open "Look up" menu when tapping elsewhere.
    this.shadowRoot.querySelectorAll("details.lookup[open]").forEach((dt) => { if (!dt.contains(e.target)) dt.open = false; });
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
    const act = el.dataset.act;
    const d = this._data;
    const id = el.dataset.id;
    switch (act) {
      case "menu": this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true })); return;
      case "tab":
        if (this._tab === "settings" && el.dataset.tab !== "settings" && this._sdirty) {
          if (!confirm("Leave Settings without saving your changes?")) return;
        }
        if (el.dataset.tab !== "settings") { this._sdraft = null; this._sdirty = false; }
        this._tab = el.dataset.tab;
        if (this._tab === "history") this._history = null;
        this._renderMain();
        return;
      case "day": {
        const delta = Number(el.dataset.delta);
        this._date = delta === 0 ? null : addDays(this._day?.date || d.today, delta);
        if (this._date === d.today) this._date = null;
        await this._refresh();
        return;
      }
      case "dose": await this._call({ type: "med_manager/dose", user_id: el.dataset.user, date: el.dataset.date, time: el.dataset.time,
        assignment_id: el.dataset.aid || null, action: el.dataset.do }); return;
      case "send-now": await this._call({ type: "med_manager/send_now", user_id: el.dataset.user, date: el.dataset.date, time: el.dataset.time }, "Reminder sent"); return;
      case "call": this._openCall(id); return;
      case "pf-all": this._setHiddenPeople([]); this._renderMain(); return;
      case "pf-toggle": {
        const hidden = new Set(this._hiddenPeople());
        if (hidden.has(id)) hidden.delete(id); else hidden.add(id);
        this._setHiddenPeople([...hidden]);
        this._renderMain();
        return;
      }
      case "call-ordered":
        if (await this._call({ type: "med_manager/reorder", medication_id: id, action: "ordered" }, "Marked as ordered")) this._closeDialog();
        return;
      case "rx-snooze": await this._call({ type: "med_manager/reorder", medication_id: id, action: "snooze" }, "Reminder snoozed until tomorrow"); return;
      case "rx-skip": await this._call({ type: "med_manager/reorder", medication_id: id, action: "skip" }, "Skipped this refill"); return;
      case "ordered": await this._call({ type: "med_manager/reorder", medication_id: id, action: "ordered" }, "Marked as ordered");
        if (this._edit?.kind === "med") { this._edit.item.last_ordered = d.today; this._renderDialog(); }
        return;
      case "test": {
        try {
          const r = await this._ws({ type: "med_manager/test", user_id: id });
          const names = (l) => l.map((n) => n.replace(/^mobile_app_/, "")).join(", ");
          let msg = r.sent ? `Test reminder sent to ${names(r.targets.filter((t) => !r.failed.includes(t)))}. Long-press it and tap a button.`
            : "No working phone is set for this person";
          if (r.failed.length) msg += ` Failed: ${names(r.failed)}.`;
          if (r.missing.length) msg += ` Not found in Home Assistant: ${names(r.missing)}.`;
          this._toast(msg, 8000);
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      }
      case "test-rx": {
        try {
          const r = await this._ws({ type: "med_manager/test_reorder", medication_id: id });
          const names = (l) => l.map((n) => n.replace(/^mobile_app_/, "")).join(", ");
          this._toast(r.sent ? `Test reorder reminder sent to ${names(r.targets.filter((t) => !r.failed.includes(t)))}`
            : "No working phone to send it to", 6000);
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      }
      case "pause": {
        const a = d.assignments.find((x) => x.id === id);
        if (a) await this._call({ type: "med_manager/save", collection: "assignments", item: { ...a, paused: !a.paused } }, a.paused ? "Resumed" : "Paused");
        return;
      }
      case "copy":
        try { await navigator.clipboard.writeText(el.dataset.text); this._toast("Copied"); } catch (err) { this._toast("Couldn't copy"); }
        return;
      case "import": {
        try {
          const r = await this._ws({ type: "med_manager/import_medtrack" });
          this._toast(r.imported.length ? `Imported: ${r.imported.join(", ")}` : r.skipped.length ? "Already imported" : "Nothing to import");
          await this._refresh();
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      }
      case "save-settings": await this._saveSettings(); return;
      case "settings-test": {
        const kind = el.dataset.kind;
        const pick = this.shadowRoot.querySelector(`[data-testpick="${kind}"]`)?.value;
        const settings = clone(this._sdraft || this._data.settings);
        if (!Array.isArray(settings.snooze_options)) settings.snooze_options = String(settings.snooze_options || "").split(/[,\s]+/).filter(Boolean);
        try {
          const fake = false;
          const r = await this._ws(kind === "dose" ? { type: "med_manager/test", user_id: pick, settings, fake }
            : { type: "med_manager/test_reorder", medication_id: pick, settings, fake });
          if (fake) { await this._refresh(); return; }
          const names = (l) => l.map((n) => n.replace(/^mobile_app_/, "")).join(", ");
          this._toast(r.sent ? `Test sent to ${names(r.targets.filter((t) => !r.failed.includes(t)))}` : "No working phone to send it to", 6000);
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      }
      case "preview-os": {
        this._previewOs = el.dataset.os;
        const dose = this.shadowRoot.querySelector('[data-preview="dose"]');
        if (dose) dose.innerHTML = this._previewDose();
        const rx = this.shadowRoot.querySelector('[data-preview="rx"]');
        if (rx) rx.innerHTML = this._previewReorder();
        return;
      }
      case "fake-act": {
        const uri = el.dataset.uri;
        if (uri) {
          if (uri.startsWith("/medications?call=")) this._openCall(uri.split("=")[1]);
          else window.open(uri, "_blank");
          return;
        }
        await this._call({ type: "med_manager/fake_inbox", op: "action", action: el.dataset.action, tag: el.dataset.tag });
        return;
      }
      case "fake-dismiss": await this._call({ type: "med_manager/fake_inbox", op: "dismiss", tag: el.dataset.tag }); return;
      case "fake-clear": await this._call({ type: "med_manager/fake_inbox", op: "clear" }, "Fake phone cleared"); return;
      case "reset-tab": {
        const tab = this._settingsTab || "appearance";
        const keys = {
          appearance: ["appearance"],
          dose: ["dose_notice", "dose_buttons", "snooze_options", "nag_interval", "nag_count", "time_sensitive"],
          refill: ["reorder_notice", "reorder_buttons", "reorder_repeat_daily"],
          demo: ["demo"],
        }[tab];
        const defs = this._data.default_settings;
        if (!keys || !defs) return;
        const names = { appearance: "Appearance (your saved colour schemes are kept)", dose: "Medication reminders",
          refill: "Refill reminders", demo: "Demo (turns demo mode off and removes the demo data when saved)" };
        if (!confirm(`Reset ${names[tab]} to the defaults?\n\nNothing is saved until you tap Save settings.`)) return;
        if (!this._sdraft) this._sdraft = clone(this._data.settings);
        for (const k of keys) this._sdraft[k] = clone(defs[k]);
        this._settingsChanged(true);
        this._toast("Defaults restored on this tab — tap Save settings to keep them", 5000);
        return;
      }
      case "backup-now": {
        const r = await this._ws({ type: "med_manager/backups", op: "now" });
        this._backups = r.backups; this._renderMain(true); this._toast("Backed up");
        return;
      }
      case "backup-restore": {
        const b = (this._backups || []).find((x) => x.id === id);
        if (!b || !confirm(`Restore Medications to ${new Date(b.ts).toLocaleString()}?\n\nEverything in Medications goes back to that moment (people, medications, pharmacies, schedules, history and settings). A backup of the current state is taken first, so you can undo this.`)) return;
        try {
          const r = await this._ws({ type: "med_manager/backups", op: "restore", backup_id: id });
          this._backups = r.backups; this._sdraft = null; this._sdirty = false;
          await this._refresh(); this._toast("Restored");
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      }
      case "backup-delete": {
        if (!confirm("Delete this backup?")) return;
        const r = await this._ws({ type: "med_manager/backups", op: "delete", backup_id: id });
        this._backups = r.backups; this._renderMain(true);
        return;
      }
      case "backup-export": {
        const data = await this._ws({ type: "med_manager/backups", op: "export" });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `medications-${this._data.today}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        this._toast("Exported");
        return;
      }
      case "settings-tab": if (el.dataset.stab === "backups") this._backups = null; this._settingsTab = el.dataset.stab; this._renderMain(true); window.scrollTo(0, 0); return;
      case "reset-colors":
        this._sdraft.appearance.custom = { accent: "", bg: "", card: "", text: "" };
        this._settingsChanged(true);
        return;
      case "save-scheme": {
        const ap = this._sdraft.appearance;
        const list = (this._sdraft.custom_schemes = [...(this._sdraft.custom_schemes || [])]);
        const name = (prompt("Name for this colour scheme:", "") || "").trim();
        if (!name) return;
        let base = ap.scheme || "auto";
        let colors = { ...(ap.custom || {}) };
        let card = ap.card || "raised";
        if (base.startsWith("custom:")) {
          const cs = list.find((x) => x.id === base.slice(7));
          if (cs) {
            colors = { ...cs.colors, ...Object.fromEntries(Object.entries(colors).filter(([, v]) => v)) };
            base = cs.base;
          }
        }
        if (base === "home") base = this._hass?.states?.["input_select.home_palette"]?.state || "Calm";
        const id = Date.now().toString(36);
        list.push({ id, name, base, card, colors });
        ap.scheme = `custom:${id}`;
        ap.custom = { accent: "", bg: "", card: "", text: "" };
        await this._saveSettings();
        this._toast(`Saved “${name}”`);
        return;
      }
      case "delete-scheme": {
        const ap = this._sdraft.appearance;
        const id = String(ap.scheme).slice(7);
        const cs = (this._sdraft.custom_schemes || []).find((x) => x.id === id);
        if (!cs || !confirm(`Delete the colour scheme “${cs.name}”?`)) return;
        this._sdraft.custom_schemes = this._sdraft.custom_schemes.filter((x) => x.id !== id);
        ap.scheme = cs.base || "auto";
        await this._saveSettings();
        return;
      }
      case "discard-settings": this._sdraft = null; this._sdirty = false; this._renderMain(); return;
      case "pick-color": e.preventDefault(); this._setColor(el.dataset.target, el.dataset.path, el.dataset.color); return;
      case "new-pharmacy": this._openDialog("pharmacy", {}); return;
      case "edit-pharmacy": this._openDialog("pharmacy", this._pharm(id)); return;
      case "new-med": this._openDialog("med", { reorder: { enabled: false, schedule: { freq: "monthly", start: d.today }, time: "09:00", user_ids: [] } }); return;
      case "edit-med": this._openDialog("med", this._med(id)); return;
      case "new-user": this._openDialog("user", { slots: [{ id: "morning", name: "Morning", time: "08:00" }, { id: "evening", name: "Evening", time: "20:00" }], notify: [] }); return;
      case "edit-user": this._openDialog("user", this._user(id)); return;
      case "new-assign": {
        const u = this._user(el.dataset.user);
        this._openDialog("assign", { user_id: u.id, times: u.slots?.[0] ? [{ slot: u.slots[0].id }] : [], schedule: { freq: "daily", start: d.today }, paused: false });
        return;
      }
      case "edit-assign": this._openDialog("assign", d.assignments.find((x) => x.id === id)); return;
      case "close": this._closeDialog(); return;
      case "wiz-open": this._openWizard(false); return;
      case "wiz-start": this._wiz.practice = el.dataset.practice === "1"; this._wiz.step = 1; this._renderWizard(); return;
      case "wiz-demo":
        await this._call({ type: "med_manager/settings", settings: { demo: { ...(this._data.settings.demo || {}), enabled: true } } }, "Demo added — meet Pill Popper Penelope");
        this._closeWizard();
        return;
      case "wiz-next": await this._wizNext(); return;
      case "wiz-back": this._wiz.step = Math.max(1, this._wiz.step - 1); this._renderWizard(); return;
      case "wiz-skip": this._wiz.pharmacy.skip = true; this._wiz.step = 3; this._renderWizard(); return;
      case "wiz-find": await this._wizFindRun(); return;
      case "wiz-pick-pharm": {
        const r = this._wiz.find.results?.[Number(el.dataset.i)];
        if (r) Object.assign(this._wiz.pharmacy, { name: r.name, phone: r.phone || "", address: r.address || "", website: r.website || "", login_url: r.login_url || "", skip: false });
        this._wiz.find.results = null;
        this._renderWizard();
        return;
      }
      case "wiz-wd": {
        e.preventDefault();
        const i = Number(el.dataset.i);
        const set = new Set(this._wiz.med.weekdays);
        if (set.has(i)) set.delete(i); else set.add(i);
        this._wiz.med.weekdays = [...set].sort();
        this._renderWizard();
        return;
      }
      case "wiz-test":
        try {
          const r = await this._ws({ type: "med_manager/test", user_id: this._wiz.userId });
          this._wiz.tested = true;
          this._renderWizard();
          if (!r.sent) this._toast("No phone to send to — add one on the People tab later");
        } catch (err) { this._toast(err.message || String(err)); }
        return;
      case "wiz-discard": await this._wizDiscard(); return;
      case "wiz-keep": await this._wizKeep(); return;
      case "wiz-close-today": this._closeWizard(); this._tab = "today"; this._renderMain(); return;
      case "wiz-cancel":
        if (this._wiz?.created && this._wiz.practice) {
          if (confirm("Discard the practice data this run added?")) { await this._wizDiscard(); return; }
        } else if (this._wiz?.step > 0 && this._wiz.step < 4 && !confirm("Close the setup wizard? Nothing has been saved yet.")) return;
        this._closeWizard();
        return;
      case "add-slot": this._edit.item.slots = [...(this._edit.item.slots || []), { id: "s" + Math.random().toString(16).slice(2, 8), name: "", time: "12:00" }]; this._renderDialog(); return;
      case "del-slot": this._edit.item.slots.splice(Number(el.dataset.i), 1); this._renderDialog(); return;
      case "add-time": this._edit.item.times = [...(this._edit.item.times || []), { time: "12:00" }]; this._renderDialog(); return;
      case "del-time": this._edit.item.times.splice(Number(el.dataset.i), 1); this._renderDialog(); return;
      case "wd": {
        e.preventDefault();
        const path = el.dataset.path;
        const rule = getPath(this._edit.item, path) || {};
        const s = parseD(rule.start || d.today);
        const cur = new Set(rule.weekdays && rule.weekdays.length ? rule.weekdays : [wd(s)]);
        const i = Number(el.dataset.i);
        if (cur.has(i)) { if (cur.size > 1) cur.delete(i); } else cur.add(i);
        setPath(this._edit.item, path + ".weekdays", [...cur].sort());
        this._renderDialog();
        return;
      }
      case "find-pharm": await this._findPharmacy(); return;
      case "pick-pharm": this._pickPharmacy(Number(el.dataset.i)); return;
      case "save": await this._saveDialog(); return;
      case "delete": await this._deleteDialog(); return;
      default:
    }
  }

  async _call(msg, okText) {
    try {
      await this._ws(msg);
      if (okText) this._toast(okText);
      await this._refresh();
      return true;
    } catch (err) {
      this._toast(err.message || String(err));
      return false;
    }
  }

  _setColor(target, path, color) {
    if (target === "settings" && this._sdraft) {
      setPath(this._sdraft, path, color);
      this._settingsChanged(true);
    } else if (this._edit) {
      setPath(this._edit.item, path, color);
      this._renderDialog();
    }
  }

  async _saveSettings() {
    const settings = clone(this._sdraft || this._data.settings);
    if (!Array.isArray(settings.snooze_options)) settings.snooze_options = String(settings.snooze_options || "").split(/[,\s]+/).filter(Boolean);
    if (await this._call({ type: "med_manager/settings", settings }, "Settings saved")) {
      this._sdraft = null;
      this._sdirty = false;
      this._renderMain();
    }
  }


  async _saveDialog() {
    const e = this._edit;
    const item = clone(e.item);
    const collection = { pharmacy: "pharmacies", med: "medications", user: "users", assign: "assignments" }[e.kind];
    if (e.kind !== "assign" && !String(item.name || "").trim()) {
      this._toast(e.kind === "user" ? "Choose someone from the list, or pick “Someone else” and type a name" : "Please enter a name");
      return;
    }
    delete item._other;
    this._busy = true;
    try {
      if (e.kind === "assign") {
        if (item.medication_id === "__new") {
          if (!String(item._new?.name || "").trim()) { this._toast("Please enter the medication's name"); return; }
          const med = await this._ws({ type: "med_manager/save", collection: "medications", item: { name: item._new.name, strength: item._new.strength || "" } });
          item.medication_id = med.id;
        }
        if (!item.medication_id) { this._toast("Please choose a medication"); return; }
        if (!(item.times || []).length) { this._toast("Please choose at least one time"); return; }
        delete item._new;
      }
      await this._ws({ type: "med_manager/save", collection, item });
      this._closeDialog();
      this._toast("Saved");
      await this._refresh();
    } catch (err) {
      this._toast(err.message || String(err));
    } finally {
      this._busy = false;
    }
  }

  async _deleteDialog() {
    const e = this._edit;
    const what = { pharmacy: "this pharmacy", med: "this medication (and everyone's schedule for it)", user: "this person and their medication schedule", assign: "this medication from the person's schedule" }[e.kind];
    if (!confirm(`Delete ${what}?`)) return;
    const collection = { pharmacy: "pharmacies", med: "medications", user: "users", assign: "assignments" }[e.kind];
    if (await this._call({ type: "med_manager/delete", collection, item_id: e.item.id }, "Deleted")) this._closeDialog();
  }

  _toast(text, ms = 3500) {
    const el = this.shadowRoot.querySelector(".toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  }
}

const STYLE = `
:host { display:block; min-height:100vh; background:var(--primary-background-color); color:var(--primary-text-color);
  font-family:var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif); --gap:16px; --radius:var(--ha-card-border-radius, 12px); }
* { box-sizing:border-box; }
.toolbar { display:flex; align-items:center; gap:8px; height:56px; padding:0 12px; background:var(--app-header-background-color, var(--primary-color));
  color:var(--app-header-text-color, #fff); position:sticky; top:0; z-index:3; }
.toolbar .title { font-size:20px; font-weight:400; margin-left:8px; }
.toolbar .icon { color:inherit; }
.tabs { display:flex; gap:4px; overflow-x:auto; padding:8px 12px; background:var(--app-header-background-color, var(--primary-color));
  position:sticky; top:56px; z-index:3; scrollbar-width:none; }
.tab { display:flex; align-items:center; gap:6px; border:0; background:transparent; color:var(--app-header-text-color, #fff); opacity:.75;
  padding:8px 12px; border-radius:20px; font:inherit; font-size:14px; cursor:pointer; white-space:nowrap; }
.tab.on { background:rgba(255,255,255,.2); opacity:1; }
main { max-width:860px; margin:0 auto; padding:var(--gap); padding-bottom:96px; }
.card { background:var(--ha-card-background, var(--card-background-color, #fff)); border-radius:var(--radius);
  box-shadow:var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.12)); border:var(--ha-card-border-width, 0) solid var(--ha-card-border-color, var(--divider-color));
  padding:16px; margin-bottom:var(--gap); }
.card header { display:flex; align-items:center; gap:10px; margin-bottom:8px; flex-wrap:wrap; }
h1 { font-size:22px; font-weight:400; margin:0; }
h2 { font-size:18px; font-weight:500; margin:0; }
h3 { font-size:15px; font-weight:500; margin:18px 0 6px; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.04em; }
.bar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:4px 0 16px; flex-wrap:wrap; }
.grow { flex:1; min-width:0; }
.spacer { flex:1; }
.muted, .hint { color:var(--secondary-text-color); }
.hint { font-size:13px; margin:4px 0 8px; }
.sub { font-size:13px; color:var(--secondary-text-color); margin-top:2px; }
.warn-text { color:var(--warning-color, #e69500); }
.name { font-weight:500; }
.strength { font-weight:400; color:var(--secondary-text-color); }
button, .btn { font:inherit; cursor:pointer; border-radius:20px; padding:8px 16px; border:0; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
button.primary, .btn.primary { background:var(--primary-color); color:var(--text-primary-color, #fff); }
button.text, .btn.text { background:transparent; color:var(--primary-color); padding:8px 10px; }
button.small { padding:6px 10px; font-size:13px; }
button.danger { color:var(--error-color, #db4437); }
button.icon { background:transparent; color:var(--primary-text-color); width:40px; height:40px; padding:0; justify-content:center; border-radius:50%; font-size:20px; }
button:disabled { opacity:.5; cursor:default; }
a { color:var(--primary-color); }
.chip { display:inline-block; font-size:12px; padding:3px 10px; border-radius:12px; background:var(--secondary-background-color, rgba(127,127,127,.12));
  color:var(--primary-text-color); margin:2px 4px 2px 0; white-space:nowrap; }
.chip.ok { background:rgba(67,160,71,.18); color:var(--success-color, #2e7d32); }
.chip.warn { background:rgba(230,149,0,.18); color:var(--warning-color, #b26a00); }
.chip.info { background:rgba(3,169,244,.16); color:var(--info-color, #0277bd); }
.badge { font-size:12px; padding:2px 8px; border-radius:10px; }
.badge.home { background:rgba(67,160,71,.18); color:var(--success-color, #2e7d32); }
.badge.away { background:rgba(127,127,127,.15); color:var(--secondary-text-color); }
.avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; flex:none; }
.avatar.letter { display:flex; align-items:center; justify-content:center; background:var(--primary-color); color:var(--text-primary-color,#fff); font-weight:500; }
.daynav { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.daynav .dayname { display:flex; flex-direction:column; align-items:center; min-width:150px; }
.daynav .dayname span { font-size:13px; color:var(--secondary-text-color); }
.daynav .icon { font-size:28px; }
.group { border-top:1px solid var(--divider-color); padding-top:10px; margin-top:10px; }
.ghead { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px; }
.gactions { display:flex; flex-wrap:wrap; gap:4px; margin-left:-10px; }
.item, .row { display:flex; align-items:center; gap:12px; padding:8px 0; }
.row + .row { border-top:1px solid var(--divider-color); }
.row.paused .name { opacity:.55; }
.rxline b { color:var(--primary-text-color); letter-spacing:.03em; }
.refill-actions { display:flex; flex-wrap:wrap; gap:4px; margin-left:-10px; }
.check { width:32px; height:32px; flex:none; border-radius:50%; border:2px solid var(--primary-color); background:transparent; padding:0;
  justify-content:center; color:var(--text-primary-color,#fff); font-weight:700; }
.item.taken .check { background:var(--success-color, #43a047); border-color:var(--success-color, #43a047); }
.item.taken .name { text-decoration:line-through; opacity:.6; }
.item.skipped .check, .item.missed .check { border-color:var(--secondary-text-color); color:var(--secondary-text-color); }
.item.missed .check { border-color:var(--error-color,#db4437); color:var(--error-color,#db4437); }
.meta { margin:6px 0; font-size:14px; }
.label { display:inline-block; min-width:110px; color:var(--secondary-text-color); font-size:13px; }
.list { margin:8px 0; border-top:1px solid var(--divider-color); }
.list .row { cursor:pointer; }
.facts > div { padding:4px 0; font-size:14px; }
.notes { white-space:pre-wrap; font-size:14px; color:var(--secondary-text-color); margin:8px 0 0; }
.actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:12px; }
.lookup { position:relative; }
.lookup summary { list-style:none; }
.lookup summary::-webkit-details-marker { display:none; }
.menu-pop { position:absolute; right:0; top:100%; z-index:2; background:var(--card-background-color, #fff); border-radius:8px; min-width:180px;
  box-shadow:0 4px 16px rgba(0,0,0,.25); padding:6px 0; }
.menu-pop a { display:block; padding:10px 16px; text-decoration:none; color:var(--primary-text-color); }
.menu-pop a:hover { background:var(--secondary-background-color, rgba(127,127,127,.1)); }
.hday { font-size:13px; font-weight:500; color:var(--secondary-text-color); margin:12px 0 2px; text-transform:uppercase; letter-spacing:.04em; }
.hday:first-child { margin-top:0; }
.welcome ol { list-style:none; padding:0; margin:12px 0; }
.welcome li { display:flex; align-items:center; gap:12px; padding:10px 0; border-top:1px solid var(--divider-color); }
.welcome .num { width:28px; height:28px; border-radius:50%; background:var(--primary-color); color:var(--text-primary-color,#fff); display:flex; align-items:center; justify-content:center; flex:none; }
.welcome li.done .num { background:var(--success-color,#43a047); }
.form label { display:flex; flex-direction:column; gap:4px; font-size:13px; color:var(--secondary-text-color); margin:10px 0; }
.form input, .form select, .form textarea, select { font:inherit; font-size:16px; color:var(--primary-text-color); background:var(--input-fill-color, var(--secondary-background-color, rgba(127,127,127,.08)));
  border:1px solid var(--divider-color); border-radius:8px; padding:10px 12px; width:100%; }
select { width:auto; }
option, optgroup { background-color:var(--card-background-color, #fff); color:var(--primary-text-color); }
.form select { width:100%; }
.form textarea { resize:vertical; }
.form .two { display:grid; grid-template-columns:1fr 1fr; gap:0 12px; }
.form label.switch-row { flex-direction:row; align-items:center; gap:12px; font-size:15px; color:var(--primary-text-color); }
.form label.switch-row input { width:22px; height:22px; flex:none; }
.label-row { font-size:13px; color:var(--secondary-text-color); margin:12px 0 6px; }
.checks { display:flex; flex-wrap:wrap; gap:8px; }
.form label.checkchip { flex-direction:row; align-items:center; gap:8px; margin:0; padding:8px 12px; border:1px solid var(--divider-color); border-radius:20px;
  font-size:14px; color:var(--primary-text-color); cursor:pointer; }
.form label.checkchip input { width:18px; height:18px; padding:0; }
.slot { display:flex; gap:8px; align-items:center; margin:8px 0; }
.slot input { flex:1; }
.slot input[type=time] { flex:0 0 140px; }
.inline { display:flex; align-items:center; gap:8px; }
.inline input { width:90px !important; }
.inline span { color:var(--primary-text-color); font-size:15px; }
.weekdays { display:flex; gap:6px; flex-wrap:wrap; }
.wd { width:44px; height:44px; padding:0; justify-content:center; border-radius:50%; background:var(--secondary-background-color, rgba(127,127,127,.12)); color:var(--primary-text-color); }
.wd.on { background:var(--primary-color); color:var(--text-primary-color,#fff); }
.sched { border:1px solid var(--divider-color); border-radius:10px; padding:4px 12px 8px; }
.rxbig { text-align:center; padding:16px 8px; margin:8px 0 12px; border-radius:12px; background:var(--secondary-background-color, rgba(127,127,127,.08)); }
.rxbig .label { display:block; min-width:0; text-transform:uppercase; letter-spacing:.06em; }
.rxnum { font-size:40px; font-weight:600; letter-spacing:.06em; margin:4px 0; font-variant-numeric:tabular-nums; user-select:all; word-break:break-all; }
.call-actions { display:flex; flex-direction:column; align-items:stretch; gap:8px; margin:16px 0 8px; }
.btn.big { justify-content:center; padding:14px 20px; font-size:18px; }
.finder { border:1px solid var(--divider-color); border-radius:10px; padding:4px 12px 8px; margin:8px 0 12px; background:var(--secondary-background-color, rgba(127,127,127,.06)); }
.search { display:flex; gap:8px; align-items:center; }
.search input { flex:1; min-width:0; }
.finds { max-height:320px; overflow-y:auto; margin:8px 0; border-radius:8px; border:1px solid var(--divider-color); background:var(--card-background-color, #fff); }
button.find { display:flex; width:100%; text-align:left; align-items:flex-start; gap:8px; border-radius:0; padding:10px 12px; background:transparent;
  color:var(--primary-text-color); border-bottom:1px solid var(--divider-color); }
button.find:last-child { border-bottom:0; }
button.find:hover { background:var(--secondary-background-color, rgba(127,127,127,.1)); }
.find .dist { font-size:13px; color:var(--secondary-text-color); white-space:nowrap; }
.scrim { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:10; }
.dialog { position:fixed; z-index:11; left:50%; top:50%; transform:translate(-50%,-50%); width:min(600px, calc(100vw - 32px)); max-height:calc(100vh - 48px);
  display:flex; flex-direction:column; background:var(--card-background-color, #fff); border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,.35); }
.dhead { display:flex; align-items:center; justify-content:space-between; padding:12px 12px 4px 20px; }
.dbody { overflow-y:auto; padding:0 20px 12px; -webkit-overflow-scrolling:touch; }
.dfoot { display:flex; align-items:center; gap:8px; padding:12px 16px; border-top:1px solid var(--divider-color); }
.toast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); background:#323232; color:#fff; padding:12px 20px; border-radius:8px; z-index:20;
  box-shadow:0 4px 16px rgba(0,0,0,.3); max-width:calc(100vw - 32px); }
.loading { padding:40px; text-align:center; color:var(--secondary-text-color); }
.error { color:var(--error-color, #db4437); }
code { font-size:12px; background:rgba(127,127,127,.15); padding:1px 4px; border-radius:4px; }
.medicon { flex:none; }
:host([data-icons="off"]) .medicon { display:none; }
.swatches { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.swatch { width:32px; height:32px; padding:0; border-radius:50%; border:2px solid var(--divider-color); justify-content:center;
  background:var(--secondary-background-color); color:var(--secondary-text-color); font-size:10px; }
.swatch.on { outline:3px solid var(--primary-text-color); outline-offset:2px; }
.form label.swatch.custom { position:relative; margin:0; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;
  flex-direction:row; color:var(--secondary-text-color); }
.swatch.custom input { position:absolute; inset:0; opacity:0; width:100%; height:100%; padding:0; cursor:pointer; }
.split { display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:24px; align-items:start; }
.btnrow { display:flex; gap:10px; align-items:center; margin:6px 0; }
.btnrow > input[type=checkbox] { width:22px; height:22px; flex:none; }
.btnrow .sub { margin:0 0 2px; }
.preview { position:sticky; top:120px; }
.phone { background:linear-gradient(160deg, #3a4a6b, #6b4a72 55%, #a0607a); border-radius:22px; padding:14px 10px 10px; }
.notif { background:rgba(245,245,247,.86); color:#111; border-radius:16px; padding:10px 12px; font-size:13px; line-height:1.35;
  -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px); }
.nhead { display:flex; align-items:center; gap:6px; font-size:11px; color:#666; margin-bottom:4px; }
.appicon { width:16px; height:16px; border-radius:4px; background:#18bcf2; display:inline-block; }
.ntitle { font-weight:600; }
.nbody { white-space:pre-wrap; }
.nactions { margin-top:8px; background:rgba(245,245,247,.86); border-radius:14px; overflow:hidden; color:#111; }
.nbtn { padding:10px 12px; font-size:14px; border-bottom:1px solid rgba(0,0,0,.08); }
.nbtn:last-child { border-bottom:0; }
.phone .hint { color:rgba(255,255,255,.75); text-align:center; margin:8px 0 0; font-size:11px; }
/* card styles */
:host([data-card="flat"]) .card { box-shadow:none; border:1px solid var(--divider-color); }
:host([data-card="glass"]) { background:radial-gradient(1200px 600px at 10% -10%, color-mix(in srgb, var(--primary-color) 35%, transparent), transparent 60%),
  radial-gradient(900px 500px at 110% 10%, color-mix(in srgb, var(--primary-color) 20%, transparent), transparent 60%), var(--primary-background-color); }
:host([data-card="glass"]) .card { background:color-mix(in srgb, var(--glass-tint, var(--card-background-color)) var(--glass-alpha, 60%), transparent);
  -webkit-backdrop-filter:blur(var(--glass-blur, 14px)) saturate(1.4); backdrop-filter:blur(var(--glass-blur, 14px)) saturate(1.4);
  border:1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent); box-shadow:0 8px 30px rgba(0,0,0,.12); }
.swatch-group { margin:10px 0 6px; }
.customise { margin:8px 0 4px; padding:4px 12px 8px; border:1px dashed var(--divider-color); border-radius:12px; }
.customise h3 { margin-top:10px; }
/* Settings: compact but with breathing room (+15%) */
main.wide { max-width:1120px; }
.sbar { margin:0 0 12px; } .sbar h1 { font-size:22px; }
.spane { padding:18px 21px; }
.spane.form label { margin:7px 0; font-size:14px; gap:6px; }
.spane.form input, .spane.form select { padding:9px 14px; font-size:16px; border-radius:10px; }
.spane .g2 { display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:2px 18px; }
.spane .g4 { display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:2px 18px; align-items:end; }
.spane .cell-bottom { padding-bottom:7px; }
.spane .checks.delivery { margin-top:10px; gap:12px; }
.spane .checks.tight { gap:9px; align-items:center; margin:12px 0; }
.spane.form label.checkchip { padding:7px 14px; font-size:15px; margin:0; }
.spane.form label.checkchip input { width:19px; height:19px; }
.label-inline { font-size:14px; color:var(--secondary-text-color); margin-right:5px; }
.hint-inline { font-size:13px; color:var(--secondary-text-color); opacity:.85; font-weight:400; margin-left:7px; }
.spane .label-row { margin:14px 0 7px; font-size:14px; }
.btngrid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:5px 21px; }
@media (max-width:700px) { .btngrid { grid-template-columns:1fr; } }
.spane .btnrow { margin:5px 0; gap:12px; }
.spane .btnrow input[type=checkbox] { width:22px; height:22px; }
.spane .btnrow .sub { font-size:13px; margin-bottom:2px; }
.spane .split { grid-template-columns:minmax(0, 1fr) 300px; gap:23px; }
.spane .preview { top:100px; }
.spane .phone { padding:14px 10px 10px; border-radius:22px; }
.spane .notif { font-size:14px; padding:10px 13px; }
.spane .nbtn { padding:9px 13px; font-size:15px; }
.spane .testrow { margin-top:14px; gap:12px; }
.spane .testrow select { flex:1; min-width:150px; }
.spane .testrow { flex-wrap:wrap; }
.spane .testrow button { padding:9px 18px; }
.spane .customise { margin:12px 0; padding:9px 14px 12px; }
.custom-head { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.spane .segmented { margin:5px 0 9px; padding:5px; }
.spane .form label.seg, .spane label.seg { padding:7px 15px; font-size:15px; }
.spane .palette { gap:7px; }
.spane .palette .swatch { width:29px; height:29px; border-width:1px; font-size:9.5px; }
.spane .pillrow { margin-top:12px; gap:12px; }
.spane button.pill { padding:8px 17px; font-size:15px; }
.spane .switch-row { margin:9px 0; }
.subtabs { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; margin:0 0 10px; padding:4px; border-radius:24px;
  background:var(--secondary-background-color, rgba(127,127,127,.1)); }
.subtab { white-space:nowrap; background:transparent; color:var(--secondary-text-color); padding:8px 16px; font-size:14px; border-radius:20px; }
.subtab.on { background:var(--card-background-color); color:var(--primary-text-color); font-weight:500; box-shadow:0 1px 4px rgba(0,0,0,.18); }
:host([data-card="neu"]) .subtabs { background:var(--nm-bg); box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .subtab.on { background:var(--nm-bg); box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); color:var(--primary-color); }
:host([data-card="glass"]) .subtabs { background:color-mix(in srgb, var(--card-background-color) 45%, transparent); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); }
.segmented { display:inline-flex; flex-wrap:wrap; gap:4px; padding:4px; border-radius:22px; background:var(--secondary-background-color, rgba(127,127,127,.1));
  margin:4px 0 10px; }
.form label.seg { flex-direction:row; align-items:center; gap:8px; margin:0; padding:7px 14px; border-radius:18px; cursor:pointer;
  font-size:14px; color:var(--secondary-text-color); }
.form label.seg input { position:absolute; opacity:0; width:0; height:0; }
.form label.seg.on { background:var(--card-background-color); color:var(--primary-text-color); font-weight:500; box-shadow:0 1px 4px rgba(0,0,0,.18); }
.segdot { width:14px; height:14px; border-radius:50%; border:1px solid var(--divider-color);
  background:repeating-conic-gradient(var(--divider-color) 0 25%, transparent 0 50%) 0 0/8px 8px; }
.palette .swatch { width:28px; height:28px; }
.pillrow { gap:10px; }
button.pill { border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); padding:8px 16px; font-size:14px; }
button.pill:disabled { opacity:.45; }
button.pill.primary-pill { background:var(--primary-color); border-color:var(--primary-color); color:var(--text-primary-color, #fff); }
button.pill.danger-pill { color:var(--error-color, #db4437); border-color:color-mix(in srgb, var(--error-color, #db4437) 50%, transparent); }
:host([data-card="neu"]) .segmented { background:var(--nm-bg); box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .form label.seg.on { background:var(--nm-bg); box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) button.pill { border:0; background:var(--nm-bg); box-shadow:4px 4px 9px var(--nm-dark), -4px -4px 9px var(--nm-light); }
:host([data-card="neu"]) button.pill.primary-pill { background:var(--primary-color); }
.pfilter { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 14px; }
.pchip { border:1px solid var(--divider-color); background:transparent; color:var(--secondary-text-color); padding:6px 14px; font-size:14px; }
.pchip .pdot { width:10px; height:10px; border-radius:50%; background:var(--pc, var(--primary-color)); opacity:.35; display:inline-block; }
.pchip.on { background:color-mix(in srgb, var(--pc, var(--primary-color)) 18%, transparent); border-color:var(--pc, var(--primary-color));
  color:var(--primary-text-color); font-weight:500; }
.pchip.on .pdot { opacity:1; }
:host([data-card="neu"]) .pchip { border:0; box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .pchip.on { box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); background:var(--nm-bg); }
.demo-banner { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 14px; margin:0 0 14px; border-radius:12px;
  background:color-mix(in srgb, #ff7a14 18%, transparent); border:1px solid #ff7a14; font-size:14px; }
.help h2 { margin-bottom:10px; }
.help ul { margin:0; padding-left:18px; } .help li { margin:6px 0; font-size:14.5px; line-height:1.4; }
.hstep { display:flex; gap:12px; align-items:flex-start; padding:8px 0; }
.hstep + .hstep { border-top:1px solid var(--divider-color); }
.hnum { width:28px; height:28px; flex:none; border-radius:50%; background:var(--primary-color); color:var(--text-primary-color, #fff);
  display:flex; align-items:center; justify-content:center; font-weight:600; }
.helpgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:0 var(--gap); }
main.wide-help { max-width:1120px; }
.ostoggle { display:flex; gap:4px; justify-content:center; margin:0 0 8px; padding:3px; border-radius:18px;
  background:var(--secondary-background-color, rgba(127,127,127,.1)); }
.ostoggle::before { content:"Preview on"; font-size:12px; color:var(--secondary-text-color); align-self:center; margin:0 4px 0 8px; }
.ostoggle button { padding:5px 14px; font-size:13px; border-radius:16px; background:transparent; color:var(--secondary-text-color);
  border:0; }
.ostoggle button.on { background:var(--primary-color); color:var(--text-primary-color, #fff); border-color:var(--primary-color); }
.droid { background:#202124; border-radius:22px; padding:12px 10px 10px; }
.dnotif { background:#2d2e31; color:#e8eaed; border-radius:18px; padding:10px 14px 8px; font-size:13.5px; line-height:1.35; }
.dhead { display:flex; align-items:center; gap:6px; font-size:12px; color:#9aa0a6; margin-bottom:4px; }
.appicon.round { border-radius:50%; }
.dactions { display:flex; flex-wrap:wrap; gap:4px 16px; margin-top:8px; }
.dactions span, .dactions button { color:#8ab4f8; font-weight:500; font-size:13px; background:none; border:0; padding:6px 0; border-radius:0; cursor:pointer; }
.dmeta { font-size:11px; color:#9aa0a6; margin-top:4px; }
.droid .hint { color:#9aa0a6; text-align:center; margin:8px 0 0; font-size:11px; }
.droid.small { padding:6px; margin-top:8px; border-radius:18px; }
.fakephone { margin:10px 0; padding:10px 12px; border-radius:14px; border:1px dashed var(--divider-color); }
.fp-head { display:flex; align-items:center; gap:8px; }
button.icon.tiny { width:24px; height:24px; font-size:12px; color:#9aa0a6; }
.nocheck { width:22px; text-align:center; font-size:15px; flex:none; opacity:.8; }
.android-row { padding:6px 8px; border-radius:12px; background:color-mix(in srgb, #3ddc84 10%, transparent); }
.dialog.wizard { width:min(640px, calc(100vw - 32px)); }
.wizsteps { display:flex; gap:6px; flex-wrap:wrap; padding:0 20px 8px; }
.wizsteps span { font-size:12.5px; padding:4px 10px; border-radius:12px; color:var(--secondary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.1)); }
.wizsteps span.on { background:var(--primary-color); color:var(--text-primary-color, #fff); font-weight:500; }
.wizsteps span.done { color:var(--primary-color); }
.wizhero { font-size:44px; text-align:center; margin:10px 0 0; }
.wiztitle { text-align:center; font-size:20px; text-transform:none; letter-spacing:0; color:var(--primary-text-color); margin:6px 0 10px; }
.wizchoices { display:flex; flex-direction:column; gap:10px; margin:14px 0 8px; }
.wizchoice { display:flex; flex-direction:column; align-items:flex-start; gap:3px; text-align:left; padding:14px 16px; border-radius:14px;
  border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); }
.wizchoice span { font-size:13.5px; color:var(--secondary-text-color); }
.wizchoice:hover { border-color:var(--primary-color); }
.form label.wizchoice.filechoice { flex-direction:column; align-items:flex-start; margin:0; cursor:pointer; font-size:15px; color:var(--primary-text-color); }
:host([data-card="neu"]) .wizchoice { border:0; background:var(--nm-bg); box-shadow:5px 5px 10px var(--nm-dark), -5px -5px 10px var(--nm-light); }
.backups .row { gap:10px; }
label.pill.filepill { display:inline-flex !important; flex-direction:row !important; align-items:center; cursor:pointer; border:1px solid var(--divider-color);
  border-radius:20px; padding:8px 17px; font-size:15px !important; color:var(--primary-text-color) !important; background:var(--card-background-color); margin:0 !important; }
:host([data-card="neu"]) label.pill.filepill { border:0; background:var(--nm-bg); box-shadow:4px 4px 9px var(--nm-dark), -4px -4px 9px var(--nm-light); }
.chip.demo { background:#ff7a14; color:#fff; font-weight:600; letter-spacing:.05em; }
.testrow { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.testrow select { flex:1; min-width:160px; }
/* glassmorphism backdrops */
:host([data-card="glass"]) { min-height:100vh; background-attachment:fixed; }
:host([data-card="glass"][data-glassbg="aurora"]) { background:radial-gradient(900px 600px at 0% 0%, #2dd4bf88, transparent 60%),
  radial-gradient(800px 600px at 100% 20%, #8b5cf688, transparent 60%), radial-gradient(900px 700px at 50% 110%, #3b82f677, transparent 60%), var(--primary-background-color); }
:host([data-card="glass"][data-glassbg="sunset"]) { background:radial-gradient(900px 600px at 0% 0%, #fb923c88, transparent 60%),
  radial-gradient(800px 600px at 100% 30%, #ec489988, transparent 60%), radial-gradient(900px 700px at 40% 110%, #8b5cf677, transparent 60%), var(--primary-background-color); }
:host([data-card="glass"][data-glassbg="ocean"]) { background:radial-gradient(900px 600px at 0% 10%, #0ea5e988, transparent 60%),
  radial-gradient(800px 600px at 100% 0%, #22d3ee77, transparent 60%), radial-gradient(900px 700px at 60% 110%, #1e3a8a88, transparent 60%), var(--primary-background-color); }
:host([data-card="glass"]) .card { box-shadow:0 8px 32px rgba(0,0,0,.18); }
:host([data-card="glass"][data-glassedge="on"]) .card { border:1px solid rgba(255,255,255,.28); box-shadow:0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.35); }
:host([data-card="glass"][data-glassedge="off"]) .card { border:0; }
:host([data-card="glass"]) .dialog { background:color-mix(in srgb, var(--glass-tint, var(--card-background-color)) calc(var(--glass-alpha, 60%) + 25%), transparent);
  -webkit-backdrop-filter:blur(calc(var(--glass-blur, 14px) + 10px)); backdrop-filter:blur(calc(var(--glass-blur, 14px) + 10px)); }
:host([data-card="glass"][data-glassbg="forest"]) { background:radial-gradient(900px 600px at 0% 0%, #22c55e77, transparent 60%),
  radial-gradient(800px 600px at 100% 20%, #0f766e88, transparent 60%), radial-gradient(900px 700px at 50% 110%, #a3e63566, transparent 60%), var(--primary-background-color); }
:host([data-card="glass"][data-glassbg="home"]) { background:radial-gradient(900px 600px at 0% 0%, #5e7d7199, transparent 60%),
  radial-gradient(800px 600px at 100% 20%, #b8965a88, transparent 60%), radial-gradient(900px 700px at 50% 110%, #4e8ea277, transparent 60%), var(--primary-background-color); }
:host([data-card="glass"][data-glassbg="none"]) { background:var(--primary-background-color); }
:host([data-card="glass"]) .chip, :host([data-card="glass"]) .form input, :host([data-card="glass"]) .form select,
:host([data-card="glass"]) .form textarea { background:color-mix(in srgb, var(--card-background-color) 45%, transparent); }
:host([data-card="glass"]) .tabs, :host([data-card="glass"]) .toolbar { background:color-mix(in srgb, var(--app-header-background-color, var(--primary-color)) 70%, transparent);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); }
/* neumorphism (soft UI) */
:host([data-card="neu"]) { --primary-background-color:var(--nm-bg); --card-background-color:var(--nm-bg); --ha-card-background:var(--nm-bg);
  --secondary-background-color:var(--nm-bg); --primary-text-color:var(--nm-text); --secondary-text-color:var(--nm-muted);
  --divider-color:color-mix(in srgb, var(--nm-dark) 55%, transparent); --input-fill-color:var(--nm-bg); background:var(--nm-bg); color:var(--nm-text); }
:host([data-card="neu"]) .toolbar, :host([data-card="neu"]) .tabs { background:var(--nm-bg); color:var(--nm-text); }
:host([data-card="neu"]) .toolbar .icon, :host([data-card="neu"]) .tab { color:var(--nm-text); }
.oscheck { display:flex !important; flex-direction:row !important; align-items:center; gap:5px; margin:0 !important;
  font-size:12.5px !important; color:var(--secondary-text-color); white-space:nowrap; align-self:flex-end; padding-bottom:9px; cursor:pointer; }
.oscheck input { width:18px !important; height:18px; padding:0 !important; }
:host([data-card="neu"]) .tab.on { background:var(--nm-bg); box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); color:var(--primary-color); }
:host([data-card="neu"]) .card { border:0; box-shadow:8px 8px 18px var(--nm-dark), -8px -8px 18px var(--nm-light); }
:host([data-card="neu"]) .group, :host([data-card="neu"]) .row + .row, :host([data-card="neu"]) .list {
  border-color:color-mix(in srgb, var(--primary-color) 28%, transparent); }
:host([data-card="neu"]) .chip { background:var(--nm-bg); box-shadow:inset 2px 2px 4px var(--nm-dark), inset -2px -2px 4px var(--nm-light); }
:host([data-card="neu"]) .chip.ok { color:#3f8a52; } :host([data-card="neu"]) .chip.warn { color:#b26a00; } :host([data-card="neu"]) .chip.info { color:#2f6f99; }
:host([data-card="neu"]) button.primary, :host([data-card="neu"]) .btn.primary { box-shadow:4px 4px 9px var(--nm-dark), -4px -4px 9px var(--nm-light); }
:host([data-card="neu"]) button.text, :host([data-card="neu"]) .btn.text { border-radius:14px; }
:host([data-card="neu"]) button.text:active, :host([data-card="neu"]) button.primary:active { box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .check { border:0; background:var(--nm-bg); box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .item.taken .check { background:var(--primary-color); box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .form input, :host([data-card="neu"]) .form select, :host([data-card="neu"]) .form textarea, :host([data-card="neu"]) select {
  border:0; background:var(--nm-bg); box-shadow:inset 3px 3px 6px var(--nm-dark), inset -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .form label.checkchip, :host([data-card="neu"]) .wd, :host([data-card="neu"]) .swatch {
  border:0; background-color:var(--nm-bg); box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); }
:host([data-card="neu"]) .swatch[style*="background"] { box-shadow:2px 2px 5px var(--nm-dark), -2px -2px 5px var(--nm-light); }
:host([data-card="neu"]) .wd.on { background:var(--primary-color); }
:host([data-card="neu"]) .sched, :host([data-card="neu"]) .finder, :host([data-card="neu"]) .rxbig, :host([data-card="neu"]) .finds {
  border:0; background:var(--nm-bg); box-shadow:inset 3px 3px 7px var(--nm-dark), inset -3px -3px 7px var(--nm-light); }
:host([data-card="neu"]) .dialog { background:var(--nm-bg); box-shadow:12px 12px 30px rgba(0,0,0,.35); }
:host([data-card="neu"]) .avatar { box-shadow:3px 3px 6px var(--nm-dark), -3px -3px 6px var(--nm-light); }
/* spacing + text */
:host([data-density="compact"]) { --gap:10px; }
:host([data-density="compact"]) .card { padding:10px 12px; }
:host([data-density="compact"]) .item, :host([data-density="compact"]) .row { padding:4px 0; }
:host([data-density="compact"]) .check { width:26px; height:26px; }
:host([data-density="compact"]) .group { margin-top:6px; padding-top:6px; }
:host([data-text="large"]) main { font-size:18px; }
:host([data-text="large"]) .name { font-size:19px; }
:host([data-text="large"]) .sub, :host([data-text="large"]) .chip { font-size:15px; }
:host([data-text="large"]) h2 { font-size:22px; }
:host([data-text="large"]) .check { width:40px; height:40px; }
@media (max-width:860px) { .split { grid-template-columns:1fr; } .preview { position:static; } }
@media (max-width:600px) {
  main { padding:12px; }
  .form .two { grid-template-columns:1fr; }
  .dialog { left:0; top:0; transform:none; width:100vw; height:100%; max-height:none; border-radius:0; }
  .tab span { display:none; }
  .tab.on span { display:inline; }
  .label { min-width:90px; }
}
`;

customElements.get("med-manager-panel") || customElements.define("med-manager-panel", MedManagerPanel);
