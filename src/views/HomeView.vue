<script setup lang="ts">
import { computed } from 'vue'
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
import metricsData from '../data/metrics.json'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type MetricRow = {
  month: string
  revenue: number
  visitors: number
  conversions: number
  orders: number
}

type ChangeType = 'increase' | 'decrease' | 'neutral'

type SummaryMetric = {
  title: string
  value: string | number
  change: string
  changeType: ChangeType
  icon: string
  description: string
}

const theme = useTheme()
const selectedMonth = defineModel<string>('selectedMonth', { default: 'ALL' })
const isDark = computed(() => theme.global.name.value === 'dark')
const themeLabel = computed(() => (isDark.value ? 'Light mode' : 'Dark mode'))

const rows = metricsData as MetricRow[]

const monthOptions = computed(() => [
  { title: 'All Months', value: 'ALL' },
  ...rows.map((row) => ({
    title: monthLabel(row.month),
    value: row.month,
  })),
])

const filteredRows = computed(() => {
  if (selectedMonth.value === 'ALL') {
    return rows
  }

  return rows.filter((row) => row.month === selectedMonth.value)
})

const selectedMonthIndex = computed(() => rows.findIndex((row) => row.month === selectedMonth.value))

const currentRow = computed(() => {
  if (selectedMonth.value === 'ALL') {
    return rows[rows.length - 1]
  }

  return rows.find((row) => row.month === selectedMonth.value)
})

const previousRow = computed(() => {
  if (!currentRow.value) {
    return undefined
  }

  const currentIndex = rows.findIndex((row) => row.month === currentRow.value?.month)
  if (currentIndex <= 0) {
    return undefined
  }

  return rows[currentIndex - 1]
})

const summaryMetrics = computed<SummaryMetric[]>(() => {
  const totalRevenue = filteredRows.value.reduce((sum, row) => sum + row.revenue, 0)
  const totalVisitors = filteredRows.value.reduce((sum, row) => sum + row.visitors, 0)
  const totalOrders = filteredRows.value.reduce((sum, row) => sum + row.orders, 0)
  const avgConversions =
    filteredRows.value.reduce((sum, row) => sum + row.conversions, 0) / Math.max(filteredRows.value.length, 1)

  const current = currentRow.value
  const previous = previousRow.value

  const revenueDiff = current && previous ? current.revenue - previous.revenue : 0
  const visitorsDiff = current && previous ? current.visitors - previous.visitors : 0
  const conversionsDiff = current && previous ? current.conversions - previous.conversions : 0
  const ordersDiff = current && previous ? current.orders - previous.orders : 0

  return [
    {
      title: 'Revenue',
      value: formatCurrency(totalRevenue),
      change: signedNumber(revenueDiff),
      changeType: classifyTrend(revenueDiff),
      icon: 'mdi-cash-multiple',
      description: selectedMonth.value === 'ALL' ? 'Year total' : 'Selected month',
    },
    {
      title: 'Visitors',
      value: totalVisitors.toLocaleString(),
      change: signedNumber(visitorsDiff),
      changeType: classifyTrend(visitorsDiff),
      icon: 'mdi-account-group-outline',
      description: selectedMonth.value === 'ALL' ? 'Year total' : 'Selected month',
    },
    {
      title: 'Conversions',
      value: `${avgConversions.toFixed(2)}%`,
      change: `${signedDecimal(conversionsDiff)} pts`,
      changeType: classifyTrend(conversionsDiff),
      icon: 'mdi-chart-line',
      description: selectedMonth.value === 'ALL' ? 'Year average' : 'Selected month rate',
    },
    {
      title: 'Orders',
      value: totalOrders.toLocaleString(),
      change: signedNumber(ordersDiff),
      changeType: classifyTrend(ordersDiff),
      icon: 'mdi-package-variant-closed',
      description: selectedMonth.value === 'ALL' ? 'Year total' : 'Selected month',
    },
  ]
})

const chartLabels = computed(() => rows.map((row) => monthLabel(row.month, true)))

const revenueChartData = computed(() => {
  const defaultBarColor = isDarkTheme() ? 'rgba(111, 134, 255, 0.45)' : 'rgba(14, 168, 126, 0.45)'
  const highlightBarColor = isDarkTheme() ? 'rgba(140, 91, 255, 0.95)' : 'rgba(14, 140, 122, 0.95)'
  const borderColor = isDarkTheme() ? 'rgba(140, 91, 255, 1)' : 'rgba(14, 140, 122, 1)'

  const backgroundColors = rows.map((_, index) => {
    if (selectedMonth.value === 'ALL') {
      return highlightBarColor
    }

    return index === selectedMonthIndex.value ? highlightBarColor : defaultBarColor
  })

  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'Revenue ($)',
        data: rows.map((row) => row.revenue),
        backgroundColor: backgroundColors,
        borderColor,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 34,
      },
    ],
  }
})

