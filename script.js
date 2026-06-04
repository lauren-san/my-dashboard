const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const toggleText = document.querySelector(".toggle-text");

const shipmentVolumeEl = document.getElementById("shipmentVolume");
const shipmentTrendEl = document.getElementById("shipmentTrend");
const onTimeRateEl = document.getElementById("onTimeRate");
const onTimeTrendEl = document.getElementById("onTimeTrend");
const openExceptionsEl = document.getElementById("openExceptions");
const exceptionTrendEl = document.getElementById("exceptionTrend");
const volumeStatusEl = document.getElementById("volumeStatus");
const queueStatusEl = document.getElementById("queueStatus");

const volumeChartEl = document.getElementById("volumeChart");
const regionalBarsEl = document.getElementById("regionalBars");
const exceptionListEl = document.getElementById("exceptionList");

const regions = [
  { name: "Northeast", onTime: 97.6 },
  { name: "Southeast", onTime: 96.4 },
  { name: "Midwest", onTime: 95.8 },
  { name: "West", onTime: 97.1 },
  { name: "Southwest", onTime: 94.9 }
];

const exceptionPool = [
  { title: "Route weather hold", meta: "Reno Hub - 14 shipments", priority: "High" },
  { title: "Carrier capacity shortfall", meta: "Atlanta Lane 7", priority: "Medium" },
  { title: "Customs document mismatch", meta: "Detroit Intl - 5 shipments", priority: "High" },
  { title: "Trailer maintenance delay", meta: "Dallas DC", priority: "Medium" },
  { title: "Address validation issue", meta: "Portland Metro", priority: "Medium" },
  { title: "Missed pickup window", meta: "Boise Cluster", priority: "High" }
];

let shipmentVolume = 12460;
let onTimeRate = 96.8;
let openExceptions = 137;

let volumeSeries = [
  980, 1030, 1100, 1175, 1250, 1310, 1260, 1340, 1410, 1480, 1530, 1490
];

const rng = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatInt = (value) => value.toLocaleString("en-US");
const formatPercent = (value) => `${value.toFixed(1)}%`;

function applyStoredTheme() {
  const savedTheme = localStorage.getItem("ff_theme");
  const theme = savedTheme || "dark";
  root.setAttribute("data-theme", theme);
  toggleText.textContent = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
}

function toggleTheme() {
  const currentTheme = root.getAttribute("data-theme") || "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("ff_theme", nextTheme);
  toggleText.textContent = nextTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
}

function buildVolumeChart() {
  const width = 520;
  const height = 220;
  const padX = 22;
  const padY = 20;
  const min = Math.min(...volumeSeries) * 0.96;
  const max = Math.max(...volumeSeries) * 1.04;

  const xStep = (width - padX * 2) / (volumeSeries.length - 1);

  const toPoint = (value, i) => {
    const x = padX + i * xStep;
    const y = height - padY - ((value - min) / (max - min)) * (height - padY * 2);
    return [x, y];
  };

  const points = volumeSeries.map(toPoint);
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;

  volumeChartEl.innerHTML = `
    <defs>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="var(--accent-a)" />
        <stop offset="100%" stop-color="var(--accent-c)" />
      </linearGradient>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-b)" stop-opacity="0.48" />
        <stop offset="100%" stop-color="var(--accent-b)" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <polyline points="${area}" fill="url(#areaGrad)" stroke="none" />
    <polyline points="${line}" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-linecap="round" />
    ${points
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="3.6" fill="var(--accent-c)" stroke="var(--bg)" stroke-width="1.6" />`
      )
      .join("")}
  `;
}

function renderRegionBars() {
  regionalBarsEl.innerHTML = regions
    .map((region) => {
      return `
      <div class="bar-row">
        <span class="bar-label">${region.name}</span>
        <div class="bar-track" role="presentation">
          <div class="bar-fill" style="--value:${region.onTime}%;"></div>
        </div>
        <span class="bar-value">${region.onTime.toFixed(1)}%</span>
      </div>
      `;
    })
    .join("");
}

function renderExceptions() {
  const selected = [...exceptionPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .sort((a, b) => (a.priority < b.priority ? 1 : -1));

  exceptionListEl.innerHTML = selected
    .map((item) => {
      const cssPriority = item.priority.toLowerCase();
      return `
      <li class="exception-item">
        <div class="ex-main">
          <span class="ex-title">${item.title}</span>
          <span class="ex-meta">${item.meta}</span>
        </div>
        <span class="exception-priority priority-${cssPriority}">${item.priority}</span>
      </li>
      `;
    })
    .join("");
}

function updateMetrics() {
  const shipmentDelta = Math.round(rng(-48, 80));
  const onTimeDelta = rng(-0.35, 0.28);
  const exceptionDelta = Math.round(rng(-8, 7));

  shipmentVolume = clamp(shipmentVolume + shipmentDelta, 10900, 15400);
  onTimeRate = clamp(onTimeRate + onTimeDelta, 93.6, 98.9);
  openExceptions = clamp(openExceptions + exceptionDelta, 80, 190);

  const nextPoint = clamp(
    volumeSeries[volumeSeries.length - 1] + Math.round(rng(-85, 105)),
    860,
    1760
  );
  volumeSeries = [...volumeSeries.slice(1), nextPoint];

  shipmentVolumeEl.textContent = formatInt(shipmentVolume);
  onTimeRateEl.textContent = formatPercent(onTimeRate);
  openExceptionsEl.textContent = formatInt(openExceptions);

  shipmentTrendEl.textContent = `${shipmentDelta >= 0 ? "+" : ""}${shipmentDelta} vs last update`;
  onTimeTrendEl.textContent = `${onTimeDelta >= 0 ? "+" : ""}${onTimeDelta.toFixed(1)} pts last update`;
  exceptionTrendEl.textContent = `${exceptionDelta >= 0 ? "+" : ""}${exceptionDelta} in last update`;

  shipmentTrendEl.className = `metric-trend ${shipmentDelta >= 0 ? "positive" : "warning"}`;
  onTimeTrendEl.className = `metric-trend ${onTimeDelta >= 0 ? "positive" : "warning"}`;
  exceptionTrendEl.className = `metric-trend ${exceptionDelta <= 0 ? "positive" : "warning"}`;

  volumeStatusEl.textContent = `Live ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;

  queueStatusEl.textContent = openExceptions > 145 ? "Escalating" : "Needs review";
  queueStatusEl.className = `pill attention`;

  regions.forEach((region) => {
    region.onTime = clamp(region.onTime + rng(-0.25, 0.25), 93.8, 98.8);
  });

  buildVolumeChart();
  renderRegionBars();
  renderExceptions();
}

function wireCardKeyboardActivation() {
  const cards = document.querySelectorAll('[data-clickable="true"]');
  cards.forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });

    card.addEventListener("click", () => {
      card.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(-2px) scale(1.01)" },
          { transform: "translateY(0) scale(1)" }
        ],
        { duration: 220, easing: "ease-out" }
      );
    });
  });
}

applyStoredTheme();
themeToggle.addEventListener("click", toggleTheme);
wireCardKeyboardActivation();
updateMetrics();
setInterval(updateMetrics, 5000);
