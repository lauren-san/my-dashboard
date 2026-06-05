<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { Bar, Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js'
import MetricCard from '../components/MetricCard.vue'
import ProfileCard from '../components/ProfileCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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

type MetricCardItem = {
  title: string
  value: string | number
  change?: string | number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon?: string
  description?: string
}

const updatedAt = ref(new Date())

const shipmentVolumeBaseline = 1248
const onTimeRateBaseline = 96.4
const openExceptionsBaseline = 37
const avgTransitDaysBaseline = 3.2

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

const router = useRouter()
const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')
const themeLabel = computed(() => (isDark.value ? 'Light mode' : 'Dark mode'))

const metrics = computed<MetricCardItem[]>(() => [
  {
    title: 'Shipment Volume',
    value: shipmentVolume.value.toLocaleString(),
    change: `${shipmentVolume.value >= shipmentVolumeBaseline ? '+' : ''}${shipmentVolume.value - shipmentVolumeBaseline}`,
    changeType: shipmentVolume.value >= shipmentVolumeBaseline ? 'increase' : 'decrease',
    icon: 'mdi-truck-fast-outline',
    description: 'Loads in active planning horizon',
  },
  {
    title: 'On-Time Delivery',
    value: `${onTimeRate.value.toFixed(1)}%`,
    change: `${onTimeRate.value >= onTimeRateBaseline ? '+' : ''}${(onTimeRate.value - onTimeRateBaseline).toFixed(1)} pts`,
    changeType: onTimeRate.value >= onTimeRateBaseline ? 'increase' : 'decrease',
    icon: 'mdi-timer-check-outline',
    description: 'Rolling 24-hour performance',
  },
  {
    title: 'Open Exceptions',
    value: openExceptions.value,
    change: `${openExceptions.value - openExceptionsBaseline > 0 ? '+' : ''}${openExceptions.value - openExceptionsBaseline}`,
    changeType:
      openExceptions.value === openExceptionsBaseline
        ? 'neutral'
        : openExceptions.value < openExceptionsBaseline
          ? 'increase'
          : 'decrease',
    icon: 'mdi-alert-circle-outline',
    description: 'Loads requiring intervention',
  },
  {
    title: 'Average Transit Time',
    value: `${avgTransitDays.value.toFixed(2)} days`,
    change: `${avgTransitDays.value <= avgTransitDaysBaseline ? '' : '+'}${(avgTransitDays.value - avgTransitDaysBaseline).toFixed(2)} days`,
    changeType:
      avgTransitDays.value === avgTransitDaysBaseline
        ? 'neutral'
        : avgTransitDays.value < avgTransitDaysBaseline
          ? 'increase'
          : 'decrease',
    icon: 'mdi-clock-fast',
    description: 'Door-to-door network average',
  },
])

const operationsLead = {
  name: 'Morgan Tate',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  role: 'VP of Operations',
  clients: 84,
  projects: 12,
  tasks: 27,
}

const chartLabels = computed(() => volumeSeries.value.map((_, index) => `T${index + 1}`))

const volumeChartData = computed(() => {
  const barColor = isDark.value ? 'rgba(111, 134, 255, 0.85)' : 'rgba(14, 168, 126, 0.85)'
  const borderColor = isDark.value ? 'rgba(140, 91, 255, 1)' : 'rgba(14, 140, 122, 1)'

  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'Loads',
        data: volumeSeries.value,
        backgroundColor: barColor,
        borderColor,
        borderWidth: 1.2,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  }
})

const volumeChartOptions = computed(() => {
  const tickColor = isDark.value ? '#c8d0f6' : '#2d5650'
  const gridColor = isDark.value ? 'rgba(200, 208, 246, 0.16)' : 'rgba(45, 86, 80, 0.12)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor, drawBorder: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: tickColor },
        grid: { color: gridColor, drawBorder: false },
      },
    },
  }
})

const onTimeChartData = computed(() => {
  const lineColor = isDark.value ? 'rgba(140, 91, 255, 1)' : 'rgba(14, 140, 122, 1)'
  const pointColor = isDark.value ? 'rgba(111, 134, 255, 1)' : 'rgba(14, 168, 126, 1)'
  const fillColor = isDark.value ? 'rgba(140, 91, 255, 0.22)' : 'rgba(14, 168, 126, 0.2)'

  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'On-Time %',
        data: onTimeSeries.value,
        borderColor: lineColor,
        pointBackgroundColor: pointColor,
        pointBorderColor: pointColor,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
        backgroundColor: fillColor,
      },
    ],
  }
})

