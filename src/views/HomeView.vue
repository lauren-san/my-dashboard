<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type Region = {
  name: string
  onTime: number
  shipments: number
}

type ExceptionItem = {
  id: string
  lane: string
  issue: string
  ageHours: number
  priority: 'High' | 'Medium' | 'Low'
}

const isDark = ref(true)
const updatedAt = ref(new Date())

const shipmentVolume = ref(1248)
const onTimeRate = ref(96.4)
const openExceptions = ref(37)
const avgTransitDays = ref(3.2)

const volumeSeries = ref([64, 58, 71, 79, 74, 88, 94, 103, 96, 112, 118, 126])
const onTimeSeries = ref([94.4, 94.8, 95.1, 95.7, 96.1, 95.9, 96.3, 96.8, 96.4, 96.9, 97.1, 96.7])

const regions = ref<Region[]>([
  { name: 'Northeast', onTime: 97.2, shipments: 282 },
  { name: 'Southeast', onTime: 95.8, shipments: 314 },
  { name: 'Central', onTime: 96.6, shipments: 356 },
  { name: 'West', onTime: 94.9, shipments: 296 },
])

const exceptions = ref<ExceptionItem[]>([
  { id: 'EX-9012', lane: 'ATL -> ORD', issue: 'Dock congestion', ageHours: 5, priority: 'High' },
  { id: 'EX-9044', lane: 'LAX -> PHX', issue: 'Carrier reassignment', ageHours: 3, priority: 'Medium' },
  { id: 'EX-9081', lane: 'DAL -> MIA', issue: 'Customs doc hold', ageHours: 7, priority: 'High' },
  { id: 'EX-9110', lane: 'SEA -> DEN', issue: 'Weather delay', ageHours: 2, priority: 'Low' },
])

const themeLabel = computed(() => (isDark.value ? 'Switch to Light' : 'Switch to Dark'))

