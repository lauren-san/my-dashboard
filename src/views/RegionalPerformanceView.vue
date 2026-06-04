<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type RegionDetail = {
  name: string
  onTime: number
  lateShipments: number
  avgDelayHours: number
  volume: number
}

const router = useRouter()

const regions = ref<RegionDetail[]>([
  { name: 'Northeast', onTime: 97.3, lateShipments: 19, avgDelayHours: 1.7, volume: 282 },
  { name: 'Southeast', onTime: 95.9, lateShipments: 27, avgDelayHours: 2.4, volume: 314 },
  { name: 'Central', onTime: 96.7, lateShipments: 22, avgDelayHours: 2.1, volume: 356 },
  { name: 'West', onTime: 95.1, lateShipments: 31, avgDelayHours: 2.8, volume: 296 },
])

function goBack() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <main class="regional-shell">
    <section class="header card">
      <div>
        <h1>Regional Performance</h1>
        <p>Compare shipment volume, on-time execution, and delay exposure across operating regions.</p>
      </div>
      <button type="button" @click="goBack">Back to Dashboard</button>
    </section>

    <section class="region-grid">
      <article class="card region-card" v-for="region in regions" :key="region.name">
        <div class="title-row">
          <h2>{{ region.name }}</h2>
          <span>{{ region.volume }} loads</span>
        </div>

        <div class="metric-row">
          <div>
            <small>On-Time Rate</small>
            <strong>{{ region.onTime.toFixed(1) }}%</strong>
          </div>
          <div>
            <small>Late Shipments</small>
            <strong>{{ region.lateShipments }}</strong>
          </div>
          <div>
            <small>Avg Delay</small>
            <strong>{{ region.avgDelayHours.toFixed(1) }}h</strong>
          </div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${region.onTime}%` }"></div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.regional-shell {
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

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

h1 {
  font-size: clamp(1.3rem, 1.1rem + 1vw, 2rem);
  font-weight: 900;
  line-height: 1.2;
}

p {
  color: var(--text-muted);
  margin-top: 0.35rem;
}

button {
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

button:hover {
  transform: translateY(-2px);
  border-color: var(--btn-border-hover);
  background: var(--btn-bg-hover);
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.region-card {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.region-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-border-hover);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.title-row h2 {
  font-size: 1.05rem;
  font-weight: 800;
}

.title-row span {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.metric-row small {
  color: var(--text-muted);
  display: block;
}

.metric-row strong {
  font-size: 1.1rem;
  font-weight: 900;
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
}

@media (max-width: 860px) {
  .region-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
  }
}
</style>