const onTimeChartOptions = computed(() => {
  const tickColor = isDark.value ? '#c8d0f6' : '#2d5650'
  const gridColor = isDark.value ? 'rgba(200, 208, 246, 0.16)' : 'rgba(45, 86, 80, 0.12)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor, drawBorder: false },
      },
      y: {
        min: 93,
        max: 99,
        ticks: {
          color: tickColor,
          callback: (value: string | number) => `${value}%`,
        },
        grid: { color: gridColor, drawBorder: false },
      },
    },
  }
})

let timer: number | undefined

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

function openRegionalPerformance() {
  router.push({ name: 'regional-performance' })
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
  timer = window.setInterval(tick, 2500)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <v-container fluid class="py-6 px-4 px-md-8">
    <v-app-bar rounded="lg" class="mb-5 px-4 px-md-6 py-3" elevation="2">
      <template #prepend>
        <v-avatar color="primary" rounded="lg">FF</v-avatar>
      </template>
      <v-app-bar-title>
        FastForward Logistics Dashboard
        <div class="text-caption text-medium-emphasis">
          Leadership snapshot of shipment volume, on-time delivery, regional execution, and open
          operational exceptions.
        </div>
      </v-app-bar-title>
      <v-chip size="small" color="secondary" class="mr-3" prepend-icon="mdi-update">
        {{ updatedAt.toLocaleTimeString() }}
      </v-chip>
      <v-btn variant="tonal" color="primary" @click="toggleTheme">
        <v-icon start>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
        {{ themeLabel }}
      </v-btn>
    </v-app-bar>

    <v-row class="mt-3 mb-1">
      <v-col cols="12" lg="6">
        <ProfileCard
          :name="operationsLead.name"
          :avatar="operationsLead.avatar"
          :role="operationsLead.role"
          :clients="operationsLead.clients"
          :projects="operationsLead.projects"
          :tasks="operationsLead.tasks"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="metric in metrics" :key="metric.title" cols="12" sm="6" md="3">
        <MetricCard
          :title="metric.title"
          :value="metric.value"
          :change="metric.change"
          :change-type="metric.changeType"
          :icon="metric.icon"
          :description="metric.description"
        />
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            Shipment Volume Trend
            <v-chip size="small" color="primary" variant="outlined">Last 12 intervals</v-chip>
          </v-card-title>
          <v-card-text>
            <div style="height: 260px">
              <Bar :data="volumeChartData" :options="volumeChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            On-Time Delivery Curve
            <v-chip size="small" color="secondary" variant="outlined">Target 96%+</v-chip>
          </v-card-title>
          <v-card-text>
            <div style="height: 260px">
              <Line :data="onTimeChartData" :options="onTimeChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            Regional Performance
            <v-btn size="small" color="primary" variant="tonal" @click="openRegionalPerformance">
              <v-icon start>mdi-map-marker-radius</v-icon>
              Open Page
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list density="comfortable">
              <v-list-item v-for="region in regions" :key="region.name">
                <v-list-item-title>{{ region.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ region.shipments }} loads</v-list-item-subtitle>
                <v-progress-linear
                  class="mt-2"
                  :model-value="region.onTime"
                  color="success"
                  rounded
                  rounded-bar
                  height="10"
                />
                <v-chip class="mt-2" size="small" color="success" variant="outlined">
                  {{ region.onTime.toFixed(1) }}% on-time
                </v-chip>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title>Open Exceptions</v-card-title>
          <v-card-subtitle>Highest impact first</v-card-subtitle>
          <v-list density="comfortable">
            <v-list-item v-for="item in exceptions" :key="item.id">
              <v-list-item-title>{{ item.id }} · {{ item.lane }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.issue }}</v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center ga-2">
                  <v-chip
                    size="small"
                    :color="item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'success'"
                    variant="tonal"
                  >
                    {{ item.priority }}
                  </v-chip>
                  <v-chip size="small" variant="outlined">{{ item.ageHours }}h</v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>