const onTimePath = computed(() => {
  const values = onTimeSeries.value
  const max = 98
  const min = 93
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100
      const normalized = (value - min) / (max - min)
      const y = 100 - normalized * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

const onTimeAreaPath = computed(() => `${onTimePath.value} L 100 100 L 0 100 Z`)

let timer: number | undefined

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function jitter(value: number, minDelta: number, maxDelta: number) {
  const direction = Math.random() > 0.5 ? 1 : -1
  const delta = minDelta + Math.random() * (maxDelta - minDelta)
  return value + direction * delta
}

function tick() {
  updatedAt.value = new Date()
  shipmentVolume.value = Math.max(980, Math.round(jitter(shipmentVolume.value, 6, 18)))
  onTimeRate.value = Math.min(99.2, Math.max(92.4, Number(jitter(onTimeRate.value, 0.1, 0.5).toFixed(1))))
  openExceptions.value = Math.max(12, Math.round(jitter(openExceptions.value, 1, 4)))
  avgTransitDays.value = Math.min(4.3, Math.max(2.4, Number(jitter(avgTransitDays.value, 0.03, 0.08).toFixed(2))))

  const latestVolume = volumeSeries.value[volumeSeries.value.length - 1] ?? 90
  const nextVolume = Math.max(52, Math.round(jitter(latestVolume, 3, 10)))
  volumeSeries.value = [...volumeSeries.value.slice(1), nextVolume]

  const latestOnTime = onTimeSeries.value[onTimeSeries.value.length - 1] ?? 96
  const nextOnTime = Math.min(98, Math.max(93, Number(jitter(latestOnTime, 0.15, 0.35).toFixed(1))))
  onTimeSeries.value = [...onTimeSeries.value.slice(1), nextOnTime]

  regions.value = regions.value.map((region) => ({
    ...region,
    onTime: Math.min(98.9, Math.max(92.5, Number(jitter(region.onTime, 0.05, 0.3).toFixed(1)))),
    shipments: Math.max(180, Math.round(jitter(region.shipments, 2, 12))),
  }))

  exceptions.value = exceptions.value.map((item) => ({
    ...item,
    ageHours: Math.max(1, item.ageHours + (Math.random() > 0.75 ? 1 : 0)),
  }))
}

onMounted(() => {
  applyTheme()
  timer = window.setInterval(tick, 2500)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <main class="dashboard-shell">
    <section class="hero card">
      <div class="hero-row">
        <div class="brand-block">
          <div class="logo" aria-hidden="true">FF</div>
          <div>
            <h1>FastForward Logistics Dashboard</h1>
            <p>
              Leadership snapshot of shipment volume, on-time delivery, regional execution, and open
              operational exceptions.
            </p>
          </div>
        </div>

        <button class="theme-toggle" type="button" @click="toggleTheme">{{ themeLabel }}</button>
      </div>
      <div class="live-pill">Live updates · {{ updatedAt.toLocaleTimeString() }}</div>
    </section>

    <section class="kpi-grid">
      <article class="card clickable">
        <span>Shipment Volume</span>
        <strong>{{ shipmentVolume.toLocaleString() }}</strong>
        <small>Loads in active planning horizon</small>
      </article>
      <article class="card clickable">
        <span>On-Time Delivery</span>
        <strong>{{ onTimeRate.toFixed(1) }}%</strong>
        <small>Rolling 24-hour performance</small>
      </article>
      <article class="card clickable">
        <span>Open Exceptions</span>
        <strong>{{ openExceptions }}</strong>
        <small>Loads requiring intervention</small>
      </article>
      <article class="card clickable">
        <span>Average Transit Time</span>
        <strong>{{ avgTransitDays.toFixed(2) }} days</strong>
        <small>Door-to-door network average</small>
      </article>
    </section>

    <section class="main-grid">
      <article class="card chart-card clickable">
        <div class="card-header">
          <h2>Shipment Volume Trend</h2>
          <span>Last 12 intervals</span>
        </div>
        <div class="bar-chart" role="img" aria-label="Shipment volume bar chart">
          <div
            v-for="(bar, index) in volumeSeries"
            :key="index"
            class="bar"
            :style="{ height: `${(bar / 140) * 100}%` }"
          ></div>
        </div>
      </article>

      <article class="card chart-card clickable">
        <div class="card-header">
          <h2>On-Time Delivery Curve</h2>
          <span>Target 96%+</span>
        </div>
        <svg viewBox="0 0 100 100" class="line-chart" role="img" aria-label="On-time delivery line chart">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--chart-start)" stop-opacity="0.55" />
              <stop offset="100%" stop-color="var(--chart-end)" stop-opacity="0.05" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="var(--chart-start)" />
              <stop offset="100%" stop-color="var(--chart-end)" />
            </linearGradient>
          </defs>
          <path :d="onTimeAreaPath" fill="url(#areaGradient)" />
          <path :d="onTimePath" fill="none" stroke="url(#strokeGradient)" stroke-width="2.2" />
        </svg>
      </article>

      <article class="card clickable">
        <div class="card-header">
          <h2>Regional Performance</h2>
          <span>By on-time rate</span>
        </div>
        <ul class="region-list">
          <li v-for="region in regions" :key="region.name">
            <div class="region-meta">
              <strong>{{ region.name }}</strong>
              <span>{{ region.shipments }} loads</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${region.onTime}%` }"></div>
            </div>
            <small>{{ region.onTime.toFixed(1) }}% on-time</small>
          </li>
        </ul>
      </article>

      <article class="card clickable">
        <div class="card-header">
          <h2>Open Exceptions</h2>
          <span>Highest impact first</span>
        </div>
        <ul class="exception-list">
          <li v-for="item in exceptions" :key="item.id">
            <div>
              <strong>{{ item.id }} · {{ item.lane }}</strong>
              <p>{{ item.issue }}</p>
            </div>
            <div class="exception-meta">
              <span class="priority" :class="item.priority.toLowerCase()">{{ item.priority }}</span>
              <small>{{ item.ageHours }}h</small>
            </div>
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.dashboard-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 2rem 1rem 2.25rem;
  display: grid;
  gap: 1rem;
}

.card {
  background: linear-gradient(145deg, var(--card-grad-start), var(--card-grad-end));
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.clickable {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-4px);
  border-color: var(--card-border-hover);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.hero {
  padding: 1.25rem;
}

.hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
  letter-spacing: 0.07em;
}

h1 {
  font-size: clamp(1.2rem, 1rem + 1vw, 2rem);
  font-weight: 900;
  line-height: 1.2;
}

p {
  margin-top: 0.45rem;
  color: var(--text-muted);
}

.theme-toggle {
  border: 1px solid var(--btn-border);
  color: var(--btn-text);
  background: var(--btn-bg);
  border-radius: 12px;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  border-color: var(--btn-border-hover);
  background: var(--btn-bg-hover);
}

.live-pill {
  margin-top: 0.8rem;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid var(--pill-border);
  background: var(--pill-bg);
  padding: 0.3rem 0.65rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.kpi-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.kpi-grid article span {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.kpi-grid article strong {
  display: block;
  margin-top: 0.35rem;
  font-size: clamp(1.3rem, 0.9rem + 1.2vw, 1.9rem);
  font-weight: 900;
}

.kpi-grid article small {
  color: var(--text-muted);
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.card-header h2 {
  font-size: 1rem;
  font-weight: 800;
}

.card-header span {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.chart-card {
  min-height: 255px;
}

.bar-chart {
  height: 180px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: end;
  gap: 0.45rem;
}

.bar {
  border-radius: 6px 6px 3px 3px;
  background: linear-gradient(180deg, var(--chart-start), var(--chart-end));
  transition: height 650ms ease;
}

.line-chart {
  width: 100%;
  height: 180px;
  overflow: visible;
}

.region-list,
.exception-list {
  list-style: none;
  display: grid;
  gap: 0.75rem;
  padding: 0;
}

.region-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.region-meta span {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.progress-track {
  background: var(--track-bg);
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--chart-start), var(--chart-end));
  transition: width 650ms ease;
}

.region-list small {
  color: var(--text-muted);
}

.exception-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--card-border);
  background: var(--card-elevated);
  border-radius: 12px;
  padding: 0.7rem 0.75rem;
}

.exception-list p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
}

.exception-meta {
  display: grid;
  gap: 0.3rem;
  justify-items: end;
}

.priority {
  font-size: 0.72rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.14rem 0.48rem;
  border: 1px solid transparent;
}

.priority.high {
  color: #ffd2d2;
  border-color: #ff7a7a;
  background: rgba(255, 77, 109, 0.2);
}

.priority.medium {
  color: #ffecc1;
  border-color: #ffc46b;
  background: rgba(255, 169, 71, 0.2);
}

.priority.low {
  color: #cbf2da;
  border-color: #7bd5a1;
  background: rgba(56, 199, 131, 0.2);
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-shell {
    padding: 1rem 0.75rem 1.25rem;
  }

  .hero-row {
    flex-direction: column;
  }

  .brand-block {
    align-items: flex-start;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