const visitorsChartData = computed(() => {
  const lineColor = isDarkTheme() ? 'rgba(140, 91, 255, 1)' : 'rgba(14, 140, 122, 1)'
  const defaultPointColor = isDarkTheme() ? 'rgba(111, 134, 255, 0.9)' : 'rgba(14, 168, 126, 0.9)'
  const pointSizes = rows.map((_, index) => {
    if (selectedMonth.value === 'ALL') {
      return 3
    }

    return index === selectedMonthIndex.value ? 8 : 2
  })

  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'Visitors',
        data: rows.map((row) => row.visitors),
        borderColor: lineColor,
        pointBackgroundColor: defaultPointColor,
        pointBorderColor: defaultPointColor,
        pointRadius: pointSizes,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: false,
      },
    ],
  }
})

const conversionsChartData = computed(() => {
  const lineColor = isDarkTheme() ? 'rgba(140, 91, 255, 1)' : 'rgba(14, 140, 122, 1)'
  const fillColor = isDarkTheme() ? 'rgba(140, 91, 255, 0.22)' : 'rgba(14, 168, 126, 0.2)'
  const pointSizes = rows.map((_, index) => {
    if (selectedMonth.value === 'ALL') {
      return 3
    }

    return index === selectedMonthIndex.value ? 8 : 2
  })

  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'Conversions (%)',
        data: rows.map((row) => row.conversions),
        borderColor: lineColor,
        backgroundColor: fillColor,
        pointBackgroundColor: lineColor,
        pointRadius: pointSizes,
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const baseChartOptions = computed(() => {
  const tickColor = isDarkTheme() ? '#c8d0f6' : '#2d5650'
  const gridColor = isDarkTheme() ? 'rgba(200, 208, 246, 0.16)' : 'rgba(45, 86, 80, 0.12)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: tickColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor, drawBorder: false },
      },
      y: {
        ticks: { color: tickColor },
        grid: { color: gridColor, drawBorder: false },
      },
    },
  }
})

const revenueChartOptions = computed(() => ({
  ...baseChartOptions.value,
  plugins: {
    ...baseChartOptions.value.plugins,
    legend: { display: false },
  },
}))

const visitorsChartOptions = computed(() => ({
  ...baseChartOptions.value,
  plugins: {
    ...baseChartOptions.value.plugins,
    legend: { display: false },
  },
}))

const conversionsChartOptions = computed(() => ({
  ...baseChartOptions.value,
  plugins: {
    ...baseChartOptions.value.plugins,
    legend: { display: false },
  },
  scales: {
    ...baseChartOptions.value.scales,
    y: {
      ...baseChartOptions.value.scales.y,
      min: 2,
      max: 5,
      ticks: {
        color: isDarkTheme() ? '#c8d0f6' : '#2d5650',
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
}))

function monthLabel(month: string, short = false) {
  const date = new Date(`${month}-01T00:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    month: short ? 'short' : 'long',
    year: short ? undefined : 'numeric',
  }).format(date)
}

function classifyTrend(delta: number): ChangeType {
  if (delta > 0) {
    return 'increase'
  }

  if (delta < 0) {
    return 'decrease'
  }

  return 'neutral'
}

function signedNumber(value: number) {
  return `${value > 0 ? '+' : ''}${Math.round(value).toLocaleString()}`
}

function signedDecimal(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function isDarkTheme() {
  return theme.global.name.value === 'dark'
}

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <v-container fluid class="py-6 px-4 px-md-8">
    <v-app-bar rounded="lg" class="mb-5 px-4 px-md-6 py-3" elevation="2">
      <template #prepend>
        <v-avatar color="primary" rounded="lg">FF</v-avatar>
      </template>

      <v-app-bar-title>
        FastForward Logistics Dashboard
      </v-app-bar-title>

      <v-spacer />

      <v-select
        v-model="selectedMonth"
        :items="monthOptions"
        item-title="title"
        item-value="value"
        label="Month"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 220px"
        class="mr-3"
      />

      <v-btn variant="tonal" color="primary" @click="toggleTheme">
        <v-icon start>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
        {{ themeLabel }}
      </v-btn>
    </v-app-bar>

    <v-row class="mt-4">
      <v-col v-for="metric in summaryMetrics" :key="metric.title" cols="12" sm="6" md="3">
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
            Monthly Revenue
            <v-chip size="small" color="primary" variant="outlined">Bar</v-chip>
          </v-card-title>
          <v-card-text>
            <div style="height: 280px">
              <Bar :data="revenueChartData" :options="revenueChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            Visitors Trend
            <v-chip size="small" color="secondary" variant="outlined">Line</v-chip>
          </v-card-title>
          <v-card-text>
            <div style="height: 280px">
              <Line :data="visitorsChartData" :options="visitorsChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            Conversion Trend
            <v-chip size="small" color="success" variant="outlined">Area</v-chip>
          </v-card-title>
          <v-card-text>
            <div style="height: 300px">
              <Line :data="conversionsChartData" :options="conversionsChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
